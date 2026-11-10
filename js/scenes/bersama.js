/* Bersama: potongan adegan kafe yang dipakai hook dan Level 1: etalase, tokoh hidup (ekspresi dan gerak mulut),
   dan ucapan bahasa Inggris dengan sorot kata. */
(function (root) {
  var NS = 'http://www.w3.org/2000/svg';
  var Kafe = {
    /* x kiri tiap petak etalase (lebar 150) untuk n item, di dalam kaca x 28-1252 */
    letakEtalase: function (n) {
      var jarak = n > 4 ? 40 : 80, total = n * 150 + (n - 1) * jarak, x0 = 28 + (1224 - total) / 2, a = [];
      for (var i = 0; i < n; i++) a.push(Math.round(x0 + i * (150 + jarak)));
      return a;
    },
    /* item di etalase berupa tombol (bisa diketuk, Tab, Enter). o: label (nama tampil), aria (label pembaca layar), y */
    item: function (parent, id, x, onTap, o) {
      o = o || {};
      var it = Bahasa.item(id), b = U.h('button', 'item-etalase' + (o.label ? ' berlabel' : '') + (o.kecil ? ' kecil' : ''));
      b.type = 'button'; b.dataset.id = 'item-' + id; b.dataset.item = id;
      b.style.left = x + 'px'; b.style.top = (o.y || 568) + 'px';
      b.innerHTML = (o.kecil ? Seni.svg(88, 73, Seni.makanan(id), { vb: '0 0 120 100' }) : Seni.svg(132, 110, Seni.makanan(id), { vb: '0 0 120 100' })) + '<span class="label-item">' + UI.esc(it.nama) + '</span>';
      b.setAttribute('aria-label', o.aria || it.nama);
      b.addEventListener('pointerdown', function () { Aud.init(); });
      b.addEventListener('click', function () { if (onTap) onTap(id, b); });
      parent.appendChild(b);
      return b;
    },
    /* item muncul satu per satu dengan easeOutBack */
    muncul: function (el, tunda) {
      if (UI.kurangi) { el.style.opacity = 1; return Promise.resolve(); }
      el.style.opacity = 0;
      return Tween.wait(tunda || 0).then(function () {
        Aud.sfx('muncul');
        return Tween.run(320, function (e) { el.style.opacity = Math.min(1, e * 2); el.style.scale = (0.4 + 0.6 * e).toFixed(3); }, Ease.easeOutBack);
      }).then(function () { el.style.scale = ''; });
    },
    /* tokoh di lapisan SVG hidup; mengembalikan pengendali ekspresi, gerak mulut, dan letak */
    tokoh: function (induk, nama, x, y, s, o) {
      o = o || {};
      var g = document.createElementNS(NS, 'g'), dasar = o.eks || 'senang';
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + s + ')');
      var opsi = { tokoh: nama }, k;
      for (k in o) opsi[k] = o[k];
      g.innerHTML = '<g class="napas">' + Seni.orang(opsi) + '</g>';
      induk.appendChild(g);
      var wajah = g.querySelector('.wajah');
      return {
        g: g, x: x, y: y,
        eks: function (e) { dasar = e; wajah.innerHTML = Seni.wajahTokoh(nama, e); },
        mulut: function (buka) { wajah.innerHTML = Seni.wajahTokoh(nama, buka ? 'bicara' : dasar); },
        geser: function (x2, y2) { this.x = x2; this.y = y2; g.setAttribute('transform', 'translate(' + x2 + ' ' + y2 + ') scale(' + s + ')'); }
      };
    },
    /* ucapan bahasa Inggris. opsi: tokoh, balon, wajah (pengendali tokoh), tampil (false = tulisan disembunyikan), rate */
    ucap: function (teks, opsi) {
      opsi = opsi || {};
      var b = opsi.balon, w = opsi.wajah, n = teks.split(/\s+/).length, geser = opsi.geserKata || 0;
      if (b && !opsi.tanpaTulis) { if (opsi.tampil === false) b.dengarkan(); else b.tulis(opsi.tulisan || teks); }
      if (U.TEST) {
        var masalah = Bahasa.periksaKalimat(opsi.tulisan || teks);
        if (masalah.length) console.error('Kalimat bermasalah: ' + teks + ' (' + masalah.join(', ') + ')');
      }
      return Voice.say(teks, {
        tokoh: opsi.tokoh, lang: 'en-US', rate: opsi.rate,
        onWord: function (i) {
          if (b && opsi.tampil !== false) b.sorot(i < n ? i + geser : -1);
          if (w) w.mulut(i < n && i % 2 === 0);
        }
      });
    },
    /* "Lebih pelan": per potongan frasa pada kecepatan 0,8 dengan jeda antrean (GDD bagian 6).
       Kalimat Level 1 dipotong sesudah dua kata pertama: "Where is / the burger?" */
    ucapPelan: function (teks, opsi) {
      var potong = Bahasa.potongFrasa(teks).map(function (f) { return f.split(/\s+/); }), geser = 0, janji = null;
      opsi = opsi || {};
      if (opsi.balon) { if (opsi.tampil === false) opsi.balon.dengarkan(); else opsi.balon.tulis(teks); }
      potong.forEach(function (p) {
        var o = {}, k;
        for (k in opsi) o[k] = opsi[k];
        o.rate = 0.8; o.geserKata = geser; o.tanpaTulis = true; o.tulisan = teks;
        geser += p.length;
        janji = Kafe.ucap(p.join(' '), o);
      });
      return janji;
    }
  };
  root.Kafe = Kafe;
})(window);
