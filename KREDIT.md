# KREDIT: Kafe Cilik: Pesan, Bayar, dan Belanja in English

Pengembang: Jamaluddin, UPTD SMPN 2 Robatal. Dibuat untuk Ruang Murid.

## Huruf (dibundel di `assets/fonts/`, lisensi di folder yang sama)
- **Lilita One** karya Juan Montoreano, SIL Open Font License 1.1 (`OFL-LilitaOne.txt`). Dipakai untuk judul, tombol, dan angka besar.
- **Andika** karya SIL International, SIL Open Font License 1.1 (`OFL-Andika.txt`). Dipakai untuk isi, instruksi, dan dialog.

## Gambar
- **Dibuat dengan ChatGPT (OpenAI) oleh kreator, 9 November 2026**, dari prompt di `docs/ASET-PROMPT.md`. Diproses dengan `tools/proses-aset.py`: dipotong, disesuaikan dengan tata letak, dan dikompres ke WebP.
  - `assets/img/latar-dalam.webp`: dinding kafe (prompt bagian 1).
  - `assets/img/makanan/*.webp`: 12 makanan dan minuman (prompt bagian 2a dan 2b).
  - `assets/img/latar-luar.webp`: langit, kota, dan trotoar (prompt bagian 3). Matahari di gambar dihapus dan diganti matahari SVG.
  - `assets/img/latar-dapur.webp`: dinding dan dapur Level 1 (prompt bagian 4).
  - Thumbnail 840x472: key art (prompt bagian 5) dengan judul dan balon yang ditulis kode (`tools/thumbnail.html`). Thumbnail tidak ikut zip.
  - `assets/img/tangan.webp`: tangan penunjuk, dibuat kreator dengan ChatGPT (`ui_hand_pointer.png`). Dipilih dari dua gambar karena bergaya datar bergaris tebal seperti seni gim. `tangan_penunjuk.png` (3D mengilap) tidak dipakai.
- `assets/img/pengembang.webp`: foto kreator sendiri untuk panel Pengembang, diserahkan kreator dan dipotong kepala-bahu.
- Gambar lain digambar dengan kode SVG di `js/engine/seni.js`, khusus untuk gim ini: tokoh, konter, laci, uang mainan, ikon, hiasan kafe, dan sertifikat (kanvas). Setiap gambar ChatGPT juga punya versi SVG cadangan, termasuk tangan penunjuk.
- Tidak ada model 3D. Meshy tidak dipakai (keputusan kreator, 9 November 2026).
- Uang mainan bergaya kartun dengan medali cangkir Kafe Cilik dan tulisan "UANG MAINAN", tanpa tokoh, lambang negara, logo Bank Indonesia, nomor seri, atau pola pengaman.

## Suara
- **Musik dibuat dengan Suno oleh kreator, 9 November 2026**, dari prompt di `docs/ASET-PROMPT.md` bagian 6: "Kafe Cilik Morning" (bermain), "Kafe Cilik Opening" (judul), dan "Kafe Cilik Rush Hour" (Level 5). Diproses dengan `tools/proses-aset.py` menjadi loop mono 64 kbps di `js/data/musik_bgm_*.js`.
  - **Perlu dilengkapi kreator sebelum terbit:** paket Suno yang dipakai. Paket gratis Suno tidak memberi hak pakai komersial.
- Bila berkas musik tidak ada, musik disintesis dengan WebAudio di `js/engine/audio.js`.
- Efek suara disintesis dengan WebAudio. Tidak ada berkas efek suara pihak ketiga.
- Suara tokoh memakai suara bawaan perangkat (speechSynthesis). Gim tetap bisa dimainkan tanpa suara karena tulisan selalu tersedia.

## Data murid
- Nama dan sekolah (boleh dilewati) hanya dipakai untuk sertifikat. Keduanya tersimpan di localStorage perangkat itu saja, tidak dikirim ke mana pun, dan terhapus lewat Pengaturan > Murid baru. Laporan Belajarku tidak menampilkan nama.

## Kode
- Mesin dipakai ulang dari gim kreator sebelumnya: Lompat Waktu (scene, tween, audio dan antrean suara, simpan, layar muat, layar penuh, pengaman ringan), yang berasal dari Kurir Kota dan Pabrik Ajaib. Hanya bagian 2D yang disalin.
- Pemrograman dibantu Claude Code (Anthropic).

## Alat pengembangan (tidak ikut zip)
- Playwright dan Google Chrome untuk uji otomatis dan tangkapan layar.
- Pillow, NumPy, SciPy, miniaudio, dan lameenc (LAME) di `tools/pylib` untuk memproses gambar dan musik.
