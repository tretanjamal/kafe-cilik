/* Level 5 Jam Sibuk (lingkup TAMBAHAN; tag pesanan, total, kembalian, ungkapan), GDD bagian 9.
   Antrean 8 pelanggan; dua pelanggan berikutnya menunggu kecil di kiri (menggantikan papan menu; harga ada di struk).
   Per pelanggan alur lengkap: kartu sapa, dengar pesanan, isi nampan dari etalase lalu Sajikan, pilih total dari struk,
   terima uang (sampai Rp100.000) dan beri kembalian dari laci, lalu kartu penutup. Rak bawah berganti: etalase, pilihan, laci.
   Cangkir kesabaran mendingin hanya saat giliran murid dan hanya menentukan bintang ke-3; pelanggan tidak pernah pergi.
   Mode Santai tanpa cangkir kesabaran. */
(function () {
  var T = null;
  var DI_LACI = [500, 1000, 2000, 5000, 10000, 20000, 50000];
  function satu(a) { return a[Math.floor(Math.random() * a.length)]; }
  function hidup() { return T && Toko.hidup(T); }
  function santai() { return Save.data.settings.santai; }

  /* ---------- gambar kecil ---------- */
  function gambarUang(v, kecil) {
    if (v <= 1000) return Seni.svg(kecil ? 58 : 84, kecil ? 58 : 84, Seni.g('translate(42 42)', Seni.koin(v)), { vb: '0 0 84 84' });
    return Seni.svg(kecil ? 104 : 168, kecil ? 50 : 80, Seni.uangKertas(v, 168, 80), { vb: '-3 -3 174 88' });
  }
  /* cangkir kesabaran: cincin sisa waktu + cangkir teh; uap berkurang dan teh memudar saat mendingin */
  function gambarCangkir(f) {
    var W = Seni.W, keliling = 188.5, warna = f > 0.5 ? W.pandan : (f > 0.2 ? W.mangga : W.jambu);
    var teh = Seni.campur('#B45F2E', W.krem, 0.55 * (1 - f)), uap = f > 0.66 ? 3 : (f > 0.33 ? 2 : (f > 0 ? 1 : 0)), s = '';
    s += '<circle cx="38" cy="38" r="34" fill="' + W.krem + '" stroke="' + W.tinta + '" stroke-width="4"/>';
    s += '<circle cx="38" cy="38" r="27" fill="none" stroke="' + Seni.campur(W.krem, W.tinta, 0.15) + '" stroke-width="7"/>';
    if (f > 0) s += '<circle cx="38" cy="38" r="27" fill="none" stroke="' + warna + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (keliling * f * 0.9).toFixed(1) + ' 300" transform="rotate(-90 38 38)"/>';
    for (var i = 0; i < uap; i++) s += '<path class="uap" style="animation-delay:' + (i * 0.5) + 's" d="M' + (30 + i * 8) + ' 30q-4 -5 0 -10" fill="none" stroke="' + W.tinta + '" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>';
    s += Seni.bentuk('M24 36H52L49 52Q38 57 27 52Z', W.putih || '#FFFFFF', { lebar: 3 });
    s += '<path d="M26 38H50L49 43H27Z" fill="' + teh + '"/>';
    s += Seni.garis('M51 40Q58 40 57 46Q56 51 49 50', W.tinta, 3);
    return Seni.svg(76, 76, s, { vb: '0 0 76 76' });
  }

  /* ---------- rak bawah: etalase, pilihan, atau laci ---------- */
  /* mode: 'etalase', 'pilihan', 'laci', atau 'kartu' (kartu penutup menutupi rak; laci disembunyikan) */
  function rak(mode) {
    T.rak = mode;
    Toko.aturKonter(T, mode === 'etalase' ? 'etalase' : 'laci');
    Object.keys(T.itemEl).forEach(function (id) { T.itemEl[id].style.display = mode === 'etalase' ? '' : 'none'; });
    T.laciLapis.style.display = mode === 'laci' ? '' : 'none';
    DI_LACI.forEach(function (v) { T.laciEl[v].style.display = mode === 'laci' ? '' : 'none'; });
  }
  /* balon tinggi untuk kalimat pesanan, pendek saat garis bilangan tampil di bawahnya */
  function balonPendek(pendek) { T.B.el.classList.toggle('balon-lebar', !pendek); T.B.el.style.height = (pendek ? 156 : 300) + 'px'; }

  /* ---------- antrean ---------- */
  function gambarAntrean() {
    T.svgAntrean.innerHTML = '';
    var tunggu = Math.min(2, Math.max(0, T.jumlahPel - T.nomor) + T.ulang.length);
    [{ x: 40, y: 262, s: 0.52 }, { x: 150, y: 240, s: 0.6 }].slice(2 - tunggu).forEach(function (q, i, arr) {
      var k = arr.length - 1 - i;   // yang terdekat ke konter digambar terakhir
      Kafe.tokoh(T.svgAntrean, T.urut[(T.nomor + k) % T.urut.length], q.x, q.y, q.s);
    });
  }
  function masuk(nama) {
    if (T.pel) { T.pel.g.remove(); T.pel = null; }
    T.namaPel = nama;
    balonPendek(false);
    T.pel = Kafe.tokoh(T.svgPel, nama, 150, 104, 1);
    T.B.el.querySelector('.nama-pelanggan').textContent = Seni.TOKOH[nama].nama;
    T.B.sembunyi();
    gambarAntrean();
    Aud.sfx('muncul');
    return Tween.run(UI.kurangi ? 1 : 600, function (e) { T.pel.geser(150 + 156 * e, 104); }, Ease.easeInOutCubic).then(function () { return T.B.muncul(); });
  }

  /* ---------- kesabaran ---------- */
  function sabarMulai(barang) {
    if (santai()) { T.sabar = null; T.sabarEl.style.display = 'none'; return; }
    T.sabar = { maks: 30 + 5 * barang, sisa: 30 + 5 * barang, habis: false };
    T.sabarEl.style.display = '';
    gambarSabar();
  }
  function gambarSabar() {
    var f = T.sabar ? Math.max(0, T.sabar.sisa / T.sabar.maks) : 1, tahap = Math.ceil(f * 12), kunci = tahap + (T.sabarHabis ? 'h' : '');
    if (kunci === T.sabarTahap) return;
    T.sabarTahap = kunci;
    /* bintang bonus di cangkir: emas selama teh belum pernah dingin di level ini, abu-abu sesudahnya */
    T.sabarEl.innerHTML = gambarCangkir(tahap / 12) + '<span class="bintang-bonus">' + UI.ikon('bintang', 34, !T.sabarHabis) + '</span>';
  }
  function giliranMurid() { return !!(T.kartuAktif || T.siapNampan || T.pilihan || T.siapLaci); }
  function detak(dt) {
    if (!T || !T.sabar || T.sabar.habis || !hidup()) return;
    if (Tween.paused || Scenes.busy || Voice.sibuk() || !giliranMurid() || document.querySelector('.overlay')) return;
    T.sabar.sisa -= dt;
    if (T.sabar.sisa <= 0) {
      T.sabar.sisa = 0; T.sabar.habis = true; T.sabarHabis = true;
      if (T.pel) T.pel.eks('berpikir');
      Aud.sfx('bad');
      UI.goyang(T.sabarEl);
      UI.toast(STR.l5.sabarHabis);
    }
    gambarSabar();
  }

  /* ---------- nampan (seperti L2) ---------- */
  function kelompok(daftar) {
    var urut = [], hit = {};
    daftar.forEach(function (id) { if (!hit[id]) { hit[id] = 0; urut.push(id); } hit[id]++; });
    return urut.map(function (id) { return { id: id, n: hit[id] }; });
  }
  function gambarNampan() { Toko.nampan(T, kelompok(T.isiNampan), ambilKembali); }
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

  /* ---------- laci dan kembalian (seperti L4) ---------- */
  function letakLaci(v) {
    var i = DI_LACI.indexOf(v);
    if (i < 2) return { x: 20 + (i === 0 ? 66 : 182) - 42, y: 606 + 52 - 42 };
    return { x: 20 + 252 + (i - 2) * 196 + 11, y: 606 + 12 };
  }
  function pasangLaci() {
    DI_LACI.forEach(function (v) {
      var p = letakLaci(v), b = U.h('button', 'uang-laci' + (v <= 1000 ? ' koin' : ''), gambarUang(v));
      b.type = 'button'; b.dataset.id = 'laci-' + v;
      b.setAttribute('aria-label', Seni.rp(v));
      b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
      b.addEventListener('pointerdown', function () { Aud.init(); });
      b.addEventListener('click', function () { tambahUang(v, b); });
      T.lapisKerja.appendChild(b);
      T.laciEl[v] = b;
    });
  }
  function tambahUang(v, el) {
    if (!T.siapLaci) return;
    if (T.isi.length >= 10) { UI.goyang(T.nampanKembali); return; }
    T.isi.push(v);
    Aud.sfx(v <= 1000 ? 'koin' : 'kertas'); UI.lompat(el);
    gambarKembalian();
  }
  function ambilUang(i) {
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
      b.type = 'button'; b.dataset.id = 'kembali-' + q.v + '-' + k;
      b.setAttribute('aria-label', Seni.rp(q.v));
      b.style.left = (22 + k * langkah) + 'px'; b.style.top = (q.v <= 1000 ? 64 : 58) + 'px';
      b.addEventListener('click', function () { ambilUang(q.i); });
      el.appendChild(b);
    });
    T.chip.textContent = U.fmt(STR.l4.diNampan, { rp: Seni.rp(Kasir.jumlah(T.isi)) });
    T.chip.style.visibility = T.tingkat >= 3 ? 'hidden' : 'visible';
    gambarGaris();
  }
  function gambarGaris(sorot) {
    var titik = Kasir.lompatan(T.total, T.bayar), pos = T.total + Kasir.jumlah(T.isi), selesai = 0;
    for (var i = 1; i < titik.length; i++) if (pos >= titik[i]) selesai = i;
    T.garisEl.innerHTML = Seni.svg(698, 152, Seni.garisBilangan({ w: 698, h: 152, titik: titik, selesai: selesai, posisi: pos, sorot: sorot,
      mode: T.tingkat === 1 ? 'penuh' : (T.tingkat === 2 ? 'patokan' : 'ujung'), judul: STR.l4.hitungNaik }));
  }

  /* ---------- pilihan total dari struk ---------- */
  function hapusPilihan() { if (T.pilihanEl) { T.pilihanEl.remove(); T.pilihanEl = null; } T.pilihan = null; }
  function pilihTotal(p, onSalah) {
    hapusPilihan();
    var wadah = U.h('div', 'deret-pilihan'), salah = 0;
    var daftar = U.shuffle(Math.random, [{ nilai: p.total, benar: true }].concat(Kasir.pengecohTotal(p.isi, window.HARGA)));
    T.lapisKerja.appendChild(wadah);
    T.pilihanEl = wadah; T.pilihan = daftar;
    return new Promise(function (selesai) {
      daftar.forEach(function (q, i) {
        var b = Input.button(Seni.rp(q.nilai), 'ketiga', function () {
          if (!hidup() || b.disabled) return;
          Voice.stop(); UI.sembunyiTangan(true);
          if (q.benar) {
            Array.prototype.forEach.call(wadah.children, function (k) { k.disabled = true; });
            var t = UI.titik(b, 0.5); if (t) UI.ledak(t.x, t.y);
            Tween.wait(350).then(function () { hapusPilihan(); selesai(salah); });
            return;
          }
          salah++; Aud.sfx('bad'); UI.goyang(b);
          onSalah(q.jenis, salah, function () { return wadah.querySelector('[data-benar="1"]'); });
        }, { x: 220 + i * 300, y: 612, w: 240, h: 96, font: 36, id: 'pilih-' + i });
        if (q.benar) b.dataset.benar = '1';
        wadah.appendChild(b);
        Kafe.muncul(b, i * 80);
      });
    });
  }

  /* ---------- satu pelanggan ---------- */
  function layani(T0, info) {
    var t = info.tingkat, p = Kasir.pesanan(5, t, window.HARGA, Math.random, T.lalu), tepat = true, salahNampan = 0, salahUang = 0;
    var pas = !info.ulang && info.nomor === T.nomorPas;
    /* pesanan dua bagian dengan kartu Anything else?: pertama kali di pelanggan ke-2 atau sesudahnya, lalu kadang-kadang */
    var dua = p.isi.length >= 2 && info.nomor >= 1 && (!T.sudahDua || Math.random() < 0.3);
    if (dua) T.sudahDua = true;
    var bagianA = dua ? p.isi.slice(0, -1) : p.isi, bagianB = dua ? p.isi.slice(-1) : [];
    var kalimat = Bahasa.kalimatPesanan(bagianA, T.templat++), kalimatUlang = dua ? Bahasa.kalimatPesanan(p.isi, 0) : kalimat;
    T.lalu = p.isi; T.pesanan = p; T.tingkat = t; T.total = p.total; T.pas = pas;
    T.uangPelanggan = Kasir.uangBayar(p.total, t, Math.random, pas, 100000);
    T.bayar = Kasir.jumlah(T.uangPelanggan); T.kembalian = T.bayar - T.total;
    T.isiNampan = []; T.isi = []; T.siapNampan = false; T.siapLaci = false; T.langkah = 'masuk';
    T.periksaNampan = periksaNampan; T.periksaUang = periksaUang;   /* diangkat (hoisted), dipakai tombol Sajikan dan Beri Kembalian */
    rak('etalase');
    function catatKartu(salah) { if (salah) tepat = false; Save.catat('ungkapan', !salah); if (T.pel) T.pel.eks('senang'); T.H.potret('senang'); }
    function tunggu() { return new Promise(function (selesai) { T.lanjut = selesai; }); }

    return masuk(info.nama).then(function () {
      if (!hidup()) return;
      sabarMulai(Kasir.jumlahBarang(p.isi));
      if (info.nomor === 0 && T.sabar) UI.tunjuk(T.sabarEl, { fy: 0.6, bawah: true });
      return Toko.bicara(T, satu(UNGKAPAN.pelanggan.salam));
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'sapa';
      UI.sembunyiTangan(true);
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
      return Toko.bicara(T, kalimat, { tampil: false });
    }).then(function () {
      if (!hidup() || !dua) return;
      T.langkah = 'lagi';
      T.H.instruksi(STR.l2.lagi, false);
      return Toko.kartu(T, [
        { teks: UNGKAPAN.kasir.lagi, benar: true },
        { teks: UNGKAPAN.kasir.tanyaHarga, mis: 'ungkapan-situasi', umpan: STR.l2.salahBelumHarga },
        { teks: UNGKAPAN.kasir.kembali, mis: 'ungkapan-situasi', umpan: STR.l2.salahSapaKembali }
      ], 'kanan').then(function (salah) {
        if (!hidup()) return;
        catatKartu(salah);
        return Toko.bicara(T, UNGKAPAN.pelanggan.tambah.replace('{pesanan}', Bahasa.frasaPesanan(bagianB)), { tampil: false });
      });
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'nampan';
      T.siapNampan = true;
      gambarNampan();
      T.saji.style.display = '';
      T.H.instruksi(STR.l2.nampan, false);
      if (info.nomor === 0) UI.tunjuk(T.itemEl[p.isi[0].id], { fy: 0.3 });
      return tunggu();
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'saji';
      return Voice.say(UNGKAPAN.kasir.saji, { tokoh: 'kasir', lang: 'en-US' });
    }).then(function () {
      if (!hidup()) return;
      Toko.struk(T, p.isi, { harga: true });
      return Toko.bicara(T, UNGKAPAN.pelanggan.berapa);
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'total';
      rak('pilihan');
      T.H.instruksi(STR.l5.total, false);
      return pilihTotal(p, function (jenis, n, benarEl) {
        tepat = false;
        Save.catatSalah('total');
        if (jenis === 'lupa-item' || jenis === 'lupa-kali' || jenis === 'teen-ty') Save.catatMis(jenis);
        if (T.pel) T.pel.eks('berpikir');
        var rumus = p.isi.map(function (b) { return Seni.rp(window.HARGA[b.id] * b.n); }).join(' + ');
        if (n === 1) T.H.instruksi(jenis === 'teen-ty' ? STR.l3.teenTyTotal : STR.l5.totalSalah, false);
        else if (n === 2) { T.H.instruksi(U.fmt(STR.l3.rumus, { rumus: rumus }), false); Toko.strukBertahap(T, p.isi, false); }
        else {
          if (n === 3) T.petunjuk3++;
          T.H.instruksi(U.fmt(STR.l3.rumusHasil, { rumus: rumus, hasil: Seni.rp(p.total) }), false);
          Toko.strukBertahap(T, p.isi, true).then(function () { var b = benarEl(); if (b && hidup()) UI.tunjuk(b, { fy: 0.5 }); });
        }
      });
    }).then(function (salah) {
      if (!hidup()) return;
      Save.catat('total', !salah);
      T.strukEl.querySelector('.nilai-total').textContent = Seni.rp(p.total);
      Toko.puji(T);
      rak('laci');
      return Voice.say(Bahasa.kalimatHarga(p.total, 0), { tokoh: 'kasir', lang: 'en-US' });
    }).then(function () {
      if (!hidup()) return;
      T.uangEl.innerHTML = T.uangPelanggan.map(function (v, i) { return '<span class="uang-meja" style="left:' + (i * 34) + 'px;top:' + (i * 10) + 'px">' + gambarUang(v, false) + '</span>'; }).join('');
      T.uangEl.style.display = '';
      Aud.sfx('kertas');
      return Toko.bicara(T, UNGKAPAN.pelanggan.bayar);
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'kembalian';
      balonPendek(true);
      T.garisEl.style.display = ''; T.nampanKembali.style.display = ''; T.beri.style.display = '';
      gambarKembalian();
      T.siapLaci = true;
      T.H.instruksi(pas ? STR.l4.mulaiPas : U.fmt(STR.l4.mulai, { rp: Seni.rp(T.bayar), total: Seni.rp(T.total) }), false);
      return tunggu();
    }).then(function () {
      if (!hidup()) return;
      T.langkah = 'kartu';
      rak('kartu');
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
      catatKartu(salah);
      if (T.pel) T.pel.eks('sorak');
      T.sabar = null; T.sabarEl.style.display = 'none';
      Toko.tambahKas(T, p.total);
      return Toko.bicara(T, UNGKAPAN.pelanggan.terima).then(function () {
        [T.nampanEl, T.strukEl].forEach(function (e) { if (e) e.remove(); });
        T.nampanEl = null; T.strukEl = null;
        T.uangEl.style.display = 'none'; T.garisEl.style.display = 'none'; T.nampanKembali.style.display = 'none';
        T.isi = [];
        return { tepat: tepat && salahNampan === 0 && salahUang === 0 };
      });
    });

    /* tombol Sajikan: nampan hanya diterima bila tepat (umpan balik seperti L2) */
    function periksaNampan() {
      if (!T.siapNampan) return;
      Voice.stop(); UI.sembunyiTangan(true);
      var n = nilaiNampan(p.isi);
      if (!n.lebih.length && !n.kebanyakan.length && !n.kurang.length) {
        T.siapNampan = false; T.saji.style.display = 'none';
        Save.catat('pesanan', salahNampan === 0);
        Toko.puji(T);
        var q = UI.titik(T.nampanEl, 0.4); if (q) UI.ledak(q.x, q.y);
        Tween.wait(400).then(function () { if (hidup() && T.lanjut) T.lanjut(); });
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
      if (lv === 1) { T.H.instruksi(STR.l2.kurang1, false); Toko.bicara(T, kalimatUlang); }
      else if (lv === 2) { T.H.instruksi(STR.l2.kurang2, false); Toko.bicara(T, kalimatUlang, { sorot: Bahasa.frasaItem(hilang.id, hilang.n) }); }
      else {
        if (salahNampan === 3) T.petunjuk3++;
        T.H.instruksi(STR.l2.kurang3, false);
        UI.tunjuk(T.itemEl[hilang.id], { fy: 0.3 });
      }
    }
    /* tombol Beri Kembalian: semua kombinasi yang tepat diterima (umpan balik seperti L4) */
    function periksaUang() {
      if (!T.siapLaci) return;
      Voice.stop(); UI.sembunyiTangan(true);
      var hasil = Kasir.cekKembalian(T.isi, T.kembalian);
      if (hasil === 'tepat') {
        T.siapLaci = false; T.beri.style.display = 'none';
        Save.catat('kembalian', salahUang === 0);
        Toko.puji(T);
        T.chip.style.visibility = 'visible';
        var q = UI.titik(T.nampanKembali, 0.5); if (q) UI.ledak(q.x, q.y);
        Tween.wait(400).then(function () { if (hidup() && T.lanjut) T.lanjut(); });
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

  Scenes.add('level5', {
    enter: function (root) {
      T = Toko.bangun(root, { level: 5, bawah: 'etalase', tingkat: { min: 1, maks: 3, awal: 2 }, jumlah: 8, maksUlang: 1, antrean: true });
      T.templat = 0; T.itemEl = {}; T.laciEl = {}; T.isi = []; T.isiNampan = []; T.sabarHabis = false;
      T.nampanPendek = true;
      T.nomorPas = 2 + Math.floor(Math.random() * 3);
      /* bintang: 1 selesai, 2 = minimal 6 pelanggan tepat pada coba pertama, 3 = ditambah kesabaran tidak pernah habis (Santai: tanpa kesabaran) */
      T.hitungBintang = function () { return T.tepatAwal >= 6 ? (santai() || !T.sabarHabis ? 3 : 2) : 1; };
      /* bintang ke-3 lepas hanya karena teh mendingin: layar hasil menjelaskannya */
      T.tipKhusus = function () { return T.tepatAwal >= 6 && T.sabarHabis && !santai() ? 'sabar' : Toko.misTerbanyak(T); };
      /* laci (disembunyikan sampai pembayaran) */
      T.laciLapis = U.h('div', 'lapis');
      T.laciLapis.innerHTML = Seni.svg(1280, 720, Seni.g('translate(20 606)', Seni.laci({ kosong: true })));
      T.laciLapis.style.pointerEvents = 'none';
      root.insertBefore(T.laciLapis, T.lapisKerja);
      pasangLaci();
      MENU.daftar.forEach(function (it, i) { T.itemEl[it.id] = Kafe.item(T.lapisKerja, it.id, 30 + i * 102, ambil, { label: true, kecil: true, y: 566 }); });
      T.saji = Input.button(STR.tombol.sajikan, 'utama', function () { if (T.periksaNampan) T.periksaNampan(); }, { x: 1020, y: 462, w: 240, h: 88, font: 32, id: 'sajikan' });
      T.saji.style.display = 'none';
      T.lapisKerja.appendChild(T.saji);
      T.garisEl = U.h('div', 'garis-bilangan'); T.garisEl.style.display = 'none';
      T.lapisKerja.appendChild(T.garisEl);
      T.uangEl = U.h('div', 'uang-pelanggan'); T.uangEl.style.display = 'none';
      T.lapisKerja.appendChild(T.uangEl);
      T.nampanKembali = U.h('div', 'nampan-kembalian', Seni.svg(440, 150, Seni.nampan(440, 150, Seni.W.krem, Seni.W.pandan)));
      T.nampanKembali.style.display = 'none';
      T.chip = U.h('div', 'chip-kembalian chip-nampan'); T.chip.setAttribute('data-cek', 'chip nampan');
      T.nampanKembali.appendChild(T.chip);
      T.lapisKerja.appendChild(T.nampanKembali);
      T.beri = Input.button(UI.esc(STR.tombol.beri), 'utama', function () { if (T.periksaUang) T.periksaUang(); }, { x: 1020, y: 470, w: 240, h: 96, font: 27, id: 'beri' });
      T.beri.style.display = 'none';
      T.lapisKerja.appendChild(T.beri);
      /* cangkir kesabaran di samping pelanggan */
      T.sabarEl = U.h('div', 'kesabaran');
      T.sabarEl.setAttribute('role', 'img'); T.sabarEl.setAttribute('aria-label', STR.l5.sabar);
      T.sabarEl.style.display = 'none';
      T.lapisKerja.appendChild(T.sabarEl);
      Loop.add(detak);
      Aud.musik('sibuk');
      UI.idle.atur(function () {
        if (T.kartuAktif) return T.lapisKerja.querySelector('.kartu-kalimat');
        if (T.siapNampan) return T.isiNampan.length ? T.saji : document.querySelector('[data-id="dengar-lagi"]');
        if (T.pilihan) return T.strukEl;
        if (T.siapLaci) return T.isi.length ? T.beri : T.garisEl;
        return null;
      });
      T.H.instruksi(santai() ? STR.l5.mulaiSantai : STR.l5.mulai);
      Toko.jalankan(T, layani);
    },
    exit: function () { Loop.remove(detak); if (T) T.hidup = false; },
    uji: {
      keadaan: function () {
        return { langkah: T.langkah || '', nomor: T.nomor, siap: giliranMurid() && !Voice.sibuk(), tingkat: T.adaptif.t, petunjuk3: T.petunjuk3, pas: !!T.pas,
          sabar: T.sabar ? Math.round(T.sabar.sisa) : null, sabarHabis: !!T.sabarHabis, rak: T.rak };
      },
      benar: function () {
        if (T.kartuAktif) return ['kartu-' + T.kartuAktif.findIndex(function (k) { return k.benar; })];
        if (T.siapNampan) {
          var ids = [], n = nilaiNampan(T.pesanan.isi);
          n.lebih.forEach(function (id) { ids.push(T.nampanEl.querySelector('[data-item="' + id + '"]').dataset.id); });
          if (ids.length) return [ids[0]];
          T.pesanan.isi.forEach(function (b) { var ada = T.isiNampan.filter(function (x) { return x === b.id; }).length; for (var k = ada; k < b.n; k++) ids.push('item-' + b.id); });
          return ids.concat(['sajikan']);
        }
        if (T.pilihan) return ['pilih-' + T.pilihan.findIndex(function (k) { return k.benar; })];
        if (T.siapLaci) {
          var s = Kasir.jumlah(T.isi);
          if (s > T.kembalian) return [T.nampanKembali.querySelector('.uang-nampan').dataset.id];
          return Kasir.pecahanMinimal(T.kembalian - s, 50000).map(function (v) { return 'laci-' + v; }).concat(['beri']);
        }
        return [];
      },
      salah: function () {
        if (T.kartuAktif) return ['kartu-' + T.kartuAktif.findIndex(function (k) { return !k.benar; })];
        if (T.siapNampan) { var lain = MENU.daftar.filter(function (it) { return !T.pesanan.isi.some(function (b) { return b.id === it.id; }); })[0].id; return ['item-' + lain, 'sajikan']; }
        if (T.pilihan) return ['pilih-' + T.pilihan.findIndex(function (k) { return !k.benar; })];
        if (T.siapLaci) return T.kembalian > 0 ? ['beri'] : ['laci-500', 'beri'];
        return [];
      }
    }
  });
})();
