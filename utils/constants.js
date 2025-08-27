const botName = "ChatCord Bot";
const waitingMessage = "Waiting for someone to join...";
const strangerJoinMessage = (username) => `${username} has joined the chat`;
const checkStrangerJoinMessage = (message) => message.endsWith('has joined the chat');
const strangerLeftMessage = (username) => `${username} has left the chat`;
const checkStrangerLeftMessage = (message) => message.endsWith('has left the chat');
const presentationStartMessage = (username) => `${username} has started presenting`
const presentationStopMessage = (username) => `${username} has stopped presenting`
const checkPresentationMessage = (message) => message.endsWith('presenting');

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
  GENERATE_USER_START_PRESENTATION_MESSAGE: presentationStartMessage,
  GENERATE_USER_STOP_PRESENTATION_MESSAGE: presentationStopMessage,
  CHECK_USER_PRESENTATION_MESSAGE: checkPresentationMessage,
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
  INFO_MESSAGE: 'info-message',
  USER_FORCE_LEFT: 'kick-out',
  EDIT_USER: 'edit-user',
  STREAM_UPDATE: 'stream-updated',
  USER_WHO: 'user-who',
  CAST_STARTED: 'screen-cast-started',
  CAST_STOPPED: 'screen-cast-stopped'
};

const warnings ={
  HOST_REMOVED_YOU: 'Host remove you from the meeting room'
}

module.exports = {
  global_constants,
  message_templates,
  message_helper_functions,
  socket_events,
  room_types,
  warnings
}
