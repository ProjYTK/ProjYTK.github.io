// RawReel viewer settings. Loads in <head> (before CSS paints) so themes/sizes apply with no flash.
// Everything lives in localStorage under "rr_settings". Exposes window.RRS.
(function () {
  var KEY = 'rr_settings';
  var DEFAULTS = {
    theme: 'light',            // light | dark | auto (shown as "System")
    accent: 'sky',             // sky | green | violet | orange | rose
    largeTaps: false,          // larger tap targets (44px minimum)
    contrast: false,           // high-contrast mode
    textSize: 'm',             // s | m | l
    reducedMotion: false,      // no glossy animations/transitions
    density: 'comfortable',    // comfortable | compact
    cols: 'auto',              // auto | 2 | 3 | 4 | 5
    showDates: true,
    clock24: false,
    hideClassicsHome: false,
    hideMusicHome: false,
    hideSilent: false,
    cwMode: 'warn',            // warn = always show the warning first | hide = hide those items
    autoplayNext: false,
    volume: 80,                // 0-100 (silent films stay locked at 0)
    rememberPos: true,
    fadeDelay: '3',            // 2 | 3 | 5 | never
    speed: '1',
    captions: false
  };
  var s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
  for (var k in DEFAULTS) if (!(k in s)) s[k] = DEFAULTS[k];
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function resolvedTheme() { return s.theme === 'auto' ? (mq && mq.matches ? 'dark' : 'light') : s.theme; }
  function apply() {
    var h = document.documentElement;
    h.setAttribute('data-theme', resolvedTheme());
    h.setAttribute('data-text', s.textSize);
    h.setAttribute('data-accent', s.accent);
    h.classList.toggle('rr-taps', !!s.largeTaps);
    h.setAttribute('data-density', s.density);
    h.setAttribute('data-cols', s.cols);
    h.classList.toggle('rr-contrast', !!s.contrast);
    h.classList.toggle('rr-reduce', !!s.reducedMotion);
    h.classList.toggle('rr-nodates', !s.showDates);
    var tb = document.querySelectorAll('.rr-theme-toggle');
    for (var i = 0; i < tb.length; i++) tb[i].textContent = 'Theme: ' + ({ light: 'Light', dark: 'Dark', auto: 'System' })[s.theme];
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (s.theme === 'auto') apply(); });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} apply(); }
  window.RRS = {
    DEFAULTS: DEFAULTS,
    get: function (k) { return s[k]; },
    all: function () { var o = {}; for (var k in s) o[k] = s[k]; return o; },
    set: function (k, v) { s[k] = v; save(); },
    reset: function () { s = {}; for (var k in DEFAULTS) s[k] = DEFAULTS[k]; save(); },
    apply: apply,
    cycleTheme: function () { s.theme = ({ light: 'dark', dark: 'auto', auto: 'light' })[s.theme] || 'light'; save(); },
    // Video list filter shared by cards and search. opts.home = home-page feed.
    allow: function (v, opts) {
      if (s.hideSilent && v.silent) return false;
      if (s.cwMode === 'hide' && v.contentWarning) return false;
      if (opts && opts.home && s.hideClassicsHome && v.category === 'classic') return false;
      return true;
    },
    // Watch history / continue watching
    clearHistory: function () {
      try { Object.keys(localStorage).forEach(function (k) { if (/^rr_pos_|^rr_history$/.test(k)) localStorage.removeItem(k); }); } catch (e) {}
    },
    // Favorites (profile page + heart button on cards). Ids only, this browser only.
    favs: function () { try { var f = JSON.parse(localStorage.getItem('rr_favs') || '[]'); return Array.isArray(f) ? f : []; } catch (e) { return []; } },
    isFav: function (id) { return this.favs().indexOf(id) !== -1; },
    toggleFav: function (id) { var f = this.favs(), i = f.indexOf(id); if (i === -1) f.unshift(id); else f.splice(i, 1); try { localStorage.setItem('rr_favs', JSON.stringify(f)); } catch (e) {} return i === -1; },
    clearFavs: function () { try { localStorage.removeItem('rr_favs'); } catch (e) {} },
    // Every RawReel key in this browser (settings, history, favorites, likes, profile, browse view).
    clearAll: function () { try { Object.keys(localStorage).forEach(function (k) { if (/^rr_/.test(k) || /^rawreplay\./.test(k)) localStorage.removeItem(k); }); } catch (e) {} this.reset(); },
    formatTime: function (d) {
      d = new Date(d); if (isNaN(d)) return '';
      return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !s.clock24 });
    }
  };
  apply();
  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('storage', function (e) { if (e.key === KEY) { try { s = JSON.parse(e.newValue || '{}'); } catch (x) {} for (var k in DEFAULTS) if (!(k in s)) s[k] = DEFAULTS[k]; apply(); } });
})();
