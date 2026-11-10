/* Level 2 Ambil Pesanan (TP2, TP4; tag pesanan dan ungkapan), GDD bagian 9.
   Per pelanggan: sapa dengan kartu, dengar pesanan (tulisan muncul setelah suara), kartu ulangi pesanan (T2+; pengecoh a/an
   dijamin sekali), "some" + kartu "How many ...?" (dijamin sekali), atau pesanan dua bagian dengan kartu "Anything else?"
   (dijamin sekali; di T3 ke atas berbentuk T4: dua jenis, lalu satu jenis lagi),
   isi nampan dari etalase lalu Sajikan, terakhir kartu "Here you are.". Pesanan hanya diterima bila lengkap dan tepat. */
(function () {
  var T = null;
  var HITUNG = ['panekuk', 'burger', 'roti'];
  function satu(a) { return a[Math.floor(Math.random() * a.length)]; }
  function hidup() { return T && Toko.hidup(T); }

  /* frasa salah dari kesalahan nyata untuk kartu ulangi pesanan */
  function frasaSalah(b, jenis) {
    var it = Bahasa.item(b.id), angka = ['', 'a', 'two', 'three'][b.n];
    /* "a tea" lazim di kafe, jadi tanpa wadah hanya salah bila jumlahnya lebih dari satu ("two tea") */
    if (jenis === 'tanpaWadah' && it.satuan && b.n > 1) return angka + ' ' + it.nama;
    if (jenis === 'wadahSalah' && it.satuan) return b.n === 1 ? 'a ' + it.satuanJamak + ' of ' + it.nama : angka + ' ' + it.satuan + ' of ' + it.nama;
    if (jenis === 'tanpaS' && !it.satuan && b.n > 1) return angka + ' ' + it.nama;
    if (jenis === 'aan' && !it.satuan && b.n === 1) return (it.artikel === 'an' ? 'a ' : 'an ') + it.nama;
    return null;
  }
  function kartuUlang(isi) {
    var hasil = [];
    /* a/an didahulukan karena paling jarang punya calon; sisanya jamak dan wadah */
    ['aan', 'tanpaWadah', 'tanpaS', 'wadahSalah'].forEach(function (j) {
      if (hasil.length >= 2) return;
      for (var i = 0; i < isi.length; i++) {
        var f = frasaSalah(isi[i], j);
        if (!f) continue;
        var frasa = isi.map(function (b, k) { return k === i ? f : Bahasa.frasaItem(b.id, b.n); });
        var benarFrasa = Bahasa.frasaItem(isi[i].id, isi[i].n), vokal = Bahasa.item(isi[i].id).artikel === 'an';
        hasil.push({ teks: Bahasa.besar(Bahasa.daftar(frasa)) + '?', mis: j === 'aan' ? 'a-an' : 'jamak',
          umpan: U.fmt(j === 'aan' ? (vokal ? STR.l2.aan : STR.l2.aKonsonan) : (j === 'tanpaS' ? STR.l2.jamakS : STR.l2.jamak), { frasa: benarFrasa }) });
        return;
      }
    });
    if (hasil.length < 2) return null;
    return [{ teks: Bahasa.besar(Bahasa.frasaPesanan(isi)) + '?', benar: true }].concat(hasil);
  }
  /* pesanan yang kartu ulanginya memuat pengecoh a/an */
  function adaAan(isi) { var k = kartuUlang(isi); return !!k && k.some(function (x) { return x.mis === 'a-an'; }); }

  /* ---------- nampan ---------- */
  function gambarNampan() { Toko.nampan(T, kelompok(T.isiNampan), ambilKembali); }
  function kelompok(daftar) {
    var urut = [], hit = {};
    daftar.forEach(function (id) { if (!hit[id]) { hit[id] = 0; urut.push(id); } hit[id]++; });
    return urut.map(function (id) { return { id: id, n: hit[id] }; });
  }
  function ambil(id, el) {
    if (!T.siapNampan) return;
    if (T.isiNampan.length >= 6) { UI.goyang(T.nampanEl); return; }
    T.isiNampan.push(id);
    Aud.sfx('tuk'); UI.lompat(el);
    gambarNampan();
  }
  function ambilKembali(id) {
    if (!T.siapNampan) return;
    var i = T.isiNampan.lastIndexOf(id);
    if (i >= 0) T.isiNampan.splice(i, 1);
    Aud.sfx('pop');
    gambarNampan();
  }
  function nilaiNampan(isi) {
    var hit = {}, pesan = {};
    T.isiNampan.forEach(function (id) { hit[id] = (hit[id] || 0) + 1; });
    isi.forEach(function (b) { pesan[b.id] = b.n; });
    return {
      lebih: Object.keys(hit).filter(function (id) { return !pesan[id]; }),
      kebanyakan: isi.filter(function (b) { return (hit[b.id] || 0) > b.n; }),
      kurang: isi.filter(function (b) { return (hit[b.id] || 0) < b.n; })
    };
  }

  function layani(T0, info) {
    var t = info.tingkat, mode = 'biasa', tepat = true, p, kalimat, salahNampan = 0;
    /* T3 ke atas: pesanan dua bagian (kartu Anything else?) dan "some" (kartu How many?) dijamin muncul sekali per level,
       sesudah itu acak. Dengan 6 pelanggan, murid yang lancar sampai T3 di pelanggan ke-4. */
    if (t >= 3) {
      if (!T.sudahDua) mode = 'dua';
      else if (!T.sudahSome) mode = 'some';
      else { var r = Math.random(); mode = r < 0.35 ? 'some' : (r < 0.7 ? 'dua' : 'biasa'); }
    }
    /* dijamin juga bagi murid yang belum sampai T3: Anything else? paling lambat pelanggan ke-4, How many? paling lambat ke-5 */
    if (!T.sudahDua && !info.ulang && info.nomor >= 3) mode = 'dua';
    else if (!T.sudahSome && !info.ulang && info.nomor >= 4) mode = 'some';
    /* kartu ulangi pesanan dengan pengecoh a/an ("an pancake", "a egg sandwich") dijamin sekali, mulai pelanggan ke-2 di T2 ke atas */
    var paksaAan = mode === 'biasa' && !T.sudahAan && t >= 2 && !info.ulang && info.nomor >= 1;
    if (mode === 'some') { var id = satu(HITUNG); p = { isi: [{ id: id, n: 2 + Math.floor(Math.random() * 2) }] }; }
    else if (mode === 'dua') p = Kasir.pesanan(2, t >= 3 ? 4 : Math.max(2, t), window.HARGA, Math.random, T.lalu);
    else p = Kasir.pesanan(2, t, window.HARGA, Math.random, T.lalu);
    for (var c = 0; mode === 'dua' && p.isi.length < 2 && c < 30; c++) p = Kasir.pesanan(2, Math.max(2, t), window.HARGA, Math.random, T.lalu);
    for (var c2 = 0; paksaAan && !adaAan(p.isi) && c2 < 80; c2++) p = Kasir.pesanan(2, Math.max(2, t), window.HARGA, Math.random, T.lalu);
    if (paksaAan && !adaAan(p.isi)) paksaAan = false;
    if (mode === 'dua' && p.isi.length < 2) mode = 'biasa';
    if (mode === 'dua') T.sudahDua = true;
    if (mode === 'some') T.sudahSome = true;
    T.lalu = p.isi;
    T.pesanan = p; T.mode = mode; T.isiNampan = []; T.siapNampan = false; T.langkah = 'masuk';
    var bagianA = mode === 'dua' ? p.isi.slice(0, -1) : p.isi, bagianB = mode === 'dua' ? p.isi.slice(-1) : [];
    kalimat = Bahasa.kalimatPesanan(bagianA, T.templat++);
    function catatKartu(salah) { if (salah) tepat = false; Save.catat('ungkapan', !salah); if (T.pel) T.pel.eks('senang'); T.H.potret('senang'); }
    T.periksa = periksa;   /* fungsi periksa diangkat (hoisted), dipakai tombol Sajikan */
    return Toko.masuk(T, info.nama).then(function () {
      return Toko.bicara(T, satu(UNGKAPAN.pelanggan.salam));
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'sapa';
      T.H.instruksi(STR.l2.sapa, false);
      return Toko.kartu(T, [
        { teks: UNGKAPAN.kasir.sapa, benar: true },
        { teks: UNGKAPAN.kasir.kembali, mis: 'ungkapan-situasi', umpan: STR.l2.salahSapaKembali },
        { teks: UNGKAPAN.kasir.pamit, mis: 'ungkapan-situasi', umpan: STR.l2.salahSapaPamit }
      ], 'kanan');
    }).then(function (salah) {
      if (!hidup()) return;
      catatKartu(salah);
      T.langkah = 'dengar';
      T.H.instruksi(STR.l2.dengar, false);
      if (mode === 'some') return Toko.bicara(T, UNGKAPAN.pelanggan.some.replace('{jamak}', Bahasa.item(p.isi[0].id).jamak), { tampil: false }).then(function () {
        if (!hidup()) return;
        T.langkah = 'jumlah';
        T.H.instruksi(STR.l2.tanyaJumlah, false);
        return Toko.kartu(T, [
          { teks: UNGKAPAN.kasir.berapaBanyak.replace('{jamak}', Bahasa.item(p.isi[0].id).jamak), benar: true },
          { teks: UNGKAPAN.kasir.tanyaHarga, mis: 'how-much-many', umpan: STR.l2.howMany },
          { teks: UNGKAPAN.kasir.saji, mis: 'ungkapan-situasi', umpan: STR.l2.salahBelumSaji }
        ], 'kanan').then(function (salah) {
          if (!hidup()) return;
          catatKartu(salah);
          return Toko.bicara(T, UNGKAPAN.pelanggan.jumlah[p.isi[0].n]);
        });
      });
      return Toko.bicara(T, kalimat, { tampil: false });
    }).then(function () {
      if (!hidup() || mode !== 'dua') return;
      T.langkah = 'lagi';
      T.H.instruksi(STR.l2.lagi, false);
      return Toko.kartu(T, [
        { teks: UNGKAPAN.kasir.lagi, benar: true },
        { teks: UNGKAPAN.kasir.tanyaHarga, mis: 'ungkapan-situasi', umpan: STR.l2.salahBelumHarga },
        { teks: UNGKAPAN.kasir.kembali, mis: 'ungkapan-situasi', umpan: STR.l2.salahSapaKembali }
      ], 'kanan').then(function (salah) {
        if (!hidup()) return;
        catatKartu(salah);
        kalimat = UNGKAPAN.pelanggan.tambah.replace('{pesanan}', Bahasa.frasaPesanan(bagianB));
        return Toko.bicara(T, kalimat, { tampil: false });
      });
    }).then(function () {
      /* kartu ulangi pesanan: T2 ke atas, sekitar separuh pelanggan */
      var k = mode === 'biasa' && t >= 2 && (paksaAan || Math.random() < 0.5) ? kartuUlang(p.isi) : null;
      if (k && k.some(function (x) { return x.mis === 'a-an'; })) T.sudahAan = true;
      if (!hidup() || !k) return;
      T.langkah = 'ulang';
      T.H.instruksi(STR.l2.ulang, false);
      /* murid mengulang dari ingatan: tulisan pesanan disembunyikan lagi (Dengar lagi tetap bisa; tampil lagi sesudah salah ke-2) */
      T.B.dengarkan();
      if (T.terakhir) T.terakhir.sembunyi = true;
      return Toko.kartu(T, k, 'kanan').then(function (salah) {
        if (!hidup()) return;
        /* kartu ulangi pesanan menguji jumlah, wadah, dan a/an: bukti TP2 (pesanan), bukan ungkapan */
        if (salah) tepat = false;
        Save.catat('pesanan', !salah);
        if (T.pel) T.pel.eks('senang');
        return Toko.bicara(T, UNGKAPAN.pelanggan.ya);
      });
    }).then(function () {
      if (!hidup()) return;
      /* isi nampan */
      T.langkah = 'nampan';
      T.siapNampan = true;
      gambarNampan();
      T.saji.style.display = '';
      T.H.instruksi(STR.l2.nampan);
      if (info.nomor === 0) UI.tunjuk(T.itemEl[p.isi[0].id], { fy: 0.3 });
      return new Promise(function (selesai) { T.sajikan = selesai; });
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'saji';
      return Toko.kartu(T, [
        { teks: UNGKAPAN.kasir.saji, benar: true },
        { teks: UNGKAPAN.kasir.kembali, mis: 'ungkapan-situasi', umpan: STR.l2.salahSajiKembali },
        { teks: UNGKAPAN.kasir.tanyaHarga, mis: 'ungkapan-situasi', umpan: STR.l2.salahSajiHarga }
      ], 'kanan');
    }).then(function (salah) {
      if (!hidup()) return { tepat: false };
      catatKartu(salah);
      if (T.pel) T.pel.eks('sorak');
      var tot = Kasir.total(p.isi, window.HARGA);
      Toko.tambahKas(T, tot);
      if (T.nampanEl) T.nampanEl.remove();
      return Toko.bicara(T, UNGKAPAN.pelanggan.terima).then(function () { return { tepat: tepat && salahNampan === 0 }; });
    });

    /* dipanggil tombol Sajikan */
    function periksa() {
      if (!T.siapNampan) return;
      Voice.stop(); UI.sembunyiTangan(true);
      var n = nilaiNampan(p.isi);
      if (!n.lebih.length && !n.kebanyakan.length && !n.kurang.length) {
        T.siapNampan = false; T.saji.style.display = 'none';
        Save.catat('pesanan', salahNampan === 0);
        Toko.puji(T);
        var q = UI.titik(T.nampanEl, 0.4); if (q) UI.ledak(q.x, q.y);
        T.H.instruksi(STR.l2.saji, false);
        Tween.wait(500).then(function () { if (hidup() && T.sajikan) T.sajikan(); });
        return;
      }
      salahNampan++; tepat = false;
      Save.catatSalah('pesanan');
      Aud.sfx('bad'); UI.goyang(T.nampanEl);
      if (T.pel) T.pel.eks('berpikir');
      if (n.lebih.length) {
        Save.catatMis('item-lebih');
        T.H.instruksi(STR.l2.lebih, false);
        Toko.bicara(T, UNGKAPAN.pelanggan.tidakPesan.replace('{item}', Bahasa.namaArtikel(n.lebih[0])));
        Array.prototype.forEach.call(T.nampanEl.querySelectorAll('[data-item="' + n.lebih[0] + '"]'), function (el) { UI.goyang(el); });
        return;
      }
      if (n.kebanyakan.length) {
        Save.catatMis('jumlah');
        T.H.instruksi(U.fmt(STR.l2.kebanyakan, { frasa: Bahasa.frasaItem(n.kebanyakan[0].id, n.kebanyakan[0].n) }), false);
        return;
      }
      var hilang = n.kurang[0], lv = Math.min(3, salahNampan);
      Save.catatMis(T.isiNampan.indexOf(hilang.id) >= 0 ? 'jumlah' : 'item-terlewat');
      var ulangKalimat = mode === 'some' ? Bahasa.kalimatPesanan(p.isi, 0) : kalimat;
      if (lv === 1) { T.H.instruksi(STR.l2.kurang1, false); Toko.bicara(T, ulangKalimat); }
      else if (lv === 2) { T.H.instruksi(STR.l2.kurang2, false); Toko.bicara(T, ulangKalimat, { sorot: Bahasa.frasaItem(hilang.id, hilang.n) }); }
      else {
        if (lv === 3 && salahNampan === 3) T.petunjuk3++;
        T.H.instruksi(STR.l2.kurang3, false);
        UI.tunjuk(T.itemEl[hilang.id], { fy: 0.3 });
      }
    }
  }

  Scenes.add('level2', {
    enter: function (root) {
      T = Toko.bangun(root, { level: 2, bawah: 'etalase', tingkat: { min: 1, maks: 4, awal: 2 } });
      T.templat = 0; T.itemEl = {}; T.sudahDua = false; T.sudahSome = false; T.sudahAan = false;
      var xs = MENU.daftar.map(function (it, i) { return 30 + i * 102; });
      MENU.daftar.forEach(function (it, i) { T.itemEl[it.id] = Kafe.item(T.lapisKerja, it.id, xs[i], ambil, { label: true, kecil: true, y: 566 }); });
      T.saji = Input.button(STR.tombol.sajikan, 'utama', function () { if (T.periksa) T.periksa(); }, { x: 1020, y: 462, w: 240, h: 88, font: 32, id: 'sajikan' });
      T.saji.style.display = 'none';
      T.lapisKerja.appendChild(T.saji);
      UI.idle.atur(function () {
        if (T.kartuAktif) return T.lapisKerja.querySelector('.kartu-kalimat');
        if (T.siapNampan) return T.isiNampan.length ? T.saji : document.querySelector('[data-id="dengar-lagi"]');
        return null;
      });
      Aud.musik('kafe');
      T.H.instruksi(STR.l2.mulai);
      Toko.jalankan(T, layani);
    },
    exit: function () { if (T) T.hidup = false; },
    uji: {
      keadaan: function () {
        return { langkah: T.langkah || '', nomor: T.nomor, siap: !!(T.kartuAktif || T.siapNampan) && !Voice.sibuk(), tingkat: T.adaptif.t, petunjuk3: T.petunjuk3 };
      },
      benar: function () {
        if (T.kartuAktif) { var i = T.kartuAktif.findIndex(function (k) { return k.benar; }); return ['kartu-' + i]; }
        if (T.siapNampan) {
          var ids = [], n = nilaiNampan(T.pesanan.isi);
          n.lebih.forEach(function (id) { ids.push(T.nampanEl.querySelector('[data-item="' + id + '"]').dataset.id); });
          if (ids.length) return [ids[0]];
          T.pesanan.isi.forEach(function (b) { var ada = T.isiNampan.filter(function (x) { return x === b.id; }).length; for (var k = ada; k < b.n; k++) ids.push('item-' + b.id); });
          return ids.concat(['sajikan']);
        }
        return [];
      },
      salah: function () {
        if (T.kartuAktif) { var i = T.kartuAktif.findIndex(function (k) { return !k.benar; }); return ['kartu-' + i]; }
        if (T.siapNampan) { var lain = MENU.daftar.filter(function (it) { return !T.pesanan.isi.some(function (b) { return b.id === it.id; }); })[0].id; return ['item-' + lain, 'sajikan']; }
        return [];
      }
    }
  });
})();
