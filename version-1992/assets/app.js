(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
      thumbs.forEach(function (thumb, pos) {
        thumb.classList.toggle('is-active', pos === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setActive(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-card-search]');
      var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty]');
      var activeCategory = 'all';

      if (scope.hasAttribute('data-query-page') && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var category = card.getAttribute('data-category') || '';
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchCategory = activeCategory === 'all' || category === activeCategory;
          var show = matchQuery && matchCategory;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeCategory = chip.getAttribute('data-filter-chip') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
      }

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var source = shell.getAttribute('data-video-src');
      var prepared = false;
      var hls = null;

      if (!video || !button || !source) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        shell.classList.add('is-playing');
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
