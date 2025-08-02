import { generateVideoPlayer, toggleControlBtn, appendVideoPlayer, cleanUpEmptyVideoFrames } from "./dom.js";

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
      audio: false,
    }).then(hostStream => {
        localStream = hostStream;
        addVideoStream(hostVideoElement, hostStream, true);
        socket.emit("join-room", { username, roomId, userId: id });
        peer.on("call", call => {
          call.answer(hostStream);
          const userVideoElement = document.createElement('video');
          call.on("stream", userStream => {
            addVideoStream(userVideoElement, userStream, false);
          });
        });
        socket.on('user-joined', userId => {
          connectToNewUser(peer, userId, hostStream)
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

const connectToNewUser = (peer, userId, stream) => {
    const call = peer.call(userId, stream);
    const userVideo = document.createElement('video');
    let userVideoFrame = undefined;
    call.on('stream', userStream => {
        userVideoFrame = addVideoStream(userVideo, userStream, false);
    })
    call.on('close', () => {
        const stream = userVideo.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        userVideoFrame.remove();
    })
    userStremDatabase[userId] = call;
}

const addVideoStream = (video, stream, isHostVideo) => {
    if (!stream || !video)  return;
    video.srcObject = stream;
    const videoPlayer = generateVideoPlayer(isHostVideo, video);
    video.addEventListener('loadedmetadata', () => {
        video.play();
        appendVideoPlayer(videoPlayer);
        cleanUpEmptyVideoFrames();
    });
    return videoPlayer;
}

export const closePeerConnection = (userId) => {
    if (userStremDatabase[userId]) {
      userStremDatabase[userId].close();
    }
}
