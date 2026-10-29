"""Cut the A-roll from the EDL into one 1080x1920 30 fps bt709 video + one clean mono voice (-16 LUFS).
Usage: python3 render_aroll.py <srcdir> <edl.json> <outdir>
One ffmpeg job per segment (a single filter graph with 20+ trims of 1080p60 sources was OOM-killed), each segment
trimmed to a whole number of frames so the video and the voice never drift apart, then a stream-copy concat.
Writes aroll_cut.mp4, voice.wav and line_times.json (where each line starts in the cut)."""
import sys, json, subprocess, os
SRC, EDL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
edl = json.load(open(EDL)); os.makedirs(f"{OUT}/segs", exist_ok=True)
t, n, timeline, lst = 0.0, 0, [], []
for clip in edl:
    cs = t
    for a, b in clip["segs"]:
        N = round((b - a) * 30); d = N / 30
        subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{a}","-t",f"{d}","-i",os.path.join(SRC,clip["src"]),
          "-frames:v",str(N),"-vf","fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.35,setsar=1",
          "-af",f"pan=mono|c0=0.5*c0+0.5*c1,aresample=48000,apad,atrim=0:{d},afade=t=in:d=0.012,afade=t=out:st={d-0.015:.3f}:d=0.015",
          "-c:v","libx264","-crf","14","-preset","medium","-pix_fmt","yuv420p","-colorspace","bt709","-color_primaries","bt709",
          "-color_trc","bt709","-color_range","tv","-c:a","pcm_s16le",f"{OUT}/segs/s{n:02d}.mov"],check=True)
        lst.append(f"file 'segs/s{n:02d}.mov'"); n += 1; t += d
    timeline.append({"name": clip["name"], "start": round(cs,3), "end": round(t,3)})
open(f"{OUT}/segs.txt","w").write("\n".join(lst)+"\n")
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",f"{OUT}/segs.txt","-map","0:v","-c:v","copy","-an",f"{OUT}/aroll_cut.mp4",
  "-map","0:a","-af","highpass=f=80,afftdn=nr=10:nf=-45,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=7",
  "-ar","48000","-ac","1",f"{OUT}/voice.wav"],check=True)
json.dump(timeline, open(f"{OUT}/line_times.json","w"), indent=1)
print(json.dumps(timeline), "total", round(t,3))
