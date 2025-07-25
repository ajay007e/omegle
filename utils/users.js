const {
  rearrangeRoomWhenUserLeaves,
  getRoomForUser
} = require("./rooms")


const users = [];

const whenUserJoins = (id, username, userId) => {
  const {room, isAlone} = getRoomForUser()
  const user = {id, username, room, isAlone, userId};
  users.push(user);
  return user;
}

const whenUserLeaves = (id) => {
  const userIdx = getUserIdx(id);
  if (userIdx !== -1) {
    userRoom = getUserRoomByIdx(userIdx)
    rearrangeRoomWhenUserLeaves(userRoom);
    return users.splice(userIdx, 1)[0];
  }
}

const getUsersByRoom = (room) => users.filter((user) => user.room === room);

const getUserRoomByIdx = (userIdx) => users[userIdx].room;

const getUserIdx = (id) => users.findIndex((user) => user.id === id);

const getCurrentUser = (id) => users.find((user) => user.id === id);

module.exports = {
  whenUserJoins,
  getCurrentUser,
  whenUserLeaves,
  getUsersByRoom,
};
