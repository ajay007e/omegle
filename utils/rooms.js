const {
  addRoom,
  removeRoom,
  getRoomById,
  getRoomsByType,
  getUsersByRoom,
  getRandomRoomByType,
  updateRoomTypeById
} = require("./database");

const { generateRandomNumber, isStringEmpty } = require("./helper")

const {
  room_types
} = require("./constants")


const getAvailableWaitingRoom = () => {
  room = generateRandomNumber();
  while (getRoomsByType(room_types.PRIVATE).includes(room)) {
    room = randomRoom();
  }
  return room;
}

const getPrivateRoom = () => {
  let room;
  let isAlone;
  let type;
  if (getRoomsByType(room_types.WAITING).length === 0) {
    room = getAvailableWaitingRoom();
    addRoom(room, room_types.WAITING);
    isAlone=true;
    type = room_types.WAITING;
  } else {
    room = getRandomRoomByType(room_types.WAITING).id;
    isAlone=false;
    updateRoomTypeById(room, room_types.PRIVATE);
    type = room_types.PRIVATE;
  }
  return {room, isAlone, type};
}

const getMeetingRoom = (roomId) => {
    if (!getRoomById(roomId)) {
      addRoom(roomId, room_types.MEETING);
    }
    return {room: roomId, isAlone:getUsersByRoom(roomId).length === 0, type: room_types.MEETING};
}


const getRoomForUser = (roomId) => {
  if (isStringEmpty(roomId)) {
    return getPrivateRoom(); 
  } else {
    return getMeetingRoom(roomId);   
  }
}

const handleRoomWhenUserLeaves = (userRoom) => {
    const roomType = getRoomById(userRoom)?.type; 
    if (roomType === room_types.WAITING) {
      removeRoom(userRoom);
    }
    if (roomType === room_types.PRIVATE) {
      updateRoomTypeById(userRoom, room_types.WAITING);
    }
    if (roomType === room_types.MEETING && getUsersByRoom(userRoom).length == 1) {
      removeRoom(userRoom);
    }
}

module.exports = {
  getRoomForUser,
  handleRoomWhenUserLeaves
}
