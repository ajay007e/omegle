const moment = require('moment');
const {waitingMessage} = require("./constants")

const formatMessage = (username, text, isSystemGenerated=true, id=1) => {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    id,
    isSystemGenerated,
    isUserWaiting: text === waitingMessage
  }
}

module.exports = formatMessage;
