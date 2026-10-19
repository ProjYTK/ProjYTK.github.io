// Shared card rendering for index, classics, channel and watch pages.
// Grids:  <main class="grid" data-cards="8" data-category="classic"></main>
//   data-cards      number of cards, or "all" (= every matching video, no placeholders)
//   data-category   "classic" or "channel"; omit for every video
//   data-full-list  include classicsOnly entries (classics.html only)
// Empty slots in a "channel" grid become "Your channel here" cards linking to import.html.
// Up next lists: <div data-minis="6"></div> (classics first, current video skipped).
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var vids = window.VIDEOS || [];
  function href(v) { return 'watch.html?v=' + encodeURIComponent(v.id) + (v.host === 'clipplace' ? '&host=clipplace' : ''); }
  function thumb(v, label) {
    var img = v && v.host !== 'clipplace' ? '<img class="rr-timg" alt="" loading="lazy" src="https://archive.org/services/img/' + encodeURIComponent(v.id) + '" onerror="this.remove()">' : '';
    var cw = v && v.contentWarning ? '<span class="cw-tag" title="' + esc(v.contentWarning) + '">Content warning</span>' : '';
    return '<div class="thumb">' + img + cw + label + '</div>';
  }
  // 'YYYY-MM-DD' -> 'Oct 19, 2026' (parsed by hand, so no time-zone shift). Bad or missing -> ''.
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  window.rrFormatDate = function (d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || '')); if (!m || +m[2] < 1 || +m[2] > 12) return '';
    return MON[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  };
  // First meta line: release year for classics ('1926'), 'Added Oct 19, 2026' for everything else; empty when missing.
  window.rrDateLine = function (v) {
    // Classics show only their release year; the Archive's upload date isn't when RawReel added them.
    if (v.category === 'classic') return v.year ? String(v.year) : '';
    var f = window.rrFormatDate(v.date);
    return f ? 'Added ' + f : '';
  };
  function hostName(v) { return v.host === 'clipplace' ? 'clip.place' : 'Internet Archive'; }
  // Card meta: up to two short lines so cards stay tidy in the 2-column phone grid.
  function lines(v) {
    var l1 = esc(window.rrDateLine(v)), l2;
    if (v.category === 'classic') l2 = (v.license ? esc(v.license) : 'Public domain') + ' · via ' + hostName(v);
    else { l1 = [esc(v.creator || ''), l1].filter(Boolean).join(' · '); l2 = 'Backed up on ' + hostName(v); }
    return (l1 ? '<small class="m1">' + l1 + '</small>' : '') + '<small class="m2">' + l2 + '</small>';
  }
  function slot(cls) {
    return '<a class="' + cls + ' rr-slot" href="import.html">' + thumb(null, 'Your channel here') +
      '<div class="meta"><h3>Your channel here</h3><small>Open spot · back up your channel</small></div></a>';
  }
  window.rrRenderCards = function () {
    var current = new URLSearchParams(location.search).get('v');
    document.querySelectorAll('[data-cards]').forEach(function (g) {
      var cat = g.dataset.category, full = g.hasAttribute('data-full-list'), list = vids.filter(function (v) { return (!cat || v.category === cat) && (full || !v.classicsOnly); });
      var n = g.dataset.cards === 'all' ? list.length : +g.dataset.cards, html = '';
      for (var i = 0; i < n; i++) {
        var v = list[i];
        html += v
          ? '<a class="card' + (v.category === 'classic' ? ' classic' : '') + '" href="' + href(v) + '">' + thumb(v, '') + '<div class="meta"><h3>' + esc(v.title || v.id) + '</h3>' + lines(v) + '</div></a>'
          : slot('card');
      }
      g.innerHTML = html || '<p class="empty-note">Nothing here yet.</p>';
    });
    document.querySelectorAll('[data-minis]').forEach(function (g) {
      var n = +g.dataset.minis, list = vids.filter(function (v) { return v.id !== current && !v.classicsOnly; }), html = '';
      list.sort(function (a, b) { return (a.category === 'classic' ? 0 : 1) - (b.category === 'classic' ? 0 : 1); });
      for (var i = 0; i < Math.min(n, list.length); i++) {
        var v = list[i];
        html += '<a class="mini" href="' + href(v) + '">' + thumb(v, '') + '<div><h3>' + esc(v.title || v.id) + '</h3>' + lines(v) + '</div></a>';
      }
      g.innerHTML = html;
    });
  };
  window.rrRenderCards();
})();
