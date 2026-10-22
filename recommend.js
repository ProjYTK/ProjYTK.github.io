// RawReel recommendations: simple and transparent, built only on your own likes/dislikes and video similarity.
// Votes live per browser in localStorage "rr_votes" as { "<video id>": 1 (like) | -1 (dislike) }.
// No server yet: real like/dislike counts come with PeerTube, which has rating endpoints
// (PUT /api/v1/videos/{id}/rate, GET /api/v1/users/me/videos/{id}/rating). See PEERTUBE-HOOKUP.md.
//
// similarity(a, b) = shared fields, one point each (max 5):
//   same category · a shared tag · same creator/series · same decade · both silent or both sound
// score(v) = sum of similarity(v, each liked video) - sum of similarity(v, each disliked video)
// Disliked videos are never shown. Held items are never in window.VIDEOS. Viewer filters (RRS.allow) apply.
// With no votes everything scores 0 and the stable default order (recently added) decides.
(function () {
  var KEY = 'rr_votes';
  function votes() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function decade(v) { var y = +v.year || +(String(v.date || '').slice(0, 4)); return y ? Math.floor(y / 10) : null; }
  function isSilent(v) { return !!v.silent || (v.category === 'classic' && +v.year > 0 && +v.year < 1929); }
  function series(v) { return String(v.series || v.creator || '').toLowerCase(); }
  function similarity(a, b) {
    var s = 0;
    if (a.category && a.category === b.category) s++;
    var ta = a.tags || [], tb = b.tags || [];
    if (ta.some(function (t) { return tb.indexOf(t) !== -1; })) s++;
    if (series(a) && series(a) === series(b)) s++;
    if (decade(a) != null && decade(a) === decade(b)) s++;
    if (isSilent(a) === isSilent(b)) s++;
    return s;
  }
  // Stable default order: newest `date` first, ties to the entry added later in videos.js.
  function byRecent(list) {
    return list.map(function (v, i) { return [v, i]; }).sort(function (a, b) {
      return String(b[0].date || '').localeCompare(String(a[0].date || '')) || b[1] - a[1];
    }).map(function (x) { return x[0]; });
  }
  // opts: { home: bool (home-page filters), near: video (Up next: similar to this one first), exclude: id }
  function rank(list, opts) {
    opts = opts || {};
    var vt = votes(), all = window.VIDEOS || [];
    var liked = all.filter(function (v) { return vt[v.id] === 1; }), disliked = all.filter(function (v) { return vt[v.id] === -1; });
    var pool = byRecent(list.filter(function (v) {
      return vt[v.id] !== -1 && !v.hold && v.id !== opts.exclude && (!window.RRS || RRS.allow(v, { home: !!opts.home }));
    }));
    var scored = pool.map(function (v, i) {
      var sc = 0;
      liked.forEach(function (l) { if (l.id !== v.id) sc += similarity(v, l); });
      disliked.forEach(function (d) { sc -= similarity(v, d); });
      return { v: v, near: opts.near ? similarity(v, opts.near) : 0, score: sc, i: i };
    });
    scored.sort(function (a, b) { return b.near - a.near || b.score - a.score || a.i - b.i; });
    return scored.map(function (x) { return x.v; });
  }
  window.RRRec = {
    votes: votes,
    vote: function (id) { return votes()[id] || 0; },
    // Set +1 / -1; voting the same way again toggles it off. Only one vote per video.
    toggle: function (id, val) { var o = votes(); if (o[id] === val) delete o[id]; else o[id] = val; save(o); return o[id] || 0; },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    similarity: similarity, rank: rank, byRecent: byRecent
  };
})();
