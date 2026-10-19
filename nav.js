// RawReel header "More" menu. It's a plain <details>, so it opens and closes without JS
// (click, Enter or Space on the summary). This only adds: close on outside click, close on Escape.
(function () {
  var menus = document.querySelectorAll('details.more');
  function closeAll(except) { menus.forEach(function (d) { if (d !== except) d.open = false; }); }
  document.addEventListener('click', function (e) {
    menus.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menus.forEach(function (d) { if (d.open) { d.open = false; d.querySelector('summary').focus(); } });
  });
  menus.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) closeAll(d); }); });
})();
