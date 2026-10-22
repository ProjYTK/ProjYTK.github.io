// RawReplay "Share your music" form. Nothing is sent yet: real submissions start when the
// RawReel server goes live. The ONLY place the backend call goes is submitRelease() below.
(function () {
  var form = document.getElementById("shareForm"), files = document.getElementById("audio"), rows = document.getElementById("trackRows");
  var MAX_TRACKS = 30, MAX_MB = 200;

  // One place for server settings. Keep enabled:false until video.rawreel.org is live and tested.
  var RAWREPLAY_SERVER = {
    enabled: false,
    url: "https://video.rawreel.org",   // PeerTube server (goes live Fri Oct 23)
    tag: "rawreplay",                   // each artist uploads to THEIR OWN channel; RawReplay finds music by this tag + category 1 (Music)
    privacy: 1,                         // 1 = public once a reviewer approves it
    licence: null                       // set if the artist picks a licence later
  };

  /** Backend hook: the ONLY place the network call goes.
   *  Uploads each track with POST {url}/api/v1/videos/upload (PeerTube, audio uploads on), using
   *  the ARTIST's own user token from their sign-in. Never use the admin token: it skips review.
   *  @param {FormData} data  artist, title, released, genre, email, notes, tracks (JSON [{title,file}]),
   *                          audio (files), cover (file), rights_* checkboxes
   *  @param {string} artistToken  OAuth access token of the signed-in artist account
   *  @returns {Promise<{ok:boolean, prototype?:boolean, ids?:Array}>} */
  function submitRelease(data, artistToken) {
    var C = RAWREPLAY_SERVER;
    if (!C.enabled) return Promise.resolve({ ok: false, prototype: true }); // nothing is sent yet
    if (!artistToken) return Promise.reject(new Error("Please sign in to your RawReel artist account first"));
    var auth = { Authorization: "Bearer " + artistToken };
    var tracks = JSON.parse(data.get("tracks")), audio = data.getAll("audio"), cover = data.get("cover");
    var slug = REPLAY.slug(data.get("title") || "release");
    return fetch(C.url + "/api/v1/users/me", { headers: auth })      // the artist's own first channel
      .then(function (r) { if (!r.ok) throw new Error("couldn\u2019t read your account (" + r.status + ")"); return r.json(); })
      .then(function (me) {
        var ch = (me.videoChannels || [])[0];
        if (!ch) throw new Error("your account has no channel yet");
        var ids = [];
        return tracks.reduce(function (p, t, i) {
          return p.then(function () {
            var f = new FormData();
            f.append("channelId", ch.id);
            f.append("name", t.title);
            f.append("privacy", C.privacy);
            if (C.licence) f.append("licence", C.licence);
            f.append("description", data.get("artist") + " \u2014 " + data.get("title") + "\nTrack " + (i + 1) + " of " + tracks.length + "\n\n" + (data.get("notes") || ""));
            f.append("category", 1);
            f.append("tags[]", C.tag);
            f.append("tags[]", ("rr-" + slug).slice(0, 30));
            if (cover && cover.size) f.append("thumbnailfile", cover, cover.name);
            f.append("videofile", audio[i], audio[i].name);
            if (cover && cover.size) f.append("previewfile", cover, cover.name);
            return fetch(C.url + "/api/v1/videos/upload", { method: "POST", headers: auth, body: f })
              .then(function (r) { if (!r.ok) throw new Error("upload failed for \u201c" + t.title + "\u201d (" + r.status + ")"); return r.json(); })
              .then(function (j) { ids.push(j.video && j.video.uuid); });
          });
        }, Promise.resolve()).then(function () { return { ok: true, ids: ids }; });
      });
  }

  function cleanName(n) { return n.replace(/\.[^.]+$/, "").replace(/^\s*\d+[\s._-]+/, "").replace(/[_]+/g, " ").trim(); }
  files.addEventListener("change", function () {
    var list = Array.prototype.slice.call(files.files);
    rows.innerHTML = list.map(function (f, i) {
      return '<label class="track-row"><span>' + (i + 1) + '</span><input name="track_title" required maxlength="120" aria-label="Title for track ' + (i + 1) + '" value="' + REPLAY.esc(cleanName(f.name)) + '"></label>';
    }).join("");
    document.getElementById("trackBox").hidden = !list.length;
  });
  function setErr(el, msg) {
    var box = document.getElementById(el.id + "Err");
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (box) box.textContent = msg || "";
    return !msg;
  }
  function validate() {
    var ok = true, first = null;
    function chk(el, msg) { if (!setErr(el, msg) && !first) first = el; ok = ok && !msg; }
    var artist = form.artist, title = form.title, email = form.email;
    chk(artist, artist.value.trim() ? "" : "Enter your artist or band name.");
    chk(title, title.value.trim() ? "" : "Enter the release title.");
    chk(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Enter an email so we can reach you about your release.");
    var list = Array.prototype.slice.call(files.files), big = list.filter(function (f) { return f.size > MAX_MB * 1048576; });
    var bad = list.filter(function (f) { return !/\.mp3$/i.test(f.name) && f.type !== "audio/mpeg"; });
    chk(files, !list.length ? "Add at least one MP3." : list.length > MAX_TRACKS ? "Up to " + MAX_TRACKS + " tracks per release." : bad.length ? "Only MP3 files for now: " + bad.map(function (f) { return f.name; }).join(", ") : big.length ? "Each file must be under " + MAX_MB + " MB." : "");
    var cover = form.cover;
    chk(cover, cover.files[0] && !/^image\//.test(cover.files[0].type) ? "Cover art must be an image." : "");
    form.querySelectorAll('input[name=track_title]').forEach(function (i) { if (!i.value.trim()) { i.setAttribute("aria-invalid", "true"); ok = false; first = first || i; } else i.removeAttribute("aria-invalid"); });
    var boxes = form.querySelectorAll(".rights input[type=checkbox]"), allOn = Array.prototype.every.call(boxes, function (b) { return b.checked; });
    document.getElementById("rightsErr").textContent = allOn ? "" : "Please confirm every statement. If one isn\u2019t true, the release can\u2019t go on RawReplay yet.";
    if (!allOn) { ok = false; first = first || Array.prototype.filter.call(boxes, function (b) { return !b.checked; })[0]; }
    if (first) first.focus();
    return ok;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var res = document.getElementById("result");
    if (!validate()) { res.hidden = true; return; }
    var data = new FormData(form), titles = data.getAll("track_title");
    data.delete("track_title");
    data.set("tracks", JSON.stringify(Array.prototype.map.call(files.files, function (f, i) { return { title: titles[i], file: f.name }; })));
    var btn = document.getElementById("send"); btn.disabled = true; btn.textContent = "Checking\u2026";
    submitRelease(data, null /* artist token from sign-in, Friday */).then(function (r) {
      res.hidden = false;
      res.className = "note-box";
      res.textContent = r && r.prototype
        ? "Everything looks good. This is a preview: nothing was uploaded or sent. We plan to open real submissions once our own server is up."
        : "Thanks! Your release was sent for review. We\u2019ll email you when it\u2019s live.";
    }, function (err) {
      res.hidden = false; res.className = "warn-box"; res.textContent = "Couldn\u2019t send: " + (err && err.message || "unknown error") + ". Nothing was lost, try again.";
    }).then(function () { btn.disabled = false; btn.textContent = "Send for review"; res.focus(); });
  });
  form.querySelectorAll("input,textarea").forEach(function (el) { el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") el.removeAttribute("aria-invalid"); }); });
  window.submitRelease = submitRelease; window.RAWREPLAY_SERVER = RAWREPLAY_SERVER;
})();
