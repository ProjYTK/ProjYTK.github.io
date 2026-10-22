(function () {
  var R = REPLAY, slug = new URLSearchParams(location.search).get("a"), main = document.getElementById("main");
  var crumbs = '<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">RawReel</a></li><li><a href="replay.html">Music</a></li><li><a href="artist.html">Artists</a></li>';
  if (!slug) {
    document.title = "Artists | RawReplay";
    main.innerHTML = crumbs.replace('<li><a href="artist.html">Artists</a></li>', '<li aria-current="page">Artists</li>') + '</ol></nav><h1>Artists</h1><div class="grid">' + R.artists().map(function (a) {
      return '<a class="card artist-card" href="artist.html?a=' + a.slug + '"><span class="av" aria-hidden="true">' + R.esc(a.name.charAt(0).toUpperCase()) + "</span><b>" + R.esc(a.name) + "</b><span>" + a.releases.length + " release" + (a.releases.length > 1 ? "s" : "") + "</span></a>";
    }).join("") + "</div>";
    return;
  }
  var rels = R.byArtist(slug);
  if (!rels.length) {
    document.title = "Artist not found | RawReplay";
    main.innerHTML = crumbs + '</ol></nav><section class="empty"><span class="orb"></span><h1>Artist not found</h1><p>We couldn\u2019t find that artist. The link may be old or mistyped.</p><div class="acts"><a class="btn" href="artist.html">All artists</a><a class="ghost" href="replay.html">Music home</a><a class="ghost" href="index.html">Back to RawReel</a></div></section>';
    return;
  }
  var name = rels[0].artist, n = rels.reduce(function (s, r) { return s + r.tracks.length; }, 0);
  document.title = name + " | RawReplay";
  var h = crumbs + '<li aria-current="page">' + R.esc(name) + '</li></ol></nav><section class="rel"><span class="av-big orb" style="width:160px;height:160px" aria-hidden="true"></span><div><div class="kind">Artist</div><h1>' + R.esc(name) + '</h1><div class="meta">' + rels.length + " release" + (rels.length > 1 ? "s" : "") + " &middot; " + n + ' tracks</div><div class="acts"><button type="button" class="btn" id="playAll">&#9654;&#xFE0E; Play latest release</button></div></div></section>';
  h += '<h2>Releases</h2><div class="grid">' + rels.map(RPUI.card).join("") + '</div><h2>Tracks</h2><ul class="tracks" id="list">';
  rels.forEach(function (r) { r.tracks.forEach(function (t, i) { h += RPUI.row(r, i, true); }); });
  main.innerHTML = h + "</ul>";
  RPUI.bind(document.getElementById("list"));
  document.getElementById("playAll").onclick = function () { RP.select(rels.slice().sort(function (a, b) { return b.released.localeCompare(a.released); })[0], 0); };
})();
(function(){var p=new URLSearchParams(location.search),k=p.has("id")?"id":(p.has("a")?"a":null),u=location.origin+location.pathname+(k?"?"+k+"="+encodeURIComponent(p.get(k)):"");var c=document.querySelector('link[rel=canonical]'),o=document.querySelector('meta[property="og:url"]');if(c)c.href=u;if(o)o.content=u;var t=document.querySelector('meta[property="og:title"]');if(t)t.content=document.title;})();
