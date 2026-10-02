/* ═══════════════════════════════════════════════════════════════════
   ADC · ASESORÍA DIRECTA EN CALIDAD — script.js
   Sin dependencias obligatorias (Lenis es una mejora progresiva).
   Módulos: loader · scroll suave · header · reveal · hero FX ·
            explorador END · timelines · formulario → WhatsApp
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js-ready');
  /* Red de seguridad: si algo falla, el sitio nunca queda oculto */
  setTimeout(function () { root.classList.add('is-ready'); root.classList.remove('is-loading'); }, 12000);

  /* ───────── Utilidades ───────── */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WA_NUMBER = '528112056054';

  function safe(name, fn) {
    try { fn(); } catch (err) { if (window.console) console.warn('[ADC] módulo "' + name + '" falló:', err); }
  }

  /* ───────── Ticker único (un solo requestAnimationFrame para todo) ───────── */
  var tickers = [];
  var lastT = performance.now();
  function loop(now) {
    var dt = Math.min(64, now - lastT);
    lastT = now;
    for (var i = 0; i < tickers.length; i++) tickers[i](now, dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function onTick(fn) { tickers.push(fn); }

  /* ───────── Estado de scroll compartido ───────── */
  var S = { y: 0, v: 0, last: 0 };
  var scrollFns = [];
  var scrollQueued = false;
  function onScrollFrame(fn) { scrollFns.push(fn); }
  function handleScroll() {
    scrollQueued = false;
    S.y = window.pageYOffset || root.scrollTop || 0;
    for (var i = 0; i < scrollFns.length; i++) scrollFns[i](S.y);
  }
  window.addEventListener('scroll', function () {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(handleScroll); }
  }, { passive: true });
  window.addEventListener('resize', function () { requestAnimationFrame(handleScroll); }, { passive: true });
  /* velocidad de scroll suavizada (la usa el marquee) */
  onTick(function () {
    var y = window.pageYOffset || 0;
    S.v = lerp(S.v, y - S.last, .18);
    S.last = y;
  });

  /* ───────── Scroll suave (Lenis, mejora progresiva) ───────── */
  var lenis = null;
  function initSmoothScroll() {
    if (reduced || typeof window.Lenis === 'undefined') return;
    lenis = new window.Lenis({
      duration: 1.25,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: .9,
      touchMultiplier: 1.4
    });
    lenis.stop();
    onTick(function (now) { lenis.raf(now); });
  }
  function scrollToTarget(el, instant) {
    if (!el) return;
    if (lenis) { lenis.scrollTo(el, { offset: 0, duration: instant ? 0 : 1.7, immediate: !!instant }); return; }
    window.scrollTo({ top: el.getBoundingClientRect().top + (window.pageYOffset || 0), behavior: reduced || instant ? 'auto' : 'smooth' });
  }

  /* ───────── Loader ───────── */
  function initLoader() {
    var loader = $('#loader');
    if (!loader) { onReady(); return; }
    root.classList.add('is-loading');

    var pctEl = $('#ldPct'), bar = $('#ldBar'), prog = $('#ldProg'), status = $('#ldStatus');
    var CIRC = 2 * Math.PI * 58;
    var steps = [
      [0, 'Inicializando sistema de calidad'],
      [16, 'Calibrando instrumentos de medición'],
      [36, 'Cargando norma ISO 9001:2015'],
      [56, 'Verificando códigos ASME · AWS · API'],
      [76, 'Preparando inspección END'],
      [92, 'Sistema listo']
    ];
    var MIN = reduced ? 500 : 2800;
    var t0 = performance.now(), progress = 0, loaded = document.readyState === 'complete', finished = false, lastMsg = -1;
    window.addEventListener('load', function () { loaded = true; });

    function render(p) {
      var v = Math.round(p);
      pctEl.textContent = v < 10 ? '00' + v : v < 100 ? '0' + v : v;
      bar.style.transform = 'scaleX(' + (p / 100) + ')';
      prog.style.strokeDashoffset = (CIRC * (1 - p / 100)).toFixed(2);
      var idx = 0;
      for (var i = 0; i < steps.length; i++) if (p >= steps[i][0]) idx = i;
      if (idx !== lastMsg) { lastMsg = idx; status.textContent = steps[idx][1]; }
    }

    function frame(now, dt) {
      if (finished) return;
      var elapsed = now - t0;
      var target = easeOut(clamp(elapsed / MIN, 0, 1)) * 90;
      if (loaded && elapsed >= MIN) target = 100;
      progress += (target - progress) * clamp(dt * .0065, 0, 1);
      if (target === 100 && progress > 99.4) progress = 100;
      render(progress);
      if (progress >= 100) finish();
    }
    onTick(frame);

    function finish() {
      finished = true;
      status.textContent = 'Sistema listo';
      setTimeout(function () {
        loader.classList.add('is-done');
        setTimeout(onReady, 650);
        setTimeout(function () { loader.classList.add('is-gone'); }, 2200);
      }, 450);
    }
  }

  /* ───────── Al terminar el loader ───────── */
  var readyFns = [];
  var isReady = false;
  function whenReady(fn) { if (isReady) fn(); else readyFns.push(fn); }
  function onReady() {
    if (isReady) return;
    isReady = true;
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    if (lenis) lenis.start();
    readyFns.forEach(function (fn) { safe('ready', fn); });
    handleScroll();
  }

  /* ───────── Header, progreso, scrollspy y menú móvil ───────── */
  var menuOpen = false;
  var closeMenu = function () {};
  function initHeader() {
    var header = $('#siteHeader'), bar = $('#scrollBar'), hero = $('#inicio');
    var toTop = $('#toTop'), wa = $('#waFloat');
    var lastY = 0, hpLast = -1;

    onScrollFrame(function (y) {
      header.classList.toggle('is-scrolled', y > 24);
      if (!menuOpen) {
        if (y > 520 && y > lastY + 6) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y <= 520) header.classList.remove('is-hidden');
      }
      lastY = y;
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')';

      if (hero) {
        var hp = clamp(y / (hero.offsetHeight * .85), 0, 1);
        if (Math.abs(hp - hpLast) > .002) { hero.style.setProperty('--hp', hp.toFixed(3)); hpLast = hp; }
      }
      if (toTop) toTop.classList.toggle('is-visible', y > 900);
    });

    if (toTop) toTop.addEventListener('click', function () { scrollToTarget(document.body); if (!lenis) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

    /* WhatsApp flotante: aparece al terminar el loader; el globo se muestra un momento */
    whenReady(function () {
      setTimeout(function () { wa.classList.add('is-visible'); }, 900);
      setTimeout(function () { wa.classList.add('show-tip'); }, 6500);
      setTimeout(function () { wa.classList.remove('show-tip'); }, 12500);
    });

    /* Scrollspy */
    var links = $$('.nav-links a[data-spy]');
    var map = {};
    links.forEach(function (a) { map[a.dataset.spy] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) { a.classList.add('is-current'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

    /* Menú móvil */
    var burger = $('#burger'), menu = $('#mobileMenu');
    function setMenu(open) {
      menuOpen = open;
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      root.style.overflow = open ? 'hidden' : '';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open) header.classList.remove('is-hidden');
    }
    closeMenu = function () { if (menuOpen) setMenu(false); };
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeMenu(); }, { passive: true });
  }

  /* ───────── Enlaces ancla con scroll suave + preselección de servicio ───────── */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        var wasOpen = menuOpen;
        closeMenu();
        if (a.dataset.service) setService(a.dataset.service);
        /* si veníamos del menú móvil, esperamos a que se restablezca el scroll */
        setTimeout(function () { scrollToTarget(target); }, wasOpen ? 120 : 0);
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }
  function setService(value) {
    var sel = $('#f-servicio');
    if (!sel) return;
    for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text === value) { sel.selectedIndex = i; break; } }
  }

  /* ───────── Titulares: revelado palabra por palabra ───────── */
  function splitWords(el) {
    var i = 0;
    function walk(node, inherit) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var inn = document.createElement('span'); inn.className = 'w-in' + (inherit ? ' ' + inherit : '');
            inn.style.setProperty('--i', i++);
            inn.textContent = part;
            w.appendChild(inn); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          /* los degradados con background-clip no sobreviven a transformaciones en hijos:
             se "desenvuelven" y la clase pasa a cada palabra */
          if (child.classList.contains('grad')) {
            walk(child, child.className);
            while (child.firstChild) node.insertBefore(child.firstChild, child);
            node.removeChild(child);
          } else { walk(child, inherit); }
        }
      });
    }
    walk(el, '');
  }

  /* ───────── Reveal al hacer scroll ───────── */
  function initReveal() {
    $$('[data-stagger]').forEach(function (parent) {
      $$(':scope > [data-reveal]', parent).forEach(function (c, i) { c.style.setProperty('--d', (i * 90) + 'ms'); });
    });
    $$('[data-reveal][data-delay]').forEach(function (el) { el.style.setProperty('--d', el.dataset.delay + 'ms'); });
    $$('[data-split]').forEach(function (el) { splitWords(el); el.classList.add('is-split'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('is-in');
        io.unobserve(el);
        /* una vez revelado, el elemento recupera sus transiciones propias (hover, etc.) */
        if (el.hasAttribute('data-reveal')) {
          var d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
          setTimeout(function () { el.removeAttribute('data-reveal'); }, d + 1700);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    $$('[data-reveal], [data-split], [data-pipe]').forEach(function (el) { io.observe(el); });
  }

  /* ───────── Contadores ───────── */
  function initCounters() {
    var els = $$('[data-count]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = parseInt(el.dataset.count, 10) || 0, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
        var dur = 1800, t0 = null;
        if (reduced) { el.textContent = pre + to + suf; return; }
        requestAnimationFrame(function step(ts) {
          if (t0 === null) t0 = ts;
          var p = clamp((ts - t0) / dur, 0, 1);
          el.textContent = pre + Math.round(easeOut(p) * to) + suf;
          if (p < 1) requestAnimationFrame(step);
        });
      });
    }, { threshold: .6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ───────── Timelines ligados al scroll ───────── */
  function initTimelines() {
    var tls = $$('[data-tl]');
    if (!tls.length) return;
    onScrollFrame(function () {
      var vh = window.innerHeight;
      tls.forEach(function (tl) {
        var r = tl.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        var p = clamp((vh * .62 - r.top) / r.height, 0, 1);
        tl.style.setProperty('--p', p.toFixed(4));
        $$(':scope > li', tl).forEach(function (li) {
          var lr = li.getBoundingClientRect();
          li.classList.toggle('is-active', lr.top + Math.min(70, lr.height / 2) < vh * .64);
        });
      });
    });
  }

  /* ───────── Parallax de decoraciones ───────── */
  function initParallax() {
    var foot = $('.foot-giant');
    if (foot) foot.setAttribute('data-parallax', '-0.1');
    var items = $$('[data-parallax]').map(function (el) { return { el: el, f: parseFloat(el.dataset.parallax) || 0, vis: false }; });
    if (!items.length || reduced) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { items.forEach(function (it) { if (it.el === e.target) it.vis = e.isIntersecting; }); });
    }, { rootMargin: '25% 0px 25% 0px' });
    items.forEach(function (it) { io.observe(it.el); });
    onScrollFrame(function () {
      var vh = window.innerHeight;
      items.forEach(function (it) {
        if (!it.vis) return;
        var r = it.el.parentElement.getBoundingClientRect();
        var c = r.top + r.height / 2 - vh / 2;
        it.el.style.translate = '0 ' + (c * it.f).toFixed(1) + 'px';
      });
    });
  }

  /* ───────── Marquees (la velocidad reacciona al scroll) ───────── */
  function initMarquees() {
    $$('[data-marquee]').forEach(function (m) {
      var track = $('.marquee-track', m), first = $('.marquee-set', track);
      if (!track || !first) return;
      var base = parseFloat(m.dataset.speed) || 70;
      var dir = parseInt(m.dataset.dir || '-1', 10);
      var x = 0, w = 0, vis = true;

      function build() {
        $$('.marquee-set', track).slice(1).forEach(function (s) { s.remove(); });
        w = first.getBoundingClientRect().width;
        if (!w) return;
        var need = Math.ceil((m.clientWidth * 2) / w) + 1;
        for (var i = 0; i < need; i++) { var c = first.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
        if (dir > 0) x = -w; else x = 0;
      }
      build();
      window.addEventListener('resize', build, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
      window.addEventListener('load', build);

      new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(m);
      onTick(function (now, dt) {
        if (!vis || !w || reduced) return;
        var boost = Math.min(Math.abs(S.v) * 22, 520);
        x += dir * (base + boost) * dt / 1000;
        if (dir < 0 && x <= -w) x += w;
        if (dir > 0 && x >= 0) x -= w;
        track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     HERO · motor visual
     Capa 1 (netCanvas): red de nodos que reacciona al cursor.
     Capa 2 (fxCanvas): "soplete" recorriendo el anillo de soldadura del
     núcleo, con cordón que se enfría y chispas con física.
     ═══════════════════════════════════════════════════════════════════ */
  function initHeroFX() {
    var hero = $('#inicio'), net = $('#netCanvas'), fx = $('#fxCanvas'), core = $('#core');
    if (!hero || !net || !fx || !core) return;
    var nctx = net.getContext('2d'), fctx = fx.getContext('2d');
    var W = 0, H = 0, dpr = 1, visible = true;
    var nodes = [], sparks = [], trail = [];
    var mouse = { x: -9999, y: -9999, on: false };
    var ring = { cx: 0, cy: 0, r: 0 };
    var ang = -Math.PI / 2, emit = 0, bornAt = performance.now();
    var small = function () { return W < 700; };

    function resize() {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      [net, fx].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(clamp(W * H / (small() ? 16000 : 13500), 26, 96));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * 26, vy: (Math.random() - .5) * 26,
          r: Math.random() * 1.5 + .6, p: Math.random() * 6.28
        });
      }
    }
    function measureRing() {
      var cr = core.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      ring.cx = cr.left - hr.left + cr.width / 2;
      ring.cy = cr.top - hr.top + cr.height / 2;
      ring.r = core.offsetWidth * .34;
    }

    if (window.ResizeObserver) new ResizeObserver(resize).observe(hero);
    window.addEventListener('resize', resize, { passive: true });
    resize();

    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(hero);

    /* interacción */
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { mouse.on = false; });
    hero.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button')) return;
      var r = hero.getBoundingClientRect();
      burst(e.clientX - r.left, e.clientY - r.top, small() ? 22 : 34);
    });

    /* ── chispas ── */
    function spawn(x, y, dirA, spread, speed) {
      if (sparks.length > (small() ? 170 : 300)) return;
      var a = dirA + (Math.random() - .5) * spread;
      var sp = speed * (.35 + Math.random() * .85);
      sparks.push({
        x: x, y: y, px: x, py: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, max: .55 + Math.random() * 1.1,
        w: .7 + Math.random() * 1.3
      });
    }
    function burst(x, y, n) {
      for (var i = 0; i < n; i++) spawn(x, y, Math.random() * 6.28, .01, small() ? 230 : 320);
    }

    /* color de "temperatura": blanco → oro → naranja → rojo */
    var STOPS = [[0, 255, 247, 224], [.28, 255, 205, 70], [.62, 255, 120, 26], [1, 150, 38, 26]];
    function heat(u) { /* u: 0 (recién nacido) → 1 (frío) */
      u = clamp(u, 0, 1);
      for (var i = 1; i < STOPS.length; i++) {
        if (u <= STOPS[i][0]) {
          var a = STOPS[i - 1], b = STOPS[i], k = (u - a[0]) / (b[0] - a[0]);
          return [Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k)), Math.round(lerp(a[3], b[3], k))];
        }
      }
      return [150, 38, 26];
    }

    function drawNet(dt, t) {
      nctx.clearRect(0, 0, W, H);
      var link = small() ? 112 : 150, i, j, n, m;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx * dt / 1000; n.y += n.vy * dt / 1000;
        if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10;
        if (mouse.on) {
          var dx = n.x - mouse.x, dy = n.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150 && d2 > 1) { var d = Math.sqrt(d2), f = (1 - d / 150) * 38 * dt / 1000; n.x += dx / d * f; n.y += dy / d * f; }
        }
      }
      nctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          m = nodes[j];
          var ddx = n.x - m.x, ddy = n.y - m.y, dd = ddx * ddx + ddy * ddy;
          if (dd < link * link) {
            nctx.strokeStyle = 'rgba(70,211,247,' + ((1 - Math.sqrt(dd) / link) * .3).toFixed(3) + ')';
            nctx.beginPath(); nctx.moveTo(n.x, n.y); nctx.lineTo(m.x, m.y); nctx.stroke();
          }
        }
        if (mouse.on) {
          var mx = n.x - mouse.x, my = n.y - mouse.y, md = mx * mx + my * my;
          if (md < 175 * 175) {
            nctx.strokeStyle = 'rgba(160,230,255,' + ((1 - Math.sqrt(md) / 175) * .55).toFixed(3) + ')';
            nctx.beginPath(); nctx.moveTo(n.x, n.y); nctx.lineTo(mouse.x, mouse.y); nctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var a = .45 + .3 * Math.sin(t * .0016 + n.p);
        nctx.fillStyle = 'rgba(190,238,255,' + a.toFixed(2) + ')';
        nctx.beginPath(); nctx.arc(n.x, n.y, n.r, 0, 6.2832); nctx.fill();
        if (n.r > 1.5) {
          nctx.fillStyle = 'rgba(70,211,247,' + (a * .18).toFixed(3) + ')';
          nctx.beginPath(); nctx.arc(n.x, n.y, n.r * 5, 0, 6.2832); nctx.fill();
        }
      }
    }

    function drawFX(dt, t) {
      fctx.clearRect(0, 0, W, H);
      if (reduced) return;
      measureRing();
      var life = clamp((t - bornAt) / 1200, 0, 1); /* el soplete "enciende" suavemente */

      /* soplete: recorre el anillo */
      ang += dt / 1000 * .9;
      var hx = ring.cx + Math.cos(ang) * ring.r, hy = ring.cy + Math.sin(ang) * ring.r;
      trail.push({ x: hx, y: hy, t: t });
      while (trail.length && t - trail[0].t > 3400) trail.shift();

      fctx.globalCompositeOperation = 'lighter';
      fctx.lineCap = 'round';
      var i, p, q, u, c;
      for (i = 1; i < trail.length; i++) {
        p = trail[i - 1]; q = trail[i];
        u = (t - q.t) / 3400;
        c = heat(u * 1.15);
        var al = Math.pow(1 - u, 1.5) * .95 * life;
        fctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + al.toFixed(3) + ')';
        fctx.lineWidth = (small() ? 2.4 : 3.2) * (1 - u * .62);
        fctx.beginPath(); fctx.moveTo(p.x, p.y); fctx.lineTo(q.x, q.y); fctx.stroke();
      }

      /* resplandor del arco */
      var flick = .82 + Math.random() * .18;
      var R = (small() ? 20 : 30) * flick;
      var g = fctx.createRadialGradient(hx, hy, 0, hx, hy, R);
      g.addColorStop(0, 'rgba(255,255,255,' + (life).toFixed(2) + ')');
      g.addColorStop(.18, 'rgba(196,232,255,' + (.9 * life).toFixed(2) + ')');
      g.addColorStop(.45, 'rgba(255,170,60,' + (.42 * life).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(255,120,20,0)');
      fctx.fillStyle = g;
      fctx.beginPath(); fctx.arc(hx, hy, R, 0, 6.2832); fctx.fill();

      /* emisión de chispas (hacia afuera y hacia atrás del recorrido) */
      emit += dt / 1000 * (small() ? 70 : 120) * life;
      while (emit >= 1) {
        emit -= 1;
        spawn(hx, hy, ang - Math.PI / 4, 1.7, small() ? 210 : 300);
      }
      if (Math.random() < dt / 1000 * .9) {                       /* ráfaga ocasional */
        for (i = 0; i < 10; i++) spawn(hx, hy, ang - Math.PI / 4, 2.6, small() ? 250 : 350);
      }

      /* física de chispas */
      var gdt = dt / 1000;
      for (i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i];
        s.life += gdt;
        if (s.life >= s.max) { sparks.splice(i, 1); continue; }
        s.px = s.x; s.py = s.y;
        s.vy += 560 * gdt; s.vx *= .992; s.vy *= .992;
        s.x += s.vx * gdt; s.y += s.vy * gdt;
        var k = s.life / s.max;
        c = heat(k);
        fctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp((1 - k) * 1.5, 0, 1).toFixed(2) + ')';
        fctx.lineWidth = s.w * (1 - k * .5);
        fctx.beginPath(); fctx.moveTo(s.px, s.py); fctx.lineTo(s.x, s.y); fctx.stroke();
      }
      fctx.globalCompositeOperation = 'source-over';
    }

    onTick(function (now, dt) {
      if (!visible || document.hidden) return;
      drawNet(dt, now);
      drawFX(dt, now);
    });
  }

  /* ───────── Hero: palabra rotatoria ───────── */
  function initRotator() {
    var words = $$('.rot');
    if (words.length < 2 || reduced) return;
    var i = 0;
    setInterval(function () {
      var cur = words[i];
      i = (i + 1) % words.length;
      var nxt = words[i];
      cur.classList.remove('is-on'); cur.classList.add('is-off');
      nxt.classList.remove('is-off'); nxt.classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-off'); }, 1100);
    }, 3300);
  }

  /* ───────── Hero: checklist "Ruta ISO 9001" en bucle ───────── */
  function initRoute() {
    var items = $$('#route li'), bar = $('#routeBar'), pct = $('#routePct');
    if (!items.length) return;
    var step = 0;
    function render() {
      items.forEach(function (li, i) { li.classList.toggle('is-done', i < step); });
      var p = step / items.length;
      bar.style.transform = 'scaleX(' + p + ')';
      pct.textContent = Math.round(p * 100) + '%';
    }
    function next() {
      var done = step >= items.length;
      step = done ? 0 : step + 1;
      render();
      setTimeout(next, step >= items.length ? 3200 : (step === 0 ? 1100 : 1350));
    }
    render();
    if (!reduced) setTimeout(next, 1200); else { step = items.length; render(); }
  }

  /* ───────── Hero: parallax con el mouse en las tarjetas flotantes ───────── */
  function initHeroParallax() {
    var hero = $('#inicio');
    var cards = $$('.fcard').map(function (el) { return { el: el, d: parseFloat(el.dataset.depth) || 10 }; });
    if (!hero || !cards.length || reduced || !finePointer) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, vis = true;
    hero.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - .5) * 2;
      ty = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(hero);
    onTick(function () {
      if (!vis) return;
      cx = lerp(cx, tx, .06); cy = lerp(cy, ty, .06);
      cards.forEach(function (c) { c.el.style.translate = (cx * c.d).toFixed(2) + 'px ' + (cy * c.d).toFixed(2) + 'px'; });
    });
  }

  /* ───────── Efectos de interacción: spotlight, tilt, imán y halo de cursor ───────── */
  function initInteractions() {
    /* spotlight (delegación de eventos: un solo listener para toda la página) */
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('[data-spot]');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    if (!finePointer || reduced) return;

    /* tilt 3D */
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(700px) rotateX(' + (-py * 14).toFixed(2) + 'deg) rotateY(' + (px * 16).toFixed(2) + 'deg) translateZ(8px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    /* botones magnéticos */
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = (dx * .22).toFixed(1) + 'px ' + (dy * .3).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });

    /* halo que sigue al cursor */
    var glow = $('#cursorGlow');
    if (glow) {
      var tx = -999, ty = -999, gx = -999, gy = -999;
      document.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; glow.style.opacity = '1'; }, { passive: true });
      document.addEventListener('pointerleave', function () { glow.style.opacity = '0'; });
      onTick(function () {
        gx = lerp(gx, tx, .12); gy = lerp(gy, ty, .12);
        glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     EXPLORADOR DE MÉTODOS END
     Cuatro simulaciones en canvas (VT · MT · PT · UT). Son ilustrativas:
     explican visualmente cómo trabaja cada método.
     ═══════════════════════════════════════════════════════════════════ */
  function initExplorer() {
    var box = $('#explorer');
    if (!box) return;
    var tabs = $$('.xp-tab', box), panels = $$('.xp-panel', box);
    var cv = $('#xpCanvas'), ctx = cv.getContext('2d'), vp = cv.parentElement;
    var modeEl = $('#xpMode'), readEl = $('#xpRead');
    var mode = 'vt', W = 0, H = 0, s = 1, dpr = 1, visible = false, lastRead = '';
    var t0 = performance.now();

    function setRead(txt) { if (txt !== lastRead) { lastRead = txt; readEl.textContent = txt; } }

    /* ── pestañas (accesibles con teclado) ── */
    function select(m, focus) {
      mode = m; t0 = performance.now();
      tabs.forEach(function (tb) {
        var on = tb.dataset.mode === m;
        tb.classList.toggle('is-active', on);
        tb.setAttribute('aria-selected', on ? 'true' : 'false');
        tb.tabIndex = on ? 0 : -1;
        if (on && focus) tb.focus();
        if (on && tb.scrollIntoView && box.clientWidth < 1024) {
          var tabsEl = tb.parentElement; tabsEl.scrollTo({ left: tb.offsetLeft - 12, behavior: reduced ? 'auto' : 'smooth' });
        }
      });
      panels.forEach(function (p) { var on = p.id === 'panel-' + m; p.hidden = !on; p.classList.toggle('is-active', on); });
      modeEl.textContent = m.toUpperCase();
    }
    tabs.forEach(function (tb, i) {
      tb.addEventListener('click', function () { select(tb.dataset.mode); });
      tb.addEventListener('keydown', function (e) {
        var n = -1;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n > -1) { e.preventDefault(); select(tabs[n].dataset.mode, true); }
      });
    });

    function resize() {
      var r = vp.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = W / 640;
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(vp);
    window.addEventListener('resize', resize, { passive: true });
    resize();
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: .05 }).observe(box);

    /* ── primitivas de dibujo ── */
    function rr(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function bg() {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#050B1F'); g.addColorStop(1, '#0B1A42');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(90,150,255,.07)'; ctx.lineWidth = 1; ctx.beginPath();
      var st = 32 * s, x, y;
      for (x = 0; x < W; x += st) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (y = 0; y < H; y += st) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    }
    function plate(y0, y1) {
      var g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#3A4A6B'); g.addColorStop(.5, '#2A3858'); g.addColorStop(1, '#1B2745');
      ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
      ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1; ctx.beginPath();
      for (var y = y0 + 3; y < y1; y += 4) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.fillRect(0, y0, W, 1.5);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, y1 - 2, W, 2);
    }
    function bead(yc) {
      var hz = ctx.createLinearGradient(0, yc - 38 * s, 0, yc + 38 * s);
      hz.addColorStop(0, 'rgba(90,100,220,0)'); hz.addColorStop(.3, 'rgba(120,112,255,.2)'); hz.addColorStop(.5, 'rgba(255,170,70,.16)');
      hz.addColorStop(.7, 'rgba(120,112,255,.2)'); hz.addColorStop(1, 'rgba(90,100,220,0)');
      ctx.fillStyle = hz; ctx.fillRect(0, yc - 38 * s, W, 76 * s);
      var bg2 = ctx.createLinearGradient(0, yc - 16 * s, 0, yc + 16 * s);
      bg2.addColorStop(0, '#6E7B99'); bg2.addColorStop(.45, '#C2CCE0'); bg2.addColorStop(1, '#4C5875');
      ctx.fillStyle = bg2; ctx.fillRect(0, yc - 16 * s, W, 32 * s);
      var st = 11 * s;
      ctx.lineWidth = 1.7 * s;
      for (var x = -st; x < W + st; x += st) {
        ctx.strokeStyle = 'rgba(25,34,60,.55)'; ctx.beginPath(); ctx.arc(x - 7 * s, yc, 15.5 * s, -1.15, 1.15); ctx.stroke();
        ctx.strokeStyle = 'rgba(235,242,255,.4)'; ctx.beginPath(); ctx.arc(x - 5 * s, yc, 15.5 * s, -1.15, 1.15); ctx.stroke();
      }
    }
    function crackPts(yc) {
      var cx = W * .5, P = [[-34, -54], [-16, -38], [-26, -20], [-4, -6], [-14, 10], [10, 24], [4, 42], [24, 58]], out = [], tot = 0, i;
      for (i = 0; i < P.length; i++) out.push({ x: cx + P[i][0] * s, y: yc + P[i][1] * s, c: 0 });
      for (i = 1; i < out.length; i++) { tot += Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y); out[i].c = tot; }
      out.tot = tot;
      return out;
    }
    function along(pts, u) {
      var tg = u * pts.tot;
      for (var i = 1; i < pts.length; i++) {
        if (pts[i].c >= tg) {
          var k = (tg - pts[i - 1].c) / ((pts[i].c - pts[i - 1].c) || 1);
          return { x: lerp(pts[i - 1].x, pts[i].x, k), y: lerp(pts[i - 1].y, pts[i].y, k) };
        }
      }
      return pts[pts.length - 1];
    }
    function strokeCrack(pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
    function label(txt, x, y, col, size, align) {
      ctx.font = '600 ' + (size * s).toFixed(1) + 'px "JetBrains Mono", monospace';
      ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(txt, x, y);
    }

    /* ── VT · inspección visual: lupa que recorre el cordón ── */
    function sceneVT(t) {
      var yc = H * .52, y0 = H * .26, y1 = H * .78;
      plate(y0, y1); bead(yc);
      var marks = [{ x: .16, ok: true }, { x: .4, ok: true }, { x: .68, ok: false }, { x: .88, ok: true }];
      var lx = W * (.5 + .38 * Math.sin(t * .00055)), R = 56 * s, near = null, nd = 1e9;
      marks.forEach(function (m) {
        var mx = m.x * W, d = Math.abs(mx - lx), a = clamp(1 - (d - 34 * s) / (70 * s), 0, 1);
        if (d < nd) { nd = d; near = m; }
        var col = m.ok ? '#3DF0A0' : '#FFB020', bw = (m.ok ? 30 : 58) * s, bh = 17 * s, by = yc - 56 * s;
        ctx.save(); ctx.globalAlpha = .28 + .72 * a; ctx.strokeStyle = col; ctx.lineWidth = 1.6 * s;
        rr(mx - bw / 2, by - bh / 2, bw, bh, 4 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mx, by + bh / 2); ctx.lineTo(mx, yc - 20 * s); ctx.stroke();
        label(m.ok ? 'OK' : 'REVISAR', mx, by, col, 9.5);
        ctx.restore();
      });
      /* lupa: re-dibuja la escena ampliada dentro de un recorte circular */
      ctx.save();
      ctx.beginPath(); ctx.arc(lx, yc, R, 0, 6.2832); ctx.clip();
      ctx.translate(lx, yc); ctx.scale(1.85, 1.85); ctx.translate(-lx, -yc);
      plate(y0, y1); bead(yc);
      ctx.restore();
      var lg = ctx.createRadialGradient(lx - R * .3, yc - R * .35, 2, lx, yc, R);
      lg.addColorStop(0, 'rgba(255,255,255,.16)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, yc, R, 0, 6.2832); ctx.fill();
      ctx.save();
      ctx.strokeStyle = 'rgba(245,209,11,.95)'; ctx.lineWidth = 2.4 * s; ctx.shadowColor = 'rgba(245,209,11,.85)'; ctx.shadowBlur = 16 * s;
      ctx.beginPath(); ctx.arc(lx, yc, R, 0, 6.2832); ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineWidth = 1.2 * s; ctx.strokeStyle = 'rgba(245,209,11,.6)';
      ctx.beginPath(); ctx.moveTo(lx - R - 8 * s, yc); ctx.lineTo(lx - R * .35, yc); ctx.moveTo(lx + R * .35, yc); ctx.lineTo(lx + R + 8 * s, yc);
      ctx.moveTo(lx, yc - R - 8 * s); ctx.lineTo(lx, yc - R * .35); ctx.moveTo(lx, yc + R * .35); ctx.lineTo(lx, yc + R + 8 * s); ctx.stroke();
      ctx.restore();
      label('×1.85', lx, yc + R + 18 * s, 'rgba(245,209,11,.95)', 9.5);
      setRead('VT · Posición ' + Math.round(lx / W * 1200) + ' mm · ' + (nd < 48 * s ? (near.ok ? 'Cumple especificación' : 'Indicación a evaluar') : 'Inspeccionando cordón…'));
    }

    /* ── MT · partículas magnéticas fluorescentes ── */
    var MTP = [];
    for (var pi = 0; pi < 240; pi++) MTP.push({ u: Math.random(), hx: (Math.random() - .5) * 2, hy: (Math.random() - .5) * 2, r: 1.4 + Math.random() * 1.3, j: Math.random() * 6.28 });

    function sceneMT(t) {
      var yc = H * .52, y0 = H * .26, y1 = H * .78;
      plate(y0, y1); bead(yc);
      ctx.fillStyle = 'rgba(2,8,26,.64)'; ctx.fillRect(0, y0 - 2, W, y1 - y0 + 4);          /* luz negra UV-A */
      var p = (t % 8200) / 8200, g = easeInOut(clamp((p - .12) / .5, 0, 1)), fo = p > .88 ? 1 - (p - .88) / .12 : 1;
      var x1 = W * .16, x2 = W * .84, k, i;

      /* líneas de campo magnético */
      ctx.save();
      ctx.setLineDash([10 * s, 12 * s]); ctx.lineDashOffset = -t * .05; ctx.lineWidth = 1.4 * s;
      for (k = -2; k <= 2; k++) {
        ctx.strokeStyle = 'rgba(70,211,247,' + (.6 - Math.abs(k) * .1).toFixed(2) + ')';
        ctx.beginPath(); ctx.moveTo(x1, y0 + 6 * s);
        ctx.bezierCurveTo(x1 + (x2 - x1) * .28, yc + k * 30 * s, x1 + (x2 - x1) * .72, yc + k * 30 * s, x2, y0 + 6 * s);
        ctx.stroke();
      }
      ctx.restore();

      /* yugo electromagnético */
      var lw = 24 * s, top = H * .09, yg = ctx.createLinearGradient(0, top, 0, y0);
      yg.addColorStop(0, '#62749C'); yg.addColorStop(1, '#2B375E');
      ctx.fillStyle = yg; ctx.strokeStyle = 'rgba(70,211,247,.75)'; ctx.lineWidth = 1.4 * s;
      rr(x1 - lw / 2, top, lw, y0 - top + 8 * s, 5 * s); ctx.fill(); ctx.stroke();
      rr(x2 - lw / 2, top, lw, y0 - top + 8 * s, 5 * s); ctx.fill(); ctx.stroke();
      rr(x1 - lw / 2, top, x2 - x1 + lw, 22 * s, 6 * s); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(245,209,11,.85)';
      for (i = 0; i < 7; i++) ctx.fillRect(W * .5 - 66 * s + i * 20 * s, top + 4 * s, 11 * s, 14 * s);

      /* indicación: grieta + partículas que se acumulan */
      var cr = crackPts(yc), al = g * fo;
      ctx.strokeStyle = 'rgba(8,12,26,.9)'; ctx.lineWidth = 2.2 * s; ctx.lineJoin = 'round'; strokeCrack(cr);
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < MTP.length; i++) {
        var pt = MTP[i], tgt = along(cr, pt.u);
        var hx = tgt.x + pt.hx * 105 * s, hy = tgt.y + pt.hy * 80 * s;
        var x = lerp(hx, tgt.x + Math.sin(t * .004 + pt.j) * 1.6 * s, g), y = lerp(hy, tgt.y + Math.cos(t * .0037 + pt.j) * 1.6 * s, g);
        var a = (.35 + .65 * g) * fo;
        ctx.fillStyle = 'rgba(150,255,130,' + a.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(x, y, pt.r * s * (1 + g * .35), 0, 6.2832); ctx.fill();
      }
      ctx.save();
      ctx.shadowColor = 'rgba(130,255,120,.95)'; ctx.shadowBlur = 18 * s;
      ctx.strokeStyle = 'rgba(130,255,120,' + (.85 * al).toFixed(2) + ')'; ctx.lineWidth = 3.4 * s; strokeCrack(cr);
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(235,255,225,' + (.9 * al).toFixed(2) + ')'; ctx.lineWidth = 1.1 * s; strokeCrack(cr);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      if (al > .55) { ctx.save(); ctx.globalAlpha = al; ctx.strokeStyle = '#7CFF7A'; ctx.lineWidth = 1.4 * s; rr(cr[0].x - 46 * s, cr[0].y - 18 * s, 92 * s, 18 * s, 4 * s); ctx.stroke(); label('INDICACIÓN LINEAL', cr[0].x, cr[0].y - 9 * s, '#7CFF7A', 8.6); ctx.restore(); }
      setRead(p < .12 ? 'MT · Magnetizando la pieza con yugo…' : p < .62 ? 'MT · Aplicando partículas fluorescentes · luz UV-A' : 'MT · Discontinuidad lineal superficial detectada');
    }

    /* ── PT · líquidos penetrantes ── */
    function scenePT(t) {
      var yc = H * .52, y0 = H * .26, y1 = H * .78, ph = (t % 10400) / 10400;
      plate(y0, y1); bead(yc);
      var cr = crackPts(yc), i;
      ctx.strokeStyle = 'rgba(8,12,26,.92)'; ctx.lineWidth = 2.2 * s; ctx.lineJoin = 'round'; strokeCrack(cr);
      var fin = ph > .92 ? 1 - (ph - .92) / .08 : 1;
      var spray = clamp(ph / .22, 0, 1), wipe = clamp((ph - .22) / .18, 0, 1);
      var dev = clamp((ph - .4) / .2, 0, 1) * fin, bleed = clamp((ph - .62) / .3, 0, 1) * fin;

      /* 1 · penetrante rojo (aplicación) y 2 · remoción del excedente */
      if (ph < .42) {
        var xs = W * wipe, xe = W * spray;
        if (xe > xs) {
          var rg = ctx.createLinearGradient(xs, 0, xe, 0);
          rg.addColorStop(0, 'rgba(225,35,70,.58)'); rg.addColorStop(.92, 'rgba(225,35,70,.58)'); rg.addColorStop(1, 'rgba(225,35,70,0)');
          ctx.fillStyle = rg; ctx.fillRect(xs, y0, xe - xs, y1 - y0);
        }
        if (ph < .22) {                                                           /* boquilla del aerosol */
          ctx.save(); ctx.translate(xe, y0 - 22 * s);
          ctx.fillStyle = '#C9D4EC'; rr(-10 * s, -34 * s, 20 * s, 34 * s, 4 * s); ctx.fill();
          ctx.fillStyle = '#E12346'; ctx.fillRect(-10 * s, -22 * s, 20 * s, 7 * s);
          ctx.fillStyle = 'rgba(225,35,70,.42)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30 * s, 52 * s); ctx.lineTo(30 * s, 52 * s); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        if (ph > .04) { ctx.strokeStyle = 'rgba(235,45,85,.95)'; ctx.lineWidth = 2.8 * s; strokeCrack(cr); }
      }
      /* 3 · revelador (polvo blanco) */
      if (dev > 0) {
        ctx.fillStyle = 'rgba(238,243,252,' + (.88 * dev).toFixed(3) + ')'; ctx.fillRect(0, y0, W, y1 - y0);
        ctx.fillStyle = 'rgba(180,195,225,' + (.2 * dev).toFixed(3) + ')';
        for (i = 0; i < 90; i++) { var gx = (i * 97.3 % W), gy = y0 + (i * 53.7 % (y1 - y0)); ctx.fillRect(gx, gy, 1.5, 1.5); }
      }
      /* 4 · el penetrante sale y revela la indicación */
      if (bleed > 0) {
        for (i = 0; i < 16; i++) {
          var q = along(cr, i / 15), r = (5 + 22 * bleed) * s * (.7 + .3 * Math.sin(i * 1.7));
          var gr = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
          gr.addColorStop(0, 'rgba(225,25,70,' + (.9 * bleed).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(225,25,70,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 6.2832); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(200,15,60,' + (.95 * bleed).toFixed(2) + ')'; ctx.lineWidth = 2.6 * s; strokeCrack(cr);
        if (bleed > .55) { ctx.save(); ctx.globalAlpha = bleed; ctx.strokeStyle = '#D6204A'; ctx.lineWidth = 1.4 * s; rr(cr[0].x - 44 * s, cr[0].y - 20 * s, 88 * s, 18 * s, 4 * s); ctx.stroke(); label('INDICACIÓN', cr[0].x, cr[0].y - 11 * s, '#FF5A7A', 9); ctx.restore(); }
      }
      setRead(ph < .22 ? 'PT · 1/4 Aplicación del penetrante' : ph < .4 ? 'PT · 2/4 Remoción del exceso' : ph < .62 ? 'PT · 3/4 Aplicación del revelador' : 'PT · 4/4 Indicación revelada en superficie');
    }

    /* ── UT · ultrasonido de haz angular + pantalla A-scan ── */
    function segDist(px, py, A, B) {
      var abx = B.x - A.x, aby = B.y - A.y, u = clamp(((px - A.x) * abx + (py - A.y) * aby) / (abx * abx + aby * aby), 0, 1);
      return { d: Math.hypot(px - (A.x + abx * u), py - (A.y + aby * u)), u: u };
    }
    function sceneUT(t) {
      var xa = W * .06, xb = W * .94, yT = H * .22, yB = H * .43, th = yB - yT, wx = W * .62, leg = th * Math.SQRT2, tot = 2 * leg;
      /* sección de la placa */
      var g = ctx.createLinearGradient(0, yT, 0, yB); g.addColorStop(0, '#41527A'); g.addColorStop(1, '#27345A');
      ctx.fillStyle = g; ctx.fillRect(xa, yT, xb - xa, th);
      ctx.fillStyle = 'rgba(205,214,235,.26)';
      ctx.beginPath(); ctx.moveTo(wx - 40 * s, yT); ctx.lineTo(wx + 40 * s, yT); ctx.lineTo(wx + 10 * s, yB); ctx.lineTo(wx - 10 * s, yB); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,200,90,.6)'; ctx.lineWidth = 1 * s; ctx.setLineDash([4 * s, 4 * s]); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.2; ctx.strokeRect(xa, yT, xb - xa, th);

      var fx = wx + 6 * s, fy = yT + th * .56, fr = 6.5 * s;
      var px = W * (.18 + .26 * (.5 + .5 * Math.sin(t * .00045)));
      var A = { x: px, y: yT }, B = { x: px + th, y: yB }, C = { x: px + 2 * th, y: yT };
      var h1 = segDist(fx, fy, A, B), h2 = segDist(fx, fy, B, C), dmin = Math.min(h1.d, h2.d);
      var hit = dmin < 15 * s, hitLen = h1.d <= h2.d ? h1.u * leg : leg + h2.u * leg, amp = hit ? clamp(1 - dmin / (15 * s), 0, 1) : 0;

      /* discontinuidad */
      ctx.save(); ctx.translate(fx, fy);
      ctx.fillStyle = hit ? 'rgba(255,90,90,.95)' : 'rgba(10,14,30,.9)';
      if (hit) { ctx.shadowColor = '#FF5A5A'; ctx.shadowBlur = 14 * s; }
      ctx.beginPath(); ctx.moveTo(-fr, 0); ctx.lineTo(-fr * .3, -fr * .9); ctx.lineTo(fr * .8, -fr * .4); ctx.lineTo(fr, fr * .5); ctx.lineTo(0, fr * .9); ctx.closePath(); ctx.fill();
      ctx.restore();

      /* haz */
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(70,211,247,.13)'; ctx.lineWidth = 15 * s; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.stroke();
      ctx.save(); ctx.setLineDash([8 * s, 7 * s]); ctx.lineDashOffset = -t * .03; ctx.strokeStyle = 'rgba(120,225,255,.95)'; ctx.lineWidth = 1.8 * s;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.stroke(); ctx.restore();
      var pl = ((t * .0006) % 1) * tot, pp = pl < leg ? { x: lerp(A.x, B.x, pl / leg), y: lerp(A.y, B.y, pl / leg) } : { x: lerp(B.x, C.x, (pl - leg) / leg), y: lerp(B.y, C.y, (pl - leg) / leg) };
      var pg = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, 13 * s); pg.addColorStop(0, 'rgba(255,255,255,1)'); pg.addColorStop(.4, 'rgba(120,225,255,.7)'); pg.addColorStop(1, 'rgba(70,211,247,0)');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(pp.x, pp.y, 13 * s, 0, 6.2832); ctx.fill();
      if (hit) {
        var ph = (t * .0035) % 1;
        ctx.strokeStyle = 'rgba(255,110,110,' + ((1 - ph) * amp).toFixed(2) + ')'; ctx.lineWidth = 1.6 * s;
        ctx.beginPath(); ctx.arc(fx, fy, fr + ph * 24 * s, 0, 6.2832); ctx.stroke();
      }

      /* palpador con zapata a 45° (recortado para no invadir la placa) */
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, yT); ctx.clip();
      ctx.translate(A.x, A.y); ctx.rotate(Math.PI / 4);
      var prg = ctx.createLinearGradient(0, -10 * s, 0, 10 * s); prg.addColorStop(0, '#FFE060'); prg.addColorStop(1, '#D79A00');
      ctx.fillStyle = prg; rr(-50 * s, -10 * s, 44 * s, 20 * s, 3 * s); ctx.fill();
      ctx.fillStyle = '#1B2540'; ctx.fillRect(-6 * s, -10 * s, 7 * s, 20 * s);
      ctx.restore();
      ctx.strokeStyle = 'rgba(210,220,245,.6)'; ctx.lineWidth = 1.6 * s;
      ctx.beginPath(); ctx.moveTo(A.x - 32 * s, A.y - 32 * s); ctx.quadraticCurveTo(A.x - 56 * s, A.y - 40 * s, A.x - 78 * s, A.y - 20 * s); ctx.stroke();

      /* pantalla A-scan */
      var sx0 = W * .06, sx1 = W * .94, sy0 = H * .53, sy1 = H * .85, sw = sx1 - sx0, sh = sy1 - sy0, base = sy1 - 15 * s, i;
      ctx.fillStyle = '#03130E'; rr(sx0, sy0, sw, sh, 10 * s); ctx.fill();
      ctx.strokeStyle = 'rgba(80,255,160,.16)'; ctx.lineWidth = 1; ctx.beginPath();
      for (i = 1; i < 10; i++) { ctx.moveTo(sx0 + sw * i / 10, sy0); ctx.lineTo(sx0 + sw * i / 10, sy1); }
      for (i = 1; i < 5; i++) { ctx.moveTo(sx0, sy0 + sh * i / 5); ctx.lineTo(sx1, sy0 + sh * i / 5); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(80,255,160,.45)'; rr(sx0, sy0, sw, sh, 10 * s); ctx.stroke();
      var xAt = function (len) { return sx0 + 18 * s + (len / tot) * (sw - 36 * s); };
      if (hit) { ctx.fillStyle = 'rgba(255,176,32,.12)'; ctx.fillRect(xAt(hitLen) - 22 * s, sy0 + 6 * s, 44 * s, sh - 12 * s); ctx.strokeStyle = 'rgba(255,176,32,.7)'; ctx.lineWidth = 1; ctx.strokeRect(xAt(hitLen) - 22 * s, sy0 + 6 * s, 44 * s, sh - 12 * s); }
      var spikes = [{ x: xAt(0) + 4 * s, a: .74, w: 7 * s }];
      if (hit) spikes.push({ x: xAt(hitLen), a: .16 + .56 * amp, w: 6 * s });
      ctx.save(); ctx.shadowColor = 'rgba(100,255,170,.9)'; ctx.shadowBlur = 9 * s;
      ctx.strokeStyle = '#6BFFB5'; ctx.lineWidth = 1.7 * s; ctx.lineJoin = 'round'; ctx.beginPath();
      for (var x = sx0 + 3; x <= sx1 - 3; x += 2) {
        var n = (Math.sin(x * .9 + t * .02) + Math.sin(x * 2.3 - t * .031) + Math.sin(x * .37 + t * .013)) * .5 * s * 1.1, y = base - Math.abs(n);
        for (i = 0; i < spikes.length; i++) y -= spikes[i].a * (sh - 34 * s) * Math.exp(-Math.pow((x - spikes[i].x) / spikes[i].w, 2)) * (1 + .05 * Math.sin(t * .03 + i));
        if (x === sx0 + 3) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
      label('A-SCAN', sx0 + 34 * s, sy0 + 14 * s, 'rgba(120,255,180,.85)', 8.6);
      if (hit) label('ECO', xAt(hitLen), sy0 + 16 * s, '#FFB020', 8.6);
      setRead(hit ? 'UT · Haz angular 45° · Eco de indicación a ' + Math.round(hitLen / s * .22) + ' mm de recorrido' : 'UT · Haz angular 45° · Barriendo la soldadura…');
    }

    var scenes = { vt: sceneVT, mt: sceneMT, pt: scenePT, ut: sceneUT };
    onTick(function (now) {
      if (!visible || document.hidden || !W) return;
      var t = now - t0;
      bg();
      scenes[mode](t);
    });
    select('vt');
  }

  /* ───────── Capacitación: filtros animados ───────── */
  function initFilters() {
    var btns = $$('.filter'), items = $$('.course');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        btns.forEach(function (b) { var on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        items.forEach(function (c) {
          var show = f === 'all' || c.dataset.cat === f;
          if (show && c.hidden) {
            c.hidden = false;
            requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('is-leaving'); }); });
          } else if (!show && !c.hidden) {
            c.classList.add('is-leaving');
            setTimeout(function () { if (c.classList.contains('is-leaving')) c.hidden = true; }, 360);
          }
        });
      });
    });
  }

  /* ───────── FAQ (acordeón accesible) ───────── */
  function initFaq() {
    var qs = $$('.qa-q');
    qs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qa = btn.closest('.qa'), open = !qa.classList.contains('is-open');
        $$('.qa.is-open').forEach(function (o) {
          if (o !== qa) { o.classList.remove('is-open'); $('.qa-q', o).setAttribute('aria-expanded', 'false'); }
        });
        qa.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    if (qs[0]) { qs[0].closest('.qa').classList.add('is-open'); qs[0].setAttribute('aria-expanded', 'true'); }
  }

  /* ───────── Formulario → WhatsApp ───────── */
  function initForm() {
    var form = $('#contactForm');
    if (!form) return;
    var ok = $('#formOk'), okLink = $('#okLink'), reset = $('#formReset');
    var rules = {
      nombre: function (v) { return v.trim().length >= 3 ? '' : 'Escribe tu nombre completo.'; },
      telefono: function (v) { return v.replace(/\D/g, '').length >= 10 ? '' : 'Ingresa un teléfono de 10 dígitos.'; },
      email: function (v) { return !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'Revisa el formato del correo.'; },
      servicio: function (v) { return v ? '' : 'Selecciona el servicio que te interesa.'; },
      mensaje: function (v) { return v.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).'; }
    };
    var idMap = { nombre: 'f-nombre', telefono: 'f-tel', email: 'f-email', servicio: 'f-servicio', mensaje: 'f-mensaje' };
    var errMap = { nombre: 'e-nombre', telefono: 'e-tel', email: 'e-email', servicio: 'e-servicio', mensaje: 'e-mensaje' };

    function check(name) {
      var el = document.getElementById(idMap[name]), msg = rules[name](el.value);
      el.closest('.field').classList.toggle('has-error', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      document.getElementById(errMap[name]).textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (name) {
      var el = document.getElementById(idMap[name]);
      el.addEventListener('blur', function () { check(name); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-error')) check(name); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true, first = null;
      Object.keys(rules).forEach(function (name) { if (!check(name)) { valid = false; if (!first) first = document.getElementById(idMap[name]); } });
      if (!valid) { first.focus(); return; }

      var v = function (id) { return document.getElementById(id).value.trim(); };
      var lines = ['*Solicitud de cotización · ADC*', '', '*Nombre:* ' + v('f-nombre')];
      if (v('f-empresa')) lines.push('*Empresa:* ' + v('f-empresa'));
      lines.push('*Teléfono:* ' + v('f-tel'));
      if (v('f-email')) lines.push('*Correo:* ' + v('f-email'));
      lines.push('*Servicio:* ' + v('f-servicio'), '', '*Necesidad:*', v('f-mensaje'));
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

      okLink.href = url;
      form.hidden = true; $('.form-head').hidden = true; ok.hidden = false; ok.focus();
      window.open(url, '_blank', 'noopener');
    });

    reset.addEventListener('click', function () {
      form.reset(); form.hidden = false; $('.form-head').hidden = false; ok.hidden = true;
      $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
      $('#f-nombre').focus();
    });
  }

  /* ───────── Arranque ───────── */
  function init() {
    safe('smooth', initSmoothScroll);
    safe('loader', initLoader);
    safe('header', initHeader);
    safe('anchors', initAnchors);
    safe('reveal', initReveal);
    safe('timelines', initTimelines);
    safe('parallax', initParallax);
    safe('marquees', initMarquees);
    safe('interactions', initInteractions);
    safe('filters', initFilters);
    safe('faq', initFaq);
    safe('form', initForm);
    safe('explorer', initExplorer);

    /* lo que debe arrancar cuando el loader termina */
    whenReady(function () { safe('counters', initCounters); });
    whenReady(function () { safe('heroFX', initHeroFX); });
    whenReady(function () { safe('heroParallax', initHeroParallax); });
    whenReady(function () { safe('route', initRoute); });
    whenReady(function () { setTimeout(function () { safe('rotator', initRotator); }, 2600); });

    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }
  init();
})();
