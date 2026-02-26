import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Store current state of all vehicles
let vehicles = {}; // { playerId: [blocks] }

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Send existing blocks to new player
  if (vehicles[socket.id]) {
    vehicles[socket.id].forEach((block) => {
      socket.emit("updateBlock", { ...block, playerId: socket.id });
    });
  }

  // When a player places a block
  socket.on("placeBlock", (data) => {
    if (!vehicles[socket.id]) vehicles[socket.id] = [];
    vehicles[socket.id].push(data);

    // Broadcast to all other players
    socket.broadcast.emit("updateBlock", { ...data, playerId: socket.id });
  });

  // Player disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete vehicles[socket.id];
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
