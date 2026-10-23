// RawReel search: filters videos.js (held items are already excluded from window.VIDEOS) by title, channel/creator and year.
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  window.rrSearch = function (q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return (window.VIDEOS || []).filter(function (v) {
      if (v.hold) return false;
      if (window.RRS && !RRS.allow(v)) return false;
      var hay = norm([v.title, v.id, v.creator, v.year, v.date ? v.date.slice(0, 4) : ''].join(' '));
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });
  };
  var out = document.getElementById('results');
  if (!out) return;
  var q = new URLSearchParams(location.search).get('q') || '';
  document.querySelectorAll('header .search input').forEach(function (i) { i.value = q; });
  var h = document.getElementById('sq');
  var res = window.rrSearch(q);
  if (!q.trim()) { h.textContent = 'Search'; out.innerHTML = '<p class="empty-note">Type a title, channel or year above, like “Chaplin” or “1924”.</p>'; return; }
  h.textContent = res.length + ' result' + (res.length === 1 ? '' : 's') + ' for “' + q + '”';
  document.title = 'Search: ' + q + ' - RawReel';
  if (!res.length) { out.innerHTML = '<p class="empty-note">No videos match. Try a shorter word, a year, or <a href="classics.html">browse all classics</a>.</p>'; return; }
  // Same shared card as every other grid (Play + Favorite), from cards.js.
  out.innerHTML = res.map(function (v) { return window.rrCard ? window.rrCard(v) : ''; }).join('');
  if (window.rrFillClipThumbs) window.rrFillClipThumbs();  // clip.place thumbnails, same as the home page
})();
