// RawReplay mini-player. One player on every RawReplay page. Keeps the queue (the current
// release, in order, no shuffle), position and volume in localStorage so you can move between
// pages and pick up where you left off. Exposes window.RP for page scripts.
(function () {
  var R = window.REPLAY, KEY = "rawreplay.player.v1";
  var bar = document.createElement("div");
  bar.className = "mini"; bar.id = "mini"; bar.hidden = true;
  bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Music player");
  bar.innerHTML =
    '<div class="mini-btns">' +
    '<button type="button" class="ctl" id="rpPrev" aria-label="Previous track">&#9198;&#xFE0E;</button>' +
    '<button type="button" class="pp" id="rpPP" aria-label="Play">&#9654;&#xFE0E;</button>' +
    '<button type="button" class="ctl" id="rpNext" aria-label="Next track">&#9197;&#xFE0E;</button></div>' +
    '<a class="now" id="rpNow" href="#"><b id="rpT">Nothing playing</b><span id="rpA">&nbsp;</span></a>' +
    '<div class="seek"><span id="rpCur">0:00</span><input type="range" id="rpSeek" min="0" max="0" step="0.1" value="0" aria-label="Seek"><span id="rpDur">0:00</span></div>' +
    '<label class="vol" title="Volume"><span aria-hidden="true">&#128266;&#xFE0E;</span><input type="range" id="rpVol" min="0" max="1" step="0.05" value="1" aria-label="Volume"></label>' +
    '<span class="rp-status" id="rpStatus" role="status" aria-live="polite"></span>';
  document.body.appendChild(bar);
  var a = new Audio(); a.preload = "metadata";
  var $ = function (id) { return document.getElementById(id); };
  var pp = $("rpPP"), seek = $("rpSeek"), vol = $("rpVol"), st = $("rpStatus");
  var rel = null, cur = -1, dragging = false, listeners = [], lastSave = 0;

  function save() {
    if (!rel) return;
    try { localStorage.setItem(KEY, JSON.stringify({ id: rel.id, i: cur, time: a.currentTime || 0, vol: a.volume, playing: !a.paused })); } catch (e) {}
  }
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
    var t = r.tracks[i];
    rel = r; cur = i; bar.hidden = false; document.body.classList.add("has-mini");
    a.src = R.src(r, t);
    $("rpT").textContent = t.title; $("rpA").textContent = r.artist + " \u2014 " + r.title;
    $("rpNow").href = R.trackUrl(r, i);
    $("rpPrev").disabled = i <= 0; $("rpNext").disabled = i >= r.tracks.length - 1;
    seek.value = 0; seek.max = R.secs(t.length); $("rpDur").textContent = t.length; $("rpCur").textContent = "0:00";
    if (opts.time) { a.addEventListener("loadedmetadata", function f() { a.removeEventListener("loadedmetadata", f); a.currentTime = opts.time; }); }
    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: r.artist, album: r.title,
        artwork: [{ src: R.cover(r), sizes: "300x300", type: "image/jpeg" }] });
    }
    if (opts.autoplay === false) { status(""); icon(); save(); return; }
    play();
  }
  function play() {
    if (!rel) return;
    status("Loading\u2026");
    var p = a.play();
    if (p && p.catch) p.catch(function (e) {
      if (e && e.name === "NotAllowedError") status("Press play to listen");
      else if (e && e.name !== "AbortError") status("Couldn't play this track.", true);
    });
  }
  function toggle() { if (!rel) return; a.paused ? play() : a.pause(); }
  function next() { if (rel && cur < rel.tracks.length - 1) load(rel, cur + 1); }
  function prev() { if (!rel) return; if (a.currentTime > 3 || cur === 0) { a.currentTime = 0; return; } load(rel, cur - 1); }

  pp.onclick = toggle; $("rpNext").onclick = next; $("rpPrev").onclick = prev;
  a.addEventListener("play", icon); a.addEventListener("pause", function () { icon(); save(); });
  a.addEventListener("waiting", function () { status("Loading\u2026"); });
  a.addEventListener("playing", function () { status(""); });
  a.addEventListener("error", function () { if (a.src) { status("Couldn't load this track. Check your connection or try the next one.", true); icon(); } });
  a.addEventListener("loadedmetadata", function () { if (isFinite(a.duration)) { seek.max = a.duration; $("rpDur").textContent = R.fmt(a.duration); } });
  a.addEventListener("timeupdate", function () {
    if (!dragging) seek.value = a.currentTime; $("rpCur").textContent = R.fmt(a.currentTime);
    if (Date.now() - lastSave > 2000) { lastSave = Date.now(); save(); }
  });
  a.addEventListener("ended", function () { if (rel && cur < rel.tracks.length - 1) load(rel, cur + 1); else { icon(); save(); } });
  seek.addEventListener("input", function () { dragging = true; $("rpCur").textContent = R.fmt(seek.value); });
  seek.addEventListener("change", function () { a.currentTime = +seek.value; dragging = false; });
  vol.addEventListener("input", function () { a.volume = +vol.value; save(); });
  window.addEventListener("pagehide", save);
  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space" || !rel || e.ctrlKey || e.metaKey || e.altKey) return;
    var tg = e.target, tag = tg && tg.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A" || tag === "SUMMARY" || (tg && tg.isContentEditable)) return;
    e.preventDefault(); toggle();
  });
  if ("mediaSession" in navigator) {
    var ms = navigator.mediaSession, h = function (n, f) { try { ms.setActionHandler(n, f); } catch (e) {} };
    h("play", play); h("pause", function () { a.pause(); }); h("nexttrack", next); h("previoustrack", prev);
    h("seekto", function (d) { a.currentTime = d.seekTime; });
  }
  // Restore the last session (paused; browsers block autoplay until you tap play).
  try {
    var s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s) { if (typeof s.vol === "number") { a.volume = s.vol; vol.value = s.vol; }
      var r0 = R.get(s.id); if (r0 && r0.tracks[s.i]) { load(r0, s.i, { autoplay: false, time: s.time }); if (s.time) { seek.value = s.time; $("rpCur").textContent = R.fmt(s.time); } } }
  } catch (e) {}

  window.RP = {
    play: function (r, i) { if (rel === r && cur === i) toggle(); else load(r, i); },
    select: function (r, i) { load(r, i); },
    toggle: toggle, current: function () { return { rel: rel, i: cur, playing: !a.paused }; },
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
