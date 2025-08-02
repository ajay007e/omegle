const formatMessage = require("./messages");
const {
  whenUserJoins,
  whenUserLeaves,
} = require("./users");
const { getUsersByRoom, getRoomById, getUserById } = require("./database")
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
    socket.on("joinRoom", ({ username, roomId, userId }) => {
      const user = whenUserJoins(socket.id, roomId, username, userId);
      socket.join(user.room);
      const room = getRoomById(user.room);
      if (user.isAlone) {
        socket.emit(infoMessage, formatMessage(botName, waitingMessage, {room, user}));
      } else {
        socket.emit(infoMessage, formatMessage(botName, strangerJoinMessage(user.username), {room, user}));
      }
      socketBroadcast(socket, user.room, infoMessage, formatMessage(botName, strangerJoinMessage(user.username), {room, user}));
      socketBroadcast(socket, user.room, 'user-joined', userId);

      io.to(user.room).emit(roomUsers, {
        room: user.room,
        users: getUsersByRoom(user.room),
      });
    });

    socket.on("chatMessage", (msg) => {
      const user = getUserById(socket.id);
      io.to(user.room).emit("message", 
        formatMessage(
          user.username,
          msg, {
            room: getRoomById(user.room), 
            user, 
            isSystemGenerated: false,
            id: socket.id
          })
      );
    });

    socket.on("disconnect", () => {
      const user = whenUserLeaves(socket.id);
      const room = getRoomById(user.room);
      if (user) {
        io.to(user.room).emit(
          infoMessage,
          formatMessage(botName, strangerLeftMessage(user.username), {user, room})
        );

        io.to(user.room).emit(roomUsers, {
          room: user.room,
          users: getUsersByRoom(user.room),
        });

        io.to(user.room).emit("user-left", user.userId)

        io.to(user.room).emit(
          infoMessage,
          formatMessage(botName, waitingMessage, {user, room})
        );
      }
    });
  });
}

const socketBroadcast = (socket, room, event, message) => {
   socket.broadcast.to(room).emit(event, message);
}

module.exports = socket;

