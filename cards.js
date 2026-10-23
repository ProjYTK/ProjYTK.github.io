// Shared card rendering for index, classics, channel and watch pages.
// Grids:  <main class="grid" data-cards="8" data-category="classic"></main>
//   data-cards      number of cards, or "all" (= every matching video, no placeholders)
//   data-category   "classic" or "channel"; omit for every video
//   data-full-list  include classicsOnly entries (classics.html only)
//   data-sort       "recent" = newest `date` first (home "Recently added" row); "foryou" = recommend.js ranking
// Up next uses recommend.js when loaded: similar to the current video first, then your likes/dislikes.
// A "channel" grid shows only real channel videos plus one "Your channel here" card (import.html) when short.
// Home rows (data-home) are topped up from other non-held videos so they never come out empty.
// Up next lists: <div data-minis="6"></div> (classics first, current video skipped).
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var vids = window.VIDEOS || [];
  var ok = function (v, home) { return !window.RRS || RRS.allow(v, { home: home }); };
  function href(v) { return 'watch.html?v=' + encodeURIComponent(v.id) + (v.host === 'clipplace' ? '&host=clipplace' : ''); }
  // Internal RawReel test uploads (our own test clips/channels): never lead a row; kept out of For you.
  function isTest(v) { return !!v && v.creator === 'RawReel'; }
  window.rrIsTest = isTest;
  // Every video thumb gets a styled sky-blue title card underneath (title + year for classics), so a missing,
  // failed or blank image never leaves an empty tile. noThumb:true in videos.js = the Archive image is blank; skip it.
  // clip.place thumbnails are looked up from its PeerTube API after render (see fillClipThumbs).
  // Display title: videos.js title, else a tidied id (no underscores, file extensions or trailing IDs).
  function cleanTitle(v) {
    var t = String((v && (v.title || v.id)) || '');
    if (v && v.title) return t;
    t = t.replace(/\.(mp4|ia|m4v|ogv|webm)$/ig, '').replace(/_(512kb|\d{6,})$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return t.replace(/\b([a-z])/g, function (c) { return c.toUpperCase(); });
  }
  window.rrTitle = cleanTitle;
  function fall(v) {
    var yr = v.category === 'classic' && v.year ? '<span style="font-size:.85em;opacity:.95;margin-top:2px">' + esc(v.year) + '</span>' : '';
    return '<span class="rr-tfall" aria-hidden="true" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 10px;box-sizing:border-box;text-align:center;color:#fff;background:linear-gradient(160deg,#3a9be0 0%,#1f6fb2 45%,#0b2d55 100%);text-shadow:0 1px 2px rgba(0,0,0,.45)">' +
      '<span style="width:30px;height:30px;flex-shrink:0;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;color:#0b2d55;font-size:12px;padding-left:2px;box-sizing:border-box;text-shadow:none">&#9654;</span>' +
      '<b style="font-size:13px;line-height:1.2;font-weight:700;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:100%">' + esc(cleanTitle(v)) + '</b>' + yr + '</span>';
  }
  function thumb(v, label) {
    // Archive's image service can answer 200 with an empty or 1px image; treat tiny images as missing too.
    var img = v && v.host === 'self' && v.thumb ? '<img class="rr-timg' + (v.vertical ? ' rr-tportrait' : '') + '" alt="" loading="lazy" src="' + esc(v.thumb) + '" onerror="this.remove()">'
      : v && v.host !== 'clipplace' && v.host !== 'self' && !v.noThumb ? '<img class="rr-timg" alt="" loading="lazy" src="https://archive.org/services/img/' + encodeURIComponent(v.id) + '" onerror="this.remove()" onload="if(this.naturalWidth<40)this.remove()">' : '';
    var cp = v && v.host === 'clipplace' ? ' data-clip-id="' + esc(v.id) + '"' : '';
    var cw = v && v.contentWarning ? '<span class="cw-tag" title="' + esc(v.contentWarning) + '">Content warning</span>' : '';
    return '<div class="thumb"' + cp + '>' + (v ? fall(v) : '') + img + cw + label + '</div>';
  }
  window.rrThumb = thumb;  // shared with search.js
  var clipThumbs = {};
  function fillClipThumbs() {
    document.querySelectorAll('.thumb[data-clip-id]').forEach(function (t) {
      var id = t.getAttribute('data-clip-id');
      if (!clipThumbs[id]) clipThumbs[id] = fetch('https://clip.place/api/v1/videos/' + encodeURIComponent(id)).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return d && (d.thumbnailPath || d.previewPath) ? 'https://clip.place' + (d.thumbnailPath || d.previewPath) : null; }).catch(function () { return null; });
      clipThumbs[id].then(function (u) {
        if (!u || t.querySelector('.rr-timg')) return;
        var im = document.createElement('img'); im.className = 'rr-timg'; im.alt = ''; im.loading = 'lazy'; im.src = u;
        im.onerror = function () { im.remove(); };
        t.insertBefore(im, t.firstChild.nextSibling);
      });
    });
  }
  window.rrFillClipThumbs = fillClipThumbs;
  // 'YYYY-MM-DD' -> 'Oct 19, 2026' (parsed by hand, so no time-zone shift). Bad or missing -> ''.
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  window.rrFormatDate = function (d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || '')); if (!m || +m[2] < 1 || +m[2] > 12) return '';
    return MON[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  };
  // First meta line: release year for classics ('1926'), 'Added Oct 19, 2026' for everything else; empty when missing.
  window.rrDateLine = function (v) {
    // Classics always show their release year (part of the title card; Settings > Show video dates hides added dates only).
    // The Archive's upload date isn't when RawReel added them.
    if (v.category === 'classic') return v.year ? String(v.year) : '';
    if (window.RRS && !RRS.get('showDates')) return '';  // Settings > Show video dates
    var f = window.rrFormatDate(v.date);
    return f ? 'Added ' + f : '';
  };
  function hostName(v) { return v.host === 'clipplace' ? 'clip.place' : v.host === 'self' ? 'RawReel' : 'Internet Archive'; }
  // Verified badge: ONLY from data (window.RR_CHANNELS[handle].verified === true). Nothing on the site can set it.
  function badge(h) { var c = h && window.RR_CHANNELS && RR_CHANNELS[String(h).toLowerCase()]; return c && c.verified === true ? '<span class="rr-verified" role="img" aria-label="Verified" title="Verified"><span aria-hidden="true">&#10003;</span></span>' : ''; }
  window.rrBadge = badge;
  // Card meta: up to two short lines so cards stay tidy in the 2-column phone grid.
  function lines(v) {
    var l1 = esc(window.rrDateLine(v)), l2;
    if (v.category === 'classic') l2 = (v.license ? esc(v.license) : 'Public domain') + ' · via ' + hostName(v);
    else if (v.host === 'self') { l1 = [esc(v.creator || '') + badge(v.handle) + (v.handle ? ' <span class="handle">@' + esc(v.handle) + '</span>' : ''), l1].filter(Boolean).join(' · '); l2 = 'Posted on RawReel'; }
    else { l1 = [esc(v.creator || '') + badge(v.handle) + (v.handle ? ' <span class="handle">@' + esc(v.handle) + '</span>' : ''), l1].filter(Boolean).join(' · '); l2 = 'Backed up on ' + hostName(v); }
    return (l1 ? '<small class="m1">' + l1 + '</small>' : '') + '<small class="m2">' + l2 + '</small>';
  }
  // Genres, hand-assigned by id (shared by Collections and the browse filters). Anything else = "More classics".
  var G = window.RR_GENRES = {
    'Chaplin & friends: silent comedy': ['CC_1916_09_04_TheCount','the-immigrant-1917_202304','CC_1916_12_04_TheRink','EasyStreet1917','CC_1917_10_22_TheAdventurer','CC_1917_04_16_TheCure','TheTramp1915','the-gold-rush-film-1925','The_General_Buster_Keaton','MyMovie_20190318','steamboat_bill_ipod','OneWeek','cops-buster-keaton','mymovie_202004','SafetyLastHaroldLloyd1923.FullMovieexcellentQuality.','CollegeDays','silent-go-west','seven-chances','silent-girl-shy','silent-hot-water','silent-why-worry','silent-the-saphead','silent-the-electric-house','silent-the-butcher-boy','silent-the-fireman','silent-the-floorwalker','laurel-and-hardy-leave-em-laughing-silent','1917MoveOnHaroldLloyd','pinchedharoldlloyd','silent-paris-qui-dort-aka-paris-asleep'],
    'Horror & the uncanny': ['Nosferatu_most_complete_version_93_mins.','DasKabinettdesDoktorCaligariTheCabinetofDrCaligari','ThePhantomoftheOpera','DrJekyllandMrHyde','silent-the-unholy-three','silent-the-monster','silent-the-haunted-castle'],
    'Fantasy, sci-fi & adventure': ['ATripToTheMoonGeorgeMelies','metropolis-channing-pollock-cut','lost_world','silent-peter-pan','silent-a-kiss-for-cinderella','silent-don-q-son-of-zorro','silent-the-sheik','silent-great-train-robbery','silent-the-great-train-robbery','silent-riders-of-the-purple-sage','silent-ben-hur-a-tale-of-the-christ-1925'],
    'Drama': ['BattleshipPotemkin','sunrise_1927','silent-the-big-parade','silent-the-toll-of-the-sea','silent-within-our-gates','silent-the-plastic-age','silent-the-last-laugh','silent-broken-blossoms','silent-blind-husbands','silent-the-musketeers-of-pig-alley'],
    'Cartoons & animation': ['steamboat-willie_1928','Felix_inHollywood_NoAudio','Gertie','PlaneCrazy_201511','the-skeleton-dance_1929','Felix_TwoLipTime_NoAudio','Felix_AprilMaze_NoAudio','Felix_AllPuzzled_NoAudio','Felix_FindsOut_NoAudio','Felix_GoesWest_NoAudio','OutOfTheInkwellTheOuijaBoard','koko-the-clown-birthday','silent-koko-nuts','silent-koko-trains-em','silent-the-revenge-of-a-kinematograph-cameraman'],
    'Open movies (Creative Commons)': ['BigBuckBunny_124','Sintel','ElephantsDream','Tears-of-Steel','CosmosLaundromatFirstCycle'],
    'Documentary & history': ['nanookOfTheNorth1922','1925-grass-a-nations-battle-for-life','ChelovekskinoapparatomManWithAMovieCamera','Manhatta_1921','PreludeToWar','TheNazisStrike','BattleOfBritain','gov.dod.dimoc.20377'],
    'Space: NASA Apollo films': ['Apollo07And0816mmOnboardFilm','APOLLO16MMLAUNCHVIEWS','Apollo1016mmOnboardFilm1','Apollo1116mmOnboardFilm','Apollo1216mmOnboardFilm','Apollo1416mmOnboardFilm','Apollo15And1616mmOnboardFilm','Apollo1716mmonboardfilm']
  };
  var GI = {}; Object.keys(G).forEach(function (k) { G[k].forEach(function (id) { if (!GI[id]) GI[id] = k; }); });
  window.rrGenre = function (v) { return v.category === 'classic' ? (GI[v.id] || 'More classics') : 'Channel backups'; };
  window.rrDecade = function (v) { return v.year ? Math.floor(v.year / 10) * 10 + 's' : 'Undated'; };
  // runtime: "21.8 min" or "1 h 20 min" in videos.js; unknown = null (sorted last).
  window.rrRuntime = function (v) { var r = String(v.runtime || ''), h = /(\d+(?:\.\d+)?)\s*h/.exec(r), m = /(\d+(?:\.\d+)?)\s*min/.exec(r); return h || m ? (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0) : null; };
  // ONE card for every grid on the site: the card link, plus Play and Favorite buttons laid over the thumbnail.
  function card(v, extraTitle) {
    var t = esc(cleanTitle(v)), fav = window.RRS && RRS.isFav(v.id);
    return '<div class="card-w"><a class="card' + (v.category === 'classic' ? ' classic' : '') + '" href="' + href(v) + '">' + thumb(v, '') + '<div class="meta"><h3>' + t + (extraTitle || '') + (v.testVideo === true ? ' <span class="rr-test">Test video</span>' : '') + '</h3>' + lines(v) + '</div></a>' +
      '<a class="card-act play" href="' + href(v) + '&amp;autoplay=1" aria-label="Play ' + t + '"><span aria-hidden="true">&#9654;&#xFE0E;</span></a>' +
      '<button type="button" class="card-act fav" data-fav="' + esc(v.id) + '" aria-pressed="' + (fav ? 'true' : 'false') + '" aria-label="Favorite ' + t + '"><span aria-hidden="true">&#9829;&#xFE0E;</span></button></div>';
  }
  window.rrCard = card;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-fav]'); if (!b || !window.RRS) return;
    var on = RRS.toggleFav(b.getAttribute('data-fav'));
    document.querySelectorAll('button[data-fav="' + CSS.escape(b.getAttribute('data-fav')) + '"]').forEach(function (x) { x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  });
  function slot(cls) {
    return '<a class="' + cls + ' rr-slot" href="import.html">' + thumb(null, 'Your channel here') +
      '<div class="meta"><h3>Your channel here</h3><small>Open spot · back up your channel</small></div></a>';
  }
  window.rrRenderCards = function () {
    var current = new URLSearchParams(location.search).get('v');
    document.querySelectorAll('[data-cards]:not([data-browse])').forEach(function (g) {
      var cat = g.dataset.category, full = g.hasAttribute('data-full-list'), home = g.hasAttribute('data-home'), list = vids.filter(function (v) { return (!cat || v.category === cat) && (full || !v.classicsOnly) && ok(v, home); });
      // data-sort="recent": newest first by `date` (YYYY-MM-DD), ties go to the entry added later in videos.js.
      if (g.dataset.sort === 'foryou') list = list.filter(function (v) { return !isTest(v); });
      if (g.dataset.sort === 'foryou' && window.RRRec) list = RRRec.rank(list, { home: home, daily: true });
      else if (g.dataset.sort === 'recent') list = list.map(function (v, i) { return [v, i]; }).sort(function (a, b) { var d = String(b[0].date || '').localeCompare(String(a[0].date || '')); return d || b[1] - a[1]; }).map(function (x) { return x[0]; });
      var n = g.dataset.cards === 'all' ? list.length : +g.dataset.cards, html = '';
      // Home rows always fill: top up short rows (no likes yet, everything disliked, few items) with other
      // allowed, non-held videos of the same kind; For you tops up with classics. Held videos are never in VIDEOS.
      if (home && cat !== 'channel' && list.length < n) {
        var seen = {}; list.forEach(function (v) { seen[v.id] = 1; });
        var vt = window.RRRec ? RRRec.votes() : {};
        var extra = vids.filter(function (v) { return !seen[v.id] && !v.hold && (cat ? v.category === cat : v.category === 'classic') && ok(v, home); });
        var liked = extra.filter(function (v) { return vt[v.id] !== -1; });
        extra = (window.RRRec ? RRRec.byRecent(liked) : liked).concat(extra.filter(function (v) { return vt[v.id] === -1; }));
        list = list.concat(extra);
        if (cat !== 'classic' && list.length < n) list = list.concat(vids.filter(function (v) { return !seen[v.id] && list.indexOf(v) === -1 && !v.hold && !v.classicsOnly && !isTest(v) && ok(v, home); }));
      }
      // Real content first, internal test items last (stable).
      list = list.filter(function (v) { return !isTest(v); }).concat(list.filter(isTest));
      // Hide a home row only when it truly has nothing to show (channel row always keeps its invite card).
      if (home && !list.length && cat !== 'channel') { g.hidden = true; var hh = g.previousElementSibling; if (hh && hh.classList.contains('sec-h')) hh.hidden = true; return; }
      var shown = Math.min(n, list.length);
      for (var i = 0; i < shown; i++) {
        var v = list[i];
        html += card(v);
      }
      // Channel grids: real backed-up channels only; one friendly "Your channel here" card when there is room or none.
      if (cat === 'channel' && shown < n) html += slot('card');
      g.innerHTML = html || '<p class="empty-note">Nothing here yet.</p>';
    });
    fillClipThumbs();
    document.querySelectorAll('[data-minis]').forEach(function (g) {
      var n = +g.dataset.minis, list = vids.filter(function (v) { return v.id !== current && !v.classicsOnly && ok(v, false); }), html = '';
      if (window.RRRec) { var cur = vids.filter(function (v) { return v.id === current; })[0]; list = RRRec.rank(list, { near: cur, exclude: current }); }
      else list.sort(function (a, b) { return (a.category === 'classic' ? 0 : 1) - (b.category === 'classic' ? 0 : 1); });
      for (var i = 0; i < Math.min(n, list.length); i++) {
        var v = list[i];
        html += '<a class="mini" href="' + href(v) + '">' + thumb(v, '') + '<div><h3>' + esc(cleanTitle(v)) + '</h3>' + lines(v) + '</div></a>';
      }
      g.innerHTML = html;
    });
    fillClipThumbs();
  };
  window.rrRenderCards();
})();
