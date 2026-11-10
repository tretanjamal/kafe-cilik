/* Level 1 Buka Kafe (TP1, tag kosakata), GDD bagian 9.
   Tiga putaran semantik. Tiap putaran: Kenalan (nama tampil dan diucapkan), Dengar dan ketuk (nama disembunyikan),
   Cocokkan (seret kata ke gambar, atau ketuk kata lalu ketuk gambar). Putaran 1 dipandu tangan penunjuk.
   Petunjuk bertingkat: salah 1 dengar lagi, salah 2 dua gambar menyala dan tulisan tampil, salah 3 tangan menunjuk,
   lalu item itu ditanyakan lagi di akhir langkah (paling banyak 2 soal tambahan). Selesai bila 12 item benar minimal sekali.
   Bintang: 3 tanpa petunjuk ke-3, 2 bila paling banyak 2 kali, 1 selesai. */
(function () {
  var PUTARAN = [1, 2, 3].map(function (p) {
    return MENU.daftar.filter(function (it) { return it.putaran === p; }).map(function (it) { return it.id; });
  });
  var XKARTU = [155, 405, 655, 905], YKARTU = 466;
  var S = {};
  function acak(a) { return U.shuffle(Math.random, a); }
  function satu(a) { return a[Math.floor(Math.random() * a.length)]; }
  function hidup(gen) { return S.hidup && Scenes.name === 'level1' && (gen == null || gen === S.gen); }
  function jumlahKenal() { return Object.keys(S.dikenal).length; }
  function sisaKartu() { return Object.keys(S.kartuEl).filter(function (k) { return !S.kartuEl[k].disabled; }); }
  function opsiUcap(tambah) { var o = { tokoh: 'lala', balon: S.B, wajah: S.lala }, k; for (k in tambah || {}) o[k] = tambah[k]; return o; }
  function ucap(teks, tambah) { S.terakhir = teks; return Kafe.ucap(teks, opsiUcap(tambah)); }
  function wajah(e) { S.lala.eks(e); S.H.potret(e); }
  function semuaItem(fn) { Object.keys(S.itemEl).forEach(function (k) { fn(S.itemEl[k], k); }); }

  /* ---------- etalase ---------- */
  function pasangEtalase(ids, berlabel) {
    S.lapisItem.innerHTML = ''; S.itemEl = {};
    var xs = Kafe.letakEtalase(ids.length);
    ids.forEach(function (id, i) {
      S.itemEl[id] = Kafe.item(S.lapisItem, id, xs[i], ketukItem, { label: berlabel, aria: berlabel ? Bahasa.item(id).nama : U.fmt(STR.l1.gambarKe, { n: i + 1 }) });
    });
  }
  function kenal(id) {
    if (S.dikenal[id]) return;
    S.dikenal[id] = true;
    var n = jumlahKenal();
    S.H.cangkir(n, 12);
    UI.hitungNaik(S.H.chipNilai, n - 1, n, function (v) { return v + '/12'; }, 300);
    Aud.sfx('koin');
  }

  /* ---------- alur putaran ---------- */
  function mulaiPutaran() {
    S.lapisKartu.innerHTML = ''; S.kartuEl = {};
    UI.toast(U.fmt(STR.l1.judulPutaran, { n: S.putaran + 1, nama: STR.l1.putaran[S.putaran] }));
    kenalan();
  }
  function kenalan() {
    var gen = ++S.gen, ids = PUTARAN[S.putaran], rantai = Tween.wait(500);
    S.langkah = 'kenalan'; S.siap = false; S.lanjut.style.display = 'none';
    pasangEtalase(ids, true);
    semuaItem(function (el) { el.style.visibility = 'hidden'; });
    S.H.instruksi(STR.l1.kenalan, false);
    ids.forEach(function (id, i) {
      rantai = rantai.then(function () {
        if (!hidup(gen)) return;
        var el = S.itemEl[id];
        el.style.visibility = 'visible';
        el.classList.add('denyut-item');
        return Kafe.muncul(el, i ? 150 : 0).then(function () { return hidup(gen) ? ucap(Bahasa.kalimatIni(id)) : null; })
          .then(function () { el.classList.remove('denyut-item'); });
      });
    });
    rantai.then(function () {
      if (!hidup(gen)) return;
      semuaItem(function (el) { el.style.visibility = 'visible'; el.style.opacity = 1; });
      S.siap = true;
      S.lanjut.style.display = '';
      Kafe.muncul(S.lanjut, 0);
      S.H.instruksi(STR.l1.kenalanLanjut);
      if (S.putaran === 0) UI.tunjuk(S.itemEl[ids[0]], { fy: 0.3 });
    });
  }
  function lanjut() {
    if (S.langkah !== 'kenalan' || !S.siap) return;
    Voice.stop(); UI.sembunyiTangan(true);
    dengar();
  }
  function dengar() {
    var gen = ++S.gen, ids = PUTARAN[S.putaran];
    S.langkah = 'dengar'; S.siap = false; S.lanjut.style.display = 'none';
    var pengecoh = S.putaran > 0 ? acak(PUTARAN[S.putaran - 1]).slice(0, 2) : [];
    pasangEtalase(acak(ids.concat(pengecoh)), false);
    S.soal = acak(ids); S.ulang = []; S.tambahan = 0; S.nomor = 0;
    S.H.instruksi(STR.l1.dengar).then(function () { if (hidup(gen)) soalBerikut(); });
  }
  function soalBerikut() {
    var gen = ++S.gen;
    if (!S.soal.length && S.ulang.length) { S.soal = S.ulang; S.ulang = []; }
    if (!S.soal.length) { cocok(); return; }
    S.target = S.soal.shift(); S.salah = 0; S.nomor++;
    S.panduan = S.putaran === 0 && S.nomor === 1;
    semuaItem(function (el) { el.classList.remove('redup', 'sorot'); });
    wajah('senang');
    S.H.instruksi(STR.l1.dengar, false);
    S.siap = true;
    tanya(false).then(function () { if (hidup(gen) && S.panduan && S.siap) UI.tunjuk(S.itemEl[S.target], { fy: 0.3 }); });
  }
  /* "Where is the burger?": tulisan baru tampil pada salah ke-2, bila teks langsung dipilih, atau bila tidak ada suara bahasa Inggris */
  function tanya(pelan) {
    var t = Bahasa.kalimatCari(S.target), tampil = S.salah >= 2 || Save.data.settings.teksLangsung || !UI.adaSuara('en-US');
    S.terakhir = t;
    return (pelan ? Kafe.ucapPelan : Kafe.ucap)(t, opsiUcap({ tampil: tampil }));
  }
  function ulangi(pelan) {
    Voice.stop();
    if (S.langkah === 'dengar' && S.siap) { tanya(pelan); return; }
    if (S.terakhir) (pelan ? Kafe.ucapPelan : Kafe.ucap)(S.terakhir, opsiUcap());
  }

  function ketukItem(id, el) {
    if (!hidup()) return;
    if (S.langkah === 'kenalan') {
      if (el.style.visibility === 'hidden') return;
      Voice.stop(); UI.lompat(el); Aud.sfx('pilih');
      ucap(Bahasa.kalimatIni(id));
      if (S.putaran === 0 && S.siap && UI.sumberTangan === 'petunjuk') UI.tunjuk(S.lanjut, { fy: 0.3 });
      return;
    }
    if (S.langkah === 'dengar') {
      if (!S.siap) return;
      Voice.stop();
      if (id === S.target) jawabBenar(el); else jawabSalah(el, id);
      return;
    }
    if (S.langkah === 'cocok') {
      if (!S.siap || el.classList.contains('berlabel')) return;
      if (!S.kartu) { UI.goyang(el); Aud.sfx('bad'); S.H.instruksi(STR.l1.cocok, false); return; }
      cocokkan(S.kartu, id);
    }
  }
  function jawabBenar(el) {
    var gen = ++S.gen;
    S.siap = false; UI.sembunyiTangan(true);
    Aud.sfx('good'); UI.lompat(el);
    var p = UI.titik(el, 0.4); if (p) UI.ledak(p.x, p.y);
    wajah('sorak');
    if (!S.panduan) Save.catat('kosakata', S.salah === 0);
    kenal(S.target);
    S.H.instruksi(satu(STR.l1.pujian), false);
    Promise.all([ucap(satu(UNGKAPAN.pujian)), Tween.wait(700)]).then(function () { if (hidup(gen)) soalBerikut(); });
  }
  function jawabSalah(el, id) {
    var gen = ++S.gen;
    S.salah++; Save.catatSalah('kosakata');
    Aud.sfx('bad'); UI.goyang(el);
    wajah('berpikir');
    var lv = Math.min(3, S.salah);
    if (lv === 1) {
      S.H.instruksi(STR.l1.salah1, false);
    } else if (lv === 2) {
      S.H.instruksi(STR.l1.salah2, false);
      var lain = Object.keys(S.itemEl).filter(function (k) { return k !== S.target && k !== id; }), teman = satu(lain) || id;
      semuaItem(function (e, k) { var on = k === S.target || k === teman; e.classList.toggle('redup', !on); e.classList.toggle('sorot', on); });
    } else {
      S.H.instruksi(STR.l1.salah3, false);
      if (S.salah === 3) {
        S.petunjuk3++;
        if (S.tambahan < 2 && S.ulang.indexOf(S.target) < 0) { S.ulang.push(S.target); S.tambahan++; }
      }
      UI.tunjuk(S.itemEl[S.target], { fy: 0.3 });
    }
    /* "That is tea." untuk yang diketuk, lalu pertanyaan diulang */
    ucap(Bahasa.kalimatItu(id)).then(function () { if (hidup(gen)) tanya(false); });
  }

  /* ---------- Cocokkan ---------- */
  function cocok() {
    var gen = ++S.gen, ids = PUTARAN[S.putaran], urut = acak(ids);
    S.langkah = 'cocok'; S.siap = false; S.kartu = null; S.salahKartu = {}; S.sisa = ids.length; S.pasanganPertama = true;
    pasangEtalase(acak(ids), false);
    semuaItem(function (el) { el.classList.add('siap-cocok'); });
    S.lapisKartu.innerHTML = ''; S.kartuEl = {};
    urut.forEach(function (id, i) { buatKartu(id, XKARTU[i], YKARTU); });
    wajah('senang');
    S.siap = true;
    S.H.instruksi(STR.l1.cocok);
    if (S.putaran === 0) peraga(urut[0]);
  }
  function buatKartu(id, x, y) {
    var b = U.h('button', 'kartu-kata', UI.esc(Bahasa.item(id).nama)), seret = null;
    b.type = 'button'; b.dataset.id = 'kata-' + id;
    b.style.left = x + 'px'; b.style.top = y + 'px';
    b._rumah = { x: x, y: y };
    b.addEventListener('pointerdown', function (e) {
      if (!S.siap || S.langkah !== 'cocok' || b.disabled) return;
      Aud.init();
      seret = { id: e.pointerId, x0: e.clientX, y0: e.clientY, aktif: false };
      try { b.setPointerCapture(e.pointerId); } catch (x) { /* tidak didukung: cukup ketuk */ }
      b._ditekan = true;
      pilihKartu(id);
    });
    b.addEventListener('pointermove', function (e) {
      if (!seret || e.pointerId !== seret.id) return;
      if (!seret.aktif && Math.abs(e.clientX - seret.x0) + Math.abs(e.clientY - seret.y0) < 12) return;
      seret.aktif = true; b.classList.add('seret');
      var p = Stage.toLocal(e.clientX, e.clientY);
      b.style.left = (p.x - 110) + 'px'; b.style.top = (p.y - 36) + 'px';
    });
    b.addEventListener('pointerup', function (e) {
      if (!seret || e.pointerId !== seret.id) return;
      var tadi = seret; seret = null;
      b.classList.remove('seret');
      if (!tadi.aktif) return;
      var p = Stage.toLocal(e.clientX, e.clientY), kena = null;
      semuaItem(function (el, k) {
        var ix = parseFloat(el.style.left), iy = parseFloat(el.style.top);
        if (!el.classList.contains('berlabel') && p.x >= ix - 14 && p.x <= ix + 164 && p.y >= iy - 40 && p.y <= iy + 150) kena = k;
      });
      if (kena) cocokkan(id, kena); else pulang(b);
    });
    b.addEventListener('pointercancel', function () { if (seret) { seret = null; b.classList.remove('seret'); pulang(b); } });
    /* klik dari keyboard (Enter) memilih kata; klik sesudah pointerdown sudah ditangani */
    b.addEventListener('click', function () { if (b._ditekan) { b._ditekan = false; return; } pilihKartu(id); });
    S.lapisKartu.appendChild(b);
    S.kartuEl[id] = b;
  }
  function pulang(b) {
    var x0 = parseFloat(b.style.left), y0 = parseFloat(b.style.top), r = b._rumah;
    return Tween.run(220, function (e) { b.style.left = (x0 + (r.x - x0) * e) + 'px'; b.style.top = (y0 + (r.y - y0) * e) + 'px'; }, Ease.easeInOutCubic);
  }
  function pilihKartu(id) {
    if (!S.siap || S.langkah !== 'cocok') return;
    Voice.stop();
    S.kartu = id;
    Object.keys(S.kartuEl).forEach(function (k) { S.kartuEl[k].classList.toggle('terpilih', k === id); });
    Aud.sfx('kertas');
    ucap(Bahasa.besar(Bahasa.item(id).nama) + '.');
    S.H.instruksi(STR.l1.pilihGambar, false);
    if (S.putaran === 0 && S.pasanganPertama && UI.sumberTangan === 'petunjuk') UI.tunjuk(S.itemEl[id], { fy: 0.3 });
  }
  function cocokkan(k, itemId) {
    var kartu = S.kartuEl[k], el = S.itemEl[itemId], gen = ++S.gen;
    Voice.stop();
    if (k === itemId) {
      S.siap = false; UI.sembunyiTangan(true);
      Aud.sfx('good');
      var x0 = parseFloat(kartu.style.left), y0 = parseFloat(kartu.style.top), x1 = parseFloat(el.style.left) - 35, y1 = parseFloat(el.style.top) + 100;
      Tween.run(280, function (e) {
        kartu.style.left = (x0 + (x1 - x0) * e) + 'px'; kartu.style.top = (y0 + (y1 - y0) * e) + 'px'; kartu.style.scale = (1 - 0.4 * e).toFixed(3);
      }, Ease.easeInOutCubic).then(function () {
        kartu.classList.add('selesai'); kartu.disabled = true;
        el.classList.add('berlabel'); el.classList.remove('siap-cocok', 'sorot', 'redup');
        el.setAttribute('aria-label', Bahasa.item(itemId).nama);
        UI.lompat(el);
        var p = UI.titik(el, 0.4); if (p) UI.ledak(p.x, p.y);
      });
      wajah('sorak');
      if (!(S.putaran === 0 && S.pasanganPertama)) Save.catat('kosakata', !S.salahKartu[k]);
      S.pasanganPertama = false;
      kenal(itemId);
      S.kartu = null; S.sisa--;
      S.H.instruksi(satu(STR.l1.pujian), false);
      Promise.all([ucap(Bahasa.kalimatIni(itemId)), Tween.wait(650)]).then(function () {
        if (!hidup(gen)) return;
        wajah('senang');
        if (S.sisa <= 0) { putaranSelesai(); return; }
        S.siap = true;
        S.H.instruksi(STR.l1.cocok, false);
      });
      return;
    }
    S.salahKartu[k] = (S.salahKartu[k] || 0) + 1; Save.catatSalah('kosakata');
    Aud.sfx('bad'); UI.goyang(el); pulang(kartu);
    wajah('berpikir');
    var lv = Math.min(3, S.salahKartu[k]);
    semuaItem(function (e) { e.classList.remove('sorot'); });
    if (lv === 1) S.H.instruksi(STR.l1.cocokSalah1, false);
    else {
      S.H.instruksi(lv === 2 ? STR.l1.cocokSalah2 : STR.l1.cocokSalah3, false);
      S.itemEl[k].classList.add('sorot');
      if (lv === 3) {
        if (S.salahKartu[k] === 3) S.petunjuk3++;
        UI.tunjuk(S.itemEl[k], { fy: 0.3 });
      }
    }
    /* "That is tea." untuk gambar yang dipilih, lalu kata kartu diulang. Kartu tetap terpilih. */
    ucap(Bahasa.kalimatItu(itemId)).then(function () { if (hidup(gen)) ucap(Bahasa.besar(Bahasa.item(k).nama) + '.'); });
  }
  /* panduan putaran 1: tangan memperagakan seret dari kartu ke gambarnya, lalu menunjuk kartu */
  function peraga(id) {
    var kartu = S.kartuEl[id], gambar = S.itemEl[id], gen = S.gen;
    UI.tunjuk(kartu, { fy: 0.5 });
    var a = UI.titik(kartu, 0.5), b = UI.titik(gambar, 0.4);
    if (!a || !b || UI.kurangi) return;
    Tween.wait(700).then(function () {
      if (!hidup(gen) || UI.sumberTangan !== 'petunjuk') return;
      return Tween.run(900, function (e) { UI.letakTangan(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e); }, Ease.easeInOutCubic);
    }).then(function () { return Tween.wait(450); }).then(function () {
      if (hidup(gen) && S.kartu == null && UI.sumberTangan === 'petunjuk') UI.tunjuk(kartu, { fy: 0.5 });
    });
  }
  function putaranSelesai() {
    var gen = ++S.gen;
    S.siap = false; S.langkah = 'antara';
    Aud.sfx('fanfare', Math.min(3, S.putaran + 1));
    UI.toast(U.fmt(STR.l1.selesaiPutaran, { n: S.putaran + 1 }));
    Tween.wait(1600).then(function () {
      if (!hidup(gen)) return;
      S.putaran++;
      if (S.putaran < 3) mulaiPutaran(); else selesai();
    });
  }
  function selesai() {
    var gen = ++S.gen, detik = Math.round((performance.now() - S.mulai) / 1000);
    var bintang = S.petunjuk3 === 0 ? 3 : (S.petunjuk3 <= 2 ? 2 : 1);
    S.langkah = 'selesai';
    Save.catatLevel(1, { selesai: true, bintang: bintang, petunjuk3: S.petunjuk3, detik: detik });
    S.lapisKartu.innerHTML = '';
    wajah('sorak');
    Aud.sfx('fanfare', 3);
    S.H.instruksi(STR.l1.selesai);
    Promise.all([Voice.selesai(), Tween.wait(1800)]).then(function () { if (hidup(gen)) Scenes.go('hasil', { level: 1, bintang: bintang }); });
  }
  /* isyarat 8 detik: tunjuk langkah berikutnya, bukan jawabannya */
  function isyarat() {
    if (!S.siap) return null;
    if (S.langkah === 'kenalan') return S.lanjut.style.display === 'none' ? null : S.lanjut;
    if (S.langkah === 'dengar') return document.querySelector('[data-id="dengar-lagi"]');
    if (S.langkah === 'cocok') { var k = S.kartu || sisaKartu()[0]; return k ? S.kartuEl[k] : null; }
    return null;
  }

  Scenes.add('level1', {
    enter: function (root) {
      S = { hidup: true, gen: 0, putaran: 0, langkah: '', dikenal: {}, petunjuk3: 0, mulai: performance.now(), siap: false, itemEl: {}, kartuEl: {} };
      Aud.musik('kafe');
      /* gambar dapur (aset.js): jendela saji ada di gambarnya, jadi kusen SVG tidak dipakai dan Kak Lala terpotong oleh konter */
      var gDapur = Seni.gambar('latarDapur');
      var latar = U.h('img', 'lapis-gambar' + (gDapur ? ' latar-gambar' : '')); latar.alt = '';
      if (gDapur) latar.src = gDapur;
      else Seni.panggang('dapur', 1280, 720, Seni.latarDapur()).then(function (u) { latar.src = u; });
      root.appendChild(latar);
      var lapis = U.h('div', 'lapis');
      lapis.innerHTML = Seni.svg(1280, 720, '<clipPath id="klip-lala">' + (gDapur ? '<rect x="300" y="112" width="640" height="320"/>' : '<rect x="340" y="104" width="600" height="290"/>') + '</clipPath><g clip-path="url(#klip-lala)" id="tokoh-l1"></g>');
      root.appendChild(lapis);
      S.lala = Kafe.tokoh(lapis.querySelector('#tokoh-l1'), 'lala', 420, gDapur ? 128 : 116, 0.92);
      var depan = U.h('img', 'lapis-gambar'); depan.alt = '';
      if (gDapur) Seni.panggang('konterEtalase', 1280, 720, Seni.konter({ etalase: true })).then(function (u) { depan.src = u; });
      else Seni.panggang('kusen', 1280, 720, Seni.kusenDapur() + Seni.konter({ etalase: true })).then(function (u) { depan.src = u; });
      root.appendChild(depan);
      S.lapisItem = U.h('div', 'lapis-item'); root.appendChild(S.lapisItem);
      S.lapisKartu = U.h('div', 'lapis-kartu'); root.appendChild(S.lapisKartu);
      S.B = UI.balon(root, { x: 650, y: 130, w: 380, h: 136, nama: Seni.TOKOH.lala.nama, ekor: 'kiri', ekorPos: 56, onDengar: ulangi });
      S.lanjut = Input.button(STR.tombol.lanjut, 'utama', lanjut, { x: 1030, y: 452, w: 220, h: 84, font: 34, id: 'lanjut' });
      S.lanjut.style.display = 'none';
      root.appendChild(S.lanjut);
      S.H = UI.hud(root, { level: 1, chip: 'menu', jeda: { ulangi: function () { Scenes.go('level1'); } } });
      S.H.cangkir(0, 12); S.H.chip('0/12');
      UI.idle.atur(isyarat);
      mulaiPutaran();
    },
    exit: function () { S.hidup = false; },
    uji: {
      keadaan: function () {
        return { langkah: S.langkah, putaran: S.putaran, siap: !!S.siap, dikenal: jumlahKenal(), petunjuk3: S.petunjuk3, target: S.target || '', kartu: S.kartu || '' };
      },
      benar: function () {
        if (S.langkah === 'kenalan') return ['lanjut'];
        if (S.langkah === 'dengar') return ['item-' + S.target];
        if (S.langkah === 'cocok') { var k = sisaKartu()[0]; return k ? (S.kartu === k ? ['item-' + k] : ['kata-' + k, 'item-' + k]) : []; }
        return [];
      },
      salah: function () {
        if (S.langkah === 'dengar') return ['item-' + Object.keys(S.itemEl).filter(function (k) { return k !== S.target; })[0]];
        if (S.langkah === 'cocok') { var s = sisaKartu(); return s.length < 2 ? [] : ['kata-' + s[0], 'item-' + s[1]]; }
        return [];
      }
    }
  });
})();
