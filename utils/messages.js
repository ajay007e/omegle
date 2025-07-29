const moment = require('moment');
const { waitingMessage, strangerLeftMessage, strangerJoinMessage } = require("./constants")

const formatMessage = (username, text, isSystemGenerated=true, id=1) => {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    id,
    info: {
      isSystemGenerated,
      isUserWaiting: text === waitingMessage,
      isUserActionMessage: text === strangerLeftMessage || text === strangerJoinMessage,
      isUserLeftMessage: text === strangerLeftMessage,
      isUserJoinMessage: text === strangerJoinMessage

    }
  }
}

module.exports = formatMessage;
