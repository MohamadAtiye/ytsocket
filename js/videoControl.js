const INIT_VID_ID = "4p_YY0R8Si0";


// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  console.log("loadInitVideo");

  player = new YT.Player("player", {
    // height: "390",
    // width: "640",
    width: "100%",
    videoId: INIT_VID_ID,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
  try {
    document.getElementById("nowPlayingTitle").textContent =
      player.j.videoData.title;
  } catch (e) { }
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
var videoState = -1;
function onPlayerStateChange(event) {
  console.log("onPlayerStateChange", event);
  //   BUFFERING: 3
  //   CUED: 5
  //   ENDED: 0
  //   PAUSED: 2
  //   PLAYING: 1
  //   UNSTARTED: -1

  if (event.data == YT.PlayerState.PLAYING) {
    if (videoState == YT.PlayerState.PAUSED) videoClass.playVideo();
    videoState = event.data;
  } else if (event.data == YT.PlayerState.PAUSED) {
    videoClass.pauseVideo();
    videoState = event.data;
  } else if (event.data == YT.PlayerState.ENDED) {
    // videoClass.pauseVideo();
    videoState = event.data;
  } else if (event.data == YT.PlayerState.BUFFERING) {
    // videoClass.pauseVideo();
    videoState = event.data;
  } else if (event.data == YT.PlayerState.UNSTARTED) {
    // videoClass.pauseVideo();
    videoState = event.data;
  } else if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
    videoState = event.data;
  }
}
function stopVideo() {
  player.stopVideo();
}

// https://www.youtube.com/results?search_query=keyword2&pbj=1

///////////////////////////////////////////////////////////////////////////////////////////////////
let videoClass = (function () {
  let nowPlaying = INIT_VID_ID;

  let playVideo = () => {
    let VCMD = {
      cmd: "play",
      vts: player.getCurrentTime(),
      vidID: nowPlaying
    }
    player.playVideo();
    socket.emit(
      "playerControl",
      VCMD,
      function (msg) {
        console.log(msg);
      }
    );
  };

  let pauseVideo = () => {
    let VCMD = {
      cmd: "pause",
      vts: player.getCurrentTime(),
      vidID: nowPlaying
    }
    player.pauseVideo();
    socket.emit(
      "playerControl",
      VCMD,
      function (msg) {
        console.log(msg);
      }
    );
  };

  let loadVideo = (argID, isCmd) => {
    console.log("load video", argID);
    let id = "";
    if (argID) {
      id = argID;
    } else {
      let newURL = document.getElementById("videoIDBox").value;
      try {
        var url = new URL(newURL);
        id = url.searchParams.get("v");
      } catch (e) {
        id = newURL;
      }
    }
    let nowPlayingThumbnail = document.getElementById("nowPlayingThumbnail");
    nowPlayingThumbnail.src =
      "https://img.youtube.com/vi/" + id + "/mqdefault.jpg";
    nowPlayingThumbnail.onload = e => {
      console.log("loaded", e);
      if (nowPlayingThumbnail.width === 120) {
        document.getElementById("videoLoadError").textContent =
          "Video not found";
        alert("Error: Invalid video id ", thumnowPlayingThumbnailber.src);
      } else {
        console.log("loading video ", nowPlayingThumbnail.src);
        document.getElementById("videoLoadError").textContent = "";
        player.pauseVideo();
        player.loadVideoById(id);

        nowPlaying = id;

        if (!isCmd) {
          let VCMD = {
            cmd: "play",
            vts: player.getCurrentTime(),
            vidID: nowPlaying
          }
          socket.emit("playerControl", VCMD, function (
            msg
          ) {
            console.log(msg);
          });
        }

        try {
          document.getElementById("nowPlayingTitle").textContent =
            player.j.videoData.title;
        } catch (e) { }
      }
      console.log(nowPlayingThumbnail.src);
    };
  };

  let receiveCMD = msg => {
    // let msg = {
    //   cmd: "pause", 
    //   vts: player.getCurrentTime(), 
    //   vidID: nowPlaying
    // }

    console.log("new cmd received ", msg)
    if (msg.cmd == "play") {
      if (nowPlaying != msg.vidID) {
        loadVideo(msg.vidID, true);
        setTimeout(() => {
          player.playVideo();
          player.seekTo(msg.vts);
        }, 1000);
      } else {
        player.playVideo();
        player.seekTo(msg.meta);
      }
    } else if (msg.cmd == "pause") {
      if (nowPlaying != msg.vidID) {
        loadVideo(msg.vidID, true);
        setTimeout(() => {
          player.pauseVideo();
          player.seekTo(msg.vts);
        }, 1000);
      } else {
        player.pauseVideo();
        player.seekTo(msg.vts);
      }
    } else if (msg.cmd == "load") {
      player.loadVideoById(msg.meta.newURL);
    }
    console.log(msg);
  };

  let searchVideo = args => {
    if (args == -1) {
      let searchDiv = document.getElementById("searchArea");
      searchDiv.innerHTML = "";
      document.getElementById("searchBox").value = "";
    }

    let searchString = document.getElementById("searchBox").value;
    if (searchString.length < 1) {
      console.log("no search string");
      return;
    }

    var xmlhttp = new XMLHttpRequest();
    var url = "getSearch.php?q=" + searchString;

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        try {
          var myArr = JSON.parse(this.responseText);
          displaySearchResults(myArr);
        } catch (e) {
          console.log(e);
          displaySearchResults({ hits: 0, video: [] });
        }
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  };

  let displaySearchResults = json => {
    console.log(json);

    let searchDiv = document.getElementById("searchArea");
    searchDiv.innerHTML = "";

    if (json.hits == 0 || json.video.length == 0) {
      searchDiv.innerHTML = "error occured or no results found";
    } else {
      for (let index = 0; index < json.video.length; index++) {
        let oneRes = document.createElement("div");
        oneRes.style.border = "1px solid black";
        oneRes.style.width = "100%";
        oneRes.style.height = "150px";
        oneRes.style.margin = "10px";
        oneRes.style.display = "flex";

        let id = json.video[index].encrypted_id;
        oneRes.value = id;
        oneRes.onclick = () => {
          loadVideo(id);
        };

        let thumb = document.createElement("img");
        thumb.style.flex = "1";
        thumb.src = json.video[index].thumbnail;
        oneRes.appendChild(thumb);

        let meta = document.createElement("div");
        meta.style.height = "100%";
        meta.style.flex = "2";
        meta.style.padding = "5px";

        let title = document.createElement("h4");
        title.style.margin = "10px 0";
        title.textContent = json.video[index].title;
        meta.appendChild(title);

        let info = document.createElement("label");
        info.textContent =
          json.video[index].author +
          ", " +
          json.video[index].views +
          " view, " +
          json.video[index].added;
        meta.appendChild(info);

        let desc = document.createElement("p");
        desc.textContent = json.video[index].description;
        meta.appendChild(desc);

        oneRes.appendChild(meta);

        searchDiv.appendChild(oneRes);
      }
    }
  };
  return {
    playVideo: playVideo,
    pauseVideo: pauseVideo,

    loadVideo: loadVideo,

    receiveCMD: receiveCMD,
    searchVideo: searchVideo
  };
})();
