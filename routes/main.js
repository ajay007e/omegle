let router = require("express").Router();


router.get("/", (req, res, nxt) => {
    res.render("lobby", {
        title: "Omegle: Talks to People with Free Video Chat",
        isCurrentPageLobby: true
    });
});

router.get("/chat", (req, res, nxt) => {
    res.render("chat", {
        title: "Omegle: Talks to Strangers with Free Video Chat",
        page: 'chat',
        username: 'Anonymous',
        isCurrentPageLobby: false
    });
});

router.get("/room", (req, res, nxt) => {
    res.render("room", {
        title: "Omegle: Talks to Friends with Free Video Chat",
        isCurrentPageLobby: false
    });
});

module.exports = router;
