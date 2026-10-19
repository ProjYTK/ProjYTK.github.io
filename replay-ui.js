// RawReplay shared UI bits: track rows that play inline, share buttons, active-row highlight.
(function () {
  var R = window.REPLAY;
  function row(r, i, withRelease) {
    var t = r.tracks[i];
    var sub = withRelease
      ? '<a href="artist.html?a=' + R.slug(r.artist) + '">' + R.esc(r.artist) + '</a> &middot; <a href="album.html?id=' + r.id + '">' + R.esc(r.title) + "</a>"
      : R.esc(r.artist);
    return '<li data-id="' + r.id + '" data-i="' + i + '">' +
      '<button type="button" class="tp" aria-label="Play ' + R.esc(t.title) + '"><span class="n">' + (withRelease ? "&#9654;&#xFE0E;" : i + 1) + '</span><span class="i" aria-hidden="true">&#9654;&#xFE0E;</span></button>' +
      '<span class="t"><b>' + R.esc(t.title) + "</b><small>" + sub + "</small></span>" +
      '<span class="d">' + t.length + "</span>" +
      '<button type="button" class="sh" aria-label="Copy link to ' + R.esc(t.title) + '">Share</button></li>';
  }
  function bind(list) {
    list.addEventListener("click", function (e) {
      var li = e.target.closest("li[data-id]"); if (!li || e.target.closest("a")) return;
      var r = R.get(li.dataset.id), i = +li.dataset.i;
      if (e.target.closest(".sh")) { RP.share(R.trackUrl(r, i), e.target.closest(".sh")); return; }
      RP.play(r, i);
    });
    function upd(rel, cur, playing) {
      list.querySelectorAll("li[data-id]").forEach(function (li) {
        var on = rel && li.dataset.id === rel.id && +li.dataset.i === cur;
        li.classList.toggle("on", !!on);
        var b = li.querySelector(".tp"), title = li.querySelector(".t b").textContent;
        b.querySelector(".i").innerHTML = on && playing ? "&#10074;&#10074;" : "&#9654;&#xFE0E;";
        b.setAttribute("aria-label", (on && playing ? "Pause " : "Play ") + title);
        if (on) li.setAttribute("aria-current", "true"); else li.removeAttribute("aria-current");
      });
    }
    RP.onChange(upd);
    return function () { var c = RP.current(); upd(c.rel, c.i, c.playing); };
  }
  function card(r) {
    return '<a class="card" href="album.html?id=' + r.id + '"><img src="' + R.cover(r) + '" alt="" loading="lazy"><b>' + R.esc(r.title) +
      "</b><span>" + R.esc(r.artist) + " &middot; " + r.tracks.length + " tracks &middot; " + r.released.slice(0, 4) + "</span></a>";
  }
  window.RPUI = { row: row, bind: bind, card: card };
})();
