(function () {
    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function setupFilters() {
        var input = document.querySelector('[data-search-input]');
        var year = document.querySelector('[data-filter-year]');
        var type = document.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        if (!cards.length) {
            return;
        }

        if (input && input.hasAttribute('data-autofocus-from-query')) {
            var query = readQuery();
            if (query) {
                input.value = query;
            }
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';

            cards.forEach(function (card) {
                var text = card.getAttribute('data-index-text') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !yearValue || cardYear === yearValue;
                var matchedType = !typeValue || cardType === typeValue;
                card.classList.toggle('is-filtered', !(matchedKeyword && matchedYear && matchedType));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (year) {
            year.addEventListener('change', apply);
        }

        if (type) {
            type.addEventListener('change', apply);
        }

        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
}());
