/* Level 4 Kembalian (TP6, TP4; tag kembalian dan ungkapan), GDD bagian 9.
   Pesanan sudah tersaji, struk menampilkan total, pelanggan membayar. Murid mengetuk uang di laci untuk memindahkannya ke nampan
   kembalian (ketuk uang di nampan untuk mengembalikan); garis bilangan menghitung naik dari total ke uang bayar.
   Beri Kembalian hanya diterima bila jumlahnya tepat; semua kombinasi pecahan yang tepat diterima.
   Sekali per level pelanggan membayar uang pas: kartu yang benar "Thank you. Have a nice day!", tanpa kembalian. */
(function () {
  var T = null;
  var DI_LACI = [500, 1000, 2000, 5000, 10000, 20000, 50000];
  function hidup() { return T && Toko.hidup(T); }
  function gambarUang(v, kecil) {
    if (v <= 1000) return Seni.svg(kecil ? 58 : 84, kecil ? 58 : 84, Seni.g('translate(42 42)', Seni.koin(v)), { vb: '0 0 84 84' });
    return Seni.svg(kecil ? 104 : 168, kecil ? 50 : 80, Seni.uangKertas(v, 168, 80), { vb: '-3 -3 174 88' });
  }
  function letakLaci(v) {
    var i = DI_LACI.indexOf(v);
    if (i < 2) return { x: 20 + (i === 0 ? 66 : 182) - 42, y: 606 + 52 - 42 };
    return { x: 20 + 252 + (i - 2) * 196 + 11, y: 606 + 12 };
  }

  /* ---------- laci, nampan kembalian, garis bilangan ---------- */
  function pasangLaci() {
    DI_LACI.forEach(function (v) {
      var p = letakLaci(v), b = U.h('button', 'uang-laci' + (v <= 1000 ? ' koin' : ''), gambarUang(v));
      b.type = 'button'; b.dataset.id = 'laci-' + v;
      b.setAttribute('aria-label', Seni.rp(v));
      b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
      b.addEventListener('pointerdown', function () { Aud.init(); });
      b.addEventListener('click', function () { tambah(v, b); });
      T.lapisKerja.appendChild(b);
      T.laciEl[v] = b;
    });
  }
  /* uang di laci disembunyikan saat kartu penutup menutupi rak bawah (tidak mengintip dan tidak masuk urutan Tab) */
  function laciTampil(b) { T.laciLapis.style.visibility = b ? '' : 'hidden'; DI_LACI.forEach(function (v) { T.laciEl[v].style.visibility = b ? '' : 'hidden'; }); }
  function tambah(v, el) {
    if (!T.siapLaci) return;
    if (T.isi.length >= 10) { UI.goyang(T.nampanKembali); return; }
    T.isi.push(v);
    Aud.sfx(v <= 1000 ? 'koin' : 'kertas'); UI.lompat(el);
    gambarKembalian();
  }
  function ambilKembali(i) {
    if (!T.siapLaci) return;
    T.isi.splice(i, 1);
    Aud.sfx('pop');
    gambarKembalian();
  }
  function gambarKembalian() {
    var el = T.nampanKembali;
    el.querySelectorAll('.uang-nampan').forEach(function (x) { x.remove(); });
    var urut = T.isi.map(function (v, i) { return { v: v, i: i }; }).sort(function (a, b) { return b.v - a.v; });
    var langkah = Math.min(112, 380 / Math.max(1, urut.length));
    urut.forEach(function (q, k) {
      var b = U.h('button', 'uang-nampan', gambarUang(q.v, true));
      b.type = 'button'; b.dataset.id = 'kembali-' + q.v + '-' + k; b.dataset.nilai = q.v;
      b.setAttribute('aria-label', Seni.rp(q.v));
      b.style.left = (22 + k * langkah) + 'px'; b.style.top = (q.v <= 1000 ? 64 : 58) + 'px';
      b.addEventListener('click', function () { ambilKembali(q.i); });
      el.appendChild(b);
    });
    var s = Kasir.jumlah(T.isi);
    T.chip.textContent = U.fmt(STR.l4.diNampan, { rp: Seni.rp(s) });
    T.chip.style.visibility = T.tingkat >= 3 ? 'hidden' : 'visible';
    gambarGaris();
  }
  function gambarGaris(sorot) {
    var titik = Kasir.lompatan(T.total, T.bayar), pos = T.total + Kasir.jumlah(T.isi), selesai = 0;
    for (var i = 1; i < titik.length; i++) if (pos >= titik[i]) selesai = i;
    T.garisEl.innerHTML = Seni.svg(698, 152, Seni.garisBilangan({ w: 698, h: 152, titik: titik, selesai: selesai, posisi: pos, sorot: sorot,
      mode: T.tingkat === 1 ? 'penuh' : (T.tingkat === 2 ? 'patokan' : 'ujung'), judul: STR.l4.hitungNaik }));
  }

  function layani(T0, info) {
    var t = info.tingkat, p = Kasir.pesanan(4, t, window.HARGA, Math.random, T.lalu), tepat = true, salahUang = 0;
    var pas = !info.ulang && info.nomor === T.nomorPas;
    T.lalu = p.isi; T.pesanan = p; T.tingkat = t; T.total = p.total;
    T.uangPelanggan = Kasir.uangBayar(p.total, t, Math.random, pas, 50000);
    T.bayar = Kasir.jumlah(T.uangPelanggan); T.kembalian = T.bayar - T.total; T.pas = pas; T.isi = [];
    T.langkah = 'masuk';
    T.periksa = periksa;   /* fungsi periksa diangkat (hoisted), dipakai tombol Beri Kembalian */
    return Toko.masuk(T, info.nama).then(function () {
      if (!hidup()) return;
      Toko.nampan(T, p.isi);
      Toko.struk(T, p.isi, { harga: true, total: p.total });
      /* uang pelanggan di konter */
      T.uangEl.innerHTML = T.uangPelanggan.map(function (v, i) { return '<span class="uang-meja" style="left:' + (i * 34) + 'px;top:' + (i * 10) + 'px">' + gambarUang(v, false) + '</span>'; }).join('');
      T.uangEl.style.display = '';
      Aud.sfx('kertas');
      return Toko.bicara(T, UNGKAPAN.pelanggan.bayar);
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'kembalian';
      laciTampil(true);
      T.garisEl.style.display = ''; T.nampanKembali.style.display = ''; T.beri.style.display = '';
      gambarKembalian();
      T.siapLaci = true;
      T.H.instruksi(pas ? STR.l4.mulaiPas : U.fmt(STR.l4.mulai, { rp: Seni.rp(T.bayar), total: Seni.rp(T.total) }), false);
      if (info.nomor === 0 && T.kembalian > 0) UI.tunjuk(T.laciEl[Kasir.pecahanMinimal(T.kembalian, 50000)[0]], { fy: 0.4 });
      return new Promise(function (selesai) { T.lanjut = selesai; });
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'kartu';
      laciTampil(false);
      T.H.instruksi(STR.l4.kartu, false);
      return Toko.kartu(T, pas ? [
        { teks: UNGKAPAN.kasir.pamit, benar: true },
        { teks: UNGKAPAN.kasir.kembali, mis: 'uang-pas', umpan: STR.l4.pasKartu },
        { teks: UNGKAPAN.kasir.tanyaHarga, mis: 'ungkapan-situasi', umpan: STR.l4.kartuHarga }
      ] : [
        { teks: UNGKAPAN.kasir.kembali, benar: true },
        { teks: UNGKAPAN.kasir.tanyaHarga, mis: 'ungkapan-situasi', umpan: STR.l4.kartuHarga },
        { teks: UNGKAPAN.kasir.lagi, mis: 'ungkapan-situasi', umpan: STR.l4.kartuLagi }
      ], 'bawah');
    }).then(function (salah) {
      if (!hidup()) return { tepat: false };
      if (salah) tepat = false;
      Save.catat('ungkapan', !salah);
      if (T.pel) T.pel.eks('sorak');
      Toko.tambahKas(T, p.total);
      return Toko.bicara(T, UNGKAPAN.pelanggan.terima).then(function () {
        [T.nampanEl, T.strukEl].forEach(function (e) { if (e) e.remove(); });
        T.uangEl.style.display = 'none'; T.garisEl.style.display = 'none'; T.nampanKembali.style.display = 'none';
        T.isi = [];
        return { tepat: tepat && salahUang === 0 };
      });
    });

    /* dipanggil tombol Beri Kembalian */
    function periksa() {
      if (!T.siapLaci) return;
      Voice.stop(); UI.sembunyiTangan(true);
      var hasil = Kasir.cekKembalian(T.isi, T.kembalian);
      if (hasil === 'tepat') {
        T.siapLaci = false; T.beri.style.display = 'none';
        Save.catat('kembalian', salahUang === 0);
        Toko.puji(T);
        T.chip.style.visibility = 'visible';
        var q = UI.titik(T.nampanKembali, 0.5); if (q) UI.ledak(q.x, q.y);
        Tween.wait(500).then(function () { if (hidup() && T.lanjut) T.lanjut(); });
        return;
      }
      salahUang++; tepat = false;
      Save.catatSalah('kembalian');
      Aud.sfx('bad'); UI.goyang(T.nampanKembali);
      if (T.pel) T.pel.eks('berpikir');
      var sisa = T.kembalian - Kasir.jumlah(T.isi), lv = Math.min(3, salahUang);
      if (hasil === 'kurang') {
        Save.catatMis('kembalian-kurang');
        var titik = Kasir.lompatan(T.total, T.bayar), pos = T.total + Kasir.jumlah(T.isi), berikut = titik.length - 1;
        for (var i = 1; i < titik.length; i++) if (pos < titik[i]) { berikut = i; break; }
        T.H.instruksi(T.tingkat >= 3 && lv === 1 ? U.fmt(STR.l4.kurangBelum, { rp: Seni.rp(T.bayar) }) : U.fmt(STR.l4.kurang, { rp: Seni.rp(sisa) }), false);
        if (lv >= 2) gambarGaris(berikut);
        if (lv >= 3) { if (salahUang === 3) T.petunjuk3++; UI.tunjuk(T.laciEl[Kasir.pecahanMinimal(sisa, 50000)[0]], { fy: 0.4 }); }
      } else {
        Save.catatMis(T.pas ? 'uang-pas' : 'kembalian-lebih');
        T.H.instruksi(T.pas ? STR.l4.pasLebih : STR.l4.lebih, false);
        if (lv >= 3) { if (salahUang === 3) T.petunjuk3++; var u = T.nampanKembali.querySelector('.uang-nampan'); if (u) UI.tunjuk(u, { fy: 0.4 }); }
      }
    }
  }

  Scenes.add('level4', {
    enter: function (root) {
      T = Toko.bangun(root, { level: 4, bawah: 'laci', tingkat: { min: 1, maks: 3, awal: 2 } });
      T.laciEl = {}; T.isi = []; T.nomorPas = 2 + Math.floor(Math.random() * 2);
      var laci = U.h('div', 'lapis');
      laci.innerHTML = Seni.svg(1280, 720, Seni.g('translate(20 606)', Seni.laci({ kosong: true })));
      laci.style.pointerEvents = 'none';
      root.insertBefore(laci, T.lapisKerja);
      T.laciLapis = laci;
      pasangLaci();
      T.garisEl = U.h('div', 'garis-bilangan'); T.garisEl.style.display = 'none';
      T.lapisKerja.appendChild(T.garisEl);
      T.uangEl = U.h('div', 'uang-pelanggan'); T.uangEl.style.display = 'none';
      T.lapisKerja.appendChild(T.uangEl);
      T.nampanKembali = U.h('div', 'nampan-kembalian', Seni.svg(440, 150, Seni.nampan(440, 150, Seni.W.krem, Seni.W.pandan)));
      T.nampanKembali.style.display = 'none';
      T.chip = U.h('div', 'chip-kembalian chip-nampan'); T.chip.setAttribute('data-cek', 'chip nampan');
      T.nampanKembali.appendChild(T.chip);
      T.lapisKerja.appendChild(T.nampanKembali);
      T.beri = Input.button(UI.esc(STR.tombol.beri), 'utama', function () { if (T.periksa) T.periksa(); }, { x: 1020, y: 470, w: 240, h: 96, font: 27, id: 'beri' });
      T.beri.style.display = 'none';
      T.lapisKerja.appendChild(T.beri);
      Aud.musik('kafe');
      UI.idle.atur(function () {
        if (T.kartuAktif) return T.lapisKerja.querySelector('.kartu-kalimat');
        if (T.siapLaci) return T.isi.length ? T.beri : T.garisEl;
        return null;
      });
      T.H.instruksi(STR.l4.awal);
      Toko.jalankan(T, layani);
    },
    exit: function () { if (T) T.hidup = false; },
    uji: {
      keadaan: function () { return { langkah: T.langkah || '', nomor: T.nomor, siap: !!(T.kartuAktif || T.siapLaci) && !Voice.sibuk(), tingkat: T.adaptif.t, petunjuk3: T.petunjuk3, pas: !!T.pas }; },
      benar: function () {
        if (T.kartuAktif) return ['kartu-' + T.kartuAktif.findIndex(function (k) { return k.benar; })];
        if (T.siapLaci) {
          var s = Kasir.jumlah(T.isi);
          if (s > T.kembalian) return [T.nampanKembali.querySelector('.uang-nampan').dataset.id];
          return Kasir.pecahanMinimal(T.kembalian - s, 50000).map(function (v) { return 'laci-' + v; }).concat(['beri']);
        }
        return [];
      },
      salah: function () {
        if (T.kartuAktif) return ['kartu-' + T.kartuAktif.findIndex(function (k) { return !k.benar; })];
        if (T.siapLaci) return T.kembalian > 0 ? ['beri'] : ['laci-500', 'beri'];
        return [];
      }
    }
  });
})();
