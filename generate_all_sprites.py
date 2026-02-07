#!/usr/bin/env python3
"""
Generate all character sprites for Championship Tennis.
Uses nano-banana-pro (Gemini 3 Pro) with tennis_sprites.png as reference.
"""

import subprocess
import os
import sys
import time
from pathlib import Path
from datetime import datetime

# Paths
BASE_DIR = Path("/Users/macster/championship-tennis")
REFERENCE_IMG = BASE_DIR / "tennis_sprites.png"
OUTPUT_DIR = BASE_DIR / "sprites-v2" / "characters"
RAW_DIR = BASE_DIR / "sprites-v2" / "raw"  # Store raw generated images
SKILL_SCRIPT = "/opt/homebrew/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"
PROCESS_SCRIPT = BASE_DIR / "process_sprite.py"

# API key from openclaw config
API_KEY = "AIzaSyDFwfSkP3EnlPiwMSwiIau9o-5D5VhjTWE"

# Character definitions
CHARACTERS = {
    # Base characters (2-12, skip 1)
    "player2": "female tennis player, curly dark hair, white tennis dress, athletic build, dark skin",
    "player3": "male tennis player, wearing red headband, medium build, white polo shirt and shorts",
    "player4": "female tennis player, blonde ponytail, athletic build, pink tennis outfit",
    "player5": "male tennis player, bald head, muscular build, blue polo shirt and shorts",
    "player6": "female tennis player, short sporty haircut, white tennis outfit, lean build",
    "player7": "male tennis player, wearing glasses, slim build, green polo shirt and shorts",
    "player8": "female tennis player, long braids, tall build, yellow tennis dress",
    "player9": "male tennis player, full beard, stocky muscular build, red polo shirt",
    "player10": "female tennis player, wearing white visor, tanned skin, orange tennis outfit",
    "player11": "male tennis player, blonde hair, young teenage look, white outfit",
    "player12": "female tennis player, Asian features, petite build, light blue tennis dress",
    
    # Fun unlockables (13-21)
    "punk": "punk rock tennis player, bright green mohawk, tattoos on arms, ripped sleeveless shirt, black shorts",
    "chubby": "heavyset jolly male tennis player, round belly, cheerful expression, white polo stretched tight",
    "beach": "beach volleyball style female player, bikini top, short shorts, blonde beach hair, tanned",
    "goth": "goth female tennis player, all black outfit, pale skin, dark eye makeup, black hair",
    "grandpa": "elderly distinguished male tennis player, gray hair, sweater vest over polo, dignified pose",
    "indian": "Indian woman tennis player, colorful traditional-inspired outfit, long dark braided hair",
    "anime": "anime protagonist style tennis player, dramatic spiky blue hair, intense expression, stylized features",
    "latino": "Latino male tennis player, gold chain necklace, flashy colorful outfit, slicked back dark hair",
    "redhead": "fiery redhead female tennis player, bright orange-red hair, freckles, green outfit",
}

# Animation types
ANIMATIONS = {
    "back-swing": {
        "view": "BACK",
        "action": "forehand swing",
        "details": "tennis forehand swing motion from wind-up to follow-through, holding racket"
    },
    "back-run": {
        "view": "BACK",
        "action": "running sideways",
        "details": "shuffling sideways movement on tennis court, racket ready position"
    },
    "front-swing": {
        "view": "FRONT",
        "action": "forehand swing",
        "details": "tennis forehand swing motion facing camera, racket swinging across body"
    },
    "front-run": {
        "view": "FRONT",
        "action": "running sideways",
        "details": "shuffling sideways movement facing camera, athletic stance"
    },
}

def generate_prompt(char_desc: str, view: str, action: str, details: str) -> str:
    """Generate the full prompt for image generation."""
    return (
        f"16-bit retro pixel art sprite sheet, tennis player {char_desc}, "
        f"{view} VIEW, {action} animation. 8 frames showing {details}. "
        f"Style: 1990s SNES Super Tennis arcade game. "
        f"Ground shadow under feet. Dark charcoal background #2d2d2d. "
        f"4x2 grid layout, consistent character across all frames."
    )

def generate_image(prompt: str, output_path: Path) -> bool:
    """Generate image using nano-banana-pro."""
    cmd = [
        "uv", "run", SKILL_SCRIPT,
        "--prompt", prompt,
        "--filename", str(output_path),
        "--input-image", str(REFERENCE_IMG),
        "--resolution", "2K",
        "--api-key", API_KEY
    ]
    
    print(f"  Generating: {output_path.name}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print(f"    ✓ Generated successfully")
            return True
        else:
            print(f"    ✗ Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"    ✗ Timeout")
        return False
    except Exception as e:
        print(f"    ✗ Exception: {e}")
        return False

def process_sprite(input_path: Path, output_path: Path) -> bool:
    """Process raw image into final sprite sheet."""
    cmd = ["uv", "run", str(PROCESS_SCRIPT), str(input_path), str(output_path)]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"    ✓ Processed to sprite sheet")
            return True
        else:
            print(f"    ✗ Process error: {result.stderr}")
            return False
    except Exception as e:
        print(f"    ✗ Process exception: {e}")
        return False

def main():
    # Create directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    
    # Track results
    results = {"success": [], "failed": []}
    total = len(CHARACTERS) * len(ANIMATIONS)
    current = 0
    
    print(f"=" * 60)
    print(f"Championship Tennis Sprite Generator")
    print(f"Characters: {len(CHARACTERS)}, Animations: {len(ANIMATIONS)}")
    print(f"Total sprite sheets to generate: {total}")
    print(f"=" * 60)
    
    start_time = time.time()
    
    for char_name, char_desc in CHARACTERS.items():
        print(f"\n[{char_name}] - {char_desc[:50]}...")
        
        for anim_name, anim_info in ANIMATIONS.items():
            current += 1
            sheet_name = f"{char_name}-{anim_name}"
            raw_path = RAW_DIR / f"{sheet_name}-raw.png"
            final_path = OUTPUT_DIR / f"{sheet_name}.png"
            
            print(f"\n  [{current}/{total}] {sheet_name}")
            
            # Skip if final already exists
            if final_path.exists():
                print(f"    → Already exists, skipping")
                results["success"].append(sheet_name)
                continue
            
            # Generate prompt
            prompt = generate_prompt(
                char_desc,
                anim_info["view"],
                anim_info["action"],
                anim_info["details"]
            )
            
            # Generate raw image
            if not raw_path.exists():
                if not generate_image(prompt, raw_path):
                    results["failed"].append(sheet_name)
                    continue
                # Rate limit: wait between API calls
                time.sleep(2)
            else:
                print(f"    → Raw exists, processing only")
            
            # Process into sprite sheet
            if process_sprite(raw_path, final_path):
                results["success"].append(sheet_name)
            else:
                results["failed"].append(sheet_name)
    
    # Summary
    elapsed = time.time() - start_time
    print(f"\n" + "=" * 60)
    print(f"GENERATION COMPLETE")
    print(f"=" * 60)
    print(f"Time elapsed: {elapsed/60:.1f} minutes")
    print(f"Successful: {len(results['success'])}/{total}")
    print(f"Failed: {len(results['failed'])}/{total}")
    
    if results["failed"]:
        print(f"\nFailed sprites:")
        for name in results["failed"]:
            print(f"  - {name}")
    
    # Save report
    report_path = OUTPUT_DIR / "generation_report.txt"
    with open(report_path, "w") as f:
        f.write(f"Championship Tennis Sprite Generation Report\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n")
        f.write(f"Duration: {elapsed/60:.1f} minutes\n\n")
        f.write(f"Success ({len(results['success'])}):\n")
        for name in results["success"]:
            f.write(f"  {name}\n")
        f.write(f"\nFailed ({len(results['failed'])}):\n")
        for name in results["failed"]:
            f.write(f"  {name}\n")
    
    print(f"\nReport saved to: {report_path}")

if __name__ == "__main__":
    main()
