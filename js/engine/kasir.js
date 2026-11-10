/* Kasir: harga sesi, generator pesanan, total, pengecoh, uang bayar, lompatan hitung naik, dan pemeriksa kembalian (GDD bagian 11).
   Semua angka kelipatan Rp500. Batas angka mengikuti brief bagian 4 dan tabel tingkat di GDD bagian 9. */
(function (root) {
  var UANG_KERTAS = [2000, 5000, 10000, 20000, 50000, 100000];
  var PECAHAN = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

  /* Harga tiap item: kelipatan Rp500 di dalam rentang MENU, diacak dari benih supaya sama selama satu sesi.
     Minimal MENU.minimalBulat harga berakhiran 000; bila acakan kurang, harga berakhiran 500 dibulatkan turun (tetap di dalam rentang). */
  function hargaSesi(benih) {
    var acak = U.rng(benih), h = {}, daftar = root.MENU.daftar;
    daftar.forEach(function (it) {
      var langkah = (it.max - it.min) / 500;
      h[it.id] = it.min + 500 * Math.floor(acak() * (langkah + 1));
    });
    var bulat = daftar.filter(function (it) { return h[it.id] % 1000 === 0; }).length;
    daftar.forEach(function (it) {
      if (bulat < root.MENU.minimalBulat && h[it.id] % 1000 !== 0 && h[it.id] - 500 >= it.min) { h[it.id] -= 500; bulat++; }
    });
    /* minimal 2 harga berakhiran 500 supaya tingkat L3 T2 dan L4 T2 selalu bisa dibentuk; harga bulat tetap minimal 6 */
    var lima = daftar.length - bulat;
    daftar.forEach(function (it) {
      if (lima >= 2 || bulat <= root.MENU.minimalBulat || h[it.id] % 1000 !== 0) return;
      if (h[it.id] + 500 <= it.max) h[it.id] += 500; else h[it.id] -= 500;
      lima++; bulat--;
    });
    return h;
  }
  function total(isi, harga) { return isi.reduce(function (s, b) { return s + harga[b.id] * b.n; }, 0); }
  function jumlahBarang(isi) { return isi.reduce(function (s, b) { return s + b.n; }, 0); }
  function sama(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    var k = function (x) { return x.map(function (q) { return q.id + q.n; }).sort().join(); };
    return k(a) === k(b);
  }
  function acakAntara(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function ambil(rnd, k, saring) { return U.shuffle(rnd, root.MENU.daftar.filter(saring || function () { return true; })).slice(0, k).map(function (it) { return it.id; }); }

  /* bentuk pesanan per level dan tingkat */
  function bentuk(level, t, harga, rnd) {
    var ids, n;
    if (level === 2) {
      if (t === 1) return [{ id: ambil(rnd, 1)[0], n: 1 }];
      if (t === 2) return rnd() < 0.5 ? [{ id: ambil(rnd, 1)[0], n: acakAntara(rnd, 2, 3) }] : ambil(rnd, 2).map(function (id) { return { id: id, n: 1 }; });
      if (t === 3) { ids = ambil(rnd, 2); n = acakAntara(rnd, 3, 4); var a = acakAntara(rnd, 1, Math.min(3, n - 1)); return [{ id: ids[0], n: a }, { id: ids[1], n: n - a }]; }
      ids = ambil(rnd, 3);
      return ids.map(function (id, i) { return { id: id, n: i === 0 && rnd() < 0.5 ? 2 : 1 }; });
    }
    if (level === 3) {
      if (t === 1) return ambil(rnd, 2, function (it) { return harga[it.id] % 1000 === 0; }).map(function (id) { return { id: id, n: 1 }; });
      if (t === 2) { ids = ambil(rnd, 2); return [{ id: ids[0], n: rnd() < 0.5 ? 2 : 1 }, { id: ids[1], n: 1 }]; }
      ids = ambil(rnd, 3);
      return ids.map(function (id, i) { return { id: id, n: i === 0 ? 2 : 1 }; });
    }
    /* level 5 Jam Sibuk: T1 1-2 jenis berjumlah 1, T2 2 jenis (kadang satu berjumlah 2), T3 3 jenis dengan satu berjumlah 2 */
    if (level === 5) {
      if (t === 1) return ambil(rnd, acakAntara(rnd, 1, 2)).map(function (id) { return { id: id, n: 1 }; });
      if (t === 2) { ids = ambil(rnd, 2); return [{ id: ids[0], n: rnd() < 0.5 ? 2 : 1 }, { id: ids[1], n: 1 }]; }
      ids = ambil(rnd, 3);
      var dua = rnd() < 0.5;
      return ids.map(function (id, i) { return { id: id, n: i === 0 || (i === 1 && dua) ? 2 : 1 }; });
    }
    /* level 4: jumlah jenis 1-3, jumlah per item 1-2 */
    ids = ambil(rnd, acakAntara(rnd, t === 1 ? 1 : 2, t === 1 ? 2 : 3));
    return ids.map(function (id) { return { id: id, n: t === 3 && rnd() < 0.35 ? 2 : 1 }; });
  }
  /* syarat sah tiap level dan tingkat */
  function sah(level, t, isi, harga) {
    var tot = total(isi, harga), ids = isi.map(function (b) { return b.id; });
    if (ids.some(function (id, i) { return ids.indexOf(id) !== i; })) return false;
    if (isi.some(function (b) { return b.n < 1 || b.n > 3; })) return false;
    if (level === 2) return jumlahBarang(isi) <= 5;
    if (level === 3) {
      if (t === 1) return isi.length === 2 && tot <= 30000 && isi.every(function (b) { return b.n === 1 && harga[b.id] % 1000 === 0; });
      if (t === 2) return isi.length === 2 && tot <= 40000 && (isi.some(function (b) { return b.n === 2; }) || isi.some(function (b) { return harga[b.id] % 1000 !== 0; }));
      return isi.length === 3 && tot <= 50000 && isi.some(function (b) { return b.n === 2; });
    }
    if (level === 4) {
      if (t === 1) return tot <= 20000 && tot % 1000 === 0;
      if (t === 2) return tot < 50000 && tot % 1000 === 500;
      return tot < 50000;
    }
    /* level 5: maks. 3 jenis dan 5 barang (muat di nampan), total maks. Rp100.000 */
    if (isi.length > 3 || jumlahBarang(isi) > 5) return false;
    if (t === 1) return isi.every(function (b) { return b.n === 1; }) && tot <= 100000;
    if (t === 2) return isi.length === 2 && tot <= 100000;
    return isi.length === 3 && tot <= 100000;
  }
  /* pesanan baru; tidak identik dengan pesanan sebelumnya */
  function pesanan(level, t, harga, rnd, lalu) {
    for (var coba = 0; coba < 1000; coba++) {
      var isi = bentuk(level, t, harga, rnd);
      if (isi.length && sah(level, t, isi, harga) && !sama(isi, lalu)) return { isi: isi, total: total(isi, harga) };
    }
    /* tingkat ini tidak bisa dibentuk dengan harga sesi: turun satu tingkat */
    if (t > 1) return pesanan(level, t - 1, harga, rnd, lalu);
    /* cadangan terakhir: satu item termurah */
    var murah = root.MENU.daftar.slice().sort(function (a, b) { return harga[a.id] - harga[b.id]; });
    var pilih = murah[0].id === (lalu && lalu[0] && lalu[0].id) ? murah[1].id : murah[0].id;
    return { isi: [{ id: pilih, n: 1 }], total: harga[pilih] };
  }

  /* Pengecoh total dari kesalahan nyata: lupa satu item, lupa mengalikan jumlah, -teen/-ty tertukar; cadangan selisih Rp500 atau Rp1.000.
     Mengembalikan 2 pengecoh {nilai, jenis}, semua berbeda, positif, kelipatan 500. */
  function pengecohTotal(isi, harga) {
    var benar = total(isi, harga), calon = [];
    var tukar = root.Bahasa.tukarTeenTy(benar);
    if (tukar) calon.push({ nilai: tukar, jenis: 'teen-ty' });
    if (isi.some(function (b) { return b.n > 1; })) calon.push({ nilai: isi.reduce(function (s, b) { return s + harga[b.id]; }, 0), jenis: 'lupa-kali' });
    if (isi.length > 1) isi.forEach(function (b) { calon.push({ nilai: benar - harga[b.id] * b.n, jenis: 'lupa-item' }); });
    [500, 1000, -500, -1000, 1500].forEach(function (d) { calon.push({ nilai: benar + d, jenis: 'selisih' }); });
    var hasil = [], dipakai = {};
    dipakai[benar] = true;
    calon.forEach(function (c) {
      if (hasil.length < 2 && c.nilai > 0 && c.nilai <= 100000 && c.nilai % 500 === 0 && !dipakai[c.nilai]) { dipakai[c.nilai] = true; hasil.push(c); }
    });
    return hasil;
  }
  /* pengecoh label harga Level 3: selalu memasangkan -teen dan -ty (Rp15.000, Rp50.000, Rp5.000) */
  function pengecohHarga(n) {
    var k = Math.floor(n / 1000), r = n % 1000, a, b;
    if (k >= 13 && k <= 19) { a = (k % 10) * 10000 + r; b = (k % 10) * 1000 + r; }
    else if (k < 10) { a = (10 + k) * 1000 + r; b = k * 10000 + r; }
    else { a = (k + 10) * 1000 + r; b = (k - 10) * 1000 + r; }
    var hasil = [a, b, n + 10000, n + 1000, n - 1000].filter(function (v, i, arr) { return v > 0 && v !== n && arr.indexOf(v) === i; });
    return hasil.slice(0, 2);
  }

  /* pecahan paling sedikit (serakah; optimal untuk deret 500, 1.000, 2.000, 5.000, ... 100.000), hanya untuk petunjuk dan uang pas */
  function pecahanMinimal(n, maks) {
    var hasil = [];
    PECAHAN.forEach(function (p) { if (p > (maks || 100000)) return; while (n >= p) { hasil.push(p); n -= p; } });
    return hasil;
  }
  /* Uang bayar realistis (GDD bagian 11): lebih sering satu lembar terkecil yang cukup, kadang dibulatkan ke atas dengan 1-2 lembar,
     dan uang pas bila diminta. Uang bayar selalu cukup dan paling banyak maks. */
  function uangBayar(tot, t, rnd, pas, maks) {
    maks = maks || 50000;
    if (pas) return pecahanMinimal(tot, maks);
    var satu = UANG_KERTAS.filter(function (u) { return u > tot && u <= maks; })[0];
    /* L5 T3: kadang pelanggan membayar belanja di atas Rp20.000 dengan satu lembar Rp100.000 */
    if (maks >= 100000 && t >= 3 && tot > 20000 && satu < 100000 && rnd() < 0.3) return [100000];
    var peluangBulat = t === 1 ? 0 : (t === 2 ? 0.3 : 0.5);
    if (rnd() < peluangBulat) {
      var bulat = Math.ceil((tot + 1) / 5000) * 5000;
      if (bulat < satu) {
        var lembar = pecahanMinimal(bulat, maks);
        if (lembar.length <= 2 && lembar.every(function (u) { return u >= 2000; })) return lembar;
      }
    }
    return [satu];
  }
  /* patokan hitung naik: dari total ke kelipatan 1.000, 5.000, 10.000 berikutnya, lalu ke uang bayar; patokan yang sudah tercapai dilewati */
  function lompatan(tot, bayar) {
    var t = [tot];
    [1000, 5000, 10000].forEach(function (m) {
      var v = Math.ceil(t[t.length - 1] / m) * m;
      if (v > t[t.length - 1] && v < bayar) t.push(v);
    });
    if (bayar > t[t.length - 1]) t.push(bayar);
    return t;
  }
  function jumlah(arr) { return arr.reduce(function (s, v) { return s + v; }, 0); }
  /* pemeriksa kembalian: kombinasi apa pun yang jumlahnya tepat diterima */
  function cekKembalian(isiNampan, harus) {
    var s = jumlah(isiNampan);
    return s === harus ? 'tepat' : (s < harus ? 'kurang' : 'lebih');
  }

  root.Kasir = {
    PECAHAN: PECAHAN, UANG_KERTAS: UANG_KERTAS, hargaSesi: hargaSesi, total: total, jumlahBarang: jumlahBarang, sama: sama, sah: sah, pesanan: pesanan,
    pengecohTotal: pengecohTotal, pengecohHarga: pengecohHarga, pecahanMinimal: pecahanMinimal, uangBayar: uangBayar, lompatan: lompatan,
    jumlah: jumlah, cekKembalian: cekKembalian
  };
  if (typeof module !== 'undefined') module.exports = root.Kasir;
})(typeof window !== 'undefined' ? window : globalThis);
