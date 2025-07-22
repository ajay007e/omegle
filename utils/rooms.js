const rooms = [];
const activeRooms = [];

const rearrangeRoomWhenUserLeaves = (userRoom) => {
    if (rooms.includes(userRoom)) {
      removeElementFromArray(rooms, userRoom)
    } else {
      rooms.push(userRoom);
    }
    removeElementFromArray(activeRooms, userRoom)
}
const getRoomForUser = () => {
  let room;
  let isAlone;
  if (rooms.length === 0) {
    room = getAvailableRoom() 
    rooms.push(room);
    isAlone=true;
  } else {
    room = rooms.shift();
    isAlone=false;
    activeRooms.push(room);
  }
  return {room, isAlone}
}

const randomRoom = () => Math.floor(Math.random() * 1000);

const removeElementFromArray = (array, item) => {
  const idx = array.indexOf(item);
  if (idx !== -1) {
    array.splice(idx, 1)
  }
}

const getAvailableRoom = () => {
  room = randomRoom();
  while (activeRooms.includes(room)) {
    room = randomRoom();
  }
  return room;
}

module.exports = {
  getRoomForUser,
  rearrangeRoomWhenUserLeaves
}
