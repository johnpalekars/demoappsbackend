const http = require("http");
const express = require("express");
const cors = require("cors");
const removeUser = require("./services/remove_users");

const { Server } = require("socket.io");
require("dotenv").config();
// console.log(process.env.HARPERDB_URL);
const harperSaveMessage = require("./services/harper-save-message");
const harperGetMessages = require("./services/harper-get-messages");

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

const CHAT_BOT = "chat_bot";
let allUsers = [];
let chatRoom = "";

io.on("connection", (socket) => {
  console.log("connected to server " + socket.id);

  socket.on("join_room", (data) => {
    const { user, room } = data; // Data sent from client when join_room event emitted
    socket.join(room);

    console.log(user);
    chatRoom = room;
    allUsers.push({ id: socket.id, user, room });
    let chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);

    let __createdtime__ = Date.now();

    socket.to(room).emit("receive_message", {
      message: user + " has joined the chat room",
      user: CHAT_BOT,
      __createdtime__,
    });



    socket.on("send_message", (data) => {
      const { message, user, room, __createdtime__ } = data;
      io.in(room).emit("receive_message", data);
      harperSaveMessage(message, user, room, __createdtime__) // Save message in db
        .then((response) => console.log(response))
        .catch((err) => console.log(err));
    });

    socket.on("left_room", (data) => {
      const { user, room } = data;
      allUsers = removeUser(socket.id, allUsers);
      socket.to(room).emit("chatroom_users", allUsers);
      io.in(room).emit("left_room", data);
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from the chat");
      const user = allUsers.find((user) => user.id == socket.id);
      if (user?.user) {
        allUsers = removeUser(socket.id, allUsers);
        socket.to(chatRoom).emit("chatroom_users", allUsers);
        socket.to(chatRoom).emit("receive_message", {
          message: `${user.user} has disconnected from the chat.`,
        });
      }
    });

    harperGetMessages(room)
      .then((msgs) => {
        let last100Messages = [{room:room, message: "Welcome "+user ,user: CHAT_BOT,__createdtime__},...msgs]
        // last100Messages.push()
        console.log(last100Messages);
        socket.emit("last_100_messages", last100Messages);
      })
      .catch((err) => console.log(err));
  });
});

server.listen(PORT, () => "listning on port" + PORT);
