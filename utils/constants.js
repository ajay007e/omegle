

const botName = "ChatCord Bot";
const waitingMessage = "Waiting for someone to join...";
const strangerJoinMessage = (username) => `${username} has joined the chat`;
const checkStrangerJoinMessage = (message) => message.endsWith('has joined the chat');
const strangerLeftMessage = (username) => `${username} has left the chat`;
const checkStrangerLeftMessage = (message) => message.endsWith('has left the chat');

const global_constants = {
  BOT_NAME: botName,
  ANONYMOUS: 'Anonymous',
  STRANGER: 'Stranger',
  TIME_FORMAT: 'h:mm a'
};

const message_templates = {
  WAITING_MESSAGE: waitingMessage
};

const room_types = {
  PRIVATE: 'private',
  WAITING: 'waiting',
  MEETING: 'meeting'
};

const message_helper_functions = {
  GENERATE_USER_JOIN_MESSAGE: strangerJoinMessage,
  GENERATE_USER_LEFT_MESSAGE: strangerLeftMessage,
  CHECK_USER_JOIN_MESSAGE: checkStrangerJoinMessage,
  CHECK_USER_LEFT_MESSAGE: checkStrangerLeftMessage,
};

const socket_events = {
  SOCKET_CONNECTED: 'connection',
  SOCKET_DISCONNECTED: 'disconnect',
  ROOM_AND_USERS: 'room-and-users',
  JOIN_ROOM: 'join-room',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  CLIENT_MESSAGE: 'chat-message',
  SERVER_MESSAGE: 'message',
  INFO_MESSAGE: 'info-message'
  
};

module.exports = {
  global_constants,
  message_templates,
  message_helper_functions,
  socket_events,
  room_types
}
