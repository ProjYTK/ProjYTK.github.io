// RawReplay test data. All audio is from Internet Archive items licensed CC0 1.0
// (verified via archive.org/metadata/<id>, licenseurl = creativecommons.org/publicdomain/zero/1.0/).
window.REPLAY_RELEASES = [
  { id: "invisible-reflexion", archiveId: "gt575Deafness-InvisibleReflexion",
    title: "Invisible Reflexion", artist: "deafness", released: "2012-10-30",
    license: "CC0 1.0 (Public Domain Dedication)", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    credit: "deafness, \u201cInvisible Reflexion\u201d [GT575], uploaded by Mad God to the Internet Archive",
    tracks: [
      { title: "Emission", file: "02.Emission.mp3", length: "2:30" },
      { title: "Crowdy", file: "03.Crowdy.mp3", length: "2:50" },
      { title: "Invisible Reflexion", file: "04.InvisibleReflexion.mp3", length: "2:38" },
      { title: "4N07H3R L13", file: "05.4n07h3rL13.mp3", length: "2:41" } ] },
  { id: "calm", archiveId: "gt564Senselessness-Calm",
    title: "Calm", artist: "senselessness", released: "2012-09-09",
    license: "CC0 1.0 (Public Domain Dedication)", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    credit: "senselessness, \u201cCalm\u201d [GT564], uploaded by Mad God to the Internet Archive",
    tracks: [
      { title: "Hidden Predator", file: "7.HiddenPredator.mp3", length: "1:06" },
      { title: "Black Block", file: "2.BlackBlock.mp3", length: "2:11" },
      { title: "Damned", file: "3.Damned.mp3", length: "3:09" },
      { title: "Ghosty", file: "5.Ghosty.mp3", length: "3:39" } ] }
];
window.REPLAY = {
  src: function (r, t) { return "https://archive.org/download/" + r.archiveId + "/" + encodeURIComponent(t.file); },
  cover: function (r) { return "https://archive.org/services/img/" + r.archiveId; },
  item: function (r) { return "https://archive.org/details/" + r.archiveId; },
  secs: function (s) { var p = s.split(":"); return (+p[0]) * 60 + (+p[1]); },
  fmt: function (n) { n = Math.max(0, Math.floor(n || 0)); return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0"); },
  esc: function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); },
  get: function (id) { return window.REPLAY_RELEASES.filter(function (r) { return r.id === id; })[0]; }
};
