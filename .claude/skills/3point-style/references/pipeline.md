# 3Point-Style: pipeline reference

## Contents
1. [Worked example: the first build's beat map](#1-worked-example)
2. [Transcription and A-roll cleaning](#2-transcription-and-a-roll-cleaning)
3. [Media prep](#3-media-prep)
4. [Hero placement from the matte](#4-hero-placement)
5. [Signature panel](#5-signature-panel)
6. [Audio](#6-audio)
7. [Composition anatomy (`template/`)](#7-composition)
8. [Render and verification](#8-render)
9. [Gotchas](#9-gotchas)

## 1. Worked example
"3 Kesilapan Lepas Diberhentikan Kerja". Six iPhone takes in KLCC Park, 1920×1080 stored with −90° rotation, 59.94 fps,
SDR BT.709, ~110 s raw → 78.8 s clean talk + 3.2 s recap = 82 s. Takes in script order: IMG_1426 (hook, park track),
1429 (point 1), 1433 (point 2, KLCC lake), 1434 0–13 s (point 3 intro, starts crouched on grass), 1438 (the EIS rates:
used instead of 1434's second half, which said "20%" wrongly and ended "Betul ke?"), 1440 (CTA, banyan roots).
`clips.example.json` holds the speech windows used.

| t (s) | VO | Background | Graphic |
|---|---|---|---|
| 0–3.0 | "Tiga kesilapan yang korang jangan buat" | L1 own take (wide) | hero "Kesilapan" (160 px, top 495) + script "tiga" |
| 3.0–6.1 | "lepas korang diberhentikan kerja." | L1 | point title: "Lepas korang" / "DIBERHENTIKAN / KERJA" (125 px) |
| 6.1–9.6 | "Sebab apa? Sebab saya pun sama…" | L1 | captions; glide 1.05 |
| **9.633** | "Yang pertama sekali, jangan membazir." | lift → L2 | "Yang pertama" / "JANGAN / MEMBAZIR" (170 px) |
| 12.5–17.9 | "duit … last gaji … pampasan," | L2 | captions; glide 1.06 |
| 18.1–20.8 | "tolong bahagikan 3 hingga 6 bulan." | L2 | hero "3-6 Bulan" + script "bahagikan" |
| 22.2–26.1 | "duit rumah, duit makan, duit kereta…" | L2 | chips "Duit untuk bayar": Rumah / Makan / Kereta, one per word |
| 26.75–27.9 | "Sebab tu kena berjimat cermat." | L2 | hero "Berjimat" + script "kena" |
| **27.92**–31.3 | "Yang kedua, jangan tunggu lama-lama…" | full-frame cutaway (1426's quiet first 3.4 s at 80 % speed) | "Yang kedua" / "JANGAN / TUNGGU LAMA" |
| 31.3–42.1 | "…momentum… career break… 3 hingga 6 bulan" | cutaway lifts off → L3 | hero "Momentum" + script "jangan hilang"; glide 1.06 |
| **42.133** | "Yang ketiga, ramai yang tak tahu…" | lift → L4 (crouched, stands up) | captions |
| **46.4**–68.6 | "…claim dekat PERKESO EIS … 80% … 50% … 40% … 30%." | **panel** on blurred trees; presenter scale 0.52 | panel title 47.2 (act 2), script 48.7, baseline 50.3, bars 54.6 / 58.6 / 62.7+62.85 / 66.9+67.05; L5 swaps in at 53.167 (dip + rise) |
| 68.6–70.6 | "Cukup atau tidak?" | full L5 rises over the panel, swap at 69.34 | hero "Cukup?" (230 px, act 2) + script "atau tidak" |
| **70.667** | "Haa sekarang dah tahu kan…" | lift → L6 | captions; glide 1.06 |
| 75.65–78.75 | "So kalau korang suka konten… jom follow saya." | L6 | "Suka konten macam ni?" / "JOM / FOLLOW SAYA" (150 px, Follow gold) |
| 78.8–82.0 | (pad swell, bell 79.3) | L6 freeze blurred 16 px | recap "3 KESILAPAN" + sweep, 3 numbered points, script "jom follow saya" |

## 2. Transcription and A-roll cleaning
- `ffmpeg -i take.MOV -ac 1 -ar 16000 take.wav`, then `python3 scripts/transcribe.py take.wav take.json "key words"`.
  First run downloads large-v3 (~3 GB). Use plain `python3`: `-I` hides the `--user` packages from setup.sh.
- Check heads and tails with a 0.05 s loudness envelope. The worked example had no prompter cue, but "Okey dah" / "Okay
  tak?" at the end of a take, and rustle at −34 dB before speech (above the −37.5 dB gate) when the presenter stood up.
  Start the window after it. Whisper's "Terima kasih" on a quiet stretch means no speech.
- `cutlist.py` (gate −37.5 dBFS, silences > 0.24 s → 0.14 s) → `edl.json`. `render_aroll.py` renders each segment
  separately with `-frames:v N` where N = round(dur × 30), and an audio trim to the same N/30, then concat. The example came
  to 2364 frames = 78.800 s of video and voice exactly.
- Re-transcribe `voice.wav` with an initial prompt of the key words (numbers, "PERKESO EIS", "career break"). Use those
  word times for captions and titles; snap to envelope dips.

## 3. Media prep
- **Cut-out:** `media.sh cutout` ran 2364 frames at ~0.38 s/frame (4 CPUs, ~16 min) → `presenter.webm` (430 MB) and
  `work/matte_raw.webm`. Composite one frame over green before trusting it. The KLCC building backdrop keyed cleanly.
- **Own slices:** line starts in frames = line_time × 30 (289, 842, 1264, 1595, 2120; end 2364).
  `media.sh slice own2 289 842 1.0` etc. The last slice gets a tail that covers the recap (3.6 s). The panel's return
  needs a second copy of its take (`own5c.mp4`), because one file used twice trips lint `duplicate_media_discovery_risk`.
- **Cutaway:** the quiet seconds before a take's first word are free B-roll (`media.sh cutaway IMG_1426.MOV walk 0 3.4 1.25`).
- **Panel background:** `media.sh bgstill IMG_1426.MOV 0.3 760 chartbg`. Crop only the trees/sky. A full frame put a big
  blurred ghost of the presenter behind her small cut-out.

## 4. Hero placement
`python3 scripts/headtop.py work/matte_raw.webm work/headtop.txt` prints the head-top (px) every 0.2 s. For each hero:
`top = min(head-top over its window) − 0.72 × font-size`, then nudge from snapshots. Example values: Kesilapan 160 px
@495, 3-6 Bulan 165 px @240, Berjimat 180 px @315 (raised so the j shows), Momentum 158 px @330, Cukup? 230 px @530.
Front titles need the head below ~470 px. Close-ups (head-top 0–250) get no front title; use a cutaway or the panel.

## 5. Signature panel
- Panel `#ch-panel` 960×790 at (60, 100); title NSD 150 px at y 196; script at 330; bars 112 px wide, 148 px step from
  x 114, baseline y 760, full scale 400 px; labels "BULAN / n" under the baseline; footnote 22 px at 852.
- Presenter: `setCam(CH_IN, 0.52, 0, 403)` (origin 540,1080 → the frame bottom stays at 1920; the head lands ≥ 920).
- Bars: `scaleY` from the bottom (never tween height); the % label moves `y: −h` with the same ease. Two equal values
  stagger 0.15 s.
- A take change inside the panel: the small cut-out dips (yPercent 0→70, 0.2 s) and rises with the new take.
- Return: `lift(CH_OUT, "#cown5")`, then at +0.74 s set the camera to 1, hide the panel, and at +0.78 s hide `#cown5`
  (pixel-identical to the own slice + cut-out underneath).

## 6. Audio
- `music.py pad.wav 82.0 79.3` → `media.sh bed voice.wav pad.wav 82.0 78.45 bed.wav` (voice −16, pad −36, bed −14.7).
- SFX events (`sfx_events.example.json`): lift 0.5 on lifts (0.3 on the small dip), pop 0.3 on titles, zoom 0.22–0.25 on
  hero words, chip 0.45 per chip, bar 0.4 per bar (0.3 on the twin).
- `mix_sfx.py` → `media.sh master` (static +0.7 dB here) → −14.0 LUFS, peak −2.4 dBFS.

## 7. Composition
- Layer order (z): `#broll` 10 (own slices in time order, then `#bkchart` with the panel, then the last slice) → `.hero` 25
  → `#pres-wrap` 30 (cut-out) → `#cut` 35 (cutaway, the panel-return copy) → `.place` / `#chips` 40 → `#caps` 50 → `#end` 60.
- `anim.js`: helpers `lift` / `liftOff` / `KB` / `presIn` → background and cut schedule → `glide` / `setCam` (targets
  `#pres-cam` + every `.own-cam`) → panel → chips → `hero()` / `place()` → captions (act 2 from 47.3) → recap.
- During a cutaway rising over a take change, hide `#pres-wrap` at the change; the frozen tail (presenter inside) covers
  it until the cutaway is up.
- The presenter `<video>` is muted; all sound is one `<audio id="mix">`. Fonts are local woff2. Poppins has no en dash:
  write "3-6".

## 8. Render
```bash
npx --yes hyperframes@0.8.149 lint && npx --yes hyperframes@0.8.149 check      # check takes ~10 min with a 430 MB cut-out
npx --yes hyperframes@0.8.149 snapshot --at 2.6,4.9,9.95,20.6,27.7,28.3,31.6,34.6,42.4,46.75,53.1,58,68.85,70.3,70.95,77.6,81.5 --describe false
HF_SEGMENTED_CAPTURE=true HF_SEGMENT_FRAMES=300 HF_SEGMENT_BROWSER_RECYCLE=1 \
  npx --yes hyperframes@0.8.149 render --quality looks --fps 30 --sdr --workers 1 --resume -o renders/<name>-draft1.mp4
ffprobe -v error -show_entries stream=pix_fmt,color_transfer,color_primaries -select_streams v renders/<name>-draft1.mp4
ffmpeg -nostats -i renders/<name>-draft1.mp4 -af ebur128 -f null - 2>&1 | grep "I:"
```
Draft: ~20 min, 278 MB. Delivery (`--quality delivery`): ~24 min, 321 MB, ~32 Mbps. `media.sh share` → 90 MB. Send the
share copy for previews; a 300 MB+ file may play silent or stall in an app preview even though its audio is fine.

## 9. Gotchas
- One ffmpeg filter graph with 21 trims of 1080p60 sources was OOM-killed. Render segment by segment.
- Per-segment `-t` rounds each segment up to whole frames: video ran 0.31 s longer than audio over 21 cuts. Use frame counts.
- Slicing `aroll_cut.mp4` with `-ss/-t` grabbed one frame of the next take, so every freeze tail showed the wrong
  person or place mid-lift. Use `trim=start_frame:end_frame`.
- A plain render grew Chrome to 12 GB and was OOM-killed at frame ~1420 (the alpha cut-out is extracted as 4.4 MB PNGs,
  9.6 GB cache). Segmented capture with browser recycling fixes it. Clear `/tmp/hyperframes-extract-cache-*` afterwards.
- The serif title wraps or overflows on long words; check every title in a snapshot.
- Hero words partly behind the head lose descenders and ascenders ("Berjimat" read "Beriimat").
- Don't show a front title over a close-up face. The worked example moved point 3's title into the panel and point 2's
  onto a cutaway.
- Background waiting stuck on `pgrep -f <cmd>` can match the waiting shell itself; check outputs instead.
