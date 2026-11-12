/* Hook 10 detik (GDD bagian 3), hanya saat Level 1 dipilih pertama kali: bel pintu, Bu Sinta memesan panekuk, murid mengetuknya,
   panekuk melompat ke nampan, Bu Sinta senang, kas menghitung naik, lampu gantung menyala, lalu Level 1 dimulai. */
(function () {
  var S = {};
  function hidup() { return S.hidup && Scenes.name === 'hook'; }

  function ketuk(id, el) {
    if (!S.siap || !hidup()) return;
    if (id !== 'panekuk') {
      Voice.stop();
      Aud.sfx('bad'); UI.goyang(el); S.sinta.eks('berpikir');
      S.H.instruksi(STR.hook.salah);
      UI.tunjuk(S.item.panekuk, { fy: 0.3 });
      Kafe.ucap(Bahasa.besar(Bahasa.isi(UNGKAPAN.hook.ulang, 'panekuk')), { tokoh: 'sinta', balon: S.B, wajah: S.sinta });
      return;
    }
    S.siap = false; Voice.stop(); UI.sembunyiTangan(true);
    el.classList.remove('denyut-item');
    Aud.sfx('tuk');
    /* panekuk melompat ke nampan di konter */
    var terbang = U.h('div', 'terbang');
    terbang.innerHTML = Seni.svg(132, 110, Seni.makanan('panekuk'), { vb: '0 0 120 100' });
    terbang.style.cssText = 'position:absolute;left:' + el.style.left + ';top:568px;z-index:20;pointer-events:none';
    S.root.appendChild(terbang);
    el.style.visibility = 'hidden';
    var x0 = parseFloat(el.style.left), y0 = 568, x1 = 574, y1 = 438;
    Tween.run(480, function (e) {
      terbang.style.left = (x0 + (x1 - x0) * e) + 'px';
      terbang.style.top = (y0 + (y1 - y0) * e - Math.sin(e * Math.PI) * 120) + 'px';
    }, Ease.easeInOutCubic).then(function () {
      if (!hidup()) return;
      Aud.sfx('tuk');
      var p = UI.titik(terbang, 0.5); UI.ledak(p.x, p.y, 10);
      return Tween.wait(250);
    }).then(function () {
      if (!hidup()) return;
      /* nampan meluncur ke Bu Sinta */
      var n0 = 560;
      return Tween.run(420, function (e) {
        S.nampan.style.left = (n0 - 150 * e) + 'px';
        terbang.style.left = (x1 - 150 * e) + 'px';
        S.nampan.style.top = (452 - 14 * e) + 'px';
        terbang.style.top = (y1 - 14 * e) + 'px';
      }, Ease.easeInOutCubic);
    }).then(function () {
      if (!hidup()) return;
      S.sinta.eks('sorak'); S.H.potret('sorak');
      Aud.sfx('good'); Aud.sfx('kaching');
      var harga = window.HARGA.panekuk;
      UI.hitungNaik(S.H.chipNilai, 0, harga, Seni.rp, 800).then(function () { Aud.sfx('koin'); });
      /* lampu gantung pertama menyala */
      S.lampu.innerHTML = Seni.lampu(true);
      Aud.sfx('muncul');
      return Kafe.ucap(UNGKAPAN.hook.terima, { tokoh: 'sinta', balon: S.B, wajah: S.sinta });
    }).then(function () {
      if (!hidup()) return;
      S.H.instruksi(STR.hook.hebat);
      return Promise.all([Voice.selesai(), Tween.wait(1400)]);
    }).then(function () {
      if (!hidup()) return;
      Save.data.hook = true;
      Save.data.kas += window.HARGA.panekuk;
      Save.save();
      Scenes.go(Save.data.identitasDitanya ? 'level1' : 'identitas', { lanjut: 'level1' });
    });
  }

  Scenes.add('hook', {
    enter: function (root) {
      S = { hidup: true, siap: false, root: root, item: {} };
      Aud.musik('kafe');
      var seni = U.h('div', 'lapis');
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarDinding() + '<g id="lampu-hook" transform="translate(1110 96)">' + Seni.lampu(false) + '</g><g id="tokoh-hook"></g>');
      root.appendChild(seni);
      S.lampu = seni.querySelector('#lampu-hook');
      S.sinta = Kafe.tokoh(seni.querySelector('#tokoh-hook'), 'sinta', 1000, 104, 1);
      var konter = U.h('img', 'lapis-gambar');
      konter.alt = '';
      Seni.panggang('konterEtalase', 1280, 720, Seni.konter({ etalase: true })).then(function (url) { konter.src = url; });
      root.appendChild(konter);
      S.nampan = U.h('div', 'nampan-hook');
      S.nampan.innerHTML = Seni.svg(240, 110, Seni.nampan(240, 110, Seni.terang(Seni.W.kayu, 0.55), Seni.W.kayu));
      S.nampan.style.cssText = 'position:absolute;left:560px;top:452px';
      root.appendChild(S.nampan);
      ['panekuk', 'burger', 'roti', 'eskrim'].forEach(function (id, i) {
        S.item[id] = Kafe.item(root, id, Kafe.letakEtalase(4)[i], ketuk, { aria: Bahasa.item(id).nama });
      });
      S.B = UI.balon(root, { x: 600, y: 112, w: 360, h: 132, nama: Seni.TOKOH.sinta.nama, ekor: 'kiri', ekorPos: 58 });
      S.B.sembunyi();
      S.H = UI.hud(root, { level: 1, chip: 'kas', tanpaLevel: true, jeda: { ulangi: function () { Scenes.go('hook'); } } });
      S.H.chip(Seni.rp(0));
      /* bel berbunyi, Bu Sinta masuk dan memesan */
      Aud.sfx('bel');
      Tween.run(UI.kurangi ? 1 : 700, function (e) { S.sinta.geser(1000 - 660 * e, 104); }, Ease.easeInOutCubic).then(function () {
        if (!hidup()) return;
        return S.B.muncul();
      }).then(function () {
        if (!hidup()) return;
        S.siap = true;
        S.item.panekuk.classList.add('denyut-item');
        UI.tunjuk(S.item.panekuk, { fy: 0.3 });
        S.H.instruksi(STR.hook.ketuk, false);
        Kafe.ucap(Bahasa.isi(UNGKAPAN.hook.pesan, 'panekuk'), { tokoh: 'sinta', balon: S.B, wajah: S.sinta }).then(function () {
          if (hidup() && S.siap) UI.bacakan(STR.hook.ketuk);
        });
      });
      UI.idle.atur(function () { return S.siap ? S.item.panekuk : null; });
    },
    exit: function () { S.hidup = false; },
    uji: {
      keadaan: function () { return { langkah: 'hook', siap: !!S.siap }; },
      benar: function () { return ['item-panekuk']; },
      salah: function () { return ['item-burger']; }
    }
  });
})();
