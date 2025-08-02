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


const whenUserJoins = (id, roomId, username, userId) => {
  const {room, isAlone, type} = getRoomForUser(roomId);
  return addUser({id, username: getRandomUserName(username, type), room, isAlone, userId});
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
