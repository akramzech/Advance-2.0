"""Malay word-level transcript with faster-whisper (large-v3, CPU int8).
Usage: python3 transcribe.py <audio.wav 16 kHz mono> <out.json> ["initial prompt with key words"] [start] [end] [gain]
Prints one line per segment and writes [{start, end, text, words: [{w, s, e}]}].
The audio is passed as a numpy array: newer PyAV builds break faster-whisper's own decoder (metadata_errors TypeError).
Run it with plain python3, not python3 -I (-I hides the --user site-packages where setup.sh installs faster-whisper).
Make the wav first: ffmpeg -i take.MOV -ac 1 -ar 16000 take.wav"""
import sys, wave, json
import numpy as np
from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
prompt = sys.argv[3] if len(sys.argv) > 3 else None
a = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
b = float(sys.argv[5]) if len(sys.argv) > 5 else None
gain = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
w = wave.open(src); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
x = np.clip(x[int(a * sr): int(b * sr) if b else None] * gain, -1, 1)
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
segs, _ = m.transcribe(x, language="ms", word_timestamps=True, beam_size=5, condition_on_previous_text=False, initial_prompt=prompt)
res = []
for s in segs:
    print(f"{s.start + a:6.2f}-{s.end + a:6.2f} {s.text}", flush=True)
    res.append({"start": s.start + a, "end": s.end + a, "text": s.text,
                "words": [{"w": t.word, "s": t.start + a, "e": t.end + a} for t in s.words]})
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
