const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", socket => {

    players[socket.id] = {
        position: {x:0,y:5,z:0},
        rotation: {x:0,y:0,z:0},
        build: [],
        health: 100
    };

    socket.emit("init", players);
    socket.broadcast.emit("playerJoined", players[socket.id]);

    socket.on("update", data => {
        players[socket.id] = data;
        socket.broadcast.emit("playerUpdate", {id:socket.id, data});
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("removePlayer", socket.id);
    });
});

server.listen(process.env.PORT || 3000);
