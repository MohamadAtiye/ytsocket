let socialClass = (function() {
  let myProfile = {};

  let setName = () => {
    let boxName = document.getElementById("chosenNameBox").value.trim();
    if (boxName.length < 5 || boxName.length > 30) {
      document.getElementById("chosenNameBox").style.borderColor = "red";

      document.getElementById("error_name").textContent =
        "**choose name between 5 and 30 characters";
      return false;
    } else {
      socket.emit("setPlayerName", { name: boxName }, function(msg) {
        console.log(msg);
        if (msg.ok) {
          myProfile.name = msg.newName;
          myProfile.id = msg.id;

          document.getElementById("tr_name_1").innerHTML =
            "<td>Welcome, <strong>" + myProfile.name + "</strong><td>";
          document.getElementById("tr_name_2").remove();

          console.log(myProfile);

          createJoinRoomInterface();
        } else {
          document.getElementById("chosenNameBox").style.borderColor = "red";
          document.getElementById("error_name").textContent = msg.error;
        }
      });
    }
  };

  let joinRoom = which => {
    if (which.length < 5 || which.length > 30) {
      document.getElementById("chosenRoomBox").style.borderColor = "red";
      document.getElementById("error_room").textContent =
        "**choose room name between 5 and 30 characters";
      return false;
    } else {
      socket.emit("joinRoom", { room: which }, function(msg) {
        console.log(msg);
        if (msg.ok) {
          myProfile.name = msg.newName;
          myProfile.id = msg.id;
          myProfile.room = msg.newRoom;

          document.getElementById("tr_room_1").innerHTML =
            '<td colspan="3">You are now in Room: <strong>' +
            myProfile.room +
            "</strong><td>";
          document.getElementById("tr_room_2").remove();
          document.getElementById("tr_room_3").remove();

          console.log(myProfile);
          createChatInterface();
        } else {
          document.getElementById("chosenRoomBox").style.borderColor = "red";
          document.getElementById("error_room").textContent = msg.error;
        }
      });
    }
  };

  let createJoinRoomInterface = () => {
    let tr_room_2 = document.getElementById("tr_room_2"); //==> tr

    let td1 = document.createElement("td");
    td1.textContent = "join/create a room";
    tr_room_2.appendChild(td1);

    let td2 = document.createElement("td");
    let input = document.createElement("input");
    input.type = "text";
    input.id = "chosenRoomBox";
    td2.appendChild(input);
    tr_room_2.appendChild(td2);

    let td3 = document.createElement("td");
    let button = document.createElement("button");
    button.textContent = "Join Room";
    button.onclick = e => {
      joinRoom(document.getElementById("chosenRoomBox").value.trim());
    };
    td3.appendChild(button);
    tr_room_2.appendChild(td3);

    let tr_room_3 = document.getElementById("tr_room_3"); //==> tr
    let tdE = document.createElement("td");
    tdE.colSpan = 3;
    tdE.id = "error_room";
    tdE.style.color = "red";
    tr_room_3.appendChild(tdE);
  };

  let chatInput;
  let createChatInterface = () => {
    let tr_log_1 = document.getElementById("tr_log_1");
    tr_log_1.innerHTML = "";

    let td1 = document.createElement("td");
    td1.colSpan = 2;
    chatInput = document.createElement("input");
    chatInput.type = "text";
    chatInput.style.width = "100%";
    chatInput.maxLength = 200;
    chatInput.onkeyup = (event)=>{
        if (event.keyCode === 13) {
            sendRoomMessage();
        }
    }
    td1.appendChild(chatInput);

    let td2 = document.createElement("td");
    td2.colSpan = 1;
    let button = document.createElement("button");
    button.style.width = "100%";
    button.textContent = "Send";
    button.onclick = sendRoomMessage;
    td2.appendChild(button);

    tr_log_1.appendChild(td1);
    tr_log_1.appendChild(td2);
    //////////////////////////////////
    let tr_log_2 = document.getElementById("tr_log_2");
    tr_log_2.innerHTML = "";
    let tdL = document.createElement("td");
    tdL.colSpan = 3;

    let eventLog = document.createElement("div");
    eventLog.id = "eventLog";
    eventLog.style.width = "100%";
    eventLog.style.maxHeight = "250px";
    eventLog.style.minHeight = "100px";
    eventLog.style.overflowY = "scroll";
    eventLog.style.border = "1px solid black";
    eventLog.style.padding = "10px";
    eventLog.style.boxSizing =  "border-box";

    tdL.appendChild(eventLog);
    tr_log_2.appendChild(tdL);

    if (missedCalls.length > 0) {
      console, log("have missed messaged ", missedCalls);
      for (let index = 0; index < missedCalls.length; index++) {
        msgReceived(missedCalls[index]);
      }
      missedCalls = [];
    }
  };

  let sendRoomMessage = () => {
    let msg = chatInput.value.trim();
    if (msg.length == 0 || msg.length > 200) return;

    let newMsg = { msg: msg, from: myProfile.name };

    socket.emit("roomChat", newMsg, function(msg) {});
    insertMsg(newMsg, true);

    chatInput.value = "";
    chatInput.focus();
  };

  let missedCalls = [];
  let msgReceived = msg => {
    let eventLog = document.getElementById("eventLog");
    if (!eventLog) {
      missedCalls.push(msg);
      return;
    }

    insertMsg(msg);
  };

  let insertMsg = (args, fromMe) => {
    let newLog = document.createElement("label");
    console.log(args.ts);
    if (fromMe) {
      args.from = "Me";
    }
    newLog.textContent = args.from + " : " + args.msg;
    if (args.color) {
      newLog.style.color = args.color;
    }

    eventLog.insertBefore(document.createElement("hr"), eventLog.childNodes[0]);
    eventLog.insertBefore(newLog, eventLog.childNodes[0]);
  };

  return {
    setName: setName,
    // joinRoom: joinRoom,
    msgReceived: msgReceived
  };
})();
