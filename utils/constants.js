

const botName = "ChatCord Bot";
const waitingMessage = "Waiting for someone to join...";
const strangerJoinMessage = (username) => `${username} has joined the chat`;
const checkStrangerJoinMessage = (message) => message.endsWith('has joined the chat');
const strangerLeftMessage = (username) => `${username} has left the chat`;
const checkStrangerLeftMessage = (message) => message.endsWith('has left the chat');
const infoMessage = "info-message";
const roomUsers = "roomUsers";

module.exports = {
  botName,
  waitingMessage,
  checkStrangerJoinMessage,
  strangerJoinMessage,
  checkStrangerLeftMessage,
  strangerLeftMessage,
  infoMessage,
  roomUsers
}
