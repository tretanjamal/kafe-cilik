/* Layar muat: logo, cangkir yang terisi teh sebagai batang kemajuan, dan satu "Tahukah kamu?".
   Pola dari Lompat Waktu: tampil minimal MIN ms supaya sempat terbaca, kemajuan tidak pernah mundur. */
(function (root) {
  var MIN = U.TEST && !/[?&]muat=1/.test(location.search) ? 0 : 1800, el = null, t0 = 0, nilai = 0;
  var Muat = {
    buka: function () {
      t0 = performance.now(); nilai = 0;
      var tips = STR.muatTips;
      el = U.h('div', '',
        '<div class="muat-logo">' + Seni.svg(520, 300, Seni.logo(STR.judul.a, STR.judul.b), { vb: '40 64 520 300' }) + '</div>' +
        '<div class="muat-cangkir">' + Seni.cangkirMuat() + '</div>' +
        '<div class="muat-teks"></div>' +
        '<div class="muat-tip"><b>' + UI.esc(STR.muatTahu) + '</b>' + UI.esc(tips[Math.floor(Math.random() * tips.length)]) + '</div>');
      el.id = 'muat';
      Stage.el.appendChild(el);
      Muat.atur(0);
    },
    /* k: 0 sampai 1; teh naik di dalam cangkir (rongga cangkir dari y 48 sampai 124) */
    atur: function (k) {
      if (!el) return;
      nilai = Math.max(nilai, k);
      var teh = el.querySelector('#muat-teh'), tinggi = 76 * nilai;
      teh.setAttribute('y', 124 - tinggi); teh.setAttribute('height', tinggi);
      el.querySelector('.muat-teks').textContent = STR.muat + '... ' + Math.round(nilai * 100) + '%';
    },
    tunggu: function () { return new Promise(function (ok) { setTimeout(ok, Math.max(0, MIN - (performance.now() - t0))); }); },
    tutup: function () {
      if (!el) return;
      var e = el;
      el = null;
      if (!MIN) { e.remove(); return; }
      e.classList.add('tutup');
      setTimeout(function () { e.remove(); }, 420);
    }
  };
  root.Muat = Muat;
})(window);
