/* Scene: scaler 1280x720 (letterbox), loop rAF berbasis delta, manajer scene dengan transisi.
   Dari gim 221, ditambah: pendengar onFit (kanvas menyesuaikan resolusi) dan transisi 300 ms. */
(function (root) {
  var W = 1280, H = 720;
  var Stage = { el: null, scale: 1, fits: [], onFit: function (fn) { Stage.fits.push(fn); } };

  /* Scaler */
  function fit() {
    var vw = root.innerWidth, vh = root.innerHeight, tegak = vh > vw;
    /* HP yang dipegang tegak: panggung diputar 90 derajat, jadi gim langsung mendatar walau kunci rotasi tidak tersedia */
    var putar = tegak && U.HP, s = putar ? Math.min(vh / W, vw / H) : Math.min(vw / W, vh / H);
    Stage.scale = s; Stage.putar = putar;
    Stage.x = putar ? vw - (vw - H * s) / 2 : (vw - W * s) / 2;
    Stage.y = (vh - (putar ? W : H) * s) / 2;
    Stage.el.style.transform = 'translate(' + Stage.x + 'px,' + Stage.y + 'px)' + (putar ? ' rotate(90deg)' : '') + ' scale(' + s + ')';
    Stage.portrait = tegak && !putar;   // jendela tegak di komputer: ajakan memutar menutupi layar, permainan dan timer ikut berhenti
    document.getElementById('rotate').style.display = Stage.portrait ? 'flex' : 'none';
    Stage.fits.forEach(function (fn) { fn(s); });
  }
  /* koordinat layar -> koordinat kanvas logis */
  Stage.toLocal = function (cx, cy) {
    if (Stage.putar) return { x: (cy - Stage.y) / Stage.scale, y: (Stage.x - cx) / Stage.scale };
    return { x: (cx - Stage.x) / Stage.scale, y: (cy - Stage.y) / Stage.scale };
  };
  /* benda di luar panggung (kartu yang diseret): transform dan letak agar tengahnya di bawah jari */
  Stage.transformLuar = function () { return (Stage.putar ? 'rotate(90deg) ' : '') + 'scale(' + Stage.scale + ')'; };
  Stage.letakLuar = function (el, cx, cy) {
    var w = el.offsetWidth * Stage.scale, h = el.offsetHeight * Stage.scale;
    el.style.left = (Stage.putar ? cx + h / 2 : cx - w / 2) + 'px';
    el.style.top = (Stage.putar ? cy - w / 2 : cy - h / 2) + 'px';
  };

  /* Loop */
  var Loop = {
    fns: [], last: 0, paused: false,
    add: function (fn) { Loop.fns.push(fn); },
    remove: function (fn) { var i = Loop.fns.indexOf(fn); if (i >= 0) Loop.fns.splice(i, 1); },
    start: function () {
      function tick(ts) {
        var dt = Math.min(ts - Loop.last, 50) / 1000;
        Loop.last = ts;
        if (!Loop.paused && !Stage.portrait && dt > 0) {
          Tween.update(dt);
          for (var i = 0; i < Loop.fns.length; i++) Loop.fns[i](dt);
        }
        root.requestAnimationFrame(tick);
      }
      Loop.last = performance.now();
      root.requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', function () {
    var hid = document.hidden;
    Loop.paused = hid;
    if (!hid) Loop.last = performance.now();
    Aud.setHidden(hid);
    if (hid) Voice.stop();
  });

  /* Scenes */
  var Scenes = {
    reg: {}, cur: null, name: '', root: null, cover: null, busy: false,
    add: function (n, s) { Scenes.reg[n] = s; },
    go: function (name, params) {
      // transisi masih berjalan: simpan, jalankan setelahnya (mengetuk sangat cepat tidak boleh membuat macet)
      var key = name + JSON.stringify(params && { l: params.level, t: params.table });
      if (Scenes.busy) { if (key !== Scenes.target) { Scenes.pending = [name, params]; Scenes.target = key; } return Promise.resolve(); }   // klik ganda: abaikan
      Scenes.busy = true; Scenes.target = key;
      Tween.paused = false; UI.closeOverlays();   // panel tidak boleh tertinggal di layar lain
      /* alur layar lama berhenti di sini: animasinya tidak selesai dan tombolnya tidak bisa diketuk selama transisi */
      Tween.clear();
      Scenes.root.inert = true;
      var out = Scenes.cur ? Tween.run(150, function (e) { Scenes.cover.style.opacity = e; }, Ease.easeOutQuad) : Promise.resolve();
      return out.then(function () {
        if (Scenes.cur && Scenes.cur.exit) Scenes.cur.exit();
        Voice.stop(); Voice.buangTertahan();
        Tween.clear();
        Loop.fns.length = 0;
        /* Lanjutan janji layar lama (mis. suara yang baru dihentikan) berjalan sebagai microtask. Layar baru baru dibuka
           sesudah satu macrotask, supaya lanjutan itu masih melihat keadaan layar lama yang sudah mati, bukan keadaan baru. */
        return new Promise(function (ok) { setTimeout(ok, 0); });
      }).then(function () {
        Scenes.root.innerHTML = '';
        Scenes.root.inert = false;
        Scenes.name = name;
        Scenes.cur = Scenes.reg[name];
        Scenes.cur.enter(Scenes.root, params || {});
        if (Scenes.cur.update) Loop.add(Scenes.cur.update);
        return Tween.run(170, function (e) { Scenes.cover.style.opacity = 1 - e; }, Ease.easeOutQuad);
      }).then(function () {
        Scenes.busy = false;
        var p = Scenes.pending; Scenes.pending = null;
        if (p) return Scenes.go(p[0], p[1]);
      });
    }
  };

  function boot() {
    Stage.el = document.getElementById('stage');
    Scenes.root = document.getElementById('scene-root');
    Scenes.cover = document.getElementById('cover');
    root.addEventListener('resize', fit);
    root.addEventListener('orientationchange', fit);
    fit();
    Loop.start();
  }
  root.Stage = Stage; root.Loop = Loop; root.Scenes = Scenes; root.bootStage = boot;
})(window);
