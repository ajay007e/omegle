const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const socket = require("./utils/socket")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

socket(io)

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
