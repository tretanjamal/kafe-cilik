/* Hasil Belajarku (GDD bagian 8): kasir cilik dan Kak Lala bersorak, bintang muncul satu per satu dengan nada bertingkat,
   "Yang sudah aku kuasai" dalam bahasa anak, tombol Lanjut. Ringkasan untuk Guru dibuka dari tombol di dalamnya. */
(function () {
  var TAG_LEVEL = { 1: ['kosakata'], 2: ['pesanan', 'ungkapan'], 3: ['angka-harga', 'total', 'ungkapan'], 4: ['kembalian', 'ungkapan'], 5: ['pesanan', 'total', 'kembalian'] };
  var hidup = false;
  Scenes.add('hasil', {
    enter: function (root, p) {
      hidup = true;
      var level = p.level || 1, data = Save.data.level[level] || { bintang: 0 }, bintang = p.bintang != null ? p.bintang : data.bintang;
      Aud.musik('judul');
      var seni = U.h('div', 'lapis');
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarDinding() + '<g id="tokoh-hasil"></g>' + Seni.konter());
      root.appendChild(seni);
      var g = seni.querySelector('#tokoh-hasil');
      Kafe.tokoh(g, 'lala', 230, 118, 0.98, { eks: 'sorak' });
      Kafe.tokoh(g, 'kasir', 24, 196, 1.02, { eks: 'sorak', lengan: 'lambai' });
      var panel = U.h('div', 'panel-hasil');
      /* hanya keterampilan yang sudah berkembang atau dikuasai disebut "sudah aku kuasai"; saran latihan dari miskonsepsi level ini */
      var tags = (TAG_LEVEL[level] || []).filter(function (t) { return Save.status(t) !== 'belum'; });
      var perluLatih = (TAG_LEVEL[level] || []).some(function (t) { return Save.status(t) === 'latihan'; });
      var tip = p.tip && STR.hasil.tip[p.tip] ? STR.hasil.tip[p.tip] : (perluLatih ? STR.hasil.latihUmum : '');
      var bintangHtml = '';
      for (var i = 0; i < 3; i++) bintangHtml += '<span class="b' + i + '">' + UI.ikon('bintang', 84, false) + '</span>';
      panel.innerHTML = '<h1 class="judul-hasil">' + UI.esc(STR.hasil.judul) + '</h1>' +
        '<p class="sub-hasil" data-cek="sub hasil">' + UI.esc(U.fmt(STR.level.judul, { n: level, nama: STR.level.nama[level] })) + ' <span class="pisah">|</span> ' + UI.esc(U.fmt(STR.hasil.kas, { rp: Seni.rp(Save.data.kas) })) + '</p>' +
        '<div class="bintang-hasil" role="img" aria-label="' + bintang + ' / 3">' + bintangHtml + '</div>' +
        '<div class="kuasai" data-cek="kuasai"><h2>' + UI.esc(STR.hasil.kuasai) + '</h2><ul>' +
        (tags.length ? tags.map(function (t) { var s = Save.status(t); return '<li><span>' + UI.esc(STR.tag[t]) + '</span><span class="chip-status status-' + s + '">' + UI.esc(STR.hasil.status[s]) + '</span></li>'; }).join('') : '<li>' + UI.esc(STR.hasil.kosong) + '</li>') + '</ul></div>' +
        (tip ? '<div class="kuasai latih" data-cek="latih"><h2>' + UI.esc(STR.hasil.latih) + '</h2><p>' + UI.esc(tip) + '</p></div>' : '') +
        '';
      var baris = U.h('div', 'baris-tombol');
      baris.setAttribute('data-cek', 'tombol hasil');
      var lanjut = Input.button(STR.hasil.lanjut, 'utama alir', function () { Scenes.go(Scenes.sertifikatBaru() ? 'sertifikat' : 'pilihLevel'); }, { w: 180, h: 80, font: 30, id: 'hasil-lanjut' });
      baris.appendChild(lanjut);
      baris.appendChild(Input.button(STR.hasil.ulangi, 'ketiga alir', function () { Scenes.go('level' + level); }, { w: 190, h: 80, font: 24, id: 'hasil-ulangi' }));
      baris.appendChild(Input.button(STR.tombol.guru, 'kedua alir', function () { UI.guru(); }, { w: 260, h: 80, font: 20, id: 'hasil-guru' }));
      panel.appendChild(baris);
      root.appendChild(panel);
      /* bintang muncul satu per satu dengan nada bertingkat */
      var rantai = Tween.wait(600);
      for (var j = 0; j < bintang; j++) (function (k) {
        rantai = rantai.then(function () {
          if (!hidup) return;
          var el = panel.querySelector('.b' + k);
          el.innerHTML = UI.ikon('bintang', 84, true);
          Aud.sfx('star', k);
          var q = UI.titik(el, 0.5); if (q) UI.ledak(q.x, q.y, 10);
          return UI.kurangi ? Tween.wait(200) : Tween.run(380, function (e) { el.style.scale = (0.3 + 0.7 * e).toFixed(3); }, Ease.easeOutBack);
        });
      })(j);
      rantai.then(function () { if (hidup) Aud.sfx('fanfare', bintang); });
      UI.idle.atur(function () { return lanjut; });
      setTimeout(function () { if (lanjut.isConnected) lanjut.focus({ preventScroll: true }); }, 60);
    },
    exit: function () { hidup = false; },
    uji: {
      keadaan: function () { return { langkah: 'hasil', siap: true }; },
      benar: function () { return ['hasil-lanjut']; },
      salah: function () { return []; }
    }
  });
})();
