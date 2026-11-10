/* Bahasa: frasa item, daftar, angka sebagai kata, kalimat Level 1, dan pemeriksa kalimat (GDD bagian 7 dan 11).
   Semua kalimat bahasa Inggris dirangkai dari MENU (config/menu_harga.js), tidak ditulis bebas.
   Angka dieja gaya en-US tanpa "and": 19500 menjadi "nineteen thousand five hundred". */
(function (root) {
  var SATU = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var PULUH = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  var JUMLAH = ['', 'a', 'two', 'three', 'four', 'five'];

  function bawahSeribu(n) {
    var s = [];
    if (n >= 100) { s.push(SATU[Math.floor(n / 100)] + ' hundred'); n %= 100; }
    if (n >= 20) s.push(PULUH[Math.floor(n / 10)] + (n % 10 ? '-' + SATU[n % 10] : ''));
    else if (n > 0) s.push(SATU[n]);
    return s.join(' ');
  }
  /* 0 sampai 999.999 */
  function ejaAngka(n) {
    if (!(n >= 0 && n < 1000000) || n !== Math.floor(n)) throw new Error('angka di luar jangkauan: ' + n);
    if (n === 0) return 'zero';
    var s = [];
    if (n >= 1000) { s.push(bawahSeribu(Math.floor(n / 1000)) + ' thousand'); n %= 1000; }
    if (n > 0) s.push(bawahSeribu(n));
    return s.join(' ');
  }
  /* "rupiah" tidak diberi akhiran -s */
  function ejaRupiah(n) { return ejaAngka(n) + ' rupiah'; }

  var peta = null;
  function item(id) {
    if (!peta) { peta = {}; root.MENU.daftar.forEach(function (it) { peta[it.id] = it; }); }
    var it = peta[id];
    if (!it) throw new Error('item tidak dikenal: ' + id);
    return it;
  }
  /* frasa pesanan: a plate of fried rice, two cups of tea, an egg sandwich, three burgers */
  function frasaItem(id, n) {
    var it = item(id);
    n = n || 1;
    if (it.satuan) return (n === 1 ? 'a ' + it.satuan : JUMLAH[n] + ' ' + it.satuanJamak) + ' of ' + it.nama;
    return n === 1 ? it.artikel + ' ' + it.nama : JUMLAH[n] + ' ' + it.jamak;
  }
  /* nama dengan artikel bila perlu: a pancake, an egg sandwich, fried rice, banana fritters */
  function namaArtikel(id) { var it = item(id); return it.jenis === 'hitung' ? it.artikel + ' ' + it.nama : it.nama; }
  function daftar(arr) {
    if (arr.length < 2) return arr[0] || '';
    if (arr.length === 2) return arr[0] + ' and ' + arr[1];
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
  }
  function jamak(id) { return item(id).jenis === 'jamak'; }
  /* Kalimat Level 1 */
  function kalimatIni(id) { return jamak(id) ? 'These are ' + item(id).nama + '.' : 'This is ' + namaArtikel(id) + '.'; }
  function kalimatCari(id) { return (jamak(id) ? 'Where are the ' : 'Where is the ') + item(id).nama + '?'; }
  function kalimatItu(id) { return jamak(id) ? 'Those are ' + item(id).nama + '.' : 'That is ' + namaArtikel(id) + '.'; }
  function besar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* Pemeriksa kalimat: daftar masalah, kosong berarti lolos. Dipanggil uji logika dan gim saat ?test=1. */
  function periksaKalimat(s) {
    var masalah = [], daftarItem = root.MENU.daftar, kecil = s.toLowerCase();
    if (!/^[A-Z]/.test(s)) masalah.push('tidak diawali huruf besar');
    if (!/[.?!]$/.test(s)) masalah.push('tidak diakhiri tanda baca');
    if (/\d/.test(s)) masalah.push('memuat angka digit');
    if (/\s{2,}/.test(s)) masalah.push('spasi ganda');
    var bilangan = '(two|three|four|five)', WADAH = ['cup', 'plate', 'bowl', 'glass', 'bottle'], WADAHJ = ['cups', 'plates', 'bowls', 'glasses', 'bottles'];
    if (new RegExp('\\ban?\\s(' + WADAHJ.join('|') + ')\\b').test(kecil)) masalah.push('wadah jamak sesudah a/an');
    if (new RegExp('\\b' + bilangan + '\\s(' + WADAH.join('|') + ')\\b').test(kecil)) masalah.push('wadah tunggal sesudah bilangan');
    daftarItem.forEach(function (it) {
      var nama = it.nama.replace(/ /g, '\\s');
      var vokal = /^[aeiou]/.test(it.nama);
      if (new RegExp('\\b' + (vokal ? 'a' : 'an') + '\\s' + nama + '\\b').test(kecil)) masalah.push('a/an salah: ' + it.nama);
      if (it.jenis !== 'hitung') {
        if (new RegExp('\\ban?\\s' + nama + '\\b').test(kecil)) masalah.push('a/an di depan kata tak terhitung: ' + it.nama);
        if (new RegExp('\\b' + bilangan + '\\s' + nama + '\\b').test(kecil)) masalah.push('jumlah tanpa wadah: ' + it.nama);
      } else if (new RegExp('\\b' + bilangan + '\\s' + nama + '\\b(?!e?s)').test(kecil)) {
        masalah.push('jamak tanpa -s: ' + it.nama);
      }
      var wadah = new RegExp('\\b(' + WADAH.concat(WADAHJ).join('|') + ')\\sof\\s' + nama + '\\b').exec(kecil);
      if (wadah && wadah[1] !== it.satuan && wadah[1] !== it.satuanJamak) masalah.push('wadah tidak sesuai tabel menu: ' + it.nama);
      if (new RegExp('\\b(this is|where is|that is)\\s(the\\s|a\\s|an\\s)?' + nama + '\\b').test(kecil) && it.jenis === 'jamak') masalah.push('is dengan kata jamak: ' + it.nama);
      if (new RegExp('\\b(these are|where are|those are)\\s(the\\s)?' + nama + '\\b').test(kecil) && it.jenis !== 'jamak') masalah.push('are dengan kata tunggal: ' + it.nama);
    });
    return masalah;
  }

  /* Kalimat pesanan dari [{id, n}]; templat bergilir supaya beragam (GDD bagian 11) */
  var TEMPLAT = ["I'd like {pesanan}, please.", 'Can I have {pesanan}, please?', '{Pesanan}, please.'];
  function frasaPesanan(isi) { return daftar(isi.map(function (b) { return frasaItem(b.id, b.n); })); }
  function kalimatPesanan(isi, t) {
    var f = frasaPesanan(isi);
    return TEMPLAT[(t || 0) % TEMPLAT.length].replace('{pesanan}', f).replace('{Pesanan}', besar(f));
  }
  /* "Lebih pelan": potongan frasa yang menjaga pembuka dan frasa item tetap utuh (GDD bagian 6):
     "I'd like two cups of tea and a pancake, please." menjadi "I'd like / two cups of tea / and a pancake, / please." */
  var PEMBUKA = ['Hello!', 'Good morning.', "I'd like", 'Can I have', 'Where is', 'Where are', 'This is', 'These are', 'That is', 'Those are',
    "It's", "That's", "I didn't order", 'How many', "Here's", 'Yes,'];
  function potongFrasa(teks) {
    var bagian = [], hasil = [];
    teks.split(', ').forEach(function (p, i, a) { (i < a.length - 1 ? p + ',' : p).split(/ (?=and )/).forEach(function (q) { bagian.push(q); }); });
    bagian.forEach(function (p) {
      for (var ulang = true; ulang;) {
        ulang = false;
        for (var k = 0; k < PEMBUKA.length; k++) {
          if (p.indexOf(PEMBUKA[k] + ' ') === 0) { hasil.push(PEMBUKA[k]); p = p.slice(PEMBUKA[k].length + 1); ulang = true; break; }
        }
      }
      if (p) hasil.push(p);
    });
    return hasil;
  }
  /* -teen dan -ty tertukar pada bagian ribuan: 15.000 menjadi 50.000, 13.500 menjadi 30.500, 50.000 menjadi 15.000 */
  function tukarTeenTy(n) {
    var k = Math.floor(n / 1000), r = n % 1000;
    if (k >= 13 && k <= 19) return (k % 10) * 10000 + r;
    if (k >= 30 && k <= 90 && k % 10 === 0) return (10 + k / 10) * 1000 + r;
    return null;
  }
  function kalimatHarga(n, gaya) { return gaya ? "That's " + ejaRupiah(n) + ', please.' : "It's " + ejaRupiah(n) + '.'; }

  var Bahasa = {
    ejaAngka: ejaAngka, ejaRupiah: ejaRupiah, item: item, frasaItem: frasaItem, namaArtikel: namaArtikel, daftar: daftar,
    kalimatIni: kalimatIni, kalimatCari: kalimatCari, kalimatItu: kalimatItu, besar: besar, periksaKalimat: periksaKalimat,
    TEMPLAT: TEMPLAT, frasaPesanan: frasaPesanan, kalimatPesanan: kalimatPesanan, potongFrasa: potongFrasa, tukarTeenTy: tukarTeenTy, kalimatHarga: kalimatHarga,
    /* isi {item} pada templat ungkapan dengan nama berartikel */
    isi: function (templat, id) { return templat.replace('{item}', namaArtikel(id)); }
  };
  root.Bahasa = Bahasa;
  if (typeof module !== 'undefined') module.exports = Bahasa;
})(typeof window !== 'undefined' ? window : globalThis);
