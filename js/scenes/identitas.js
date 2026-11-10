/* Isian nama dan sekolah (permintaan kreator): muncul sekali sesudah hook (atau sebelum Pilih Level bila belum pernah ditanya).
   Boleh dilewati. Hanya dipakai untuk sertifikat dan hanya tersimpan di perangkat ini (Save.data.murid); "Murid baru" menghapusnya. */
(function () {
  Scenes.add('identitas', {
    enter: function (root, p) {
      var lanjut = p.lanjut || 'pilihLevel';
      Aud.musik('judul');
      var seni = U.h('div', 'lapis');
      seni.innerHTML = Seni.svg(1280, 720, Seni.latarLuar({ kafeX: 30, papanNama: STR.judul.papanNama, lampu: Save.selesai(1) }));
      root.appendChild(seni);
      setTimeout(function () { if (Scenes.name === 'identitas') UI.identitas(function () { Scenes.go(lanjut); }); }, 120);
    },
    uji: {
      keadaan: function () { return { langkah: 'identitas', siap: !!document.querySelector('[data-id="identitas-lewati"]') }; },
      benar: function () { return ['identitas-lewati']; },
      salah: function () { return []; }
    }
  });
})();
