const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};
function broadcastUserList() {
  io.emit("update-users", Object.values(users));
}

io.on("connection", function (socket) {
  console.log(`user connected: ${socket.id}`);

  socket.on("send-location", function (data) {
    users[socket.id] = data.userName || "Unknown";
    io.emit("receive-location", {
      id: socket.id,
      userName: users[socket.id],
      latitude: data.latitude,
      longitude: data.longitude,
    });

    broadcastUserList();

  });
  socket.on("disconnect", function () {
    delete users[socket.id];
    io.emit("user-disconnected", socket.id);
    broadcastUserList();
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
