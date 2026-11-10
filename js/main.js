/* Boot: simpanan, layar muat (huruf, lapisan diam yang dipanggang, daftar suara perangkat), lalu layar judul.
   Kait uji window.__test hanya aktif dengan ?test=1 dan tidak terlihat oleh murid. */
(function () {
  Save.load();
  bootStage();
  UI.applySettings();
  document.title = STR.judul.lengkap;
  document.getElementById('rotate-text').textContent = STR.putar;
  window.HARGA = Kasir.hargaSesi(Save.benihSesi());
  Muat.buka();

  function suaraSiap() {
    return new Promise(function (ok) {
      var ss = window.speechSynthesis;
      if (!ss || (ss.getVoices() || []).length) { ok(); return; }
      ss.addEventListener('voiceschanged', function () { ok(); });
      setTimeout(ok, 1200);
    });
  }
  var huruf = ["400 40px 'Lilita One'", '400 24px Andika', '700 24px Andika'].map(function (f) { return document.fonts.load(f).catch(function () { }); });
  Promise.all(huruf).then(function () {
    Muat.atur(0.4);
    return Promise.all([
      /* dapur dan kusen SVG hanya dipanggang bila gambar dapur (aset.js) tidak ada */
      Seni.gambar('latarDapur') ? null : Seni.panggang('dapur', 1280, 720, Seni.latarDapur()),
      Seni.gambar('latarDapur') ? null : Seni.panggang('kusen', 1280, 720, Seni.kusenDapur() + Seni.konter({ etalase: true })),
      Seni.panggang('konterEtalase', 1280, 720, Seni.konter({ etalase: true }))
    ]);
  }).then(function () {
    Muat.atur(0.8);
    return suaraSiap();
  }).then(function () {
    Muat.atur(1);
    return Muat.tunggu();
  }).then(function () {
    Muat.tutup();
    Scenes.go('judul');
  });

  /* lama bermain (untuk Ringkasan Guru), tidak dihitung saat tab tersembunyi atau di layar judul */
  setInterval(function () {
    if (Loop.paused || Stage.portrait || !Scenes.name || Scenes.name === 'judul') return;
    Save.data.detik++;
    if (Save.data.detik % 15 === 0) Save.save();
  }, 1000);

  if (U.TEST) {
    window.__test = {
      scene: function () { return Scenes.name; },
      fase: function () { var c = Scenes.cur; return c && c.uji ? (c.uji.keadaan().langkah || '') : ''; },
      keadaan: function () {
        var c = Scenes.cur, k = c && c.uji ? c.uji.keadaan() : {}, o = { scene: Scenes.name, busy: Scenes.busy, overlay: !!document.querySelector('.overlay') }, n;
        for (n in k) o[n] = k[n];
        o.siap = !!k.siap && !Scenes.busy;
        return o;
      },
      benar: function () { return Scenes.cur && Scenes.cur.uji ? Scenes.cur.uji.benar() : []; },
      salah: function () { return Scenes.cur && Scenes.cur.uji ? Scenes.cur.uji.salah() : []; },
      keLevel: function (n) { Scenes.go('level' + n); },
      aturSantai: function (b) { Save.data.settings.santai = !!b; Save.save(); },
      lewatiHook: function () { Save.data.hook = true; Save.save(); },
      simpanan: function () { return JSON.parse(JSON.stringify(Save.data)); },
      ucapan: function () { return Voice.log.slice(); },
      harga: function () { return window.HARGA; },
      pemeriksa: Bahasa.periksaKalimat,
      luap: function () { return UI.cekLuap(); }
    };
  }
})();
