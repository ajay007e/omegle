const formatMessage = require("./messages");
const {
  whenUserJoins,
  getCurrentUser,
  whenUserLeaves,
  getUsersByRoom,
} = require("./users");
const {
  botName,
  waitingMessage,
  strangerLeftMessage,
  strangerJoinMessage,
  infoMessage,
  roomUsers
} = require("./constants")

const socket = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, userId }) => {
      const user = whenUserJoins(socket.id, username, userId);
      socket.join(user.room);

      if (user.isAlone) {
        socket.emit(infoMessage, formatMessage(botName, waitingMessage));
      } else {
        socket.emit(infoMessage, formatMessage(botName, strangerJoinMessage));
      }

      socketBroadcast(socket, user.room, infoMessage, formatMessage(botName, strangerJoinMessage));
      socketBroadcast(socket, user.room, 'user-joined', userId);

      io.to(user.room).emit(roomUsers, {
        room: user.room,
        users: getUsersByRoom(user.room),
      });
    });

    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit("message", formatMessage(user.username, msg, false, socket.id));
    });

    socket.on("disconnect", () => {
      const user = whenUserLeaves(socket.id);
      if (user) {
        io.to(user.room).emit(
          infoMessage,
          formatMessage(botName, strangerLeftMessage)
        );

        io.to(user.room).emit(roomUsers, {
          room: user.room,
          users: getUsersByRoom(user.room),
        });

        io.to(user.room).emit("user-left", user.userId)

        io.to(user.room).emit(
          infoMessage,
          formatMessage(botName, waitingMessage)
        );
      }
    });
  });
}

const socketBroadcast = (socket, room, event, message) => {
   socket.broadcast.to(room).emit(event, message);
}

module.exports = socket;

