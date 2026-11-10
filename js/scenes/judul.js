/* Layar judul: logo, tagline, MULAI, Informasi, Referensi, Pengembang; fasad kafe hidup (GDD bagian 8).
   MULAI pertama kali memutar hook 10 detik; pemain lama langsung ke Pilih Level. */
(function () {
  var lepas = null;
  Scenes.add('judul', {
    enter: function (root) {
      Aud.musik('judul');
      var J = STR.judul, seni = U.h('div', 'lapis');
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarJudul({ papanNama: J.papanNama, lampu: Save.selesai(1) }) + Seni.logo(J.a, J.b) +
        Seni.pita(34, 356, 576, 58, J.tagline) + Seni.tokoh('sinta', 984, 284, 0.86, { penuh: true, tas: true }));
      root.appendChild(seni);
      root.appendChild(U.h('h1', 'tersembunyi', UI.esc(J.lengkap)));
      var mulai = Input.button(STR.tombol.mulai, 'utama', function () {
        Scenes.go(!Save.data.hook ? 'hook' : (Save.data.identitasDitanya ? 'pilihLevel' : 'identitas'), { lanjut: 'pilihLevel' });
      }, { x: 70, y: 446, w: 340, h: 100, font: 56, id: 'mulai' });
      root.appendChild(mulai);
      [['info', 40, 168], ['referensi', 220, 168], ['pengembang', 400, 184]].forEach(function (b) {
        root.appendChild(Input.button(STR.tombol[b[0]], 'ketiga', function () { UI.info(b[0]); }, { x: b[1], y: 578, w: b[2], h: 64, font: 24, id: b[0] }));
      });
      var balon = U.h('div', 'balon balon-judul');
      balon.style.cssText = 'left:936px;top:168px;width:326px;height:108px';
      balon.innerHTML = '<p class="ucapan" data-cek="balon judul">' + UI.esc(Bahasa.isi(UNGKAPAN.judul, 'panekuk')) + '</p>' + Seni.ekor('bawah');
      balon.querySelector('.ekor').style.left = '129px';
      root.appendChild(balon);
      lepas = UI.pojok(root);
      setTimeout(function () { if (mulai.isConnected) mulai.focus({ preventScroll: true }); }, 60);
    },
    exit: function () { if (lepas) lepas(); lepas = null; },
    uji: {
      keadaan: function () { return { langkah: 'judul', siap: true }; },
      benar: function () { return ['mulai']; },
      salah: function () { return []; }
    }
  });
})();
