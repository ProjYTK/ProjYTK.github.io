// RawReel Collections: the classics library grouped by genre or by decade. Cards link to watch pages.
// Genres are hand-assigned by id; anything new in videos.js without a genre lands in "More classics".
(function () {
  var G = window.RR_GENRES || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var all = (window.VIDEOS || []).filter(function (v) { return v.category === 'classic' && !v.hold && (!window.RRS || RRS.allow(v, { home: false })); });
  var byId = {}; all.forEach(function (v) { byId[v.id] = v; });
  function card(v) { return window.rrCard(v, v.year ? ' (' + esc(v.year) + ')' : ''); }
  function section(name, list) {
    if (!list.length) return '';
    var slug = 'c-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return '<h2 class="sec-h" id="' + slug + '"><span>' + esc(name) + '</span><small>' + list.length + (list.length === 1 ? ' film' : ' films') + '</small></h2><div class="grid rr-browse">' + list.map(card).join('') + '</div>';
  }
  var byYear = function (a, b) { return (a.year || 0) - (b.year || 0) || String(a.title).localeCompare(String(b.title)); };
  var B = window.RRBrowse, cur = 'genre';
  function render(mode) {
    var out = '', used = {}, keep = {};
    if (B) B.apply(all).forEach(function (v, i) { keep[v.id] = i + 1; });
    var srt = function (l) { return B ? l.filter(function (v) { return keep[v.id]; }).sort(function (a, b) { return keep[a.id] - keep[b.id]; }) : l.sort(byYear); };
    if (mode === 'decade') {
      var d = {}; all.forEach(function (v) { var k = v.year ? Math.floor(v.year / 10) * 10 + 's' : 'Undated'; (d[k] = d[k] || []).push(v); });
      Object.keys(d).sort().forEach(function (k) { out += section(k, srt(d[k])); });
    } else {
      Object.keys(G).forEach(function (k) { var l = G[k].map(function (id) { return byId[id]; }).filter(function (v) { if (!v || used[v.id]) return false; used[v.id] = 1; return true; }); out += section(k, srt(l)); });
      out += section('More classics', srt(all.filter(function (v) { return !used[v.id]; })));
    }
    var box = document.getElementById('rr-collections');
    box.innerHTML = out || '<p class="empty-note">No films match these filters.</p>';
    if (window.rrFillClipThumbs) rrFillClipThumbs();
  }
  var btns = document.querySelectorAll('.rr-col-toggle button');
  function pick(mode) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
    try { localStorage.setItem('rr_col_mode', mode); } catch (e) {}
    cur = mode; render(mode);
  }
  var bar = document.querySelector('[data-browse-bar]');
  if (B && bar) { B.mount(bar, all); B.onChange(function () { render(cur); }); }
  btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.mode); }); });
  var start = 'genre'; try { start = localStorage.getItem('rr_col_mode') === 'decade' ? 'decade' : 'genre'; } catch (e) {}
  pick(start);
})();
