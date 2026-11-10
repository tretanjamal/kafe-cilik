/* Layar penuh: Fullscreen API (awalan webkit untuk Safari), hanya dari klik/ketukan atau tombol F.
   Memantau fullscreenchange agar ikon tetap benar (mis. keluar lewat Esc), menjalankan ulang penskala kanvas, dan mengunci lanskap bila bisa.
   Tidak ada galat bagi murid: bila tidak didukung/ditolak, tombol disembunyikan atau muncul pesan singkat. */
(function (root) {
  var doc = document, el = doc.documentElement, listeners = [], FS = {};
  function reqFn() { return el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || null; }
  function exitFn() { return doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen || null; }
  FS.supported = function () {
    if (!reqFn()) return false;
    if (doc.fullscreenEnabled === false || doc.webkitFullscreenEnabled === false) return false;   // mis. iframe tanpa allow="fullscreen"
    return true;
  };
  FS.isFull = function () { return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement); };
  FS.onChange = function (fn) { listeners.push(fn); };
  FS.offChange = function (fn) { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  function changed() {
    root.dispatchEvent(new Event('resize'));                       // penskala kanvas 16:9 + letterbox dihitung ulang
    setTimeout(function () { root.dispatchEvent(new Event('resize')); }, 120);   // beberapa peramban memperbarui ukuran sedikit terlambat
    if (FS.isFull() && root.screen && screen.orientation && screen.orientation.lock) {
      try { var p = screen.orientation.lock('landscape'); if (p && p.catch) p.catch(function () { }); } catch (e) { }   // tidak didukung: abaikan
    }
    listeners.slice().forEach(function (fn) { try { fn(FS.isFull()); } catch (e) { } });
  }
  doc.addEventListener('fullscreenchange', changed);
  doc.addEventListener('webkitfullscreenchange', changed);
  /* masuk/keluar. onDenied() dipanggil bila ditolak. Aman dipanggil dari handler klik. Mengembalikan true bila API dipanggil. */
  FS.toggle = function (onDenied) {
    var fail = function () { if (onDenied) onDenied(); };
    try {
      if (FS.isFull()) { var ex = exitFn(); if (ex) { var q = ex.call(doc); if (q && q.catch) q.catch(fail); } return true; }
      var rq = reqFn(); if (!rq) { fail(); return false; }
      var r = rq.call(el); if (r && r.catch) r.catch(fail);
      return true;
    } catch (e) { fail(); return false; }
  };
  /* pintasan keyboard F */
  doc.addEventListener('keydown', function (e) {
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey && FS.supported()) {
      var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      FS.toggle(function () { if (root.UI && UI.toast) UI.toast(STR.icons.fsDenied); });
      e.preventDefault();
    }
  });
  root.FS = FS;
})(window);
