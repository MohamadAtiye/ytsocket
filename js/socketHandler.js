// var socket = io("http://localhost:3000");
var socket = io("https://ytsocket.herokuapp.com");

document.addEventListener("DOMContentLoaded", () => {

  socket.emit("saySomething", { data: "this is a test" }, function(msg) {
    console.log(msg);
  });

  socket.on("saySomething", function(msg) {
    console.log(msg);
  });

  socket.on("playerControl", function(msg) {
    videoClass.receiveCMD(msg);
  });

  socket.on("roomChat", function(msg) {
    // let eventLog = document.getElementById("eventLog");

    // let newLog = document.createElement("label");
    // newLog.textContent = msg;

    // eventLog.appendChild(newLog);
    // eventLog.appendChild(document.createElement("hr"));
    socialClass.msgReceived(msg);
    console.log(msg)
  });
});