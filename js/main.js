/* SporoCare — comportamento da página (JavaScript puro, sem dependências) */
 // Exibe o aviso ao abrir o site; fecha pelo botão, clique fora ou tecla Esc.
  (() => {
    const modal = document.getElementById("aviso-modal");
    if (!modal) return;
    const fechar = () => modal.close();
    modal.querySelectorAll("[data-fechar-aviso]").forEach((button) => button.addEventListener("click", fechar));
    modal.addEventListener("click", (event) => { if (event.target === modal) fechar(); });
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  })();
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
      var group = btn.closest('[data-accordion]');
      if (!open && group && group.hasAttribute('data-single')) {
        $$('.accordion__trigger', group).forEach(function (other) {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          var p = document.getElementById(other.getAttribute('aria-controls'));
          if (p) p.classList.remove('is-open');
        });
      }
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


  /* ---------- Experiências interativas (sem armazenamento de dados) ---------- */
  function setProgress(root, cur, total) {
    $('[data-cur]', root).textContent = cur;
    var bar = $('.xp__bar', root);
    bar.setAttribute('aria-valuenow', String(cur));
    $('[data-fill]', root).style.width = (cur / total * 100) + '%';
  }
  function focusIn(el) { if (el) { el.focus({ preventScroll: false }); } }

  /* Prevenir também é cuidar */
  $$('[data-xp]').forEach(function (root) {
    var steps = $$('[data-step]', root);
    var total = steps.length;
    var back = $('[data-back]', root), next = $('[data-next]', root);
    var nav = $('[data-nav]', root), end = $('[data-end]', root);
    var top = $('.xp__top', root), body = $('.xp__body', root);
    var answers = [];
    var cur = 0;

    function showTip(i) {
      var step = steps[i], tip = $('.xstep__tip', step), tpl = $('.xstep__tipTpl', step);
      tip.innerHTML = '';
      tip.appendChild(tpl.content.cloneNode(true));
    }
    function render(focus) {
      steps.forEach(function (s, i) { s.hidden = i !== cur; });
      setProgress(root, cur + 1, total);
      back.disabled = cur === 0;
      next.disabled = answers[cur] == null;
      if (focus) focusIn($('.xstep__title', steps[cur]));
    }
    steps.forEach(function (step, i) {
      $$('.xopt__in', step).forEach(function (input) {
        input.addEventListener('change', function () {
          answers[i] = input.value;
          $$('.xopt', step).forEach(function (l) { l.classList.toggle('is-selected', $('.xopt__in', l).checked); });
          showTip(i);
          if (i === cur) next.disabled = false;
        });
      });
    });
    back.addEventListener('click', function () { if (cur > 0) { cur--; render(true); } });
    next.addEventListener('click', function () {
      if (answers[cur] == null) return;
      if (cur < total - 1) { cur++; render(true); }
      else {
        body.hidden = true; nav.hidden = true; top.hidden = true; end.hidden = false;
        focusIn($('.xend__title', end));
      }
    });
    $('[data-restart]', root).addEventListener('click', function () {
      answers = []; cur = 0;
      steps.forEach(function (s) {
        $$('.xopt', s).forEach(function (l) { l.classList.remove('is-selected'); $('.xopt__in', l).checked = false; });
        $('.xstep__tip', s).innerHTML = '';
      });
      end.hidden = true; body.hidden = false; nav.hidden = false; top.hidden = false;
      render(true);
    });
    render(false);
  });

  /* Mitos ou verdades? */
  $$('[data-quiz]').forEach(function (root) {
    var cards = $$('[data-q]', root);
    var total = cards.length;
    var check = $('[data-check]', root), next = $('[data-next]', root);
    var nav = $('[data-nav]', root), end = $('[data-end]', root);
    var top = $('.xp__top', root), body = $('.xp__body', root);
    var cur = 0, score = 0, choice = null, checked = false;
    var messages = [
      { min: 8, text: 'EXCELENTE! Você está muito bem informado!' },
      { min: 5, text: 'MUITO BEM! Você já conhece bastante sobre o assunto.' },
      { min: 0, text: 'APRENDER É O PRIMEIRO PASSO! Continue explorando o SporoCare.' }
    ];
    var ICON = function (id) { return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>'; };

    function render(focus) {
      cards.forEach(function (c, i) { c.hidden = i !== cur; });
      setProgress(root, cur + 1, total);
      choice = null; checked = false;
      check.disabled = true; check.hidden = false; next.hidden = true;
      next.textContent = cur === total - 1 ? 'VER RESULTADO' : 'PRÓXIMA PERGUNTA';
      if (focus) focusIn($('.qcard__statement', cards[cur]));
    }
    cards.forEach(function (card) {
      $$('.qchoice', card).forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (checked) return;
          choice = btn.getAttribute('data-choice');
          $$('.qchoice', card).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
          check.disabled = false;
        });
      });
    });
    check.addEventListener('click', function () {
      if (checked || choice == null) return;
      checked = true;
      var card = cards[cur], answer = card.getAttribute('data-answer'), ok = choice === answer;
      if (ok) score++;
      $$('.qchoice', card).forEach(function (b) {
        var v = b.getAttribute('data-choice');
        b.disabled = true;
        if (v === answer) b.classList.add('is-right');
        else if (v === choice) b.classList.add('is-wrong');
      });
      var fb = $('.qfeedback', card);
      var expl = $('.qfeedback__tpl', card).innerHTML;
      fb.innerHTML = '<div class="qfeedback__box' + (ok ? '' : ' qfeedback__box--wrong') + '">' +
        '<p class="qfeedback__head">' + (ok ? ICON('i-check') + 'Você acertou!' : ICON('i-x') + 'Não foi dessa vez.') + '</p>' +
        '<p>A resposta correta é: <strong>' + (answer === 'mito' ? 'MITO' : 'VERDADE') + '</strong>.</p>' + expl + '</div>';
      check.hidden = true; next.hidden = false; next.focus();
    });
    next.addEventListener('click', function () {
      if (!checked) return;
      if (cur < total - 1) { cur++; render(true); }
      else {
        $('[data-score]', end).textContent = score;
        $('[data-total2]', end).textContent = total;
        var msg = messages.filter(function (m) { return score >= m.min; })[0];
        $('[data-result]', end).textContent = msg.text;
        body.hidden = true; nav.hidden = true; top.hidden = true; end.hidden = false;
        focusIn($('.xend__title', end));
      }
    });
    $('[data-restart]', root).addEventListener('click', function () {
      cur = 0; score = 0;
      cards.forEach(function (c) {
        $$('.qchoice', c).forEach(function (b) { b.disabled = false; b.setAttribute('aria-pressed', 'false'); b.classList.remove('is-right', 'is-wrong'); });
        $('.qfeedback', c).innerHTML = '';
      });
      end.hidden = true; body.hidden = false; nav.hidden = false; top.hidden = false;
      render(true);
    });
    render(false);
  });

  /* ---------- Ano no rodapé ---------- */
  var year = $('#ano');
  if (year) year.textContent = new Date().getFullYear();
})();
