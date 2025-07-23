import { appendVideo } from "./dom.js";

const userStremDatabase = {};

export const startPeerConnection = (socket, username) => {
  const peer = new Peer(undefined, {
    host: "/",
    port: "5001"
  })
  peer.on("open", id => {
    const hostVideoElement = document.createElement('video');
    hostVideoElement.muted = true;
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(hostStream => {
        addVideoStream(hostVideoElement, hostStream);
        socket.emit("joinRoom", { username, userId: id });
        peer.on("call", call => {
          call.answer(hostStream);
          const userVideoElement = document.createElement('video');
          call.on("stream", userStream => {
            addVideoStream(userVideoElement, userStream);
          });
        });
        socket.on('user-joined', userId => {
          connectToNewUser(peer, userId, hostStream)
        });
      });
  });
}

const connectToNewUser = (peer, userId, stream) => {
    const call = peer.call(userId, stream);
    const userVideo = document.createElement('video');
    call.on('stream', userStream => {
        addVideoStream(userVideo, userStream)
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

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    appendVideo(video);
}

export const closePeerConnection = (userId) => {
    if (userStremDatabase[userId]) {
      userStremDatabase[userId].close();
    }
}
