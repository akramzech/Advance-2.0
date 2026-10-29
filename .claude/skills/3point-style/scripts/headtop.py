"""Presenter head-top (topmost matte row, px in the 1080x1920 frame) every 0.1 s, from the raw matte.
Usage: python3 headtop.py <work/matte_raw.webm> [out.txt]
Place a hero word so hair covers only its bottom ~15 %: top = (lowest head-top in the hero's window) - 0.72 x font-size.
Back the camera to scale 1.0 before every hero window, or the numbers no longer hold."""
import sys, subprocess
import numpy as np
W, H = 270, 480
p = subprocess.Popen(["ffmpeg", "-v", "error", "-c:v", "libvpx-vp9", "-i", sys.argv[1], "-vf", "fps=10,alphaextract,scale=270:480",
                      "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
tops = []
while True:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H:
        break
    rows = np.where((np.frombuffer(buf, np.uint8).reshape(H, W) > 128)[:, 60:210].any(1))[0]
    tops.append(int(rows[0]) * 4 if len(rows) else -1)
if len(sys.argv) > 2:
    open(sys.argv[2], "w").write("\n".join(map(str, tops)))
for i in range(0, len(tops), 20):
    print(f"{i / 10:5.1f}s", " ".join(f"{v:4d}" for v in tops[i:i + 20:2]))
