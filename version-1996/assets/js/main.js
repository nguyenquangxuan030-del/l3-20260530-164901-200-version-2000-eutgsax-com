(function() {
  function $(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setHeader() {
    var header = document.querySelector('.site-header');
    if (!header) {
      return;
    }
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    if (!button) {
      return;
    }
    button.addEventListener('click', function() {
      document.body.classList.toggle('menu-open');
    });
    $('.mobile-panel a').forEach(function(link) {
      link.addEventListener('click', function() {
        document.body.classList.remove('menu-open');
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $('.hero-slide', hero);
    var dots = $('.hero-dot', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
        play();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    $('[data-filter-scope]').forEach(function(scope) {
      var input = scope.querySelector('[data-search-input]');
      var chips = $('[data-filter-value]', scope);
      var cards = $('[data-card]', scope);
      var empty = scope.querySelector('[data-empty-state]');
      var active = 'all';

      function apply() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function(card) {
          var meta = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-meta'),
            card.getAttribute('data-category')
          ].join(' '));
          var category = normalize(card.getAttribute('data-category'));
          var matchesQuery = !query || meta.indexOf(query) !== -1;
          var matchesFilter = active === 'all' || category.indexOf(active) !== -1 || meta.indexOf(active) !== -1;
          var isVisible = matchesQuery && matchesFilter;
          card.style.display = isVisible ? '' : 'none';
          if (isVisible) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          active = normalize(chip.getAttribute('data-filter-value')) || 'all';
          chips.forEach(function(item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setHeader();
    initMenu();
    initHero();
    initFilters();
  });

  window.addEventListener('scroll', setHeader, { passive: true });
})();
