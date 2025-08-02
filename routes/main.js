let router = require("express").Router();

const activeRooms = [];

const generateUniqueRoomCode = () => {
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
  } while (activeRooms.includes(newCode));

  activeRooms.push(newCode);
  return newCode;
}

const isValidRoomCode = (code) => {
  const roomCodePattern = /^[a-z]{3}-\d{2}-[a-z]{2}-\d[a-z]{2}$/;
  return roomCodePattern.test(code);
};

const isExistingRoom = (code) => {
  if (!isValidRoomCode(code)) return false;
  return activeRooms.includes(code);
};

const isEmpty = (string) => {
    return string === undefined || string === "";
}

router.get("/", (req, res, nxt) => {
    const errorMessage = req.query.error;
    res.render("lobby", {
        title: "Omegle: Talks to People with Free Video Chat",
        errorMessage,
        isCurrentPageLobby: true
    });
});

router.get("/c", (req, res, nxt) => {
    res.render("chat", {
        title: "Omegle: Talks to Strangers with Free Video Chat",
        page: 'chat',
        username: 'Anonymous',
        isCurrentPageLobby: false
    });
});

router.get("/:roomId", (req, res, nxt) => {
    const roomId = req.params.roomId;
    if (isExistingRoom(roomId)) {
        res.render("room", {
            title: "Omegle: Talks to Friends with Free Video Chat",
            page: 'room',
            isCurrentPageLobby: false,
            username: 'Anonymous',
            roomId: req.params.roomId
        });
    } else {
        res.redirect('/?error=' + encodeURIComponent('Room does not exist. Please check the code or create a new room'));
    }
});

router.post("/r", (req, res, nxt) => {
    const roomCode = req.body.roomCode;
    if (isValidRoomCode(roomCode)) {
        res.redirect(`/${roomCode}`);
    } else if (isEmpty(roomCode)) {
        res.redirect(`/${generateUniqueRoomCode()}`);
    } else {
        res.redirect('/?error=' + encodeURIComponent('Invalid Room Code'));
    }
});

module.exports = router;
