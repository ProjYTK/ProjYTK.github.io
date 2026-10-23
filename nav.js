// RawReel header nav: ONE source of truth. Every page ships the same static HTML (for no-JS),
// and this re-renders the main nav + More menu from NAV below, so pages can never drift apart.
(function () {
  var NAV = {
    main: [
      { href: 'index.html', label: 'Home', cls: 'ghost nav-home' },
      { href: 'classics.html', label: 'Classics', cls: 'ghost' },
      { href: 'replay.html', label: 'Music', cls: 'ghost', also: ['album.html'] },
      { href: 'upload.html', label: 'Submit', cls: 'ghost nav-submit' },
      { href: 'import.html', label: 'Back up', cls: 'btn' }
    ],
    more: [
      { href: 'upload.html', label: 'Submit a video' },
      { href: 'submit.html', label: 'Share your music' },
      { href: 'replay-rules.html', label: 'Music rules' },
      { href: 'rules.html', label: 'Rules' },
      { href: 'about.html', label: 'About RawReel' },
      { href: 'faq.html', label: 'FAQ' },
      { href: 'about.html#sponsor', label: 'Sponsor RawReel' },
      'hr',
      { href: 'signin.html', label: 'Sign in', auth: 'out' },
      { href: 'signup.html', label: 'Sign up', auth: 'out' },
      { href: 'profile.html', label: 'My profile' },
      { href: 'account.html', label: 'My account' },
      { href: 'my-channel.html', label: 'My channel' },
      { href: 'my-uploads.html', label: 'My uploads' },
      { href: 'subscriptions.html', label: 'Subscriptions' },
      { href: 'notifications.html', label: 'Notifications' },
      { href: 'settings.html', label: '<span aria-hidden="true">⚙</span> Settings' },
      'theme'
    ]
  };
  var page = (location.pathname.split('/').pop() || 'index.html');
  var nav = document.querySelector('header .mainnav');
  if (!nav) return;
  var main = NAV.main.map(function (i) {
    var cur = i.href === page || (i.also || []).indexOf(page) !== -1;
    if (i.label === 'Submit') cur = false;  // More > Submit a video carries the current mark
    return '<a class="' + i.cls + '" href="' + i.href + '"' + (cur ? ' aria-current="page"' : '') + '>' + i.label + '</a>';
  }).join('\n    ');
  var more = NAV.more.map(function (i) {
    if (i === 'hr') return '<hr>';
    if (i === 'theme') return '<button type="button" class="rr-theme-toggle">Theme: Light</button>';
    return '<a href="' + i.href + '"' + (i.auth ? ' data-auth="' + i.auth + '"' : '') + (i.href === page ? ' aria-current="page"' : '') + '>' + i.label + '</a>';
  }).join('\n        ');
  nav.innerHTML = main + '\n    <details class="more">\n      <summary class="ghost">More</summary>\n      <div class="more-menu">\n        ' + more + '\n      </div>\n    </details>';
})();

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

// Quick theme toggle (More menu) and account links. Header Sign in / Sign up only appear when PEERTUBE_ENABLED.
(function () {
  document.querySelectorAll('.rr-theme-toggle').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); if (window.RRS) RRS.cycleTheme(); });
  });
  if (window.RRS) RRS.apply();
  var pt = window.RRPT, on = pt && pt.enabled, signed = on && pt.isSignedIn();
  document.querySelectorAll('[data-auth="out"]').forEach(function (a) { a.hidden = !!signed; });
  if (!on) return;
  var nav = document.querySelector('header .mainnav'), more = nav && nav.querySelector('details.more');
  if (!nav || !more) return;
  var box = document.createElement('span');
  box.className = 'rr-auth';
  box.innerHTML = signed
    ? '<a class="ghost" href="account.html">My account</a>'
    : '<a class="ghost" href="signin.html">Sign in</a><a class="ghost rr-signup" href="signup.html">Sign up</a>';
  nav.insertBefore(box, more);
})();
