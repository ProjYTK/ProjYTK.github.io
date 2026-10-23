// RawReel profile (profile.html). Everything is saved in localStorage "rr_profile" in this browser only; nothing is sent.
// Customizable: banner, avatar shape/frame, accent, font, card style, panel color + transparency, layout, sections,
// theme presets, and a widget board (add / remove / reorder by drag or Up/Down / half or full width).
// Readability: text sits on glossy panels; text color is picked from the panel color, and low opacity adds blur + text-shadow.
(function () {
  var KEY = 'rr_profile', C = window.RR_CONFIG || {}, DEF_AV = C.DEFAULT_AVATAR || 'avatars/13-head-grey.png';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var $ = function (id) { return document.getElementById(id); };
  var BG = {
    none: { label: 'Default', css: '' },
    sky: { label: 'Sky', css: 'linear-gradient(180deg,#bfe3fb,#eaf6ff)' },
    navy: { label: 'Navy', css: '#0b2d55' },
    mint: { label: 'Mint', css: '#d8f3e3' },
    sunset: { label: 'Sunset', css: 'linear-gradient(135deg,#ff9a6a,#c8487a 55%,#5a3fa8)' },
    ocean: { label: 'Ocean', css: 'linear-gradient(135deg,#1f6fb2,#0b2d55)' },
    dots: { label: 'Dots', css: 'radial-gradient(#7fb3da 1.5px,transparent 1.6px) 0 0/18px 18px,#eef6fc' },
    stripes: { label: 'Stripes', css: 'repeating-linear-gradient(45deg,#dbeefb 0 12px,#c4e0f5 12px 24px)' },
    grid: { label: 'Grid', css: 'linear-gradient(#9fc3dc55 1px,transparent 1px) 0 0/24px 24px,linear-gradient(90deg,#9fc3dc55 1px,transparent 1px) 0 0/24px 24px,#f5faff' },
    film: { label: 'Film strip', css: 'repeating-linear-gradient(90deg,#222 0 14px,#444 14px 18px),#222' }
  };
  // Nature photos: public domain (NPS / USFWS via Wikimedia Commons), served from img/bg/. Credits: img/bg/CREDITS.md
  var PHOTOS = [{"k": "mountains", "t": "Grand Teton", "by": "GrandTetonNPS", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Grand_Teton_(50368046828).jpg"}, {"k": "forest", "t": "Hoh Rain Forest in mist", "by": "Olympic National Park", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Hoh_mist_forest_trees_Hoh_NPS_Photo_j_preston_(17115216790).jpg"}, {"k": "ocean", "t": "Third Beach wave spray", "by": "Olympic National Park", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Third_beach_rock_spray_ocean_wave_NPS_Photo_(17126204230).jpg"}, {"k": "beach", "t": "Rialto Beach sunset", "by": "USFWS Pacific", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Rialto_Beach_sunset_(53676352325).jpg"}, {"k": "desert", "t": "Great Sand Dunes at sunset", "by": "NPS Natural Resources", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Dunes_at_sunset_along_the_southern_edge_of_the_dune_field_in_Great_Sand_Dunes_National_Park._NPS-Debra_Miller_(18659276586).jpg"}, {"k": "waterfall", "t": "Mount Wow waterfall", "by": "Steve Redman (MORA)", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Mount_Wow_waterfall_(2f045d64027d4184b4147ec4eb025da6).JPG"}, {"k": "lake", "t": "Cub Lake at dawn", "by": "NPS Natural Resources", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Cub_Lake_at_dawn_in_Rocky_Mountain_National_Park._NPS-Debra_Miller_(18680833532).jpg"}, {"k": "aurora", "t": "Northern lights", "by": "USFWSAlaska", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Northern_lights_(50442493452).jpg"}, {"k": "night-sky", "t": "Milky Way over Devils Tower", "by": "NPS Natural Resources", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Milky_Way_arching_over_Devils_Tower.jpg"}, {"k": "meadow", "t": "Wildflower meadows at Tipsoo Lake", "by": "NPS Photo", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Colorful_wildflower_meadows_surround_Tipsoo_Lake._(dec8b375-cf3a-4859-ae35-db4a634f118a).JPG"}, {"k": "snow", "t": "Cave Falls in a winter snow storm", "by": "YellowstoneNPS", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Cave_Falls_in_a_winter_snow_storm_(54340386375).jpg"}, {"k": "reflection", "t": "Gallatin Mountains in Swan Lake", "by": "Yellowstone National Park", "lic": "Public domain", "src": "https://commons.wikimedia.org/wiki/File:Gallatin_mountains_reflected_in_Swan_Lake_(43111039352).jpg"}];
  var PH = {}; PHOTOS.forEach(function (x) { PH[x.k] = x; });
  function photoOf(v) { return /^photo:/.test(v || '') ? PH[v.slice(6)] || null : null; }
  var CLEAR = 'linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,.05) 50%,rgba(255,255,255,0) 51%,rgba(255,255,255,.12))';
  var ACC = { sky: '#2a7fc6', green: '#2f7a2f', violet: '#5a3fa8', orange: '#a84a10', rose: '#a8305a', teal: '#0f6f6a' };
  var FONTS = { system: { label: 'System', css: 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }, serif: { label: 'Serif', css: 'Georgia,"Times New Roman",serif' }, rounded: { label: 'Rounded', css: '"Trebuchet MS","Verdana",sans-serif' }, mono: { label: 'Typewriter', css: '"Courier New",Courier,monospace' } };
  var PANELS = { auto: { label: 'Auto (follows theme)', hex: '' }, white: { label: 'White', hex: '#ffffff' }, ice: { label: 'Ice blue', hex: '#dff1ff' }, mint: { label: 'Mint', hex: '#e3f7ea' }, navy: { label: 'Navy', hex: '#0e2440' }, black: { label: 'Black', hex: '#111111' } };
  var WT = {
    videos: { label: 'My videos', half: false }, favorites: { label: 'Favorites' }, collections: { label: 'Collections' },
    recent: { label: 'Recently watched' }, featured: { label: 'Featured video', half: true }, about: { label: 'About', half: true },
    links: { label: 'Links', half: true }, stats: { label: 'Stats', half: true }, nowplaying: { label: 'Now playing on RawReplay', half: true },
    note: { label: 'Note', half: true }, music: { label: 'Music pick', half: true }
  };
  var D = {
    name: '', handle: '', bio: '', links: [], avatar: DEF_AV, avShape: 'circle', avFrame: 'white',
    banner: 'clear', bannerUrl: '', bg: 'photo:reflection', bgUrl: '', accent: 'sky', font: 'system', card: 'glossy',
    panel: 'auto', panelCustom: '#ffffff', opacity: 75, shadow: 'soft', private: false, layout: 'two',
    show: { banner: true, avatar: true, bio: true, links: true },
    widgets: [{ t: 'videos', w: 'full' }, { t: 'favorites', w: 'full' }, { t: 'about', w: 'half' }, { t: 'stats', w: 'half' }]
  };
  var THEMES = {
    aero: { label: 'Sky gloss (default)', set: { bg: 'photo:reflection', bgUrl: '', banner: 'clear', bannerUrl: '', accent: 'sky', font: 'system', card: 'glossy', panel: 'auto', opacity: 75, shadow: 'soft', avShape: 'circle', avFrame: 'white' } },
    nature: { label: 'Forest walk', set: { bg: 'photo:forest', bgUrl: '', banner: 'clear', bannerUrl: '', accent: 'green', font: 'rounded', card: 'glossy', panel: 'mint', opacity: 60, shadow: 'soft', avShape: 'circle', avFrame: 'glow' } },
    lagoon: { label: 'Glass lagoon', set: { bg: 'sky', bgUrl: '', banner: 'sky', bannerUrl: '', accent: 'teal', font: 'rounded', card: 'glossy', panel: 'ice', opacity: 45, shadow: 'medium', avShape: 'circle', avFrame: 'accent' } },
    midnight: { label: 'Midnight', set: { bg: 'ocean', bgUrl: '', banner: 'navy', bannerUrl: '', accent: 'sky', font: 'system', card: 'glossy', panel: 'navy', opacity: 80, shadow: 'soft', avShape: 'rounded', avFrame: 'accent' } },
    sunset: { label: 'Sunset', set: { bg: 'sunset', bgUrl: '', banner: 'sunset', bannerUrl: '', accent: 'rose', font: 'serif', card: 'flat', panel: 'white', opacity: 70, shadow: 'soft', avShape: 'circle', avFrame: 'white' } },
    noir: { label: 'Film noir', set: { bg: 'film', bgUrl: '', banner: 'film', bannerUrl: '', accent: 'orange', font: 'mono', card: 'outline', panel: 'black', opacity: 88, shadow: 'off', avShape: 'square', avFrame: 'none' } },
    paper: { label: 'Paper', set: { bg: 'grid', bgUrl: '', banner: 'stripes', bannerUrl: '', accent: 'green', font: 'serif', card: 'outline', panel: 'white', opacity: 100, shadow: 'off', avShape: 'rounded', avFrame: 'none' } }
  };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  function load() {
    var p = {}; try { p = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    var d = clone(D); for (var k in d) if (!(k in p)) p[k] = d[k];
    for (var s in d.show) if (!(s in p.show)) p.show[s] = true;
    if (!Array.isArray(p.widgets)) p.widgets = d.widgets; p.widgets = p.widgets.filter(function (w) { return w && WT[w.t]; });
    if (!Array.isArray(p.links)) p.links = [];
    p.opacity = Math.max(15, Math.min(100, +p.opacity || 75));
    return p;
  }
  var P = load(), editing = false;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  function safeUrl(u) { try { var x = new URL(String(u).trim()); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }
  function ls(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  var VIDS = (window.VIDEOS || []).concat(window.VIDEOS_TEST || []), byId = {}; VIDS.forEach(function (v) { byId[v.id] = v; });
  var REL = window.REPLAY_RELEASES || [];
  // ---- colors / readability ----
  function hexRgb(h) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return [255, 255, 255]; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(rgb) { var f = function (x) { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(rgb[0]) + .7152 * f(rgb[1]) + .0722 * f(rgb[2]); }
  function panelHex() { if (P.panel === 'custom') return P.panelCustom; var h = (PANELS[P.panel] || PANELS.auto).hex; return h || (document.documentElement.getAttribute('data-theme') === 'dark' ? '#0e2440' : '#ffffff'); }
  function applyLook() {
    var page = $('pf-page'), st = page.style, hex = panelHex(), rgb = hexRgb(hex), dark = lum(rgb) < .4, a = P.opacity / 100;
    var bgUrl = safeUrl(P.bgUrl);
    var ph = !bgUrl && photoOf(P.bg);
    st.background = bgUrl ? 'url(' + JSON.stringify(bgUrl) + ') center/cover fixed' : ph ? 'url("img/bg/' + ph.k + '.webp") center/cover fixed #6a8fb0' : ((BG[P.bg] || BG.none).css || '');
    var cr = $('pf-credit'); cr.hidden = !ph;
    if (ph) cr.innerHTML = 'Photo: ' + esc(ph.t) + ', ' + esc(ph.by) + ', via <a href="' + esc(ph.src) + '" rel="noopener" target="_blank">Wikimedia Commons</a> · ' + esc(ph.lic);
    st.setProperty('--pf-panel', 'rgba(' + rgb.join(',') + ',' + a + ')');
    st.setProperty('--pf-text', dark ? '#f4f9ff' : '#10283f');
    // Text shadow (Customize > Panels and text): off / soft (default) / medium / strong, only where panels are see-through.
    // Safety floor: with the shadow Off, panels never go below 40% opacity so text keeps its contrast.
    if (P.shadow === 'off' && a < .4) { a = .4; st.setProperty('--pf-panel', 'rgba(' + rgb.join(',') + ',.4)'); }
    var sc = dark ? '0,0,0' : '255,255,255', SH = {
      off: 'none',
      soft: '0 1px 2px rgba(' + sc + ',.55)',
      medium: '0 0 2px rgba(' + sc + ',.8),0 1px 3px rgba(' + sc + ',.7)',
      strong: '0 0 2px rgb(' + sc + '),0 1px 3px rgb(' + sc + '),0 0 10px rgba(' + sc + ',.85)'
    };
    st.setProperty('--pf-sub', a < .86 ? (dark ? '#f4f9ff' : '#10283f') : (dark ? '#d3e4f4' : '#233f58'));
    st.setProperty('--pf-shadow', a < .85 ? (SH[P.shadow] || SH.soft) : 'none');
    // Contrast guarantee (>= 4.5:1 over ANY background): panels below 86% opacity get an inner frosted text plate at 72%
    // behind headings and text, so the panel edges stay see-through but text never sits on the raw photo. Dark panels get a
    // dimmer gloss so light text never lands on a white highlight.
    st.setProperty('--pf-plate', 'rgba(' + rgb.join(',') + ',.74)');
    st.setProperty('--pf-gloss', dark ? '.10' : '.42');
    page.classList.toggle('pf-plate', a < .86);
    st.setProperty('--pf-blur', 'blur(' + Math.round((1 - a) * 16 + 2) + 'px) saturate(1.3)');
    st.setProperty('--pf-acc', ACC[P.accent] || ACC.sky);
    st.setProperty('--pf-font', (FONTS[P.font] || FONTS.system).css);
    page.setAttribute('data-card', P.card); page.setAttribute('data-layout', P.layout);
    page.setAttribute('data-av', P.avShape); page.setAttribute('data-frame', P.avFrame);
    page.classList.toggle('pf-dark-panel', dark);
    var bn = $('pf-banner'), bu = safeUrl(P.bannerUrl);
    var bph = photoOf(P.banner);
    bn.style.background = bu ? 'url(' + JSON.stringify(bu) + ') center/cover' : bph ? 'url("img/bg/' + bph.k + '.webp") center/cover' : P.banner === 'clear' ? CLEAR : ((BG[P.banner] || BG.ocean).css || BG.ocean.css);
    bn.classList.toggle('clear', P.banner === 'clear' && !bu);
    bn.hidden = !P.show.banner;
  }
  // ---- header ----
  function renderHead() {
    var av = $('pf-av'); av.hidden = !P.show.avatar; av.onerror = function () { av.onerror = null; av.src = DEF_AV; }; av.src = P.avatar || DEF_AV;
    $('pf-name').textContent = P.name || 'Your name';
    // Verified badge only from server/account data (window.RR_ME.verified), never from anything saved in this browser.
    if (window.RR_ME && RR_ME.verified === true && window.rrBadge) $('pf-name').insertAdjacentHTML('beforeend', '<span class="rr-verified" role="img" aria-label="Verified" title="Verified"><span aria-hidden="true">&#10003;</span></span>');
    $('pf-handle').textContent = '@' + (P.handle || 'handle');
    $('pf-bio').textContent = P.bio || ''; $('pf-bio').hidden = !P.show.bio || !P.bio;
    $('pf-links').innerHTML = P.show.links ? linkList('ghost') : '';
  }
  function linkList(cls) { return P.links.map(function (l) { var u = safeUrl(l); return u ? '<li><a class="' + cls + '" href="' + esc(u) + '" rel="noopener nofollow ugc" target="_blank">' + esc(host(u)) + '</a></li>' : ''; }).join(''); }
  // ---- widgets ----
  function cards(list, empty) { return list.length ? '<div class="grid">' + list.map(function (v) { return rrCard(v); }).join('') + '</div>' : '<p class="empty-note">' + empty + '</p>'; }
  function myVideos() {
    var mine = P.handle ? VIDS.filter(function (v) { return v.handle && v.handle.toLowerCase() === P.handle.toLowerCase(); }) : [];
    ls('rr_my_uploads', []).forEach(function (id) { if (byId[id] && mine.indexOf(byId[id]) === -1) mine.push(byId[id]); });
    return mine;
  }
  function nowPlaying() { var s = ls('rawreplay.player.v1', null); if (!s || !s.id) return null; var r = REL.filter(function (x) { return x.id === s.id; })[0]; return r && r.tracks[s.i] ? { r: r, t: r.tracks[s.i] } : null; }
  function track(r, t, label) { return '<p class="pf-track"><span class="pf-note" aria-hidden="true">&#9835;</span><span><b>' + esc(t ? t.title : r.title) + '</b><br><small>' + esc(r.artist) + (t ? ' · ' + esc(r.title) : '') + '</small></span></p><a class="ghost" href="album.html?id=' + encodeURIComponent(r.id) + '">' + label + '</a>'; }
  function body(w) {
    var favs = window.RRS ? RRS.favs() : [];
    switch (w.t) {
      case 'videos': var m = myVideos(); return m.length ? cards(m, '') : '<p class="empty-note">No videos posted yet.</p><a class="btn" href="upload.html">Upload a video</a>';
      case 'favorites': return cards(favs.map(function (id) { return byId[id]; }).filter(Boolean), 'No favorites yet. Tap the heart on any film to add it here.');
      case 'collections':
        var g = {}; favs.forEach(function (id) { var v = byId[id]; if (v) { var k = rrGenre(v); (g[k] = g[k] || []).push(v); } });
        var ks = Object.keys(g); return ks.length ? ks.map(function (k) { return '<h3 class="pf-sub">' + esc(k) + ' <small>(' + g[k].length + ')</small></h3>' + cards(g[k], ''); }).join('') : '<p class="empty-note">Your favorites are grouped here by genre. Browse all <a href="collections.html">Collections</a>.</p>';
      case 'recent': return cards(ls('rr_history', []).map(function (id) { return byId[id]; }).filter(Boolean).slice(0, 8), 'Nothing watched yet on this device.');
      case 'featured': var f = byId[w.v]; return f ? '<div class="grid pf-one">' + rrCard(f) + '</div>' : '<p class="empty-note">Pick a film to feature' + (editing ? ' below.' : ' (Customize, then this widget).') + '</p>';
      case 'about': return '<p class="pf-pre">' + (P.bio ? esc(P.bio) : 'No bio yet.') + '</p>';
      case 'links': var l = linkList('ghost'); return l ? '<ul class="pf-links">' + l + '</ul>' : '<p class="empty-note">No links yet.</p>';
      case 'stats':
        var n = [['Favorites', favs.length], ['Watched', ls('rr_history', []).length], ['Likes', Object.keys(ls('rr_votes', {})).filter(function (k) { return ls('rr_votes', {})[k] === 1; }).length], ['Videos', myVideos().length]];
        return '<ul class="pf-stats">' + n.map(function (x) { return '<li><b>' + x[1] + '</b><small>' + x[0] + '</small></li>'; }).join('') + '</ul><p class="hint">Counted from this browser only.</p>';
      case 'nowplaying': var np = nowPlaying(); return np ? track(np.r, np.t, 'Open release') : '<p class="empty-note">Nothing played on RawReplay yet.</p><a class="ghost" href="replay.html">Open RawReplay</a>';
      case 'note': return w.v ? '<p class="pf-pre">' + esc(w.v) + '</p>' : '<p class="empty-note">Empty note.' + (editing ? ' Write something below.' : '') + '</p>';
      case 'music': var parts = String(w.v || '').split('|'), r = REL.filter(function (x) { return x.id === parts[0]; })[0]; return r ? track(r, r.tracks[+parts[1]] || null, 'Listen on RawReplay') : '<p class="empty-note">No music pick yet.</p>';
    }
    return '';
  }
  function editor(w, i) {
    var n = P.widgets.length, x = '';
    if (w.t === 'featured') x = '<label class="flabel" for="wv' + i + '">Featured film</label><select class="field" id="wv' + i + '" data-wv="' + i + '"><option value="">Choose...</option>' + VIDS.filter(function (v) { return !v.hold; }).map(function (v) { return '<option value="' + esc(v.id) + '"' + (w.v === v.id ? ' selected' : '') + '>' + esc(rrTitle(v)) + (v.year ? ' (' + v.year + ')' : '') + '</option>'; }).join('') + '</select>';
    if (w.t === 'note') x = '<label class="flabel" for="wv' + i + '">Note text</label><textarea class="field" id="wv' + i + '" data-wv="' + i + '" rows="3" maxlength="600">' + esc(w.v || '') + '</textarea>';
    if (w.t === 'music') x = '<label class="flabel" for="wv' + i + '">Track</label><select class="field" id="wv' + i + '" data-wv="' + i + '"><option value="">Choose...</option>' + REL.map(function (r) { return r.tracks.map(function (t, k) { var v = r.id + '|' + k; return '<option value="' + esc(v) + '"' + (w.v === v ? ' selected' : '') + '>' + esc(t.title + ' - ' + r.artist) + '</option>'; }).join(''); }).join('') + '</select>';
    var lab = esc(WT[w.t].label);
    return '<div class="pf-wbar"><span class="pf-grip" aria-hidden="true" title="Drag to reorder">&#8942;&#8942;</span>' +
      '<button type="button" class="ghost" data-act="up" data-i="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="Move ' + lab + ' up">&#8593;</button>' +
      '<button type="button" class="ghost" data-act="down" data-i="' + i + '"' + (i < n - 1 ? '' : ' disabled') + ' aria-label="Move ' + lab + ' down">&#8595;</button>' +
      '<button type="button" class="ghost" data-act="size" data-i="' + i + '" aria-label="Make ' + lab + (w.w === 'half' ? ' full width' : ' half width') + '">' + (w.w === 'half' ? 'Full width' : 'Half width') + '</button>' +
      '<button type="button" class="ghost" data-act="del" data-i="' + i + '" aria-label="Remove ' + lab + '">Remove</button></div>' + (x ? '<div class="pf-wcfg">' + x + '</div>' : '');
  }
  function renderWidgets() {
    var box = $('pf-widgets');
    box.innerHTML = P.widgets.map(function (w, i) {
      return '<section class="pf-w pf-panel ' + (w.w === 'half' ? 'half' : 'full') + '" data-i="' + i + '"' + (editing ? ' draggable="true"' : '') + ' aria-labelledby="wh' + i + '"><h2 class="pf-wh" id="wh' + i + '">' + esc(WT[w.t].label) + '</h2>' + (editing ? editor(w, i) : '') + '<div class="pf-wb">' + body(w) + '</div></section>';
    }).join('') || '<section class="pf-w pf-panel full"><h2 class="pf-wh">Your profile is empty</h2><p class="empty-note">Use Customize, then Add widget.</p></section>';
    if (window.rrFillClipThumbs) rrFillClipThumbs();
  }
  function move(i, j) { if (j < 0 || j >= P.widgets.length) return; var w = P.widgets.splice(i, 1)[0]; P.widgets.splice(j, 0, w); save(); renderWidgets(); }
  var wbox = $('pf-widgets');
  wbox.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return; var i = +b.dataset.i, a = b.dataset.act, focusSel;
    if (a === 'up') { move(i, i - 1); focusSel = '[data-act="up"][data-i="' + (i - 1) + '"]'; }
    else if (a === 'down') { move(i, i + 1); focusSel = '[data-act="down"][data-i="' + (i + 1) + '"]'; }
    else if (a === 'size') { P.widgets[i].w = P.widgets[i].w === 'half' ? 'full' : 'half'; save(); renderWidgets(); focusSel = '[data-act="size"][data-i="' + i + '"]'; }
    else if (a === 'del') { P.widgets.splice(i, 1); save(); renderWidgets(); focusSel = '#pf-add'; }
    var f = document.querySelector(focusSel); if (f && !f.disabled) f.focus(); else { f = wbox.querySelector('[data-act]'); if (f) f.focus(); }
  });
  wbox.addEventListener('change', function (e) { var el = e.target; if (!el.dataset.wv) return; P.widgets[+el.dataset.wv].v = el.value; save(); renderWidgets(); var n = $(el.id); if (n) n.focus(); });
  var dragI = -1;
  wbox.addEventListener('dragstart', function (e) { var s = e.target.closest && e.target.closest('.pf-w'); if (!s) return; dragI = +s.dataset.i; s.classList.add('dragging'); try { e.dataTransfer.setData('text/plain', String(dragI)); e.dataTransfer.effectAllowed = 'move'; } catch (x) {} });
  wbox.addEventListener('dragover', function (e) { if (dragI < 0) return; e.preventDefault(); var s = e.target.closest('.pf-w'); wbox.querySelectorAll('.drop').forEach(function (d) { d.classList.remove('drop'); }); if (s) s.classList.add('drop'); });
  wbox.addEventListener('drop', function (e) { e.preventDefault(); var s = e.target.closest('.pf-w'); if (s && dragI >= 0) move(dragI, +s.dataset.i); dragI = -1; });
  wbox.addEventListener('dragend', function () { dragI = -1; wbox.querySelectorAll('.dragging,.drop').forEach(function (d) { d.classList.remove('dragging', 'drop'); }); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button[data-fav]')) setTimeout(renderWidgets, 0); });
  // ---- customize panel ----
  function seg(name, opts, cur, label) { return '<div class="pf-row"><span class="flabel" id="cz-' + name + '">' + label + '</span><div class="pf-chips" role="group" aria-labelledby="cz-' + name + '">' + Object.keys(opts).map(function (k) { return '<button type="button" class="chip" data-set="' + name + '" data-v="' + k + '" aria-pressed="' + (cur === k) + '">' + esc(opts[k].label || opts[k]) + '</button>'; }).join('') + '</div></div>'; }
  function sw(name, src, cur, label, extra) { return '<div class="pf-row"><span class="flabel" id="cz-' + name + '">' + label + '</span><div class="pf-presets" role="group" aria-labelledby="cz-' + name + '">' + Object.keys(src).filter(function (k) { return extra || k !== 'none'; }).map(function (k) { return '<button type="button" class="pf-sw" data-set="' + name + '" data-v="' + k + '" aria-label="' + esc(src[k].label) + '" aria-pressed="' + (cur === k) + '" style="background:' + (src[k].css || '#fff') + '"></button>'; }).join('') + '</div></div>'; }
  function photos(name, cur, label) { return '<div class="pf-row"><span class="flabel" id="cz-' + name + '-ph">' + label + '</span><div class="pf-presets pf-photos" role="group" aria-labelledby="cz-' + name + '-ph">' + PHOTOS.map(function (x) { return '<button type="button" class="pf-sw pf-ph" data-set="' + name + '" data-v="photo:' + x.k + '" aria-label="' + esc(x.t) + '" aria-pressed="' + (cur === 'photo:' + x.k) + '" style="background-image:url(img/bg/' + x.k + '-thumb.webp)"></button>'; }).join('') + '</div></div>'; }
  function txt(id, label, val, attrs) { return '<label class="flabel" for="' + id + '">' + label + '</label><input class="field" id="' + id + '" value="' + esc(val) + '" ' + (attrs || '') + '>'; }
  function renderCz() {
    var cz = $('pf-cz'), avs = (C.AVATARS || []).filter(function (a) { return !a.hidden; }), open = {};
    cz.querySelectorAll('details[data-k]').forEach(function (d) { open[d.dataset.k] = d.open; });
    var sec = function (k, title, html, def) { return '<details data-k="' + k + '"' + ((k in open ? open[k] : def) ? ' open' : '') + '><summary><h2>' + title + '</h2></summary><div class="pf-czb">' + html + '</div></details>'; };
    cz.innerHTML = '<div class="pf-czh"><h2 class="pf-wh">Customize your profile</h2><p class="hint">Saved only in this browser. Nothing is sent to RawReel.</p></div>' +
      sec('widgets', 'Widgets', '<label class="flabel" for="pf-add">Add widget</label><div class="pf-addrow"><select class="field" id="pf-add">' + Object.keys(WT).map(function (k) { return '<option value="' + k + '">' + esc(WT[k].label) + '</option>'; }).join('') + '</select><button type="button" class="btn" id="pf-add-b">Add widget</button></div><p class="hint">Drag a widget to reorder it, or use its arrow buttons.</p>', true) +
      sec('themes', 'Profile themes', '<div class="pf-chips" role="group" aria-label="Profile themes">' + Object.keys(THEMES).map(function (k) { return '<button type="button" class="chip" data-theme-p="' + k + '">' + esc(THEMES[k].label) + '</button>'; }).join('') + '</div><p class="hint">A theme sets background, banner, colors, font, cards and panels at once.</p>', true) +
      sec('info', 'Name, bio and links', '<form id="pf-form" class="pf-form" novalidate>' + txt('pf-i-name', 'Display name', P.name, 'maxlength="50"') + txt('pf-i-handle', 'Handle', P.handle, 'maxlength="30" autocapitalize="off" spellcheck="false"') + '<small class="hint">Letters, numbers, dots and underscores.</small>' +
        '<label class="flabel" for="pf-i-bio">Bio</label><textarea class="field" id="pf-i-bio" rows="3" maxlength="300">' + esc(P.bio) + '</textarea><label class="flabel" for="pf-i-links">Links (one per line, https only, up to 5)</label><textarea class="field" id="pf-i-links" rows="3" maxlength="600">' + esc(P.links.join('\n')) + '</textarea>' +
        '<p class="ferr" id="pf-err" aria-live="polite"></p><button class="btn" type="submit">Save</button></form>', false) +
      sec('look', 'Background and banner', photos('bg', P.bgUrl ? '' : P.bg, 'Nature photos (public domain)') + sw('bg', BG, P.bgUrl ? '' : P.bg, 'Colors and patterns', true) + '<form class="pf-url" data-url="bgUrl">' + txt('pf-i-bgurl', 'Or a background image URL you host (https)', P.bgUrl, 'type="url" inputmode="url" placeholder="https://example.com/background.jpg"') + '<button class="ghost" type="submit">Use image</button></form>' +
        sw('banner', Object.assign({ clear: { label: 'Clear glass (shows the background)', css: CLEAR + ',repeating-linear-gradient(45deg,#dbeefb 0 6px,#fff 6px 12px)' } }, BG), P.bannerUrl ? '' : P.banner, 'Banner') + photos('banner', P.bannerUrl ? '' : P.banner, 'Banner photo') + '<form class="pf-url" data-url="bannerUrl">' + txt('pf-i-bnurl', 'Or a banner image URL you host (https)', P.bannerUrl, 'type="url" inputmode="url" placeholder="https://example.com/banner.jpg"') + '<button class="ghost" type="submit">Use image</button></form>', false) +
      sec('panels', 'Panels and text', seg('panel', Object.assign({}, PANELS, { custom: { label: 'Custom' } }), P.panel, 'Panel color') +
        '<div class="pf-row"><label class="flabel" for="pf-i-pcol">Custom panel color</label><input type="color" id="pf-i-pcol" value="' + esc(P.panelCustom) + '"></div>' +
        '<div class="pf-row"><label class="flabel" for="pf-i-op">Panel transparency</label><span class="range-w"><input type="range" id="pf-i-op" min="0" max="100" step="5" value="' + Math.round((100 - P.opacity) / 85 * 100) + '"><output id="pf-op-o">' + Math.round((100 - P.opacity) / 85 * 100) + '%</output></span><small class="hint">Text color, blur and shadow adjust so text stays readable.</small></div>' +
        seg('shadow', { off: 'Off', soft: 'Soft', medium: 'Medium', strong: 'Strong' }, P.shadow, 'Text shadow') + '<small class="hint">With the shadow Off, panels stay at least 40% opaque so text stays readable.</small>' +
        seg('card', { glossy: 'Glossy', flat: 'Flat', outline: 'Outline' }, P.card, 'Card style') + seg('font', FONTS, P.font, 'Font') +
        seg('accent', { sky: 'Sky', green: 'Green', violet: 'Violet', orange: 'Orange', rose: 'Rose', teal: 'Teal' }, P.accent, 'Accent color'), false) +
      sec('avatar', 'Profile picture', '<div class="pf-avs" role="group" aria-label="Profile picture">' + avs.map(function (a) { return '<button type="button" data-set="avatar" data-v="' + esc(a.file) + '" aria-pressed="' + (P.avatar === a.file) + '"><img src="' + esc(a.file) + '" alt="' + esc(a.label) + '" loading="lazy" width="44" height="44"></button>'; }).join('') + '</div>' +
        seg('avShape', { circle: 'Circle', rounded: 'Rounded', square: 'Square', hex: 'Hexagon' }, P.avShape, 'Shape') + seg('avFrame', { white: 'White ring', accent: 'Accent ring', glow: 'Glow', none: 'No frame' }, P.avFrame, 'Frame'), false) +
      sec('layout', 'Layout and sections', seg('layout', { one: 'One column', two: 'Two columns', sidebar: 'Sidebar' }, P.layout, 'Layout') +
        '<fieldset class="pf-show"><legend class="flabel">Show</legend>' + [['banner', 'Banner'], ['avatar', 'Profile picture'], ['bio', 'Bio in header'], ['links', 'Links in header']].map(function (x) { return '<label><input type="checkbox" data-show="' + x[0] + '"' + (P.show[x[0]] ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('') + '</fieldset>', false) +
      sec('privacy', 'Privacy', '<label class="pf-chk"><input type="checkbox" id="pf-i-private"' + (P.private ? ' checked' : '') + '> Make my profile private</label><small class="hint">Visitors see only your picture, name and handle. Saved on this device only.</small><div><a class="ghost" href="profile.html?preview=visitor">Preview as visitor</a></div>', false) +
      '<div class="pf-czf"><button type="button" class="ghost" id="pf-reset">Reset profile</button><button type="button" class="btn" id="pf-done">Done</button><p class="okmsg" id="pf-ok" aria-live="polite"></p></div>';
  }
  function say(t) { var o = $('pf-ok'); if (o) o.textContent = t; }
  function all() { applyLook(); renderHead(); renderWidgets(); }
  function refocus(sel) { renderCz(); var f = sel && $('pf-cz').querySelector(sel); if (f) f.focus(); }
  var cz = $('pf-cz');
  cz.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.set) { var k = b.dataset.set; P[k] = b.dataset.v; if (k === 'bg') P.bgUrl = ''; if (k === 'banner') P.bannerUrl = ''; save(); all(); refocus('[data-set="' + k + '"][data-v="' + CSS.escape(b.dataset.v) + '"]'); say('Saved'); }
    else if (b.dataset.themeP) { var t = THEMES[b.dataset.themeP].set; for (var x in t) P[x] = t[x]; save(); all(); refocus('[data-theme-p="' + b.dataset.themeP + '"]'); say('Theme applied: ' + THEMES[b.dataset.themeP].label); }
    else if (b.id === 'pf-add-b') { var ty = $('pf-add').value; P.widgets.push({ t: ty, w: WT[ty].half ? 'half' : 'full' }); save(); renderWidgets(); say(WT[ty].label + ' added'); var last = wbox.lastElementChild; if (last) last.scrollIntoView({ block: 'nearest' }); }
    else if (b.id === 'pf-reset') { if (!confirm('Reset your whole profile on this device?')) return; try { localStorage.removeItem(KEY); } catch (x) {} P = load(); all(); refocus('#pf-reset'); say('Profile reset'); }
    else if (b.id === 'pf-done') toggle(false);
  });
  cz.addEventListener('input', function (e) {
    if (e.target.id === 'pf-i-op') { var v = +e.target.value; P.opacity = Math.round(100 - v * .85); $('pf-op-o').textContent = v + '%'; save(); applyLook(); }
    if (e.target.id === 'pf-i-pcol') { P.panelCustom = e.target.value; P.panel = 'custom'; save(); applyLook(); cz.querySelectorAll('[data-set="panel"]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === 'custom'); }); }
  });
  cz.addEventListener('change', function (e) { if (e.target.id === 'pf-i-private') { P.private = e.target.checked; save(); all(); say(P.private ? 'Profile set to private' : 'Profile set to public'); return; } var s = e.target.dataset && e.target.dataset.show; if (s) { P.show[s] = e.target.checked; save(); all(); } });
  cz.addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    if (f.dataset.url) { var inp = f.querySelector('input'), u = inp.value.trim(); if (u && !safeUrl(u)) { say('Use an https:// image link.'); inp.focus(); return; } P[f.dataset.url] = u ? safeUrl(u) : ''; save(); all(); say(u ? 'Image set' : 'Image removed'); return; }
    var err = $('pf-err'); err.textContent = '';
    var h = $('pf-i-handle').value.trim().replace(/^@/, '');
    if (h && !/^[A-Za-z0-9._]{2,30}$/.test(h)) { err.textContent = 'Handles use 2 to 30 letters, numbers, dots or underscores.'; $('pf-i-handle').focus(); return; }
    var lk = window.RR_CHANNELS && RR_CHANNELS[h.toLowerCase()]; if (h && lk && lk.handleLocked) { err.textContent = '@' + h + ' is already taken.'; $('pf-i-handle').focus(); return; }
    P.name = $('pf-i-name').value.trim(); P.handle = h; P.bio = $('pf-i-bio').value.trim();
    P.links = $('pf-i-links').value.split(/\s*\n\s*/).map(safeUrl).filter(Boolean).slice(0, 5);
    save(); all(); say('Saved');
  });
  function toggle(on) { editing = on; $('pf-cz').hidden = !on; $('pf-custom').setAttribute('aria-expanded', on); $('pf-custom').textContent = on ? 'Close customize' : 'Customize'; $('pf-page').classList.toggle('pf-editing', on); if (on) renderCz(); renderWidgets(); if (!on) $('pf-custom').focus(); }
  $('pf-custom').addEventListener('click', function () { toggle(!editing); });
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyLook);
  all();
  // States (states.js): ?state=private|banned|suspended|deleted previews an account state; ?preview=visitor shows what visitors see.
  (function () {
    var q = window.RRState ? RRState.param() : { state: '' }, visitor = /[?&]preview=visitor/.test(location.search);
    var st = q.state && RRState.isAccount(q.state) ? q.state : (visitor && P.private ? 'private' : '');
    var head = $('pf-head'), note = document.createElement('p');
    if (visitor || st) { $('pf-custom').hidden = true; note.className = 'pf-state-note'; note.innerHTML = (visitor ? 'You are previewing your profile as a visitor.' : 'Preview of the "' + esc(st) + '" state.') + ' <a href="profile.html">Back to my profile</a>'; }
    if (!st) { if (visitor) head.parentNode.insertBefore(note, head.nextSibling); else if (P.private) { note.className = 'pf-state-note'; note.innerHTML = '&#128274;&#xFE0E; Your profile is private. <a href="profile.html?preview=visitor">Preview as visitor</a>'; head.parentNode.insertBefore(note, head.nextSibling); } return; }
    $('pf-widgets').hidden = true; $('pf-cz').hidden = true;
    if (st === 'private') { $('pf-bio').hidden = true; $('pf-links').hidden = true; }
    else { head.hidden = true; $('pf-banner').hidden = true; $('pf-page').style.background = ''; $('pf-credit').hidden = true; }
    var box = document.createElement('div'); box.className = 'pf-panel pf-statebox'; box.innerHTML = RRState.accountCard(st, { until: q.until });
    head.parentNode.insertBefore(box, $('pf-widgets'));
    head.parentNode.insertBefore(note, $('pf-widgets'));
    document.title = RRState.title(st) + ' - RawReel';
  })();
  if (/[?&]customize=1/.test(location.search)) toggle(true);
})();
