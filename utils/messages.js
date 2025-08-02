const moment = require('moment');
const { waitingMessage, checkStrangerLeftMessage, checkStrangerJoinMessage } = require("./constants")

const formatMessage = (username, text, extra = {isSystemGenerated:true}) => {
  return {
    username: username === "Anonymous" ? "Stranger" : username,
    text,
    time: moment().format('h:mm a'),
    id: extra?.id ?? 1,
    info: {
      isSystemGenerated: extra?.isSystemGenerated ?? true,
      isUserWaiting: text === waitingMessage,
      isUserActionMessage: checkStrangerJoinMessage(text) || checkStrangerLeftMessage(text),
      isUserLeftMessage: checkStrangerLeftMessage(text),
      isUserJoinMessage: checkStrangerJoinMessage(text),
      isPrivateRoom: extra?.room?.type !== 'meeting' 
    }
  }
}

module.exports = formatMessage;
