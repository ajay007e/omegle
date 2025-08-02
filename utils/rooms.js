const {
  addRoom,
  removeRoom,
  getRoomById,
  getRoomsByType,
  getUsersByRoom,
  getRandomRoomByType,
  updateRoomTypeById
} = require("./database");


const isStringEmpty = (str) => str === undefined || str.trim() === ''; 

const randomRoom = () => Math.floor(Math.random() * 1000);

const getAvailableWaitingRoom = () => {
  room = randomRoom();
  while (getRoomsByType('private').includes(room)) {
    room = randomRoom();
  }
  return room;
}

const getPrivateRoom = () => {
  let room;
  let isAlone;
  let type;
  if (getRoomsByType('waiting').length === 0) {
    room = getAvailableWaitingRoom();
    addRoom(room, 'waiting');
    isAlone=true;
    type = 'waiting';
  } else {
    room = getRandomRoomByType('waiting').id;
    isAlone=false;
    updateRoomTypeById(room, 'private');
    type = 'private';
  }
  return {room, isAlone, type};
}

const getMeetingRoom = (roomId) => {
    let isAlone;
    if (getRoomById(roomId)) {isAlone = false}
    else {
      isAlone = true;
      addRoom(roomId, 'meeting');
    }
    return {room: roomId, isAlone, type: 'meeting'};
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
    if (roomType === 'waiting') {
      removeRoom(userRoom);
    }
    if (roomType === 'private') {
      updateRoomTypeById(userRoom, 'waiting');
    }
    if (roomType === 'meeting' && getUsersByRoom(userRoom).length == 1) {
      removeRoom(userRoom);
    }
}

module.exports = {
  getRoomForUser,
  handleRoomWhenUserLeaves
}
