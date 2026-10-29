---
name: 3point-style
description: >-
  "3Point-Style": a locked 9:16 style for talking-head tips / listicle videos ("3 kesilapan", "3 tips", "3 cara") built
  from several phone takes of the presenter shot around one location (first built for "3 Kesilapan Lepas Diberhentikan
  Kerja", Oct 2026). Navy + gold palette from Travel Style, adapted for education: a hook hero word behind the head,
  one condensed-serif title per point ("Yang pertama" / "JANGAN MEMBAZIR"), hero words behind the head on the key
  number, pop-in chips for listed items, a quiet full-frame cutaway for one point, vertical "lift" transitions between
  takes, a signature data panel (navy card, gold bars that rise on the spoken numbers) with the presenter stepped down
  below it, a rhetorical-question hero, a "JOM FOLLOW" title, and a recap end card of the N points over the blurred
  last frame. Use whenever the user says "3Point-Style", "3 Point Style", "style 3 point", "style 3 kesilapan",
  "macam video 3 kesilapan tu", or asks for a 9:16 tips/listicle edit from talking-head takes, even without naming
  it. Built with HyperFrames; renders the real MP4.
compatibility: >-
  Claude Code (shell access). Needs ffmpeg/ffprobe, Python 3 with numpy + faster-whisper (setup.sh installs them),
  Node 18+ (npx hyperframes@0.8.149). The cut-out uses `hyperframes remove-background` (CPU works, ~0.4-0.8 s/frame).
---

# 3Point-Style

`template/` is the approved build of **"3 Kesilapan Lepas Diberhentikan Kerja"** (6 iPhone takes in KLCC Park,
78.8 s of clean talk + 3.2 s recap = 82 s, 9:16). Its files:
- `index.html` (layers, titles, chips, the EIS chart panel, the recap card);
- `assets/js/anim.js` (all timing: lifts, camera, chart, titles, captions, end);
- `assets/js/captions.js`;
- the fonts.

Treat it as a worked example. Copy it to `work/<project>/`, swap the media and edit its data (line times, titles,
hero words, chips, chart values, captions, recap list). Don't rewrite it from scratch, and don't copy its topic, script
or numbers into another student's video. Commands, numbers and gotchas are in `references/pipeline.md`. Read it before
building.

Each new video keeps the identity below and gets **one signature moment of its own**. In the worked example, that moment
is the EIS bar chart. Other topics want other panels: a timeline, a checklist that ticks, a before/after, a simple
calculation. Pick the one the VO actually says; never invent numbers.

## Locked identity

| Layer | Rule |
|---|---|
| Inputs | Several short phone takes of the presenter (often iPhone 1080p 59.94 fps, stored landscape with −90° rotation), each in a different spot of one location, plus maybe a fluffed take of the same line. No B-roll needed. Probe everything: rotation, HDR vs SDR, loudness. Listen for an off-camera prompter and for end chatter ("Okey dah", "Betul ke?"). |
| Story | Hook (number + topic) → Point 1 → Point 2 → Point 3 (the fix, act 2) → rhetorical question → CTA (follow) → recap end card. Lines go in **script order**. When two takes say the same line, keep the one that is factually right and fluent. Fact-check every number the VO says, and drop a take that states one wrongly. |
| Edit | Keep only the talent's delivery. Squeeze silences > 0.24 s to 0.14 s, never cut inside a word, never speed speech up. Cut every segment to a **whole number of frames** so the voice never drifts from the picture. |
| Format | 1080×1920, 30 fps, SDR BT.709, rendered with `--sdr`. Duration follows the material (the example is 82 s). |
| Palette | Navy `#0a1a4f` / deep `#071238`, gold `#ffc72c` (highlight `#ffe07a`), white, royal yellow `#fada5e` for caption keywords. Gold never touches gold without a navy edge. Swap gold for the student's brand colour if asked. A navy outfit or hijab on the presenter ties in well. |
| Two acts | **Act 1, the problem** (hook and the first points): titles in gold with an 8 px navy stroke and a 7 px navy drop; hero words white with a soft navy glow; script in pale gold. **Act 2, the fix** (from the exact words that name the solution or authority, e.g. "PERKESO EIS"): white text with a 10 px navy stroke, hard navy drop and halo, gold accents. Captions switch to the navy stroke too. |
| Point titles (front) | Kicker in italic Poppins 700 using the presenter's own words ("Yang pertama", "Yang kedua"), then a 2-line Noto Serif Display condensed title (`wdth` 62.5, `wght` 800, caps, 125-190 px, rising out of a mask). Use them only where the head sits below ~470 px. Otherwise put the title on a cutaway or inside the panel. Size long words so they fit inside 1080 px ("DIBERHENTIKAN" needed 125 px). |
| Hero words (behind the head) | Poppins 800, 150-230 px, letter-spacing −0.035em. A Sacramento script (128 px, −7°) writes on over the top-left. At most one per sentence: the hook word, the key number ("3-6 Bulan"), the key verb, the rhetorical question ("Cukup?"). Place it from the tracked head-top so hair covers only the bottom ~15 %. Watch descenders: a `j` or `g` hidden by the hijab reads as another letter. |
| Chips | When the VO lists items ("duit rumah, duit makan, duit kereta"), navy pills with gold text and a white edge pop in one per spoken word under a short kicker. |
| Captions | Poppins 800, 66 px, 2-4 words, at y ≈ 1500, white with a 9 px dark stroke and hard drop. One keyword per chunk in royal yellow. Leave out words a title, chip or panel already shows. Fix Whisper's Malay spellings. |
| Transitions | **Lift** only. Between takes, the new own-background slice and the presenter cut-out rise together from below (yPercent 100→0, blur 14→0, 0.7 s `power3.inOut`), while the old slice, frozen on its own last frame, drifts up 24 % with an 8 px blur. A full-frame cutaway rises over the end of a line and lifts off upward to reveal the next take. No wipes, flashes or dims. |
| Presenter | Pixel-exact cut-out over its **own** take's background (slices of `aroll_cut.mp4`), so hero words can sit behind the head while the picture stays the real location. Never tint, dim or re-grade. Camera: calm sine glides between 1.0 and 1.06, and back to 1.0 before every hero word and every lift. |
| Signature panel | Navy rounded card (white 5 px edge) at y 100-890 on a blurred **person-free** crop of the location (trees/sky). The presenter steps down to scale 0.52, anchored at the bottom. The panel title rises on the act-2 words, the script line on the next phrase, and the baseline and labels draw in. Each value grows on its spoken number, with the % label riding the bar top. Add a small footnote when the numbers come from an authority ("tertakluk syarat kelayakan"). To come back, the full take rises over everything as a `#cut` layer, then the layers swap underneath invisibly. |
| End | No logo unless the student gives one. The presenter softens away (opacity + 8 px blur) while the last frame blurs to 16 px. The recap card rises: "N KESILAPAN" title with a gold light sweep, the N points as numbered navy circles, and the CTA in script ("jom follow saya"). |
| Audio | Voice cleaned (highpass, light denoise, 2.5:1 compression) to −16 LUFS. An original soft pad sits ~20 dB under it, swells after the last word, and has a bell on the recap. Soft synthesised SFX with variety: lift on lifts, pop on titles, air on hero words, chip ticks, a rising bar tone per value. Master with a **static gain** to −14 LUFS. |

## Workflow

1. **Probe and plan.**
   1. Probe every take. Make 8-frame contact sheets.
   2. Transcribe each take in Malay (`scripts/transcribe.py`).
   3. Build the line order from the script's logic. Spot retakes, fluffed numbers and end chatter.
   4. Send the student a plan: a beat table (time | line / take | visual), the assets, what is missing (logo, handle), and open questions (which retake, footnote, length).
   5. Wait for "ok".
2. **Clean the A-roll.** Write `clips.json` (script order, `from`/`to` speech windows), then run `scripts/cutlist.py` and `scripts/render_aroll.py`. This gives `aroll_cut.mp4`, `voice.wav` (−16 LUFS) and `line_times.json`. Re-transcribe `voice.wav` with word times; those times drive every title and caption.
3. **Cut-out early.** Start `bash media.sh cutout work/aroll_cut.mp4` in the background right after step 2 (≈30 min for 80 s on CPU). Check one frame over green first.
4. **Project.** Copy `template/` into `work/<project>/`. Make the own slices with `media.sh slice` (exact frames, 1 s freeze tail; the last one needs a tail long enough to cover the recap), any quiet cutaway with `media.sh cutaway`, and the panel background with `media.sh bgstill`.
5. **Audio.** Run `scripts/music.py` (pad, bell at the recap), then `media.sh bed`, `media.sh sfx`, `scripts/mix_sfx.py` (events at your lifts, titles, chips, bars) and `media.sh master`.
6. **Composition.** Edit `index.html`, `anim.js` and `captions.js`:
   - line times (`L2`…`L6`), lifts, cutaway and panel times;
   - glides;
   - hero tops from `scripts/headtop.py`;
   - titles, chips, panel values;
   - captions and the recap.
7. **Check.**
   1. Run `npx --yes hyperframes@0.8.149 lint` and `check`. Get 0 errors; mark only deliberate overlaps.
   2. Snapshot every title, hero, chip, panel beat, every lift (mid-transition) and the end.
   3. Look for: text overflowing 1080 px, letters lost behind the head, ghosts in blurred backgrounds, and a freeze tail showing the wrong take.
8. **Render** with segmented capture (see the pipeline reference; a plain render was OOM-killed at ~47 s).
   1. Verify with ffprobe (yuv420p, bt709, 30 fps) and ebur128 (−14 LUFS).
   2. Compare a face crop against `aroll_cut.mp4`.
   3. After the student approves, render `--quality delivery`, copy it to `output/<project>_9x16.mp4`, and also make `media.sh share` for phones and app previews.
