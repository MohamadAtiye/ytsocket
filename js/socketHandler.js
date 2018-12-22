// var socket = io("http://localhost:3000");
const socket = io("https://ytsocket.herokuapp.com");

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
    socialClass.msgReceived(msg);
    console.log(msg)
  });
});