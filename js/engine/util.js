/* Util: helper kecil, RNG berbenih, penanda mode uji */
(function (root) {
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var U = {
    h: h,
    rng: mulberry32,
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    pick: function (rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; },
    /* isi {kunci} dalam teks dari objek o */
    fmt: function (s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); },
    shuffle: function (rnd, arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    TEST: /[?&]test=1/.test(root.location ? root.location.search : ''),
    /* HP atau tablet sentuh. ?hp=1 dan ?hp=0 untuk uji. */
    HP: (function () {
      var q = root.location ? /[?&]hp=([01])/.exec(root.location.search) : null, nav = root.navigator;
      if (q) return q[1] === '1';
      if (!nav) return false;
      return /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '') || (nav.maxTouchPoints > 1 && !!root.matchMedia && root.matchMedia('(pointer: coarse)').matches);
    })()
  };
  root.U = U;
  if (typeof module !== 'undefined') module.exports = U;
})(typeof window !== 'undefined' ? window : globalThis);
