// RawReel account pages (signin, signup, account, my-channel, my-uploads, notifications, subscriptions).
// PEERTUBE_ENABLED=false: forms still validate, but submitting only shows the "Accounts open soon" note.
// Nothing is saved, and passwords are never stored anywhere (with the server on, only OAuth tokens are kept).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pt = window.RRPT, on = !!(pt && pt.enabled);
  var page = (document.querySelector('[data-page]') || {}).dataset.page;
  var soon = document.querySelector('[data-soon]');
  if (soon) soon.hidden = on;
  var NEED_AUTH = ['account', 'my-channel', 'my-uploads', 'notifications', 'subscriptions'];
  if (on && NEED_AUTH.indexOf(page) !== -1 && !pt.isSignedIn()) { location.replace('signin.html?next=' + encodeURIComponent(page + '.html')); return; }

  function errBox(f) { return f.querySelector('.ferr'); }
  function okBox(f) { return f.querySelector('.okmsg'); }
  function fail(f, input, msg) { errBox(f).textContent = msg; if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); } return false; }
  function clear(f) { errBox(f).textContent = ''; if (okBox(f)) okBox(f).textContent = ''; f.querySelectorAll('[aria-invalid]').forEach(function (i) { i.removeAttribute('aria-invalid'); }); }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, HANDLE = /^[a-z0-9_.]{1,50}$/;   // PeerTube username rule
  // Handle = PeerTube username. Reserved here so nobody grabs a staff-looking name first.
  var RESERVED = ['rawreel', 'admin', 'support', 'root', 'moderator', 'help', 'official', 'replay'];
  function handleProblem(h) {
    if (!h) return 'Pick a handle.';
    if (!HANDLE.test(h)) return 'Handles use 1 to 50 lowercase letters, numbers, dots and underscores.';
    if (RESERVED.indexOf(h) !== -1) return '@' + h + ' is reserved. Please pick another handle.';
    return '';
  }
  function showSoon(f) {
    // Never look like anything was saved: wipe password fields and point at the note.
    f.querySelectorAll('input[type=password]').forEach(function (i) { i.value = ''; });
    errBox(f).textContent = 'Accounts open soon. Coming with our own video server. Nothing was saved.';
    if (soon) { soon.classList.add('pulse'); soon.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }
  function bind(id, validate, run) {
    var f = $(id); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault(); clear(f);
      var data = validate(f); if (!data) return;
      if (!on) return showSoon(f);
      var b = f.querySelector('.btn'); b.disabled = true;
      Promise.resolve(run(data, f)).catch(function (x) { fail(f, null, x.message || 'Something went wrong.'); }).then(function () { b.disabled = false; });
    });
  }
  var next = new URLSearchParams(location.search).get('next');
  var safeNext = next && /^[a-z0-9-]+\.html$/.test(next) ? next : 'account.html';

  // Avatar picker (signup + account). The list lives in config.js -> RR_CONFIG.AVATARS.
  var AV = ((window.RR_CONFIG || {}).AVATARS || []), avChoice = null;
  (function () {
    var g = $('av-grid'); if (!g) return;
    if (!AV.length) { g.closest('fieldset').hidden = true; return; }
    var saved = null; try { saved = localStorage.getItem('rr_avatar_choice'); } catch (e) {}
    g.innerHTML = AV.map(function (a, i) {
      return '<label class="av-o"><input type="radio" name="avatar" value="' + esc(a.file) + '"' + ((saved ? saved === a.file : i === 0) ? ' checked' : '') + '><img src="' + esc(a.file) + '" alt="' + esc(a.label || 'Avatar ' + (i + 1)) + '" width="56" height="56"></label>';
    }).join('');
    function pick() { var c = g.querySelector('input:checked'); avChoice = c ? c.value : null;
      if (avChoice && $('ac-avatar-img')) { $('ac-avatar-img').style.backgroundImage = 'url(' + avChoice + ')'; if ($('ac-avatar')) $('ac-avatar').value = ''; } }
    g.addEventListener('change', function () { pick(); try { localStorage.setItem('rr_avatar_choice', avChoice); } catch (e) {} });
    pick();
  })();
  function presetFile() {
    if (!avChoice) return Promise.resolve(null);
    return fetch(avChoice).then(function (r) { return r.blob(); }).then(function (b) { return new File([b], avChoice.split('/').pop(), { type: b.type || 'image/png' }); });
  }

  // Live handle helper on signup: format + reserved check, then the availability stub (no request with the flag off).
  (function () {
    var u = $('su-user'), st = $('su-user-status'), pv = $('su-user-preview'); if (!u || !st) return;
    var t = null, seq = 0;
    u.addEventListener('input', function () {
      var cleaned = u.value.replace(/^@+/, '').toLowerCase().replace(/\s+/g, '');
      if (cleaned !== u.value) u.value = cleaned;
      if (pv) pv.textContent = cleaned || 'handle';
      clearTimeout(t); var my = ++seq;
      st.className = 'hint handle-status';
      if (!cleaned) { st.textContent = ''; return; }
      var p = handleProblem(cleaned);
      if (p) { st.textContent = p; st.classList.add('bad'); return; }
      if (!on) { st.textContent = 'Availability check opens with accounts.'; return; }
      st.textContent = 'Checking @' + cleaned + '…';
      t = setTimeout(function () {
        pt.checkHandle(cleaned).then(function (r) {
          if (my !== seq) return;
          if (r.status === 'free') { st.textContent = '@' + cleaned + ' is available right now. First come, first served.'; st.classList.add('good'); }
          else if (r.status === 'taken') { st.textContent = '@' + cleaned + ' is taken. Try another.'; st.classList.add('bad'); }
          else st.textContent = "Couldn't check right now. We'll check again when you sign up.";
        });
      }, 400);
    });
  })();

  // Sign in + forgot password
  bind('f-signin', function (f) {
    var u = $('si-user'), p = $('si-pass');
    if (!u.value.trim()) return fail(f, u, 'Enter your username or email.');
    if (!p.value) return fail(f, p, 'Enter your password.');
    return { u: u.value.trim(), p: p.value };
  }, function (d) { return pt.login(d.u, d.p).then(function () { $('si-pass').value = ''; location.href = safeNext; }); });
  function showForgot(yes) { if ($('f-forgot')) { $('f-forgot').hidden = !yes; $('f-signin').hidden = yes; } }
  if ($('forgot-link')) {
    $('forgot-link').addEventListener('click', function (e) { e.preventDefault(); showForgot(true); $('fg-email').focus(); });
    $('back-signin').addEventListener('click', function (e) { e.preventDefault(); showForgot(false); });
    if (location.hash === '#forgot') showForgot(true);
  }
  bind('f-forgot', function (f) {
    var m = $('fg-email'); if (!EMAIL.test(m.value.trim())) return fail(f, m, 'Enter the email address on your account.');
    return { m: m.value.trim() };
  }, function (d, f) { return pt.askResetPassword(d.m).then(function () { errBox(f).textContent = ''; f.querySelector('.fine').insertAdjacentHTML('beforebegin', '<p class="okmsg">If that email has an account, a reset link is on its way.</p>'); }); });

  // Sign up
  bind('f-signup', function (f) {
    var dn = $('su-display'), u = $('su-user'), m = $('su-email'), p = $('su-pass'), p2 = $('su-pass2'), c = $('su-channel');
    if (!dn.value.trim()) return fail(f, dn, 'Add a display name.');
    var hp = handleProblem(u.value.trim()); if (hp) return fail(f, u, hp);
    if (!EMAIL.test(m.value.trim())) return fail(f, m, 'Enter a valid email address.');
    if (p.value.length < 8) return fail(f, p, 'Use at least 8 characters for your password.');
    if (p.value !== p2.value) return fail(f, p2, "The passwords don't match.");
    if (!HANDLE.test(c.value.trim())) return fail(f, c, 'Channel handles use lowercase letters, numbers, dots and underscores.');
    if (RESERVED.indexOf(c.value.trim()) !== -1) return fail(f, c, 'That channel name is reserved. Please pick another.');
    if (c.value.trim() === u.value.trim()) return fail(f, c, 'Your channel handle must be different from your account handle.');
    if (!$('su-ok').checked) return fail(f, $('su-ok'), 'Please confirm your age and the rules.');
    return { username: u.value.trim(), displayName: dn.value.trim(), email: m.value.trim(), password: p.value, channel: { name: c.value.trim(), displayName: dn.value.trim() } };
  }, function (d, f) {
    // Signup may be off, open, or "requires approval" (FRIDAY-GUIDE §8.7). Ask the server first.
    return pt.config().then(function (c) {
      var su = (c && c.signup) || {};
      if (!su.allowed) throw new Error('Sign-up is closed right now. Email RR.Support.Agent@gmail.com and the team can create an account for you.');
      if (su.requiresApproval) {
        d.registrationReason = ($('su-reason').value.trim() || 'I want to back up my videos on RawReel.');
        return pt.requestRegistration(d).then(function () {
          f.innerHTML = '<div class="up-done"><span class="orb"></span><h2>Request sent</h2><p>The team reviews every new account. You\'ll get an email when it\'s approved.</p></div>';
        });
      }
      return pt.register(d).then(function () {
      return pt.login(d.username, d.password).then(function () {
        return presetFile().then(function (file) { return file ? pt.uploadAvatar(file).catch(function () {}) : null; }).then(function () { location.href = 'account.html'; });
      }, function () {
        f.innerHTML = '<div class="up-done"><span class="orb"></span><h2>Check your email</h2><p>Confirm your address, then <a href="signin.html">sign in</a>.</p></div>';
      });
      });
    });
  });

  // Account: profile, avatar, bio
  if ($('ac-bio')) $('ac-bio').addEventListener('input', function () { $('ac-bio-count').textContent = this.value.length; });
  var me = null;
  if (on && pt.isSignedIn() && NEED_AUTH.indexOf(page) !== -1) {
    pt.me().then(function (u) {
      me = u;
      if (page === 'account') {
        $('ac-display').value = u.account && u.account.displayName || '';
        $('ac-handle').value = u.username || '';
        if (u.account && u.account.displayName) $('ac-name').textContent = u.account.displayName; $('ac-bio').value = u.account && u.account.description || ''; $('ac-email').value = u.email || '';
        $('ac-bio-count').textContent = $('ac-bio').value.length;
        var av = u.account && (u.account.avatars || [])[0];
        if (av) $('ac-avatar-img').style.backgroundImage = 'url(' + pt.base + av.path + ')';
      }
      if ((page === 'account' || page === 'my-channel') && u.username) {
        var hl = $(page === 'account' ? 'ac-handle-line' : 'mc-handle'); if (hl) hl.textContent = '@' + u.username;
        if (page === 'my-channel' && u.account && u.account.displayName) $('mc-name').textContent = u.account.displayName;
      }
      if (page === 'my-channel') renderChannels(u.videoChannels || []);
    }).catch(function (x) { var f = document.querySelector('.acct-form'); if (f) errBox(f).textContent = 'Could not load your account: ' + x.message; });
  }
  if ($('ac-avatar')) $('ac-avatar').addEventListener('change', function () {
    var file = this.files[0], f = $('f-account'); clear(f); if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { this.value = ''; return fail(f, this, 'Choose a PNG, JPG or WebP image.'); }
    if (file.size > 4 * 1024 * 1024) { this.value = ''; return fail(f, this, 'That image is over 4 MB. Choose a smaller one.'); }
    $('ac-avatar-img').style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')';
  });
  bind('f-account', function (f) {
    var dn = $('ac-display'); if (!dn.value.trim()) return fail(f, dn, 'Add a display name.');
    return { displayName: dn.value.trim(), description: $('ac-bio').value.trim(), file: $('ac-avatar').files[0] };
  }, function (d, f) {
    return pt.updateMe({ displayName: d.displayName, description: d.description })
      .then(function () { return d.file || presetFile(); }).then(function (file) { return file ? pt.uploadAvatar(file) : null; })
      .then(function () { okBox(f).textContent = 'Profile saved.'; });
  });
  if ($('ac-signout')) $('ac-signout').addEventListener('click', function () { if (!on) return showSoon($('f-account')); pt.logout(); location.href = 'index.html'; });

  // My channel
  function renderChannels(list) {
    $('ch-list').innerHTML = list.length ? list.map(function (c) {
      return '<div class="acct-row"><span class="avatar"></span><div><b>' + esc(c.displayName) + '</b><br><small>@' + esc(c.name) + '@' + esc(c.host || 'video.rawreel.org') + '</small></div><a class="ghost" href="channel.html?c=' + encodeURIComponent(c.name) + '">View</a></div>';
    }).join('') : '<p class="empty-note">No channels yet.</p>';
  }
  bind('f-channel', function (f) {
    var dn = $('ch-display'), n = $('ch-name');
    if (!dn.value.trim()) return fail(f, dn, 'Add a channel display name.');
    if (!HANDLE.test(n.value.trim())) return fail(f, n, 'Handles use lowercase letters, numbers, dots and underscores.');
    if (RESERVED.indexOf(n.value.trim()) !== -1) return fail(f, n, 'That handle is reserved. Please pick another.');
    if (me && me.username === n.value.trim()) return fail(f, n, 'The channel handle must be different from your account handle.');
    return { displayName: dn.value.trim(), name: n.value.trim(), description: $('ch-desc').value.trim() };
  }, function (d, f) { return pt.createChannel(d).then(function () { okBox(f).textContent = 'Channel created.'; f.reset(); return pt.me().then(function (u) { renderChannels(u.videoChannels || []); }); }); });

  // My uploads: status from PeerTube. Blocked with a reason = rejected; blocked without one, or still processing = in review.
  function status(v) {
    if (v.blacklisted) return v.blacklistedReason && !/auto/i.test(v.blacklistedReason) ? 'rejected' : 'review';
    if (v.state && v.state.id !== 1) return 'review';
    return v.privacy && v.privacy.id === 1 ? 'live' : 'review';
  }
  var LABEL = { review: 'In review', live: 'Live', rejected: 'Rejected' }, uploads = [], filt = 'all';
  function renderUploads() {
    var list = uploads.filter(function (v) { return filt === 'all' || status(v) === filt; });
    $('up-list').innerHTML = list.length ? list.map(function (v) {
      var st = status(v);
      return '<div class="acct-row"><img class="acct-thumb" alt="" src="' + esc(pt.base + (v.thumbnailPath || '')) + '"><div><b>' + esc(v.name) + '</b><br><small>' + esc(window.RRS ? RRS.formatTime(v.createdAt) : v.createdAt) + '</small>' +
        (st === 'rejected' ? '<br><small class="ferr">' + esc(v.blacklistedReason) + '</small>' : '') + '</div><span class="st st-' + st + '">' + LABEL[st] + '</span>' + (st === 'live' ? '<a class="ghost" href="' + esc(pt.watchUrl(v)) + '">Watch</a>' : '') + '</div>';
    }).join('') : '<p class="empty-note">Nothing here. <a href="upload.html">Submit a video</a>.</p>';
  }
  document.querySelectorAll('.acct-filter button').forEach(function (b) {
    b.addEventListener('click', function () { filt = b.dataset.f; document.querySelectorAll('.acct-filter button').forEach(function (x) { x.classList.toggle('on', x === b); }); if (on) renderUploads(); });
  });
  if (on && page === 'my-uploads' && pt.isSignedIn()) pt.myVideos().then(function (r) { uploads = r.data || []; renderUploads(); }).catch(function (x) { $('up-list').innerHTML = '<p class="ferr">' + esc(x.message) + '</p>'; });

  // Notifications
  if (on && page === 'notifications' && pt.isSignedIn()) pt.notifications().then(function (r) {
    var d = r.data || []; if (!d.length) return;
    $('nt-list').innerHTML = d.map(function (n) {
      var what = n.video ? 'Video: ' + (n.video.name || '') : n.comment ? 'New comment' : n.actorFollow ? 'New subscriber' : n.abuse ? 'Report update' : 'Update';
      return '<div class="acct-row' + (n.read ? '' : ' unread') + '"><div><b>' + esc(what) + '</b><br><small>' + esc(window.RRS ? RRS.formatTime(n.createdAt) : n.createdAt) + '</small></div></div>';
    }).join('');
  });
  if ($('nt-readall')) $('nt-readall').addEventListener('click', function () {
    if (!on) { if (soon) soon.classList.add('pulse'); return; }
    pt.readAllNotifications().then(function () { document.querySelectorAll('.acct-row.unread').forEach(function (r) { r.classList.remove('unread'); }); });
  });

  // Subscriptions
  function loadSubs() {
    pt.subscriptions().then(function (r) {
      var d = r.data || []; if (!d.length) return;
      $('sb-list').innerHTML = d.map(function (c) { var uri = c.name + '@' + c.host;
        return '<div class="acct-row"><span class="avatar"></span><div><b>' + esc(c.displayName) + '</b><br><small>' + esc(uri) + '</small></div><button type="button" class="ghost" data-unsub="' + esc(uri) + '">Unsubscribe</button></div>'; }).join('');
      $('sb-list').querySelectorAll('[data-unsub]').forEach(function (b) { b.addEventListener('click', function () { pt.unsubscribe(b.dataset.unsub).then(loadSubs); }); });
    });
    pt.subscriptionVideos().then(function (r) {
      var d = r.data || []; if (!d.length) return;
      $('sb-videos').innerHTML = d.map(function (v) { return '<a class="card" href="' + esc(pt.watchUrl(v)) + '"><div class="thumb"><img class="rr-timg" alt="" src="' + esc(pt.base + v.thumbnailPath) + '"></div><div class="meta"><h3>' + esc(v.name) + '</h3><small class="m1">' + esc(v.channel && v.channel.displayName) + (v.account && v.account.name ? ' <span class="handle">@' + esc(v.account.name) + '</span>' : '') + '</small></div></a>'; }).join('');
    });
  }
  if (on && page === 'subscriptions' && pt.isSignedIn()) loadSubs();
  bind('f-sub', function (f) {
    var u = $('sb-uri'), v = u.value.trim().replace(/^@/, '');
    if (!/^[a-z0-9_.]+(@[a-z0-9.-]+\.[a-z]{2,})?$/i.test(v)) return fail(f, u, 'Enter a channel handle like channel_name@video.rawreel.org.');
    return { uri: v.indexOf('@') === -1 ? v + '@' + pt.base.replace(/^https?:\/\//, '') : v };
  }, function (d, f) { return pt.subscribe(d.uri).then(function () { f.reset(); loadSubs(); }); });
})();
