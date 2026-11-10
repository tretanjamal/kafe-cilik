/* Sertifikat (permintaan kreator): muncul sekali sesudah kelima level selesai, dan bisa dibuka lagi dari Pilih Level. Digambar di kanvas 1600x1000 (huruf Lilita One dan Andika yang dibundel), lalu bisa disimpan
   sebagai PNG. Nama dan sekolah dari isian awal (boleh kosong: "Kasir Cilik"); tidak dikirim ke mana pun. */
(function () {
  var W = 1600, H = 1000;
  function bintangPath(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }
  function teksBergaris(c, t, x, y, isi, garis, lebar) {
    c.lineJoin = 'round'; c.lineWidth = lebar; c.strokeStyle = garis; c.strokeText(t, x, y);
    c.fillStyle = isi; c.fillText(t, x, y);
  }
  function pecah(c, t, maks) {
    var kata = t.split(' '), baris = [], kini = '';
    kata.forEach(function (k) { var coba = kini ? kini + ' ' + k : k; if (c.measureText(coba).width > maks && kini) { baris.push(kini); kini = k; } else kini = coba; });
    if (kini) baris.push(kini);
    return baris;
  }
  function tanggal() {
    var d = new Date();
    return d.getDate() + ' ' + STR.sertifikat.bulan[d.getMonth()] + ' ' + d.getFullYear();
  }
  /* gambar: Image potret Kak Lala (boleh null bila tidak bisa dipakai) */
  function lukis(kanvas, gambar) {
    var c = kanvas.getContext('2d'), S = STR.sertifikat, w = Seni.W, m = Save.data.murid || {};
    c.clearRect(0, 0, W, H);
    /* kertas, bingkai tinta, dan pita tenda pandan-krem */
    c.fillStyle = w.krem; c.fillRect(0, 0, W, H);
    c.lineWidth = 14; c.strokeStyle = w.tinta; c.strokeRect(24, 24, W - 48, H - 48);
    for (var i = 0; i < 26; i++) { c.fillStyle = i % 2 ? w.krem : w.pandan; c.fillRect(31 + i * 59, 31, 59, 40); }
    c.lineWidth = 6; c.beginPath(); c.moveTo(31, 71); c.lineTo(W - 31, 71); c.stroke();
    c.lineWidth = 4; c.strokeStyle = w.mangga; c.strokeRect(60, 96, W - 120, H - 160);
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.font = '400 120px "Lilita One", "Trebuchet MS", sans-serif';
    teksBergaris(c, S.judul, W / 2, 230, w.mangga, w.tinta, 16);
    c.fillStyle = w.tinta; c.font = '700 40px Andika, "Trebuchet MS", sans-serif';
    c.fillText(S.sub, W / 2, 292);
    c.font = '400 40px Andika, "Trebuchet MS", sans-serif'; c.fillText(S.diberikan, W / 2, 362);
    var nama = (m.nama || '').trim() || S.tanpaNama;
    var ukuran = 96;
    do { c.font = '400 ' + ukuran + 'px "Lilita One", "Trebuchet MS", sans-serif'; ukuran -= 4; } while (c.measureText(nama).width > 1200 && ukuran > 48);
    teksBergaris(c, nama, W / 2, 462, w.jambu, w.tinta, 12);
    var y = 520;
    if ((m.sekolah || '').trim()) { c.fillStyle = w.tinta; c.font = '700 38px Andika, "Trebuchet MS", sans-serif'; c.fillText(m.sekolah.trim(), W / 2, y); y += 56; } else y += 14;
    c.fillStyle = w.tinta; c.font = '400 38px Andika, "Trebuchet MS", sans-serif';
    pecah(c, S.selesai, 1300).forEach(function (b) { c.fillText(b, W / 2, y); y += 48; });
    /* bintang per level */
    var x0 = W / 2 - 2 * 230, total = 0, yb = y + 70;
    for (var n = 1; n <= 5; n++) {
      var l = Save.data.level[n], b = l && l.selesai ? l.bintang : 0, cx = x0 + (n - 1) * 230;
      total += b;
      c.fillStyle = w.tinta; c.font = '400 34px "Lilita One", "Trebuchet MS", sans-serif'; c.fillText(U.fmt(S.level, { n: n }), cx, yb - 36);
      for (var k = 0; k < 3; k++) {
        bintangPath(c, cx - 56 + k * 56, yb, 24);
        c.fillStyle = k < b ? w.mangga : Seni.campur(w.krem, w.tinta, 0.15); c.fill();
        c.lineWidth = 4; c.strokeStyle = w.tinta; c.stroke();
      }
    }
    c.fillStyle = w.tinta; c.font = '700 34px Andika, "Trebuchet MS", sans-serif';
    c.fillText(U.fmt(S.total, { n: total }), W / 2, yb + 80);
    /* tanggal (kiri) dan tanda tangan Kak Lala (kanan) */
    c.textAlign = 'left'; c.font = '400 34px Andika, "Trebuchet MS", sans-serif';
    c.fillText(U.fmt(S.tanggal, { t: tanggal() }), 110, H - 110);
    if (gambar) c.drawImage(gambar, W - 470, H - 212, 112, 112);
    c.lineWidth = 3; c.beginPath(); c.moveTo(W - 340, H - 140); c.lineTo(W - 110, H - 140); c.stroke();
    c.font = '700 34px Andika, "Trebuchet MS", sans-serif'; c.fillText(S.ttd, W - 340, H - 104);
    c.font = '400 30px Andika, "Trebuchet MS", sans-serif'; c.fillText(S.ttdPeran, W - 340, H - 68);
  }
  /* PNG dari kanvas; bila kanvas tercemar oleh potret, digambar ulang tanpa potret di kanvas baru */
  function buatUrl(kanvas) {
    try { return kanvas.toDataURL('image/png'); } catch (e) { }
    var k2 = document.createElement('canvas');
    k2.width = W; k2.height = H; lukis(k2, null);
    try { return k2.toDataURL('image/png'); } catch (e2) { return null; }
  }
  function simpan(kanvas) {
    var url = buatUrl(kanvas);
    if (!url) { UI.toast(STR.sertifikat.gagal); return; }
    var m = Save.data.murid || {}, a = document.createElement('a');
    a.href = url; a.download = STR.sertifikat.berkas + ((m.nama || '').trim() ? ' - ' + m.nama.trim().replace(/[\\/:*?"<>|]/g, '') : '') + '.png';
    document.body.appendChild(a); a.click(); a.remove();
    UI.toast(STR.sertifikat.tersimpan);
  }

  Scenes.add('sertifikat', {
    enter: function (root) {
      Aud.musik('judul');
      var seni = U.h('div', 'lapis');
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarDinding() + Seni.konter());
      root.appendChild(seni);
      /* kanvas tidak ditempel; yang tampil gambar PNG-nya, supaya bisa ditekan lama atau diklik kanan untuk disimpan */
      var kanvas = document.createElement('canvas');
      kanvas.width = W; kanvas.height = H;
      var gambar = U.h('img', 'kanvas-sertifikat gambar-sertifikat');
      root.appendChild(gambar);
      var potret = null;
      function tampil() {
        var m = Save.data.murid || {}, url = buatUrl(kanvas);
        gambar.alt = STR.sertifikat.judul + ': ' + ((m.nama || '').trim() || STR.sertifikat.tanpaNama);
        if (url) gambar.src = url;
      }
      var huruf = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('120px "Lilita One"'), document.fonts.load('700 40px Andika'), document.fonts.load('400 30px Andika')]) : Promise.resolve();
      huruf.catch(function () { }).then(function () {
        lukis(kanvas, null); tampil();
        var img = new Image();
        img.onload = function () { potret = img; if (Scenes.name === 'sertifikat') { lukis(kanvas, img); tampil(); } };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Seni.potret('lala', 120, { eks: 'sorak' }));
      });
      var baris = U.h('div', 'baris-sertifikat');
      baris.appendChild(Input.button(UI.esc(STR.sertifikat.simpan), 'utama alir', function () { simpan(kanvas); }, { w: 300, h: 64, font: 28, id: 'sertifikat-simpan' }));
      /* nama bisa diperbaiki sebelum disimpan (perangkat yang dipakai bergantian) */
      baris.appendChild(Input.button(UI.esc(STR.sertifikat.ubahNama), 'ketiga alir', function () { UI.identitas(function () { lukis(kanvas, potret); tampil(); }); }, { w: 220, h: 64, font: 26, id: 'sertifikat-ubah' }));
      var lanjut = Input.button(UI.esc(STR.hasil.lanjut), 'kedua alir', function () { Scenes.go('pilihLevel'); }, { w: 200, h: 64, font: 28, id: 'sertifikat-lanjut' });
      baris.appendChild(lanjut);
      root.appendChild(baris);
      /* sertifikat sudah diperlihatkan (jumlah level selesai saat itu) */
      Save.data.sertifikat = [1, 2, 3, 4, 5].filter(function (n) { return Save.selesai(n); }).length;
      Save.save();
      Aud.sfx('fanfare', 3);
      if (!UI.kurangi) setTimeout(function () { if (Scenes.name === 'sertifikat') { UI.ledak(400, 200, 16); UI.ledak(880, 200, 16); } }, 400);
      setTimeout(function () { if (lanjut.isConnected) lanjut.focus({ preventScroll: true }); }, 60);
    },
    uji: {
      keadaan: function () { return { langkah: 'sertifikat', siap: true }; },
      benar: function () { return ['sertifikat-lanjut']; },
      salah: function () { return []; }
    }
  });
  /* sertifikat terbuka bila kelima level selesai */
  Scenes.sertifikatTerbuka = function () { return [1, 2, 3, 4, 5].every(function (n) { return Save.selesai(n); }); };
  /* perlu diperlihatkan otomatis: terbuka dan ada level baru yang selesai sejak terakhir diperlihatkan */
  Scenes.sertifikatBaru = function () { return Scenes.sertifikatTerbuka() && [1, 2, 3, 4, 5].filter(function (n) { return Save.selesai(n); }).length > (Save.data.sertifikat || 0); };
})();
