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
  out.innerHTML = res.map(function (v) {
    var href = 'watch.html?v=' + encodeURIComponent(v.id) + (v.host === 'clipplace' ? '&host=clipplace' : '');
    var img = v.host !== 'clipplace' ? '<img class="rr-timg" alt="" loading="lazy" src="https://archive.org/services/img/' + encodeURIComponent(v.id) + '" onerror="this.remove()">' : '';
    var line = [v.creator, window.rrDateLine ? window.rrDateLine(v) : v.year].filter(Boolean).map(esc).join(' · ');
    return '<a class="card' + (v.category === 'classic' ? ' classic' : '') + '" href="' + href + '"><div class="thumb">' + img + '</div><div class="meta"><h3>' + esc(v.title || v.id) + '</h3><small class="m1">' + line + '</small><small class="m2">' + (v.category === 'classic' ? 'Classic' : 'Backed-up channel') + '</small></div></a>';
  }).join('');
})();
