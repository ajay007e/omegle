import { setupSocket, sendMessage } from "./chat.js"
import { startPeerConnection } from "./video.js";
import { 
  bindActionToggleButtonListener, 
  bindLeaveButtonListener, 
  bindChatMessageInputListener 
} from "./dom.js";


const joinActionToggleButton = document.getElementById("action-toggle-btn");
const chatLeaveButton = document.getElementById("room-leave-btn");
const chatMessageInput = document.getElementById("chat-form");

bindLeaveButtonListener(chatLeaveButton, () => { window.location = "../"});
bindActionToggleButtonListener(joinActionToggleButton, () => {});


window.addEventListener("DOMContentLoaded", () => {
  if (window.APP_CONTEXT?.page === "chat") {
    const socket = io();
    setupSocket(socket);
    startPeerConnection(socket, window.APP_CONTEXT.username);
    bindChatMessageInputListener(chatMessageInput, (message) => {sendMessage(socket, message)});
  }
});

