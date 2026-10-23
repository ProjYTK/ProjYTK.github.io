(function () {
  var R = REPLAY, q = new URLSearchParams(location.search), id = q.get("id"), rel = R.get(id), main = document.getElementById("main");
  var crumbs = '<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">RawReel</a></li><li><a href="replay.html">Music</a></li>';
  if (!rel) {
    document.title = "Release not found | RawReplay";
    main.innerHTML = crumbs + '<li><a href="releases.html">Releases</a></li></ol></nav><section class="empty"><span class="orb"></span><h1>' + "Release not found" + "</h1><p>" + (id ? "We couldn\u2019t find that release. It may have been removed, or the link is mistyped." : "No release was picked. Browse the releases to find one.") + '</p><div class="acts"><a class="btn" href="releases.html">Browse all releases</a><a class="ghost" href="replay.html">Music home</a><a class="ghost" href="index.html">Back to RawReel</a></div></section>';
    return;
  }
  var total = rel.tracks.reduce(function (s, t) { return s + R.secs(t.length); }, 0), aslug = R.slug(rel.artist);
  document.title = rel.title + " by " + rel.artist + " | RawReplay";
  var h = crumbs + '<li><a href="artist.html?a=' + aslug + '">' + R.esc(rel.artist) + '</a></li><li aria-current="page">' + R.esc(rel.title) + '</li></ol></nav>' +
    '<section class="rel"><img class="cover" src="' + R.cover(rel) + '" alt="Cover of ' + R.esc(rel.title) + '"><div><div class="kind">Release</div><h1>' + R.esc(rel.title) + "</h1>" +
    '<div class="meta"><a href="artist.html?a=' + aslug + '"><b>' + R.esc(rel.artist) + "</b></a> &middot; " + rel.released.slice(0, 4) + " &middot; " + rel.tracks.length + " tracks &middot; " + R.fmt(total) + "</div>" +
    (rel.blurb ? '<p class="blurb">' + R.esc(rel.blurb) + "</p>" : "") +
    '<div class="acts"><button type="button" class="bigplay" id="big" aria-label="Play release">&#9654;&#xFE0E;</button><button type="button" class="ghost" id="shareRel">Share release</button></div></div></section><ul class="tracks" id="list">';
  rel.tracks.forEach(function (t, i) { h += RPUI.row(rel, i, false); });
  h += '</ul><div class="license"><b>License:</b> <a href="' + rel.licenseUrl + '" target="_blank" rel="noopener">' + rel.license + "</a><br><b>Credit:</b> " + R.esc(rel.credit) +
    '. Source: <a href="' + R.item(rel) + '" target="_blank" rel="noopener">' + (rel.sourceLabel ? R.esc(rel.sourceLabel) : "archive.org/details/" + rel.archiveId) + "</a>" +
    (rel.host === "fma" ? '<br><b>Tracks:</b> ' + rel.tracks.map(function (t) { return '<a href="' + t.page + '" target="_blank" rel="noopener">\u201c' + R.esc(t.title) + '\u201d</a> by ' + (rel.artistUrl ? '<a href="' + rel.artistUrl + '" target="_blank" rel="noopener">' + R.esc(rel.artist) + '</a>' : R.esc(rel.artist)); }).join(", ") + ', each licensed <a href="' + rel.licenseUrl + '" target="_blank" rel="noopener">CC BY 4.0</a>.'
      : "<br><i>These two releases are test data used to build the player. They aren\u2019t RawReplay artist submissions.</i>") + "</div>";
  main.innerHTML = h;
  var list = document.getElementById("list"), big = document.getElementById("big");
  RPUI.bind(list);
  big.onclick = function () { var c = RP.current(); if (c.rel === rel) RP.toggle(); else RP.select(rel, 0); };
  document.getElementById("shareRel").onclick = function () { RP.share("album.html?id=" + encodeURIComponent(rel.id), this); };
  RP.onChange(function (r, i, playing) { var mine = r === rel && playing; big.innerHTML = mine ? "&#10074;&#10074;" : "&#9654;&#xFE0E;"; big.setAttribute("aria-label", mine ? "Pause" : "Play release"); });
  var start = parseInt(q.get("t"), 10);
  if (start >= 0 && start < rel.tracks.length) {
    var c = RP.current();
    if (!(c.rel === rel && c.i === start)) RP.select(rel, start); // tries to autoplay; if the browser blocks it, the player says "Press play"
    var li = list.children[start]; if (li) li.scrollIntoView({ block: "center" });
  }
})();
(function(){var p=new URLSearchParams(location.search),k=p.has("id")?"id":(p.has("a")?"a":null),u=location.origin+location.pathname+(k?"?"+k+"="+encodeURIComponent(p.get(k)):"");var c=document.querySelector('link[rel=canonical]'),o=document.querySelector('meta[property="og:url"]');if(c)c.href=u;if(o)o.content=u;var t=document.querySelector('meta[property="og:title"]');if(t)t.content=document.title;})();
