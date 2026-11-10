/* Level 3 Harga dan Total (TP3, TP4, TP5; tag angka-harga, total, ungkapan), GDD bagian 9.
   Tulis Harga: Kak Lala menyebut harga, murid memilih label (pengecoh selalu -teen/-ty), label menempel di papan menu.
   Enam pelanggan: nampan sudah berisi pesanan, pelanggan bertanya "How much is it?", murid memilih total (pelanggan 1-4)
   atau mengetik di papan angka (pelanggan 5-6), lalu memilih kartu "It's ... rupiah.". */
(function () {
  var T = null;
  function satu(a) { return a[Math.floor(Math.random() * a.length)]; }
  function hidup() { return T && Toko.hidup(T); }
  function hapusPilihan() { if (T.pilihanEl) { T.pilihanEl.remove(); T.pilihanEl = null; } T.pilihan = null; }

  /* ---------- kontras -teen/-ty (brief bagian 8): kedua kata diputar bergantian, suku kata bertekanan dibesarkan ---------- */
  var TEKAN = { 13: ['thir', 'teen', 2], 14: ['four', 'teen', 2], 15: ['fif', 'teen', 2], 16: ['six', 'teen', 2], 17: ['seven', 'teen', 2], 18: ['eigh', 'teen', 2], 19: ['nine', 'teen', 2],
    30: ['thir', 'ty', 1], 40: ['for', 'ty', 1], 50: ['fif', 'ty', 1], 60: ['six', 'ty', 1], 70: ['seven', 'ty', 1], 80: ['eigh', 'ty', 1], 90: ['nine', 'ty', 1] };
  /* v tertukar -teen/-ty dengan h bila angka ribuannya pasangan (15 dan 50, 5 dan 15 atau 50) dan ratusannya sama */
  function terkaitTeenTy(h, v) {
    var k = Math.floor(h / 1000), kv = Math.floor(v / 1000), pasangan = [];
    if (h % 1000 !== v % 1000 || k === kv) return false;
    if (k >= 13 && k <= 19) pasangan = [(k % 10) * 10, k % 10];
    else if (k >= 1 && k <= 9) pasangan = [10 + k, k * 10];
    else if (k >= 30 && k <= 90 && k % 10 === 0) pasangan = [k / 10 + 10, k / 10];
    return pasangan.indexOf(kv) >= 0;
  }
  /* hanya kata ribuannya (yang diucapkan bergantian); harga lengkap tampil di sampingnya */
  function kataRibuan(n) {
    var k = Math.floor(n / 1000), t = TEKAN[k];
    return t ? (t[2] === 2 ? t[0] + '<b class="tekan">' + t[1].toUpperCase() + '</b>' : '<b class="tekan">' + t[0].toUpperCase() + '</b>' + t[1]) : UI.esc(Bahasa.ejaAngka(k));
  }
  function hapusKontras() { if (T.kontrasEl) { T.kontrasEl.remove(); T.kontrasEl = null; } }
  function kontras(benar, salah) {
    hapusKontras();
    var el = U.h('div', 'kontras-angka');
    el.setAttribute('data-cek', 'kontras angka');
    el.innerHTML = [benar, salah].map(function (n, i) {
      return '<div class="baris-kontras' + (i === 0 ? ' benar' : '') + '"><span>' + kataRibuan(n) + '</span><span class="nilai">' + Seni.rp(n) + '</span></div>';
    }).join('');
    T.lapisKerja.appendChild(el);
    T.kontrasEl = el;
    Kafe.muncul(el);
    /* hanya kata ribuannya, bergantian (ada di naskah sebagai kata angka) */
    [benar, salah].forEach(function (n) { Voice.say(Bahasa.besar(Bahasa.ejaAngka(Math.floor(n / 1000))) + '.', { tokoh: 'lala', lang: 'en-US' }); });
  }
  /* 3 tombol pilihan angka di rak bawah. Hasil janji: jumlah salah sebelum benar. onSalah(jenis, nSalah) */
  function pilihAngka(nilaiBenar, pengecoh, onSalah) {
    hapusPilihan();
    var wadah = U.h('div', 'deret-pilihan'), daftar = U.shuffle(Math.random, [{ nilai: nilaiBenar, benar: true }].concat(pengecoh)), salah = 0;
    T.lapisKerja.appendChild(wadah);
    T.pilihanEl = wadah; T.pilihan = daftar;
    return new Promise(function (selesai) {
      daftar.forEach(function (p, i) {
        var b = Input.button(Seni.rp(p.nilai), 'ketiga', function () {
          if (!hidup() || b.disabled) return;
          Voice.stop(); UI.sembunyiTangan(true);
          if (p.benar) {
            Array.prototype.forEach.call(wadah.children, function (k) { k.disabled = true; });
            var q = UI.titik(b, 0.5); if (q) UI.ledak(q.x, q.y);
            Tween.wait(350).then(function () { hapusPilihan(); selesai(salah); });
            return;
          }
          salah++; Aud.sfx('bad'); UI.goyang(b);
          onSalah(p.jenis, salah, function () { return wadah.querySelector('[data-benar="1"]'); }, p.nilai);
        }, { x: 220 + i * 300, y: 612, w: 240, h: 96, font: 36, id: 'pilih-' + i });
        if (p.benar) b.dataset.benar = '1';
        wadah.appendChild(b);
        Kafe.muncul(b, i * 80);
      });
    });
  }

  /* ---------- papan angka (pelanggan 5-6) ---------- */
  function papanAngka(nilaiBenar, onSalah) {
    hapusPilihan();
    var wadah = U.h('div', 'deret-pilihan papan-angka'), isi = '', salah = 0;
    var layar = U.h('div', 'layar-angka', '');
    layar.setAttribute('data-cek', 'layar angka');
    wadah.appendChild(layar);
    T.lapisKerja.appendChild(wadah);
    T.pilihanEl = wadah; T.angkaBenar = nilaiBenar;
    function tampil() { layar.innerHTML = '<span>Rp</span><b>' + (isi ? Seni.angka(parseInt(isi, 10)) : UI.esc(STR.l3.layarKosong)) + '</b>'; }
    tampil();
    return new Promise(function (selesai) {
      function tekan(k) {
        if (!hidup()) return;
        if (k === 'hapus') isi = isi.slice(0, -1);
        else if (k === 'ok') {
          var v = parseInt(isi || '0', 10);
          if (v === nilaiBenar) { document.removeEventListener('keydown', kunci); var q = UI.titik(layar, 0.5); if (q) UI.ledak(q.x, q.y); Tween.wait(350).then(function () { hapusPilihan(); selesai(salah); }); return; }
          salah++; Aud.sfx('bad'); UI.goyang(layar);
          var jenis = v === Kasir.total(T.pesanan.isi.map(function (b) { return { id: b.id, n: 1 }; }), window.HARGA) ? 'lupa-kali' : (v === Bahasa.tukarTeenTy(nilaiBenar) ? 'teen-ty' : (v < nilaiBenar ? 'lupa-item' : 'selisih'));
          onSalah(jenis, salah, function () { return wadah.querySelector('[data-id="angka-' + String(nilaiBenar)[0] + '"]'); }, v);
          isi = '';
        } else if (isi.length < 6) isi = (isi + k).replace(/^0+/, '');
        tampil();
      }
      function kunci(e) {
        if (document.querySelector('.overlay') || (e.target && e.target.tagName === 'INPUT')) return;
        if (/^[0-9]$/.test(e.key)) tekan(e.key);
        else if (e.key === 'Backspace') tekan('hapus');
        else if (e.key === 'Enter' && document.activeElement && !document.activeElement.classList.contains('tombol')) tekan('ok');
        else return;
        e.preventDefault();
      }
      document.addEventListener('keydown', kunci);
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '000', 'hapus'].forEach(function (k, i) {
        var b = Input.button(k === 'hapus' ? UI.esc(STR.l3.hapus) : k, 'ketiga', function () { tekan(k); }, { x: 45 + i * 100, y: 616, w: 90, h: 84, font: k === 'hapus' ? 22 : 34, id: 'angka-' + k });
        wadah.appendChild(b);
      });
      wadah.appendChild(Input.button(UI.esc(STR.l3.ok), 'utama', function () { tekan('ok'); }, { x: 1020, y: 462, w: 240, h: 88, font: 34, id: 'angka-ok' }));
      T.kunciAngka = kunci;
    });
  }

  /* ---------- Tulis Harga ---------- */
  function tulisHarga() {
    var ids = U.shuffle(Math.random, MENU.daftar.map(function (it) { return it.id; }));
    ids.sort(function (a, b) { var ta = Bahasa.tukarTeenTy(window.HARGA[a]) ? 0 : 1, tb = Bahasa.tukarTeenTy(window.HARGA[b]) ? 0 : 1; return ta - tb; });
    var soal = ids.slice(0, 5), rantai = Promise.resolve();   /* 5 soal: cukup untuk status Dikuasai (minimal 5 kesempatan) */
    T.papan.sembunyikan(soal);
    T.pel = Kafe.tokoh(T.svgPel, 'lala', 306, 104, 1);
    T.namaPel = 'lala';
    T.B.el.querySelector('.nama-pelanggan').textContent = Seni.TOKOH.lala.nama;
    T.B.muncul();
    soal.forEach(function (id, k) {
      rantai = rantai.then(function () {
        if (!hidup()) return;
        var h = window.HARGA[id], kalimat = (Bahasa.item(id).jenis === 'jamak' ? 'The ' + Bahasa.item(id).nama + ' are ' : 'The ' + Bahasa.item(id).nama + ' is ') + Bahasa.ejaRupiah(h) + '.';
        var salahKe = 0;
        T.langkah = 'harga';
        T.papan.sorot([id]);
        T.H.instruksi(k === 0 ? STR.l3.harga : STR.l3.hargaLagi, false);
        Toko.bicara(T, kalimat, { tampil: false });
        return pilihAngka(h, Kasir.pengecohHarga(h).map(function (v) { return { nilai: v, jenis: terkaitTeenTy(h, v) ? 'teen-ty' : 'selisih' }; }), function (jenis, n, benarEl, nilai) {
          salahKe = n;
          var tt = jenis === 'teen-ty';
          Save.catatSalah('angka-harga');
          if (tt) Save.catatMis('teen-ty');
          T.pel.eks('berpikir');
          T.H.instruksi(n >= 2 ? (tt ? STR.l3.hargaSalah2 : STR.l3.hargaLain2) : (tt ? STR.l3.hargaSalah1 : STR.l3.hargaLain1), false);
          /* salah ke-1: dengar bedanya (-teen/-ty) atau dengar lagi pelan; salah ke-2: tulisan tampil dan tangan menunjuk */
          if (tt) kontras(h, nilai);
          if (!tt || n >= 2) Kafe.ucapPelan(kalimat, { tokoh: 'lala', balon: T.B, wajah: T.pel, tampil: n >= 2 || !UI.adaSuara('en-US') });
          if (n >= 2) { var b = benarEl(); if (b) UI.tunjuk(b, { fy: 0.5 }); if (n === 2) T.petunjuk3++; }
        }).then(function (salah) {
          if (!hidup()) return;
          hapusKontras();
          Save.catat('angka-harga', !salah);
          T.papan.tampilkan(id);
          T.papan.sorot([]);
          Toko.puji(T);
          return Kafe.ucap(satu(UNGKAPAN.pujian), { tokoh: 'lala', balon: T.B, wajah: T.pel }).then(function () { if (T.pel) T.pel.eks('senang'); });
        });
      });
    });
    return rantai.then(function () {
      if (!hidup()) return;
      T.H.instruksi(STR.l3.siapPelanggan, false);
      return Toko.keluar(T);
    });
  }

  /* ---------- pelanggan ---------- */
  function layani(T0, info) {
    var t = info.tingkat, p = Kasir.pesanan(3, t, window.HARGA, Math.random, T.lalu), tepat = true, tot = p.total;
    T.lalu = p.isi; T.pesanan = p; T.langkah = 'masuk';
    var pengecoh = Kasir.pengecohTotal(p.isi, window.HARGA), pakaiAngka = !info.ulang && info.nomor >= 4;
    function salahTotal(jenis, n, benarEl, nilai) {
      tepat = false;
      if (jenis === 'teen-ty' && nilai != null) kontras(tot, nilai);
      Save.catatSalah('total');
      if (jenis === 'lupa-item' || jenis === 'lupa-kali' || jenis === 'teen-ty') Save.catatMis(jenis);
      if (T.pel) T.pel.eks('berpikir');
      T.papan.sorot(p.isi.map(function (b) { return b.id; }));
      var rumus = p.isi.map(function (b) { return (b.n > 1 ? b.n + ' x ' : '') + Seni.rp(window.HARGA[b.id]); }).join(' + ');
      if (n === 1) T.H.instruksi(jenis === 'lupa-kali' ? STR.l3.lupaKali : (jenis === 'lupa-item' ? STR.l3.lupaItem : (jenis === 'teen-ty' ? STR.l3.teenTyTotal : STR.l3.salahTotal)), false);
      else if (n === 2) {
        /* tingkat 2: struk menjumlah per baris supaya terlihat menu mana yang dikalikan atau terlewat */
        T.H.instruksi(U.fmt(STR.l3.rumus, { rumus: rumus }), false);
        Toko.strukBertahap(T, p.isi, false);
      } else {
        if (n === 3) T.petunjuk3++;
        T.H.instruksi(U.fmt(STR.l3.rumusHasil, { rumus: rumus, hasil: Seni.rp(tot) }), false);
        Toko.strukBertahap(T, p.isi, true).then(function () { var b = benarEl(); if (b && hidup()) UI.tunjuk(b, { fy: 0.5 }); });
      }
    }
    return Toko.masuk(T, info.nama).then(function () {
      if (!hidup()) return;
      Toko.nampan(T, p.isi);
      Toko.struk(T, p.isi, { harga: t === 1 });
      if (t === 1) T.papan.sorot(p.isi.map(function (b) { return b.id; }));
      return Toko.bicara(T, UNGKAPAN.pelanggan.berapa);
    }).then(function () {
      if (!hidup()) return;
      T.langkah = pakaiAngka ? 'angka' : 'total';
      T.H.instruksi(pakaiAngka ? STR.l3.angka : STR.l3.total, false);
      return pakaiAngka ? papanAngka(tot, salahTotal) : pilihAngka(tot, pengecoh, salahTotal);
    }).then(function (salah) {
      if (!hidup()) return;
      Save.catat('total', !salah);
      hapusKontras();
      T.strukEl.querySelector('.nilai-total').textContent = Seni.rp(tot);
      T.papan.sorot([]);
      Toko.puji(T);
      T.langkah = 'kartu';
      T.H.instruksi(STR.l3.kartu, false);
      var gaya = Math.random() < 0.5 ? 1 : 0, angka = t <= 2;
      var lain = Bahasa.tukarTeenTy(tot) || pengecoh[0].nilai, lain2 = pengecoh.filter(function (c) { return c.nilai !== lain; })[0].nilai;
      function kartu(n, benar, mis) {
        return { teks: Bahasa.kalimatHarga(n, gaya), kecil: angka ? Seni.rp(n) : '', benar: benar, mis: mis,
          umpan: benar ? '' : (mis === 'teen-ty' ? STR.l3.kartuTeenTy : STR.l3.kartuSalah) };
      }
      return Toko.kartu(T, [kartu(tot, true), kartu(lain, false, lain === Bahasa.tukarTeenTy(tot) ? 'teen-ty' : ''), kartu(lain2, false, '')], 'bawah');
    }).then(function (salah) {
      if (!hidup()) return { tepat: false };
      if (salah) tepat = false;
      Save.catat('ungkapan', !salah);
      if (T.pel) T.pel.eks('sorak');
      Toko.tambahKas(T, tot);
      return Toko.bicara(T, UNGKAPAN.pelanggan.terima).then(function () {
        if (T.nampanEl) T.nampanEl.remove();
        if (T.strukEl) T.strukEl.remove();
        return { tepat: tepat };
      });
    });
  }

  Scenes.add('level3', {
    enter: function (root) {
      T = Toko.bangun(root, { level: 3, bawah: 'laci', tingkat: { min: 1, maks: 3, awal: 2 } });
      Aud.musik('kafe');
      UI.idle.atur(function () {
        if (T.kartuAktif) return T.lapisKerja.querySelector('.kartu-kalimat');
        if (T.pilihanEl) return document.querySelector('[data-id="dengar-lagi"]');
        return null;
      });
      tulisHarga().then(function () { if (hidup()) Toko.jalankan(T, layani); });
    },
    exit: function () { if (T) { T.hidup = false; if (T.kunciAngka) document.removeEventListener('keydown', T.kunciAngka); } },
    uji: {
      keadaan: function () { return { langkah: T.langkah || '', nomor: T.nomor, siap: !!(T.kartuAktif || T.pilihanEl) && !Voice.sibuk(), tingkat: T.adaptif.t, petunjuk3: T.petunjuk3 }; },
      benar: function () {
        if (T.kartuAktif) return ['kartu-' + T.kartuAktif.findIndex(function (k) { return k.benar; })];
        if (T.pilihan) return ['pilih-' + T.pilihan.findIndex(function (k) { return k.benar; })];
        if (T.pilihanEl) return String(T.angkaBenar).split('').map(function (d) { return 'angka-' + d; }).concat(['angka-ok']);
        return [];
      },
      salah: function () {
        if (T.kartuAktif) return ['kartu-' + T.kartuAktif.findIndex(function (k) { return !k.benar; })];
        if (T.pilihan) return ['pilih-' + T.pilihan.findIndex(function (k) { return !k.benar; })];
        if (T.pilihanEl) return ['angka-1', 'angka-ok'];
        return [];
      }
    }
  });
})();
