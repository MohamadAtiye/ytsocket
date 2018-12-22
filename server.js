'use strict';

const express = require("express");
const socketIO = require('socket.io');
const path = require('path');


const SOCKET_PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');


const server = express()
  .get('/', (req, res) => res.sendFile(INDEX))
  .listen(SOCKET_PORT, () => console.log(`Listening on ${SOCKET_PORT}`));


//create socket server
const io = socketIO(server);


let connectedPlayerSockets = [];
let connectedPlayerNames = [];

io.on("connection", function (socket) {
  console.log("###################-- "+socket.id, " connected");
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

  socket.on("saySomething", function (msg, callback) {
    console.log(socket.id, " said : " + JSON.stringify(msg));
    callback("you said : " + JSON.stringify(msg));
  });

  socket.on("playerControl", function (msg, callback) {
    console.log(socket.id, " said : " + JSON.stringify(msg));
    if (socket.profile && socket.profile.room)
      socket
        .to(socket.profile.room)
        .emit("playerControl", msg);

  });

  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("setPlayerName", function (msg, callback) {
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

      console.log("###################-- new received a name");
      console.log(socket.id,socket.profile);
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("joinRoom", function (msg, callback) {
    let newRoom = msg.room.trim();
    if (!socket.profile || !socket.profile.name) {
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
        let newMsg = { ts: Date.now(), from: "system", msg: socket.profile.name + " has joined this room", color: "red" };
        socket
          .to(newRoom)
          .emit("roomChat", newMsg);
      });

      callback({ ok: true, error: "", newName: socket.profile.name, newRoom: newRoom, id: socket.id });

      console.log("###################-- player joined a room");
      console.log(socket.id,socket.profile);
    }
  });

  socket.on("roomChat", function (msg, callback) {
    if (!socket.profile || !socket.profile.room) return;
    msg.ts = Date.now();
    socket
      .to(socket.profile.room)
      .emit("roomChat", msg);

    callback(msg);

    console.log("###################-- message to room : "+ socket.profile.room);
    console.log(msg);
  });

  socket.on("ping", function (msg, callback) {
    console.log("###################-- ping message");
    callback(msg);
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("disconnect", function () {
    let name = "";
    let room = "";
    if (socket.profile) {
      name = socket.profile.name;
      room = socket.profile.room;
    }
    console.log("###################-- "+socket.id, name, " disconnected ");

    //-- remove name from used names list
    var index = connectedPlayerNames.indexOf(name);
    if (index > -1) {
      connectedPlayerNames.splice(index, 1);
    }
    let newMsg = { ts: Date.now(), from: "system", msg: name + " has left this room", color: "red" };

    io
      .to(room)
      .emit("roomChat", newMsg);

    //-- delete player socket
    delete connectedPlayerSockets[socket.id];
  });

  ////////////////////////////////////////////////////////////////////////////////////////
});
