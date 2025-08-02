const users = [];

const addUser = (user) => {users.push(user); return user}
const removeUser = (userId) => {
  const idx = users.findIndex(user => user.id === userId);
  if (idx !== -1) {
    return users.splice(idx, 1)[0];
  }
};
const getUserById = (userId) => users.find(user => user.id === userId);
const getUsersByRoom = (room) => users.filter(user => user.room === room);


const rooms = [];

const addRoom = (id, type) => rooms.push({id, type});
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



module.exports = {
  addUser,
  removeUser,
  getUserById,
  getUsersByRoom,

  addRoom,
  removeRoom,
  getRoomById,
  getRoomsByType,
  getRandomRoomByType,
  updateRoomTypeById
}
