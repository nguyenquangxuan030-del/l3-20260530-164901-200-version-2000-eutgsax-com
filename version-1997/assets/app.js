
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilter();
    bindPlayers();
  });

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = document.querySelector('[data-hero-dots]');
    if (!slides.length || !dotsWrap) {
      return;
    }
    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('button'));
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    start();
  }

  function bindFilter() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    if (!inputs.length || !scopes.length) {
      return;
    }

    function apply(value) {
      var q = String(value || '').trim().toLowerCase();
      scopes.forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          card.classList.toggle('hidden-by-filter', q && haystack.indexOf(q) === -1);
        });
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        apply(input.value);
      });
    });

    document.querySelectorAll('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value') || '';
        inputs.forEach(function (input) {
          input.value = value;
        });
        apply(value);
      });
    });

    document.querySelectorAll('[data-clear-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        inputs.forEach(function (input) {
          input.value = '';
        });
        apply('');
      });
    });
  }

  function bindPlayers() {
    document.querySelectorAll('[data-player-wrap]').forEach(function (wrap) {
      var video = wrap.querySelector('video[data-hls]');
      var button = wrap.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      function activate() {
        var url = video.getAttribute('data-hls');
        if (!url) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', url);
          }
          video.play().catch(function () {});
          wrap.classList.add('is-playing');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!video._streamPlayer) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._streamPlayer = hls;
          }
          video.play().catch(function () {});
          wrap.classList.add('is-playing');
          return;
        }
        if (!video.getAttribute('src')) {
          video.setAttribute('src', url);
        }
        video.play().catch(function () {});
        wrap.classList.add('is-playing');
      }

      button.addEventListener('click', activate);
      video.addEventListener('click', function () {
        if (!wrap.classList.contains('is-playing')) {
          activate();
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
    });
  }
})();
