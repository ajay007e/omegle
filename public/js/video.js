import { generateVideoPlayer, toggleControlBtn } from "./dom.js";

const userStremDatabase = {};

let localStream = null;

export const startPeerConnection = (socket, username) => {
  const peer = new Peer(undefined, {
    host: "/",
    port: "5001"
  })
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
    call.on('stream', userStream => {
        addVideoStream(userVideo, userStream, false)
    })
    call.on('close', () => {
        const stream = userVideo.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        userVideo.remove();
    })
    userStremDatabase[userId] = call;
}

const addVideoStream = (video, stream, isHostVideo) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    generateVideoPlayer(isHostVideo, video);
}

export const closePeerConnection = (userId) => {
    if (userStremDatabase[userId]) {
      userStremDatabase[userId].close();
    }
}
