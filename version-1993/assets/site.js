(function () {
  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-hero-thumb]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    play();
  }

  function setupLocalFilters() {
    var input = document.querySelector("[data-local-filter]");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.classList.toggle("hidden-card", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var stream = player.getAttribute("data-stream");
      var starter = player.querySelector("[data-player-start]");
      var overlay = player.querySelector("[data-player-overlay]");
      var loaded = false;
      var hlsInstance = null;

      function start() {
        if (!video || !stream) {
          return;
        }
        player.classList.add("is-playing");
        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
          video.load();
          return;
        }
        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            return;
          }
          video.src = stream;
          video.play().catch(function () {});
        }).catch(function () {
          video.src = stream;
          video.play().catch(function () {});
        });
      }

      if (starter) {
        starter.addEventListener("click", function (event) {
          event.stopPropagation();
          start();
        });
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (loaded) {
            player.classList.remove("is-playing");
          }
        });
        window.addEventListener("pagehide", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + escapeHtml(item.href) + "\" title=\"" + escapeHtml(item.title) + "\">",
      "<div class=\"card-poster\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"card-badge\">" + escapeHtml(item.category) + "</span>",
      "<span class=\"play-dot\">▶</span>",
      "</div>",
      "<div class=\"card-content\">",
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span><span>评分 " + escapeHtml(item.rating) + "</span></div>",
      "<h2>" + escapeHtml(item.title) + "</h2>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var form = document.querySelector("[data-search-form]");
    var status = document.querySelector("[data-search-status]");
    if (!results || !input || !window.__MOVIE_INDEX__) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function apply(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        status.textContent = "热门推荐";
        return;
      }
      var matched = window.__MOVIE_INDEX__.filter(function (item) {
        return item.keywords.indexOf(keyword) !== -1;
      }).slice(0, 80);
      status.textContent = "搜索结果：" + query;
      results.innerHTML = matched.length ? matched.map(renderSearchCard).join("") : "<p class=\"search-empty\">未找到匹配影片</p>";
    }

    if (initial) {
      apply(initial);
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.pushState({}, "", url);
        apply(query);
      });
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
