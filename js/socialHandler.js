let socialClass = (function () {
  let myProfile = {};



  let tr_name_1, tr_name_2;

  let tr_room_1, tr_room_2, tr_room_3;
  //on loaded, find needed elements, create set name interface
  document.addEventListener("DOMContentLoaded", () => {
    tr_name_1 = document.getElementById("tr_name_1");
    tr_name_2 = document.getElementById("tr_name_2");

    tr_room_1 = document.getElementById("tr_room_1");
    tr_room_2 = document.getElementById("tr_room_2");
    tr_room_3 = document.getElementById("tr_room_3");
    createSetNameInterface();
  });




  //-- step 1, create set name interface
  let nameBox;
  let createSetNameInterface = () => {

    //clear all
    tr_name_1.innerHTML = "";
    tr_name_2.innerHTML = "";

    //label
    let td1 = document.createElement("td");
    td1.textContent = "Choose a name";
    td1.colSpan = 1;
    tr_name_1.appendChild(td1);

    //box
    let td2 = document.createElement("td");
    td2.colSpan = 1;
    nameBox = document.createElement("input");
    nameBox.type = "text";
    nameBox.style.width = "100%";
    nameBox.maxLength = 30;
    nameBox.onkeyup = (event) => {
      if (event.keyCode === 13) {
        setName();
      }
    }
    td2.appendChild(nameBox);
    tr_name_1.appendChild(td2);
    nameBox.focus();

    //button
    let td3 = document.createElement("td");
    let button = document.createElement("button");
    button.textContent = "Set Name";
    button.onclick = e => {
      setName();
    };
    td3.appendChild(button);
    tr_name_1.appendChild(td3);

    //error line
    let tdE = document.createElement("td");
    tdE.colSpan = 3;
    tdE.style.color = "red";
    tr_name_2.appendChild(tdE);
  }

  //-- step 2, set the name and change interface
  let setName = () => {
    let boxName = nameBox.value.trim();
    if (boxName.length < 5 || boxName.length > 30) {
      nameBox.style.borderColor = "red";
      tr_name_2.firstChild.innerHTML =
        "**choose name between 5 and 30 characters";
        nameBox.focus();
      return false;
    } else {
      socket.emit("setPlayerName", { name: boxName }, function (msg) {
        console.log(msg);
        if (msg.ok) {
          myProfile.name = msg.newName;
          myProfile.id = msg.id;

          tr_name_1.innerHTML =
            "<td>Welcome, <strong>" + myProfile.name + "</strong><td>";
          tr_name_2.innerHTML = "";

          console.log(myProfile);
          createJoinRoomInterface();

        } else {
          nameBox.style.borderColor = "red";
          tr_name_2.firstChild.innerHTML = msg.error;
          nameBox.focus();
        }
      });
    }
  };

  //-- step 3, create join a room interface
  let roombox;
  let createJoinRoomInterface = () => {

    //clear all
    tr_room_1.innerHTML = "";
    tr_room_2.innerHTML = "";
    tr_room_3.innerHTML = "";

    //label
    let td1 = document.createElement("td");
    td1.textContent = "join/create a room";
    tr_room_2.appendChild(td1);

    //box
    let td2 = document.createElement("td");
    roombox = document.createElement("input");
    roombox.type = "text";
    roombox.style.width = "100%";
    roombox.maxLength = 30;
    roombox.onkeyup = (event) => {
      if (event.keyCode === 13) {
        joinRoom(roombox.value.trim());
      }
    }
    td2.appendChild(roombox);
    tr_room_2.appendChild(td2);
    roombox.focus();

    //button
    let td3 = document.createElement("td");
    let button = document.createElement("button");
    button.textContent = "Join Room";
    button.onclick = e => {
      joinRoom(roombox.value.trim());
    };
    td3.appendChild(button);
    tr_room_2.appendChild(td3);

    //error line
    let tdE = document.createElement("td");
    tdE.colSpan = 3;
    tdE.style.color = "red";
    tr_room_3.appendChild(tdE);
  };

  //-- step 4, join a room and change interface
  let joinRoom = which => {
    if (which.length < 5 || which.length > 30) {
      roombox.style.borderColor = "red";
      tr_room_3.firstChild.innerHTML =
        "**choose room name between 5 and 30 characters";
        roombox.focus();
      return false;
    } else {
      socket.emit("joinRoom", { room: which }, function (msg) {
        console.log(msg);
        if (msg.ok) {
          myProfile.name = msg.newName;
          myProfile.id = msg.id;
          myProfile.room = msg.newRoom;

          tr_room_1.innerHTML =
            '<td colspan="3">You are now in Room: <strong>' +
            myProfile.room +
            "</strong><td>";

          tr_room_2.innerHTML = "";
          tr_room_3.innerHTML = "";

          console.log(myProfile);
          createChatInterface();

          if(msg.roomMeta){
            videoClass.receiveCMD(msg.roomMeta);
          }
        } else {
          roombox.style.borderColor = "red";
          tr_room_3.firstChild.innerHTML = msg.error;
          roombox.focus();
        }
      });
    }
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
    chatInput.onkeyup = (event) => {
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
    eventLog.style.boxSizing = "border-box";

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

    socket.emit("roomChat", newMsg, function (msg) { 
      displayMessage(msg, true);
      chatInput.value = "";
      chatInput.focus();
    });

  };

  let missedCalls = [];
  let msgReceived = msg => {
    let eventLog = document.getElementById("eventLog");
    if (!eventLog) {
      missedCalls.push(msg);
      return;
    }
    displayMessage(msg);
  };

  let displayMessage = (args, fromMe) => {
    let newLog = document.createElement("label");
    let f = new Date(args.ts)
    let str = f.getHours()+":"+f.getMinutes()+":"+f.getSeconds();
    if (fromMe) {
      args.from = "Me";
    }
    newLog.textContent = "( at "+str +" ) "+args.from + " : " + args.msg;
    if (args.color) {
      newLog.style.color = args.color;
    }

    eventLog.insertBefore(document.createElement("hr"), eventLog.childNodes[0]);
    eventLog.insertBefore(newLog, eventLog.childNodes[0]);
  };

  return {
    msgReceived: msgReceived
  };
})();
