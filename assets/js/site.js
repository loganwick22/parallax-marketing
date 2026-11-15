/* ==========================================================================
   Parallax Marketing Co. — site behaviour
   Vanilla JS, no dependencies, loaded with `defer`. Every module is optional:
   the page reads and works without it. Sections:
     1. Helpers          4. Hero figure        7. Missed-call estimator
     2. Mobile nav       5. Pointer tilt       8. Contact form
     3. Scroll reveal    6. Compare slider     9. Nav highlight, footer year
   ========================================================================== */
(function () {
  'use strict';

  /* 1. Helpers ------------------------------------------------------------- */
  var doc = document;
  var root = doc.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  /* 2. Mobile nav ----------------------------------------------------------- */
  (function nav() {
    var header = $('#site-header');
    var toggle = $('#nav-toggle');
    var panel = $('#site-nav');
    if (!header || !toggle || !panel) return;

    var mobileMQ = window.matchMedia('(max-width: 899.98px)');
    var outside = $$('main, footer');
    var label = $('.nav-toggle__label', toggle);

    function isOpen() { return header.classList.contains('nav-open'); }

    function setOpen(open, returnFocus) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      root.style.overflow = open ? 'hidden' : '';
      outside.forEach(function (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen(), false); });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a') && isOpen()) setOpen(false, false);
    });

    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); setOpen(false, true); return; }
      if (e.key !== 'Tab') return;
      // Keep focus inside the header (logo, toggle, call button, panel links) while open.
      var focusables = $$('a[href], button:not([disabled])', header).filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    function onBreakpoint() { if (!mobileMQ.matches && isOpen()) setOpen(false, false); }
    if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', onBreakpoint);
    else if (mobileMQ.addListener) mobileMQ.addListener(onBreakpoint);
  })();

  /* 3. Scroll reveal -------------------------------------------------------- */
  (function reveal() {
    var els = $$('[data-reveal]');
    if (!els.length || reduceMQ.matches || !('IntersectionObserver' in window)) return;
    root.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) {
      // Anything already above the fold line or scrolled past shows immediately.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-in');
      else io.observe(el);
    });
    // Safety net: never leave content hidden if the observer stalls (e.g. printing, odd embeds).
    window.addEventListener('beforeprint', function () { els.forEach(function (el) { el.classList.add('is-in'); }); });
  })();

  /* 4. Hero figure: live parallax diagram ----------------------------------- */
  (function figure() {
    var host = $('[data-parallax-fig]');
    if (!host) return;
    var ids = ['f-la', 'f-lb', 'f-da', 'f-db', 'f-br', 'f-t', 'f-th', 'f-dist', 'f-tl'];
    var el = {};
    for (var i = 0; i < ids.length; i++) { el[ids[i]] = doc.getElementById(ids[i]); if (!el[ids[i]]) return; }

    var A = { x: 190, y: 540 }, B = { x: 450, y: 540 }, SCALE_Y = 86;

    function draw(tx, ty) {
      var k = (SCALE_Y - A.y) / (ty - A.y);
      var ax = A.x + (tx - A.x) * k;
      var bx = B.x + (tx - B.x) * k;
      el['f-la'].setAttribute('x2', ax.toFixed(1));
      el['f-lb'].setAttribute('x2', bx.toFixed(1));
      el['f-da'].setAttribute('cx', ax.toFixed(1));
      el['f-db'].setAttribute('cx', bx.toFixed(1));
      el['f-br'].setAttribute('x1', Math.min(ax, bx).toFixed(1));
      el['f-br'].setAttribute('x2', Math.max(ax, bx).toFixed(1));
      el['f-t'].setAttribute('cx', tx.toFixed(1)); el['f-t'].setAttribute('cy', ty.toFixed(1));
      el['f-th'].setAttribute('cx', tx.toFixed(1)); el['f-th'].setAttribute('cy', ty.toFixed(1));
      el['f-dist'].setAttribute('x1', tx.toFixed(1)); el['f-dist'].setAttribute('x2', tx.toFixed(1));
      el['f-dist'].setAttribute('y1', ty.toFixed(1));
      el['f-tl'].setAttribute('x', (tx + 26).toFixed(1)); el['f-tl'].setAttribute('y', (ty + 4).toFixed(1));
    }

    var raf = 0, t0 = 0, visible = true;
    function frame(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      // The target drifts nearer and further; the "apparent shift" bracket widens and narrows with it.
      draw(320 + Math.sin(t * 0.37) * 16, 275 + Math.sin(t * 0.52) * 48);
      raf = window.requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !doc.hidden && !reduceMQ.matches) raf = window.requestAnimationFrame(frame); }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(host);
    }
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) stop(); else start(); });
    var onMotion = function () { if (reduceMQ.matches) { stop(); draw(320, 270); } else start(); };
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onMotion);
    start();

    // Pointer parallax between the figure's layers (desktop pointers only).
    var layers = $$('.fig__layer', host);
    var hero = host.closest('section');
    if (!hero || !finePointer.matches) return;
    var pending = false, px = 0, py = 0;
    hero.addEventListener('pointermove', function (e) {
      if (reduceMQ.matches) return;
      var r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        layers.forEach(function (g) {
          var d = parseFloat(g.getAttribute('data-depth')) || 0;
          g.style.transform = 'translate(' + (px * d).toFixed(2) + 'px,' + (py * d).toFixed(2) + 'px)';
        });
      });
    });
    hero.addEventListener('pointerleave', function () { layers.forEach(function (g) { g.style.transform = ''; }); });
  })();

  /* 5. Pointer tilt on the project stages ----------------------------------- */
  (function tilt() {
    if (!finePointer.matches) return;
    $$('[data-tilt]').forEach(function (stage) {
      var pending = false, x = 0, y = 0;
      stage.addEventListener('pointermove', function (e) {
        if (reduceMQ.matches) return;
        var r = stage.getBoundingClientRect();
        x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
          pending = false;
          stage.style.setProperty('--px', x.toFixed(3));
          stage.style.setProperty('--py', y.toFixed(3));
        });
      });
      stage.addEventListener('pointerleave', function () {
        stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0);
      });
    });
  })();

  /* 6. Compare slider (live page vs annotated layer) ------------------------ */
  (function compare() {
    $$('[data-compare]').forEach(function (cmp) {
      var range = $('.compare__range', cmp);
      if (!range) return;
      function sync() {
        var v = clamp(parseFloat(range.value) || 0, 0, 100);
        cmp.style.setProperty('--pos', v + '%');
        range.setAttribute('aria-valuetext', Math.round(100 - v) + '% of the page shown with annotations');
      }
      range.addEventListener('input', sync);
      range.addEventListener('change', sync);
      sync();

      // Hovering or focusing a legend line highlights its box and pin.
      var stage = cmp.closest('.stage');
      if (!stage) return;
      function hot(n, on) {
        $$('[data-pin="' + n + '"]', stage).forEach(function (el) { el.classList.toggle('is-hot', on); });
      }
      $$('.legend li[data-pin]', stage).forEach(function (li) {
        var n = li.getAttribute('data-pin');
        li.addEventListener('pointerenter', function () { hot(n, true); });
        li.addEventListener('pointerleave', function () { hot(n, false); });
      });
    });
  })();

  /* 7. Missed-call estimator ------------------------------------------------
     Runs entirely in the browser. Inputs have no `name`, sit outside any form
     and are never sent, stored or logged anywhere. */
  (function estimator() {
    var host = $('[data-estimator]');
    if (!host) return;

    var FIELDS = {
      calls:   { min: 0, max: 1000,   label: 'a number of calls from 0 to 1,000' },
      missed:  { min: 0, max: 100,    label: 'a percentage from 0 to 100' },
      reached: { min: 0, max: 100,    label: 'a percentage from 0 to 100' },
      booked:  { min: 0, max: 100,    label: 'a percentage from 0 to 100' },
      value:   { min: 0, max: 250000, label: 'a dollar amount from 0 to 250,000' }
    };
    // Illustrative starting points only — not benchmarks.
    var PRESETS = {
      tree:    { calls: 25, missed: 30, reached: 25, booked: 40, value: 1200 },
      remodel: { calls: 10, missed: 20, reached: 40, booked: 20, value: 18000 },
      hvac:    { calls: 40, missed: 20, reached: 30, booked: 55, value: 450 }
    };
    var WEEKS_PER_MONTH = 52 / 12;

    var f = {};
    Object.keys(FIELDS).forEach(function (key) {
      var wrap = $('[data-field="' + key + '"]', host);
      f[key] = {
        wrap: wrap,
        input: $('input[type="number"]', wrap),
        range: $('input[type="range"]', wrap),
        err: $('.field__err', wrap)
      };
    });

    var out = {
      month: $('#est-month'), year: $('#est-year'), jobs: $('#est-jobs'),
      msg: $('#est-msg'), live: $('#est-live'), math: $('#est-math'),
      flowCalls: $('#flow-calls'), flowMissed: $('#flow-missed'), flowLost: $('#flow-lost'), flowJobs: $('#flow-jobs'),
      barCalls: $('#bar-calls'), barMissed: $('#bar-missed'), barLost: $('#bar-lost'), barJobs: $('#bar-jobs')
    };
    var chips = $$('[data-preset]', host);

    var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    var num1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
    var num0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

    function setText(el, text) { if (el && el.textContent !== text) el.textContent = text; }

    /* Read one field. Returns { ok, value, note } — out-of-range values are
       clamped and still used, with a visible note; blanks and junk are not ok. */
    function read(key) {
      var cfg = FIELDS[key], input = f[key].input;
      var raw = input.value.trim();
      // type=number reports '' for unparseable text; validity.badInput tells the two apart.
      if (raw === '') {
        var bad = input.validity && input.validity.badInput;
        return { ok: false, note: bad ? 'That isn\'t a number. Enter ' + cfg.label + '.' : 'Enter ' + cfg.label + '.' };
      }
      var n = Number(raw);
      if (!isFinite(n)) return { ok: false, note: 'That isn\'t a number. Enter ' + cfg.label + '.' };
      if (n < cfg.min) return { ok: true, value: cfg.min, note: 'Can\'t be below ' + cfg.min + ', so we used ' + cfg.min + '.' };
      if (n > cfg.max) return { ok: true, value: cfg.max, note: 'Capped at ' + num0.format(cfg.max) + ' for this estimate.' };
      return { ok: true, value: n, note: '' };
    }

    function setRangeFill(range) {
      if (!range) return;
      var min = parseFloat(range.min) || 0, max = parseFloat(range.max) || 100;
      range.style.setProperty('--fill', ((clamp(parseFloat(range.value) || 0, min, max) - min) / (max - min) * 100) + '%');
    }

    var liveTimer = 0;
    function announce(text) {
      window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(function () { setText(out.live, text); }, 700);
    }

    function mathRow(expr, result) { return '<li><span>' + expr + '</span><b>' + result + '</b></li>'; }

    function update() {
      var v = {}, allOk = true;
      Object.keys(FIELDS).forEach(function (key) {
        var r = read(key);
        var showNote = !!r.note;
        f[key].wrap.classList.toggle('is-invalid', !r.ok);
        f[key].input.setAttribute('aria-invalid', r.ok ? 'false' : 'true');
        if (f[key].err) { f[key].err.hidden = !showNote; setText(f[key].err, r.note || ''); }
        if (r.ok) {
          v[key] = r.value;
          if (f[key].range) { f[key].range.value = r.value; setRangeFill(f[key].range); }
        } else { allOk = false; }
      });

      if (!allOk) {
        out.month.innerHTML = '—';
        out.month.classList.remove('is-long');
        setText(out.year, '—'); setText(out.jobs, '—');
        ['flowCalls', 'flowMissed', 'flowLost', 'flowJobs'].forEach(function (k) { setText(out[k], '—'); });
        ['barCalls', 'barMissed', 'barLost', 'barJobs'].forEach(function (k) { out[k].style.setProperty('--w', '0%'); });
        out.math.innerHTML = '<li><span>Waiting for a number in every field.</span><b></b></li>';
        out.msg.hidden = false;
        setText(out.msg, 'Enter a number in every field to see an estimate.');
        announce('Estimate unavailable. Enter a number in every field.');
        return;
      }

      var callsMonth = v.calls * WEEKS_PER_MONTH;
      var missed = callsMonth * v.missed / 100;
      var lost = missed * (1 - v.reached / 100);
      var jobs = lost * v.booked / 100;
      var month = jobs * v.value;
      var year = month * 12;

      var monthText = money.format(Math.round(month));
      out.month.innerHTML = monthText + '<small>a month</small>';
      out.month.classList.toggle('is-long', monthText.length > 8);
      setText(out.year, money.format(Math.round(year)));
      setText(out.jobs, num1.format(jobs));

      setText(out.flowCalls, num1.format(callsMonth));
      setText(out.flowMissed, num1.format(missed));
      setText(out.flowLost, num1.format(lost));
      setText(out.flowJobs, num1.format(jobs));
      var base = callsMonth > 0 ? callsMonth : 1;
      out.barCalls.style.setProperty('--w', (callsMonth > 0 ? 100 : 0) + '%');
      out.barMissed.style.setProperty('--w', (missed / base * 100).toFixed(2) + '%');
      out.barLost.style.setProperty('--w', (lost / base * 100).toFixed(2) + '%');
      out.barJobs.style.setProperty('--w', (jobs / base * 100).toFixed(2) + '%');

      out.math.innerHTML =
        mathRow(num0.format(v.calls) + ' calls a week × 52 ÷ 12', num1.format(callsMonth) + ' calls a month') +
        mathRow(num1.format(callsMonth) + ' × ' + num0.format(v.missed) + '% unanswered', num1.format(missed) + ' missed calls') +
        mathRow(num1.format(missed) + ' × (100% − ' + num0.format(v.reached) + '% reached later)', num1.format(lost) + ' callers lost') +
        mathRow(num1.format(lost) + ' × ' + num0.format(v.booked) + '% would have booked', num1.format(jobs) + ' jobs') +
        mathRow(num1.format(jobs) + ' × ' + money.format(v.value) + ' a job', monthText + ' a month');

      var note = '';
      if (month === 0) {
        if (v.calls === 0) note = 'With no new-customer calls coming in, there\'s nothing to miss. The bigger question is why the phone isn\'t ringing.';
        else if (v.missed === 0) note = 'If every call really is answered, there\'s no missed-call gap here. Worth confirming against your phone records.';
        else if (v.reached === 100) note = 'If you reach every missed caller later, nothing is lost on these numbers.';
        else note = 'With these numbers the estimate comes out at zero.';
      }
      out.msg.hidden = !note;
      setText(out.msg, note);

      announce('Estimated missed-call opportunity: about ' + monthText + ' a month, ' + money.format(Math.round(year)) +
        ' a year, from roughly ' + num1.format(jobs) + ' jobs a month. This is an estimate, not a guarantee.');
    }

    function clearPresets() { chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); }); }

    Object.keys(FIELDS).forEach(function (key) {
      var input = f[key].input, range = f[key].range;
      input.addEventListener('input', function () { clearPresets(); update(); });
      // On leaving the field, tidy an out-of-range entry to the value actually used.
      input.addEventListener('blur', function () {
        var r = read(key);
        if (r.ok && String(r.value) !== input.value.trim()) { input.value = r.value; update(); }
      });
      if (range) {
        range.addEventListener('input', function () {
          input.value = range.value; clearPresets(); update();
        });
      }
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var p = PRESETS[chip.getAttribute('data-preset')];
        if (!p) return;
        Object.keys(p).forEach(function (key) { f[key].input.value = p[key]; });
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        update();
      });
    });

    update();
    // Don't announce the initial state on page load.
    window.clearTimeout(liveTimer);
  })();

  /* 8. Contact form ----------------------------------------------------------
     Same Web3Forms endpoint and key as before. With JS it submits in place;
     without JS the browser posts the form normally. */
  (function contact() {
    var form = $('#contact-form');
    if (!form || !window.fetch || !window.FormData) return;
    var btn = $('#form-submit');
    var error = $('#form-error');
    var success = $('#form-success');
    var busy = false;

    function fail(text) {
      busy = false;
      btn.disabled = false;
      btn.firstChild.nodeValue = 'Request a strategy call ';
      error.textContent = text;
      error.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      if (form.reportValidity && !form.reportValidity()) return;
      busy = true;
      error.hidden = true;
      btn.disabled = true;
      btn.firstChild.nodeValue = 'Sending… ';

      window.fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (res) { return res.json().catch(function () { return { success: false }; }); })
        .then(function (json) {
          if (json && json.success) {
            form.hidden = true;
            success.hidden = false;
            success.focus();
          } else {
            fail('That didn\'t go through. Nothing was sent. Please try again in a moment.');
          }
        })
        .catch(function () {
          fail('We couldn\'t reach the form service. Check your connection and try again.');
        });
    });
  })();

  /* 9. Nav highlight + footer year ----------------------------------------- */
  (function spy() {
    var links = $$('.site-nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var sec = doc.getElementById(a.getAttribute('href').slice(1));
      if (sec) map[sec.id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(doc.getElementById(id)); });
  })();

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
