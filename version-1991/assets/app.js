(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.hasAttribute('hidden');
      if (open) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      var target = document.getElementById(id);
      if (!target) {
        return;
      }
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
      target.scrollBy({ left: direction * 420, behavior: 'smooth' });
    });
  });

  var filterList = document.querySelector('.filter-list');
  if (filterList) {
    var searchInput = document.querySelector('.page-filter');
    var typeFilter = document.querySelector('.type-filter');
    var yearFilter = document.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card-text]'));

    var applyFilters = function () {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-card-text') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }

        card.classList.toggle('filter-hidden', !visible);
      });
    };

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  var results = document.getElementById('search-results');
  if (results && window.MOVIES) {
    var summary = document.getElementById('search-summary');
    var input = document.getElementById('search-input');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    var normalize = function (value) {
      return String(value || '').toLowerCase();
    };

    var renderCard = function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="movie-thumb" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="play-mark">▶</span>' +
        '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
        '<span class="movie-duration">' + escapeHtml(movie.duration) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-tags">' + tags + '</div>' +
        '<div class="movie-meta"><span>★ ' + movie.rating + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '</div>' +
        '</article>';
    };

    var runSearch = function (value) {
      var keyword = normalize(value).trim();
      var pool = window.MOVIES;
      var matched = keyword ? pool.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + (movie.tags || []).join(' ') + ' ' + movie.oneLine).indexOf(keyword) !== -1;
      }) : pool.slice(0, 24);

      results.innerHTML = matched.slice(0, 96).map(renderCard).join('');
      if (summary) {
        summary.textContent = keyword ? '搜索结果：' + value : '精选推荐';
      }
    };

    runSearch(query);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
