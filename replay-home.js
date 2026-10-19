(function () {
  var R = REPLAY, rels = REPLAY_RELEASES.slice().sort(function (a, b) { return b.released.localeCompare(a.released); });
  document.getElementById("grid").innerHTML = rels.map(RPUI.card).join("");
  document.getElementById("artists").innerHTML = R.artists().map(function (a) {
    return '<a class="card artist-card" href="artist.html?a=' + a.slug + '"><span class="av" aria-hidden="true">' + R.esc(a.name.charAt(0).toUpperCase()) + "</span><b>" + R.esc(a.name) + "</b><span>" + a.releases.length + " release" + (a.releases.length > 1 ? "s" : "") + "</span></a>";
  }).join("");
  var f = "";
  rels.forEach(function (r) { r.tracks.slice(0, 2).forEach(function (t, i) { f += RPUI.row(r, i, true); }); });
  var list = document.getElementById("fresh"); list.innerHTML = f; RPUI.bind(list);
})();
