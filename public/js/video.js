import { 
  generateVideoPlayer,
  toggleControlBtn,
  appendVideoPlayer,
  cleanUpEmptyVideoFrames, 
  adjustRoomVideoLayout,
  setupControlPanel,
  reorderVideoFrames,
  disableScreenCast,
  enableScreenCast,
  addSpotlight,
  removeSpotlight
} from "./dom.js";

const userStremDatabase = {};

let localStream = null;
const peersCollection = {};

const getNewPeer = (id = undefined) => {
  return new Peer(id, {
    host: "/",
    port: "5001"
  });
}

export const beginScreenCast = (socket) => {
  initiateScreenCast(socket);
}

const initiateScreenCast = (socket) => {
  const peer =  getNewPeer();
  peersCollection['screen-peer'] = peer;
  peer.on("open", id => {
    navigator.mediaDevices.getDisplayMedia({
      video: {cursor: 'always'},
      audio: true
    }).then(screenStream => {
      socket.emit("screen-cast-started", {userId:id, info: {
        isVideoEnabled: true,
        isAudioEnabled: true
      }}, (user) => {
        const screenVideoElement = document.createElement('video');
        screenVideoElement.muted = true;
        const videoFrame = addVideoStream({
          video: screenVideoElement,
          stream: screenStream,
          isControlRequired: false,
          isHost: false,
          isPrivateRoom: false,
          user,
          isScreenCast: true
        });
        const call = peersCollection['user-peer'].call(id, localStream);
        call.on("close", ()=> {
            handleCastPeerClose(screenVideoElement, videoFrame);
        });
        userStremDatabase[id] = call;
      });

      peer.on("call", call => {
        call.answer(screenStream);
      });

      socket.on('user-joined', user => {
        peer.call(user.userId, screenStream);
      });

      screenStream.getVideoTracks()[0].onended = () => {
        socket.emit("screen-cast-stopped", { userId: id });
      };
      
     
    });
  });
};

export const handleCastStart = (user) => {
  const call = peersCollection['user-peer']?.call(user.userId, localStream);
  const castVideo = document.createElement('video');
  let castVideoFrame = undefined;
  call.on('stream', castStream => {
    castVideoFrame = addVideoStream({video: castVideo, stream: castStream, user, isControlRequired: false, isPrivateRoom: false, isScreenCast: true}) 
  });
  call.on('close', () => {
    handleCastPeerClose(castVideo, castVideoFrame);
  })
  userStremDatabase[user.userId] = call;
}

const handleCastPeerClose = (castVideo, castVideoFrame) => {
  const stream = castVideo.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  castVideoFrame.remove();
  removeSpotlight("cast-vf");
  adjustRoomVideoLayout();
}

export const handleCastStop = (userId) => {
  enableScreenCast();
  userStremDatabase[userId].close();
}

export const startPeerConnection = (socket, username, roomId = '') => {
  initiateUserConnection(socket, username, roomId);
}

const initiateUserConnection = (socket, username, roomId) => {
  const peer = getNewPeer(); 
  peersCollection['user-peer'] = peer;
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
              isPrivateRoom,
              socket
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
                const videoFrame = addVideoStream({
                  video: userVideoElement,
                  stream: userStream,
                  isControlRequired: false,
                  user,
                  isPrivateRoom,
                  isScreenCast: user.isScreenCast
                });
                if(user.isScreenCast) {
                  userStremDatabase[user.userId] = call;
                  call.on("close", () => {
                    handleCastPeerClose(userVideoElement, videoFrame);
                  })
                }
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

const addVideoStream = ({
  video,
  stream,
  isControlRequired,
  isHost = false,
  user,
  isPrivateRoom,
  socket = undefined,
  isScreenCast = false
}) => {
    if (!stream || !video)  return;
    video.srcObject = stream;
    const videoPlayer = generateVideoPlayer({isControlRequired, video, isHost, user, isPrivateRoom, isScreenCast});
    video.addEventListener('loadedmetadata', () => {
      video.play();
      appendVideoPlayer(videoPlayer);
      cleanUpEmptyVideoFrames();
      adjustRoomVideoLayout(isPrivateRoom);
      !isPrivateRoom && isHost && setupControlPanel(socket);
      !isPrivateRoom && initUserActivityTracking(stream, videoPlayer);
      isScreenCast && addSpotlight('cast-vf') && disableScreenCast();
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
    isAudioEnabled: getTrack('audio')?.enabled,
    isVideoEnabled: getTrack('video')?.enabled
  }
}

const monitorAudioActivity = (stream, onSpeakingChange) => {
    if (!stream.getAudioTracks().enabled) return;
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
