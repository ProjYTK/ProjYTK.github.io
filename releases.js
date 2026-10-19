(function () {
  var R = REPLAY, q = new URLSearchParams(location.search);
  var inp = document.getElementById("q"), sort = document.getElementById("sort");
  inp.value = q.get("q") || "";
  var tl = document.getElementById("tracks"), refresh = RPUI.bind(tl);
  function norm(s) { return String(s).toLowerCase(); }
  function render() {
    var term = norm(inp.value.trim());
    var rels = REPLAY_RELEASES.slice();
    if (sort.value === "new") rels.sort(function (a, b) { return b.released.localeCompare(a.released); });
    else if (sort.value === "old") rels.sort(function (a, b) { return a.released.localeCompare(b.released); });
    else rels.sort(function (a, b) { return a.title.localeCompare(b.title); });
    var hitR = rels.filter(function (r) { return !term || norm(r.title + " " + r.artist).indexOf(term) >= 0 || r.tracks.some(function (t) { return norm(t.title).indexOf(term) >= 0; }); });
    var rows = "", n = 0;
    if (term) rels.forEach(function (r) { r.tracks.forEach(function (t, i) { if (norm(t.title + " " + r.artist + " " + r.title).indexOf(term) >= 0) { rows += RPUI.row(r, i, true); n++; } }); });
    document.getElementById("grid").innerHTML = hitR.map(RPUI.card).join("");
    document.getElementById("count").textContent = hitR.length + " release" + (hitR.length === 1 ? "" : "s") + (term ? ", " + n + " track" + (n === 1 ? "" : "s") + " matching \u201c" + inp.value.trim() + "\u201d" : "");
    document.getElementById("trackSec").hidden = !term || !n;
    tl.innerHTML = rows; refresh();
    document.getElementById("none").hidden = !!hitR.length;
    var u = new URL(location.href); if (term) u.searchParams.set("q", inp.value.trim()); else u.searchParams.delete("q"); history.replaceState(null, "", u);
  }
  inp.addEventListener("input", render); sort.addEventListener("change", render);
  document.getElementById("filterForm").addEventListener("submit", function (e) { e.preventDefault(); render(); });
  document.getElementById("clear").onclick = function () { inp.value = ""; render(); inp.focus(); };
  render();
})();
