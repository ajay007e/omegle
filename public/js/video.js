import { 
  generateVideoPlayer,
  toggleControlBtn,
  appendVideoPlayer,
  cleanUpEmptyVideoFrames, 
  adjustRoomVideoLayout,
  setupControlPanel,
  reorderVideoFrames
} from "./dom.js";

const userStremDatabase = {};

let localStream = null;

export const startPeerConnection = (socket, username, roomId = '') => {
  const peer = new Peer(undefined, {
    host: "/",
    port: "5001"
  });
  peer.on("open", id => {
    const hostVideoElement = document.createElement('video');
    hostVideoElement.muted = true;
    navigator.mediaDevices.getUserMedia({
      video: {
        width: {min: 640, ideal: 1920, max: 1920},
        height: {min: 480, ideal: 1080, max: 1080},
      },
      audio: true,
    }).then(hostStream => {
        localStream = hostStream;
        const isPrivateRoom = roomId === '';
        socket.emit(
          "join-room",
          { username, roomId, userId: id, info: getLocalStreamData()},
          (user) => {
            addVideoStream({
              video: hostVideoElement,
              stream: hostStream,
              isHost: true,
              user,
              isControlRequired: isPrivateRoom,
              isPrivateRoom
            });
          }
        );
        peer.on("call", call => {
          call.answer(hostStream);
          const userVideoElement = document.createElement('video');
          call.on("stream", userStream => {
            socket.emit(
              "user-who",
              call.peer,
              (user) => {
                addVideoStream({
                  video: userVideoElement,
                  stream: userStream,
                  isControlRequired: false,
                  user,
                  isPrivateRoom
                });
              }
            );
            
          });
        });
        socket.on('user-joined', user => {
          connectToNewUser({peer, user, stream: hostStream, isPrivateRoom})
        });
      });
  });
}

export const isTrackEnabled = (kind, isAlertSuppressed = false) => {
  if(isTrackNotAvailable(kind, isAlertSuppressed)) return false;
  return getTrack(kind).enabled;
}

const isTrackNotAvailable = (kind, isAlertSuppressed = false) => {
  if(!localStream) {
    return isAlertSuppressed ? true : getMediaPermission(kind);
  }
  let track = getTrack(kind);
  if (!track) {
    return isAlertSuppressed ? true : getMediaPermission(kind);
  }
  return false;
}

const getTrack = (kind) => localStream.getTracks().find(track => track.kind === kind);

const getMediaPermission = (kind) => {
  window.alert(`We don't got Media Permission for ${kind}. Please give the permission and retry.`)
  return true; 
}

export const toggleControl = (kind) => {
  if(isTrackNotAvailable(kind)) return;
  if(isTrackEnabled(kind, true)) {
    getTrack(kind).enabled = false;
  } else {
    getTrack(kind).enabled = true;
  }
  toggleControlBtn(kind);
}

const connectToNewUser = ({peer, user, stream, isPrivateRoom}) => {
    const call = peer.call(user.userId, stream);
    const userVideo = document.createElement('video');
    let userVideoFrame = undefined;
    call.on('stream', userStream => {
        userVideoFrame = addVideoStream({video: userVideo, stream: userStream, user, isControlRequired: false, isPrivateRoom});
    })
    call.on('close', () => {
        const stream = userVideo.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        userVideoFrame.remove();
        adjustRoomVideoLayout();
    })
    userStremDatabase[user.userId] = call;
}

const addVideoStream = ({video, stream, isControlRequired, isHost = false, user, isPrivateRoom}) => {
    if (!stream || !video)  return;
    video.srcObject = stream;
    const videoPlayer = generateVideoPlayer({isControlRequired, video, isHost, user, isPrivateRoom});
    video.addEventListener('loadedmetadata', () => {
      video.play();
      appendVideoPlayer(videoPlayer);
      cleanUpEmptyVideoFrames();
      adjustRoomVideoLayout(isPrivateRoom);
      !isPrivateRoom && isHost && setupControlPanel();
      !isPrivateRoom && initUserActivityTracking(stream, videoPlayer);
    });
    return videoPlayer;
}

const initUserActivityTracking = (stream, videoPlayer) => {
  monitorAudioActivity(stream, (isSpeaking) => {
    videoPlayer.classList.toggle("speaking", isSpeaking);
    reorderVideoFrames(); 
  });
}

export const closePeerConnection = (userId) => {
    if (userStremDatabase[userId]) {
      userStremDatabase[userId].close();
    }
}

export const isStreamActive = (stream, kind) => {
  return kind === 'video' ?
    stream.getVideoTracks().some(track => track.readyState === 'live' && track.enabled) :
    stream.getAudioTracks().some(track => track.readyState === 'live' && track.enabled);
}

export const updateStreamStatus = (stream, data) => {
  stream.getTracks().find(track => track.kind === 'video').enabled = data.isVideoEnabled;
  stream.getTracks().find(track => track.kind === 'audio').enabled = data.isAudioEnabled;
}

export const getLocalStreamData = () => {
  return {
    isAudioEnabled: getTrack('audio').enabled,
    isVideoEnabled: getTrack('video').enabled
  }
}

const monitorAudioActivity = (stream, onSpeakingChange) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 512;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let speaking = false;
    let lastSpeakingTime = 0;
    const SPEAKING_THRESHOLD = 15; // volume threshold
    const IDLE_DELAY = 2000; // ms to keep user "active" after speaking stops

    function checkAudio() {
      analyser.getByteFrequencyData(dataArray);
      const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      const now = Date.now();
      if (avgVolume > SPEAKING_THRESHOLD) {
        if (!speaking) {
          speaking = true;
          onSpeakingChange(true);
        }
        lastSpeakingTime = now;
      } else if (speaking && now - lastSpeakingTime > IDLE_DELAY) {
        speaking = false;
        onSpeakingChange(false);
      }

      requestAnimationFrame(checkAudio);
    }
    checkAudio();
}
