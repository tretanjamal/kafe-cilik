/* Suara tiap tokoh lewat speechSynthesis. Ubah angkanya di sini bila kurang pas setelah didengarkan.
   jenis: p pria, w wanita; suara perangkat yang sejenis didahulukan. pitch: nada bila suaranya sejenis,
   pitchLain: bila perangkat hanya punya suara lawan jenis. rate: kecepatan.
   Brief bagian 9: nada 0,9-1,15 dan kecepatan 0,85-0,95, karena nada dan kecepatan ekstrem membuat ucapan sulit ditangkap.
   lang: bahasa bawaan tokoh. Instruksi Kak Lala memakai narasi id-ID; nama menu dan percakapan memakai en-US. */
window.SUARA = {
  namaPria: /david|mark|guy|james|george|daniel|fred|ryan|andrew|brian|christopher|eric|roger|steffan|thomas|andika|ardi|\bmale\b|pria|laki/i,
  /* instruksi berbahasa Indonesia (dibacakan bila "Bacakan instruksi" nyala) */
  narasi: { jenis: 'w', pitch: 1.05, pitchLain: 1.1, rate: 0.95 },
  tokoh: {
    lala: { jenis: 'w', pitch: 1.05, pitchLain: 1.1, rate: 0.9 },     // pemilik kafe: hangat dan jelas
    kasir: { jenis: 'w', pitch: 1.0, pitchLain: 1.0, rate: 0.9 },     // kartu kalimat kasir: netral
    sinta: { jenis: 'w', pitch: 1.05, pitchLain: 1.1, rate: 0.9 },    // riang
    hendra: { jenis: 'p', pitch: 0.92, pitchLain: 0.9, rate: 0.88 },  // tenang, sopan
    maya: { jenis: 'w', pitch: 1.12, pitchLain: 1.15, rate: 0.93 },   // ceria
    dimas: { jenis: 'p', pitch: 1.15, pitchLain: 1.15, rate: 0.95 }   // anak, bersemangat
  }
};
