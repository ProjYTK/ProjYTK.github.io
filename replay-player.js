window.RAWREPLAY_PLAYER = window.RAWREPLAY_PLAYER || { peertube: false };  // off until Friday
// RawReplay mini-player. One player on every RawReplay page. Keeps the queue (the current
// release, in order or shuffled), position and volume in localStorage so you can move between
// pages and pick up where you left off. Exposes window.RP for page scripts.
(function () {
  var R = window.REPLAY, KEY = "rawreplay.player.v1";
  var bar = document.createElement("div");
  bar.className = "mini"; bar.id = "mini"; bar.hidden = true;
  bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Music player"); bar.setAttribute("aria-keyshortcuts", "Space K J L N P M S");
  bar.innerHTML =
    '<div class="mini-btns">' +
    '<button type="button" class="ctl" id="rpPrev" aria-label="Previous track">&#9198;&#xFE0E;</button>' +
    '<button type="button" class="pp" id="rpPP" aria-label="Play">&#9654;&#xFE0E;</button>' +
    '<button type="button" class="ctl" id="rpNext" aria-label="Next track">&#9197;&#xFE0E;</button>' +
    '<button type="button" class="ctl shuf" id="rpShuf" aria-label="Shuffle" aria-pressed="false" title="Shuffle (S)">&#128256;&#xFE0E;</button></div>' +
    '<a class="now" id="rpNow" href="#"><b id="rpT">Nothing playing</b><span id="rpA">&nbsp;</span><small class="upnext" id="rpUp"></small></a>' +
    '<div class="seek"><span id="rpCur">0:00</span><input type="range" id="rpSeek" min="0" max="0" step="0.1" value="0" aria-label="Seek"><span id="rpDur">0:00</span></div>' +
    '<label class="vol" title="Volume"><span aria-hidden="true">&#128266;&#xFE0E;</span><input type="range" id="rpVol" min="0" max="1" step="0.05" value="1" aria-label="Volume"></label>' +
    '<span class="rp-status" id="rpStatus" role="status" aria-live="polite"></span>';
  document.body.appendChild(bar);
  var a = new Audio(); a.preload = "metadata";
  var $ = function (id) { return document.getElementById(id); };
  var pp = $("rpPP"), seek = $("rpSeek"), vol = $("rpVol"), st = $("rpStatus");
  var rel = null, cur = -1, dragging = false, listeners = [], lastSave = 0;
  // Up-next queue: order holds track indexes for the current release; shuffled when shuffle is on.
  var order = [], shuffle = false;
  function buildOrder() {
    order = rel ? rel.tracks.map(function (_, k) { return k; }) : [];
    if (shuffle && order.length > 1) {
      order.splice(order.indexOf(cur), 1);
      for (var k = order.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = order[k]; order[k] = order[j]; order[j] = t; }
      order.unshift(cur);
    }
  }
  function pos() { return order.indexOf(cur); }
  function nextIdx() { var p = pos(); return p >= 0 && p < order.length - 1 ? order[p + 1] : -1; }
  function prevIdx() { var p = pos(); return p > 0 ? order[p - 1] : -1; }
  function showQueue() {
    var n = nextIdx();
    $("rpUp").textContent = n >= 0 ? "Up next: " + rel.tracks[n].title : (rel ? "Last track" : "");
    $("rpPrev").disabled = !rel;
    $("rpNext").disabled = n < 0;
    var sb = $("rpShuf"); sb.setAttribute("aria-pressed", shuffle ? "true" : "false"); sb.classList.toggle("on", shuffle);
  }
  function setShuffle(on) { shuffle = !!on; buildOrder(); showQueue(); status(shuffle ? "Shuffle on" : "Shuffle off"); save(); }

  function save() {
    if (!rel) return;
    try { localStorage.setItem(KEY, JSON.stringify({ id: rel.id, i: cur, time: a.currentTime || 0, vol: a.volume, playing: !a.paused, shuffle: shuffle, order: order })); } catch (e) {}
  }
  var holdT = 0;
  function hold(msg) { status(msg); holdT = Date.now() + 2500; clearTimeout(hold.t); hold.t = setTimeout(function () { if (Date.now() >= holdT && st.textContent === msg) status(""); }, 2600); }
  function status(msg, err) { st.textContent = msg || ""; bar.classList.toggle("err", !!err); }
  function notify() { listeners.forEach(function (fn) { fn(rel, cur, !a.paused); }); }
  function icon() {
    var paused = a.paused;
    pp.innerHTML = paused ? "&#9654;&#xFE0E;" : "&#10074;&#10074;";
    pp.setAttribute("aria-label", paused ? "Play" : "Pause");
    bar.classList.toggle("playing", !paused);
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = paused ? "paused" : "playing";
    notify();
  }
  function load(r, i, opts) {
    opts = opts || {};
    if (!r || !r.tracks[i]) return;
    var t = r.tracks[i], newRel = rel !== r;
    rel = r; cur = i;
    if (opts.order && opts.order.length === r.tracks.length) order = opts.order;
    else if (newRel || order.indexOf(i) < 0) buildOrder(); bar.hidden = false; document.body.classList.add("has-mini");
    // Friday fallback: flip RAWREPLAY_PLAYER.peertube to true once tracks come from video.rawreel.org.
    // Tracks with a PeerTube video object (t.pt) then play via REPLAY_SOURCE (plain file, else HLS).
    var usePt = window.RAWREPLAY_PLAYER && window.RAWREPLAY_PLAYER.peertube && t.pt && window.REPLAY_SOURCE;
    if (usePt) {
      REPLAY_SOURCE.attach(a, t.pt, { onError: function (e) { status(e.message); } })
        .then(function () { if (opts.autoplay !== false) play(); }, function (e) { status(e.message); });
    } else a.src = R.src(r, t);
    $("rpT").textContent = t.title; $("rpA").textContent = r.artist + " \u2014 " + r.title;
    $("rpNow").href = R.trackUrl(r, i);
    showQueue();
    seek.value = 0; seek.max = R.secs(t.length); $("rpDur").textContent = t.length; $("rpCur").textContent = "0:00";
    if (opts.time) { a.addEventListener("loadedmetadata", function f() { a.removeEventListener("loadedmetadata", f); a.currentTime = opts.time; }); }
    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: r.artist, album: r.title,
        artwork: [{ src: R.cover(r), sizes: "300x300", type: "image/jpeg" }] });
    }
    if (opts.autoplay === false) { status(""); icon(); save(); return; }
    if (!usePt) play();
  }
  var slowT = 0;
  function loading() { status("Loading\u2026"); clearTimeout(slowT); slowT = setTimeout(function () { if (st.textContent === "Loading\u2026") status("Still loading, slow connection\u2026"); }, 8000); }
  function play() {
    if (!rel) return;
    loading();
    var p = a.play();
    if (p && p.catch) p.catch(function (e) {
      if (e && e.name === "NotAllowedError") status("Press play to listen");
      else if (e && e.name !== "AbortError") status("Couldn't play this track.", true);
    });
  }
  function toggle() { if (!rel) return; a.paused ? play() : a.pause(); }
  function next() { var n = nextIdx(); if (n >= 0) load(rel, n); }
  function prev() { if (!rel) return; var p = prevIdx(); if (a.currentTime > 3 || p < 0) { a.currentTime = 0; return; } load(rel, p); }

  pp.onclick = toggle; $("rpNext").onclick = next; $("rpShuf").onclick = function () { setShuffle(!shuffle); }; $("rpPrev").onclick = prev;
  a.addEventListener("play", icon); a.addEventListener("pause", function () { icon(); save(); });
  a.addEventListener("waiting", function () { if (Date.now() < holdT) return; loading(); });
  a.addEventListener("playing", function () { clearTimeout(slowT); if (Date.now() < holdT) return; status(""); });
  a.addEventListener("error", function () { clearTimeout(slowT); if (a.src) { status("Couldn't load this track. Check your connection or try the next one.", true); icon(); } });
  a.addEventListener("loadedmetadata", function () { if (isFinite(a.duration)) { seek.max = a.duration; $("rpDur").textContent = R.fmt(a.duration); } });
  a.addEventListener("timeupdate", function () {
    if (!dragging) seek.value = a.currentTime; $("rpCur").textContent = R.fmt(a.currentTime);
    seek.setAttribute("aria-valuetext", R.fmt(a.currentTime) + " of " + R.fmt(a.duration || 0));
    if (Date.now() - lastSave > 2000) { lastSave = Date.now(); save(); }
  });
  a.addEventListener("ended", function () { var n = nextIdx(); if (n >= 0) load(rel, n); else { icon(); save(); } });
  seek.addEventListener("input", function () { dragging = true; $("rpCur").textContent = R.fmt(seek.value); });
  seek.addEventListener("change", function () { a.currentTime = +seek.value; dragging = false; });
  vol.addEventListener("input", function () { a.volume = +vol.value; vol.setAttribute("aria-valuetext", Math.round(a.volume * 100) + "%"); save(); });
  window.addEventListener("pagehide", save);
  // Keyboard: Space/K play-pause, J/L back/forward 10s (also Left/Right inside the player), N/P next/previous, M mute.
  // Ignored while typing, and Space is left alone on a focused button or link so it still presses it.
  function skip(d) { if (!rel || !isFinite(a.duration)) { hold("Nothing playing yet"); return; } a.currentTime = Math.max(0, Math.min(a.duration, a.currentTime + d)); hold((d < 0 ? "Back " : "Forward ") + Math.abs(d) + " seconds"); }
  function mute() { a.muted = !a.muted; hold(a.muted ? "Muted" : "Sound on"); }
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!rel && !/^[jlJL]$/.test(e.key)) return;
    var tg = e.target, tag = tg && tg.tagName, k = e.key;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (tg && tg.isContentEditable)) return;
    var onCtl = tag === "BUTTON" || tag === "A" || tag === "SUMMARY";
    if ((k === " " || k === "Spacebar") && onCtl) return;
    if ((k === "ArrowLeft" || k === "ArrowRight") && !bar.contains(tg)) return;
    var back = function () { skip(-10); }, fwd = function () { skip(10); };
    var act = { " ": toggle, "Spacebar": toggle, k: toggle, K: toggle, j: back, J: back, l: fwd, L: fwd,
      ArrowLeft: back, ArrowRight: fwd, n: next, N: next, p: prev, P: prev, m: mute, M: mute,
      s: function () { setShuffle(!shuffle); }, S: function () { setShuffle(!shuffle); } }[k];
    if (!act) return;
    e.preventDefault(); act();
  });
  if ("mediaSession" in navigator) {
    var ms = navigator.mediaSession, h = function (n, f) { try { ms.setActionHandler(n, f); } catch (e) {} };
    h("play", play); h("pause", function () { a.pause(); }); h("nexttrack", next); h("previoustrack", prev);
    h("seekto", function (d) { a.currentTime = d.seekTime; });
  }
  // Restore the last session (paused; browsers block autoplay until you tap play).
  try {
    var s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s) { if (typeof s.vol === "number") { a.volume = s.vol; vol.value = s.vol; } shuffle = !!s.shuffle;
      var r0 = R.get(s.id); if (r0 && r0.tracks[s.i]) { load(r0, s.i, { autoplay: false, time: s.time, order: s.order }); if (s.time) { seek.value = s.time; $("rpCur").textContent = R.fmt(s.time); } } }
  } catch (e) {}

  window.RP = {
    play: function (r, i) { if (rel === r && cur === i) toggle(); else load(r, i); },
    select: function (r, i) { load(r, i); },
    toggle: toggle, shuffle: setShuffle, upNext: function () { return order.slice(pos() + 1); }, current: function () { return { rel: rel, i: cur, playing: !a.paused }; },
    onChange: function (fn) { listeners.push(fn); fn(rel, cur, !a.paused); },
    audio: a
  };
  // Copy-to-clipboard helper for share buttons (falls back to a prompt).
  window.RP.share = function (url, btn) {
    var full = new URL(url, location.href).href;
    function done() { if (btn) { var o = btn.textContent; btn.textContent = "Link copied"; setTimeout(function () { btn.textContent = o; }, 1600); } }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(full).then(done, function () { window.prompt("Copy this link:", full); });
    else window.prompt("Copy this link:", full);
  };
})();
