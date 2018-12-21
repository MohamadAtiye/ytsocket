const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const SOCKET_PORT = 8081;

server.listen(SOCKET_PORT, () => {
  console.log("SOCKET.IO now listening at port ", SOCKET_PORT);
});

// io.emit //==> to everyone including sender
// socket.broadcast.emit //==> to everyone except sender
// io.to(targetRoom).emit("roommsg", text); //==> send to room
// io.to(targetSocketID).emit("private", text); //==> send to person (same as room)

let connectedPlayerSockets = [];
let connectedPlayerNames = [];

io.on("connection", function(socket) {
  console.log(socket.id, " connected");
  connectedPlayerSockets[socket.id] = socket;

  // //joining a room
  // socket.join(roomName, () => {
  //   socket
  //     .to(roomName)
  //     .emit("saySomething", socket.id + " has joined this room");
  // });

  // //leaving a room
  // socket.leave(roomName, () => {
  //   io.to(roomName).emit("saySomething", socket.id + " has left the room");
  // });

  socket.on("saySomething", function(msg, callback) {
    console.log(socket.id, " said : " + JSON.stringify(msg));
    callback("you said : " + JSON.stringify(msg));
  });

  socket.on("playerControl", function(msg, callback) {
    console.log(socket.id, " said : " + JSON.stringify(msg));
    socket.broadcast.emit("playerControl", msg);
  });

////////////////////////////////////////////////////////////////////////////////////////
  socket.on("setPlayerName", function(msg, callback) {
    let newName = msg.name.trim();
    if (connectedPlayerNames.includes(newName)) {
      callback({ ok: false, error: "**name already in use" });
    } else if (newName.length < 5 || newName.length > 30) {
      callback({
        ok: false,
        error: "**choose name between 5 and 30 characters"
      });
    } else {
      socket.profile = {};
      socket.profile.name = newName;
      connectedPlayerSockets[socket.id] = socket;
      connectedPlayerNames.push(newName);
      callback({ ok: true, error: "", newName: newName, id: socket.id });
      console.log("new player received a name.", socket.id, newName);
    }
  });

////////////////////////////////////////////////////////////////////////////////////////
  socket.on("joinRoom", function(msg, callback) {
    let newRoom = msg.room.trim();
    if(!socket.profile || !socket.profile.name){
      callback({
        ok: false,
        error: "**choose a name first, then join a room"
      });
    }
    else if (newRoom.length < 5 || newRoom.length > 30) {
      callback({
        ok: false,
        error: "**choose room name between 5 and 30 characters"
      });
    } else {
      socket.join(newRoom, () => {
        socket.profile.room = newRoom;
        let newMsg = {ts:Date.now(),from:"system",msg:socket.profile.name + " has joined this room",color:"red"};
        socket
          .to(newRoom)
          .emit("roomChat", newMsg);
      });

      callback({ ok: true, error: "", newName: socket.profile.name,newRoom:newRoom, id: socket.id });
    }
  });

  socket.on("roomChat", function(msg, callback) {
    if(!socket.profile || !socket.profile.room) return;
    msg.ts = Date.now();
    socket
    .to(socket.profile.room)
    .emit("roomChat", msg);
  });

  socket.on("ping", function(msg, callback) {
    callback(msg);
  });

////////////////////////////////////////////////////////////////////////////////////////
  socket.on("disconnect", function() {
    let name = "";
    let room = "";
    if(socket.profile) {
      name =socket.profile.name;
      room = socket.profile.room;
    }
    console.log(socket.id, name, " disconnected ");

    //-- remove name from used names list
    var index = connectedPlayerNames.indexOf(name);
    if (index > -1) {
      connectedPlayerNames.splice(index, 1);
    }
    let newMsg = {ts:Date.now(),from:"system",msg:name + " has left this room",color:"red"};

    io
    .to(room)
    .emit("roomChat", newMsg);

    //-- delete player socket
    delete connectedPlayerSockets[socket.id];
  });

////////////////////////////////////////////////////////////////////////////////////////
});
