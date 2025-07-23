const chatMessageInput = document.getElementById("chat-form");
const chatMessageContainer = document.querySelector(".chat-messages");
const chatRoomSection = document.getElementById("room-name");
const chatRoomUsersSection = document.getElementById("users");
const chatMessageInputSection = document.getElementById("msg");
const userDataInput = document.getElementById("form");
const chatSection = document.querySelector(".chat-container");
const welcomeSection = document.querySelector(".join-container");
const chatLeaveButton = document.getElementById("leave-btn");

const socket = io();

userDataInput.addEventListener("submit", (e) => {
  chatSection.classList.toggle("hidden");
  welcomeSection.classList.toggle("hidden");
  e.preventDefault();

  // TODO: username is empty here since user is annonymous
  const username = e.target.username.value;
  startPeerConnection(username); 
  chatMessageInput.msg.focus();

});

chatMessageInput.addEventListener("submit", (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value.trim();
  if (msg) {
    socket.emit("chatMessage", msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  }
});

chatLeaveButton.addEventListener("click", () => {
  leaveRoom();
});

socket.on("roomUsers", ({ room, users }) => {
  // outputRoomName(room);
  // outputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
});

socket.on("info-message", (message) => {
  outputMessage(message);
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
});

const outputMessage = (message) => {
  if (message.isSystemGenerated) {
    chatMessageContainer.innerHTML 
      = `<div class="message center"><p class="text">${message.text}</p></div>`;
  } else {
    const div = generateMessageDiv(message) 
    chatMessageContainer.prepend(div)
  }

  if (message.isUserWaiting) {
    chatMessageInputSection.disabled = true;
  } else {
    chatMessageInputSection.disabled = false;
  }
}

const generateMessageDiv = (message) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const infoParagraphTag = document.createElement("p");
    infoParagraphTag.classList.add("meta");
    if (socket.id === message.id) {
      messageDiv.classList.add("right");
      infoParagraphTag.innerText = "You";
    } else{
      infoParagraphTag.innerText = "Stranger";
    }
    infoParagraphTag.innerHTML += `<span>  ${message.time}</span>`;
    messageDiv.appendChild(infoParagraphTag);

    const messageParagraphTag = document.createElement("p");
    messageParagraphTag.classList.add("text");
    messageParagraphTag.innerText = message.text;
    messageDiv.appendChild(messageParagraphTag);
    return messageDiv;
}

const outputRoomName = (room) => {
   chatRoomSection.innerText = room;
}

const outputUsers = (users) => {
   chatRoomUsersSection.innerHTML = "";
   users.forEach((user) => {
     const li = document.createElement("li");
     li.innerText = user.username;
     chatRoomUsersSection.appendChild(li);
   });
}

const leaveRoom = () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../";
  }
}



const videoSection = document.querySelector(".video-section");

const userDb = {};

socket.on("user-left", (userId) => {
  if (userDb[userId]) {
    userDb[userId].close();
  }
})




const startPeerConnection = (username) => {
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
        userVideo.remove()
    })
    userDb[userId] = call;
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoSection.append(video)
}
