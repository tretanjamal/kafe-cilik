/* Toko: kerangka level pelanggan (L2-L5), GDD bagian 9, 10, dan 14.
   Latar, papan menu berharga, pelanggan masuk dan keluar, balon dengan mode mendengar, kartu kalimat, struk, nampan,
   papan angka, kas, tingkat adaptif, dan alur 6 pelanggan dengan paling banyak 2 pelanggan ulang di akhir level.
   Tiap level hanya menulis langkah layanannya sendiri (fungsi layani). */
(function (root) {
  var PELANGGAN = ['sinta', 'hendra', 'maya', 'dimas'];
  function esc(s) { return UI.esc(s); }
  function satu(a) { return a[Math.floor(Math.random() * a.length)]; }

  var Toko = {
    /* o: level, bawah ('etalase' | 'laci'), tingkat {min, maks, awal}, jumlah (pelanggan, bawaan 6), maksUlang (bawaan 2),
       antrean (L5: papan menu diganti antrean pelanggan kecil di kiri) */
    bangun: function (root, o) {
      var T = { root: root, level: o.level, hidup: true, gen: 0, nomor: 0, tepatAwal: 0, petunjuk3: 0, ulang: [], mulai: performance.now(), misAwal: JSON.parse(JSON.stringify(Save.data.miskonsepsi)) };
      T.jumlahPel = o.jumlah || 6; T.maksUlang = o.maksUlang == null ? 2 : o.maksUlang;
      T.adaptif = new Adaptif(o.tingkat.min, o.tingkat.maks, o.tingkat.awal);
      var seni = U.h('div', 'lapis');
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarDinding() + (o.antrean ? '<g class="antrean"></g>' : Seni.g('translate(16 100)', Seni.papanMenu(280, 326))) + '<g class="tokoh-pelanggan"></g>');
      root.appendChild(seni);
      T.svgPel = seni.querySelector('.tokoh-pelanggan');
      T.svgAntrean = seni.querySelector('.antrean');
      T.konterImg = U.h('img', 'lapis-gambar'); T.konterImg.alt = '';
      root.appendChild(T.konterImg);
      Toko.aturKonter(T, o.bawah);
      if (!o.antrean) T.papan = Toko.papanHarga(root);
      T.lapisKerja = U.h('div', 'lapis-item'); root.appendChild(T.lapisKerja);
      /* L2 dan L3: balon tinggi untuk kalimat pesanan; L4 pendek karena di bawahnya ada garis bilangan */
      T.B = UI.balon(root, { x: 562, y: 104, w: 330, h: o.level === 4 ? 156 : 300, kelas: o.level === 4 ? '' : 'balon-lebar', nama: ' ', ekor: 'kiri', ekorPos: 60, onDengar: function (pelan) { Toko.dengarLagi(T, pelan); } });
      T.B.sembunyi();
      T.H = UI.hud(root, { level: o.level, chip: 'kas', jeda: { ulangi: function () { Scenes.go('level' + o.level); } } });
      T.H.chip(Seni.rp(Save.data.kas));
      T.H.cangkir(0, T.jumlahPel);
      T.urut = U.shuffle(Math.random, PELANGGAN);
      return T;
    },
    /* konter dipanggang sekali per jenis: 'etalase' (konter pendek dan etalase kaca) atau 'laci' (L5 berganti di tengah layanan) */
    aturKonter: function (T, bawah) {
      if (T.bawah === bawah) return;
      T.bawah = bawah;
      Seni.panggang(bawah === 'etalase' ? 'konterEtalase' : 'konterLaci', 1280, 720, bawah === 'etalase' ? Seni.konter({ etalase: true }) : Seni.konter()).then(function (u) { if (T.bawah === bawah) T.konterImg.src = u; });
    },
    hidup: function (T, gen) { return T.hidup && Scenes.name === 'level' + T.level && (gen == null || gen === T.gen); },

    /* papan menu berharga (HTML di atas bingkai kayu) */
    papanHarga: function (root) {
      var el = U.h('div', 'isi-menu');
      el.style.cssText = 'left:32px;top:116px;width:248px;height:292px';
      el.setAttribute('data-cek', 'papan menu');
      el.innerHTML = '<div class="judul-menu">' + esc(STR.toko.judulMenu) + '</div>' + MENU.daftar.map(function (it) {
        return '<div class="baris" data-item="' + it.id + '"><span>' + esc(it.nama) + '</span><span class="harga">' + Seni.rp(window.HARGA[it.id]) + '</span></div>';
      }).join('');
      root.appendChild(el);
      return {
        el: el,
        sorot: function (ids) { Array.prototype.forEach.call(el.querySelectorAll('.baris'), function (b) { b.classList.toggle('lingkar', ids.indexOf(b.dataset.item) >= 0); }); },
        sembunyikan: function (ids) { ids.forEach(function (id) { var h = el.querySelector('[data-item="' + id + '"] .harga'); h.textContent = '?'; h.classList.add('belum'); }); },
        tampilkan: function (id) { var h = el.querySelector('[data-item="' + id + '"] .harga'); h.textContent = Seni.rp(window.HARGA[id]); h.classList.remove('belum'); UI.lompat(h); }
      };
    },

    /* pelanggan masuk dari kanan dengan bunyi bel */
    masuk: function (T, nama) {
      if (T.pel) { T.pel.g.remove(); T.pel = null; }
      T.namaPel = nama;
      T.pel = Kafe.tokoh(T.svgPel, nama, 1000, 104, 1);
      T.B.el.querySelector('.nama-pelanggan').textContent = Seni.TOKOH[nama].nama;
      T.B.sembunyi();
      Aud.sfx('bel');
      return Tween.run(UI.kurangi ? 1 : 650, function (e) { T.pel.geser(1000 - 694 * e, 104); }, Ease.easeInOutCubic).then(function () { return T.B.muncul(); });
    },
    keluar: function (T) {
      T.B.sembunyi();
      if (!T.pel) return Promise.resolve();
      var p = T.pel;
      return Tween.run(UI.kurangi ? 1 : 500, function (e) { p.geser(306 + 760 * e, 104); }, Ease.easeInOutCubic).then(function () { p.g.remove(); if (T.pel === p) T.pel = null; });
    },
    /* pelanggan bicara (en-US). tampil false: mendengar dulu, tulisan muncul setelah suara selesai (brief keputusan 9) */
    bicara: function (T, teks, o) {
      o = o || {};
      var tampil = o.tampil !== false || Save.data.settings.teksLangsung || !UI.adaSuara('en-US');
      T.terakhir = { teks: teks, sorot: o.sorot };
      return Kafe.ucap(teks, { tokoh: T.namaPel, balon: T.B, wajah: T.pel, tampil: tampil }).then(function () {
        if (!tampil && Toko.hidup(T)) { T.B.tulis(teks); if (o.sorot) Toko.sorotFrasa(T, o.sorot); }
      });
    },
    dengarLagi: function (T, pelan) {
      if (!T.terakhir || !T.pel) return;
      Voice.stop();
      var t = T.terakhir.teks, o = { tokoh: T.namaPel, balon: T.B, wajah: T.pel };
      if (T.terakhir.sembunyi) o.tampil = false;
      (pelan ? Kafe.ucapPelan : Kafe.ucap)(t, o).then(function () { if (T.terakhir && T.terakhir.sorot && !T.terakhir.sembunyi) Toko.sorotFrasa(T, T.terakhir.sorot); });
    },
    /* menyorot frasa di balon (petunjuk tingkat 2: kata yang terlewat menyala) */
    sorotFrasa: function (T, frasa) {
      var kata = Array.prototype.slice.call(T.B.el.querySelectorAll('.kata')), cari = frasa.toLowerCase().split(/\s+/), teks = kata.map(function (k) { return k.textContent.toLowerCase().replace(/[.,?!]/g, ''); });
      for (var i = 0; i + cari.length <= teks.length; i++) {
        if (cari.every(function (c, j) { return teks[i + j] === c.replace(/[.,?!]/g, ''); })) { for (var j = 0; j < cari.length; j++) kata[i + j].classList.add('terlewat'); }
      }
    },

    /* Kartu kalimat (sisi berbicara, brief keputusan 8). pilihan: [{teks, benar, umpan (teks instruksi bila salah), mis (kode miskonsepsi)}].
       letak: 'kanan' (3 kartu bertumpuk di kanan jalur adegan) atau 'bawah' (berderet di rak bawah).
       Selesai saat kartu benar dipilih; kartu benar dibacakan suara kasir. Hasil: jumlah salah sebelum benar. */
    kartu: function (T, pilihan, letak) {
      var salah = 0, wadah = U.h('div', 'deret-kartu deret-' + letak), acak = U.shuffle(Math.random, pilihan);
      T.lapisKerja.appendChild(wadah);
      T.kartuAktif = acak;
      return new Promise(function (selesai) {
        acak.forEach(function (p, i) {
          var b = U.h('button', 'kartu-kalimat', UI.ikon('gelembung', 30) + '<span>' + esc(p.teks) + (p.kecil ? '<small>' + esc(p.kecil) + '</small>' : '') + '</span>');
          b.type = 'button'; b.dataset.id = 'kartu-' + i;
          if (letak === 'kanan') { b.style.left = '906px'; b.style.top = (108 + i * 104) + 'px'; }
          else { b.style.left = (24 + i * 414) + 'px'; b.style.top = '606px'; }
          b.addEventListener('pointerdown', function () { Aud.init(); Aud.sfx('kertas'); });
          b.addEventListener('click', function () {
            if (!Toko.hidup(T) || b.disabled) return;
            Voice.stop(); UI.sembunyiTangan(true);
            if (p.benar) {
              Array.prototype.forEach.call(wadah.children, function (k) { k.disabled = true; });
              b.classList.add('dipilih');
              Aud.sfx('pilih');
              Voice.say(p.ucap || p.teks, { tokoh: 'kasir', lang: 'en-US' }).then(function () {
                wadah.remove(); T.kartuAktif = null;
                selesai(salah);
              });
              return;
            }
            salah++;
            Aud.sfx('bad'); UI.goyang(b);
            if (p.mis) Save.catatMis(p.mis);
            if (T.pel) T.pel.eks('berpikir');
            T.H.instruksi(p.umpan || STR.toko.kartuSalah, false);
            if (salah >= 2) {
              if (T.terakhir && T.terakhir.sembunyi) { T.terakhir.sembunyi = false; T.B.tulis(T.terakhir.teks); }
              var benar = wadah.querySelector('[data-benar="1"]');
              if (benar) UI.tunjuk(benar, { fy: 0.5 });
              if (salah === 2) T.petunjuk3++;
            }
          });
          if (p.benar) b.dataset.benar = '1';
          wadah.appendChild(b);
          Kafe.muncul(b, i * 80);
        });
      });
    },
    /* kas bertambah sebesar total belanja */
    tambahKas: function (T, n) {
      var lama = Save.data.kas;
      Save.data.kas += n; Save.save();
      Aud.sfx('kaching');
      return UI.hitungNaik(T.H.chipNilai, lama, Save.data.kas, Seni.rp, 800).then(function () { Aud.sfx('koin'); });
    },
    /* nampan pesanan di konter: gambar tiap porsi; onTap(id) bila porsi diketuk (L2) */
    nampan: function (T, isi, onTap) {
      if (T.nampanEl) T.nampanEl.remove();
      /* L2 memakai konter pendek (ada etalase di bawahnya), jadi nampan dan porsinya lebih kecil */
      var pendek = T.level === 2 || T.nampanPendek, tinggi = pendek ? 110 : 150, pw = pendek ? 62 : 78, ph = pendek ? 52 : 65;
      var el = U.h('div', 'nampan-pesanan');
      el.style.height = tinggi + 'px';
      el.innerHTML = Seni.svg(270, tinggi, Seni.nampan(270, tinggi, Seni.terang(Seni.W.kayu, 0.55), Seni.W.kayu));
      T.lapisKerja.appendChild(el);
      T.nampanEl = el;
      var porsi = [];
      isi.forEach(function (b) { for (var k = 0; k < b.n; k++) porsi.push(b.id); });
      porsi.forEach(function (id, i) {
        var p = U.h('button', 'porsi', Seni.svg(pw, ph, Seni.makanan(id), { vb: '0 0 120 100' }));
        p.style.width = pw + 'px'; p.style.height = ph + 'px';
        p.type = 'button'; p.dataset.id = 'nampan-' + id + '-' + i; p.dataset.item = id;
        p.setAttribute('aria-label', Bahasa.item(id).nama);
        var kolom = i % 3, baris = Math.floor(i / 3);
        p.style.left = (pendek ? 26 + kolom * 76 : 20 + kolom * 80 + (porsi.length > 3 && baris === 1 ? 40 : 0)) + 'px';
        p.style.top = (pendek ? 4 + baris * 48 : 12 + baris * 64) + 'px';
        if (onTap) p.addEventListener('click', function () { onTap(id, p); }); else p.tabIndex = -1;
        el.appendChild(p);
      });
      return el;
    },
    /* struk: baris item; L4 dengan harga dan total, L3 tanpa total sampai dijawab */
    struk: function (T, isi, o) {
      o = o || {};
      if (T.strukEl) T.strukEl.remove();
      var el = U.h('div', 'struk-toko');
      el.innerHTML = Seni.svg(354, 160, Seni.struk(354, 160)) + '<div class="isi-struk" data-cek="struk">' + isi.map(function (b) {
        return '<div class="baris" data-item="' + b.id + '"><span>' + b.n + ' x ' + esc(Bahasa.item(b.id).nama) + '</span><span class="sub">' + (o.harga ? Seni.rp(window.HARGA[b.id] * b.n) : '') + '</span></div>';
      }).join('') + '<div class="baris total"><span>' + esc(STR.toko.total) + '</span><span class="nilai-total">' + (o.total != null ? Seni.rp(o.total) : esc(STR.toko.belumTotal)) + '</span></div></div>';
      T.lapisKerja.appendChild(el);
      T.strukEl = el;
      return el;
    },

    /* Penjumlahan bertahap di struk (petunjuk L3, GDD bagian 10): harga tiap baris muncul satu per satu dengan bunyi,
       baris yang sedang dihitung menyala. denganTotal: total ikut ditulis (petunjuk tingkat 3). */
    strukBertahap: function (T, isi, denganTotal) {
      var el = T.strukEl, rantai = Promise.resolve();
      if (!el) return rantai;
      Array.prototype.forEach.call(el.querySelectorAll('.baris'), function (b) { b.classList.remove('menyala'); });
      isi.forEach(function (b, i) {
        rantai = rantai.then(function () { return Tween.wait(i ? 420 : 120); }).then(function () {
          if (!Toko.hidup(T) || T.strukEl !== el) return;
          var baris = el.querySelector('.baris[data-item="' + b.id + '"]'), sub = baris && baris.querySelector('.sub');
          if (!sub) return;
          Array.prototype.forEach.call(el.querySelectorAll('.baris'), function (k) { k.classList.toggle('menyala', k === baris); });
          sub.textContent = Seni.rp(window.HARGA[b.id] * b.n);
          Aud.sfx('koin'); UI.lompat(sub);
        });
      });
      return rantai.then(function () { return Tween.wait(420); }).then(function () {
        if (!Toko.hidup(T) || T.strukEl !== el) return;
        Array.prototype.forEach.call(el.querySelectorAll('.baris'), function (k) { k.classList.remove('menyala'); });
        if (!denganTotal) return;
        var t = el.querySelector('.nilai-total');
        t.textContent = Seni.rp(Kasir.total(isi, window.HARGA)); t.parentNode.classList.add('menyala');
        Aud.sfx('good'); UI.lompat(t);
      });
    },

    /* miskonsepsi yang paling sering muncul selama level ini (untuk saran "Ayo latih lagi" di layar hasil) */
    misTerbanyak: function (T) {
      var terbaik = '', n = 0;
      Object.keys(Save.data.miskonsepsi).forEach(function (k) {
        var d = Save.data.miskonsepsi[k] - (T.misAwal[k] || 0);
        if (d > n) { n = d; terbaik = k; }
      });
      return terbaik;
    },

    /* Alur level: 6 pelanggan + paling banyak 2 pelanggan ulang. layani(T, info) -> Promise<{tepat}> */
    jalankan: function (T, layani) {
      function berikut() {
        if (!Toko.hidup(T)) return;
        var ulang = T.nomor >= T.jumlahPel;
        if (ulang && !T.ulang.length) { Toko.selesai(T); return; }
        var info = ulang ? { tingkat: T.ulang.shift(), ulang: true } : { tingkat: T.nomor === 0 ? T.adaptif.min : T.adaptif.t, ulang: false };
        if (T.nomor === 0 && T.level === 2) info.tingkat = 1;
        info.nomor = T.nomor;
        info.nama = T.urut[T.nomor % T.urut.length];
        T.nomor++;
        layani(T, info).then(function (r) {
          if (!Toko.hidup(T)) return;
          if (!info.ulang) {
            if (r.tepat) T.tepatAwal++;
            else if (T.ulang.length < T.maksUlang) T.ulang.push(info.tingkat);
            T.adaptif.catat(r.tepat);
            T.H.cangkir(Math.min(T.jumlahPel, T.nomor), T.jumlahPel);
          }
          return Toko.keluar(T);
        }).then(function () { if (Toko.hidup(T)) Tween.wait(300).then(berikut); });
      }
      berikut();
    },
    selesai: function (T) {
      var bintang = T.hitungBintang ? T.hitungBintang() : (T.tepatAwal >= 5 ? 3 : (T.tepatAwal >= 3 ? 2 : 1)), detik = Math.round((performance.now() - T.mulai) / 1000);
      Save.catatLevel(T.level, { selesai: true, bintang: bintang, petunjuk3: T.petunjuk3, detik: detik });
      Aud.sfx('fanfare', 3);
      T.H.instruksi(STR.toko.selesai);
      T.H.potret('sorak');
      Promise.all([Voice.selesai(), Tween.wait(1500)]).then(function () { if (Toko.hidup(T)) Scenes.go('hasil', { level: T.level, bintang: bintang, tip: T.tipKhusus ? T.tipKhusus() : Toko.misTerbanyak(T) }); });
    },
    /* layani dengan langkah-langkah berurutan; tiap langkah mengembalikan janji */
    puji: function (T) {
      T.H.instruksi(satu(STR.l1.pujian), false);
      T.H.potret('sorak');
      if (T.pel) T.pel.eks('sorak');
      Aud.sfx('good');
    }
  };
  root.Toko = Toko;
})(window);
