// RawReplay audio source picker (Friday fallback). Free, no build step.
// Given a PeerTube video object (GET /api/v1/videos/<uuid>), plays it in a plain <audio> element:
//   Plan A: a plain file from video.files[] (web videos on)            -> audio.src = fileUrl
//   Plan B: HLS from video.streamingPlaylists[0]                         -> Safari/iOS play .m3u8 natively,
//                                                                          others load hls.light.min.js (MIT) on demand
//   Neither works                                                        -> onError message, no crash
(function () {
  var HLS_JS = "hls.light.min.js?v=1", hlsLoading = null, current = null;
  function pickFile(v) {
    var f = (v.files || []).slice().sort(function (a, b) { return (a.size || 0) - (b.size || 0); });
    return f.length ? f[0].fileUrl : null;              // smallest file = audio-only or lowest res
  }
  function pickHls(v) { var p = (v.streamingPlaylists || [])[0]; return p ? p.playlistUrl : null; }
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    return hlsLoading || (hlsLoading = new Promise(function (ok, bad) {
      var s = document.createElement("script"); s.src = HLS_JS;
      s.onload = function () { ok(window.Hls); }; s.onerror = function () { hlsLoading = null; bad(new Error("player add-on didn't load")); };
      document.head.appendChild(s);
    }));
  }
  function attach(audio, v, opts) {
    opts = opts || {};
    if (current) { current.destroy(); current = null; }
    var file = opts.forceHls ? null : pickFile(v), hls = pickHls(v);
    if (file) { audio.src = file; return Promise.resolve("file"); }
    if (!hls) return Promise.reject(new Error("This track has no playable file yet. It may still be processing."));
    if (!opts.forceHlsJs && audio.canPlayType("application/vnd.apple.mpegurl")) { audio.src = hls; return Promise.resolve("hls-native"); }
    return loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) throw new Error("This browser can't play this track.");
      current = new Hls({ startPosition: opts.start || -1 });
      current.on(Hls.Events.ERROR, function (e, d) { if (d.fatal && opts.onError) opts.onError(new Error("Playback stopped: " + d.details)); });
      current.loadSource(hls); current.attachMedia(audio);
      return "hls-js";
    });
  }
  window.REPLAY_SOURCE = { attach: attach, pickFile: pickFile, pickHls: pickHls };
})();
