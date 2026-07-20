/* ============================================================
   动效驱动 · 三个页面共用
   零依赖。所有能力都是渐进增强：脚本不跑，页面照样完整可读。
   用法全部通过 data-* 属性声明，HTML 里不写 JS。

     data-reveal            进入视口时淡入上移
     data-stagger[="80"]    子元素依次进场，值为步长 ms
     data-words             标题按词拆分，逐词升起
     data-count="900"       数字滚动到目标值
       data-prefix / data-suffix / data-decimals
     data-magnetic[="18"]   指针磁吸，值为最大位移 px
     data-tilt[="10"]       指针 3D 倾斜，值为最大角度 deg
     data-spotlight         深色区块跟随指针的柔光
     data-progress          阅读进度条（自动创建条本身）
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- 工具 ---------- */
  function each(sel, fn, ctx) {
    Array.prototype.forEach.call((ctx || document).querySelectorAll(sel), fn);
  }
  function raf(fn) { return (window.requestAnimationFrame || setTimeout)(fn); }

  /* ============================================================
     1. 进入视口
     一个共享的 observer 处理所有 reveal / stagger / words / count
     ============================================================ */
  var onEnter = [];   // {el, fn}

  function whenVisible(el, fn) {
    onEnter.push({ el: el, fn: fn });
  }

  function runAll() {
    onEnter.forEach(function (x) { x.fn(x.el); });
    onEnter = [];
  }

  /* ============================================================
     2. reveal / stagger
     ============================================================ */
  each('[data-reveal]', function (el) {
    el.classList.add('reveal');
    whenVisible(el, function (n) { n.classList.add('in'); });
  });

  each('[data-stagger]', function (el) {
    el.classList.add('stagger');
    var step = parseInt(el.dataset.stagger, 10);
    if (step) el.style.setProperty('--stagger-step', step + 'ms');
    Array.prototype.forEach.call(el.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
    whenVisible(el, function (n) { n.classList.add('in'); });
  });

  /* ============================================================
     3. 标题逐词升起
     中文按字断不好看，按"词"断：中文按标点/空格切块，英文按空格
     ============================================================ */
  each('[data-words]', function (el) {
    var text = el.textContent.trim();
    // 中英混排：把连续的中文当一块、英文单词当一块，标点跟随前一块
    var parts = text.match(/[A-Za-z0-9@._%+-]+|[一-龥]+|[^\s]/g) || [text];
    el.textContent = '';
    parts.forEach(function (p, i) {
      var w = document.createElement('span');
      w.className = 'w';
      var inner = document.createElement('i');
      inner.textContent = p;
      inner.style.setProperty('--i', i);
      w.appendChild(inner);
      el.appendChild(w);
      // 词之间补回空格（中文块之间不补）
      if (i < parts.length - 1 && /[A-Za-z0-9]$/.test(p)) {
        el.appendChild(document.createTextNode(' '));
      }
    });
    whenVisible(el, function (n) { n.classList.add('in'); });
  });

  /* ============================================================
     4. 数字滚动
     ============================================================ */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var dec = parseInt(el.dataset.decimals, 10) || 0;
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    var dur = parseInt(el.dataset.duration, 10) || 1400;

    if (reduced.matches) { el.textContent = pre + target.toFixed(dec) + suf; return; }

    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      // easeOutExpo：开头冲得快，尾巴稳稳停住
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = pre + (target * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  each('[data-count]', function (el) {
    el.classList.add('tabular');
    var dec = parseInt(el.dataset.decimals, 10) || 0;
    // 先填 0，避免进场前是空的
    el.textContent = (el.dataset.prefix || '') + (0).toFixed(dec) + (el.dataset.suffix || '');
    whenVisible(el, countUp);
  });

  /* ============================================================
     5. 观察器（统一注册，带兜底）
     ============================================================ */
  if ('IntersectionObserver' in window && onEnter.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = -1;
        for (var i = 0; i < onEnter.length; i++) {
          if (onEnter[i].el === e.target) { idx = i; break; }
        }
        if (idx > -1) { onEnter[idx].fn(e.target); onEnter.splice(idx, 1); }
        io.unobserve(e.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

    onEnter.forEach(function (x) { io.observe(x.el); });

    // 兜底：内容默认 opacity:0，observer 万一没触发就是整页空白
    setTimeout(runAll, 3000);
  } else {
    runAll();
  }

  /* ============================================================
     6. 磁吸 / 3D 倾斜（只在真正有指针的设备上启用）
     ============================================================ */
  if (fine.matches && !reduced.matches) {
    each('[data-magnetic]', function (el) {
      var max = parseFloat(el.dataset.magnetic) || 18;
      var zone = el.closest('[data-magnetic-zone]') || el;
      zone.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.classList.add('tracking');
        el.style.setProperty('--mx', Math.max(-1, Math.min(1, dx)) * max + 'px');
        el.style.setProperty('--my', Math.max(-1, Math.min(1, dy)) * max + 'px');
      });
      zone.addEventListener('pointerleave', function () {
        el.classList.remove('tracking');
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });

    each('[data-tilt]', function (el) {
      var max = parseFloat(el.dataset.tilt) || 10;
      var zone = el.closest('[data-tilt-zone]') || el;
      zone.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.classList.add('tracking');
        el.style.setProperty('--ry', Math.max(-1, Math.min(1, dx)) * max + 'deg');
        el.style.setProperty('--rx', Math.max(-1, Math.min(1, -dy)) * max + 'deg');
      });
      zone.addEventListener('pointerleave', function () {
        el.classList.remove('tracking');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    each('[data-spotlight]', function (el) {
      el.classList.add('spotlight');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.classList.add('lit');
        el.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('lit'); });
    });
  }

  /* ============================================================
     7. 阅读进度条
     ============================================================ */
  var progHost = document.querySelector('[data-progress]');
  if (progHost && !reduced.matches) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    var fill = bar.firstChild;
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max) : 0);
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  /* ============================================================
     8. 一键复制（联系方式）
     HTTP 下 navigator.clipboard 不可用，退回 execCommand
     ============================================================ */
  each('[data-copy]', function (btn) {
    btn.addEventListener('click', function () {
      var src = document.querySelector(btn.dataset.copy);
      if (!src) return;
      var text = src.textContent.trim();
      var done = function (ok) {
        var old = btn.dataset.label || btn.textContent;
        btn.dataset.label = old;
        btn.textContent = ok ? '已复制' : '复制失败';
        btn.classList.toggle('done', ok);
        setTimeout(function () {
          btn.textContent = old;
          btn.classList.remove('done');
        }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); },
                                                 function () { done(fallback(text)); });
      } else {
        done(fallback(text));
      }
    });
  });

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
})();
