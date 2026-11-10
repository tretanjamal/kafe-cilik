/* Input: tombol anak lewat Pointer Events (klik) dan keyboard (Tab, Enter, panah), bunyi klik di bawah 100 ms.
   Disalin dari Lompat Waktu (asal gim 577). Bentuk tombol mengikuti komponen "kue tebal" Kafe Cilik (GDD bagian 12). */
(function (root) {
  var Input = {
    /* label: teks atau SVG. cls: utama | kedua | ketiga, ditambah kelas lain (ikon, alir).
       o: x, y, w, h, font (posisi dan ukuran di panggung), id (data-id untuk uji), aria (label untuk pembaca layar). */
    button: function (label, cls, onTap, o) {
      o = o || {};
      var b = U.h('button', 'tombol ' + (cls || 'utama'));
      b.type = 'button';
      b.innerHTML = '<span class="badan">' + label + '</span>';
      if (o.x != null) { b.style.left = o.x + 'px'; b.style.top = o.y + 'px'; }
      if (o.w != null) b.style.width = o.w + 'px';
      if (o.h != null) b.style.height = o.h + 'px';
      if (o.font) b.style.fontSize = o.font + 'px';
      if (o.aria) b.setAttribute('aria-label', o.aria);
      if (o.id) b.dataset.id = o.id;
      var sounded = false;
      b.addEventListener('pointerdown', function () {
        if (b.disabled) return;
        Aud.init(); Aud.sfx('click'); sounded = true;
      });
      b.addEventListener('click', function (e) {
        if (b.disabled) return;
        Aud.init();
        if (!sounded) Aud.sfx('click');   // keyboard atau uji
        sounded = false;
        if (onTap) onTap(e, b);
      });
      return b;
    },
    label: function (b, teks) { b.querySelector('.badan').innerHTML = teks; }
  };

  /* navigasi panah antartombol aktif (di dalam overlay teratas bila ada) */
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(k) < 0) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;   // kolom nama: panah menggeser kursor
    var ovs = document.querySelectorAll('.overlay');
    var scope = ovs.length ? ovs[ovs.length - 1] : document.getElementById('scene-root');
    var list = Array.prototype.filter.call(scope.querySelectorAll('button'), function (b) { return !b.disabled && b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden'; });
    if (!list.length) return;
    var cur = list.indexOf(document.activeElement);
    var dir = (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 1;
    var next = cur < 0 ? (dir > 0 ? 0 : list.length - 1) : (cur + dir + list.length) % list.length;
    list[next].focus();
    e.preventDefault();
  });
  /* cincin fokus hanya untuk pengguna keyboard */
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key === 'Enter' || e.key.indexOf('Arrow') === 0) document.body.classList.add('kibor'); });
  document.addEventListener('pointerdown', function () { document.body.classList.remove('kibor'); Aud.init(); }, { passive: true });
  root.Input = Input;
})(window);
