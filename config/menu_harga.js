/* Satu sumber menu dan tata bahasa (brief bagian 5, GDD bagian 7). Generator kalimat hanya merangkai dari tabel ini.
   jenis: hitung = benda tunggal (a/an + nama, jamak pakai -s), massa = tak terhitung (pakai wadah), jamak = namanya sudah jamak.
   satuan/satuanJamak: wadah untuk frasa pesanan. min/max: rentang harga per item (Rp, kelipatan 500).
   arti: nama dalam bahasa Indonesia untuk Buku Menu. putaran: kelompok di Level 1. */
(function (root) {
  root.MENU = {
    daftar: [
      { id: 'panekuk', nama: 'pancake', arti: 'panekuk', jenis: 'hitung', artikel: 'a', jamak: 'pancakes', min: 6000, max: 9000, putaran: 1 },
      { id: 'burger', nama: 'burger', arti: 'burger', jenis: 'hitung', artikel: 'a', jamak: 'burgers', min: 12000, max: 15000, putaran: 1 },
      { id: 'roti', nama: 'egg sandwich', arti: 'roti lapis telur', jenis: 'hitung', artikel: 'an', jamak: 'egg sandwiches', min: 8000, max: 12000, putaran: 1 },
      { id: 'eskrim', nama: 'ice cream', arti: 'es krim', jenis: 'massa', satuan: 'cup', satuanJamak: 'cups', min: 5000, max: 8000, putaran: 1 },
      { id: 'nasgor', nama: 'fried rice', arti: 'nasi goreng', jenis: 'massa', satuan: 'plate', satuanJamak: 'plates', min: 12000, max: 15000, putaran: 2 },
      { id: 'sate', nama: 'chicken satay', arti: 'sate ayam', jenis: 'massa', satuan: 'plate', satuanJamak: 'plates', min: 12000, max: 15000, putaran: 2 },
      { id: 'bakso', nama: 'meatball soup', arti: 'bakso', jenis: 'massa', satuan: 'bowl', satuanJamak: 'bowls', min: 10000, max: 14000, putaran: 2 },
      { id: 'pisgor', nama: 'banana fritters', arti: 'pisang goreng', jenis: 'jamak', satuan: 'plate', satuanJamak: 'plates', min: 5000, max: 8000, putaran: 2 },
      { id: 'teh', nama: 'tea', arti: 'teh', jenis: 'massa', satuan: 'cup', satuanJamak: 'cups', min: 2000, max: 4000, putaran: 3 },
      { id: 'susu', nama: 'milk', arti: 'susu', jenis: 'massa', satuan: 'glass', satuanJamak: 'glasses', min: 4000, max: 6000, putaran: 3 },
      { id: 'jeruk', nama: 'orange juice', arti: 'jus jeruk', jenis: 'massa', satuan: 'glass', satuanJamak: 'glasses', min: 5000, max: 8000, putaran: 3 },
      { id: 'air', nama: 'water', arti: 'air mineral', jenis: 'massa', satuan: 'bottle', satuanJamak: 'bottles', min: 2000, max: 4000, putaran: 3 }
    ],
    /* minimal sekian harga sesi berakhiran 000, supaya tingkat awal L3 dan L4 bisa memakai harga bulat */
    minimalBulat: 6
  };
})(typeof window !== 'undefined' ? window : globalThis);
