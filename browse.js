// RawReel browse bar (classics.html, collections.html): grid/list view, sort, and filter chips
// (genre, decade, silent/sound). One shared choice, saved in localStorage "rr_browse". Exposes window.RRBrowse.
(function () {
  var KEY = 'rr_browse', D = { view: 'grid', sort: 'newest', genre: [], decade: [], sound: '' };
  var st = {}; try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  for (var k in D) if (!(k in st)) st[k] = D[k];
  if (!Array.isArray(st.genre)) st.genre = []; if (!Array.isArray(st.decade)) st.decade = [];
  var subs = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} document.documentElement.setAttribute('data-view', st.view); subs.forEach(function (f) { f(); }); }
  document.documentElement.setAttribute('data-view', st.view);
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var title = function (v) { return window.rrTitle ? rrTitle(v) : String(v.title || v.id); };
  var SORTS = {
    newest: function (a, b) { return (b.year || 0) - (a.year || 0) || String(b.date || '').localeCompare(String(a.date || '')); },
    oldest: function (a, b) { return (a.year || 9999) - (b.year || 9999) || String(a.date || '').localeCompare(String(b.date || '')); },
    az: function (a, b) { return title(a).replace(/^(the|a|an)\s+/i, '').localeCompare(title(b).replace(/^(the|a|an)\s+/i, ''), undefined, { sensitivity: 'base' }); },
    runtime: function (a, b) { var x = rrRuntime(a), y = rrRuntime(b); return (x == null) - (y == null) || (x || 0) - (y || 0); }
  };
  function apply(list) {
    var out = list.filter(function (v) {
      if (st.genre.length && st.genre.indexOf(rrGenre(v)) === -1) return false;
      if (st.decade.length && st.decade.indexOf(rrDecade(v)) === -1) return false;
      if (st.sound === 'silent' && !v.silent) return false;
      if (st.sound === 'sound' && v.silent) return false;
      return true;
    });
    var f = SORTS[st.sort] || SORTS.newest, idx = new Map(); out.forEach(function (v, i) { idx.set(v, i); });
    return out.sort(function (a, b) { return f(a, b) || idx.get(a) - idx.get(b); });
  }
  function chips(group, values, label) {
    return '<div class="grp" role="group" aria-label="' + esc(label) + '"><b>' + esc(label) + '</b>' + values.map(function (v) {
      var on = group === 'sound' ? st.sound === v[0] : st[group].indexOf(v[0]) !== -1;
      return '<button type="button" class="chip" data-g="' + group + '" data-v="' + esc(v[0]) + '" aria-pressed="' + on + '">' + esc(v[1]) + '</button>';
    }).join('') + '</div>';
  }
  function mount(bar, list) {
    var genres = Object.keys(window.RR_GENRES || {}).concat('More classics').filter(function (g) { return list.some(function (v) { return rrGenre(v) === g; }); });
    var decades = list.map(rrDecade).filter(function (d, i, a) { return a.indexOf(d) === i; }).sort();
    function draw() {
      var n = st.genre.length + st.decade.length + (st.sound ? 1 : 0);
      bar.innerHTML =
        '<div class="grp" role="group" aria-label="View"><button type="button" class="chip" data-view="grid" aria-pressed="' + (st.view === 'grid') + '">Grid</button><button type="button" class="chip" data-view="list" aria-pressed="' + (st.view === 'list') + '">List</button></div>' +
        '<div class="grp"><label for="rr-sort"><b>Sort</b></label><select class="field" id="rr-sort">' +
        [['newest', 'Newest'], ['oldest', 'Oldest'], ['az', 'A to Z'], ['runtime', 'Runtime']].map(function (o) { return '<option value="' + o[0] + '"' + (st.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
        '<details class="rr-filters"' + (bar.dataset.open ? ' open' : '') + '><summary class="chip">Filters' + (n ? ' (' + n + ')' : '') + '</summary><div class="rr-fpanel">' +
        chips('genre', genres.map(function (g) { return [g, g.split(':')[0]]; }), 'Genre') +
        chips('decade', decades.map(function (d) { return [d, d]; }), 'Decade') +
        chips('sound', [['silent', 'Silent'], ['sound', 'With sound']], 'Sound') +
        (n ? '<div class="grp"><button type="button" class="ghost" data-clear>Clear filters</button></div>' : '') + '</div></details>' +
        '<span class="count" aria-live="polite">' + apply(list).length + ' of ' + list.length + ' films</span>';
      bar.querySelector('details').addEventListener('toggle', function (e) { if (e.target.open) bar.dataset.open = '1'; else delete bar.dataset.open; });
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.view) st.view = b.dataset.view;
      else if (b.hasAttribute('data-clear')) { st.genre = []; st.decade = []; st.sound = ''; }
      else if (b.dataset.g === 'sound') st.sound = st.sound === b.dataset.v ? '' : b.dataset.v;
      else if (b.dataset.g) { var a = st[b.dataset.g], i = a.indexOf(b.dataset.v); if (i === -1) a.push(b.dataset.v); else a.splice(i, 1); }
      else return;
      var keep = b.dataset.g ? '[data-g="' + b.dataset.g + '"][data-v="' + CSS.escape(b.dataset.v) + '"]' : b.dataset.view ? '[data-view="' + b.dataset.view + '"]' : 'summary';
      save(); draw(); var f = bar.querySelector(keep); if (f) f.focus();
    });
    bar.addEventListener('change', function (e) { if (e.target.id === 'rr-sort') { st.sort = e.target.value; save(); draw(); bar.querySelector('#rr-sort').focus(); } });
    subs.push(function () { var c = bar.querySelector('.count'); if (c) c.textContent = apply(list).length + ' of ' + list.length + ' films'; });
    draw();
  }
  window.RRBrowse = { state: st, apply: apply, mount: mount, onChange: function (f) { subs.push(f); } };
  // classics.html: <div class="rr-bar" data-browse-bar></div> + <main class="grid rr-browse" data-cards="all" data-browse ...>
  var grid = document.querySelector('.grid[data-browse]'), bar = document.querySelector('[data-browse-bar]');
  if (grid && bar && !document.getElementById('rr-collections')) {
    var cat = grid.dataset.category, all = (window.VIDEOS || []).filter(function (v) { return (!cat || v.category === cat) && !v.hold && (!window.RRS || RRS.allow(v, { home: false })); });
    var draw = function () { var l = apply(all); grid.innerHTML = l.length ? l.map(function (v) { return rrCard(v); }).join('') : '<p class="empty-note">No films match these filters.</p>'; if (window.rrFillClipThumbs) rrFillClipThumbs(); };
    mount(bar, all); subs.push(draw); draw();
  }
})();
