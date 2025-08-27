const { getAllRooms, addRoom } = require("./database")
const { room_types } = require("./constants")

const isStringEmpty = (str) => str === undefined || str.trim() === ''; 

const generateRandomNumber = (max = 1000) => Math.floor(Math.random() * max);

const getRandomUserName = (username, type) => {
  if (type !== 'meeting' || username === 'Presentation') return username;

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

const getUniqueRoomCode = () => {
  const getRandomLetter = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const getRandomDigit = () => Math.floor(Math.random() * 10).toString();

  const generateCode = () => {
    const part1 = getRandomLetter() + getRandomLetter() + getRandomLetter();
    const part2 = getRandomDigit() + getRandomDigit();
    const part3 = getRandomLetter() + getRandomLetter();
    const part4 = getRandomDigit() + getRandomLetter() + getRandomLetter();
    return `${part1}-${part2}-${part3}-${part4}`;
  };

  let newCode;
  let attempts = 0;
  do {
    newCode = generateCode();
    attempts++;
    if (attempts > 10000) throw new Error("Too many attempts to generate a unique room code.");
  } while (getAllRooms().includes(newCode));
  addRoom(newCode, room_types.MEETING);
  return newCode;
}

const isValidRoomCode = (code) => {
  const roomCodePattern = /^[a-z]{3}-\d{2}-[a-z]{2}-\d[a-z]{2}$/;
  return roomCodePattern.test(code);
};

const isExistingRoomCode = (code) => {
  if (!isValidRoomCode(code)) return false;
  return getAllRooms().map(room => room.id ).includes(code);
};


module.exports = {
  getRandomUserName,
  isStringEmpty,
  generateRandomNumber,
  getUniqueRoomCode,
  isValidRoomCode,
  isExistingRoomCode,
}
