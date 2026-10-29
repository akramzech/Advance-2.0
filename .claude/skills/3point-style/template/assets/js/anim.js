(function () {
  const tl = gsap.timeline({ paused: true });
  const T_MAIN = 78.8;
  const T_END = 82.0;

  /* ============ transitions: vertical "lift" (incoming rises from below; a covering layer lifts off upward) ============ */
  const LIFT = 0.7;
  const lift = (t, inSel, outSel, dur = LIFT) => {
    tl.set(inSel, { autoAlpha: 1 }, t);
    tl.fromTo(inSel, { yPercent: 100, filter: "blur(14px)" }, { yPercent: 0, filter: "blur(0px)", duration: dur, ease: "power3.inOut", immediateRender: false }, t);
    if (outSel) {
      tl.fromTo(outSel, { yPercent: 0, filter: "blur(0px)" }, { yPercent: -24, filter: "blur(8px)", duration: dur, ease: "power3.inOut", immediateRender: false }, t);
      tl.set(outSel, { autoAlpha: 0 }, t + dur + 0.03);
      tl.set(outSel, { yPercent: 0, filter: "none" }, t + dur + 0.05);
    }
  };
  const liftOff = (t, sel) => {
    tl.fromTo(sel, { yPercent: 0, filter: "blur(0px)" }, { yPercent: -100, filter: "blur(10px)", duration: 0.75, ease: "power3.inOut", immediateRender: false }, t);
    tl.set(sel, { autoAlpha: 0 }, t + 0.78);
    tl.set(sel, { yPercent: 0, filter: "none" }, t + 0.8);
  };
  // slow linear drift on each real place
  const KB = (id, t0, t1, from, to) =>
    tl.fromTo(`#${id} .kb`, { x: from.x || 0, y: from.y || 0, scale: from.s || 1 },
      { x: to.x || 0, y: to.y || 0, scale: to.s || 1, duration: t1 - t0 + LIFT, ease: "none", immediateRender: false }, t0);

  gsap.set(".bk", { autoAlpha: 0, transformOrigin: "50% 50%" });
  gsap.set(".bk .kb", { transformOrigin: "50% 45%" });

  /* the presenter cut-out lifts in together with each new own-background take */
  const presIn = (t, dur = LIFT) =>
    tl.fromTo("#pres-wrap", { yPercent: 100, filter: "blur(14px)" }, { yPercent: 0, filter: "blur(0px)", duration: dur, ease: "power3.inOut", immediateRender: false }, t);

  /* ============ backgrounds: own takes (with a frozen 1 s tail for the outgoing drift) ============ */
  const L2 = 9.633, L3 = 28.067, L4 = 42.133, L5 = 53.167, L6 = 70.667;
  const CH_IN = 46.4, CH_OUT = 68.6;
  tl.set("#bkown1", { autoAlpha: 1 }, 0);
  lift(L2, "#bkown2", "#bkown1"); presIn(L2);
  // "yang kedua": the quiet park cutaway rises over the end of L2 and lifts off to reveal L3
  const CW = 27.92;
  lift(CW, "#cwalk", null); KB("cwalk", CW, 31.3, { s: 1.0, y: 10 }, { s: 1.08, y: -20 });
  tl.set("#pres-wrap", { autoAlpha: 0 }, L3);            // L2's frozen tail (presenter inside) shows under the rising cutaway
  tl.set("#bkown3", { autoAlpha: 1 }, L3 + 0.7);
  tl.set("#bkown2", { autoAlpha: 0 }, L3 + 0.75);
  tl.set("#pres-wrap", { autoAlpha: 1 }, L3 + 0.7);
  liftOff(31.3, "#cwalk");
  lift(L4, "#bkown4", "#bkown3"); presIn(L4);
  // signature: the chart rises behind a stepped-down presenter
  lift(CH_IN, "#bkchart", "#bkown4"); presIn(CH_IN);
  KB("bkchart", CH_IN, CH_OUT, { s: 1.0 }, { s: 1.06 });
  tl.set("#bkown5", { autoAlpha: 1 }, L5);               // waiting under the chart
  // L4 -> L5 inside the chart: the small presenter dips out and rises with the new take
  tl.fromTo("#pres-wrap", { yPercent: 0 }, { yPercent: 70, duration: 0.2, ease: "power2.in", immediateRender: false }, L5 - 0.2);
  presIn(L5, 0.6);
  // back from the chart: the full L5 frame rises over everything, then the layers underneath swap invisibly
  lift(CH_OUT, "#cown5", null);
  tl.set("#bkchart", { autoAlpha: 0 }, CH_OUT + 0.74);
  tl.set("#cown5", { autoAlpha: 0 }, CH_OUT + 0.78);
  lift(L6, "#bkown6", "#bkown5"); presIn(L6);

  /* ============ presenter: calm glides (sine only), the own background follows the same camera ============ */
  const BOTH = ["#pres-cam", ".own-cam"];
  gsap.set(BOTH, { transformOrigin: "540px 1080px", scale: 1, x: 0, y: 0 });
  let cur = { s: 1, x: 0, y: 0 };
  const glide = (t, dur, s, x, y, targets = BOTH) => {
    tl.fromTo(targets, { scale: cur.s, x: cur.x, y: cur.y }, { scale: s, x, y, duration: dur, ease: "sine.inOut", immediateRender: false }, t);
    cur = { s, x, y };
  };
  const setCam = (t, s, x, y) => { tl.set("#pres-cam", { scale: s, x, y }, t); cur = { s, x, y }; };
  glide(3.0, 1.2, 1.05, 0, 0);       // "lepas korang diberhentikan kerja"
  glide(7.9, 1.2, 1.0, 0, 0);
  glide(12.6, 1.2, 1.06, 0, 0);      // "duit last gaji"
  glide(16.6, 1.0, 1.0, 0, 0);       // back for the hero word
  glide(21.4, 1.2, 1.05, 0, 0);      // "rumah, makan, kereta"
  glide(25.2, 0.9, 1.0, 0, 0);
  glide(35.4, 1.2, 1.06, 0, 0);      // "career break"
  glide(40.6, 1.0, 1.0, 0, 0);
  glide(43.4, 1.2, 1.05, 0, 0);      // "ramai yang tak tahu"
  glide(45.0, 1.0, 1.0, 0, 0);
  setCam(CH_IN, 0.52, 0, 403);       // chart: the presenter steps down so the chart sits above the head (rises in with the chart)
  setCam(CH_OUT + 0.74, 1.0, 0, 0);  // hidden under the rising full frame
  glide(72.0, 1.2, 1.06, 0, 0);      // "apa nak buat"
  // end: the presenter softens away, the last frame blurs, the recap rises
  tl.fromTo("#pres-wrap", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.6, ease: "sine.inOut", immediateRender: false }, T_MAIN - 0.15);
  tl.fromTo("#bkown6 video", { filter: "blur(0px)" }, { filter: "blur(16px)", duration: 0.8, ease: "sine.inOut", immediateRender: false }, T_MAIN - 0.15);

  /* ============ chart: header, then one bar per month, each on its spoken number ============ */
  const BAR_X0 = 114, BAR_STEP = 148, BASE = 760, FULL = 400;
  const PCT = [80, 50, 40, 40, 30, 30];
  PCT.forEach((v, i) => {
    gsap.set(`#c${i + 1}`, { left: BAR_X0 + i * BAR_STEP });
    gsap.set(`#c${i + 1} .bar`, { top: BASE - FULL, height: FULL, scaleY: 0 });
    gsap.set(`#c${i + 1} .pct`, { top: BASE - 64, opacity: 0 });
  });
  gsap.set(["#ch-kick", "#ch-title .ln", "#ch-scr", ".col .mo", "#ch-note"], { opacity: 0 });
  gsap.set("#ch-base", { scaleX: 0 });
  tl.fromTo("#ch-kick", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, CH_IN + 0.5);
  tl.fromTo("#ch-title .ln", { opacity: 1, clipPath: "inset(0 0 100% 0)", y: 60 }, { opacity: 1, clipPath: "inset(0 0 -10% 0)", y: 0, duration: 0.8, ease: "power3.out", immediateRender: false }, 47.2);
  tl.fromTo("#ch-scr", { opacity: 1, clipPath: "inset(-30% 100% -30% -5%)" }, { opacity: 1, clipPath: "inset(-30% -5% -30% -5%)", duration: 0.9, ease: "sine.inOut", immediateRender: false }, 48.7);
  tl.fromTo("#ch-base", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.inOut", immediateRender: false }, 50.3);
  tl.fromTo(".col .mo", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power3.out", immediateRender: false }, 50.6);
  tl.fromTo("#ch-note", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "sine.out", immediateRender: false }, 51.4);
  const barIn = (i, t) => {
    const h = (PCT[i] / 100) * FULL;
    tl.fromTo(`#c${i + 1} .bar`, { scaleY: 0 }, { scaleY: PCT[i] / 100, duration: 0.7, ease: "power3.out", immediateRender: false }, t);
    tl.fromTo(`#c${i + 1} .pct`, { opacity: 0, y: 0 }, { opacity: 1, y: -h, duration: 0.7, ease: "power3.out", immediateRender: false }, t);
  };
  barIn(0, 54.6);
  barIn(1, 58.6);
  barIn(2, 62.7); barIn(3, 62.85);
  barIn(4, 66.9); barIn(5, 67.05);

  /* chips: one per spoken expense */
  gsap.set("#chips", { autoAlpha: 0 });
  gsap.set(".chip", { opacity: 0 });
  tl.set("#chips", { autoAlpha: 1 }, 22.2);
  tl.fromTo("#chips .kick", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, 22.2);
  [["#chip1", 22.5], ["#chip2", 23.4], ["#chip3", 24.5]].forEach(([sel, t]) =>
    tl.fromTo(sel, { opacity: 0, y: 60, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.8)", immediateRender: false }, t));
  tl.to("#chips", { opacity: 0, y: -16, filter: "blur(8px)", duration: 0.4, ease: "power2.in" }, 25.9);
  tl.set("#chips", { autoAlpha: 0, filter: "none" }, 26.3);

  /* ============ titles ============ */
  gsap.set(".hero, .place", { autoAlpha: 0 });
  const hero = (sel, t0, t1) => {
    tl.set(sel, { autoAlpha: 1 }, t0);
    tl.fromTo(`${sel} .big`, { opacity: 0, y: 60, filter: "blur(16px)", letterSpacing: "0.04em" }, { opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "-0.035em", duration: 0.9, ease: "power3.out", immediateRender: false }, t0);
    tl.fromTo(`${sel} .scr`, { clipPath: "inset(-30% 100% -30% -5%)" }, { clipPath: "inset(-30% -5% -30% -5%)", duration: 0.9, ease: "sine.inOut", immediateRender: false }, t0 + 0.25);
    tl.fromTo(sel, { scale: 1 }, { scale: 1.04, duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    tl.to(sel, { opacity: 0, y: -20, filter: "blur(10px)", duration: 0.4, ease: "power2.in" }, t1 - 0.4);
    tl.set(sel, { autoAlpha: 0, filter: "none" }, t1);
  };
  const place = (sel, t0, t1) => {
    tl.set(sel, { autoAlpha: 1 }, t0);
    tl.fromTo(`${sel} .kick`, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, t0);
    tl.fromTo(`${sel} .ln`, { clipPath: "inset(0 0 100% 0)", y: 70 }, { clipPath: "inset(0 0 -10% 0)", y: 0, duration: 0.8, stagger: 0.14, ease: "power3.out", immediateRender: false }, t0 + 0.15);
    tl.fromTo(sel, { scale: 1 }, { scale: 1.03, duration: t1 - t0, ease: "none", immediateRender: false }, t0);
    tl.to(sel, { opacity: 0, y: -16, filter: "blur(8px)", duration: 0.4, ease: "power2.in" }, t1 - 0.4);
    tl.set(sel, { autoAlpha: 0, filter: "none" }, t1);
  };
  hero("#h-kes", 0.12, 2.95);
  place("#p-kerja", 3.0, 6.1);
  place("#p-1", 9.75, 12.45);
  hero("#h-bulan", 19.0, 20.85);
  hero("#h-jimat", 26.75, 27.9);
  place("#p-2", 28.55, 31.3);
  hero("#h-moment", 32.55, 35.15);
  hero("#h-cukup", 69.35, 70.62);
  place("#p-follow", 75.65, 78.75);

  /* ============ captions ============ */
  const caps = document.getElementById("caps");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  window.AKG_CAPS.forEach(([t0, t1, text, kw], i) => {
    const el = document.createElement("div");
    el.className = "cap" + (t0 >= 47.3 ? " mk" : "");
    el.id = "cap-" + i;
    el.innerHTML = kw && text.includes(kw) ? esc(text).replace(esc(kw), `<span class="kw">${esc(kw)}</span>`) : esc(text);
    caps.appendChild(el);
    gsap.set(el, { autoAlpha: 0, transformOrigin: "50% 60%" });
    tl.set(el, { autoAlpha: 1 }, t0);
    tl.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: "power2.out", immediateRender: false }, t0);
    tl.set(el, { autoAlpha: 0 }, Math.max(t0 + 0.2, t1 - 0.02));
  });

  /* ============ end: the recap rises over the softened last frame ============ */
  gsap.set("#end", { autoAlpha: 0 });
  lift(T_MAIN + 0.1, "#end", null, 0.8);
  tl.fromTo(".it", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.25, ease: "power3.out", immediateRender: false }, T_MAIN + 0.7);
  tl.fromTo("#end-sweep", { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 1.3, ease: "sine.inOut", immediateRender: false }, T_MAIN + 0.5);
  tl.fromTo("#end-scr", { clipPath: "inset(-30% 100% -30% -5%)" }, { clipPath: "inset(-30% -5% -30% -5%)", duration: 1.0, ease: "sine.inOut", immediateRender: false }, T_MAIN + 1.5);

  tl.set({}, {}, T_END);
  window.AKG_TL = tl;
})();
