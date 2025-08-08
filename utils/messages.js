const moment = require('moment');
const { 
  global_constants, 
  message_templates,
  message_helper_functions,
  room_types 
} = require("./constants")

const formatMessage = (username, text, extra = {isSystemGenerated:true}) => {
  return {
    username: username === global_constants.ANONYMOUS ? global_constants.STRANGER : username,
    text,
    time: moment().format(global_constants.TIME_FORMAT),
    id: extra?.id ?? 1,
    info: {
      isSystemGenerated: extra?.isSystemGenerated ?? true,
      isUserWaiting: text === message_templates.WAITING_MESSAGE,
      isUserActionMessage: message_helper_functions.CHECK_USER_JOIN_MESSAGE(text) || message_helper_functions.CHECK_USER_LEFT_MESSAGE(text),
      isUserLeftMessage: message_helper_functions.CHECK_USER_LEFT_MESSAGE(text),
      isUserJoinMessage: message_helper_functions.CHECK_USER_JOIN_MESSAGE(text),
      isPrivateRoom: extra?.room?.type !== room_types.MEETING,
      userId: extra?.user?.userId
    }
  }
}

module.exports = formatMessage;
