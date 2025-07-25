import { toggleControl } from "./video.js";

const chatMessageContainer = document.querySelector(".chat-messages");
const chatRoomSection = document.getElementById("room-name");
const chatRoomUsersSection = document.getElementById("users");
const chatMessageInputSection = document.getElementById("msg");
const videoSection = document.querySelector(".video-section");
const welcomeSection = document.querySelector(".join-container");
const chatSection = document.querySelector(".chat-container");
const chatMessageInput = document.getElementById("chat-form");


export const bindUserDataInutListener = (element, action) => {
  element.addEventListener("submit", (e) => handleUserDataSubmit(e, action));
}

export const bindChatMessageInputListner = (element, action) => {
  element.addEventListener("submit", (e) => handleMessageSubmit(e, action));
}

export const bindLeaveButtonListener = (element, action) => {
  element.addEventListener("click", () => handleLeaveRoom(action));
}

export const outputMessage = (message) => {
  if (message.isSystemGenerated) {
    chatMessageContainer.innerHTML 
      = `<div class="message center"><p class="text">${message.text}</p></div>`;
  } else {
    const div = generateMessageDiv(message) 
    chatMessageContainer.prepend(div)
  }

  chatMessageInputSection.disabled = message.isUserWaiting;
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
}

const generateMessageDiv = (message) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const infoParagraphTag = document.createElement("p");
    infoParagraphTag.classList.add("meta");
    if (message.isHostGenerated) {
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

export const outputRoomName = (room) => {
   chatRoomSection.innerText = room;
}

export const outputUsers = (users) => {
   chatRoomUsersSection.innerHTML = "";
   users.forEach((user) => {
     const li = document.createElement("li");
     li.innerText = user.username;
     chatRoomUsersSection.appendChild(li);
   });
}

export const generateVideoPlayer = (isControlRequired, video) => {
  const videoPlayer = document.createElement("div");
  videoPlayer.classList.add("video-player");

  if (isControlRequired) {
    const control = document.createElement("div");
    control.classList.add("control");

    const camaraControl = document.createElement("i");
    camaraControl.id = "camara-cntl"
    camaraControl.classList.add("control-btn", "fas", "fa-video", "enabled");
    camaraControl.addEventListener("click", () => toggleControl('video'));

    const audioControl = document.createElement("i");
    audioControl.id = "audio-cntl"
    audioControl.classList.add("control-btn", "fas", "fa-microphone", "enabled");
    audioControl.addEventListener("click", () => toggleControl('audio'));

    control.appendChild(camaraControl);
    control.appendChild(audioControl);
    videoPlayer.appendChild(control);
  }
  videoPlayer.appendChild(video);
  videoSection.append(videoPlayer);
}

const handleLeaveRoom = (leave) => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    leave()
  }
}

const handleMessageSubmit = (e, action) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value.trim();
  if (msg) {
    action(msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  }  
}

const handleUserDataSubmit = (e, action) => {
  chatSection.classList.toggle("hidden");
  welcomeSection.classList.toggle("hidden");
  e.preventDefault();

  // TODO: username is empty here since user is annonymous
  const username = e.target.username.value;
  action(username);
  chatMessageInput.msg.focus();
}

export const toggleControlBtn = (kind) => {

  const audioControlBtn = document.getElementById("audio-cntl");
  const camaraControlBtn = document.getElementById("camara-cntl");

  if (kind === 'video') {
    camaraControlBtn.classList.toggle("enabled");
    camaraControlBtn.classList.toggle("disabled")
  } else {
    audioControlBtn.classList.toggle("enabled");
    audioControlBtn.classList.toggle("disabled")
  }
}
