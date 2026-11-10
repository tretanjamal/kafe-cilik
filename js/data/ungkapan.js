/* Kalimat bahasa Inggris tetap. {item} diisi dari tabel menu lewat Bahasa.isi(), supaya tata bahasanya selalu cocok
   (a/an, kata tak terhitung, kata jamak). Kalimat Level 1 (This is ..., Where is ...?, That is ...) dirangkai di js/engine/bahasa.js. */
window.UNGKAPAN = {
  /* balon Bu Sinta di layar judul */
  judul: "I'd like {item}, please!",
  hook: {
    pesan: "Hello! I'd like {item}, please.",
    ulang: '{item}, please.',
    terima: 'Thank you!'
  },
  /* pelanggan (Level 2-4) */
  pelanggan: {
    salam: ['Good morning.', 'Hello!'],
    some: "I'd like some {jamak}, please.",
    jumlah: ['', 'One, please.', 'Two, please.', 'Three, please.'],
    tambah: 'Yes, {pesanan}, please.',
    ya: 'Yes, please.',
    tidakPesan: "I didn't order {item}.",
    berapa: 'How much is it?',
    bayar: 'Here you are.',
    terima: 'Thank you!'
  },
  /* kartu kalimat kasir (sisi berbicara, brief keputusan 8) */
  kasir: {
    sapa: 'Hello! What would you like?',
    lagi: 'Anything else?',
    berapaBanyak: 'How many {jamak}?',
    saji: 'Here you are.',
    tanyaHarga: 'How much is it?',
    kembali: "Here's your change.",
    pamit: 'Thank you. Have a nice day!'
  },
  /* pujian Kak Lala di Level 1 */
  pujian: ['Great!', 'Well done!', 'Very good!', 'Yes, that is right!']
};
