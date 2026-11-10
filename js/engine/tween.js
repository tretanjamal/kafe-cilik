/* Tween: easing + manajer tween berbasis delta waktu. Semua mengembalikan Promise. */
(function (root) {
  var c1 = 1.70158, c3 = c1 + 1;
  var Ease = {
    linear: function (t) { return t; },
    easeOutBack: function (t) { return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    easeInOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    easeOutCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    easeOutQuad: function (t) { return 1 - (1 - t) * (1 - t); }
  };
  var list = [];
  var Tween = {
    speed: 1, // 1 normal; <1 mempercepat (Kurangi animasi)
    paused: false, // menu jeda: semua animasi permainan berhenti
    update: function (dt) {
      if (Tween.paused) return;
      for (var i = list.length - 1; i >= 0; i--) {
        var tw = list[i];
        if (!tw) continue;   // daftar bisa dikosongkan saat berjalan
        tw.t += dt;
        var k = tw.dur <= 0 ? 1 : Math.min(1, tw.t / tw.dur);
        tw.fn(tw.ease(k), k);
        if (k >= 1) { list.splice(i, 1); tw.done(); }
      }
    },
    /* fn(eased, raw) dipanggil tiap frame; dur dalam ms */
    run: function (dur, fn, ease) {
      return new Promise(function (resolve) {
        list.push({ t: 0, dur: dur * Tween.speed / 1000, fn: fn, ease: ease || Ease.easeInOutCubic, done: resolve });
      });
    },
    value: function (from, to, dur, ease, fn) {
      return Tween.run(dur, function (e) { fn(from + (to - from) * e); }, ease);
    },
    to: function (obj, props, dur, ease, onUpdate) {
      var from = {}, k;
      for (k in props) from[k] = obj[k];
      return Tween.run(dur, function (e) {
        for (var k in props) obj[k] = from[k] + (props[k] - from[k]) * e;
        if (onUpdate) onUpdate(obj);
      }, ease);
    },
    wait: function (ms) { return Tween.run(ms, function () {}, Ease.linear); },
    clear: function () { list.length = 0; }
  };
  root.Ease = Ease;
  root.Tween = Tween;
  if (typeof module !== 'undefined') module.exports = { Ease: Ease, Tween: Tween };
})(typeof window !== 'undefined' ? window : globalThis);
