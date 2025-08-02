import { toggleControl, isTrackEnabled } from "./video.js";

const chatMessageContainer = document.querySelector(".chat-messages-area");
const chatRoomSection = document.getElementById("room-name");
const chatRoomUsersSection = document.getElementById("users");
const chatMessageInputSection = document.getElementById("msg");
const videoSection = document.getElementById("video-section");
const welcomeSection = document.querySelector(".join-container");
const chatSection = document.querySelector(".chat-container");
const chatMessageInput = document.getElementById("chat-form");


export const bindActionToggleButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleChatStartToggle(action));
}

export const bindStartChatButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleStartChat(action));
}

export const bindChatMessageInputListener = (element, action) => {
  element?.addEventListener("submit", (e) => handleMessageSubmit(e, action));
}

export const bindLeaveButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleLeaveRoom(action));
}

export const outputMessage = (message) => {
  console.log(message.info)
  if (message.info.isUserActionMessage && message.info.isPrivateRoom) {
    chatMessageContainer.innerHTML = "";
  } 

  if (!message.info.isPrivateRoom && message.info.isUserWaiting) return;
  chatMessageContainer.prepend(generateMessageDiv(message))
  chatMessageInputSection.disabled = message.info.isPrivateRoom ? message.info.isUserWaiting : false;
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;

  if (message.info.isUserLeftMessage){
    document.getElementById("host-vf").classList.remove("mini");
    document.getElementById("user-vf")?.remove();
  }
}

const generateMessageDiv = (message) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const infoParagraphTag = document.createElement("p");
    infoParagraphTag.classList.add("meta");
    if (message.info.isHostGenerated) {
      messageDiv.classList.add("right");
      infoParagraphTag.innerText = "You";
    } else if (message.info.isSystemGenerated) {
      messageDiv.classList.add("center");
    } else {
      infoParagraphTag.innerText = message.username;
    }
    
    if (message.info.isUserActionMessage) {
      messageDiv.classList.add("disappearing"); 
      messageDiv.addEventListener("animationend", () => messageDiv.remove());
    }


    if (!message.info.isSystemGenerated) {
      infoParagraphTag.innerHTML += `<span>  ${message.time}</span>`;
      messageDiv.appendChild(infoParagraphTag);
    }

    const messageParagraphTag = document.createElement("p");
    messageParagraphTag.classList.add("message-text");
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
  videoPlayer.classList.add("video-frame");

  if (isControlRequired) {
    const control = document.createElement("div");
    control.classList.add("control");

    const camaraControl = document.createElement("i");
    camaraControl.id = "camara-cntl"
    camaraControl.classList.add("control-btn", "fas", "fa-video");
    isTrackEnabled("video", true) && camaraControl.classList.add("enabled");
    camaraControl.addEventListener("click", () => toggleControl('video'));

    const audioControl = document.createElement("i");
    audioControl.id = "audio-cntl"
    audioControl.classList.add("control-btn", "fas", "fa-microphone");
    isTrackEnabled("audio", true) && camaraControl.classList.add("enabled");
    audioControl.addEventListener("click", () => toggleControl('audio'));

    control.appendChild(camaraControl);
    control.appendChild(audioControl);
    videoPlayer.appendChild(control);

    videoPlayer.id = "host-vf";
  } else {
    videoPlayer.id = "user-vf";
  }
  videoPlayer.appendChild(video);
  return videoPlayer;
}


export const cleanUpEmptyVideoFrames = () => {
  // since peer.js will trigger stream event from call twice, video-frame divs
  // will be created without children; to remove the empty video-frames this utility
  // method will help.
  document.querySelectorAll('.video-frame').forEach(div => {
    if (div.children.length === 0) {
      div.remove();
    }
  });
}

export const appendVideoPlayer = (videoPlayer) => {
  videoSection.appendChild(videoPlayer);
  if (videoPlayer.id === 'user-vf') {
    document.getElementById("host-vf").classList.add("mini");
  }
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

const handleStartChat = (e, action) => {
  action('');
}

const handleChatStartToggle = (action) => {
  document.getElementById("start-chat-btn").classList.toggle("hidden");
  document.getElementById("join-room-container").classList.toggle("hidden");
  action();
};

export const toggleControlBtn = (kind) => {

  const audioControlBtn = document.getElementById("audio-cntl");
  const camaraControlBtn = document.getElementById("camara-cntl");

  if (kind === 'video') {
    camaraControlBtn.classList.toggle("enabled");
  } else {
    audioControlBtn.classList.toggle("enabled");
  }
}







export const sideBarToggle = () => {
  const chatBtn = document.getElementById('btn-chat');
  const participantsBtn = document.getElementById('btn-participants');
  const chatSidebar = document.getElementById('chat-sidebar');
  const participantsSidebar = document.getElementById('participants-sidebar');
  const container = document.querySelector('.room-container');

  const showSidebar = (type) => {
    // Hide all sidebars
    chatSidebar.classList.remove('visible');
    participantsSidebar.classList.remove('visible');
    container.classList.remove('sidebar-visible');

    if (type === 'chat') {
      chatSidebar.classList.add('visible');
      container.classList.add('sidebar-visible');
    } else if (type === 'participants') {
      participantsSidebar.classList.add('visible');
      container.classList.add('sidebar-visible');
    }
  }

  const toggleSidebar = (type) => {
    const isChatVisible = chatSidebar.classList.contains('visible');
    const isParticipantsVisible = participantsSidebar.classList.contains('visible');

    if (type === 'chat') {
      if (isChatVisible) {
        chatSidebar.classList.remove('visible');
        container.classList.remove('sidebar-visible');
      } else {
        showSidebar('chat');
      }
    } else if (type === 'participants') {
      if (isParticipantsVisible) {
        participantsSidebar.classList.remove('visible');
        container.classList.remove('sidebar-visible');
      } else {
        showSidebar('participants');
      }
    }
  }

  chatBtn.addEventListener('click', () => toggleSidebar('chat'));
  participantsBtn.addEventListener('click', () => toggleSidebar('participants'));
}
