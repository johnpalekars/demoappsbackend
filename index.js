const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const PORT = 4000;
const app = express();
app.use(cors());
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("hello world");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log("connected to server " + socket.id);

  socket.on("join_room", (data) => {
    const { username, room } = data; // Data sent from client when join_room event emitted
    socket.join(room);

    console.log(username);
  });
});

server.listen(PORT, () => "listning on port" + PORT);
