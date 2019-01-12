"use strict";

const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

const SOCKET_PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "index.html");

const server = express()
  .get("/", (req, res) => res.sendFile(INDEX))
  .listen(SOCKET_PORT, () => console.log(`Listening on ${SOCKET_PORT}`));

//create socket server
const io = socketIO(server);

let connectedPlayerSockets = [];
let connectedPlayerNames = [];
let roomsMetaData = [];

io.on("connection", function(socket) {
  console.log("###################-- " + socket.id, " connected");
  connectedPlayerSockets[socket.id] = socket;

  //forward to everyone
  socket.on("event1", function(msg, callback) {
    socket.broadcast.emit("event1", msg);
    console.log("event1 , " + msg);
    if (callback) callback({ ok: true });
  });
  //forward to everyone
  socket.on("event2", function(msg, callback) {
    socket.broadcast.emit("event2", msg);
    console.log("event2 , " + msg);
    if (callback) callback({ ok: true });
  });
  //forward to everyone
  socket.on("event3", function(msg, callback) {
    socket.broadcast.emit("event3", msg);
    console.log("event3 , " + msg);
    if (callback) callback({ ok: true });
  });
  //forward to everyone
  socket.on("event4", function(msg, callback) {
    socket.broadcast.emit("event4", msg);
    console.log("event4 , " + msg);
    if (callback) callback({ ok: true });
  });
  //forward to everyone
  socket.on("event5", function(msg, callback) {
    socket.broadcast.emit("event5", msg);
    console.log("event5 , " + msg);
    if (callback) callback({ ok: true });
  });
  //forward to self
  socket.on("eventPing", function(msg, callback) {
    io.to(socket.id).emit("eventPing", msg);
    console.log("eventPing , " + msg);
    if (callback) callback({ ok: true });
  });

  // io.emit //==> to everyone including sender
  // socket.broadcast.emit //==> to everyone except sender
  // io.to(targetRoom).emit("roommsg", text); //==> send to room
  // io.to(targetSocketID).emit("private", text); //==> send to person (same as room)

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
    if (callback) callback("you said : " + JSON.stringify(msg));
  });

  socket.on("playerControl", function(msg, callback) {
    console.log(socket.id, " said : " + JSON.stringify(msg));
    if (socket.profile && socket.profile.room) {
      socket.to(socket.profile.room).emit("playerControl", msg);

      roomsMetaData[socket.profile.room] = JSON.parse(JSON.stringify(msg));
      console.log(roomsMetaData[socket.profile.room]);
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("setPlayerName", function(msg, callback) {
    let newName = msg.name.trim();
    if (connectedPlayerNames.includes(newName)) {
      if (callback) callback({ ok: false, error: "**name already in use" });
    } else if (newName.length < 5 || newName.length > 30) {
      if (callback)
        callback({
          ok: false,
          error: "**choose name between 5 and 30 characters"
        });
    } else {
      socket.profile = {};
      socket.profile.name = newName;
      connectedPlayerSockets[socket.id] = socket;
      connectedPlayerNames.push(newName);
      if (callback)
        callback({ ok: true, error: "", newName: newName, id: socket.id });

      console.log("###################-- new received a name");
      console.log(socket.id, socket.profile);
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("joinRoom", function(msg, callback) {
    let newRoom = msg.room.trim();
    if (!socket.profile || !socket.profile.name) {
      if (callback)
        callback({
          ok: false,
          error: "**choose a name first, then join a room"
        });
    } else if (newRoom.length < 5 || newRoom.length > 30) {
      if (callback)
        callback({
          ok: false,
          error: "**choose room name between 5 and 30 characters"
        });
    } else {
      let roomExist = false;
      let roomMeta = {};
      if (roomsMetaData[newRoom]) {
        roomExist = true;
        roomMeta = roomsMetaData[newRoom];
      }

      socket.join(newRoom, () => {
        socket.profile.room = newRoom;
        let newMsg = {
          ts: Date.now(),
          from: "system",
          msg: socket.profile.name + " has joined this room",
          color: "red"
        };
        socket.to(newRoom).emit("roomChat", newMsg);

        if (callback)
          callback({
            ok: true,
            error: "",
            newName: socket.profile.name,
            newRoom: newRoom,
            id: socket.id,
            roomMeta: roomMeta
          });
        console.log("###################-- player joined a room");
        console.log(socket.id, socket.profile);
      });
    }
  });

  socket.on("roomChat", function(msg, callback) {
    if (!socket.profile || !socket.profile.room) return;
    msg.ts = Date.now();
    socket.to(socket.profile.room).emit("roomChat", msg);

    if (callback) callback(msg);

    console.log(
      "###################-- message to room : " + socket.profile.room
    );
    console.log(msg);
  });

  socket.on("pinger", function(msg, callback) {
    let isIn = false;
    let name = "";
    let room = "";
    if (socket.profile) {
      name = socket.profile.name;
      room = socket.profile.room;
      isIn = true;
    } else {
    }

    if (callback)
      callback({ isCon: true, isIn: isIn, meta: { name: name, room: room } });
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("disconnect", function() {
    let name = "";
    let room = "";
    if (socket.profile) {
      name = socket.profile.name;
      room = socket.profile.room;
    }
    console.log("###################-- " + socket.id, name, " disconnected ");

    //-- remove name from used names list
    var index = connectedPlayerNames.indexOf(name);
    if (index > -1) {
      connectedPlayerNames.splice(index, 1);
    }
    let newMsg = {
      ts: Date.now(),
      from: "system",
      msg: name + " has left this room",
      color: "red"
    };

    io.to(room).emit("roomChat", newMsg);

    //-- delete player socket
    delete connectedPlayerSockets[socket.id];

    //get all active rooms and remove any meta data of empty room
    var room_list = [];
    for (var oneRoom in io.sockets.adapter.rooms) {
      room_list.push(oneRoom);
    }
    let room_keys = Object.keys(roomsMetaData);

    for (let index = 0; index < room_keys.length; index++) {
      if (room_list.indexOf(room_keys[index]) < 0) {
        delete roomsMetaData[room_keys[index]];
      }
    }
    console.log(
      "###################-- All rooms (after disconnect) " + room_list
    );
    console.log(
      "###################-- All rooms METADATA (after disconnect) " +
        roomsMetaData
    );
  });

  ////////////////////////////////////////////////////////////////////////////////////////
});
