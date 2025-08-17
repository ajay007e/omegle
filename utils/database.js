const users = [];

const addUser = (user) => {users.push(user); return user}
const removeUser = (userId) => {
  const idx = users.findIndex(user => user.id === userId);
  if (idx !== -1) {
    updateHost(users[idx]);
    return users.splice(idx, 1)[0];
  }
};
const removeUserByUserId = (userId) => {
  const idx = users.findIndex(user => user.userId === userId);
  if (idx !== -1) {
    updateHost(users[idx]);
    const user = users.splice(idx, 1)[0];
    return user;
  }
};
const getUserById = (id) => users.find(user => user.id === id);
const getUserByUserId = (userId) => users.find(user => user.userId === userId);
const getUsersByRoom = (room) => users.filter(user => user.room === room);
const getRandomUserByRoom = (room) => {
  const usersFromGivenRoom = users.filter(user => user.room === room);
  if (usersFromGivenRoom.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * usersFromGivenRoom.length);
  return usersFromGivenRoom[randomIndex];
}
const updateUsernameById = (id, username) => {
  const user = users[users.findIndex(user => user.id == id)];
  user.username = username;
  return user;
}
const updateHost = (host) => {
  if (!host.isHost) return;
  let newHost;
  let attempts = 0;
  do {
    newHost = getRandomUserByRoom(host.room);
    attempts++;
    if (attempts > 10000) throw new Error("Too many attempts to find new host.");
  } while(getUsersByRoom(host.room).length != 1 && newHost.id === host.id && newHost.username == "Presentation");
  if (newHost) {
    // direct mutation of users collection
    users[users.findIndex(user => user.id === newHost.id)].isHost = true;
  }
}
const updateUserInfoById = (id, info) => {
  const user = users[users.findIndex(user => user.id == id)];
  user.info = info;
  return user;

}


const rooms = [];

const getAllRooms = () => rooms;
const addRoom = (id, type) => rooms.push({id, type, presentationStatus: false});
const removeRoom = (roomId) => {
  const idx = rooms.findIndex(room => room.id === roomId);
  if (idx !== -1) {
    return rooms.splice(idx, 1)[0];
  }
};
const getRoomById = (roomId) => rooms.find(room => room.id == roomId);
const getRoomsByType = (roomType) => rooms.filter(room => room.type === roomType);
const getRandomRoomByType = (roomType) => {
  const roomsWithGivenType = rooms.filter(room => room.type === roomType);
  if (roomsWithGivenType.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * roomsWithGivenType.length);
  return roomsWithGivenType[randomIndex];
}
const updateRoomTypeById = (id, type) => {
  const room = getRoomById(id);
  if (room) {
    room.type = type;
    return true;
  }
  return false;
};

const updateRoomStatusById = (id, status) => {
  const room = getRoomById(id);
  if (room) {
    room.presentationStatus = status;
  }
  return room;
}



module.exports = {
  addUser,
  removeUser,
  getUserById,
  getUserByUserId,
  getUsersByRoom,
  updateUsernameById,
  updateUserInfoById,
  removeUserByUserId,

  addRoom,
  removeRoom,
  getAllRooms,
  getRoomById,
  getRoomsByType,
  getRandomRoomByType,
  updateRoomTypeById,
  updateRoomStatusById
}
