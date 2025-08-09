import { setupSocket, sendMessage } from "./chat.js"
import { startPeerConnection } from "./video.js";
import { 
  setupRoomPage,
  bindLeaveButtonListener, 
  bindChatMessageInputListener,
  bindActionToggleButtonListener 
} from "./dom.js";

const socket = io();

const joinActionToggleButton = document.getElementById("action-toggle-btn");
const chatLeaveButton = document.getElementById("room-leave-btn");
const chatMessageInput = document.getElementById("chat-form");

bindLeaveButtonListener(chatLeaveButton, () => { window.location = "../"});
bindActionToggleButtonListener(joinActionToggleButton, () => {});


window.addEventListener("DOMContentLoaded", () => {
  if (window.APP_CONTEXT?.page === "chat") {
    setupSocket(socket);
    startPeerConnection(
      socket,
      window.APP_CONTEXT.username
    );
    bindChatMessageInputListener(
      chatMessageInput,
      (message) => {sendMessage(socket, message)}
    );
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.APP_CONTEXT?.page === "room") {
    setupSocket(socket);
    startPeerConnection(
      socket,
      window.APP_CONTEXT.username,
      window.APP_CONTEXT.roomId
    );
    bindChatMessageInputListener(
      chatMessageInput,
      (message) => {sendMessage(socket, message)}
    );
    setupRoomPage();
  }
});

