// Shared card rendering for index, channel and watch pages.
// Real videos come from videos.js and link to watch.html?v=<id>(&host=clipplace).
// Placeholder slots are not videos, so they link to upload.html as "Your video here".
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var vids = window.VIDEOS || [];
  function href(v) { return 'watch.html?v=' + encodeURIComponent(v.id) + (v.host === 'clipplace' ? '&host=clipplace' : ''); }
  function thumb(v, label) {
    var img = v && v.host !== 'clipplace' ? '<img class="rr-timg" alt="" loading="lazy" src="https://archive.org/services/img/' + encodeURIComponent(v.id) + '" onerror="this.remove()">' : '';
    return '<div class="thumb">' + img + label + '</div>';
  }
  window.rrRenderCards = function () {
    var current = new URLSearchParams(location.search).get('v');
    document.querySelectorAll('[data-cards]').forEach(function (g) {
      var n = +g.dataset.cards, html = '';
      for (var i = 0; i < n; i++) {
        var v = vids[i];
        html += v
          ? '<a class="card" href="' + href(v) + '">' + thumb(v, '') + '<div class="meta"><h3>' + esc(v.title || v.id) + '</h3><small>' + esc(v.creator || '') + (v.host === 'clipplace' ? ' · clip.place' : ' · Internet Archive') + '</small></div></a>'
          : '<a class="card rr-slot" href="upload.html">' + thumb(null, 'Your video here') + '<div class="meta"><h3>Your video here</h3><small>Open spot · upload to fill it</small></div></a>';
      }
      g.innerHTML = html;
    });
    document.querySelectorAll('[data-minis]').forEach(function (g) {
      var n = +g.dataset.minis, list = vids.filter(function (v) { return v.id !== current; }), html = '';
      for (var i = 0; i < n; i++) {
        var v = list[i];
        html += v
          ? '<a class="mini" href="' + href(v) + '">' + thumb(v, '') + '<div><h3>' + esc(v.title || v.id) + '</h3><small>' + esc(v.creator || '') + '<br>' + (v.host === 'clipplace' ? 'clip.place' : 'Internet Archive') + '</small></div></a>'
          : '<a class="mini rr-slot" href="upload.html">' + thumb(null, 'Your video here') + '<div><h3>Your video here</h3><small>Open spot<br>upload to fill it</small></div></a>';
      }
      g.innerHTML = html;
    });
  };
  window.rrRenderCards();
})();
