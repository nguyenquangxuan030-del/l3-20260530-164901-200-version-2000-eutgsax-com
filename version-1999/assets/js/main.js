(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-index]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    var heroTotal = dots.length || slides.length;
    heroIndex = (index + heroTotal) % heroTotal;

    slides.forEach(function (slide) {
      slide.classList.toggle("is-active", Number(slide.getAttribute("data-hero-index")) === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("#movieFilterInput");
  var typeFilter = document.querySelector("#typeFilter");
  var yearFilter = document.querySelector("#yearFilter");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(filterInput ? filterInput.value : "");
    var typeValue = normalize(typeFilter ? typeFilter.value : "");
    var yearValue = normalize(yearFilter ? yearFilter.value : "");

    filterCards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var typeMatch = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
      var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = typeMatch && yearMatch && keywordMatch ? "" : "none";
    });
  }

  if (filterInput) {
    var query = new URLSearchParams(window.location.search).get("q");
    if (query) {
      filterInput.value = query;
    }
    filterInput.addEventListener("input", applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilters);
  }

  if (filterCards.length) {
    applyFilters();
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
