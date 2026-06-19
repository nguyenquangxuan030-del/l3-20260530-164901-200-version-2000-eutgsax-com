(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  const menuButton = qs('[data-menu-toggle]');
  const mobileNav = qs('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const heroSlides = qsa('[data-hero-slide]');
  const dotBox = qs('[data-hero-dots]');
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    qsa('.hero-dot', dotBox).forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  if (heroSlides.length && dotBox) {
    heroSlides.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', '切换推荐影片');
      dot.addEventListener('click', function () {
        showHero(i);
        if (heroTimer) {
          clearInterval(heroTimer);
        }
        heroTimer = setInterval(function () {
          showHero(heroIndex + 1);
        }, 5200);
      });
      dotBox.appendChild(dot);
    });
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  const localFilter = qs('[data-local-filter]');
  const localCards = qsa('[data-card]');

  if (localFilter && localCards.length) {
    localFilter.addEventListener('input', function () {
      const value = localFilter.value.trim().toLowerCase();
      localCards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.year || '',
          card.dataset.region || '',
          card.dataset.genre || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden', value && haystack.indexOf(value) === -1);
      });
    });
  }

  const searchInput = qs('[data-site-search]');
  const searchResults = qs('[data-search-results]');

  if (searchInput && searchResults && Array.isArray(window.SITE_SEARCH_INDEX || SITE_SEARCH_INDEX)) {
    const data = window.SITE_SEARCH_INDEX || SITE_SEARCH_INDEX;
    searchInput.addEventListener('input', function () {
      const value = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (!value) {
        searchResults.classList.remove('open');
        return;
      }
      const matched = data.filter(function (item) {
        return [item.t, item.y, item.g, item.r].join(' ').toLowerCase().indexOf(value) !== -1;
      }).slice(0, 10);
      matched.forEach(function (item) {
        const a = document.createElement('a');
        a.className = 'search-result';
        a.href = item.u;
        a.innerHTML = '<img src="' + item.c + '" alt="' + item.t.replace(/"/g, '&quot;') + '"><span><strong>' + item.t + '</strong><span>' + item.y + ' · ' + item.g + '</span></span>';
        searchResults.appendChild(a);
      });
      searchResults.classList.toggle('open', matched.length > 0);
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-search-box]')) {
        searchResults.classList.remove('open');
      }
    });
  }

  qsa('[data-player]').forEach(function (box) {
    const video = qs('video', box);
    const cover = qs('.player-cover', box);
    const src = box.getAttribute('data-hls');
    let hls = null;

    function attach() {
      if (!video || !src) {
        return;
      }
      if (video.src) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (cover && video) {
      cover.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
      });
    }
  });
})();
