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
    socket.on("joinRoom", ({ username }) => {
      const user = whenUserJoins(socket.id, username);
      socket.join(user.room);

      if (user.isAlone) {
        socket.emit(infoMessage, formatMessage(botName, waitingMessage));
      } else {
        socket.emit(infoMessage, formatMessage(botName, strangerJoinMessage));
      }

      socket.broadcast
        .to(user.room)
        .emit(infoMessage, formatMessage(botName, strangerJoinMessage));

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

        setTimeout(() => {
          io.to(user.room).emit(
            infoMessage,
            formatMessage(botName, waitingMessage)
          );
        }, 1000);
      }
    });
  });
}

module.exports = socket;

