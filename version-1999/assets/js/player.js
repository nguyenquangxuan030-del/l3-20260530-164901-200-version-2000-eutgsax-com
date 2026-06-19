function setupMoviePlayer(streamUrl) {
  var video = document.querySelector(".video-player");
  var cover = document.querySelector(".play-cover");
  var started = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attachStream();
    video.setAttribute("controls", "controls");

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (!started) {
      play();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
