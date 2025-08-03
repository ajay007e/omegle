const router = require("express").Router();
const { 
    isValidRoomCode,
    isStringEmpty,
    getUniqueRoomCode,
    isExistingRoomCode 
} = require("../utils/helper")

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
    if (isExistingRoomCode(roomId)) {
        res.render("room", {
            title: "Omegle: Talks to Friends with Free Video Chat",
            page: 'room',
            isCurrentPageLobby: false,
            username: 'Anonymous',
            roomId: req.params.roomId
        });
    } else {
        res.redirect(
            '/?error=' + 
                encodeURIComponent(
                    'Room does not exist. Please check the code or create a new room'
                )
        );
    }
});

router.post("/r", (req, res, nxt) => {
    const roomCode = req.body.roomCode;
    if (isValidRoomCode(roomCode)) {
        res.redirect(`/${roomCode}`);
    } else if (isStringEmpty(roomCode)) {
        res.redirect(`/${getUniqueRoomCode()}`);
    } else {
        res.redirect('/?error=' + encodeURIComponent('Invalid Room Code'));
    }
});

module.exports = router;
