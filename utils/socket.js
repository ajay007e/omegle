const formatMessage = require("./messages");
const { whenUserJoins, whenUserLeaves } = require("./users");
const { getUsersByRoom, getRoomById, getUserById } = require("./database")
const {
  global_constants,
  message_templates,
  message_helper_functions,
  socket_events
} = require("./constants")


const socket = (io) => {
  io.on(socket_events.SOCKET_CONNECTED, (socket) => {
    socket.on(socket_events.JOIN_ROOM, ({ username, roomId, userId }) => {
      const user = whenUserJoins(socket.id, roomId, username, userId);
      socket.join(user.room);
      const room = getRoomById(user.room);
      if (user.isAlone) {
        socket.emit(
          socket_events.INFO_MESSAGE,
          formatMessage(
            global_constants.BOT_NAME,
            message_templates.WAITING_MESSAGE,
            {room, user}
          )
        );
      } else {
        socket.emit(
          socket_events.INFO_MESSAGE,
          formatMessage(
            global_constants.BOT_NAME,
            message_helper_functions.GENERATE_USER_JOIN_MESSAGE(user.username),
            {room, user}
          )
        );
      }
      socketBroadcast(
        socket, 
        user.room, 
        socket_events.INFO_MESSAGE,
        formatMessage(
          global_constants.BOT_NAME,
          message_helper_functions.GENERATE_USER_JOIN_MESSAGE(user.username), 
          {room, user}
        )
      );
      socketBroadcast(
        socket,
        user.room,
        socket_events.USER_JOINED,
        userId
      );
      io.to(user.room).emit(socket_events.ROOM_AND_USERS, {
        room: getRoomById(user.room),
        users: getUsersByRoom(user.room),
      });
    });

    socket.on(socket_events.CLIENT_MESSAGE, (msg) => {
      const user = getUserById(socket.id);
      io.to(user.room).emit(socket_events.SERVER_MESSAGE, 
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

    socket.on(socket_events.SOCKET_DISCONNECTED, () => {
      const user = whenUserLeaves(socket.id);
      const room = getRoomById(user?.room);
      if (user) {
        io.to(user.room).emit(
          socket_events.INFO_MESSAGE,
          formatMessage(
            global_constants.BOT_NAME,
            message_helper_functions.GENERATE_USER_LEFT_MESSAGE(user.username),
            {user, room}
          )
        );

        io.to(user.room).emit(socket_events.ROOM_AND_USERS, {
          room: getRoomById(user.room),
          users: getUsersByRoom(user.room),
        });

        io.to(user.room).emit(socket_events.USER_LEFT, user.userId)

        io.to(user.room).emit(
          socket_events.INFO_MESSAGE,
          formatMessage(
            global_constants.BOT_NAME,
            message_templates.WAITING_MESSAGE,
            {user, room}
          )
        );
      }
    });
  });
}

const socketBroadcast = (socket, room, event, message) => {
   socket.broadcast.to(room).emit(event, message);
}


module.exports = socket;
