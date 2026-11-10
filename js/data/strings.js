/* Semua teks antarmuka berbahasa Indonesia, di satu tempat supaya mudah ditinjau guru.
   Instruksi maksimal 2 baris (sekitar 60 huruf di papan instruksi). Kalimat bahasa Inggris ada di js/data/ungkapan.js
   dan dirangkai oleh js/engine/bahasa.js dari tabel menu. */
window.STR = {
  judul: {
    a: 'KAFE', b: 'CILIK', papanNama: 'KAFE CILIK',
    lengkap: 'Kafe Cilik: Pesan, Bayar, dan Belanja in English',
    tagline: 'Pesan, Bayar, dan Belanja in English'
  },
  tombol: {
    mulai: 'MULAI', info: 'Informasi', referensi: 'Referensi', pengembang: 'Pengembang', lanjut: 'Lanjut', ulangi: 'Ulangi',
    ulangiLevel: 'Ulangi level', beranda: 'Beranda', tutup: 'Tutup', bukuMenu: 'Buku Menu', hasil: 'Hasil Belajarku', guru: 'Laporan Belajarku',
    sajikan: 'Sajikan', beri: 'Beri Kembalian'
  },
  ikon: {
    suaraNyala: 'Matikan semua suara', suaraMati: 'Nyalakan semua suara', layarPenuh: 'Layar penuh', keluarPenuh: 'Keluar dari layar penuh',
    fsDitolak: 'Layar penuh tidak tersedia di perangkat ini.', pengaturan: 'Pengaturan', dengarInstruksi: 'Dengarkan instruksi',
    dengarLagi: 'Dengar lagi', lebihPelan: 'Lebih pelan', bukuMenu: 'Buku Menu', jeda: 'Jeda', gembok: 'Terkunci'
  },
  muat: 'Menyiapkan kafe',
  muatTahu: 'Tahukah kamu? ',
  muatTips: [
    'Tea dibaca seperti "ti".',
    'Kita bilang an egg sandwich, karena egg diawali bunyi vokal.',
    'Fifteen dan fifty terdengar mirip. Dengarkan bagian akhirnya!',
    'Two cups of tea artinya dua cangkir teh.'
  ],
  putar: 'Putar perangkatmu supaya mendatar.',
  kas: 'Kas',
  menuDikenal: 'Menu',
  level: {
    nama: ['', 'Buka Kafe', 'Ambil Pesanan', 'Harga dan Total', 'Kembalian', 'Jam Sibuk'],
    judul: 'Level {n} {nama}'
  },
  hook: {
    ketuk: 'Ketuk panekuk.',
    salah: 'Bu Sinta ingin panekuk. Ketuk panekuk.',
    hebat: 'Hebat! Ayo kenali menu kita.'
  },
  l1: {
    putaran: ['Camilan', 'Makanan Nusantara', 'Minuman'],
    judulPutaran: 'Putaran {n}: {nama}',
    kenalan: 'Ketuk gambar untuk mendengar namanya.',
    kenalanLanjut: 'Sudah kenal semua? Tekan Lanjut.',
    dengar: 'Dengarkan Kak Lala, lalu ketuk yang ia sebut.',
    salah1: 'Belum tepat. Dengarkan lagi, lalu ketuk.',
    salah2: 'Jawabannya salah satu dari dua gambar yang menyala.',
    salah3: 'Lihat tangan. Ketuk gambar itu.',
    cocok: 'Seret kata ke gambar, atau ketuk kata lalu gambar.',
    pilihGambar: 'Sekarang ketuk gambarnya.',
    gambarKe: 'Gambar {n}',
    cocokSalah1: 'Belum cocok. Dengarkan katanya, lalu coba lagi.',
    cocokSalah2: 'Gambar yang cocok sedang menyala.',
    cocokSalah3: 'Lihat tangan. Pindahkan kata ke gambar itu.',
    pujian: ['Tepat!', 'Hebat!', 'Bagus sekali!', 'Kamu hebat!'],
    selesaiPutaran: 'Putaran {n} selesai!',
    selesai: 'Kamu sudah kenal semua menu Kafe Cilik!'
  },
  toko: {
    kartuSalah: 'Belum tepat. Pilih kalimat yang cocok untuk saat ini.',
    total: 'Total', judulMenu: 'MENU', belumTotal: 'Rp ?',
    selesai: 'Hebat! Semua pelanggan sudah terlayani.'
  },
  l2: {
    mulai: 'Pelanggan datang. Layani mereka dengan tepat!',
    sapa: 'Pelanggan datang. Pilih kalimat untuk menyapanya.',
    salahSapaKembali: 'Itu untuk memberi kembalian. Pelanggan baru datang.',
    salahSapaPamit: 'Itu untuk berpamitan. Pelanggan baru datang.',
    dengar: 'Dengarkan pesanannya baik-baik.',
    tanyaJumlah: 'Pelanggan ingin beberapa. Tanyakan jumlahnya.',
    howMany: 'How much untuk harga. How many untuk jumlah.',
    salahBelumSaji: 'Pesanannya belum siap. Tanyakan dulu jumlahnya.',
    lagi: 'Tanyakan apakah ada pesanan lain.',
    salahBelumHarga: 'Belum waktunya bertanya harga. Tanyakan pesanan lain.',
    ulang: 'Ulangi pesanan pelanggan dengan kalimat yang tepat.',
    aan: 'Pakai an sebelum bunyi vokal: {frasa}.',
    aKonsonan: 'Pakai a sebelum bunyi konsonan: {frasa}.',
    jamak: 'Perhatikan wadah dan jumlahnya: {frasa}.',
    jamakS: 'Lebih dari satu, tambah -s: {frasa}.',
    nampan: 'Ambil menu pesanan dari etalase, lalu tekan Sajikan.',
    saji: 'Pesanan lengkap! Pilih kalimat untuk menyajikan.',
    salahSajiKembali: 'Itu untuk kembalian. Sekarang kamu menyajikan.',
    salahSajiHarga: 'Itu untuk bertanya harga. Kamu sedang menyajikan.',
    lebih: 'Ada menu yang tidak dipesan. Ketuk menu itu di nampan.',
    kebanyakan: 'Terlalu banyak. Pesanan: {frasa}.',
    kurang1: 'Belum lengkap. Dengarkan pesanannya lagi.',
    kurang2: 'Kata yang menyala belum ada di nampan.',
    kurang3: 'Lihat tangan. Ambil menu itu dari etalase.'
  },
  l3: {
    harga: 'Dengarkan harganya, lalu pilih label yang tepat.',
    hargaLagi: 'Dengarkan harga berikutnya.',
    hargaSalah1: 'Dengarkan bedanya, lalu pilih lagi.',
    hargaSalah2: 'Dengarkan bedanya: -teen atau -ty. Lihat tangan.',
    hargaLain1: 'Belum tepat. Dengarkan lagi harganya.',
    hargaLain2: 'Dengarkan pelan-pelan, lalu lihat tangan.',
    siapPelanggan: 'Harga sudah lengkap. Pelanggan datang!',
    total: 'Lihat papan menu, lalu pilih totalnya.',
    angka: 'Ketik totalnya, lalu tekan OK.',
    lupaKali: 'Ada menu yang dipesan lebih dari satu. Kalikan jumlahnya.',
    lupaItem: 'Ada menu yang belum dihitung. Jumlahkan semuanya.',
    teenTyTotal: 'Hati-hati, angkanya tertukar: -teen atau -ty?',
    salahTotal: 'Belum tepat. Hitung lagi dengan papan menu.',
    rumus: 'Hitung: {rumus}.',
    rumusHasil: '{rumus} = {hasil}.',
    kartu: 'Pilih kalimat untuk menyebut totalnya.',
    kartuTeenTy: 'Angkanya tertukar. Dengarkan akhir kata: -teen atau -ty.',
    kartuSalah: 'Itu bukan totalnya. Pilih kalimat dengan angka yang tepat.',
    hapus: 'Hapus', ok: 'OK', layarKosong: '__.___'
  },
  l4: {
    awal: 'Pelanggan membayar. Beri kembalian yang tepat!',
    mulai: 'Hitung naik dari {total} ke {rp}. Ambil kembaliannya.',
    mulaiPas: 'Bandingkan uang dengan total, lalu tekan Beri Kembalian.',
    hitungNaik: 'Hitung naik',
    diNampan: 'Di nampan: {rp}',
    kurang: 'Kembaliannya kurang {rp}. Tambah uang dari laci.',
    kurangBelum: 'Belum sampai {rp}. Hitung naik lagi.',
    lebih: 'Terlalu banyak. Ketuk uang di nampan untuk mengembalikannya.',
    pasLebih: 'Uangnya pas, jadi tidak perlu kembalian.',
    kartu: 'Pilih kalimat untuk pelanggan.',
    pasKartu: 'Uangnya pas, jadi tidak ada kembalian.',
    kartuHarga: 'Harga sudah dibayar. Pilih kalimat yang lain.',
    kartuLagi: 'Pesanan sudah selesai. Pilih kalimat yang lain.'
  },
  l5: {
    mulai: 'Jam sibuk! Layani antrean sebelum teh di cangkir dingin.',
    mulaiSantai: 'Jam sibuk! Layani antrean pelanggan satu per satu.',
    total: 'Jumlahkan harga di struk, lalu pilih totalnya.',
    totalSalah: 'Belum tepat. Jumlahkan semua harga di struk.',
    sabar: 'Kesabaran pelanggan',
    sabarHabis: 'Tehnya dingin, bintang ke-3 lepas. Tidak apa-apa, lanjutkan!'
  },
  hasil: {
    judul: 'Hasil Belajarku',
    kuasai: 'Keterampilanku',
    status: { dikuasai: 'Sudah bisa', berkembang: 'Hampir bisa', latihan: 'Ayo latihan' },
    kosong: 'Ayo terus bermain untuk menguasai keterampilan baru.',
    latih: 'Ayo latih lagi',
    latihUmum: 'Main sekali lagi supaya makin lancar.',
    /* saran latihan dalam bahasa anak, satu per miskonsepsi (GDD bagian 10) */
    tip: {
      'item-terlewat': 'Dengarkan pesanan sampai akhir kalimat.',
      'item-lebih': 'Ambil hanya menu yang dipesan pelanggan.',
      jumlah: 'Perhatikan jumlahnya: two, three, atau a.',
      jamak: 'Ingat wadahnya: two cups of tea, bukan two tea.',
      'a-an': 'Pakai an sebelum bunyi vokal: an egg sandwich.',
      'how-much-many': 'How many untuk jumlah. How much untuk harga.',
      'ungkapan-situasi': 'Pilih kalimat yang cocok dengan saatnya.',
      'teen-ty': 'Dengarkan akhir angka: fif-TEEN itu 15, FIF-ty itu 50.',
      'lupa-item': 'Jumlahkan semua menu di nampan, jangan ada yang terlewat.',
      'lupa-kali': 'Pesan dua porsi? Harganya dihitung dua kali.',
      'kembalian-kurang': 'Hitung naik dari total sampai uang pelanggan.',
      'kembalian-lebih': 'Berhenti tepat di uang pelanggan, jangan lewat.',
      'uang-pas': 'Uang pas berarti tidak ada kembalian.',
      sabar: 'Bintang ke-3: layani pelanggan sebelum tehnya dingin.'
    },
    kas: 'Kas kafe: {rp}',
    lanjut: 'Lanjut', ulangi: 'Ulangi level'
  },
  /* kalimat keterampilan dalam bahasa anak (GDD bagian 4) */
  tag: {
    kosakata: 'Nama makanan dan minuman',
    pesanan: 'Memahami pesanan dan jumlahnya',
    'angka-harga': 'Memahami harga dalam bahasa Inggris',
    ungkapan: 'Kalimat yang tepat di kafe',
    total: 'Menghitung total belanja',
    kembalian: 'Memberi kembalian'
  },
  guru: {
    judul: 'Laporan Belajarku',
    catatan: 'Tanpa data pribadi; tersimpan hanya di perangkat ini.',
    kolomTag: 'Keterampilan', kolomStatus: 'Status', kolomBukti: 'Benar pada coba pertama',
    status: { dikuasai: 'Dikuasai', berkembang: 'Berkembang', latihan: 'Perlu latihan', belum: 'Belum dicoba' },
    nama: {
      kosakata: 'TP1 Nama 12 makanan dan minuman', pesanan: 'TP2 Pesanan lisan', 'angka-harga': 'TP3 Harga lisan',
      ungkapan: 'TP4 Ungkapan berbelanja', total: 'TP5 Total belanja', kembalian: 'TP6 Kembalian'
    },
    petunjuk3: 'Petunjuk ke-3 (diperagakan): {n} kali',
    level: 'Level selesai: {daftar}.', levelBelum: 'belum ada', bintang: '{n} bintang',
    misJudul: 'Miskonsepsi yang muncul: {daftar}.',
    mis: {
      'item-terlewat': 'item terlewat', 'item-lebih': 'item berlebih', jumlah: 'jumlah porsi salah', jamak: 'jumlah dan jamak (two tea)',
      'a-an': 'a atau an', 'how-much-many': 'how much dan how many', 'ungkapan-situasi': 'ungkapan tidak sesuai situasi',
      'teen-ty': '-teen dan -ty tertukar', 'lupa-item': 'lupa satu item', 'lupa-kali': 'lupa mengalikan jumlah',
      'kembalian-kurang': 'kembalian kurang', 'kembalian-lebih': 'kembalian lebih', 'uang-pas': 'uang pas dianggap perlu kembalian'
    },
    santai: 'Mode Santai: {s}',
    lama: 'Lama bermain: {m} menit',
    dikuasaiAturan: 'Dikuasai: minimal 5 kesempatan, 80% benar pada coba pertama.',
    cp: 'Capaian Pembelajaran Bahasa Inggris, Kepka BSKAP 046/H/KR/2025 (perlu diverifikasi).'
  },
  pilih: {
    judul: 'Pilih Level',
    terkunci: 'Selesaikan Level {n} dulu untuk membuka level ini.',
    belumAda: 'Level ini sedang dibuat dan belum ada di versi uji ini.',
    /* kafe berkembang: hiasan baru setelah level selesai (GDD bagian 19) */
    dekor: { 1: 'Lampu kafe kini menyala!', 2: 'Kafe dapat tanaman baru!', 3: 'Kafe dapat papan menu dan bendera hias!', 4: 'Kafe dapat meja dan kursi di luar!', 5: 'Kafe Cilik siap melayani jam sibuk!' },
    santai: 'Mode Santai', sertifikat: 'Sertifikat'
  },
  jeda: { judul: 'Jeda', lanjut: 'Lanjut', ulangi: 'Ulangi', pengaturan: 'Pengaturan', beranda: 'Beranda' },
  pengaturan: {
    judul: 'Pengaturan', nyala: 'Nyala', mati: 'Mati',
    musik: 'Musik', efek: 'Efek suara', suara: 'Suara tokoh', suaraCatatan: 'Memakai suara bawaan perangkat.',
    bacakan: 'Bacakan instruksi', teksLangsung: 'Teks langsung tampil', teksCatatan: 'Tulisan muncul tanpa menunggu suara.',
    santai: 'Mode Santai', santaiCatatan: 'Tanpa batas waktu.', kurangi: 'Kurangi animasi', kurangiCatatan: 'Diatur oleh perangkat ini.',
    identitas: 'Nama dan sekolah', identitasCatatan: 'Untuk sertifikat.', ubah: 'Ubah',
    muridBaru: 'Murid baru', muridBaruCatatan: 'Menghapus progres di perangkat ini.', hapus: 'Hapus progres', yakin: 'Ketuk lagi untuk hapus',
    tutup: 'Tutup'
  },
  /* Informasi (tab Tujuan, Cara Main, Misi), Referensi (tab Sumber Materi, Kecerdasan Artifisial), Pengembang (sama dengan gim lain kreator) */
  info: {
    info: {
      judul: 'Informasi',
      tab: { tujuan: 'Tujuan', cara: 'Cara Main', misi: 'Misi' },
      pengantar: 'Kafe Cilik butuh kasir baru! Bantu Kak Lala melayani pelanggan dalam bahasa Inggris.',
      tujuanJudul: 'Setelah bermain, kamu bisa:',
      tujuan: [
        'Mengenali nama 12 makanan dan minuman dalam bahasa Inggris.',
        'Memahami pesanan, termasuk jumlah dan wadahnya (two cups of tea).',
        'Memahami harga yang diucapkan, misalnya fifteen dan fifty.',
        'Memakai ungkapan berbelanja seperti How much is it? dan Here you are.',
        'Menghitung total belanja.',
        'Menghitung kembalian dengan cara hitung naik.'
      ],
      meta: 'Mata pelajaran Bahasa Inggris. Sekitar 20-25 menit untuk 5 level.',
      cara: [
        'Dengarkan pelanggan. Ketuk Dengar lagi atau Lebih pelan bila perlu.',
        'Ketuk menu di etalase untuk mengisi nampan, lalu tekan Sajikan.',
        'Pilih kartu kalimat yang tepat untuk menjawab pelanggan.',
        'Hitung total dan kembalian. Garis bilangan membantumu hitung naik.'
      ],
      caraCatatan: 'Tidak ada game over. Salah? Kak Lala memberi petunjuk. Buku Menu berisi nama menu, harga, ungkapan, dan angka.',
      misiJudul: 'Selesaikan level satu per satu:',
      misi: [
        ['Level 1 Buka Kafe', 'Kenali 12 makanan dan minuman.'],
        ['Level 2 Ambil Pesanan', 'Siapkan nampan untuk 6 pelanggan.'],
        ['Level 3 Harga dan Total', 'Pahami harga dan hitung totalnya.'],
        ['Level 4 Kembalian', 'Beri kembalian yang tepat.'],
        ['Level 5 Jam Sibuk', 'Layani antrean 8 pelanggan.']
      ],
      misiCatatan: 'Selesaikan kelima level untuk mendapat sertifikat!'
    },
    referensi: {
      judul: 'Referensi',
      tab: { sumber: 'Sumber Materi', ka: 'Kecerdasan Artifisial' },
      sumberPengantar: 'Sumber materi gim ini:',
      sumber: ['Emilia, E., Wijayanti, M.A., dkk. (2025).', 'Panduan Mata Pelajaran Bahasa Inggris.', 'Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.'],
      topik: 'Topik gim ini: Food, Drinks, Price, and Shopping (Bahasa Inggris).',
      huruf: 'Huruf Lilita One (Juan Montoreano) dan Andika (SIL International), lisensi SIL Open Font License.',
      kaPengantar: 'Pengembang memakai kecerdasan artifisial (KA) sebagai alat bantu.',
      ka: [
        ['Gambar', 'Dibuat dengan ChatGPT (OpenAI), lalu diolah oleh program.'],
        ['Musik', 'Musik latar dibuat dengan Suno.'],
        ['Kode dan teks', 'Disusun dengan bantuan Claude (Anthropic).'],
        ['Pemeriksaan', 'Diuji otomatis. Pengembang bertanggung jawab atas isinya.'],
        ['Saat bermain', 'Tanpa KA, tanpa internet, dan tidak mengirim data apa pun.']
      ],
      kaRujukanJudul: 'Rujukan',
      kaRujukan: ['Purwarianti, A., dkk. (2025).', 'Panduan Pemanfaatan Kecerdasan Artifisial untuk Guru PAUD, Pendidikan Dasar, dan Pendidikan Menengah.', 'Jakarta: Pusat Kurikulum dan Pembelajaran & Pusat Standar dan Kebijakan Pendidikan.']
    },
    pengembang: {
      judul: 'Pengembang',
      fotoAlt: 'Foto Jamaluddin',
      nama: 'Jamaluddin', sekolah: 'UPTD SMPN 2 Robatal', email: 'jamaluddin551@guru.smp.belajar.id', tahun: 'Tahun pembuatan: 2026',
      daftarJudul: 'Prestasi dan Pengalaman',
      daftar: [
        'Narasumber Digitalisasi Pembelajaran Kemendikdasmen',
        'Guru Pejuang Digital',
        'Juara 1 Lomba Inovasi Guru SMP Kabupaten Sampang 2026',
        'Juara 1 Guru Inspiratif SMP Kabupaten Sampang 2026',
        'Komunitas Belajar Terbaik BLPT Kemendikdasmen 2024'
      ]
    }
  },
  /* isian nama dan sekolah (boleh dilewati; hanya untuk sertifikat, hanya di perangkat ini) */
  identitas: {
    judul: 'Kenalan dulu, yuk!',
    ajak: 'Tulis nama dan sekolahmu untuk sertifikat. Boleh dilewati.',
    nama: 'Nama', sekolah: 'Sekolah', contohNama: 'Nama panggilanmu', contohSekolah: 'Nama sekolahmu',
    privasi: 'Hanya tersimpan di perangkat ini dan tidak dikirim ke mana pun.',
    simpan: 'Simpan', lewati: 'Lewati'
  },
  sertifikat: {
    judul: 'SERTIFIKAT', sub: 'Kasir Cilik Kafe Cilik', diberikan: 'diberikan kepada', tanpaNama: 'Kasir Cilik',
    selesai: 'yang telah melayani pelanggan dalam bahasa Inggris di gim Kafe Cilik: Pesan, Bayar, dan Belanja in English.',
    level: 'Level {n}', total: 'Total bintang: {n} dari 15', tanggal: 'Tanggal: {t}', ttd: 'Kak Lala', ttdPeran: 'Pemilik Kafe Cilik',
    bulan: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    simpan: 'Simpan sertifikat', berkas: 'Sertifikat Kafe Cilik',
    tersimpan: 'Sertifikat diunduh. Bila tidak ada, tekan lama gambarnya.', gagal: 'Sertifikat belum bisa disimpan di perangkat ini.',
    ubahNama: 'Ubah nama'
  },
  buku: {
    judul: 'Buku Menu', harga: 'Harga hari ini', dengar: 'Dengarkan {nama}',
    tab: { makanan: 'Makanan', minuman: 'Minuman', ungkapan: 'Ungkapan', angka: 'Angka' },
    /* ungkapan berbelanja dan artinya; kalimat Inggris sama dengan yang dipakai di gim */
    ungkapan: [
      ['Hello! What would you like?', 'Halo! Mau pesan apa?'],
      ["I'd like a pancake, please.", 'Saya mau satu panekuk.'],
      ['Can I have a cup of tea, please?', 'Boleh saya minta secangkir teh?'],
      ['Anything else?', 'Ada lagi?'],
      ['How many pancakes?', 'Mau berapa panekuk?'],
      ['Here you are.', 'Ini dia.'],
      ['How much is it?', 'Berapa harganya?'],
      ["It's fifteen thousand rupiah.", 'Harganya lima belas ribu rupiah.'],
      ["Here's your change.", 'Ini kembaliannya.'],
      ['Thank you. Have a nice day!', 'Terima kasih. Semoga harimu menyenangkan!']
    ],
    angkaCatatan: 'Bagian yang tebal diucapkan lebih keras.'
  }
};
