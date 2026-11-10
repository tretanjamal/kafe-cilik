/* Save: progres di localStorage (try/catch); tetap jalan bila penyimpanan diblokir. Tanpa data pribadi.
   Pola dari Lompat Waktu: data dibersihkan saat dimuat supaya simpanan lama atau rusak tidak membuat gim macet. */
(function (root) {
  var KEY = 'kafeCilik.v1';
  var memory = null;
  var SETEL = { senyap: false, musik: true, efek: true, suara: true, bacakan: true, teksLangsung: false, santai: false, kurangi: false };
  function fresh() {
    var s = {}, k;
    for (k in SETEL) s[k] = SETEL[k];
    return {
      settings: s,
      hook: false,        // hook 10 detik sudah diputar
      benih: 0,           // benih harga sesi; sesi = satu hari bermain
      tanggal: '',        // tanggal benih dibuat (YYYY-MM-DD)
      kas: 0,
      dekor: 0,           // jumlah hiasan kafe yang sudah diperlihatkan di Pilih Level
      murid: { nama: '', sekolah: '' },   // hanya untuk sertifikat; tidak dikirim ke mana pun
      identitasDitanya: false,
      sertifikat: 0,      // jumlah level selesai saat sertifikat terakhir diperlihatkan
      level: {},          // nomor -> { selesai, bintang, petunjuk3, detik }
      keterampilan: {},   // tag -> { kesempatan, benarAwal, salah }
      miskonsepsi: {},    // kode -> jumlah muncul
      detik: 0            // lama bermain total
    };
  }
  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function angka(v) { return typeof v === 'number' && isFinite(v) && v >= 0; }
  function clean(d) {
    var f = fresh(), k;
    if (!isObj(d)) return f;
    if (!isObj(d.settings)) d.settings = f.settings;
    for (k in f.settings) if (typeof d.settings[k] !== 'boolean') d.settings[k] = f.settings[k];
    for (k in d.settings) if (!(k in f.settings)) delete d.settings[k];
    if (typeof d.hook !== 'boolean') d.hook = false;
    ['benih', 'kas', 'detik', 'dekor', 'sertifikat'].forEach(function (n) { if (!angka(d[n])) d[n] = f[n]; });
    if (typeof d.tanggal !== 'string') d.tanggal = '';
    if (typeof d.identitasDitanya !== 'boolean') d.identitasDitanya = false;
    if (!isObj(d.murid)) d.murid = f.murid;
    ['nama', 'sekolah'].forEach(function (k) { d.murid[k] = typeof d.murid[k] === 'string' ? d.murid[k].slice(0, 40) : ''; });
    ['level', 'keterampilan', 'miskonsepsi'].forEach(function (n) { if (!isObj(d[n])) d[n] = {}; });
    Object.keys(d.level).forEach(function (n) {
      var v = d.level[n];
      if (!isObj(v) || !angka(v.bintang) || typeof v.selesai !== 'boolean') delete d.level[n];
    });
    Object.keys(d.keterampilan).forEach(function (t) {
      var v = d.keterampilan[t];
      if (!isObj(v) || !angka(v.kesempatan) || !angka(v.benarAwal) || !angka(v.salah)) delete d.keterampilan[t];
    });
    Object.keys(d.miskonsepsi).forEach(function (t) { if (!angka(d.miskonsepsi[t])) delete d.miskonsepsi[t]; });
    return d;
  }
  function slot(tag) { return Save.data.keterampilan[tag] || (Save.data.keterampilan[tag] = { kesempatan: 0, benarAwal: 0, salah: 0 }); }
  function hariIni() { var t = new Date(); return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }

  var Save = {
    data: fresh(),
    load: function () {
      try {
        var raw = root.localStorage.getItem(KEY);
        if (raw) Save.data = clean(JSON.parse(raw));
      } catch (e) { Save.data = memory || fresh(); }
    },
    save: function () {
      memory = Save.data;
      try { root.localStorage.setItem(KEY, JSON.stringify(Save.data)); } catch (e) { /* diblokir: abaikan */ }
    },
    /* satu kesempatan keterampilan selesai; langsung = benar pada coba pertama */
    catat: function (tag, langsung) { var s = slot(tag); s.kesempatan++; if (langsung) s.benarAwal++; },
    catatSalah: function (tag) { slot(tag).salah++; },
    catatMis: function (kode) { if (kode) Save.data.miskonsepsi[kode] = (Save.data.miskonsepsi[kode] || 0) + 1; },
    /* status untuk Ringkasan Guru (GDD bagian 4) */
    status: function (tag) {
      var s = Save.data.keterampilan[tag];
      if (!s || !s.kesempatan) return 'belum';
      var r = s.benarAwal / s.kesempatan;
      if (r >= 0.8 && s.kesempatan >= 5) return 'dikuasai';
      return r >= 0.5 ? 'berkembang' : 'latihan';
    },
    selesai: function (n) { var l = Save.data.level[n]; return !!(l && l.selesai); },
    terbuka: function (n) { return n <= 1 || Save.selesai(n - 1); },
    catatLevel: function (n, isi) {
      var lama = Save.data.level[n] || { selesai: false, bintang: 0, petunjuk3: 0, detik: 0 };
      Save.data.level[n] = {
        selesai: lama.selesai || !!isi.selesai,
        bintang: Math.max(lama.bintang, isi.bintang || 0),
        petunjuk3: isi.petunjuk3 || 0,
        detik: isi.detik || 0
      };
      Save.save();
    },
    /* harga diacak sekali per hari bermain; melanjutkan di hari yang sama memakai harga yang sama */
    benihSesi: function () {
      var h = hariIni();
      if (!Save.data.benih || Save.data.tanggal !== h) {
        Save.data.benih = 1 + Math.floor(Math.random() * 2147483000);
        Save.data.tanggal = h;
        Save.save();
      }
      return Save.data.benih;
    },
    /* Murid baru di perangkat yang sama: progres dihapus, pengaturan tetap */
    newStudent: function () { var s = Save.data.settings; Save.data = fresh(); Save.data.settings = s; Save.save(); }
  };
  root.Save = Save;
})(typeof window !== 'undefined' ? window : globalThis);
