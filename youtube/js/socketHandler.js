var socket = io("http://localhost:3000");
// const socket = io("https://ytsocket.herokuapp.com");

document.addEventListener("DOMContentLoaded", () => {

  setInterval(() => {
    let waiter = true;
    socket.emit("pinger",  { data: "this is a test" }, function(msg) {
      // {isCon:true,isIn:isIn,meta:{name:name,room:room}}
      if(msg.isCon){
        if(msg.isIn){
        document.getElementById("conMark").style.background="green";
        }
        else{
          document.getElementById("conMark").style.background="orange";
        }
        waiter = false;
      }else{
        
        document.getElementById("conMark").style.background="red";
      }
    });
    setTimeout(() => {
      if(waiter)document.getElementById("conMark").style.background="red";
    }, 2000);
  }, 5000);

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