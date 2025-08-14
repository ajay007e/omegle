import { closePeerConnection } from "./video.js";
import { 
  outputMessage,
  outputRoomName,
  outputUsers,
  handleUserLeaveSafely,
  updateUserStream
} from "./dom.js";

let user_socket;
export const setupSocket = (socket) => {
  user_socket = socket;
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

  socket.on("kick-out", ({user, message}) => {
    user.id === socket.id && forceLeave(message);
  });

  socket.on("stream-updated", ({user, data}) => {
    updateUserStream(user, data);
  });

}

export const sendEvent = (event, data) => {
  user_socket.emit(event, data);
}

const forceLeave = (error) => window.location = `../?error=${error}`;
