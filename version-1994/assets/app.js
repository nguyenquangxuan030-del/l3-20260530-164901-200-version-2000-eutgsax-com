const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenu() {
  const toggle = qs('[data-menu-toggle]');
  const nav = qs('[data-mobile-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHero() {
  const hero = qs('[data-hero]');
  if (!hero) return;
  const slides = qsa('[data-hero-slide]', hero);
  const dots = qsa('[data-hero-dot]', hero);
  const prev = qs('[data-hero-prev]', hero);
  const next = qs('[data-hero-next]', hero);
  if (!slides.length) return;
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5000);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function setupFilters() {
  qsa('[data-filter-scope]').forEach((scope) => {
    const input = qs('[data-filter-input]', scope);
    const year = qs('[data-filter-year]', scope);
    const cards = qsa('[data-card]', scope);
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');
    if (initial && input) input.value = initial;

    const apply = () => {
      const keyword = (input?.value || '').trim().toLowerCase();
      const yearValue = year?.value || '';
      cards.forEach((card) => {
        const haystack = card.dataset.search || '';
        const cardYear = card.dataset.year || '';
        const okKeyword = !keyword || haystack.includes(keyword);
        const okYear = !yearValue || cardYear === yearValue;
        card.classList.toggle('is-filtered-out', !(okKeyword && okYear));
      });
    };

    input?.addEventListener('input', apply);
    year?.addEventListener('change', apply);
    apply();
  });
}

let HlsClassPromise = null;

async function getHlsClass() {
  if (window.Hls) return window.Hls;
  if (!HlsClassPromise) {
    HlsClassPromise = import('./hls-vendor.js').then((mod) => mod.H || window.Hls).catch(() => null);
  }
  return HlsClassPromise;
}

async function attachStream(video) {
  if (!video || video.dataset.ready === '1') return;
  const src = video.getAttribute('data-src');
  if (!src) return;
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.dataset.ready = '1';
    return;
  }
  const Hls = await getHlsClass();
  if (Hls && Hls.isSupported && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    video.dataset.ready = '1';
    return;
  }
  video.src = src;
  video.dataset.ready = '1';
}

function setupPlayers() {
  qsa('[data-player]').forEach((shell) => {
    const video = qs('.js-player', shell);
    const button = qs('[data-play-button]', shell);
    const play = async () => {
      await attachStream(video);
      button?.classList.add('is-hidden');
      try {
        await video.play();
      } catch (error) {
        button?.classList.remove('is-hidden');
      }
    };
    button?.addEventListener('click', play);
    video?.addEventListener('click', async () => {
      if (video.paused) await play();
    });
    video?.addEventListener('play', () => button?.classList.add('is-hidden'));
    video?.addEventListener('pause', () => {
      if (!video.ended) button?.classList.remove('is-hidden');
    });
  });
}

setupMenu();
setupHero();
setupFilters();
setupPlayers();
