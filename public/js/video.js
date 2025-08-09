import { 
  generateVideoPlayer,
  toggleControlBtn,
  appendVideoPlayer,
  cleanUpEmptyVideoFrames, 
  adjustRoomVideoLayout,
  setupControlPanel
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
      audio: false,
    }).then(hostStream => {
        localStream = hostStream;
        const isPrivateRoom = roomId === '';
        addVideoStream({
          video: hostVideoElement,
          stream: hostStream,
          isHost: true,
          userId: id,
          isControlRequired: isPrivateRoom,
          isPrivateRoom
        });
        socket.emit("join-room", { username, roomId, userId: id });
        peer.on("call", call => {
          call.answer(hostStream);
          const userVideoElement = document.createElement('video');
          call.on("stream", userStream => {
            addVideoStream({
              video: userVideoElement,
              stream: userStream,
              isControlRequired: false,
              userId: call.peer,
              isPrivateRoom
            });
          });
        });
        socket.on('user-joined', userId => {
          connectToNewUser({peer, userId, stream: hostStream, isPrivateRoom})
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

const connectToNewUser = ({peer, userId, stream, isPrivateRoom}) => {
    const call = peer.call(userId, stream);
    const userVideo = document.createElement('video');
    let userVideoFrame = undefined;
    call.on('stream', userStream => {
        userVideoFrame = addVideoStream({video: userVideo, stream: userStream, userId, isControlRequired: false, isPrivateRoom});
    })
    call.on('close', () => {
        const stream = userVideo.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        userVideoFrame.remove();
        adjustRoomVideoLayout();
    })
    userStremDatabase[userId] = call;
}

const addVideoStream = ({video, stream, isControlRequired, isHost = false, userId, isPrivateRoom}) => {
    if (!stream || !video)  return;
    video.srcObject = stream;
    const videoPlayer = generateVideoPlayer({isControlRequired, video, isHost, userId, isPrivateRoom});
    video.addEventListener('loadedmetadata', () => {
      video.play();
      appendVideoPlayer(videoPlayer);
      cleanUpEmptyVideoFrames();
      adjustRoomVideoLayout(isPrivateRoom);
      !isPrivateRoom && isHost && setupControlPanel();
    });
    return videoPlayer;
}

export const closePeerConnection = (userId) => {
    if (userStremDatabase[userId]) {
      userStremDatabase[userId].close();
    }
}
