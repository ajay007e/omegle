import { closePeerConnection } from "./video.js";
import { outputMessage, outputRoomName, outputUsers, handleUserLeaveSafely } from "./dom.js";

export const setupSocket = (socket) => {
  socket.on("room-and-users", ({ room, users }) => {
    if(room.type === 'meeting') {
      outputRoomName(room);
      const isUserHost = users.find(user => user.id === socket.id).isHost;
      outputUsers(
        users.map(user => ({...user, isUser: user.id === socket.id})), 
        isUserHost
      );
    }
  });

  socket.on("message", (message) => {
    message.info["isHostGenerated"] = socket.id === message.id;
    outputMessage(message);
  });

  socket.on("info-message", (message) => {
    message.info["isHostGenerated"] = socket.id === message.id;
    outputMessage(message);

    if (message.info.isUserLeftMessage){
      handleUserLeaveSafely(message.info.userId);
    }
  });

  socket.on("user-left", (userId) => {
    closePeerConnection(userId);
  });
}

export const sendMessage = (socket, message) => {
  socket.emit("chat-message", message);
}
