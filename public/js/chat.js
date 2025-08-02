import { outputMessage } from "./dom.js";
import { closePeerConnection } from "./video.js";

export const setupSocket = (socket) => {
  socket.on("roomUsers", ({ room, users }) => {
    // outputRoomName(room);
    // outputUsers(users);
  });

  socket.on("message", (message) => {
    message.info["isHostGenerated"] = socket.id === message.id;
    outputMessage(message);
  });

  socket.on("info-message", (message) => {
    message.info["isHostGenerated"] = socket.id === message.id;
    outputMessage(message);
  });

  socket.on("user-left", (userId) => {
    closePeerConnection(userId);
  });
}

export const sendMessage = (socket, message) => {
  socket.emit("chatMessage", message);
}
