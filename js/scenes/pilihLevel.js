/* Pilih Level (GDD bagian 8): kafe dari luar di kiri (berkembang sesuai level selesai), 5 papan level di kanan.
   Level terkunci bergembok; mengetuknya menjelaskan syaratnya. Level yang belum dibuat di versi ini memberi tahu dengan sopan. */
(function () {
  var LEVEL_ADA = [1, 2, 3, 4, 5];   // L5 Jam Sibuk: lingkup TAMBAHAN, dibuat di Fase 3
  Scenes.add('pilihLevel', {
    enter: function (root) {
      Aud.musik('judul');
      Aud.pramuat('kafe');   /* lagu bermain didekode lebih awal supaya tidak terlambat saat level dibuka */
      var seni = U.h('div', 'lapis');
      /* kafe berkembang: satu hiasan per level selesai; hiasan yang baru muncul diberi tahu sekali */
      var hiasan = 0;
      while (hiasan < 4 && Save.selesai(hiasan + 1)) hiasan++;
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarLuar({ kafeX: 30, papanNama: STR.judul.papanNama, lampu: hiasan >= 1, tanaman: hiasan >= 2, papanHias: hiasan >= 3, kursi: hiasan >= 4,
        kota: [[600, 140, 300, 1], [744, 120, 240, 0], [870, 150, 320, 1], [1024, 120, 260, 0], [1150, 140, 300, 1]] }));
      root.appendChild(seni);
      if (hiasan > Save.data.dekor) {
        var titik = { 1: [296, 356], 2: [374, 600], 3: [302, 640], 4: [146, 650] }[hiasan], gBaru = seni.querySelector('.dekor-' + hiasan);
        if (gBaru) gBaru.classList.add('dekor-baru');
        Save.data.dekor = hiasan; Save.save();
        setTimeout(function () {
          if (Scenes.name !== 'pilihLevel' || document.querySelector('.overlay')) return;
          UI.toast(STR.pilih.dekor[hiasan]);
          Aud.sfx('good');
          if (!UI.kurangi) UI.ledak(titik[0], titik[1], 14);
        }, 500);
      }
      root.appendChild(U.h('h1', 'judul-pilih', UI.esc(STR.pilih.judul)));
      var pertama = null;
      for (var n = 1; n <= 5; n++) (function (n) {
        var buka = Save.terbuka(n), l = Save.data.level[n], b = U.h('button', 'papan-pilih' + (buka ? '' : ' terkunci'));
        b.type = 'button'; b.dataset.id = 'level-' + n;
        b.style.left = '650px'; b.style.top = (164 + (n - 1) * 94) + 'px';
        var bintang = '';
        if (buka) for (var i = 0; i < 3; i++) bintang += UI.ikon('bintang', 34, !!(l && l.bintang > i));
        b.innerHTML = '<span class="nomor">' + n + '</span><span class="nama-level">' + UI.esc(U.fmt(STR.level.judul, { n: n, nama: STR.level.nama[n] })) + '</span>' +
          '<span class="bintang-level">' + (buka ? bintang : UI.ikon('gembok', 44)) + '</span>';
        b.setAttribute('aria-label', U.fmt(STR.level.judul, { n: n, nama: STR.level.nama[n] }) + (buka ? '' : ', ' + STR.ikon.gembok));
        b.addEventListener('pointerdown', function () { Aud.init(); Aud.sfx('click'); });
        b.addEventListener('click', function () {
          if (!buka) { Aud.sfx('gembok'); UI.toast(U.fmt(STR.pilih.terkunci, { n: n - 1 })); return; }
          if (LEVEL_ADA.indexOf(n) < 0) { UI.toast(STR.pilih.belumAda); return; }
          /* permainan pertama: Level 1 diawali hook 10 detik, yang lalu berlanjut ke Level 1 */
          Scenes.go(n === 1 && !Save.data.hook ? 'hook' : 'level' + n);
        });
        root.appendChild(b);
        if (n === 1) pertama = b;
      })(n);
      /* baris bawah: Beranda, Buku Menu, Hasil Belajarku, Pengaturan */
      root.appendChild(UI.tombolIkon('beranda', STR.tombol.beranda, function () { Scenes.go('judul'); }, { x: 650, y: 636, id: 'beranda' }));
      root.appendChild(Input.button(UI.ikon('buku', 34) + UI.esc(STR.tombol.bukuMenu), 'ketiga', function () { UI.bukuMenu(); }, { x: 730, y: 636, w: 210, h: 64, font: 24, id: 'pilih-buku' }));
      var terakhir = [5, 4, 3, 2, 1].filter(function (n) { return Save.selesai(n); })[0] || 0;
      var hasil = Input.button(UI.esc(STR.tombol.hasil), 'ketiga', function () { Scenes.go('hasil', { level: terakhir }); }, { x: 956, y: 636, w: 214, h: 64, font: 22, id: 'pilih-hasil' });
      hasil.disabled = !terakhir;
      root.appendChild(hasil);
      root.appendChild(UI.tombolIkon('gerigi', STR.ikon.pengaturan, function () { UI.pengaturan(function () { Scenes.go('pilihLevel'); }); }, { x: 1186, y: 636, id: 'pilih-pengaturan' }));
      /* sertifikat terbuka sesudah kelima level selesai */
      if (Scenes.sertifikatTerbuka()) root.appendChild(Input.button(UI.ikon('bintang', 34, true) + UI.esc(STR.pilih.sertifikat), 'utama', function () { Scenes.go('sertifikat'); }, { x: 20, y: 14, w: 240, h: 64, font: 24, id: 'pilih-sertifikat' }));
      /* chip Mode Santai */
      var santai = UI.barisSakelar(STR.pilih.santai, function () { return Save.data.settings.santai; }, function (v) { Save.data.settings.santai = v; Save.save(); }, 'pilih-santai');
      santai.classList.add('chip-santai');
      root.appendChild(santai);
      UI.idle.atur(function () { return pertama; });
      setTimeout(function () { if (pertama && pertama.isConnected) pertama.focus({ preventScroll: true }); }, 60);
    },
    uji: {
      keadaan: function () { return { langkah: 'pilih', siap: true }; },
      benar: function () { var n = LEVEL_ADA.filter(function (x) { return !Save.selesai(x); })[0]; return n ? ['level-' + n] : []; },
      salah: function () { return []; }
    }
  });
})();
