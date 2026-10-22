// RawReel PeerTube client (REST API, https://docs.joinpeertube.org/api-rest-reference.html).
// Inert unless RR_CONFIG.PEERTUBE_ENABLED is true. Exposes window.RRPT.
(function () {
  var cfg = window.RR_CONFIG || {};
  var BASE = String(cfg.PEERTUBE_URL || 'https://video.rawreel.org').replace(/\/+$/, '');
  var KEY = 'rr_pt_auth';

  function store(a) { try { a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }

  function apiError(res, body) {
    var msg = (body && (body.detail || body.error || body.title)) || ('Request failed (' + res.status + ')');
    var e = new Error(msg); e.status = res.status; e.body = body; return e;
  }
  function parse(res) {
    if (res.status === 204) return null;
    return res.text().then(function (t) {
      var b = null; try { b = t ? JSON.parse(t) : null; } catch (e) { b = t; }
      if (!res.ok) throw apiError(res, b);
      return b;
    });
  }

  var clientP = null;
  // GET /api/v1/oauth-clients/local -> { client_id, client_secret }
  function getClient() {
    if (!clientP) clientP = fetch(BASE + '/api/v1/oauth-clients/local').then(parse).catch(function (e) { clientP = null; throw e; });
    return clientP;
  }
  // POST /api/v1/users/token (x-www-form-urlencoded)
  function token(params) {
    return getClient().then(function (c) {
      var body = new URLSearchParams(Object.assign({ client_id: c.client_id, client_secret: c.client_secret }, params));
      return fetch(BASE + '/api/v1/users/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body }).then(parse);
    }).then(function (t) {
      var a = { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: Date.now() + (t.expires_in || 0) * 1000 };
      store(a); return a;
    });
  }
  function login(username, password) { return token({ grant_type: 'password', response_type: 'code', username: username, password: password }); }
  function refresh() {
    var a = load(); if (!a || !a.refresh_token) return Promise.reject(new Error('Not signed in'));
    return token({ grant_type: 'refresh_token', refresh_token: a.refresh_token }).catch(function (e) { store(null); throw e; });
  }
  function logout() {
    var a = load(); store(null);
    if (a) fetch(BASE + '/api/v1/users/revoke-token', { method: 'POST', headers: { Authorization: 'Bearer ' + a.access_token } }).catch(function () {});
  }
  function authHeader() {
    var a = load(); if (!a) return Promise.resolve(null);
    var p = a.expires_at && Date.now() > a.expires_at - 30000 ? refresh() : Promise.resolve(a);
    return p.then(function (x) { return 'Bearer ' + x.access_token; });
  }
  function api(path, opts) {
    opts = opts || {};
    return (opts.auth ? authHeader() : Promise.resolve(null)).then(function (h) {
      var headers = Object.assign({}, opts.headers || {});
      if (h) headers.Authorization = h;
      if (opts.json) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(opts.json); }
      return fetch(BASE + path, { method: opts.method || 'GET', headers: headers, body: opts.body }).then(parse);
    });
  }
  function qs(o) { var p = new URLSearchParams(); for (var k in o) if (o[k] != null && o[k] !== '') p.set(k, o[k]); var s = p.toString(); return s ? '?' + s : ''; }

  var RRPT = {
    enabled: !!cfg.PEERTUBE_ENABLED, base: BASE,
    musicTag: cfg.PEERTUBE_MUSIC_TAG || 'rawreplay',   // FRIDAY-GUIDE §15: music is found by its tag
    isSignedIn: function () { return !!load(); },
    getClient: getClient, login: login, refresh: refresh, logout: logout,
    // POST /api/v1/users/register { username, password, email, displayName?, channel?: { name, displayName } } -> 204
    register: function (o) { return api('/api/v1/users/register', { method: 'POST', json: o }); },
    // Signup "requires approval" (FRIDAY-GUIDE §8.7, PeerTube 5.1+): POST /api/v1/users/registrations/request, same body + registrationReason.
    requestRegistration: function (o) { return api('/api/v1/users/registrations/request', { method: 'POST', json: o }); },
    // GET /api/v1/config (signup.allowed, signup.requiresEmailVerification, video upload limits)
    config: function () { return api('/api/v1/config'); },
    me: function () { return api('/api/v1/users/me', { auth: true }); },
    // GET /api/v1/videos?start&count&sort&search...
    listVideos: function (o) { return api('/api/v1/videos' + qs(Object.assign({ start: 0, count: 24, sort: '-publishedAt' }, o))); },
    listChannels: function (o) { return api('/api/v1/video-channels' + qs(Object.assign({ start: 0, count: 24, sort: '-createdAt' }, o))); },
    getChannel: function (handle) { return api('/api/v1/video-channels/' + encodeURIComponent(handle)); },
    channelVideos: function (handle, o) { return api('/api/v1/video-channels/' + encodeURIComponent(handle) + '/videos' + qs(Object.assign({ start: 0, count: 24, sort: '-publishedAt' }, o))); },
    // POST /api/v1/videos/upload multipart: videofile, channelId, name (+ description, privacy, licence, ...).
    // Uses XHR for upload progress. onProgress(fraction 0..1). Resolves { video: { id, uuid, shortUUID } }.
    // Review queue (FRIDAY-GUIDE §14): uploads always use the signed-in creator's OWN token, so PeerTube's
    // auto-block puts them in the moderators' queue. This client never holds an admin token, and it refuses to
    // upload from an admin or moderator account, because those skip review.
    upload: function (o, onProgress) {
      return RRPT.me().then(function (me) {
        if (me && me.role && (me.role.id === 0 || me.role.id === 1)) throw new Error('Admin and moderator accounts skip the review queue. Sign in with a creator account to upload.');
        return authHeader();
      }).then(function (h) {
        if (!h) throw new Error('Please sign in first.');
        return new Promise(function (resolve, reject) {
          var fd = new FormData();
          fd.append('channelId', o.channelId);
          fd.append('name', o.name);
          if (o.description) fd.append('description', o.description);
          fd.append('privacy', String(o.privacy || 1)); // 1 public, 2 unlisted, 3 private
          if (o.licence) fd.append('licence', String(o.licence));
          if (o.support) fd.append('support', o.support);
          fd.append('waitTranscoding', 'true');
          fd.append('videofile', o.file, o.file.name);
          var x = new XMLHttpRequest();
          x.open('POST', BASE + '/api/v1/videos/upload');
          x.setRequestHeader('Authorization', h);
          x.upload.onprogress = function (e) { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
          x.onload = function () {
            var b = null; try { b = JSON.parse(x.responseText); } catch (e) {}
            if (x.status >= 200 && x.status < 300) resolve(b);
            else reject(apiError({ status: x.status }, b));
          };
          x.onerror = function () { reject(new Error('Network error. The server may be down or not allowing this site (CORS).')); };
          x.send(fd);
        });
      });
    },
    api: api,
    // Handle availability. Handle = PeerTube username (unique, first come first served, permanent).
    // GET /api/v1/accounts/{name} is public: 404 = free, 200 = taken. Channel names share the same actor
    // namespace, so GET /api/v1/video-channels/{name} is checked too. Resolves { status: 'off'|'free'|'taken'|'error' }.
    // Flag off = no network call. This is advisory; POST /users/register still decides (409 if taken).
    checkHandle: function (name) {
      if (!RRPT.enabled) return Promise.resolve({ status: 'off' });
      function probe(path) {
        return fetch(BASE + path + encodeURIComponent(name)).then(function (r) {
          if (r.status === 404) return 'free'; if (r.ok) return 'taken'; throw new Error('HTTP ' + r.status);
        });
      }
      return Promise.all([probe('/api/v1/accounts/'), probe('/api/v1/video-channels/')])
        .then(function (a) { return { status: a.indexOf('taken') !== -1 ? 'taken' : 'free' }; })
        .catch(function () { return { status: 'error' }; });
    },
    // Account management
    updateMe: function (o) { return api('/api/v1/users/me', { method: 'PUT', auth: true, json: o }); },         // { displayName, description }
    uploadAvatar: function (file) { var fd = new FormData(); fd.append('avatarfile', file, file.name); return api('/api/v1/users/me/avatar/pick', { method: 'POST', auth: true, body: fd }); },
    askResetPassword: function (email) { return api('/api/v1/users/ask-reset-password', { method: 'POST', json: { email: email } }); },
    myVideos: function (o) { return api('/api/v1/users/me/videos' + qs(Object.assign({ start: 0, count: 50, sort: '-publishedAt' }, o)), { auth: true }); },
    createChannel: function (o) { return api('/api/v1/video-channels', { method: 'POST', auth: true, json: o }); },  // { name, displayName, description }
    updateChannel: function (handle, o) { return api('/api/v1/video-channels/' + encodeURIComponent(handle), { method: 'PUT', auth: true, json: o }); },
    notifications: function (o) { return api('/api/v1/users/me/notifications' + qs(Object.assign({ start: 0, count: 30, sort: '-createdAt' }, o)), { auth: true }); },
    readAllNotifications: function () { return api('/api/v1/users/me/notifications/read-all', { method: 'POST', auth: true }); },
    subscriptions: function () { return api('/api/v1/users/me/subscriptions?count=100', { auth: true }); },
    subscriptionVideos: function () { return api('/api/v1/users/me/subscriptions/videos?count=24&sort=-publishedAt', { auth: true }); },
    subscribe: function (uri) { return api('/api/v1/users/me/subscriptions', { method: 'POST', auth: true, json: { uri: uri } }); },   // uri = channel@host
    unsubscribe: function (uri) { return api('/api/v1/users/me/subscriptions/' + encodeURIComponent(uri), { method: 'DELETE', auth: true }); },
    watchUrl: function (v) { return BASE + '/w/' + (v.shortUUID || v.uuid); },
    embedUrl: function (v) { return BASE + '/videos/embed/' + (v.uuid || v.shortUUID); }
  };
  window.RRPT = RRPT;
})();
