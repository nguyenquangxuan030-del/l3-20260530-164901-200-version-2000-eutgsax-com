import { H as Hls } from './hls-vendor.js';

export function initPlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.getElementById('play-cover');
    var hls = null;
    var prepared = false;
    var playWhenReady = false;

    if (!video || !streamUrl) {
        return;
    }

    function hideCover() {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    }

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (playWhenReady) {
                    video.play().catch(function () {});
                }
            });
        }
    }

    function startPlayback() {
        playWhenReady = true;
        prepare();
        hideCover();
        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', hideCover);

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
