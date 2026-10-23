// settings.html: binds every control to RRS (settings.js). Changes save and apply instantly.
(function () {
  var S = window.RRS; if (!S) return;
  var msg = document.getElementById('s-msg'), mt = 0;
  function say(t) { msg.textContent = t; clearTimeout(mt); mt = setTimeout(function () { msg.textContent = ''; }, 2500); }
  function fill() {
    var a = S.all();
    document.querySelectorAll('[name]').forEach(function (el) {
      var k = el.name; if (!k || !(k in a)) return;
      if (el.type === 'radio') el.checked = String(a[k]) === el.value;
      else if (el.type === 'checkbox') el.checked = !!a[k];
      else el.value = String(a[k]);
    });
    document.getElementById('s-volume-o').textContent = a.volume + '%';
  }
  document.querySelectorAll('[name]').forEach(function (el) {
    el.addEventListener(el.type === 'range' ? 'input' : 'change', function () {
      var v = el.type === 'checkbox' ? el.checked : el.type === 'range' ? +el.value : el.value;
      S.set(el.name, v); if (el.type === 'range') document.getElementById('s-volume-o').textContent = v + '%';
      say('Saved');
    });
  });
  document.getElementById('s-clear').addEventListener('click', function () { S.clearHistory(); say('Watch history cleared'); });
  var cv = document.getElementById('s-clear-votes');
  if (cv) cv.addEventListener('click', function () { if (window.RRRec) RRRec.clear(); else try { localStorage.removeItem('rr_votes'); } catch (e) {} say('Likes and dislikes cleared'); });
  document.getElementById('s-clear-favs').addEventListener('click', function () { S.clearFavs(); say('Favorites cleared'); });
  document.getElementById('s-clear-all').addEventListener('click', function () { if (!confirm('Clear all RawReel data stored in this browser?')) return; S.clearAll(); fill(); say('All RawReel data on this device cleared'); });
  document.getElementById('s-reset').addEventListener('click', function () { if (!confirm('Reset all settings to the defaults?')) return; S.reset(); fill(); say('Settings reset'); });
  fill();
})();
