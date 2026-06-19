(function () {
  document.querySelectorAll('.cinema-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var message = player.querySelector('.player-message');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    var showMessage = function () {
      if (message) {
        message.hidden = false;
      }
    };

    var loadVideo = function () {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
        loaded = true;
      } else {
        showMessage();
      }
    };

    var playVideo = function () {
      loadVideo();
      if (!video) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
  });
})();
