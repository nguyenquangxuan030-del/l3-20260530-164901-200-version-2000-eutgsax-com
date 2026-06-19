(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAuto();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAuto();
      });
    }

    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    showSlide(0);
    startAuto();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-select]'));
    var reset = filterPanel.querySelector('[data-filter-reset]');
    var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput && !searchInput.value) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' '));

        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedFilters = Object.keys(filters).every(function (key) {
          return !filters[key] || normalize(item.getAttribute('data-' + key)) === filters[key];
        });

        item.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedFilters));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        selects.forEach(function (select) {
          select.value = '';
        });

        applyFilter();
      });
    }

    applyFilter();
  }

  function initPlayer(playerBox) {
    var video = playerBox.querySelector('video');
    var overlay = playerBox.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (!source || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        video.setAttribute('data-ready', '1');
        setStatus('已加载');
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-ready', '1');
        setStatus('已加载');
      } else {
        video.src = source;
        video.setAttribute('data-ready', '1');
        setStatus('正在连接');
      }
    }

    function playVideo() {
      attachSource();
      var promise = video.play();

      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击视频继续播放');
        });
      } else if (overlay) {
        overlay.classList.add('hidden');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });

    video.addEventListener('error', function () {
      setStatus('正在连接');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-box]')).forEach(initPlayer);
})();
