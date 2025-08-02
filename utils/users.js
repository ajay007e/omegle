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

const getRandomUserName = (username, type) => {
  if (type !== 'meeting') return username;

  const adjectives = [
    "Agile", "Brave", "Calm", "Daring", "Eager", "Fancy", "Gentle", "Happy", "Ideal",
    "Jolly", "Kind", "Lively", "Merry", "Nice", "Optimistic", "Proud", "Quick",
    "Relaxed", "Silly", "Tidy", "Upbeat", "Vibrant", "Witty", "Xenial", "Young", "Zealous",
    "Bold", "Curious", "Fearless", "Graceful", "Humble", "Intrepid", "Joyful", "Keen",
    "Lucid", "Mindful", "Nifty", "Open", "Playful", "Quirky", "Resilient", "Serene", "Thoughtful",
    "Unique", "Valiant", "Wise", "Zesty", "Resourceful", "Charming", "Stoic", "Smiling"
  ];

  const names = [
    "Einstein", "Curie", "Newton", "Tesla", "Hopper", "Lovelace", "Darwin", "Turing",
    "Galileo", "Kepler", "Feynman", "Bohr", "Hawking", "Fermi", "Goodall", "Boyle",
    "Franklin", "Noether", "Bernerslee", "Shannon", "Rubin", "Rosalind", "Hypatia", "Raman",
    "Archimedes", "Pascal", "Gauss", "Alhazen", "Leibniz", "Euclid", "Planck", "Sagan",
    "Dijkstra", "Kalam", "Meitner", "Banach", "Elion", "Vermeer", "Leavitt", "Dirac", "Mendeleev",
    "Watson", "Crick", "Boole", "Descartes", "Kapitsa", "Milankovic", "Joliot", "Mirzakhani", "Babbage"
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  return `${adj} ${name}`;
}

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
