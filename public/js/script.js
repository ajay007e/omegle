import { setupSocket, sendMessage } from "./chat.js"
import { startPeerConnection } from "./video.js";
import { bindUserDataInutListener, bindChatMessageInputListner, bindLeaveButtonListener } from "./dom.js";


const userDataInput = document.getElementById("form");
const chatLeaveButton = document.getElementById("leave-btn");
const chatMessageInput = document.getElementById("chat-form");

const socket = io();
setupSocket(socket);


bindUserDataInutListener(userDataInput, (username) => {startPeerConnection(socket, username)});
bindChatMessageInputListner(chatMessageInput, (message) => {sendMessage(socket, message)});
bindLeaveButtonListener(chatLeaveButton, () => { window.location = "../"});

