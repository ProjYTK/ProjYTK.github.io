// RawReel account and video states (no server yet, so states come from a data field or a preview param).
//   Accounts (profile.html, channel.html): status "private" | "banned" | "suspended" | "deleted"
//     preview: ?state=private|banned|suspended|deleted   (suspended: optional &until=YYYY-MM-DD)
//   Videos (watch.html): status "removed" | "uploader" | "copyright" | "private" | "account-banned"
//     preview: watch.html?v=<id>&state=removed|uploader|copyright|private|account-banned
// Calm wording, no player or download for unavailable videos. Exposes window.RRState.
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  function until(d) { var f = window.rrFormatDate ? rrFormatDate(d) : ''; return f; }
  var HOME = '<a class="btn" href="index.html">Go home</a><a class="ghost" href="classics.html">Browse Classics</a>';
  var ACCOUNT = {
    private: { icon: '&#128274;', h: 'This profile is private', p: function () { return 'The owner has chosen to keep their profile to themselves. Their name and handle are shown, but their videos and lists are not.'; } },
    banned: { icon: '&#9888;&#xFE0E;', h: 'This account was removed', p: function () { return 'This account was removed for breaking the <a href="rules.html">RawReel rules</a>. Its videos and profile are no longer shown.'; } },
    suspended: { icon: '&#9203;&#xFE0E;', h: 'This account is temporarily restricted', p: function (o) { var u = o && o.until ? until(o.until) : ''; return 'This account is paused for a while under the <a href="rules.html">RawReel rules</a>' + (u ? ', until <b>' + esc(u) + '</b>' : '') + '. Its profile and videos will be back when the restriction ends.'; } },
    deleted: { icon: '?', h: "This account doesn't exist", p: function () { return "There's no account at this link. It may have been deleted, or the link may be mistyped."; } }
  };
  var VIDEO = {
    removed: { h: 'This video was removed', p: 'It was taken down for breaking the <a href="rules.html">RawReel rules</a>.' },
    uploader: { h: 'This video was removed by the uploader', p: 'The person who posted it took it down. Their other videos may still be available.' },
    copyright: { h: 'This video is unavailable', p: 'It was removed after a copyright notice from a rights holder.' },
    private: { h: 'This video is private', p: 'The uploader has made this video private, so only they can watch it.' },
    'account-banned': { h: 'This video is unavailable', p: "The account that posted it was removed for breaking the <a href=\"rules.html\">RawReel rules</a>, so its videos aren't shown." }
  };
  function card(icon, h, p, id) {
    return '<div class="rr-state" role="status" aria-labelledby="' + id + '"><span class="rr-state-ic" aria-hidden="true">' + icon + '</span><h2 id="' + id + '">' + esc(h) + '</h2><p>' + p + '</p><div class="rr-state-btns">' + HOME + '</div></div>';
  }
  function param() { var s = new URLSearchParams(location.search); return { state: (s.get('state') || '').toLowerCase(), until: s.get('until') || '' }; }
  window.RRState = {
    ACCOUNT: ACCOUNT, VIDEO: VIDEO, param: param,
    isAccount: function (s) { return !!ACCOUNT[s]; }, isVideo: function (s) { return !!VIDEO[s]; },
    accountCard: function (s, o) { var a = ACCOUNT[s]; return a ? card(a.icon, a.h, a.p(o || {}), 'rr-state-h') : ''; },
    videoCard: function (s) { var v = VIDEO[s]; return v ? card('&#9654;&#xFE0E;', v.h, v.p, 'rr-state-h') : ''; },
    title: function (s) { return (ACCOUNT[s] || VIDEO[s] || {}).h || ''; }
  };
})();
