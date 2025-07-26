import { generateVideoPlayer, toggleControlBtn, appendVideoPlayer, cleanUpEmptyVideoFrames } from "./dom.js";

const userStremDatabase = {};

let localStream = null;

export const startPeerConnection = (socket, username) => {
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
      audio: true
    }).then(hostStream => {
        localStream = hostStream;
        addVideoStream(hostVideoElement, hostStream, true);
        socket.emit("joinRoom", { username, userId: id });
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

export const toggleControl = (kind) => {
  if(!localStream) return;

  let track = localStream.getTracks().find(track => track.kind === kind);
  if(track.enabled) {
    track.enabled = false;
  } else {
    track.enabled = true;
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
