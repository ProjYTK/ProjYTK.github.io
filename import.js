/* RawReel channel import helper.
   Everything here runs in the creator's browser. Files are read with FileReader;
   nothing is uploaded anywhere. The parser is also usable from node for tests. */
(function (root) {
  'use strict';

  // ---------- CSV parsing (RFC 4180-ish: quotes, "" escapes, newlines inside quotes, BOM, CRLF) ----------
  function detectDelimiter(text) {
    var firstLine = text.split(/\r?\n/, 1)[0] || '';
    var counts = { ',': 0, ';': 0, '\t': 0 }, inQ = false;
    for (var i = 0; i < firstLine.length; i++) {
      var c = firstLine[i];
      if (c === '"') inQ = !inQ;
      else if (!inQ && c in counts) counts[c]++;
    }
    var best = ',';
    for (var d in counts) if (counts[d] > counts[best]) best = d;
    return best;
  }

  function parseCSV(text) {
    text = String(text || '').replace(/^\uFEFF/, '');
    var delim = detectDelimiter(text);
    var rows = [], row = [], field = '', inQ = false, i = 0, n = text.length;
    while (i < n) {
      var c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === delim) { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (v) { return v.trim() !== ''; }); });
  }

  // ---------- Header matching, tolerant of naming variations ----------
  // "Video Title (Original)" -> "videotitle"; "video_id" -> "videoid"; "Approx Duration (ms)" -> "approxdurationms"
  function norm(h) {
    return String(h || '').toLowerCase().replace(/\(original\)/g, '').replace(/[^a-z0-9]/g, '');
  }
  var isLang = function (h) { return /language|lang$/.test(h); };

  function findCol(headers, exact, test) {
    var N = headers.map(norm), i;
    for (var e = 0; e < exact.length; e++) { i = N.indexOf(exact[e]); if (i >= 0) return i; }
    for (i = 0; i < N.length; i++) if (test(N[i])) return i;
    return -1;
  }

  function mapColumns(headers) {
    var N = headers.map(norm);
    return {
      id: findCol(headers, ['videoid', 'youtubeid', 'youtubevideoid', 'id', 'contentid'],
        function (h) { return /videoid$/.test(h) && !/channel|playlist/.test(h); }),
      title: findCol(headers, ['videotitle', 'title', 'name', 'videoname'],
        function (h) { return /title/.test(h) && !isLang(h) && !/playlist|channel/.test(h); }),
      description: findCol(headers, ['videodescription', 'description', 'desc'],
        function (h) { return /description/.test(h) && !isLang(h) && !/channel|playlist/.test(h); }),
      privacy: findCol(headers, ['privacy', 'privacystatus', 'visibility', 'videoprivacy'],
        function (h) { return /privacy|visibility/.test(h); }),
      state: findCol(headers, ['videostate', 'state', 'status'], function (h) { return /state$/.test(h); }),
      duration: findCol(headers, ['approxdurationms', 'durationms', 'duration'], function (h) { return /duration/.test(h); }),
      durationIsMs: N.some(function (h) { return /duration/.test(h) && /ms$/.test(h); }),
      created: findCol(headers, ['videocreatetimestamp', 'videopublishtimestamp', 'publishedat', 'uploaddate', 'date'],
        function (h) { return /timestamp|publish|created|uploaded|date/.test(h); }),
      channel: findCol(headers, ['channelid'], function (h) { return /channelid/.test(h); }),
      category: findCol(headers, ['videocategory', 'category'], function (h) { return /category/.test(h); }),
      tags: N.reduce(function (a, h, i) { if (/^(video)?tags?\d*$/.test(h) || /^tag\d+$/.test(h)) a.push(i); return a; }, [])
    };
  }

  function fmtDuration(v, isMs) {
    var n = Number(v); if (!isFinite(n) || n <= 0) return '';
    var s = Math.round(isMs ? n / 1000 : n), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(sec).padStart(2, '0');
  }

  function rowsToVideos(rows) {
    if (!rows.length) return { videos: [], columns: null, error: 'The file is empty.' };
    var headers = rows[0], c = mapColumns(headers);
    if (c.title < 0 && c.id < 0) return { videos: [], columns: c, headers: headers,
      error: 'Could not find a title or video ID column. Is this the "videos.csv" file from the "video metadata" folder?' };
    var get = function (r, i) { return i >= 0 && r[i] != null ? String(r[i]).trim() : ''; };
    var videos = rows.slice(1).map(function (r) {
      return {
        id: get(r, c.id), title: get(r, c.title) || '(untitled)', description: get(r, c.description),
        privacy: get(r, c.privacy), state: get(r, c.state), duration: fmtDuration(get(r, c.duration), c.durationIsMs || c.duration < 0),
        created: get(r, c.created), channel: get(r, c.channel), category: get(r, c.category),
        tags: c.tags.map(function (i) { return get(r, i); }).filter(Boolean)
      };
    }).filter(function (v) { return v.id || v.title !== '(untitled)'; });
    return { videos: videos, columns: c, headers: headers };
  }

  // JSON fallback: older/other exports and API dumps (array, {videos:[...]}, {items:[...]}, YouTube API "snippet" shape)
  function jsonToVideos(text) {
    var data = JSON.parse(String(text).replace(/^\uFEFF/, ''));
    var list = Array.isArray(data) ? data : (data.videos || data.items || data.uploads || []);
    if (!Array.isArray(list)) list = [];
    var rows = list.map(function (o) {
      var flat = {};
      (function walk(obj, pre) {
        for (var k in obj) {
          var v = obj[k];
          if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, pre + k + ' ');
          else flat[(pre + k).trim()] = Array.isArray(v) ? v.join(', ') : v;
        }
      })(o, '');
      return flat;
    });
    var keys = [];
    rows.forEach(function (r) { for (var k in r) if (keys.indexOf(k) < 0) keys.push(k); });
    // Prefer the leaf name ("snippet title" -> matches /title/), but keep "id"/"videoId" exact
    var headers = keys.map(function (k) { var p = k.split(' '); return p.length > 1 && p[p.length - 1] === 'videoId' ? 'videoId' : (p.length > 1 && p[0] === 'snippet' ? p.slice(1).join(' ') : k); });
    return rowsToVideos([headers].concat(rows.map(function (r) { return keys.map(function (k) { return r[k] == null ? '' : r[k]; }); })));
  }

  function parseTakeout(text, filename) {
    var t = String(text || '').trim();
    if (/\.json$/i.test(filename || '') || /^[\[{]/.test(t)) {
      try { return jsonToVideos(t); } catch (e) { return { videos: [], error: 'That JSON file could not be read: ' + e.message }; }
    }
    return rowsToVideos(parseCSV(text));
  }

  // Merge several videos*.csv files (Takeout splits large channels), de-duplicating by video ID.
  function mergeVideos(lists) {
    var seen = {}, out = [];
    lists.forEach(function (l) { l.forEach(function (v) { var k = v.id || v.title; if (!seen[k]) { seen[k] = 1; out.push(v); } }); });
    return out;
  }

  // Takeout names video files after the title, cut to ~55 chars, with some punctuation changed and "(1)" added on clashes.
  // So we compare letters/digits only and accept a filename that is a prefix of the title.
  function key(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, ''); }
  function matchFiles(videos, fileNames) {
    var stems = fileNames.map(function (f) { return { name: f, k: key(f.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/\(\d+\)$/, '')) }; });
    var used = {};
    videos.forEach(function (v) {
      var t = key(v.title), best = null;
      stems.forEach(function (s) {
        if (used[s.name] || !s.k) return;
        if (t === s.k || (s.k.length >= 8 && t.indexOf(s.k) === 0)) { if (!best || s.k.length > best.k.length) best = s; }
      });
      if (best) { used[best.name] = 1; v.file = best.name; }
    });
    return videos;
  }

  function buildMailBody(o) {
    var lines = ['RawReel channel import', '', 'Creator name: ' + (o.creator || ''), ];
    if (o.channel) lines.push('YouTube channel ID: ' + o.channel);
    lines.push('Videos: ' + o.items.length, '');
    o.items.forEach(function (v, i) {
      lines.push((i + 1) + '. ' + v.title);
      lines.push('   Archive ID: ' + v.archiveId + '  (https://archive.org/details/' + v.archiveId + ')');
      if (v.id) lines.push('   YouTube ID: ' + v.id);
      lines.push('');
    });
    lines.push('I own these videos or have the rights to post them, and they follow the RawReel rules.');
    return lines.join('\n');
  }

  function buildMailto(o) {
    return 'mailto:RR.Support.Agent@gmail.com?subject=' + encodeURIComponent('RawReel channel import') + '&body=' + encodeURIComponent(buildMailBody(o));
  }

  // Internet Archive identifiers: letters, digits, _ - . ; people often paste the whole URL, so accept that too.
  function cleanArchiveId(s) {
    s = String(s || '').trim();
    var m = s.match(/archive\.org\/(?:details|embed|download)\/([^\/?#\s]+)/i);
    if (m) s = m[1];
    return /^[A-Za-z0-9][A-Za-z0-9._-]{1,99}$/.test(s) ? s : '';
  }

  var api = { parseCSV: parseCSV, mapColumns: mapColumns, parseTakeout: parseTakeout, mergeVideos: mergeVideos,
    matchFiles: matchFiles, buildMailBody: buildMailBody, buildMailto: buildMailto, cleanArchiveId: cleanArchiveId };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RRImport = api;

  // ---------- Page wiring (browser only) ----------
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var list = $('imp-list'), status = $('imp-status'), state = { videos: [], files: [] };
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

    function render() {
      var v = state.videos;
      $('imp-results').hidden = !v.length;
      if (!v.length) { list.innerHTML = ''; return; }
      var thumbs = $('imp-thumbs').checked;
      list.innerHTML = v.map(function (x, i) {
        var snip = x.description.replace(/\s+/g, ' ').slice(0, 140) + (x.description.length > 140 ? '…' : '');
        var meta = [x.privacy, x.duration, x.id && ('YouTube ID ' + x.id)].filter(Boolean).map(esc).join(' · ');
        var th = thumbs && /^[A-Za-z0-9_-]{6,}$/.test(x.id) ? '<img alt="" loading="lazy" src="https://i.ytimg.com/vi/' + esc(x.id) + '/mqdefault.jpg">' : 'No preview';
        return '<div class="imp-item" data-i="' + i + '">' +
          '<label class="imp-pickwrap"><input type="checkbox" class="imp-pick" aria-label="Import ' + esc(x.title) + '"' + (x.pick ? ' checked' : '') + '></label>' +
          '<div class="thumb imp-th">' + th + (x.duration ? '<span class="dur">' + esc(x.duration) + '</span>' : '') + '</div>' +
          '<div class="imp-txt"><h3>' + esc(x.title) + '</h3><p>' + (esc(snip) || '<i>No description</i>') + '</p>' +
          '<small>' + meta + (x.file ? ' · <b>File: ' + esc(x.file) + '</b>' : '') + '</small></div>' +
          '<input class="field imp-aid" placeholder="Archive ID" value="' + esc(x.archiveId || '') + '" aria-label="Internet Archive ID for ' + esc(x.title) + '">' +
          '</div>';
      }).join('');
      count();
    }
    function count() {
      var n = state.videos.filter(function (x) { return x.pick; }).length;
      $('imp-count').textContent = n + ' of ' + state.videos.length + ' selected';
    }
    list.addEventListener('change', function (e) {
      var it = e.target.closest('.imp-item'); if (!it) return;
      var v = state.videos[+it.dataset.i];
      if (e.target.classList.contains('imp-pick')) { v.pick = e.target.checked; count(); }
    });
    list.addEventListener('input', function (e) {
      var it = e.target.closest('.imp-item'); if (!it || !e.target.classList.contains('imp-aid')) return;
      state.videos[+it.dataset.i].archiveId = e.target.value; e.target.classList.remove('imp-bad');
    });
    $('imp-thumbs').addEventListener('change', render);
    $('imp-all').addEventListener('click', function () { state.videos.forEach(function (x) { x.pick = true; }); render(); });
    $('imp-none').addEventListener('click', function () { state.videos.forEach(function (x) { x.pick = false; }); render(); });

    function load(results) {
      var errs = results.filter(function (r) { return r.error; }).map(function (r) { return r.name + ': ' + r.error; });
      var vids = mergeVideos(results.map(function (r) { return r.videos || []; }));
      vids.forEach(function (x) { x.pick = !/private/i.test(x.privacy) && !/deleted|rejected|failed/i.test(x.state); });
      matchFiles(vids, state.files);
      state.videos = vids;
      var matched = vids.filter(function (x) { return x.file; }).length;
      status.className = 'imp-status' + (errs.length && !vids.length ? ' bad' : '');
      status.textContent = vids.length
        ? 'Found ' + vids.length + ' video' + (vids.length > 1 ? 's' : '') + '. Private, deleted and failed videos start unticked.' +
          (state.files.length ? ' Matched ' + matched + ' of ' + state.files.length + ' video files by title.' : '') + (errs.length ? ' Skipped: ' + errs.join('; ') : '')
        : (errs.join(' ') || 'No videos found in that file.');
      render();
    }
    $('imp-csv').addEventListener('change', function (e) {
      var fs = Array.prototype.slice.call(e.target.files); if (!fs.length) return;
      Promise.all(fs.map(function (f) { return f.text().then(function (t) { var r = parseTakeout(t, f.name); r.name = f.name; return r; }); })).then(load);
    });
    $('imp-files').addEventListener('change', function (e) {
      state.files = Array.prototype.map.call(e.target.files, function (f) { return f.name; });
      if (state.videos.length) { state.videos.forEach(function (x) { delete x.file; }); matchFiles(state.videos, state.files); render();
        status.textContent = 'Matched ' + state.videos.filter(function (x) { return x.file; }).length + ' of ' + state.files.length + ' video files by title.'; }
      else status.textContent = state.files.length + ' video files chosen. Now choose your videos.csv file.';
    });
    $('imp-sample').addEventListener('click', function () {
      fetch('sample-videos.csv').then(function (r) { return r.text(); }).then(function (t) { var r = parseTakeout(t, 'videos.csv'); r.name = 'sample'; load([r]); })
        .catch(function () { status.textContent = 'The sample file could not be loaded.'; });
    });

    $('imp-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var picked = state.videos.filter(function (x) { return x.pick; }), missing = 0;
      var err = $('imp-err'); err.textContent = '';
      if (!picked.length) { err.textContent = 'Choose your videos.csv file and tick at least one video first.'; return; }
      Array.prototype.forEach.call(list.querySelectorAll('.imp-item'), function (el) {
        var v = state.videos[+el.dataset.i]; if (!v.pick) return;
        var id = cleanArchiveId(v.archiveId);
        if (!id) { missing++; el.querySelector('.imp-aid').classList.add('imp-bad'); } else v.archiveId = id;
      });
      if (missing) { err.textContent = missing + ' ticked video' + (missing > 1 ? 's need an' : ' needs an') + ' Internet Archive ID. Untick any you haven\'t uploaded yet.'; return; }
      var channel = (picked.find(function (x) { return x.channel; }) || {}).channel || '';
      var url = buildMailto({ creator: $('imp-creator').value.trim(), channel: channel, items: picked });
      if (url.length > 1900) err.textContent = 'Long list: some email apps cut off very long messages. If yours does, submit in smaller batches.';
      location.href = url;
    });
    if (/[?&]demo=1/.test(location.search)) $('imp-sample').click();
  });
})(typeof window !== 'undefined' ? window : globalThis);
