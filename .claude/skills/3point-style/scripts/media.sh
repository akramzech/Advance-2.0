#!/bin/bash
# 3Point-Style media helpers. Run from the project folder (work/<project>/). Each sub-command is independent.
#
#   bash media.sh cutout <work/aroll_cut.mp4>
#       Pixel-exact presenter cut-out (hyperframes remove-background, ~0.4-0.8 s/frame on CPU: start it early, in the
#       background), alphamerged with the SOURCE Y/U/V so skin and grade stay identical. -> assets/presenter.webm + work/matte_raw.webm
#   bash media.sh slice <name> <start_frame> <end_frame> <freeze_s>
#       Own-background slice of work/aroll_cut.mp4 by EXACT frame numbers (line_start_s x 30), plus a frozen tail for the
#       outgoing drift of a lift. -ss/-t is off by one frame and freezes on the NEXT take's first frame. -> assets/clips/<name>.mp4
#   bash media.sh cutaway <src.MOV> <name> <start> <dur> [slow]
#       A quiet full-frame shot from a take (before the talent speaks), optionally slowed (1.25 = 80 % speed). -> assets/clips/<name>.mp4
#   bash media.sh bgstill <src.MOV> <time> <crop_h> <name>
#       Blurred background for the data panel: crops the top <crop_h> px (trees/sky, no person) and blurs it,
#       so no ghost of the presenter sits behind the small cut-out. -> assets/broll/<name>.jpg
#   bash media.sh sfx <out_dir>
#       Soft synthesised SFX: lift, pop (titles), zoom (air under hero words), chip (list items), bar (chart bars).
#   bash media.sh bed <voice.wav> <pad.wav> <duration> <voice_end> <out.wav>
#       Voice + pad (~20 dB under the voice), swell after the last word, fades.
#   bash media.sh master <mix_sfx.wav> <out.wav>
#       Static gain to -14 LUFS + limiter (no dynamic loudnorm, so the mix never pumps). -> assets/audio_mix.wav
#   bash media.sh share <final.mp4> <out.mp4>
#       Light copy (~8-10 Mbps, faststart) for phones and app previews; the delivery render is ~30 Mbps / 300 MB+.
set -e
enc=(-an -c:v libx264 -crf 16 -preset medium -g 15 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart)
case "$1" in
  cutout)
    mkdir -p work assets
    npx --yes hyperframes@0.8.149 remove-background "$2" -o work/matte_raw.webm --quality best
    ffmpeg -v error -y -i "$2" -c:v libvpx-vp9 -i work/matte_raw.webm -filter_complex \
      "[1:v]format=yuva420p,alphaextract[a];[0:v]format=yuv420p[v];[v][a]alphamerge,format=yuva420p[o]" \
      -map "[o]" -an -c:v libvpx-vp9 -pix_fmt yuva420p -crf 14 -b:v 0 -deadline good -cpu-used 3 -row-mt 1 \
      -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv assets/presenter.webm
    ffprobe -v error -show_entries format=duration -of csv=p=0 assets/presenter.webm ;;
  slice)
    mkdir -p assets/clips
    ffmpeg -v error -y -i work/aroll_cut.mp4 -vf "trim=start_frame=$3:end_frame=$4,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=$5,setsar=1" "${enc[@]}" "assets/clips/$2.mp4" ;;
  cutaway)
    mkdir -p assets/clips
    ffmpeg -v error -y -ss "$4" -t "$5" -i "$2" -vf "setpts=${6:-1}*PTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1" "${enc[@]}" "assets/clips/$3.mp4" ;;
  bgstill)
    mkdir -p assets/broll
    ffmpeg -v error -y -ss "$3" -i "$2" -frames:v 1 -vf "crop=1080:$4:0:0,scale=1188:2112:force_original_aspect_ratio=increase,crop=1188:2112,gblur=sigma=30" -q:v 3 "assets/broll/$5.jpg" ;;
  sfx)
    mkdir -p "$2"; cd "$2"
    g() { ffmpeg -v error -y -f lavfi -i "$1" -ac 2 -ar 48000 "$2"; }
    g "anoisesrc=d=0.75:c=pink:r=48000:a=0.8,highpass=f=500,lowpass=f=4500,afade=t=in:st=0:d=0.45:curve=qsin,afade=t=out:st=0.45:d=0.3:curve=qsin,volume=0.5" lift.wav
    g "aevalsrc='0.5*sin(2*PI*(900-2400*t)*t)*exp(-30*t)':d=0.18:s=48000" pop.wav
    g "anoisesrc=d=1.2:c=pink:r=48000:a=0.8,lowpass=f=1800,highpass=f=200,afade=t=in:d=0.6:curve=qsin,afade=t=out:st=0.6:d=0.6:curve=qsin" zoom.wav
    g "anoisesrc=d=0.5:c=pink:r=48000:a=0.6,highpass=f=900,lowpass=f=6000,afade=t=in:d=0.25:curve=qsin,afade=t=out:st=0.25:d=0.25:curve=qsin,volume=0.5" chip.wav
    g "aevalsrc='0.45*sin(2*PI*(520+700*t)*t)*exp(-9*t)+0.18*sin(2*PI*(1040+1400*t)*t)*exp(-14*t)':d=0.35:s=48000" bar.wav
    ls ;;
  bed)
    ffmpeg -v error -y -i "$3" -af "aresample=48000,lowpass=f=3200,aecho=0.8:0.7:120|260:0.35|0.22,loudnorm=I=-36:TP=-6:LRA=11" -ar 48000 work_pad_norm.wav
    ffmpeg -v error -y -i "$2" -i work_pad_norm.wav -filter_complex \
      "[0]apad=whole_dur=$4[v];[1]atrim=0:$4,volume='if(lt(t,$5),1,if(lt(t,$5+0.7),1+(t-$5)/0.7*1.24,2.24))':eval=frame,afade=t=in:d=1.2,afade=t=out:st=$(echo "$4-1.3" | bc):d=1.3[m];[v][m]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[o]" \
      -map "[o]" -ar 48000 -ac 2 "$6"
    rm -f work_pad_norm.wav
    ffmpeg -hide_banner -i "$6" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" ;;
  master)
    I=$(ffmpeg -nostats -i "$2" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}')
    G=$(python3 -c "print(round(-14-($I),2))")
    ffmpeg -v error -y -i "$2" -af "volume=${G}dB,alimiter=limit=0.89:level=false" -ar 48000 "$3"
    ffmpeg -nostats -i "$3" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" ;;
  share)
    ffmpeg -v error -y -i "$2" -c:v libx264 -preset slow -crf 20 -maxrate 10M -bufsize 20M -profile:v high -level 4.1 -pix_fmt yuv420p \
      -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart "$3"
    ffprobe -v error -show_entries format=duration,size -of compact "$3" ;;
  *) sed -n 2,26p "$0" ;;
esac
