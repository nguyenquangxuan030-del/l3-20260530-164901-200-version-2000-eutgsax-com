(function() {
  function initPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.player-start');
    var source = player.getAttribute('data-stream');
    var attached = false;
    var instance = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.ERROR, function(event, data) {
          if (!data || !data.fatal || !instance) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            instance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            instance.recoverMediaError();
          } else {
            instance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
      if (!attached) {
        start();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (instance) {
        instance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
  });
})();
