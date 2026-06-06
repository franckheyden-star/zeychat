const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const upload = multer({
  dest: "uploads/"
});

let users = {};
let onlineUsers = {};
let groups = {
  fantome_all: []
};

app.use(express.static("public"));
app.use("/files", express.static("uploads"));

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    url: "/files/" + req.file.filename
  });
});

io.on("connection", (socket) => {

  socket.on("login", (name) => {

    users[socket.id] = name;
    onlineUsers[socket.id] = name;

    socket.join("fantome_all");

    io.emit("online", Object.values(onlineUsers));
    io.emit("groups", Object.keys(groups));

  });

  socket.on("disconnect", () => {

    delete users[socket.id];
    delete onlineUsers[socket.id];

    io.emit("online", Object.values(onlineUsers));

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Fantome Chat lancé sur le port", PORT);
});
