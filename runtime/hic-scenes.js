/**
 * hic-scenes.js — IITM shared scene runtime (v1)
 * -----------------------------------------------
 * Data-driven storyboard playback for math shorts. One engine drives every
 * short: you declare scenes + keyframes (storyboard.json, see
 * _templates/storyboard.schema.json), this runtime builds the DOM and
 * interpolates.
 *
 * Design goals (IITM-FUTURE-PLAN.md §5.2):
 *   • Same code path for interactive preview, hic-modal WebM export, and
 *     static export — a render(f) always produces identical frames.
 *   • Eases match the original problem-page animations (easeOutCubic,
 *     easeBack), so migrated storyboards look identical to the mock.
 *   • KaTeX is optional: if window.renderMathInElement is present, latex
 *     elements render as math; otherwise they fall back to monospace text.
 *
 * Usage:
 *   const player = createScenePlayer(stageEl, storyboard, {
 *     onEnd, onPlayState(isPlaying), onSeek(tMs)
 *   });
 *   player.play(); player.pause(); player.seek(4200); player.reset();
 *   player.render(4200);           // deterministic frame for export
 *   player.getDuration(); player.getStage(); player.destroy();
 *
 * Module note: this file is an ES module (bundled by Astro/Vite, importable
 * from Node tooling). When loaded in a browser it ALSO registers
 * window.createScenePlayer, so plain <script type="module"> pages work too.
 */

  // ── eases (same curves as the original problem pages) ──────────────────
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  function easeBack(x, s) {
    s = (s === undefined) ? 1.7 : s;
    const p = x - 1;
    return (s + 1) * p * p * p + s * p * p + 1;
  }

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  // phase progress of a staged anim at local time tMs; null when idle
  function animPhase(anim, tMs) {
    if (!anim) return null;
    const start = anim.start_ms || 0;
    if (tMs < start) return null;
    const dur = anim.dur_ms || 600;
    return clamp01((tMs - start) / dur);
  }

  // ── defaults ────────────────────────────────────────────────────────────
  const PHASE_DEFAULTS = {
    pop:   { dur_ms: 600, overshoot: 1.7 },
    fade:  { dur_ms: 600 },
    slide: { dur_ms: 600, from_x: 0, from_y: 0 },
  };

  const COLORS = {
    text: '#e7ba55',
    latex: '#ffffff',
    answer: '#6ed9b1',
    shape: '#6ed9b1',
    cardFace: '#fdfcf9',
    cardInk: '#14181a',
    cardMuted: '#dfe4df',
    cardMutedInk: '#5c665f',
  };

  // ── DOM building ────────────────────────────────────────────────────────
  function el(tag, cls, parent) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  function buildElement(spec, sceneEl, sceneStartMs, engine) {
    const wrap = el('div', 'hs-el hs-type-' + spec.type, sceneEl);
    wrap.dataset.elId = spec.id;

    const color = spec.color || COLORS[spec.type] || '#ffffff';

    switch (spec.type) {
      case 'text': {
        const node = el('div', 'hs-text hs-' + (spec.size || 'body'), wrap);
        node.textContent = spec.text || '';
        node.style.color = color;
        wrap.dataset.size = spec.size || 'body';
        if (spec.loop) wrap.dataset.loop = '1';
        break;
      }
      case 'latex': {
        const node = el('div', 'hs-latex', wrap);
        node.textContent = '$$' + (spec.text || '') + '$$';
        node.style.color = color;
        engine.hasLatex = true;
        break;
      }
      case 'answer': {
        const node = el('div', 'hs-answer', wrap);
        node.textContent = spec.text || '';
        node.style.color = color;
        break;
      }
      case 'cards': {
        const row = el('div', 'hs-cards', wrap);
        (spec.items || []).forEach((card) => {
          const face = el('div', 'hs-card', row);
          if (card.muted) {
            face.style.background = COLORS.cardMuted;
            face.style.color = COLORS.cardMutedInk;
          } else {
            face.style.background = COLORS.cardFace;
            face.style.color = COLORS.cardInk;
          }
          const label = el('span', null, face);
          label.textContent = card.label || '';
          if (card.accent) label.style.color = card.accent;
        });
        break;
      }
      case 'image': {
        const img = el('img', 'hs-image', wrap);
        img.alt = spec.id;
        img.src = spec.src || '';
        break;
      }
      case 'shape': {
        const kind = spec.shape || 'box';
        const node = el('div', 'hs-shape hs-shape-' + kind, wrap);
        node.style.borderColor = color;
        if (kind === 'underline') node.style.background = color;
        if (spec.of) wrap.dataset.of = spec.of;
        break;
      }
    }

    // register timeline entry
    const t = {
      spec,
      root: wrap,
      sceneStart: sceneStartMs,
      at: spec.at_ms || 0,
      stagger: 0,
      hiding: false,
    };
    if (spec.type === 'cards' && (spec.in || {}).stagger_ms) {
      t.stagger = spec.in.stagger_ms;
      // cards animate per-item; the row itself never fades so item
      // transforms are the only motion
      t.root.style.opacity = '1';
    }
    return t;
  }

  // per-card wrapper keys
  function cardWraps(entry) {
    if (!entry._cardWraps) {
      entry._cardWraps = Array.from(entry.root.querySelectorAll('.hs-card'))
        .map((face) => {
          const w = el('div', 'hs-cardwrap', face.parentNode);
          w.appendChild(face);   // moves the card inside its wrapper
          return w;
        });
    }
    return entry._cardWraps;
  }

  // ── engine ──────────────────────────────────────────────────────────────
  function createScenePlayer(stage, storyboard, opts) {
    opts = opts || {};
    if (!stage) throw new Error('createScenePlayer: stage element required');
    if (!storyboard || !Array.isArray(storyboard.scenes)) throw new Error('createScenePlayer: storyboard.scenes missing');

    const engine = {
      hasLatex: false,
      total: storyboard.total_duration_ms || Math.max.apply(null, storyboard.scenes.map((s) => s.end_ms)),
      entries: [],
      scenes: [],
      t: -1,           // last rendered time (-1 = nothing yet)
      playing: false,
      raf: 0,
      wallStart: 0,
      tAtStart: 0,
      destroyed: false,
    };

    stage.classList.add('hs-stage');
    stage.style.background = storyboard.background || '#0e1512';
    stage.dataset.aspect = storyboard.aspect || '9:16';

    // build scenes + elements
    storyboard.scenes.forEach((scene) => {
      const sceneEl = el('div', 'hs-scene', stage);
      sceneEl.dataset.sceneId = scene.id;
      const sceneT = { spec: scene, root: sceneEl };
      scene.elements.forEach((spec) => {
        sceneT[spec.id] = buildElement(spec, sceneEl, scene.start_ms, engine);
        engine.entries.push(sceneT[spec.id]);
      });
      engine.scenes.push(sceneT);
    });

    // resolve shape overlays (needs all elements built). Geometry is static:
    // overlays size to their host wrap, so no per-frame layout reads.
    engine.entries.forEach((e) => {
      if (e.spec.type === 'shape' && e.spec.of) {
        const host = findEntry(e.spec.of);
        if (host) {
          host.root.appendChild(e.root);
          e.root.classList.add('hs-overlay');
          // inline absolute beats the .hs-el { position: relative } rule
          e.root.style.position = 'absolute';
          e.root.style.left = '-6px';
          e.root.style.top = '-6px';
          e.root.style.width = 'calc(100% + 12px)';
          e.root.style.height = 'calc(100% + 12px)';
        }
      }
    });

    function findEntry(id) {
      for (let i = 0; i < engine.scenes.length; i++) {
        const s = engine.scenes[i];
        if (s[id]) return s[id];
      }
      return null;
    }

    // ── render(f): the single source of truth ────────────────────────────
    function render(fGlobal) {
      if (engine.destroyed) return;
      const f = Math.max(0, Math.min(engine.total, fGlobal));
      // Scenes are [start, end), so f === total falls outside the last scene
      // and would blank the final frame. Clamp the scene math to total-1 so
      // the video's last frame is the completed end state.
      const fScene = (f >= engine.total) ? engine.total - 1 : f;

      // scene visibility
      engine.scenes.forEach((s) => {
        const spec = s.spec;
        let vis;
        if (fScene < spec.start_ms || fScene >= spec.end_ms) vis = 0;
        else if (spec.fade_out_ms && fScene >= spec.end_ms - spec.fade_out_ms) {
          vis = clamp01((spec.end_ms - fScene) / spec.fade_out_ms);
        } else vis = 1;
        s.root.style.opacity = String(vis);
        s.root.style.visibility = vis <= 0 ? 'hidden' : 'visible';
      });

      // elements
      engine.entries.forEach((e) => {
        const spec = e.spec;
        const sceneSpec = sceneOf(e).spec;
        const tLocal = fScene - e.sceneStart - e.at;   // time since element timeline origin

        // visible only inside [sceneStart, sceneEnd). Reset to canonical
        // hidden state (not just opacity) — otherwise transforms leak from
        // whatever time was rendered last and render(t) stops being pure.
        if (fScene < e.sceneStart || fScene >= sceneSpec.end_ms) {
          e.hiding = true;
          if (spec.type === 'cards') {   // cards row stays opaque; items animate
            cardWraps(e).forEach((w) => { w.style.opacity = '0'; w.style.transform = 'none'; });
          } else {
            e.root.style.opacity = '0';
            e.root.style.visibility = 'hidden';
            e.root.style.transform = 'none';
          }
          return;
        }
        e.hiding = false;
        if (spec.type !== 'cards') e.root.style.visibility = 'visible';

        if (spec.type === 'cards') { renderCards(e, tLocal); return; }
        if (spec.type === 'shape') { renderShape(e, tLocal); return; }

        // in-phase
        const pin = animPhase(spec.in, tLocal);
        if (pin === null) { applyHidden(e); return; }
        const type = (spec.in && spec.in.type) || 'fade';
        applyAnim(e, type, pin, spec.in, 1);
      });

      // text blink loops
      engine.entries.forEach((e) => {
        const spec = e.spec;
        if (spec.type !== 'text' || !spec.loop || e.hiding) return;
        const tLocal = fScene - e.sceneStart - e.at;
        const pin = animPhase(spec.in, tLocal);
        if (pin === null || pin < 1) return;
        // subtle 900ms pulse after entrance completes
        const lt = ((tLocal - ((spec.in && spec.in.start_ms || 0) + ((spec.in && spec.in.dur_ms) || 600))) % 900) / 900;
        const pulse = 0.75 + 0.25 * Math.sin(lt * Math.PI * 2);
        e.root.style.opacity = pulse.toFixed(3);
      });

      engine.t = f;
      if (typeof opts.onFrame === 'function') opts.onFrame(f);
    }

    function sceneOf(entry) {
      for (let i = 0; i < engine.scenes.length; i++) {
        if (engine.scenes[i][entry.spec.id] === entry) return engine.scenes[i];
      }
      return engine.scenes[0];
    }

    function applyHidden(e) {
      e.root.style.opacity = '0';
      e.root.style.transform = 'none';
    }

    function applyAnim(e, type, p, anim, baseOpacity) {
      const d = PHASE_DEFAULTS[type] || PHASE_DEFAULTS.fade;
      if (type === 'pop') {
        const s = (anim && anim.overshoot !== undefined) ? anim.overshoot : d.overshoot;
        const scale = easeBack(p, s);
        e.root.style.opacity = String(clamp01(p * 2) * baseOpacity);
        e.root.style.transform = 'scale(' + (0.8 + 0.2 * scale).toFixed(4) + ')';
      } else if (type === 'slide') {
        const fx = (anim && anim.from_x !== undefined) ? anim.from_x : d.from_x;
        const fy = (anim && anim.from_y !== undefined) ? anim.from_y : d.from_y;
        const k = easeOutCubic(p);
        e.root.style.opacity = String(k * baseOpacity);
        e.root.style.transform = 'translate(' + ((1 - k) * fx).toFixed(2) + 'px,' + ((1 - k) * fy).toFixed(2) + 'px)';
      } else { // fade
        e.root.style.opacity = String(easeOutCubic(p) * baseOpacity);
        e.root.style.transform = 'none';
      }
    }

    function renderCards(e, tLocal) {
      const spec = e.spec;
      const inAnim = spec.in || { type: 'slide', from_y: 50, dur_ms: 600 };
      const wraps = cardWraps(e);
      wraps.forEach((w, i) => {
        const tItem = tLocal - i * (e.stagger || 0);
        const p = animPhase(inAnim, tItem);
        if (p === null) { w.style.opacity = '0'; w.style.transform = 'translateY(' + ((inAnim.from_y !== undefined ? inAnim.from_y : 50)) + 'px)'; return; }
        const k = easeOutCubic(p);
        const fy = inAnim.from_y !== undefined ? inAnim.from_y : 50;
        w.style.opacity = String(k);
        w.style.transform = 'translateY(' + ((1 - k) * fy).toFixed(2) + 'px)';
      });
    }

    function renderShape(e, tLocal) {
      const spec = e.spec;
      const pin = animPhase(spec.in, tLocal);
      if (pin === null) { applyHidden(e); return; }
      const type = (spec.in && spec.in.type) || 'pop';
      applyAnim(e, type, pin, spec.in, 1);
    }

    // ── playback (wall-clock, mirrors hic-modal pacing model) ────────────
    function frameLoop(now) {
      if (!engine.playing) return;
      const t = engine.tAtStart + (now - engine.wallStart);
      if (t >= engine.total) {
        render(engine.total);
        pause();
        engine.t = engine.total;
        if (typeof opts.onEnd === 'function') opts.onEnd();
        return;
      }
      render(t);
      engine.raf = requestAnimationFrame(frameLoop);
    }

    function play() {
      if (engine.playing || engine.destroyed) return;
      if (engine.t >= engine.total) engine.t = 0; // replay
      engine.playing = true;
      engine.wallStart = performance.now();
      engine.tAtStart = (engine.t < 0 ? 0 : engine.t);
      if (typeof opts.onPlayState === 'function') opts.onPlayState(true);
      engine.raf = requestAnimationFrame(frameLoop);
    }

    function pause() {
      engine.playing = false;
      if (engine.raf) cancelAnimationFrame(engine.raf);
      engine.raf = 0;
      if (typeof opts.onPlayState === 'function') opts.onPlayState(false);
    }

    function reset() {
      pause();
      engine.t = 0;
      render(0);
    }

    function seek(tMs) {
      const wasPlaying = engine.playing;
      pause();
      engine.t = Math.max(0, Math.min(engine.total, tMs));
      render(engine.t);
      if (wasPlaying) play();
      if (typeof opts.onSeek === 'function') opts.onSeek(engine.t);
    }

    // ── kaTeX ────────────────────────────────────────────────────────────
    function renderMath() {
      if (!engine.hasLatex) return;
      const katexRender = (typeof window !== 'undefined' && window.renderMathInElement)
        || (typeof globalThis !== 'undefined' && globalThis.renderMathInElement);
      if (katexRender) {
        katexRender(stage, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } else {
        setTimeout(renderMath, 40);
      }
    }

    // ── static export (copy-paste bundle) ────────────────────────────────
    // Returns the storyboard + a note; a real exporter inverts DOM building
    // into the same markup this file generates (see demo.html export button).
    function getStoryboard() { return storyboard; }

    function destroy() {
      engine.destroyed = true;
      pause();
      stage.querySelectorAll('.hs-scene').forEach((n) => n.remove());
      stage.classList.remove('hs-stage');
      delete stage.dataset.aspect;
    }

    stage.addEventListener('click', () => {
      if (engine.playing) pause(); else play();
    });

    render(0); // initial frame
    renderMath();

    return {
      play, pause, reset, seek, render,
      getDuration: () => engine.total,
      getTime: () => engine.t,
      isPlaying: () => engine.playing,
      getStage: () => stage,
      getStoryboard,
      destroy,
    };
  }

  // browser-global registration (classic pages, console debugging)
  const hicScenesEases = { easeOutCubic, easeBack };
  if (typeof window !== 'undefined') {
    window.createScenePlayer = createScenePlayer;
    window.hicScenesEases = hicScenesEases;
  }

  export { createScenePlayer, hicScenesEases };
