

///////////////////////////////////////////////////////////////////////////////////////////////////
let videoClass = (function () {

  document.addEventListener("DOMContentLoaded", () => {
    init();
  });



  let nowPlaying = "myVideo";


  let myVideoPlayer, playVideoBtn, pauseVideoBtn;
  let currentVideoTime, fullVideoTime, videoTimeCanvas, videoTimeContext;
  let timeBarH = 20;
  let timeBarW = 200;

  let nowPlayingTitle,videoControlsDiv;

  let seeking = false;
  let seekX = 0;
  let init = () => {
    myVideoPlayer = document.getElementById("myVideoPlayer");

    playVideoBtn = document.getElementById("playVideoBtn");
    playVideoBtn.onclick = (e) => {
      playVideo();
    }
    pauseVideoBtn = document.getElementById("pauseVideoBtn");
    pauseVideoBtn.onclick = (e) => {
      pauseVideo();
    }

    let goBack10Btn = document.getElementById("goBack10Btn");
    goBack10Btn.onclick = ()=>{
      myVideoPlayer.currentTime -=10;
    }

    let goFront10Btn = document.getElementById("goFront10Btn");
    goFront10Btn.onclick = ()=>{
      myVideoPlayer.currentTime +=10;
    }

    myVideoPlayer.controls = false;

    nowPlayingTitle = document.getElementById("nowPlayingTitle");
    videoControlsDiv = document.getElementById("videoControlsDiv");



    currentVideoTime = document.getElementById("currentVideoTime");
    fullVideoTime = document.getElementById("fullVideoTime");
    videoTimeCanvas = document.getElementById("videoTimeCanvas");
    videoTimeCanvas.onmousedown = (event) => {
      event.preventDefault();
      seeking = true;
      seekX =
        // (event.layerX * videoTimeCanvas.width) / videoTimeCanvas.offsetWidth;
        event.offsetX  / videoTimeCanvas.offsetWidth;
      let res = seekX * myVideoPlayer.duration.toFixed(1);
      myVideoPlayer.currentTime = res;
      sendSeekCMD();
    }
    // videoTimeCanvas.onmousemove = (event) => {
    //   event.preventDefault();
    //   if (seeking) {
    //     seekX =
    //       // (event.layerX * videoTimeCanvas.width) / videoTimeCanvas.offsetWidth;
    //       (event.offsetX / videoTimeCanvas.offsetWidth);
    //     // console.log(event,event.offsetX,seekX);
    //     let res = seekX * myVideoPlayer.duration.toFixed(1);
    //     myVideoPlayer.currentTime = res;
    //     sendSeekCMD();
    //   }
    // }
    // videoTimeCanvas.onmouseleave = (e)=>{

    // }
    document.onmouseup = (e) => {
      seeking = false;
    }
    videoTimeCanvas.height = timeBarH;
    videoTimeCanvas.width = timeBarW;
    videoTimeContext = videoTimeCanvas.getContext("2d");

    updateTimeLine();

    // myVideoPlayer.addEventListener("seeked", function() { 
    // }, true);

  }


  let lastAttepmt = 0;
  let sendSeekCMD = (res) => {
    let now = Date.now();
    if (now - lastAttepmt < 333) {
      setTimeout(() => {
      }, 222);
      return;
    }

    lastAttepmt=now;

    playVideo();
  }
  
  let updateTimeLine = () => {

    let now = myVideoPlayer.currentTime.toFixed(1);
    let all = myVideoPlayer.duration.toFixed(1);

    currentVideoTime.textContent = now;
    fullVideoTime.textContent = all;


    videoTimeContext.beginPath();
    videoTimeContext.fillStyle = "green";
    videoTimeContext.rect(0, 0, timeBarW, timeBarH);
    videoTimeContext.fill();

    let percent = (now / all) * timeBarW;

    videoTimeContext.beginPath();
    videoTimeContext.fillStyle = "red";
    videoTimeContext.rect(0, 0, percent, timeBarH);
    videoTimeContext.fill();

    letVideoState = myVideoPlayer.readyState;
    nowPlayingTitle.textContent = letVideoState;
    if(letVideoState!=4){
      videoControlsDiv.style.display = "none";
    }
    else{
      videoControlsDiv.style.display = "block";
    }

    requestAnimationFrame(updateTimeLine);
  }


  let playVideo = () => {
    myVideoPlayer.play();
    myVideoPlayer.volume = 1;
    myVideoPlayer.controls = false;
    let VCMD = {
      cmd: "play",
      vts: myVideoPlayer.currentTime,
      vidID: nowPlaying
    }
    socket.emit(
      "playerControl",
      VCMD,
      function (msg) {
        console.log(msg);
      }
    );
    console.log("sent playVideo msg", VCMD);
  };

  let pauseVideo = () => {
    myVideoPlayer.pause();
    myVideoPlayer.volume = 1;
    myVideoPlayer.controls = false;
    let VCMD = {
      cmd: "pause",
      vts: myVideoPlayer.currentTime,
      vidID: nowPlaying
    }
    socket.emit(
      "playerControl",
      VCMD,
      function (msg) {
        console.log(msg);
      }
    );
    console.log("sent pauseVideo msg", VCMD);
  };

  // let loadVideo = (argID, isCmd) => {
  //   console.log("load video", argID);
  //   let id = "";
  //   if (argID) {
  //     id = argID;
  //   } else {
  //     let newURL = document.getElementById("videoIDBox").value;
  //     try {
  //       var url = new URL(newURL);
  //       id = url.searchParams.get("v");
  //     } catch (e) {
  //       id = newURL;
  //     }
  //   }
  //   let nowPlayingThumbnail = document.getElementById("nowPlayingThumbnail");
  //   nowPlayingThumbnail.src =
  //     "https://img.youtube.com/vi/" + id + "/mqdefault.jpg";
  //   nowPlayingThumbnail.onload = e => {
  //     console.log("loaded", e);
  //     if (nowPlayingThumbnail.width === 120) {
  //       document.getElementById("videoLoadError").textContent =
  //         "Video not found";
  //       alert("Error: Invalid video id ", thumnowPlayingThumbnailber.src);
  //     } else {
  //       console.log("loading video ", nowPlayingThumbnail.src);
  //       document.getElementById("videoLoadError").textContent = "";
  //       player.pauseVideo();
  //       player.loadVideoById(id);

  //       nowPlaying = id;

  //       if (!isCmd) {
  //         let VCMD = {
  //           cmd: "play",
  //           vts: player.getCurrentTime(),
  //           vidID: nowPlaying
  //         }
  //         socket.emit("playerControl", VCMD, function (
  //           msg
  //         ) {
  //           console.log(msg);
  //         });
  //       }

  //       try {
  //         document.getElementById("nowPlayingTitle").textContent =
  //           player.j.videoData.title;
  //       } catch (e) { }
  //     }
  //     console.log(nowPlayingThumbnail.src);
  //   };
  // };

  let receiveCMD = msg => {
    // let msg = {
    //   cmd: "pause", 
    //   vts: myVideoPlayer.getCurrentTime(), 
    //   vidID: nowPlaying
    // }

    console.log("new cmd received ", msg)

    if (msg.cmd == "play") {
      if (nowPlaying != msg.vidID) {
        // loadVideo(msg.vidID, true);
        // setTimeout(() => {
        //   myVideoPlayer.play();
        //   myVideoPlayer.volume = 1;
        //   myVideoPlayer.currentTime = msg.vts;
        // }, 1000);
      } else {
        myVideoPlayer.play();
        myVideoPlayer.volume = 1;
        myVideoPlayer.currentTime = msg.vts;
      }
    } else if (msg.cmd == "pause") {
      if (nowPlaying != msg.vidID) {
        // loadVideo(msg.vidID, true);
        // setTimeout(() => {
        //   myVideoPlayer.pause();
        //   myVideoPlayer.currentTime = msg.vts;
        // }, 1000);
      } else {
        myVideoPlayer.pause();
        myVideoPlayer.currentTime = msg.vts;
      }
    } else if (msg.cmd == "load") {
      player.loadVideoById(msg.meta.newURL);
    }
    console.log(msg);
  };


  return {
    playVideo: playVideo,
    pauseVideo: pauseVideo,

    // loadVideo: loadVideo,

    receiveCMD: receiveCMD
  };
})();
