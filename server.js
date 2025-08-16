const path = require("path");
const http = require("http");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const socketio = require("socket.io");
const { PeerServer } = require("peer");

const socket = require("./utils/socket");
const router = require("./routes/main");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.urlencoded({ extended: true }));

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layout/layout')
app.set("views", path.join(__dirname, "views"));

app.use("/", router);

app.use(express.static(path.join(__dirname, "public")));

socket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const PEER_PORT = process.env.PEER_PORT || 5001;
const peerServer = PeerServer({port: PEER_PORT});
