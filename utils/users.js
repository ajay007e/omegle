const {
  getUsersByRoom,
  getUsersCountInRoom,
  getUserById,
  removeUser,
  addUser
} = require("./database");

const {
  getRoomForUser,
  handleRoomWhenUserLeaves
} = require("./rooms")

const {
  getRandomUserName
} = require("./helper")


const whenUserJoins = (id, roomId, username, userId, info) => {
  const {room, isAlone, type} = getRoomForUser(roomId);
  username = getRandomUserName(username, type);
  return addUser({
    id,
    username,
    room,
    isAlone,
    isHost: isAlone,
    userId,
    info,
    isScreenCast: username === 'Presentation'
  });
}

const whenUserLeaves = (id) => {
  const user = getUserById(id);
  if (user) {
    handleRoomWhenUserLeaves(user.room);
    return removeUser(user.id);
  }
}


module.exports = {
  whenUserJoins,
  whenUserLeaves
};
