/* Pustaka seni SVG Kafe Cilik (berasal dari mockup Fase 0, mockup/seni.js).
   Arah seni: docs/GDD.md bagian 12 ("Kafe Pagi Hangat"). Datar dua cel: satu bayangan, cahaya dari kiri atas.
   Garis luar Tinta Kopi 4 px dengan ujung dan sambungan bulat. Semua fungsi mengembalikan string SVG.
   Tanpa emoji. Gambar ChatGPT dari js/data/aset.js dipakai bila terdaftar (makanan dan latar); tanpa entri, SVG ini cadangannya. */
var Seni = (function (root) {
  'use strict';

  var W = {
    tinta: '#3B2314', krem: '#FFF5E4', mangga: '#FFB627', pandan: '#3FAE8C',
    jambu: '#F27A7D', kayu: '#C0723E', papan: '#2E4A42', persik: '#FFDDB5', putih: '#FFFFFF'
  };
  /* Warna uang mainan: pengecualian berdasar isi, diredam supaya senada (GDD bagian 12). */
  var UANG = { 500: '#D8DBD6', 1000: '#D8DBD6', 2000: '#B9B6C6', 5000: '#C99A66', 10000: '#B790D8', 20000: '#8FCB86', 50000: '#7EB6E6', 100000: '#F08A84' };
  var FJ = "'Lilita One', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
  var FI = "'Andika', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
  var L = 4;          // tebal garis luar saat ini; potret kecil memakai garis lebih tebal
  var nomor = 0;

  /* ---------- Alat dasar ---------- */
  function id(p) { nomor += 1; return 'sn' + (p || '') + nomor; }
  function n(v) { return Math.round(v * 10) / 10; }
  function rgb(h) { var v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
  function campur(a, b, t) {
    var x = rgb(a), y = rgb(b), i, v, s = '#';
    for (i = 0; i < 3; i++) { v = Math.round(x[i] + (y[i] - x[i]) * t).toString(16); s += v.length < 2 ? '0' + v : v; }
    return s;
  }
  function gelap(h, t) { return campur(h, W.tinta, t == null ? 0.25 : t); }
  function terang(h, t) { return campur(h, W.krem, t == null ? 0.4 : t); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function gabung() {
    var o = {}, i, k;
    for (i = 0; i < arguments.length; i++) for (k in arguments[i]) if (Object.prototype.hasOwnProperty.call(arguments[i], k)) o[k] = arguments[i][k];
    return o;
  }
  function angka(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function rp(v) { return 'Rp' + angka(v); }

  function elips(cx, cy, rx, ry) {
    if (ry == null) ry = rx;
    return 'M' + n(cx - rx) + ' ' + n(cy) + 'a' + n(rx) + ' ' + n(ry) + ' 0 1 0 ' + n(2 * rx) + ' 0a' + n(rx) + ' ' + n(ry) + ' 0 1 0 ' + n(-2 * rx) + ' 0Z';
  }
  function kotak(x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    if (!r) return 'M' + n(x) + ' ' + n(y) + 'h' + n(w) + 'v' + n(h) + 'h' + n(-w) + 'Z';
    var a = 'A' + n(r) + ' ' + n(r) + ' 0 0 1 ';
    return 'M' + n(x + r) + ' ' + n(y) + 'H' + n(x + w - r) + a + n(x + w) + ' ' + n(y + r) +
      'V' + n(y + h - r) + a + n(x + w - r) + ' ' + n(y + h) +
      'H' + n(x + r) + a + n(x) + ' ' + n(y + h - r) +
      'V' + n(y + r) + a + n(x + r) + ' ' + n(y) + 'Z';
  }
  /* Bentuk berisi dengan garis luar. */
  function bentuk(d, isi, o) {
    o = o || {};
    var lb = o.lebar == null ? L : o.lebar;
    return '<path d="' + d + '" fill="' + (isi || 'none') + '"' +
      (lb ? ' stroke="' + (o.garis || W.tinta) + '" stroke-width="' + n(lb) + '" stroke-linejoin="round" stroke-linecap="round"' : '') +
      (o.attr || '') + '/>';
  }
  function garis(d, warna, lebar, o) {
    o = o || {};
    return '<path d="' + d + '" fill="none" stroke="' + (warna || W.tinta) + '" stroke-width="' + n(lebar || L) + '" stroke-linecap="round" stroke-linejoin="round"' + (o.attr || '') + '/>';
  }
  /* Dua cel: isi bayangan penuh, lalu salinan terang yang digeser ke kiri atas dan dipotong bentuk aslinya,
     sehingga tersisa satu bulan sabit bayangan di kanan bawah. */
  function cel(d, warna, o) {
    o = o || {};
    var k = id('c'), gs = o.geser || [-7, -6];
    var s = '<clipPath id="' + k + '"><path d="' + d + '"/></clipPath>' +
      '<path d="' + d + '" fill="' + (o.bayang || gelap(warna, 0.2)) + '"/>' +
      '<g clip-path="url(#' + k + ')"><path d="' + d + '" fill="' + warna + '" transform="translate(' + gs[0] + ' ' + gs[1] + ')"/></g>';
    if (o.lebar !== 0) s += bentuk(d, 'none', { lebar: o.lebar, garis: o.garis });
    return s;
  }
  /* Bayangan pelat: padat tanpa blur, geser 6 px ke bawah, Tinta Kopi 30%. */
  function pelat(d, geser) { return '<path d="' + d + '" fill="rgba(59,35,20,0.3)" transform="translate(0 ' + (geser || 6) + ')"/>'; }
  /* Lengan dan pegangan: garis tebal bergaris luar. */
  function tungkai(d, warna, lebar) { return garis(d, W.tinta, lebar + 2 * L) + garis(d, warna, lebar); }
  function teks(x, y, isi, o) {
    o = o || {};
    var a = ' x="' + n(x) + '" y="' + n(y) + '" font-family="' + (o.judul ? FJ : FI) + '" font-size="' + (o.ukuran || 24) + '"' +
      (o.tebal ? ' font-weight="700"' : '') + ' fill="' + (o.warna || W.tinta) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.spasi ? ' letter-spacing="' + o.spasi + '"' : '') +
      (o.maxw ? ' data-maxw="' + o.maxw + '"' : '');
    if (o.luar) a += ' stroke="' + (o.warnaLuar || W.tinta) + '" stroke-width="' + o.luar + '" stroke-linejoin="round" paint-order="stroke"';
    return '<text' + a + '>' + esc(isi) + '</text>';
  }
  function g(t, isi, kelas) { return '<g' + (t ? ' transform="' + t + '"' : '') + (kelas ? ' class="' + kelas + '"' : '') + '>' + isi + '</g>'; }
  function svg(w, h, isi, o) {
    o = o || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="' + (o.vb || ('0 0 ' + w + ' ' + h)) + '"' +
      (o.kelas ? ' class="' + o.kelas + '"' : '') + ' aria-hidden="true" focusable="false">' + isi + '</svg>';
  }

  /* ---------- Ikon (kotak 48x48, garis 4 px) ---------- */
  var IKON = {
    suara: function () {
      return bentuk('M7 19H15L26 10V38L15 29H7Z', W.mangga) + garis('M32 18Q37 24 32 30') + garis('M37 13Q45 24 37 35');
    },
    dengar: function () { return IKON.suara(); },
    /* gelembung bicara untuk kartu kalimat: kartu dipilih, bukan didengar dulu */
    gelembung: function () {
      return bentuk('M9 9H39Q44 9 44 14V29Q44 34 39 34H23L13 42V34H9Q4 34 4 29V14Q4 9 9 9Z', W.krem) +
        '<circle cx="15" cy="21.5" r="3" fill="' + W.tinta + '"/><circle cx="24" cy="21.5" r="3" fill="' + W.tinta + '"/><circle cx="33" cy="21.5" r="3" fill="' + W.tinta + '"/>';
    },
    senyap: function () { return bentuk('M7 19H15L26 10V38L15 29H7Z', campur(W.krem, W.tinta, 0.15)) + garis('M32 18L44 30M44 18L32 30'); },
    siput: function () {
      return bentuk('M4 38Q5 30 13 30H38Q45 30 45 38Z', terang(W.pandan, 0.3)) +
        garis('M10 31L7 20') + garis('M15 30L16 19') +
        '<circle cx="7" cy="19" r="3" fill="' + W.tinta + '"/><circle cx="16" cy="18" r="3" fill="' + W.tinta + '"/>' +
        bentuk(elips(30, 23, 12, 12), W.mangga) + garis('M25 23A5 5 0 1 1 30 28', W.tinta, 3);
    },
    layarPenuh: function () { return garis('M8 18V8H18') + garis('M30 8H40V18') + garis('M40 30V40H30') + garis('M18 40H8V30'); },
    gerigi: function () {
      var s = '', i, isi = terang(W.kayu, 0.35);
      for (i = 0; i < 8; i++) s += bentuk(kotak(20, 3, 8, 13, 2), isi, { attr: ' transform="rotate(' + (i * 45) + ' 24 24)"' });
      return s + bentuk(elips(24, 24, 14), isi) + bentuk(elips(24, 24, 5), W.krem);
    },
    buku: function () {
      return bentuk('M24 13Q15 7 5 9V38Q15 36 24 41Z', W.putih) + bentuk('M24 13Q33 7 43 9V38Q33 36 24 41Z', W.putih) +
        garis('M10 18Q16 17 20 20M10 25Q16 24 20 27M28 20Q32 17 38 18', W.tinta, 3) +
        bentuk('M32 9V22L35.5 19L39 22V8Z', W.jambu, { lebar: 3 });
    },
    /* panah kanan untuk menggeser kartu (dibalik dengan CSS untuk kiri) */
    panah: function () { return cel('M7 18H23V8L42 24L23 40V30H7Z', W.mangga, { geser: [-2, -2] }); },
    jeda: function () { return bentuk(kotak(12, 10, 9, 28, 3), W.tinta) + bentuk(kotak(27, 10, 9, 28, 3), W.tinta); },
    koin: function () {
      return cel(elips(24, 24, 18), W.mangga, { geser: [-3, -3] }) + bentuk(elips(24, 24, 10), 'none', { garis: gelap(W.mangga, 0.3), lebar: 3 });
    },
    gembok: function () {
      return garis('M16 23V16A8 8 0 0 1 32 16V23', W.tinta, 5) + cel(kotak(9, 22, 30, 21, 6), W.mangga, { geser: [-3, -3] }) +
        bentuk(elips(24, 31, 3.5), W.tinta, { lebar: 0 }) + garis('M24 33V37', W.tinta, 3);
    },
    bintang: function (penuh) {
      var d = 'M24 4L29.6 17.3L44 18.5L33 27.9L36.4 42L24 34.4L11.6 42L15 27.9L4 18.5L18.4 17.3Z';
      return penuh ? cel(d, W.mangga, { geser: [-3, -3], lebar: 3.5 }) : bentuk(d, campur(W.krem, W.tinta, 0.15), { lebar: 3.5 });
    },
    beranda: function () {
      return cel(kotak(12, 22, 24, 19, 3), W.krem, { geser: [-2, -2] }) + bentuk('M7 25L24 9L41 25', 'none', { lebar: 5 }) +
        bentuk(kotak(20, 29, 8, 12, 2), W.kayu, { lebar: 3 });
    },
    cangkir: function (penuh) {
      return garis('M34 21Q43 21 41 29Q39 36 31 35', W.tinta, 4) + bentuk('M8 15H36L33 38Q22 45 11 38Z', penuh ? W.mangga : W.krem) +
        (penuh ? garis('M17 9Q15 5 18 2M27 9Q25 5 28 2', W.tinta, 3) : '');
    }
  };
  function ikon(nama, ukuran, arg) { return svg(ukuran || 48, ukuran || 48, IKON[nama](arg), { vb: '0 0 48 48' }); }

  /* ---------- Alam: awan, burung, pohon, kota jauh ---------- */
  function awan(x, y, s) {
    var d = 'M-62 12Q-66 -10 -42 -14Q-38 -38 -12 -36Q2 -54 28 -40Q54 -46 56 -20Q74 -16 68 6Q64 20 50 20H-48Q-64 20 -62 12Z';
    return g('translate(' + x + ' ' + y + ') scale(' + s + ')', cel(d, W.putih, { geser: [0, -8], bayang: terang(W.persik, 0.3), lebar: 3.5 }));
  }
  function burung(x, y, s) { return g('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', garis('M-14 0Q-7 -9 0 0Q7 -9 14 0', W.tinta, 3)); }
  function pohon(x, y, s) {
    var isi = tungkai('M0 0V-74', gelap(W.kayu, 0.15), 14) +
      cel(elips(-28, -88, 34, 31), W.pandan) + cel(elips(24, -94, 36, 33), W.pandan) + cel(elips(-2, -126, 38, 34), W.pandan);
    return g('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', isi);
  }
  function kotaJauh(daftar, alas) {
    var s = '', warna = campur(W.persik, W.kayu, 0.12), jendela = terang(W.persik, 0.6);
    daftar.forEach(function (b) {
      var x = b[0], w = b[1], t = b[2], y = alas - t, xx, yy;
      s += bentuk(kotak(x, y, w, t + 24, b[3] ? 16 : 4), warna, { lebar: 3 });
      for (yy = y + 20; yy < alas - 30; yy += 40) for (xx = x + 16; xx < x + w - 24; xx += 36) s += '<rect x="' + xx + '" y="' + yy + '" width="14" height="18" rx="3" fill="' + jendela + '"/>';
    });
    return s;
  }

  /* ---------- Tokoh ----------
     Kotak lokal 240 lebar; kepala bulat besar (sekitar 1:2,5 dari badan yang terlihat).
     Ekspresi dari kode (alis, mata, mulut): senang, berpikir, kecewa, sorak, bicara. */
  var TOKOH = {
    sinta:  { nama: 'Bu Sinta', kulit: '#C68A5E', gaya: 'hijab', hijab: '#8CCAAF', baju: W.jambu },
    hendra: { nama: 'Pak Hendra', kulit: '#AD7247', gaya: 'pendek', rambut: '#2A1C14', baju: W.kayu, motif: true, kerah: W.krem, kacamata: true, kumis: true },
    lala:   { nama: 'Kak Lala', kulit: '#E0AC82', gaya: 'ikal', rambut: '#4A2A18', bandana: W.jambu, baju: W.krem, celemek: W.pandan },
    maya:   { nama: 'Kak Maya', kulit: '#E3B08A', gaya: 'kuncir', rambut: '#2A1C14', baju: W.mangga, kerah: W.krem, kursiRoda: true },
    dimas:  { nama: 'Dimas', kulit: '#A86B43', gaya: 'topi', rambut: '#2A1C14', topi: W.jambu, baju: W.krem, motif: 'garis', anak: true },
    kasir:  { nama: 'Kasir cilik', kulit: '#D19867', gaya: 'topi', rambut: '#2A1C14', topi: W.mangga, baju: W.krem, celemek: W.pandan, anak: true }
  };
  var HIJAB_BELAKANG = 'M30 262Q24 172 50 104Q72 34 120 32Q168 34 190 104Q216 172 210 262Q166 242 120 246Q74 242 30 262Z';

  function wajah(o, cx, ey, dx) {
    var s = '', e = o.eks, ki = cx - dx, ka = cx + dx, by = ey - 21, my = ey + 22, lw = L * 1.25, pipi = terang(W.jambu, 0.25);
    s += '<ellipse cx="' + (ki - 13) + '" cy="' + (ey + 17) + '" rx="11" ry="7" fill="' + pipi + '"/>' +
      '<ellipse cx="' + (ka + 13) + '" cy="' + (ey + 17) + '" rx="11" ry="7" fill="' + pipi + '"/>';
    if (e === 'sorak') {
      [ki, ka].forEach(function (x) { s += garis('M' + (x - 9) + ' ' + (ey + 3) + 'Q' + x + ' ' + (ey - 9) + ' ' + (x + 9) + ' ' + (ey + 3), W.tinta, lw); });
    } else {
      var gx = e === 'berpikir' ? 3 : 0, gy = e === 'berpikir' ? -3 : 0, m = '';
      [ki, ka].forEach(function (x) {
        m += '<ellipse cx="' + (x + gx) + '" cy="' + (ey + gy) + '" rx="8" ry="' + (o.anak ? 12 : 11) + '" fill="' + W.tinta + '"/>' +
          '<circle cx="' + (x + gx - 3) + '" cy="' + (ey + gy - 4) + '" r="3" fill="#fff"/>';
      });
      s += '<g class="mata">' + m + '</g>';
    }
    if (e === 'berpikir') {
      s += garis('M' + (ki - 11) + ' ' + (by + 2) + 'L' + (ki + 11) + ' ' + (by + 2), W.tinta, lw);
      s += garis('M' + (ka - 11) + ' ' + (by - 1) + 'Q' + ka + ' ' + (by - 10) + ' ' + (ka + 11) + ' ' + (by - 3), W.tinta, lw);
    } else if (e === 'kecewa') {
      s += garis('M' + (ki - 11) + ' ' + (by + 3) + 'Q' + (ki + 1) + ' ' + (by + 2) + ' ' + (ki + 10) + ' ' + (by - 4), W.tinta, lw);
      s += garis('M' + (ka - 10) + ' ' + (by - 4) + 'Q' + (ka - 1) + ' ' + (by + 2) + ' ' + (ka + 11) + ' ' + (by + 3), W.tinta, lw);
    } else {
      [ki, ka].forEach(function (x) { s += garis('M' + (x - 11) + ' ' + (by + 2) + 'Q' + x + ' ' + (by - 5) + ' ' + (x + 11) + ' ' + (by + 2), W.tinta, lw); });
    }
    s += garis('M' + (cx - 4) + ' ' + (ey + 10) + 'Q' + cx + ' ' + (ey + 15) + ' ' + (cx + 4) + ' ' + (ey + 10), W.tinta, L);
    var mulut = '#8A3A2C';
    if (e === 'senang' || e === 'sorak') {
      var lb = e === 'sorak' ? 20 : 15, dl = e === 'sorak' ? 26 : 19, k = id('mu');
      var dm = 'M' + (cx - lb) + ' ' + my + 'Q' + cx + ' ' + (my + dl) + ' ' + (cx + lb) + ' ' + my + 'Z';
      s += '<clipPath id="' + k + '"><path d="' + dm + '"/></clipPath><path d="' + dm + '" fill="' + mulut + '"/>' +
        '<g clip-path="url(#' + k + ')"><ellipse cx="' + cx + '" cy="' + n(my + dl * 0.72) + '" rx="' + n(lb * 0.62) + '" ry="' + n(dl * 0.34) + '" fill="' + W.jambu + '"/></g>' +
        bentuk(dm, 'none');
    } else if (e === 'bicara') {
      s += bentuk(elips(cx, my + 6, 9, 8), mulut);
    } else if (e === 'berpikir') {
      s += garis('M' + (cx - 10) + ' ' + (my + 6) + 'Q' + (cx + 2) + ' ' + (my + 1) + ' ' + (cx + 12) + ' ' + (my + 4), W.tinta, L);
    } else if (e === 'kecewa') {
      s += garis('M' + (cx - 12) + ' ' + (my + 8) + 'Q' + cx + ' ' + (my + 1) + ' ' + (cx + 12) + ' ' + (my + 8), W.tinta, L);
    }
    if (o.kumis) {
      s += bentuk('M' + (cx - 20) + ' ' + (my - 1) + 'Q' + (cx - 10) + ' ' + (my - 11) + ' ' + cx + ' ' + (my - 5) + 'Q' + (cx + 10) + ' ' + (my - 11) + ' ' + (cx + 20) + ' ' + (my - 1) +
        'Q' + (cx + 10) + ' ' + (my + 3) + ' ' + cx + ' ' + (my - 1) + 'Q' + (cx - 10) + ' ' + (my + 3) + ' ' + (cx - 20) + ' ' + (my - 1) + 'Z', o.rambut, { lebar: L * 0.75 });
    }
    return s;
  }
  function kacamata(cx, ey, dx) {
    var s = '';
    [cx - dx, cx + dx].forEach(function (x) { s += bentuk(elips(x, ey, 16, 15), 'rgba(255,255,255,0.28)'); });
    s += garis('M' + (cx - dx + 16) + ' ' + (ey - 2) + 'Q' + cx + ' ' + (ey - 8) + ' ' + (cx + dx - 16) + ' ' + (ey - 2));
    s += garis('M' + (cx - dx - 16) + ' ' + (ey - 3) + 'L' + (cx - 66) + ' ' + (ey - 7)) + garis('M' + (cx + dx + 16) + ' ' + (ey - 3) + 'L' + (cx + 66) + ' ' + (ey - 7));
    return s;
  }
  function rambutIkalBelakang(r) {
    var s = '';
    [[60, 124, 22], [52, 92, 24], [66, 60, 26], [94, 40, 27], [128, 34, 27], [160, 44, 26], [182, 70, 24], [190, 102, 23], [182, 130, 20]].forEach(function (c) {
      s += cel(elips(c[0], c[1], c[2]), r, { geser: [-4, -4] });
    });
    return s;
  }
  function rambutDepan(o) {
    var r = o.rambut, s = '';
    if (o.gaya === 'hijab') return bentuk('M70 106Q72 60 120 58Q168 60 170 106Q152 80 120 80Q88 80 70 106Z', o.hijab);
    if (o.gaya === 'pendek') return cel('M55 108Q47 44 114 35Q192 33 186 108Q178 76 158 68Q132 80 104 68Q78 66 64 88Q58 97 55 108Z', r, { geser: [-5, -4] });
    if (o.gaya === 'ikal') {
      [[82, 58, 15], [106, 46, 16], [132, 44, 16], [157, 54, 15]].forEach(function (c) { s += cel(elips(c[0], c[1], c[2]), r, { geser: [-3, -3] }); });
      s += cel('M52 86Q120 26 188 86L184 102Q120 50 56 102Z', o.bandana, { geser: [-4, -3] });
      s += bentuk('M184 90L206 78L208 100Z', o.bandana) + bentuk('M186 96L202 114L184 114Z', o.bandana);
      return s;
    }
    if (o.gaya === 'kuncir') return cel('M55 106Q50 42 116 33Q188 30 188 100Q172 66 146 60Q122 74 92 66Q70 70 62 86Q56 95 55 106Z', r, { geser: [-5, -4] });
    if (o.gaya === 'topi') {
      s += bentuk('M58 84Q50 106 60 120L70 92Z', r) + bentuk('M182 84Q190 106 180 120L170 92Z', r);
      s += cel('M56 84Q56 20 120 16Q184 20 184 84Z', o.topi, { geser: [-5, -4] });
      s += cel('M50 84Q120 68 204 82Q210 92 200 98Q124 84 58 96Q46 92 50 84Z', gelap(o.topi, 0.12), { geser: [-3, -3] });
      s += cel(elips(120, 18, 6), o.topi, { geser: [-2, -2], lebar: 3 });
      s += bentuk(elips(120, 50, 13), W.krem, { lebar: 3 }) + bentuk('M113 46H127L125 55Q120 58 115 55Z', terang(W.pandan, 0.2), { lebar: 2.5 });
      return s;
    }
    return '';
  }
  function lengan(o, bahu, ujung, t) {
    var s = '', i;
    for (i = 0; i < 2; i++) {
      var p = bahu[i], u = ujung[i], naik = i === 1 && o.lengan === 'lambai';
      if (naik) u = [p[0] + 70, p[1] - 80];
      var isi = tungkai('M' + p[0] + ' ' + p[1] + 'L' + u[0] + ' ' + u[1], o.baju, t) +
        cel(elips(u[0], u[1] + (naik ? -8 : 6), 16), o.kulit, { geser: [-4, -3] });
      s += naik ? '<g class="lambai">' + isi + '</g>' : isi;
    }
    return s;
  }
  /* letak mata [y, jarak setengah] sesuai bentuk kepala */
  function letakWajah(o) { return o.gaya === 'hijab' ? [114, 21] : [o.anak ? 118 : 110, 24]; }
  /* wajah saja, untuk mengganti ekspresi atau gerak mulut saat bicara tanpa menggambar ulang tokoh */
  function wajahTokoh(nama, eks, o) {
    o = gabung({ eks: eks }, TOKOH[nama] || {}, o || {}, { eks: eks });
    var lw = letakWajah(o);
    return wajah(o, 120, lw[0], lw[1]);
  }
  function orang(o) {
    o = gabung({ eks: 'senang', lengan: 'turun', penuh: false }, TOKOH[o.tokoh] || {}, o);
    var anak = !!o.anak, s = '', k;
    var cy = anak ? 110 : 106, rx = anak ? 68 : 66, ry = anak ? 70 : 68;
    var bahu = anak ? [[76, 214], [164, 214]] : [[60, 206], [180, 206]];
    var ujung = anak ? [[62, 300], [178, 300]] : [[42, 308], [198, 308]];
    var badan = anak ? 'M62 342L62 248Q64 198 104 192L136 192Q176 198 178 248L178 342Z'
      : o.penuh ? 'M46 238Q48 184 100 178L140 178Q192 184 194 238L208 420L32 420Z'
      : 'M44 342L46 238Q48 184 100 178L140 178Q192 184 194 238L196 342Z';

    if (o.gaya === 'ikal') s += rambutIkalBelakang(o.rambut);
    if (o.gaya === 'kuncir') s += cel('M168 58Q216 60 216 112Q218 152 194 172Q206 128 182 94Z', o.rambut, { geser: [-4, -4] }) + cel(elips(184, 66, 9), W.jambu, { geser: [-2, -2], lebar: 3 });
    /* kursi roda: sandaran dan pegangan di belakang bahu, roda besar terlihat di atas konter */
    if (o.kursiRoda) {
      var besi = campur(W.krem, W.tinta, 0.5);
      s += bentuk(elips(28, 328, 74), 'none', { garis: W.tinta, lebar: 14 }) + bentuk(elips(28, 328, 74), 'none', { garis: besi, lebar: 6 }) +
        garis('M28 328L28 258M28 328L88 290M28 328L-32 290', besi, 4);
      s += tungkai('M44 250V176Q44 166 34 164', besi, 8) + tungkai('M196 250V176Q196 166 206 164', besi, 8);
      s += cel(kotak(22, 154, 22, 16, 6), W.tinta, { geser: [-2, -2], lebar: 3 }) + cel(kotak(196, 154, 22, 16, 6), W.tinta, { geser: [-2, -2], lebar: 3 });
    }
    s += cel(kotak(104, 146, 32, 46, 10), o.kulit, { geser: [-5, -4] });
    if (o.penuh) s += cel(elips(92, 426, 24, 11), '#5B3A28', { geser: [-4, -3] }) + cel(elips(148, 426, 24, 11), '#5B3A28', { geser: [-4, -3] });
    s += cel(badan, o.baju);
    if (o.motif) {
      k = id('m');
      s += '<clipPath id="' + k + '"><path d="' + badan + '"/></clipPath><g clip-path="url(#' + k + ')" stroke="' + terang(o.baju, 0.3) + '" stroke-width="5" fill="none">';
      if (o.motif === 'garis') {
        s = s.replace(/stroke-width="5" fill="none">$/, 'stroke-width="9" fill="none">');
        [222, 248, 274, 300, 326].forEach(function (y) { s += '<path d="M30 ' + y + 'H210" stroke="' + terang(W.pandan, 0.1) + '"/>'; });
      } else {
        [72, 98, 142, 168].forEach(function (x) { s += '<path d="M' + x + ' 170V350"/>'; });
        [228, 262, 296, 330].forEach(function (y) { s += '<path d="M30 ' + y + 'H210"/>'; });
      }
      s += '</g>' + bentuk(badan, 'none');
    }
    if (o.kerah) {
      s += garis('M120 206V342', gelap(o.baju, 0.3), 3);
      [238, 274, 310].forEach(function (y) { s += bentuk(elips(120, y, 4), o.kerah, { lebar: 2 }); });
      s += bentuk('M98 178L120 208L90 202Z', o.kerah, { lebar: 3 }) + bentuk('M142 178L120 208L150 202Z', o.kerah, { lebar: 3 });
    }
    if (o.celemek) {
      var ap = anak ? 'M90 234Q120 228 150 234L156 342L84 342Z' : 'M82 224Q120 216 158 224L166 342L74 342Z';
      s += tungkai(anak ? 'M95 236L106 197' : 'M87 226L103 184', o.celemek, 6) + tungkai(anak ? 'M145 236L134 197' : 'M153 226L137 184', o.celemek, 6);
      s += cel(ap, o.celemek, { geser: [-5, -4] });
      s += bentuk(kotak(104, anak ? 276 : 270, 32, 24, 6), 'none', { garis: gelap(o.celemek, 0.35), lebar: 3 });
    }
    if (o.tas) {
      s += garis('M24 336Q42 290 60 336', W.tinta, 4);
      s += cel(kotak(12, 330, 62, 58, 10), W.krem, { geser: [-4, -3] }) + '<rect x="16" y="350" width="54" height="11" fill="' + W.pandan + '"/>' + bentuk(kotak(12, 330, 62, 58, 10), 'none');
    }
    s += lengan(o, bahu, ujung, anak ? 26 : 30);
    var lw = letakWajah(o);
    if (o.gaya === 'hijab') {
      s += cel(HIJAB_BELAKANG, o.hijab);
      s += cel(elips(120, 114, 50, 56), o.kulit);
    } else {
      [54, 186].forEach(function (x) { s += cel(elips(anak ? (x < 120 ? x - 2 : x + 2) : x, cy + 6, 12, 15), o.kulit, { geser: [-3, -3] }); });
      s += cel(elips(120, cy, rx, ry), o.kulit);
    }
    s += rambutDepan(o);
    s += '<g class="wajah">' + wajah(o, 120, lw[0], lw[1]) + '</g>';
    if (o.kacamata) s += kacamata(120, lw[0], 24);
    return s;
  }
  /* Tokoh diletakkan di panggung dan diberi animasi bernapas. */
  function tokoh(nama, x, y, s, o) {
    return g('translate(' + x + ' ' + y + ') scale(' + s + ')', g(null, orang(gabung({ tokoh: nama }, o || {})), 'napas'));
  }
  /* Potret bulat untuk papan instruksi; garis lebih tebal supaya tetap terlihat 3 px saat kecil. */
  function potret(nama, ukuran, o) {
    var k = id('p'), lama = L, isi;
    L = 8;
    try { isi = orang(gabung({ tokoh: nama }, o || {})); } finally { L = lama; }
    return svg(ukuran, ukuran, '<clipPath id="' + k + '"><circle cx="120" cy="124" r="96"/></clipPath>' +
      '<circle cx="120" cy="124" r="96" fill="' + terang(W.pandan, 0.55) + '"/>' +
      '<g clip-path="url(#' + k + ')">' + isi + '</g>' +
      '<circle cx="120" cy="124" r="96" fill="none" stroke="' + W.tinta + '" stroke-width="10"/>', { vb: '20 24 200 200' });
  }

  /* ---------- Makanan (kotak lokal 120x100, sedikit dari atas, cahaya dari kiri atas) ---------- */
  function piring(cx, cy, rx, ry) {
    return cel(elips(cx, cy, rx, ry), W.putih, { geser: [-4, -4], bayang: '#E9E1D3' }) +
      bentuk(elips(cx, cy - 2, rx * 0.74, ry * 0.64), 'none', { garis: '#E2D5C2', lebar: 3 });
  }
  function uapDi(x, y) { var d = 'M' + x + ' ' + y + 'q-7 -8 0 -16t0 -16'; return garis(d, W.tinta, 8) + garis(d, W.putih, 4); }
  function uap(x) { return uapDi(x, 34); }
  /* gelas minuman: isi berwarna dipotong bentuk gelas, kilau putih */
  function gelas(isi, permukaan) {
    var badan = 'M36 22L42 90Q60 96 78 90L84 22Z', k = id('gl'), s = '';
    s += '<clipPath id="' + k + '"><path d="' + badan + '"/></clipPath>';
    s += '<path d="' + badan + '" fill="rgba(255,255,255,0.75)"/>';
    s += '<g clip-path="url(#' + k + ')"><rect x="30" y="36" width="60" height="64" fill="' + isi + '"/>' +
      '<ellipse cx="60" cy="36" rx="23" ry="5" fill="' + (permukaan || terang(isi, 0.35)) + '"/>' +
      '<rect x="66" y="36" width="9" height="60" fill="' + gelap(isi, 0.08) + '"/></g>';
    s += bentuk(badan, 'none') + bentuk(elips(60, 22, 24, 6), 'rgba(255,255,255,0.6)');
    s += garis('M45 32L49 84', 'rgba(255,255,255,0.85)', 5);
    return s;
  }
  var MAKANAN = {
    nasgor: function () {
      var nasi = '#E8A24E', s = piring(60, 68, 56, 26);
      s += cel('M18 66Q20 30 60 25Q100 30 102 66Q60 80 18 66Z', nasi);
      s += '<g fill="' + gelap(nasi, 0.3) + '">' + [[36, 56], [48, 44], [72, 42], [86, 56], [64, 62], [44, 64], [80, 66]].map(function (c) {
        return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="2.6"/>';
      }).join('') + '</g>';
      s += cel('M40 40Q42 26 59 27Q78 25 81 40Q72 51 59 48Q45 51 40 40Z', W.putih, { geser: [-3, -3], bayang: '#ECE4D6' });
      s += cel(elips(60, 37, 8, 7), W.mangga, { geser: [-2, -2] });
      s += cel(elips(20, 74, 10, 6), terang(W.pandan, 0.35), { geser: [-2, -2], lebar: 3 }) + cel(elips(34, 82, 10, 6), terang(W.pandan, 0.35), { geser: [-2, -2], lebar: 3 });
      s += cel('M88 80A10 10 0 0 1 108 80Z', W.jambu, { geser: [-2, -2], lebar: 3 });
      return s;
    },
    panekuk: function () {
      var kue = '#E3A058', s = piring(60, 72, 54, 24);
      [64, 53, 42].forEach(function (y) { s += cel(elips(60, y, 40, 13), kue, { geser: [-4, -4] }); });
      s += bentuk('M34 40Q60 28 86 40Q88 47 80 49Q79 58 73 57Q69 50 62 52Q54 55 47 50Q37 50 34 40Z', '#A8582B', { lebar: 3 });
      s += cel(kotak(51, 31, 18, 12, 3), terang(W.mangga, 0.55), { geser: [-2, -2], lebar: 3 });
      return s;
    },
    teh: function () {
      var c = 'M30 44L36 74Q60 88 84 74L90 44Z', k = id('ck'), s = '';
      s += cel(elips(60, 81, 46, 13), W.putih, { geser: [-4, -3], bayang: '#E9E1D3' });
      s += tungkai('M88 52Q106 50 104 63Q102 74 86 72', W.putih, 6);
      s += '<clipPath id="' + k + '"><path d="' + c + '"/></clipPath>' + cel(c, W.putih, { bayang: '#E9E1D3', lebar: 0 });
      s += '<g clip-path="url(#' + k + ')"><rect x="20" y="56" width="80" height="9" fill="' + W.pandan + '"/></g>' + bentuk(c, 'none');
      s += bentuk(elips(60, 44, 30, 9), W.putih);
      s += '<ellipse cx="60" cy="45" rx="25" ry="6" fill="#B45F2E"/><ellipse cx="53" cy="44" rx="8" ry="2.2" fill="#D98A52"/>';
      s += '<g class="uap">' + uap(50) + uap(68) + '</g>';
      return s;
    },
    sate: function () {
      var s = piring(60, 70, 56, 25), daging = '#B4632F', i, t;
      s += cel('M30 78Q40 66 60 68Q82 70 94 80Q72 90 50 88Q34 86 30 78Z', '#C9873D', { geser: [-3, -3], lebar: 3 });
      for (i = 0; i < 3; i++) {
        s += tungkai('M' + 18 + ' ' + (72 - 12 * i) + 'L' + 102 + ' ' + (48 - 12 * i), '#EBCB9E', 3);
        for (t = 0.3; t < 0.95; t += 0.18) s += cel(elips(18 + 84 * t, 72 - 12 * i - 24 * t, 9, 7), daging, { geser: [-2, -2], lebar: 3 });
      }
      s += cel(elips(100, 74, 9, 6), terang(W.pandan, 0.35), { geser: [-2, -2], lebar: 3 });
      return s;
    },
    bakso: function () {
      var mangkuk = 'M12 44Q14 88 60 92Q106 88 108 44Z', k = id('bk'), s = '';
      s += '<clipPath id="' + k + '"><path d="' + mangkuk + '"/></clipPath>' + cel(mangkuk, W.putih, { bayang: '#E9E1D3', lebar: 0 });
      s += '<g clip-path="url(#' + k + ')"><rect x="0" y="62" width="120" height="8" fill="' + W.jambu + '"/></g>' + bentuk(mangkuk, 'none');
      s += bentuk(elips(60, 44, 48, 14), W.putih);
      s += '<ellipse cx="60" cy="45" rx="42" ry="10" fill="#E6B26A"/>';
      s += garis('M28 48Q38 42 48 48T68 48T88 46', '#F6D785', 3);
      [[42, 43, 10], [62, 48, 10], [80, 42, 9]].forEach(function (b) { s += cel(elips(b[0], b[1], b[2], b[2] * 0.8), '#94603F', { geser: [-3, -3], lebar: 3 }); });
      [[52, 40], [72, 52], [34, 50], [88, 50]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + W.pandan + '"/>'; });
      s += '<g class="uap">' + uapDi(48, 30) + uapDi(70, 28) + '</g>';
      return s;
    },
    pisgor: function () {
      var goreng = '#D99A45', s = piring(60, 72, 54, 23);
      ['M20 66Q18 50 38 48Q58 48 60 60Q60 72 42 74Q24 76 20 66Z', 'M50 58Q50 40 72 40Q96 40 98 54Q98 66 76 68Q56 70 50 58Z',
        'M36 78Q34 62 58 62Q82 62 86 72Q86 86 62 86Q38 88 36 78Z'].forEach(function (d) { s += cel(d, goreng, { geser: [-4, -4] }); });
      s += '<g fill="' + gelap(goreng, 0.3) + '">' + [[32, 60], [44, 56], [66, 50], [84, 52], [52, 74], [70, 76], [60, 70]].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4"/>';
      }).join('') + '</g>';
      return s;
    },
    roti: function () {
      var roti = '#F2D6A0', s = piring(60, 76, 52, 21);
      s += cel('M46 72L76 26L104 68Z', gelap(roti, 0.08), { geser: [-3, -3] });
      var depan = 'M18 80L54 28L90 80Z';
      s += cel(depan, roti, { geser: [-4, -4] });
      s += bentuk('M33 66H75L79 72H29Z', terang(W.pandan, 0.25), { lebar: 3 });
      s += bentuk('M38 57H70L74 63H34Z', W.putih, { lebar: 3 });
      s += bentuk(elips(48, 60, 4.5, 3), W.mangga, { lebar: 0 }) + bentuk(elips(62, 60, 4.5, 3), W.mangga, { lebar: 0 });
      s += bentuk('M26 76L54 36L82 76Z', 'none', { garis: '#D9A65A', lebar: 4 });
      return s;
    },
    burger: function () {
      var roti = '#E3A058', s = piring(60, 82, 52, 16);
      s += cel(kotak(24, 66, 72, 16, 8), roti, { geser: [-3, -3] });
      s += cel(kotak(18, 56, 84, 14, 7), '#7A4A2E', { geser: [-3, -3] });
      s += bentuk('M20 54H100L92 64L82 56L70 66L58 56L44 64L32 56Z', W.mangga, { lebar: 3 });
      s += bentuk('M16 50Q24 44 32 50T48 50T64 50T80 50T104 50L102 56H18Z', terang(W.pandan, 0.15), { lebar: 3 });
      s += cel('M20 48Q20 16 60 14Q100 16 100 48Z', roti, { geser: [-4, -4] });
      [[44, 28, -20], [60, 24, 0], [76, 28, 20], [52, 36, 10], [70, 36, -10]].forEach(function (p) {
        s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="3.5" ry="2" fill="' + W.krem + '" transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"/>';
      });
      return s;
    },
    eskrim: function () {
      var gelasKertas = 'M32 52L42 94H78L88 52Z', k = id('es'), s = '';
      s += cel(elips(60, 30, 18, 15), '#8C5A3C', { geser: [-3, -3] });
      s += cel(elips(45, 46, 18, 15), terang(W.jambu, 0.3), { geser: [-3, -3] }) + cel(elips(75, 46, 18, 15), '#FFF0D2', { geser: [-3, -3], bayang: '#EBD7B5' });
      s += '<clipPath id="' + k + '"><path d="' + gelasKertas + '"/></clipPath>' + cel(gelasKertas, W.krem, { lebar: 0 });
      s += '<g clip-path="url(#' + k + ')" fill="' + W.pandan + '"><rect x="44" y="50" width="9" height="46"/><rect x="66" y="50" width="9" height="46"/></g>' + bentuk(gelasKertas, 'none');
      s += cel(elips(60, 14, 6), W.jambu, { geser: [-2, -2], lebar: 3 }) + garis('M60 8Q62 2 68 1', W.tinta, 3);
      return s;
    },
    jeruk: function () {
      var s = gelas('#FFA634');
      s += tungkai('M66 30L80 4', W.jambu, 5);
      s += cel(elips(38, 26, 13), '#FFA634', { geser: [-3, -3] }) + bentuk(elips(38, 26, 8), terang('#FFA634', 0.5), { lebar: 2.5 }) +
        garis('M38 18V34M30 26H46M32 20L44 32M44 20L32 32', W.tinta, 2);
      return s;
    },
    susu: function () {
      var s = gelas('#FFFFFF', '#F6EEDC');
      s += bentuk('M38 34Q44 30 48 35Q52 30 58 34', 'none', { garis: '#E6DAC4', lebar: 3 });
      return s;
    },
    air: function () {
      var botol = 'M48 22Q48 14 52 14H68Q72 14 72 22Q88 28 88 42V88Q88 96 80 96H40Q32 96 32 88V42Q32 28 48 22Z', k = id('ai'), cair = terang(W.pandan, 0.82), s = '';
      s += '<clipPath id="' + k + '"><path d="' + botol + '"/></clipPath>' + cel(botol, cair, { lebar: 0, geser: [-4, -3] });
      s += '<g clip-path="url(#' + k + ')"><rect x="28" y="52" width="64" height="20" fill="' + W.pandan + '"/>' +
        garis('M28 62Q44 56 60 62T92 60', W.krem, 3) + '</g>';
      s += bentuk(botol, 'none') + garis('M34 80H86M34 86H86', gelap(cair, 0.12), 3);
      s += cel(kotak(49, 4, 22, 12, 3), gelap(W.pandan, 0.2), { geser: [-2, -2], lebar: 3 });
      s += garis('M40 40L41 50M40 76L41 84', 'rgba(255,255,255,0.9)', 5);
      return s;
    }
  };
  /* Gambar dari js/data/aset.js (Langkah 3 PROMPT-ASET.md). Tanpa entri, SVG kode yang dipakai. */
  function gambar(k) { var G = (typeof window !== 'undefined' && window.ASET && window.ASET.gambar) || {}; return G[k]; }
  function citra(href, x, y, w, h) { return '<image href="' + href + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid meet"/>'; }
  /* o.svg: paksa SVG kode (untuk lapisan yang dipanggang menjadi gambar, karena SVG-sebagai-gambar tidak memuat berkas luar) */
  function makanan(nama, o) {
    var m = gambar('makanan');
    if (m && m[nama] && !(o && o.svg)) return citra(m[nama], 0, 0, 120, 100);
    return MAKANAN[nama]();
  }

  /* ---------- Uang mainan: kartun, nominal besar, tanpa tokoh, lambang, logo, nomor seri, atau pola pengaman ---------- */
  function uangKertas(nilai, w, h) {
    w = w || 168; h = h || 84;
    var c = UANG[nilai], s = '', my = h / 2, px = 56, pw = w - px - 10, ph = h - 34;
    s += cel(kotak(0, 0, w, h, 10), c, { geser: [-5, -4], bayang: gelap(c, 0.16) });
    s += bentuk(kotak(7, 7, w - 14, h - 14, 6), 'none', { garis: gelap(c, 0.22), lebar: 3 });
    /* medali motif Kafe Cilik: cangkir beruap */
    s += bentuk(elips(31, my, 19), terang(c, 0.45), { lebar: 3 });
    s += bentuk('M23 ' + (my - 5) + 'H39L37 ' + (my + 7) + 'Q31 ' + (my + 11) + ' 25 ' + (my + 7) + 'Z', W.krem, { lebar: 2.5 });
    s += garis('M39 ' + (my - 2) + 'Q45 ' + (my - 2) + ' 43 ' + (my + 3) + 'Q41 ' + (my + 6) + ' 37 ' + (my + 5), W.tinta, 2.5);
    s += garis('M28 ' + (my - 9) + 'Q26 ' + (my - 13) + ' 29 ' + (my - 16) + 'M34 ' + (my - 9) + 'Q32 ' + (my - 13) + ' 35 ' + (my - 16), W.tinta, 2.2);
    /* pelat nominal dan tulisan UANG MAINAN */
    s += bentuk(kotak(px, 12, pw, ph, 8), terang(c, 0.72), { lebar: 3 });
    s += teks(px + pw / 2, 12 + ph / 2 + 10, angka(nilai), { judul: true, ukuran: nilai >= 100000 ? 24 : 27, anchor: 'middle', maxw: pw - 6 });
    s += teks(px + pw / 2, h - 10, (root.STR && STR.uangMainan) || 'UANG MAINAN', { judul: true, ukuran: 12, anchor: 'middle', spasi: 1.5, warna: gelap(c, 0.55) });
    return s;
  }
  /* Koin berpusat di (0,0): Rp500 perak kecil, Rp1.000 perak lebih besar bercincin mangga. */
  function koin(nilai) {
    var besar = nilai >= 1000, s = '';
    if (besar) {
      s += cel(elips(0, 0, 40), W.mangga, { geser: [-4, -4] }) + cel(elips(0, 0, 31), UANG[1000], { geser: [-3, -3], lebar: 3 });
    } else {
      s += cel(elips(0, 0, 33), UANG[500], { geser: [-4, -4] }) + bentuk(elips(0, 0, 26), 'none', { garis: gelap(UANG[500], 0.2), lebar: 3 });
    }
    return s + teks(0, besar ? 8 : 9, angka(nilai), { judul: true, ukuran: besar ? 21 : 24, anchor: 'middle' });
  }

  /* ---------- Benda di konter ---------- */
  function nampan(w, h, isi, tepi) {
    return cel(kotak(0, 0, w, h, 24), tepi, { geser: [-5, -5] }) +
      cel(kotak(12, 12, w - 24, h - 24, 16), isi, { geser: [5, 5], bayang: gelap(isi, 0.14), lebar: 3 });
  }
  function bayangKonter(cx, cy, rx) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="10" fill="rgba(59,35,20,0.2)"/>'; }
  /* Laci kasir 1240x108: dua cawan koin di depan, lima sekat uang kertas. */
  function laci(o) {
    o = o || {};
    var s = '', dalam = gelap(W.kayu, 0.32);
    s += cel(kotak(0, 0, 1240, 108, 14), W.kayu, { geser: [-6, -5] });
    [[500, 66], [1000, 182]].forEach(function (p) {
      s += bentuk(elips(p[1], 54, 52, 44), dalam);
      if (!o.kosong) s += g('translate(' + (p[1] + 5) + ' 58)', koin(p[0])) + g('translate(' + p[1] + ' 52)', koin(p[0]));
    });
    [2000, 5000, 10000, 20000, 50000].forEach(function (v, i) {
      var x = 252 + i * 196;
      s += bentuk(kotak(x, 10, 190, 88, 10), dalam);
      s += bentuk(kotak(x + 16, 16, 168, 78, 10), gelap(UANG[v], 0.12), { lebar: 3 });
      if (!o.kosong) s += g('translate(' + (x + 11) + ' 12)', uangKertas(v, 168, 80));
      if (o.sorot === v) s += bentuk(kotak(x - 5, 4, 200, 100, 14), 'none', { garis: W.mangga, lebar: 6, attr: ' class="denyut"' });
    });
    return s;
  }
  function papanMenu(w, h) {
    return pelat(kotak(0, 0, w, h, 18)) + cel(kotak(0, 0, w, h, 18), W.kayu, { geser: [-5, -5] }) +
      bentuk(kotak(12, 12, w - 24, h - 24, 10), W.papan, { lebar: 3 }) +
      '<ellipse cx="' + n(w * 0.34) + '" cy="' + n(h * 0.26) + '" rx="' + n(w * 0.24) + '" ry="' + n(h * 0.12) + '" fill="' + campur(W.papan, W.krem, 0.05) + '"/>';
  }
  function struk(w, h) {
    var gigi = 18, d = 'M0 10Q0 0 10 0H' + (w - 10) + 'Q' + w + ' 0 ' + w + ' 10V' + (h - 10), x = w, bawah = true;
    while (x > 0) { x = Math.max(0, x - gigi / 2); d += 'L' + n(x) + ' ' + (bawah ? h : h - 10); bawah = !bawah; }
    d += 'Z';
    return pelat(d) + cel(d, W.krem, { geser: [-4, -4], bayang: campur(W.krem, W.tinta, 0.08) });
  }
  /* Garis bilangan kosong untuk hitung naik: jarak tidak berskala supaya label tetap terbaca. */
  function garisBilangan(o) {
    var w = o.w || 698, h = o.h || 152, y = 108, x0 = 58, x1 = w - 50, s = '', i, t = o.titik, beda = [], jumlah = 0;
    s += pelat(kotak(0, 0, w, h, 24)) + cel(kotak(0, 0, w, h, 24), W.papan, { geser: [-5, -5], bayang: gelap(W.papan, 0.25) });
    var mode = o.mode || 'patokan';
    s += teks(22, 32, o.judul || 'Hitung naik', { judul: true, ukuran: 22, warna: W.krem });
    for (i = 1; i < t.length; i++) { beda.push(Math.sqrt(t[i] - t[i - 1])); jumlah += beda[i - 1]; }
    var min = 112, sisa = (x1 - x0) - min * beda.length, xs = [x0];
    for (i = 0; i < beda.length; i++) xs.push(xs[i] + min + sisa * beda[i] / jumlah);
    s += garis('M' + (x0 - 26) + ' ' + y + 'H' + (x1 + 22), W.krem, 5);
    for (i = 1; i < xs.length; i++) {
      var a = xs[i - 1] + 8, b = xs[i] - 8, tinggi = 24 + 7 * i, sudah = i <= o.selesai, cx = (a + b) / 2, cy = y - 2 * tinggi, ay = y - 6;
      if (mode === 'ujung' && !sudah) continue;
      if (mode === 'patokan' && !sudah && i > o.selesai + 1) continue;
      s += garis('M' + n(a) + ' ' + ay + 'Q' + n(cx) + ' ' + n(cy) + ' ' + n(b) + ' ' + ay, W.mangga, 5, sudah ? null : { attr: ' stroke-dasharray="2 12"' });
      if (!sudah && mode === 'penuh') s += teks(cx, y - tinggi - 14, '+' + angka(t[i] - t[i - 1]), { tebal: true, ukuran: 22, warna: terang(W.mangga, 0.5), anchor: 'middle' });
      if (sudah) {
        var sudut = Math.atan2(ay - cy, b - cx);
        s += garis('M' + n(b - 14 * Math.cos(sudut - 0.5)) + ' ' + n(ay - 14 * Math.sin(sudut - 0.5)) + 'L' + n(b) + ' ' + ay +
          'L' + n(b - 14 * Math.cos(sudut + 0.5)) + ' ' + n(ay - 14 * Math.sin(sudut + 0.5)), W.mangga, 5);
        s += teks(cx, y - tinggi - 14, '+' + angka(t[i] - t[i - 1]), { tebal: true, ukuran: 22, warna: W.mangga, anchor: 'middle' });
      }
    }
    for (i = 0; i < xs.length; i++) {
      var ujung = i === 0 || i === xs.length - 1;
      if (mode === 'ujung' && !ujung) continue;
      s += bentuk(elips(xs[i], y, i === xs.length - 1 ? 11 : 9), i <= o.selesai ? W.mangga : W.krem, { lebar: 3, attr: o.sorot === i ? ' class="denyut"' : '' });
      s += teks(xs[i], y + 31, angka(t[i]), { tebal: true, ukuran: 20, warna: W.krem, anchor: 'middle' });
    }
    /* penanda posisi sekarang (total + uang di nampan), disembunyikan pada mode ujung */
    if (o.posisi != null && mode !== 'ujung' && o.posisi > t[0]) {
      var px = xs[xs.length - 1], v = Math.min(o.posisi, t[t.length - 1] + 1);
      for (i = 1; i < t.length; i++) if (v <= t[i]) { px = xs[i - 1] + (xs[i] - xs[i - 1]) * (v - t[i - 1]) / (t[i] - t[i - 1]); break; }
      if (o.posisi > t[t.length - 1]) px = xs[xs.length - 1] + 24;
      s += bentuk('M' + n(px) + ' ' + (y - 14) + 'l-9 -14h18z', W.jambu, { lebar: 3 });
    }
    return s;
  }
  /* Tangan penunjuk; ujung telunjuk di (0,0). */
  function tangan() {
    var s = '';
    s += cel(kotak(-15, -88, 48, 54, 18), W.putih, { geser: [-4, -4], bayang: '#E7DFD2' });
    s += garis('M14 -66H29M14 -54H27', '#D9CDBB', 3);
    s += tungkai('M-10 -60L-24 -72', W.putih, 14);
    s += tungkai('M0 -44L0 -9', W.putih, 18);
    s += cel(kotak(-17, -106, 52, 22, 9), W.pandan, { geser: [-3, -3] });
    return s;
  }
  /* Ekor balon dialog (svg kecil di dalam elemen balon), menutup garis tepi balon di pangkalnya. */
  function ekor(arah) {
    if (arah === 'kiri') {
      return svg(34, 44, '<path d="M32 3L3 28L32 41" fill="' + W.krem + '" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M28 8V36" stroke="' + W.krem + '" stroke-width="7"/>', { kelas: 'ekor ekor-kiri' });
    }
    return svg(44, 34, '<path d="M3 2L24 31L41 2" fill="' + W.krem + '" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M8 6H36" stroke="' + W.krem + '" stroke-width="7"/>', { kelas: 'ekor ekor-bawah' });
  }

  /* ---------- Layar judul ---------- */
  function logo(a, b2) {
    var s = '', bay = campur(W.krem, W.tinta, 0.3);
    [[a || 'KAFE', 196, W.mangga], [b2 || 'CILIK', 332, W.jambu]].forEach(function (b) {
      s += teks(58, b[1] + 8, b[0], { judul: true, ukuran: 140, warna: bay, luar: 18, warnaLuar: bay, spasi: 2 });
      s += teks(58, b[1], b[0], { judul: true, ukuran: 140, warna: b[2], luar: 18, warnaLuar: W.tinta, spasi: 2 });
    });
    return s + g('translate(404 70) scale(1.15)', makanan('teh'));
  }
  function pita(x, y, w, h, isi) {
    var d = 'M' + x + ' ' + y + 'H' + (x + w) + 'L' + (x + w - 20) + ' ' + (y + h / 2) + 'L' + (x + w) + ' ' + (y + h) + 'H' + x + 'L' + (x + 20) + ' ' + (y + h / 2) + 'Z';
    return pelat(d) + cel(d, W.krem, { geser: [-4, -5], bayang: campur(W.krem, W.tinta, 0.1) }) +
      garis('M' + (x + 28) + ' ' + (y + 9) + 'H' + (x + w - 28), W.pandan, 4) + garis('M' + (x + 28) + ' ' + (y + h - 9) + 'H' + (x + w - 28), W.pandan, 4) +
      teks(x + w / 2, y + h / 2 + 9, isi, { tebal: true, ukuran: 26, anchor: 'middle', maxw: w - 64 });
  }
  function kafeLuar(o) {
    o = o || {};
    var s = '', i, kk = id('kaca'), kaca = kotak(670, 314, 272, 232, 8);
    s += cel(kotak(640, 168, 560, 472, 0), W.persik, { geser: [-6, 0] });
    s += '<rect x="642" y="306" width="556" height="24" fill="' + gelap(W.persik, 0.1) + '"/>';
    s += bentuk(kotak(640, 590, 560, 50, 0), terang(W.pandan, 0.45));
    s += cel(kotak(622, 148, 596, 34, 10), W.kayu);
    /* papan nama */
    s += pelat(kotak(686, 192, 248, 60, 16)) + cel(kotak(686, 192, 248, 60, 16), W.krem, { geser: [-4, -3] });
    s += bentuk(kotak(694, 200, 232, 44, 10), 'none', { garis: W.pandan, lebar: 4 });
    s += teks(810, 234, o.papanNama || 'KAFE CILIK', { judul: true, ukuran: 36, anchor: 'middle', spasi: 1, maxw: 210 });
    /* tenda bergaris pandan-krem */
    for (i = 0; i < 14; i++) {
      var x = 640 + i * 40;
      s += bentuk('M' + x + ' 270H' + (x + 40) + 'V306A20 20 0 0 1 ' + x + ' 306Z', i % 2 ? W.krem : W.pandan);
    }
    s += cel(kotak(632, 258, 576, 18, 6), W.kayu, { geser: [-3, -3] });
    /* jendela berisi kasir cilik */
    s += cel(kotak(656, 300, 300, 262, 14), W.kayu);
    var dalam = '<rect x="660" y="300" width="300" height="262" fill="' + terang(W.persik, 0.35) + '"/>';
    dalam += cel(kotak(856, 362, 74, 56, 6), W.papan, { lebar: 3 }) + garis('M866 378H916M866 392H906M866 406H912', W.krem, 3);
    if (o.lampu) dalam += '<circle cx="906" cy="356" r="46" fill="' + terang(W.mangga, 0.45) + '" opacity="0.7"/>';
    dalam += garis('M906 314V336', W.tinta, 3) + cel('M888 352Q888 334 906 334Q924 334 924 352Z', W.mangga, { geser: [-3, -3] });
    dalam += tokoh('kasir', 696, 324, 0.72, { lengan: 'lambai' });
    dalam += cel(kotak(656, 500, 304, 60, 0), W.kayu, { geser: [0, -5] });
    dalam += g('translate(862 449) scale(0.55)', makanan('teh'));
    s += '<clipPath id="' + kk + '"><path d="' + kaca + '"/></clipPath><g clip-path="url(#' + kk + ')">' + dalam + '</g>' + bentuk(kaca, 'none');
    s += garis('M690 528L726 330', 'rgba(255,255,255,0.5)', 8) + garis('M712 528L742 374', 'rgba(255,255,255,0.4)', 4);
    s += cel(kotak(646, 552, 320, 22, 8), W.kayu);
    s += cel(kotak(664, 574, 284, 50, 10), gelap(W.kayu, 0.12));
    for (i = 0; i < 8; i++) {
      var bx = 684 + i * 35;
      s += cel(elips(bx, 572, 22, 18), W.pandan, { geser: [-4, -3] });
      if (i % 2 === 0) s += bentuk(elips(bx + 4, 562, 6), W.jambu, { lebar: 3 });
    }
    /* pintu kaca */
    s += cel(kotak(1000, 326, 168, 314, 14), W.kayu);
    s += cel(kotak(1016, 342, 136, 186, 8), terang(W.persik, 0.5), { geser: [5, 4] });
    s += garis('M1034 510L1060 360', 'rgba(255,255,255,0.5)', 7);
    s += cel(kotak(1016, 540, 136, 84, 6), terang(W.kayu, 0.3));
    s += cel(elips(1034, 520, 8), W.mangga, { geser: [-2, -2], lebar: 3 });
    /* kafe berkembang (GDD bagian 19): hiasan bertambah setiap level selesai. L1 lampu jendela (di atas), L2 tanaman, L3 papan kapur dan bendera, L4 meja luar */
    if (o.tanaman) s += g(null, potTanaman(984, 664, 0) + potTanaman(1188, 664, 1), 'dekor dekor-2');
    if (o.papanHias) s += g(null, bendera(950, 1196, 194, 226) + papanKapur(868, 704), 'dekor dekor-3');
    if (o.kursi) s += g(null, mejaLuar(756, 708), 'dekor dekor-4');
    return s;
  }
  function bayangLantai(x, y, rx) { return '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(rx) + '" ry="7" fill="rgba(59,35,20,0.2)"/>'; }
  /* pot tanaman berdiri di trotoar; jenis 0 semak bulat, jenis 1 daun tinggi berbunga */
  function potTanaman(x, yb, jenis) {
    var s = bayangLantai(x, yb, 30), warna = jenis ? W.jambu : W.kayu;
    if (jenis) {
      [[-14, -8, 9, 30, -26], [0, -14, 9, 36, 0], [14, -8, 9, 30, 26], [-7, -12, 8, 32, -12], [7, -12, 8, 32, 12]].forEach(function (l) {
        s += '<g transform="translate(' + (x + l[0]) + ' ' + (yb - 44 + l[1]) + ') rotate(' + l[4] + ')">' + cel(elips(0, -l[3], l[2], l[3]), W.pandan, { geser: [-3, -3], lebar: 3 }) + '</g>';
      });
      s += bentuk(elips(x - 16, yb - 92, 7), W.krem, { lebar: 3 }) + bentuk(elips(x + 15, yb - 98, 7), W.mangga, { lebar: 3 });
    } else {
      s += cel(elips(x - 14, yb - 58, 18), W.pandan, { geser: [-3, -3], lebar: 3 }) + cel(elips(x + 14, yb - 58, 18), W.pandan, { geser: [-3, -3], lebar: 3 }) +
        cel(elips(x, yb - 74, 20), W.pandan, { geser: [-3, -3], lebar: 3 });
      s += bentuk(elips(x - 6, yb - 80, 5), W.jambu, { lebar: 3 }) + bentuk(elips(x + 12, yb - 64, 5), W.jambu, { lebar: 3 });
    }
    s += cel('M' + (x - 21) + ' ' + (yb - 40) + 'H' + (x + 21) + 'L' + (x + 16) + ' ' + yb + 'H' + (x - 16) + 'Z', warna, { geser: [-3, -3], lebar: 3 });
    s += cel(kotak(x - 25, yb - 46, 50, 10, 4), gelap(warna, 0.08), { geser: [-2, -2], lebar: 3 });
    return s;
  }
  /* untaian bendera segitiga di dinding kanan, dari xa ke xb, melengkung sampai y = bawah */
  function bendera(xa, xb, y, bawah) {
    var s = garis('M' + xa + ' ' + y + 'Q' + ((xa + xb) / 2) + ' ' + (2 * bawah - y) + ' ' + xb + ' ' + y, W.tinta, 3), warna = [W.mangga, W.jambu, W.pandan, W.krem];
    for (var i = 0; i < 9; i++) {
      var t = (i + 0.5) / 9, u = 1 - t;
      var x = u * u * xa + 2 * u * t * (xa + xb) / 2 + t * t * xb, yy = u * u * y + 2 * u * t * (2 * bawah - y) + t * t * y;
      s += bentuk('M' + n(x - 11) + ' ' + n(yy) + 'L' + n(x + 11) + ' ' + n(yy) + 'L' + n(x) + ' ' + n(yy + 22) + 'Z', warna[i % 4], { lebar: 3 });
    }
    return s;
  }
  /* papan kapur berkaki (A-frame) di trotoar, bergambar cangkir dan garis kapur, tanpa tulisan */
  function papanKapur(x, yb) {
    var s = bayangLantai(x + 44, yb, 52);
    s += tungkai('M' + (x + 10) + ' ' + yb + 'L' + (x + 22) + ' ' + (yb - 108) + 'M' + (x + 78) + ' ' + yb + 'L' + (x + 66) + ' ' + (yb - 108), W.kayu, 6);
    s += pelat(kotak(x, yb - 108, 88, 86, 8), 4) + cel(kotak(x, yb - 108, 88, 86, 8), W.kayu, { geser: [-3, -3] });
    s += bentuk(kotak(x + 7, yb - 101, 74, 72, 4), W.papan, { lebar: 3 });
    s += garis('M' + (x + 16) + ' ' + (yb - 76) + 'H' + (x + 40) + 'L' + (x + 37) + ' ' + (yb - 56) + 'H' + (x + 19) + 'Z', W.krem, 3);
    s += garis('M' + (x + 40) + ' ' + (yb - 72) + 'Q' + (x + 48) + ' ' + (yb - 70) + ' ' + (x + 39) + ' ' + (yb - 62), W.krem, 3);
    s += garis('M' + (x + 24) + ' ' + (yb - 82) + 'Q' + (x + 20) + ' ' + (yb - 88) + ' ' + (x + 25) + ' ' + (yb - 93) + 'M' + (x + 32) + ' ' + (yb - 82) + 'Q' + (x + 28) + ' ' + (yb - 88) + ' ' + (x + 33) + ' ' + (yb - 93), W.mangga, 3);
    s += garis('M' + (x + 52) + ' ' + (yb - 86) + 'H' + (x + 72) + 'M' + (x + 52) + ' ' + (yb - 74) + 'H' + (x + 68) + 'M' + (x + 52) + ' ' + (yb - 62) + 'H' + (x + 72), W.krem, 3);
    s += garis('M' + (x + 18) + ' ' + (yb - 42) + 'H' + (x + 70), W.mangga, 3, { attr: ' stroke-dasharray="2 9"' });
    return s;
  }
  /* meja bundar dan dua kursi di trotoar, secangkir teh di atas meja */
  function mejaLuar(x, yb) {
    var s = bayangLantai(x, yb, 112);
    [-72, 72].forEach(function (dx) {
      var cx = x + dx, sisi = dx < 0 ? -1 : 1;
      s += garis('M' + (cx - 14) + ' ' + (yb - 44) + 'L' + (cx - 18) + ' ' + yb + 'M' + (cx + 14) + ' ' + (yb - 44) + 'L' + (cx + 18) + ' ' + yb, W.tinta, 4);
      s += tungkai('M' + (cx + 16 * sisi) + ' ' + (yb - 48) + 'V' + (yb - 86) + 'Q' + (cx + 16 * sisi) + ' ' + (yb - 98) + ' ' + (cx + 4 * sisi) + ' ' + (yb - 98), W.pandan, 6);
      s += cel(kotak(cx - 22, yb - 52, 44, 10, 4), W.pandan, { geser: [-2, -2], lebar: 3 });
    });
    s += cel(elips(x, yb - 4, 24, 6), gelap(W.kayu, 0.15), { geser: [-2, -2], lebar: 3 });
    s += tungkai('M' + x + ' ' + (yb - 8) + 'V' + (yb - 58), gelap(W.kayu, 0.15), 6);
    s += cel(elips(x, yb - 62, 50, 12), W.krem, { geser: [0, -3], lebar: 3 });
    s += g('translate(' + (x - 20) + ' ' + (yb - 100) + ') scale(0.34)', makanan('teh'));
    return s;
  }
  /* Latar luar: langit, kota jauh, kafe di x = kafeX (bawaan 640 untuk layar judul), trotoar. */
  function latarLuar(o) {
    o = o || {};
    var kx = o.kafeX == null ? 640 : o.kafeX, d = kx - 640;
    if (gambar('latarLuar')) {
      /* gambar langit, kota, pohon, dan trotoar; matahari, awan, dan burung tetap SVG supaya bisa bergerak */
      var gl = citra(gambar('latarLuar'), 0, 0, 1280, 720);
      gl += '<circle cx="' + (598 + d) + '" cy="112" r="62" fill="' + terang(W.mangga, 0.6) + '"/><circle cx="' + (598 + d) + '" cy="112" r="44" fill="' + terang(W.mangga, 0.25) + '"/>';
      gl += g(null, awan(700 + d, 100, 1.05), 'awan-a') + g(null, awan(960 + d, 64, 0.72), 'awan-b') + g(null, awan(d < 0 ? 1180 : 86, 44, 0.6), 'awan-b');
      gl += g(null, burung(812 + d, 126, 1) + burung(846 + d, 110, 0.8), 'burung');
      return gl + g(d ? 'translate(' + d + ' 0)' : null, kafeLuar(o));
    }
    var s = '<rect width="1280" height="720" fill="' + W.krem + '"/>';
    s += '<circle cx="' + (598 + d) + '" cy="112" r="62" fill="' + terang(W.mangga, 0.6) + '"/><circle cx="' + (598 + d) + '" cy="112" r="44" fill="' + terang(W.mangga, 0.25) + '"/>';
    s += g(null, awan(700 + d, 100, 1.05), 'awan-a') + g(null, awan(960 + d, 64, 0.72), 'awan-b') + g(null, awan(d < 0 ? 1180 : 86, 44, 0.6), 'awan-b');
    s += g(null, burung(812 + d, 126, 1) + burung(846 + d, 110, 0.8), 'burung');
    s += kotaJauh(o.kota || [[-10, 130, 150, 1], [112, 96, 112, 0], [200, 138, 176, 1], [330, 104, 124, 0], [424, 150, 160, 1], [566, 90, 128, 0], [1196, 110, 262, 0]], 640);
    s += pohon(604 + d, 640, 0.9) + pohon(1250 + d, 646, 1.0);
    var trotoar = campur(W.persik, W.kayu, 0.2);
    s += '<rect y="640" width="1280" height="80" fill="' + trotoar + '"/>';
    for (var x = 40; x < 1320; x += 96) s += garis('M' + x + ' 644L' + (x - 34) + ' 720', gelap(trotoar, 0.12), 3);
    s += garis('M0 640H1280', W.tinta, 4);
    return s + g(d ? 'translate(' + d + ' 0)' : null, kafeLuar(o));
  }
  function latarJudul(o) { return latarLuar(o); }

  /* ---------- Layar bermain: dinding di belakang pelanggan, konter di depannya ---------- */
  function latarDinding() {
    if (gambar('latarDalam')) {
      /* gambar dinding; awan dan burung SVG tetap bergerak di dua panel kaca atas jendelanya */
      var gi = citra(gambar('latarDalam'), 0, 0, 1280, 440), kj = id('jd'), panel = gambar('jendelaDalam') || [];
      gi += '<clipPath id="' + kj + '">' + panel.map(function (p) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + p[2] + '" height="' + p[3] + '"/>'; }).join('') + '</clipPath>';
      if (panel.length) gi += '<g clip-path="url(#' + kj + ')">' + g(null, awan(panel[0][0] + 60, panel[0][1] + 52, 0.55), 'awan-a') + g(null, burung(panel[1][0] + 40, panel[1][1] + 40, 0.7), 'burung') + '</g>';
      return gi;
    }
    var s = '<rect width="1280" height="440" fill="' + W.persik + '"/>', x, lambris = terang(W.pandan, 0.5);
    s += '<rect y="372" width="1280" height="68" fill="' + lambris + '"/>' + garis('M0 372H1280', W.tinta, 4);
    for (x = 20; x < 1280; x += 40) s += garis('M' + x + ' 382V430', gelap(lambris, 0.12), 3);
    var kk = id('jk'), kaca = kotak(330, 134, 204, 210, 8), atap = campur(W.persik, W.kayu, 0.12);
    s += cel(kotak(316, 120, 232, 238, 16), W.kayu);
    s += '<clipPath id="' + kk + '"><path d="' + kaca + '"/></clipPath><path d="' + kaca + '" fill="' + W.krem + '"/>';
    s += '<g clip-path="url(#' + kk + ')">' + g(null, awan(392, 192, 0.55), 'awan-a') + g(null, burung(352, 158, 0.7), 'burung') +
      bentuk(kotak(326, 290, 70, 80, 6), atap, { lebar: 3 }) + bentuk(kotak(398, 270, 64, 100, 14), atap, { lebar: 3 }) + bentuk(kotak(466, 300, 74, 70, 6), atap, { lebar: 3 }) +
      '</g>' + bentuk(kaca, 'none');
    s += cel(kotak(424, 134, 16, 210, 0), W.kayu, { geser: [-3, 0], lebar: 3 }) + cel(kotak(330, 232, 204, 14, 0), W.kayu, { geser: [0, -3], lebar: 3 });
    return s;
  }
  /* Konter dilihat dari balik kasir. o.etalase: konter lebih pendek dan etalase kaca di rak bawah (Level 1-2). */
  function konter(o) {
    o = o || {};
    var atas = terang(W.kayu, 0.32), s = '', bawah = o.etalase ? 556 : 604;
    s += '<rect y="432" width="1280" height="' + (bawah - 428) + '" fill="' + atas + '"/>';
    s += garis('M40 474Q220 468 400 476T760 470M300 524Q520 518 740 526T1180 520' + (o.etalase ? '' : 'M60 570Q300 564 540 572T1000 566'), gelap(atas, 0.1), 3);
    s += cel(kotak(-12, 424, 1304, 22, 6), W.kayu, { geser: [0, -5] });
    s += '<rect y="' + bawah + '" width="1280" height="' + (720 - bawah) + '" fill="' + gelap(W.kayu, 0.35) + '"/>' + garis('M0 ' + bawah + 'H1280', W.tinta, 4);
    if (o.etalase) {
      var kaca = terang(W.persik, 0.55);
      s += cel(kotak(28, 566, 1224, 146, 18), kaca, { geser: [6, 6], bayang: gelap(kaca, 0.1) });
      s += garis('M48 700L108 578M76 700L124 604M1180 700L1236 584', 'rgba(255,255,255,0.65)', 6);
    }
    return s;
  }
  /* Dinding dan dapur di balik jendela saji (Level 1). Tanpa teks, jadi bisa dipanggang menjadi gambar. */
  function latarDapur() {
    var s = '<rect width="1280" height="440" fill="' + W.persik + '"/>', x, y, lambris = terang(W.pandan, 0.5);
    s += '<rect y="372" width="1280" height="68" fill="' + lambris + '"/>' + garis('M0 372H1280', W.tinta, 4);
    for (x = 20; x < 1280; x += 40) s += garis('M' + x + ' 382V430', gelap(lambris, 0.12), 3);
    /* isi dapur */
    var ubin = '#FBEFD9', d = '<rect x="340" y="110" width="600" height="290" fill="' + ubin + '"/>';
    for (x = 362; x < 940; x += 36) d += garis('M' + x + ' 110V400', campur(ubin, W.kayu, 0.16), 2);
    for (y = 132; y < 400; y += 36) d += garis('M340 ' + y + 'H940', campur(ubin, W.kayu, 0.16), 2);
    d += cel(kotak(360, 196, 560, 14, 4), W.kayu, { geser: [0, -3] });
    [[392, W.mangga], [436, W.jambu], [480, W.pandan]].forEach(function (t) {
      d += cel(kotak(t[0] - 15, 158, 30, 38, 8), terang(t[1], 0.35), { geser: [-3, -3] }) + cel(kotak(t[0] - 17, 150, 34, 12, 4), t[1], { geser: [-2, -2], lebar: 3 });
    });
    d += cel('M820 196Q820 164 852 164Q884 164 884 196Z', W.kayu, { geser: [-3, -3] }) + cel('M890 196Q890 172 912 172Q934 172 934 196Z', W.jambu, { geser: [-3, -3] });
    d += garis('M690 232H770', W.tinta, 4);
    d += tungkai('M704 232V280', gelap(W.krem, 0.2), 5) + cel(elips(704, 290, 10, 12), gelap(W.krem, 0.2), { geser: [-2, -2], lebar: 3 });
    d += tungkai('M736 232V276', W.kayu, 5) + cel(kotak(726, 276, 20, 22, 6), W.kayu, { geser: [-2, -2], lebar: 3 });
    d += cel(kotak(780, 316, 150, 70, 10), W.papan, { geser: [-4, -4] });
    d += bentuk(elips(810, 360, 7), W.krem, { lebar: 3 }) + bentuk(elips(840, 360, 7), W.krem, { lebar: 3 });
    d += cel('M820 316V290Q820 282 828 282H892Q900 282 900 290V316Z', W.jambu, { geser: [-3, -3] }) + garis('M810 290H910', W.tinta, 4);
    var kk = id('dp'), lubang = kotak(346, 120, 588, 262, 10);
    s += '<clipPath id="' + kk + '"><path d="' + lubang + '"/></clipPath><g clip-path="url(#' + kk + ')">' + d + '</g>';
    /* dinding kiri: lukisan cangkir dan tanaman pot */
    s += pelat(kotak(80, 128, 168, 128, 12)) + cel(kotak(80, 128, 168, 128, 12), W.kayu) + bentuk(kotak(94, 142, 140, 100, 6), W.krem, { lebar: 3 });
    s += g('translate(118 150) scale(0.78)', makanan('teh', { svg: true }));
    s += cel(kotak(116, 330, 96, 66, 12), W.jambu, { geser: [-4, -4] });
    [[-34, -8, 16, 40, -30], [0, -26, 16, 44, 0], [34, -8, 16, 40, 30], [-18, -20, 14, 36, -14], [18, -20, 14, 36, 14]].forEach(function (l) {
      s += '<g transform="translate(' + (164 + l[0]) + ' ' + (330 + l[1]) + ') rotate(' + l[4] + ')">' + cel(elips(0, -l[3] / 2, l[2], l[3] / 2), W.pandan, { geser: [-3, -3] }) + '</g>';
    });
    /* dinding kanan: jam dan rak cangkir */
    s += cel(elips(1112, 170, 46), W.krem, { geser: [-4, -4] }) + bentuk(elips(1112, 170, 38), 'none', { garis: W.kayu, lebar: 4 });
    for (x = 0; x < 12; x++) s += garis('M' + n(1112 + 31 * Math.sin(x * Math.PI / 6)) + ' ' + n(170 - 31 * Math.cos(x * Math.PI / 6)) + 'L' + n(1112 + 26 * Math.sin(x * Math.PI / 6)) + ' ' + n(170 - 26 * Math.cos(x * Math.PI / 6)), W.tinta, 3);
    s += garis('M1112 170V146M1112 170L1128 178', W.tinta, 5);
    s += cel(kotak(1000, 300, 236, 14, 4), W.kayu, { geser: [0, -3] });
    [1040, 1100, 1160].forEach(function (cx, i) { s += g('translate(' + (cx - 22) + ' 263) scale(0.85)', IKON.cangkir(i === 1)); });
    return s;
  }
  /* bingkai jendela saji dan ambangnya, digambar di depan Kak Lala */
  function kusenDapur() {
    var luar = kotak(326, 100, 628, 300, 20), dalam = kotak(346, 120, 588, 262, 10);
    return '<path d="' + luar + dalam + '" fill="' + W.kayu + '" fill-rule="evenodd" stroke="' + W.tinta + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M346 130H934V120H346Z" fill="' + gelap(W.kayu, 0.2) + '"/>' +
      pelat(kotak(312, 368, 656, 32, 12), 5) + cel(kotak(312, 368, 656, 32, 12), W.kayu, { geser: [0, -5] });
  }
  /* lampu gantung; ujung tali di (0,0) */
  function lampu(nyala) {
    return (nyala ? '<circle cx="0" cy="54" r="58" fill="' + terang(W.mangga, 0.5) + '" opacity="0.55"/>' : '') +
      garis('M0 0V30', W.tinta, 3) + cel('M-26 56Q-26 30 0 30Q26 30 26 56Z', nyala ? W.mangga : campur(W.krem, W.tinta, 0.2), { geser: [-3, -3] }) +
      bentuk(elips(0, 60, 9, 7), nyala ? W.putih : campur(W.krem, W.tinta, 0.1), { lebar: 3 });
  }
  /* Memanggang SVG tanpa teks menjadi gambar sekali saja, supaya lapisan diam tidak menambah elemen SVG yang hidup (GDD bagian 15). */
  var panggangan = {};
  function panggang(kunci, w, h, isi) {
    if (panggangan[kunci]) return panggangan[kunci];
    var src = svg(w, h, isi);
    panggangan[kunci] = new Promise(function (ok) {
      var url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' })), img = new Image();
      img.onload = function () { ok(url); };
      img.onerror = function () { ok('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src)); };
      img.src = url;
    });
    return panggangan[kunci];
  }
  /* cangkir layar muat: tinggi teh diatur lewat #muat-teh (y dan height) */
  function cangkirMuat() {
    var c = 'M30 44L36 112Q80 128 124 112L130 44Z', k = id('cm');
    return svg(200, 160, cel(elips(80, 126, 70, 18), W.putih, { geser: [-4, -3], bayang: '#E9E1D3' }) +
      tungkai('M128 62Q160 60 158 82Q156 102 124 100', W.putih, 9) +
      '<clipPath id="' + k + '"><path d="' + c + '"/></clipPath>' + cel(c, W.putih, { bayang: '#E9E1D3', lebar: 0 }) +
      '<g clip-path="url(#' + k + ')"><rect id="muat-teh" x="20" y="124" width="120" height="0" fill="#B45F2E"/>' +
      '<rect x="20" y="78" width="120" height="12" fill="' + W.pandan + '" opacity="0.9"/></g>' + bentuk(c, 'none') + bentuk(elips(80, 44, 50, 12), 'none'),
      { vb: '0 0 200 160' });
  }

  return {
    W: W, UANG: UANG, TOKOH: TOKOH,
    campur: campur, gelap: gelap, terang: terang, angka: angka, rp: rp,
    elips: elips, kotak: kotak, bentuk: bentuk, garis: garis, cel: cel, pelat: pelat, teks: teks, g: g, svg: svg,
    ikon: ikon, awan: awan, burung: burung, pohon: pohon, gambar: gambar,
    orang: orang, tokoh: tokoh, potret: potret, wajahTokoh: wajahTokoh, makanan: makanan, MAKANAN: MAKANAN,
    uangKertas: uangKertas, koin: koin, nampan: nampan, bayangKonter: bayangKonter, laci: laci,
    papanMenu: papanMenu, struk: struk, garisBilangan: garisBilangan, tangan: tangan, ekor: ekor,
    logo: logo, pita: pita, latarJudul: latarJudul, latarLuar: latarLuar, kafeLuar: kafeLuar, latarDinding: latarDinding, konter: konter,
    latarDapur: latarDapur, kusenDapur: kusenDapur, lampu: lampu, cangkirMuat: cangkirMuat, panggang: panggang
  };
})(window);
