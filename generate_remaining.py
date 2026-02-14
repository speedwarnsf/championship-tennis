#!/usr/bin/env python3
import subprocess, time, os, sys

os.chdir("/Users/macster/championship-tennis")

GEMINI_API_KEY = "AIzaSyCNJLK_QaOf6kZRUq48RVOOWcxFfet04WE"
SCRIPT = "/opt/homebrew/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"
SHEETS = "sprites-v2/sheets"
CHARS = "sprites-v2/characters"

CHARACTERS = {
    "chubby": "heavyset jolly male tennis player, round belly, cheerful expression, white polo stretched tight",
    "beach": "beach volleyball style female player, bikini top, short shorts, blonde beach hair, tanned",
    "goth": "goth female tennis player, all black outfit, pale skin, dark eye makeup, black hair",
    "grandpa": "elderly distinguished male tennis player, gray hair, sweater vest over polo, dignified pose",
    "indian": "Indian woman tennis player, colorful traditional-inspired outfit, long dark braided hair",
    "anime": "anime protagonist style tennis player, dramatic spiky blue hair, intense expression, stylized features",
    "latino": "Latino male tennis player, gold chain necklace, flashy colorful outfit, slicked back dark hair",
    "redhead": "fiery redhead female tennis player, bright orange-red hair, freckles, green outfit",
}

ANIMS = [
    ("idle", "idle stance animation. 8 frames showing subtle idle breathing and weight shifting while standing ready on tennis court, holding racket."),
    ("run", "running sideways animation. 8 frames showing shuffling sideways movement on tennis court, racket ready position."),
    ("swing", "forehand swing animation. 8 frames showing tennis forehand swing motion from wind-up to follow-through, holding racket."),
]

count = 0
success = 0
fail = 0
total = len(CHARACTERS) * len(ANIMS)

for char, desc in CHARACTERS.items():
    ref = f"{CHARS}/{char}-back-run.png"
    for anim_name, anim_desc in ANIMS:
        count += 1
        filename = f"{char}-back-{anim_name}-sheet.png"
        outpath = f"{SHEETS}/{filename}"
        
        if os.path.exists(outpath):
            print(f"[{count}/{total}] SKIP: {filename} (exists)")
            success += 1
            continue
        
        prompt = (
            f"16-bit retro pixel art sprite sheet, tennis player {desc}, "
            f"BACK VIEW, {anim_desc} "
            f"Style: 1990s SNES Super Tennis arcade game. "
            f"Ground shadow under feet. Dark charcoal background #2d2d2d. "
            f"4x2 grid layout, consistent character across all frames."
        )
        
        print(f"[{count}/{total}] GENERATING: {filename}")
        env = os.environ.copy()
        env["GEMINI_API_KEY"] = GEMINI_API_KEY
        
        result = subprocess.run(
            ["uv", "run", SCRIPT, "--prompt", prompt, "--filename", outpath, "-i", ref, "--resolution", "2K"],
            env=env, capture_output=True, text=True, timeout=120
        )
        
        if result.returncode == 0 and os.path.exists(outpath):
            print(f"  OK: {filename}")
            success += 1
        else:
            print(f"  FAIL: {filename}")
            if result.stderr:
                print(f"  stderr: {result.stderr[:200]}")
            fail += 1
        
        if count < total:
            print("  Waiting 15 seconds...")
            time.sleep(15)

print(f"\nDone. {success} success, {fail} fail out of {total}.")
