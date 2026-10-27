/* SporoCare — comportamento da página (JavaScript puro, sem dependências) */
(function () {
  'use strict';

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- Menu móvel ---------- */
  var toggle = $('.nav-toggle');
  var nav = $('#menu-principal');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Seção ativa no menu ---------- */
  var spyLinks = $$('[data-spy]');
  var spyIds = spyLinks.map(function (a) { return a.getAttribute('data-spy'); });
  var spySections = spyIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function updateSpy() {
    var line = window.innerHeight * 0.35;
    var current = null;
    spySections.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = sec.id;
    });
    spyLinks.forEach(function (a) {
      if (a.getAttribute('data-spy') === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Progresso de leitura e voltar ao topo ---------- */
  var bar = $('#read-progress-bar');
  var toTop = $('.to-top');
  var ticking = false;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = pct + '%';
    toTop.hidden = window.scrollY < 700;
    updateSpy();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  toTop.addEventListener('click', function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    var skip = $('.skip-link');
    if (skip) skip.focus({ preventScroll: true });
  });

  /* ---------- Checklists (salvos em localStorage, neste aparelho) ---------- */
  var STORAGE_PREFIX = 'sporocare:v1:checklist:'; // uma chave por checklist, sem misturar

  function readState(key, total) {
    try {
      var raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];
      var out = [];
      for (var i = 0; i < total; i++) out.push(arr[i] === true);
      return out;
    } catch (err) {
      return new Array(total).fill(false);
    }
  }
  function writeState(key, state) {
    try { window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state)); } catch (err) { /* armazenamento indisponível: segue só na sessão */ }
  }

  $$('[data-checklist]').forEach(function (box) {
    var key = box.getAttribute('data-checklist');
    var unit = box.getAttribute('data-unit') || 'itens';
    var marked = box.getAttribute('data-marked') || 'marcados';
    var inputs = $$('input[type="checkbox"]', box);
    var total = inputs.length;
    var progress = $('.checklist__progress', box);
    var meter = $('.meter__bar', box);
    var state = readState(key, total);

    function render() {
      var done = state.filter(Boolean).length;
      progress.textContent = done + ' de ' + total + ' ' + unit + ' ' + marked + ' · fica salvo neste aparelho';
      meter.style.width = (done / total * 100) + '%';
    }

    inputs.forEach(function (input, i) {
      input.checked = state[i];
      input.addEventListener('change', function () {
        state[i] = input.checked;
        writeState(key, state);
        render();
      });
    });
    render();
  });

  /* ---------- Acordeão ---------- */
  $$('[data-accordion] .accordion__trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Vídeos do YouTube sob demanda ---------- */
  $$('.video').forEach(function (item) {
    var btn = $('.video__play', item);
    var id = item.getAttribute('data-video-id');
    var title = $('h4', item).textContent;
    var thumb = $('img', btn);
    if (thumb) thumb.addEventListener('error', function () { thumb.style.display = 'none'; btn.classList.add('is-fallback'); });
    if (thumb && thumb.complete && thumb.naturalWidth === 0 && thumb.src) { thumb.style.display = 'none'; btn.classList.add('is-fallback'); }

    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      btn.replaceWith(iframe);
      iframe.focus();
    });
  });

  /* ---------- Espaços para fotografias reais ----------
     Para usar: no HTML, preencha data-src (ex.: "assets/photos/foto-01.jpg") e data-alt. */
  $$('.photo-slot[data-src]').forEach(function (slot) {
    var src = slot.getAttribute('data-src');
    var alt = slot.getAttribute('data-alt');
    if (!src) return;
    var img = new Image();
    img.src = src;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('load', function () {
      var empty = $('.photo-slot__empty', slot);
      if (empty) empty.remove();
      slot.classList.add('has-photo');
      slot.appendChild(img);
    });
  });

  /* ---------- Ano no rodapé ---------- */
  var year = $('#ano');
  if (year) year.textContent = new Date().getFullYear();
})();
