/* UI: komponen bersama Kafe Cilik. Pola overlay, sakelar, dan Pengaturan dari Lompat Waktu; tampilan mengikuti GDD bagian 12.
   Isi: pengaturan dan senyap, ikon pojok, HUD layar bermain, overlay (Pengaturan, Jeda, Informasi, Buku Menu, Ringkasan Guru),
   toast, balon dialog dengan sorot kata, tangan penunjuk dan isyarat 8 detik, partikel, hitung naik, dan bintang. */
(function (root) {
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function stage() { return document.getElementById('stage'); }
  /* titik di panggung untuk elemen atau {x, y}; fy = letak vertikal (0 atas, 1 bawah) */
  function titik(sasaran, fy) {
    if (!sasaran) return null;
    if (sasaran.x != null && !sasaran.getBoundingClientRect) return sasaran;
    var r = sasaran.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return Stage.toLocal(r.left + r.width / 2, r.top + r.height * (fy == null ? 0.4 : fy));
  }

  var UI = {
    prefersReduced: !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches),
    kurangi: false,
    esc: esc,
    titik: titik,
    applySettings: function () {
      var s = Save.data.settings;
      Aud.setMuted(s.senyap); Aud.setBus('musik', s.musik); Aud.setBus('sfx', s.efek);
      UI.kurangi = s.kurangi || UI.prefersReduced;
      document.body.classList.toggle('kurangi-gerak', UI.kurangi);
      Tween.speed = UI.kurangi ? 0.4 : (U.TEST ? 0.3 : 1);
    },
    ikon: function (nama, ukuran, arg) { return Seni.ikon(nama, ukuran || 40, arg); },
    tombolIkon: function (nama, aria, onTap, o) {
      o = o || {}; o.aria = aria;
      return Input.button(UI.ikon(nama, o.ukuran || 40), 'ketiga ikon ' + (o.cls || ''), onTap, o);
    },
    /* suara perangkat untuk bahasa ini tersedia? */
    adaSuara: function (lang) { return Voice.available() && !!Voice.voice(lang, 'w'); },
    /* instruksi bahasa Indonesia dibacakan bila diizinkan; tanpa suara id-ID tidak ada jeda kosong */
    bacakan: function (teks, paksa) {
      if (!teks || (!paksa && !Save.data.settings.bacakan) || !UI.adaSuara('id-ID')) return Promise.resolve();
      return Voice.say(teks, { lang: 'id-ID' });
    },

    /* ikon pojok kanan atas layar judul: suara, layar penuh, pengaturan. Mengembalikan fungsi pembersih. */
    pojok: function (parent) {
      var s = Save.data.settings, x = 1196, fs = null;
      var atur = UI.tombolIkon('gerigi', STR.ikon.pengaturan, function () { UI.pengaturan(); }, { x: x, y: 16, id: 'pengaturan' });
      if (FS.supported()) {
        x -= 80;
        fs = UI.tombolIkon('layarPenuh', STR.ikon.layarPenuh, function () { FS.toggle(function () { UI.toast(STR.ikon.fsDitolak); }); }, { x: x, y: 16, id: 'layar-penuh' });
      }
      x -= 80;
      var snd = UI.tombolIkon(s.senyap ? 'senyap' : 'suara', '', function () { s.senyap = !s.senyap; Save.save(); UI.applySettings(); segar(); }, { x: x, y: 16, id: 'suara' });
      function segar() {
        Input.label(snd, UI.ikon(s.senyap ? 'senyap' : 'suara'));
        snd.setAttribute('aria-label', s.senyap ? STR.ikon.suaraMati : STR.ikon.suaraNyala);
        if (fs) fs.setAttribute('aria-label', FS.isFull() ? STR.ikon.keluarPenuh : STR.ikon.layarPenuh);
      }
      [snd, fs, atur].forEach(function (b) { if (b) parent.appendChild(b); });
      segar();
      FS.onChange(segar);
      return function () { FS.offChange(segar); };
    },

    /* HUD layar bermain (GDD bagian 14): papan level, papan instruksi, chip, Buku Menu, Jeda */
    hud: function (parent, o) {
      var h = { teks: '' };
      var pl = U.h('div', 'papan-hud papan-level');
      pl.style.cssText = 'left:20px;top:14px;width:300px;height:72px';
      pl.innerHTML = '<div class="judul-level">' + esc(U.fmt(STR.level.judul, { n: o.level, nama: STR.level.nama[o.level] })) + '</div><div class="cangkir-pelanggan"></div>';
      if (!o.tanpaLevel) parent.appendChild(pl);
      h.cangkir = function (isi, total) {
        var t = '';
        for (var i = 0; i < total; i++) t += UI.ikon('cangkir', total > 6 ? 21 : 26, i < isi);
        pl.querySelector('.cangkir-pelanggan').innerHTML = t;
      };
      var ins = U.h('div', 'papan-hud instruksi');
      ins.style.cssText = 'left:336px;top:12px;width:560px;height:80px';
      ins.innerHTML = '<span class="potret">' + Seni.potret('lala', 64) + '</span><p class="teks-instruksi" aria-live="polite" data-cek="instruksi"></p>';
      ins.appendChild(UI.tombolIkon('dengar', STR.ikon.dengarInstruksi, function () { Voice.stop(); UI.bacakan(h.teks, true); }, { id: 'dengar-instruksi', cls: 'alir' }));
      parent.appendChild(ins);
      h.instruksi = function (teks, bacakan) {
        h.teks = teks;
        var el = ins.querySelector('.teks-instruksi');
        el.textContent = teks;
        el.classList.remove('padat');
        if (el.scrollHeight > el.clientHeight + 2) el.classList.add('padat');
        return bacakan === false ? Promise.resolve() : UI.bacakan(teks);
      };
      h.potret = function (eks) { ins.querySelector('.potret').innerHTML = Seni.potret('lala', 64, { eks: eks }); };
      var chip = U.h('div', 'papan-hud chip-kas');
      chip.style.cssText = 'left:912px;top:16px;width:196px;height:64px';
      chip.innerHTML = UI.ikon(o.chip === 'menu' ? 'buku' : 'koin', 34) + '<span class="kolom"><span class="label-kas">' +
        (o.chip === 'menu' ? STR.menuDikenal : STR.kas) + '</span><span class="nilai-kas" data-cek="chip"></span></span>';
      parent.appendChild(chip);
      h.chipNilai = chip.querySelector('.nilai-kas');
      h.chip = function (teks) { h.chipNilai.textContent = teks; UI.pasChip(h.chipNilai); };
      parent.appendChild(UI.tombolIkon('buku', STR.ikon.bukuMenu, function () { UI.bukuMenu(); }, { x: 1120, y: 14, id: 'buku-menu' }));
      parent.appendChild(UI.tombolIkon('jeda', STR.ikon.jeda, function () { UI.jeda(o.jeda || {}); }, { x: 1196, y: 14, id: 'jeda' }));
      return h;
    },

    /* panel modal bergaya kertas menu. Mengembalikan {el, body, panel, close} */
    overlay: function (judul, cls) {
      var ov = U.h('div', 'overlay'), panel = U.h('div', 'panel kertas ' + (cls || '')), opener = document.activeElement;
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', judul);
      document.getElementById('scene-root').inert = true;
      document.querySelectorAll('.overlay').forEach(function (x) { x.inert = true; });
      /* pemberitahuan singkat tidak boleh menutupi panel */
      document.querySelectorAll('.toast').forEach(function (x) { x.parentNode.removeChild(x); });
      panel.innerHTML = '<div class="pita-kepala">' + esc(judul) + '</div>';
      var body = U.h('div', 'isi-panel'); panel.appendChild(body); ov.appendChild(panel);
      stage().appendChild(ov);
      UI.sembunyiTangan(true);
      /* animasi CSS, bukan tween: panel Jeda dan Buku Menu menjeda tween tepat sesudah dibuka */
      if (!UI.kurangi) panel.classList.add('panel-muncul');
      var api = {
        el: ov, body: body, panel: panel,
        close: function () {
          if (ov.parentNode) ov.parentNode.removeChild(ov);
          var rest = document.querySelectorAll('.overlay');
          if (rest.length) rest[rest.length - 1].inert = false; else document.getElementById('scene-root').inert = false;
          if (opener && opener.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
          if (api.onClose) api.onClose();
        }
      };
      return api;
    },
    closeOverlays: function () {
      document.querySelectorAll('.overlay, .toast').forEach(function (x) { x.parentNode.removeChild(x); });
      UI._p.list = [];
      document.getElementById('scene-root').inert = false;
      UI.idle.fn = null;
      UI.sembunyiTangan(true);
    },
    tombolTutup: function (o, teks) {
      var b = Input.button(teks || STR.tombol.tutup, 'kedua alir lebar', function () { o.close(); }, { id: 'tutup' });
      o.body.appendChild(b);
      setTimeout(function () { b.focus({ preventScroll: true }); }, 30);
      return b;
    },
    /* sakelar Nyala/Mati dengan label teks (bukan hanya warna) */
    barisSakelar: function (label, get, set, id, catatan, nonaktif) {
      var row = U.h('div', 'baris-sakelar');
      row.innerHTML = '<span class="label-sakelar">' + esc(label) + (catatan ? '<small>' + esc(catatan) + '</small>' : '') + '</span>';
      var b = Input.button('', 'sakelar alir', function () { set(!get()); cat(); }, { id: id, aria: label });
      function cat() {
        var on = get();
        b.classList.toggle('nyala', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        Input.label(b, '<span class="kenop"></span><span class="teks-sakelar">' + (on ? STR.pengaturan.nyala : STR.pengaturan.mati) + '</span>');
      }
      if (nonaktif) b.disabled = true;
      cat(); row.appendChild(b);
      return row;
    },
    pengaturan: function (onClose) {
      var T = STR.pengaturan, s = Save.data.settings, o = UI.overlay(T.judul, 'panel-pengaturan');
      var grid = U.h('div', 'grid-sakelar');
      function simpan() { Save.save(); UI.applySettings(); }
      grid.appendChild(UI.barisSakelar(T.musik, function () { return s.musik; }, function (v) { s.musik = v; simpan(); }, 'sw-musik'));
      grid.appendChild(UI.barisSakelar(T.efek, function () { return s.efek; }, function (v) { s.efek = v; simpan(); }, 'sw-efek'));
      grid.appendChild(UI.barisSakelar(T.suara, function () { return s.suara; }, function (v) { s.suara = v; simpan(); if (!v) Voice.stop(); }, 'sw-suara', T.suaraCatatan));
      grid.appendChild(UI.barisSakelar(T.bacakan, function () { return s.bacakan; }, function (v) { s.bacakan = v; simpan(); }, 'sw-bacakan'));
      grid.appendChild(UI.barisSakelar(T.teksLangsung, function () { return s.teksLangsung; }, function (v) { s.teksLangsung = v; simpan(); }, 'sw-teks', T.teksCatatan));
      grid.appendChild(UI.barisSakelar(T.santai, function () { return s.santai; }, function (v) { s.santai = v; simpan(); }, 'sw-santai', T.santaiCatatan));
      grid.appendChild(UI.barisSakelar(T.kurangi, function () { return s.kurangi || UI.prefersReduced; }, function (v) { s.kurangi = v; simpan(); }, 'sw-kurangi', UI.prefersReduced ? T.kurangiCatatan : '', UI.prefersReduced));
      var rowId = U.h('div', 'baris-sakelar');
      rowId.innerHTML = '<span class="label-sakelar">' + esc(T.identitas) + '<small>' + esc(T.identitasCatatan) + '</small></span>';
      rowId.appendChild(Input.button(esc(T.ubah), 'ketiga alir hapus', function () { UI.identitas(); }, { id: 'ubah-identitas' }));
      grid.appendChild(rowId);
      var row = U.h('div', 'baris-sakelar'), yakin = false;
      row.innerHTML = '<span class="label-sakelar">' + esc(T.muridBaru) + '<small>' + esc(T.muridBaruCatatan) + '</small></span>';
      var hapus = Input.button(T.hapus, 'ketiga alir hapus', function () {
        if (!yakin) { yakin = true; Input.label(hapus, T.yakin); return; }
        Save.newStudent(); Scenes.go('judul');
      }, { id: 'murid-baru' });
      row.appendChild(hapus); grid.appendChild(row);
      o.body.appendChild(grid);
      UI.tombolTutup(o);
      o.onClose = onClose;
      return o;
    },
    /* menu jeda: permainan dan suara berhenti selama panel terbuka */
    jeda: function (opsi) {
      var T = STR.jeda, o = UI.overlay(T.judul, 'panel-jeda');
      Voice.jeda(); Tween.paused = true;
      function tombol(label, cls, id, fn) { var b = Input.button(label, cls + ' alir lebar', fn, { id: id }); o.body.appendChild(b); return b; }
      var lanjut = tombol(T.lanjut, 'utama', 'jeda-lanjut', function () { o.close(); });
      tombol(T.ulangi, 'kedua', 'jeda-ulangi', function () { Voice.buangTertahan(); o.close(); if (opsi.ulangi) opsi.ulangi(); });
      tombol(T.pilihLevel, 'ketiga', 'jeda-pilih-level', function () { Voice.buangTertahan(); o.close(); Scenes.go('pilihLevel'); });
      tombol(T.pengaturan, 'ketiga', 'jeda-pengaturan', function () { UI.pengaturan(); });
      tombol(T.beranda, 'ketiga', 'jeda-beranda', function () { Voice.buangTertahan(); o.close(); Scenes.go('judul'); });
      o.onClose = function () { Tween.paused = false; Voice.lanjutTertahan(); };
      setTimeout(function () { lanjut.focus({ preventScroll: true }); }, 30);
      return o;
    },
    /* Informasi (Tujuan, Cara Main, Misi) dan Referensi (Sumber Materi, Kecerdasan Artifisial) bertab seperti Buku Menu,
       Pengembang berisi foto dan data yang sama dengan gim lain kreator. Tanpa tautan keluar. */
    info: function (jenis) {
      var D = STR.info[jenis], o = UI.overlay(D.judul, 'panel-info panel-' + jenis), HAL = null;
      function daftar(a, tag) { return '<' + (tag || 'ul') + ' class="daftar-info">' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</' + (tag || 'ul') + '>'; }
      function baris(a) { return '<div class="baris-info">' + a.map(function (r) { return '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>'; }
      function pustaka(r) { return '<p class="pustaka">' + esc(r[0]) + ' <i>' + esc(r[1]) + '</i> ' + esc(r[2]) + '</p>'; }
      if (jenis === 'info') HAL = {
        tujuan: function () { return '<p class="sorot-info">' + esc(D.pengantar) + '</p><p><b>' + esc(D.tujuanJudul) + '</b></p><p class="tujuan-info">' + esc(D.tujuan) + '</p><p class="kecil-info">' + esc(D.meta) + '</p>'; },
        cara: function () { return daftar(D.cara, 'ol') + '<p class="kecil-info">' + esc(D.caraCatatan) + '</p>'; },
        misi: function () { return '<p><b>' + esc(D.misiJudul) + '</b></p>' + baris(D.misi) + '<p class="sorot-info">' + esc(D.misiCatatan) + '</p>'; }
      };
      if (jenis === 'referensi') HAL = {
        sumber: function () { return '<p><b>' + esc(D.sumberPengantar) + '</b></p>' + D.sumber.map(pustaka).join('') + '<p>' + esc(D.topik) + '</p><p class="kecil-info">' + esc(D.huruf) + '</p>'; },
        ka: function () { return '<p>' + esc(D.kaPengantar) + '</p>' + baris(D.ka) + '<p><b>' + esc(D.kaRujukanJudul) + '</b></p>' + pustaka(D.kaRujukan); }
      };
      if (!HAL) {
        /* beberapa pengembang, digeser dengan tombol panah kiri dan kanan (pola Describing Quantity) */
        var P = D.profil, ke = 0, wadah = U.h('div', 'geser-pengembang'), kartu = U.h('div', 'kartu-pengembang'), urutan = U.h('p', 'urutan-pengembang');
        kartu.setAttribute('data-cek', 'info pengembang');
        var tampil = function (i) {
          ke = (i + P.length) % P.length;
          var p = P[ke], foto = Seni.gambar(p.foto);
          kartu.innerHTML = '<div class="foto-pengembang">' + (foto ? '<img src="' + foto + '" alt="' + esc(p.fotoAlt) + '">' : Seni.potret('kasir', 180)) + '</div>' +
            '<div class="data-pengembang"><b class="nama-pengembang">' + esc(p.nama) + '</b>' + p.baris.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '<span>' + esc(D.tahun) + '</span></div>' +
            (p.daftar ? '<div class="prestasi"><b>' + esc(p.daftarJudul) + '</b>' + daftar(p.daftar) + '</div>' : '');
          kartu.classList.toggle('tanpa-daftar', !p.daftar);
          urutan.textContent = U.fmt(D.urutan, { n: ke + 1, t: P.length });
        };
        var kiri = UI.tombolIkon('panah', D.sebelumnya, function () { tampil(ke - 1); }, { id: 'pengembang-kiri', cls: 'panah-kiri alir' });
        var kanan = UI.tombolIkon('panah', D.berikutnya, function () { tampil(ke + 1); }, { id: 'pengembang-kanan', cls: 'alir' });
        wadah.appendChild(kiri); wadah.appendChild(kartu); wadah.appendChild(kanan);
        o.body.appendChild(wadah); o.body.appendChild(urutan);
        tampil(0);
        UI.tombolTutup(o);
        return o;
      }
      var tabs = U.h('div', 'tab-buku'), isi = U.h('div', 'teks-info isi-tab');
      isi.setAttribute('data-cek', 'info ' + jenis);
      var pilih = function (k) {
        isi.innerHTML = HAL[k]();
        Array.prototype.forEach.call(tabs.children, function (b) { var on = b.dataset.id === 'tab-' + k; b.classList.toggle('aktif', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      };
      Object.keys(HAL).forEach(function (k) {
        var b = Input.button(esc(D.tab[k]), 'ketiga alir tab', function () { pilih(k); }, { id: 'tab-' + k, h: 64, font: 24 });
        b.setAttribute('role', 'tab');
        tabs.appendChild(b);
      });
      tabs.setAttribute('role', 'tablist');
      var tutup = Input.button(esc(STR.tombol.tutup), 'kedua alir tab tutup-tab', function () { o.close(); }, { id: 'tutup', h: 64, font: 24 });
      tabs.appendChild(tutup);
      o.body.appendChild(tabs); o.body.appendChild(isi);
      pilih(Object.keys(HAL)[0]);
      setTimeout(function () { tutup.focus({ preventScroll: true }); }, 30);
      return o;
    },
    /* Isian nama dan sekolah (boleh dilewati). Hanya untuk sertifikat; tersimpan di perangkat ini saja. */
    identitas: function (onSelesai) {
      var I = STR.identitas, o = UI.overlay(I.judul, 'panel-identitas'), m = Save.data.murid || { nama: '', sekolah: '' };
      function isian(label, id, nilai, maks, contoh) {
        return '<label class="isian"><span>' + esc(label) + '</span><input type="text" data-id="' + id + '" maxlength="' + maks + '" autocomplete="off" spellcheck="false" placeholder="' + esc(contoh) + '" value="' + esc(nilai || '') + '"></label>';
      }
      o.body.insertAdjacentHTML('beforeend', '<p class="ajak-identitas">' + esc(I.ajak) + '</p>' + isian(I.nama, 'isi-nama', m.nama, 30, I.contohNama) +
        isian(I.sekolah, 'isi-sekolah', m.sekolah, 40, I.contohSekolah) + '<p class="kecil-info">' + esc(I.privasi) + '</p>');
      var inNama = o.body.querySelector('[data-id="isi-nama"]'), inSekolah = o.body.querySelector('[data-id="isi-sekolah"]');
      function bersih(v, maks) { return String(v || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, maks); }
      function selesai(simpan) {
        if (simpan) Save.data.murid = { nama: bersih(inNama.value, 30), sekolah: bersih(inSekolah.value, 40) };
        Save.data.identitasDitanya = true; Save.save();
        o.close();
        if (onSelesai) onSelesai();
      }
      var baris = U.h('div', 'baris-tombol');
      baris.appendChild(Input.button(esc(I.simpan), 'utama alir', function () { selesai(true); }, { w: 220, h: 72, font: 28, id: 'identitas-simpan' }));
      baris.appendChild(Input.button(esc(I.lewati), 'ketiga alir', function () { selesai(false); }, { w: 200, h: 72, font: 26, id: 'identitas-lewati' }));
      o.body.appendChild(baris);
      [inNama, inSekolah].forEach(function (el, i) {
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (i === 0) inSekolah.focus(); else selesai(true); } });
      });
      setTimeout(function () { inNama.focus({ preventScroll: true }); }, 80);
      return o;
    },
    /* Buku Menu bertab (GDD bagian 8): Makanan, Minuman (gambar, nama, arti, harga hari ini), Ungkapan, dan Angka
       (pasangan -teen/-ty dengan suku kata bertekanan dicetak tebal). Membuka Buku Menu menjeda permainan. */
    bukuMenu: function () {
      var B = STR.buku, o = UI.overlay(B.judul, 'panel-buku');
      Voice.jeda(); Tween.paused = true;
      function dengar(teks, aria, id) {
        return UI.tombolIkon('dengar', aria, function () { Voice.stop(); Voice.say(teks, { tokoh: 'lala', lang: 'en-US', segera: true }); }, { id: id, cls: 'alir' });
      }
      var tabs = U.h('div', 'tab-buku'), isi = U.h('div', 'isi-buku');
      function menu(putaran) {
        var grid = U.h('div', 'grid-menu');
        MENU.daftar.filter(function (it) { return putaran(it.putaran); }).forEach(function (it) {
          var sel = U.h('div', 'sel-menu');
          sel.innerHTML = Seni.svg(96, 80, Seni.makanan(it.id), { vb: '0 0 120 100' }) +
            '<b class="nama-menu">' + esc(it.nama) + '</b><span class="arti-menu">' + esc(it.arti) + '</span>';
          var baris = U.h('div', 'baris-harga', '<span class="harga-menu">' + Seni.rp(root.HARGA[it.id]) + '</span>');
          baris.appendChild(dengar(Bahasa.kalimatIni(it.id), U.fmt(B.dengar, { nama: it.nama }), 'buku-' + it.id));
          sel.appendChild(baris);
          grid.appendChild(sel);
        });
        return grid;
      }
      function ungkapan() {
        var daftar = U.h('div', 'daftar-ungkapan');
        B.ungkapan.forEach(function (u, k) {
          var r = U.h('div', 'baris-ungkapan', '<span><b>' + esc(u[0]) + '</b><small>' + esc(u[1]) + '</small></span>');
          r.appendChild(dengar(u[0], U.fmt(B.dengar, { nama: u[0] }), 'ungkapan-' + k));
          daftar.appendChild(r);
        });
        return daftar;
      }
      function angka() {
        var wadah = U.h('div', 'daftar-angka'), satu = 'one two three four five six seven eight nine'.split(' ');
        var pasangan = [[13, 'thir', 'teen', 30, 'thir', 'ty'], [14, 'four', 'teen', 40, 'for', 'ty'], [15, 'fif', 'teen', 50, 'fif', 'ty'], [16, 'six', 'teen', 60, 'six', 'ty'],
          [17, 'seven', 'teen', 70, 'seven', 'ty'], [18, 'eigh', 'teen', 80, 'eigh', 'ty'], [19, 'nine', 'teen', 90, 'nine', 'ty']];
        pasangan.forEach(function (q) {
          var r = U.h('div', 'baris-angka');
          r.innerHTML = '<span class="nilai">' + q[0] + '</span><span class="kata">' + esc(q[1]) + '<b>' + esc(q[2].toUpperCase()) + '</b></span>';
          r.appendChild(dengar(Bahasa.besar(q[1] + q[2]) + '.', q[1] + q[2], 'angka-' + q[0]));
          r.insertAdjacentHTML('beforeend', '<span class="nilai">' + q[3] + '</span><span class="kata"><b>' + esc(q[4].toUpperCase()) + '</b>' + esc(q[5]) + '</span>');
          r.appendChild(dengar(Bahasa.besar(q[4] + q[5]) + '.', q[4] + q[5], 'angka-' + q[3]));
          wadah.appendChild(r);
        });
        [[100, 'one hundred'], [1000, 'one thousand']].forEach(function (q) {
          var r = U.h('div', 'baris-angka', '<span class="nilai">' + Seni.angka(q[0]) + '</span><span class="kata">' + esc(q[1]) + '</span>');
          r.appendChild(dengar(Bahasa.besar(q[1]) + '.', q[1], 'angka-' + q[0]));
          wadah.appendChild(r);
        });
        wadah.insertAdjacentHTML('beforeend', '<p class="catatan-angka">' + esc(B.angkaCatatan) + '</p>');
        return wadah;
      }
      var HALAMAN = { makanan: function () { return menu(function (p) { return p < 3; }); }, minuman: function () { return menu(function (p) { return p === 3; }); }, ungkapan: ungkapan, angka: angka };
      Object.keys(HALAMAN).forEach(function (k, i) {
        var b = Input.button(esc(B.tab[k]), 'ketiga alir tab', function () { pilih(k); }, { id: 'tab-' + k, h: 64, font: 24 });
        b.setAttribute('role', 'tab');
        tabs.appendChild(b);
      });
      function pilih(k) {
        isi.innerHTML = '';
        isi.appendChild(HALAMAN[k]());
        Array.prototype.forEach.call(tabs.children, function (b) { var on = b.dataset.id === 'tab-' + k; b.classList.toggle('aktif', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      }
      tabs.setAttribute('role', 'tablist');
      /* Tutup di deret tab supaya isi tab terpanjang tetap muat di panel */
      var tutup = Input.button(esc(STR.tombol.tutup), 'kedua alir tab tutup-tab', function () { o.close(); }, { id: 'tutup', h: 64, font: 24 });
      tabs.appendChild(tutup);
      o.body.appendChild(tabs); o.body.appendChild(isi);
      pilih('makanan');
      setTimeout(function () { tutup.focus({ preventScroll: true }); }, 30);
      o.onClose = function () { Voice.stop(); Tween.paused = false; Voice.lanjutTertahan(); };
      return o;
    },
    /* Ringkasan untuk Guru: tanpa nama dan tanpa data pribadi */
    guru: function () {
      var G = STR.guru, o = UI.overlay(G.judul, 'panel-guru'), baris = '';
      ['kosakata', 'pesanan', 'angka-harga', 'ungkapan', 'total', 'kembalian'].forEach(function (t) {
        var k = Save.data.keterampilan[t], st = Save.status(t);
        baris += '<tr><td>' + esc(G.nama[t]) + '</td><td class="status-' + st + '">' + esc(G.status[st]) + '</td><td>' + (k ? k.benarAwal + ' / ' + k.kesempatan : '-') + '</td></tr>';
      });
      var p3 = 0, M = Save.data.miskonsepsi;
      function misHtml() {
        var k = Object.keys(M).sort(function (a, b) { return M[b] - M[a]; }).slice(0, 4);
        return k.length ? '<p>' + esc(U.fmt(G.misJudul, { daftar: k.map(function (x) { return (G.mis[x] || x) + ' (' + M[x] + ')'; }).join(', ') })) + '</p>' : '';
      }
      Object.keys(Save.data.level).forEach(function (n) { p3 += Save.data.level[n].petunjuk3 || 0; });
      o.body.insertAdjacentHTML('beforeend', '<div class="teks-guru" data-cek="guru">' +
        '<table><thead><tr><th>' + esc(G.kolomTag) + '</th><th>' + esc(G.kolomStatus) + '</th><th>' + esc(G.kolomBukti) + '</th></tr></thead><tbody>' + baris + '</tbody></table>' +
        misHtml() + '<p>' + esc(U.fmt(G.level, { daftar: [1, 2, 3, 4, 5].filter(function (n) { return Save.selesai(n); }).map(function (n) { return 'L' + n + ' (' + U.fmt(G.bintang, { n: Save.data.level[n].bintang }) + ')'; }).join(', ') || G.levelBelum })) + '</p>' +
        '<p>' + esc(U.fmt(G.petunjuk3, { n: p3 })) + ' &middot; ' + esc(U.fmt(G.santai, { s: Save.data.settings.santai ? STR.pengaturan.nyala : STR.pengaturan.mati })) +
        ' &middot; ' + esc(U.fmt(G.lama, { m: Math.round(Save.data.detik / 60) })) + '</p>' +
        '<p class="kecil">' + esc(G.dikuasaiAturan) + ' ' + esc(G.catatan) + '</p><p class="kecil">' + esc(G.cp) + '</p></div>');
      UI.tombolTutup(o);
      return o;
    },
    /* teks yang meluap dari kotaknya: elemen bertanda data-cek dan teks SVG bertanda data-maxw (dipakai uji) */
    cekLuap: function () {
      var hasil = [];
      Array.prototype.forEach.call(document.querySelectorAll('#stage [data-cek], #stage .tombol .badan'), function (el) {
        if (!el.offsetParent) return;
        if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 8) hasil.push((el.getAttribute('data-cek') || el.textContent.trim().slice(0, 30)) + ': ' + el.scrollWidth + 'x' + el.scrollHeight + ' > ' + el.clientWidth + 'x' + el.clientHeight);
        /* teks yang tumbuh melewati kotak wadahnya (balon, papan, kartu, struk) juga meluap walau tidak tergulir */
        var wadah = el.parentElement && el.parentElement.closest('.balon, .papan-hud, .kartu-kalimat, .struk-toko, .panel, .panel-hasil');
        if (wadah && wadah !== el) {
          var a = el.getBoundingClientRect(), b = wadah.getBoundingClientRect(), s = Stage.scale || 1;
          if (a.bottom > b.bottom + 2 * s || a.right > b.right + 2 * s) hasil.push((el.getAttribute('data-cek') || 'teks') + ': melewati wadah (bawah ' + Math.round((a.bottom - b.bottom) / s) + ' px, kanan ' + Math.round((a.right - b.right) / s) + ' px)');
        }
      });
      Array.prototype.forEach.call(document.querySelectorAll('#stage text[data-maxw]'), function (t) {
        var w = t.getComputedTextLength(), m = +t.getAttribute('data-maxw');
        if (w > m) hasil.push('svg "' + t.textContent + '": ' + Math.round(w) + ' > ' + m);
      });
      return hasil;
    },
    toast: function (text) {
      document.querySelectorAll('.toast').forEach(function (x) { x.parentNode.removeChild(x); });
      var t = U.h('div', 'toast', esc(text));
      t.setAttribute('role', 'status');
      stage().appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
    },

    /* balon dialog. o: x, y, w, h, nama, ekor (kiri|bawah), ekorPos, onDengar(pelan). Kata yang diucapkan disorot. */
    balon: function (parent, o) {
      var el = U.h('div', 'balon balon-main' + (o.kelas ? ' ' + o.kelas : ''));
      el.style.cssText = 'left:' + o.x + 'px;top:' + o.y + 'px;width:' + o.w + 'px;height:' + o.h + 'px';
      el.innerHTML = (o.nama ? '<span class="nama-pelanggan">' + esc(o.nama) + '</span>' : '') + '<p class="ucapan btxt" aria-live="polite" data-cek="balon"></p>';
      if (o.onDengar) {
        var tb = U.h('div', 'tombol-balon');
        tb.appendChild(UI.tombolIkon('dengar', STR.ikon.dengarLagi, function () { o.onDengar(false); }, { id: 'dengar-lagi', cls: 'alir' }));
        tb.appendChild(UI.tombolIkon('siput', STR.ikon.lebihPelan, function () { o.onDengar(true); }, { id: 'lebih-pelan', cls: 'alir' }));
        el.appendChild(tb);
      } else el.classList.add('tanpa-tombol');
      el.insertAdjacentHTML('beforeend', Seni.ekor(o.ekor || 'kiri'));
      var ekor = el.querySelector('.ekor');
      if ((o.ekor || 'kiri') === 'kiri') ekor.style.top = (o.ekorPos || 60) + 'px'; else ekor.style.left = (o.ekorPos || 100) + 'px';
      parent.appendChild(el);
      var p = el.querySelector('.ucapan');
      return {
        el: el,
        tulis: function (teks) {
          p.innerHTML = teks.split(/\s+/).map(function (w, i) { return '<span class="kata" data-i="' + i + '">' + esc(w) + '</span>'; }).join(' ');
        },
        /* mode mendengar: tulisan disembunyikan sampai diizinkan */
        dengarkan: function () { p.innerHTML = '<span class="dengarkan">' + UI.ikon('dengar', 40) + '<span>? ? ?</span></span>'; },
        sorot: function (i) { Array.prototype.forEach.call(p.querySelectorAll('.kata'), function (k, j) { k.classList.toggle('aktif', j === i); }); },
        muncul: function () {
          el.style.visibility = 'visible';
          if (UI.kurangi) return Promise.resolve();
          return Tween.run(300, function (e) { el.style.transform = 'scale(' + (0.6 + 0.4 * e) + ')'; el.style.opacity = Math.min(1, e * 2); }, Ease.easeOutBack);
        },
        sembunyi: function () { el.style.visibility = 'hidden'; }
      };
    },

    /* tangan penunjuk: ujung telunjuk di titik sasaran. sumber 'idle' hilang saat murid bergerak. */
    tangan: null, sumberTangan: '',
    tunjuk: function (sasaran, o) {
      o = o || {};
      var p = titik(sasaran, o.fy);
      if (!p) return;
      if (!UI.tangan) {
        var G = Seni.gambar('tangan');
        UI.tangan = G ? U.h('div', 'tangan-penunjuk gambar', '<img alt="" src="' + G.src + '" style="left:' + (-G.ujung[0]) + 'px;top:' + (-G.ujung[1]) + 'px;width:' + G.w + 'px;height:' + G.h + 'px">')
          : U.h('div', 'tangan-penunjuk', Seni.svg(120, 140, Seni.g('translate(40 124)', Seni.g(null, Seni.tangan(), 'tunjuk'))));
        UI.tangan.setAttribute('aria-hidden', 'true');
      }
      stage().appendChild(UI.tangan);
      /* SVG: sasaran di dalam balon, tangan datang dari bawah supaya kalimat di atasnya tetap terbaca */
      UI.tanganBawah = o.bawah != null ? o.bawah : !!(sasaran.closest && sasaran.closest('.balon'));
      UI.letakTangan(p.x, p.y);
      UI.tangan.classList.add('tampil');
      UI.sumberTangan = o.sumber || 'petunjuk';
    },
    /* ujung jari di (x, y). Gambar: badan tangan di kanan bawah ujung jari; dibalik ke atas bila sasaran di bagian bawah layar,
       dan ke kiri bila dekat tepi kanan, supaya tangan tidak keluar panggung dan tidak menutupi kalimat di atas sasaran. */
    letakTangan: function (x, y) {
      var t = UI.tangan;
      if (!t) return;
      if (t.classList.contains('gambar')) {
        t.style.left = Math.round(x) + 'px'; t.style.top = Math.round(y) + 'px';
        t.style.transform = 'scale(' + (x > 1080 ? -1 : 1) + ',' + (y > 420 ? -1 : 1) + ')';
        return;
      }
      t.classList.toggle('bawah', !!UI.tanganBawah);
      t.style.left = Math.round(x - 40) + 'px';
      t.style.top = Math.round(UI.tanganBawah ? y - 16 : y - 124) + 'px';
    },
    sembunyiTangan: function (semua) {
      if (!UI.tangan) return;
      if (semua || UI.sumberTangan === 'idle') { UI.tangan.classList.remove('tampil'); UI.sumberTangan = ''; }
    },
    /* isyarat bila 8 detik tanpa aksi (CLAUDE.md bagian 4). fn mengembalikan elemen yang ditunjuk atau null. */
    idle: {
      fn: null, t: 0,
      atur: function (fn) { UI.idle.fn = fn; UI.idle.reset(); },
      reset: function () { UI.idle.t = performance.now(); UI.sembunyiTangan(false); },
      cek: function () {
        var I = UI.idle;
        if (!I.fn || Loop.paused || Tween.paused || Scenes.busy || document.querySelector('.overlay')) return;
        if (Voice.sibuk()) { I.t = performance.now(); return; }
        if (UI.sumberTangan === 'petunjuk') return;
        if (performance.now() - I.t > 8000 && UI.sumberTangan !== 'idle') { var el = I.fn(); if (el) UI.tunjuk(el, { sumber: 'idle' }); }
      }
    },

    /* partikel kecil saat benar: satu kanvas untuk semua (GDD bagian 15) */
    _p: { kanvas: null, ctx: null, list: [], jalan: false },
    ledak: function (x, y, n) {
      if (UI.kurangi) return;
      var P = UI._p, warna = [Seni.W.mangga, Seni.W.pandan, Seni.W.jambu, Seni.W.krem];
      if (!P.kanvas) {
        P.kanvas = U.h('canvas', 'kanvas-partikel'); P.kanvas.width = 1280; P.kanvas.height = 720;
        P.ctx = P.kanvas.getContext('2d');
      }
      if (!P.kanvas.parentNode) stage().appendChild(P.kanvas);
      for (var i = 0; i < (n || 14); i++) {
        var a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 260;
        P.list.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 180, umur: 0, maks: 0.7 + Math.random() * 0.4, r: 5 + Math.random() * 6, w: warna[i % warna.length], b: i % 3 === 0 });
      }
      if (P.jalan) return;
      P.jalan = true;
      var akhir = performance.now();
      (function tick(ts) {
        var dt = Math.min(0.05, (ts - akhir) / 1000); akhir = ts;
        var c = P.ctx;
        c.clearRect(0, 0, 1280, 720);
        if (!Loop.paused) P.list.forEach(function (q) { q.umur += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 520 * dt; });
        P.list = P.list.filter(function (q) { return q.umur < q.maks; });
        P.list.forEach(function (q) {
          var k = 1 - q.umur / q.maks;
          c.globalAlpha = Math.min(1, k * 1.5);
          c.fillStyle = q.w; c.strokeStyle = Seni.W.tinta; c.lineWidth = 2.5;
          c.beginPath();
          if (q.b) { for (var j = 0; j < 10; j++) { var rr = j % 2 ? q.r * 0.45 : q.r * 1.2, aa = j * Math.PI / 5 - Math.PI / 2; c.lineTo(q.x + rr * Math.cos(aa), q.y + rr * Math.sin(aa)); } c.closePath(); }
          else c.arc(q.x, q.y, q.r * 0.7, 0, Math.PI * 2);
          c.fill(); c.stroke();
        });
        c.globalAlpha = 1;
        if (P.list.length) requestAnimationFrame(tick); else { P.jalan = false; c.clearRect(0, 0, 1280, 720); }
      })(akhir);
    },
    /* nilai kas makin panjang seiring permainan: huruf mengecil supaya tetap di dalam chip */
    pasChip: function (el) {
      var n = el.textContent.length;
      el.style.fontSize = (n <= 8 ? 28 : (n <= 9 ? 25 : (n <= 10 ? 22 : 20))) + 'px';
    },
    /* angka menghitung naik dengan bunyi detak */
    hitungNaik: function (el, dari, ke, fmt, ms) {
      var lalu = dari;
      el.textContent = fmt(dari);
      return Tween.run(ms || 700, function (e) {
        var v = Math.round(dari + (ke - dari) * e);
        if (v !== lalu) { lalu = v; el.textContent = fmt(v); if (el.classList.contains('nilai-kas')) UI.pasChip(el); Aud.sfx('tick', 1 + e * 0.5); }
      }, Ease.easeOutCubic).then(function () { el.textContent = fmt(ke); if (el.classList.contains('nilai-kas')) UI.pasChip(el); });
    },
    /* goyang lembut untuk jawaban salah */
    goyang: function (el) {
      if (UI.kurangi) return Promise.resolve();
      return Tween.run(380, function (e, k) { el.style.translate = (Math.sin(k * Math.PI * 5) * 9 * (1 - k)).toFixed(1) + 'px 0'; }, Ease.linear).then(function () { el.style.translate = ''; });
    },
    /* lompatan kecil untuk jawaban benar */
    lompat: function (el) {
      if (UI.kurangi) return Promise.resolve();
      return Tween.run(420, function (e, k) { el.style.translate = '0 ' + (-Math.sin(k * Math.PI) * 18).toFixed(1) + 'px'; el.style.scale = (1 + Math.sin(k * Math.PI) * 0.08).toFixed(3); }, Ease.linear)
        .then(function () { el.style.translate = ''; el.style.scale = ''; });
    }
  };
  document.addEventListener('pointerdown', function () { UI.idle.reset(); }, true);
  document.addEventListener('keydown', function () { UI.idle.reset(); }, true);
  setInterval(function () { UI.idle.cek(); }, 500);
  root.UI = UI;
})(window);
