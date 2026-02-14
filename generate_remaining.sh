#!/bin/bash
set -e
cd /Users/macster/championship-tennis

export GEMINI_API_KEY="AIzaSyCNJLK_QaOf6kZRUq48RVOOWcxFfet04WE"
SCRIPT="/opt/homebrew/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"
SHEETS="sprites-v2/sheets"
CHARS="sprites-v2/characters"

generate() {
    local name="$1"
    local filename="$2"
    local prompt="$3"
    local ref="$4"
    
    if [ -f "$SHEETS/$filename" ]; then
        echo "SKIP: $filename (exists)"
        return 0
    fi
    
    echo "GENERATING: $filename"
    GEMINI_API_KEY="$GEMINI_API_KEY" uv run "$SCRIPT" \
        --prompt "$prompt" \
        --filename "$SHEETS/$filename" \
        -i "$CHARS/$ref" \
        --resolution 2K
    
    if [ $? -eq 0 ]; then
        echo "OK: $filename"
    else
        echo "FAIL: $filename"
    fi
    
    echo "Waiting 15 seconds..."
    sleep 15
}

# Character descriptions and reference images
declare -A DESCS
DESCS[chubby]="heavyset jolly male tennis player, round belly, cheerful expression, white polo stretched tight"
DESCS[beach]="beach volleyball style female player, bikini top, short shorts, blonde beach hair, tanned"
DESCS[goth]="goth female tennis player, all black outfit, pale skin, dark eye makeup, black hair"
DESCS[grandpa]="elderly distinguished male tennis player, gray hair, sweater vest over polo, dignified pose"
DESCS[indian]="Indian woman tennis player, colorful traditional-inspired outfit, long dark braided hair"
DESCS[anime]="anime protagonist style tennis player, dramatic spiky blue hair, intense expression, stylized features"
DESCS[latino]="Latino male tennis player, gold chain necklace, flashy colorful outfit, slicked back dark hair"
DESCS[redhead]="fiery redhead female tennis player, bright orange-red hair, freckles, green outfit"

CHARACTERS=(chubby beach goth grandpa indian anime latino redhead)

count=0
total=24

for char in "${CHARACTERS[@]}"; do
    desc="${DESCS[$char]}"
    ref="${char}-back-run.png"
    
    # idle sheet
    count=$((count + 1))
    echo "[$count/$total] ${char}-back-idle-sheet.png"
    generate "$char" "${char}-back-idle-sheet.png" \
        "16-bit retro pixel art sprite sheet, tennis player ${desc}, BACK VIEW, idle stance animation. 8 frames showing subtle idle breathing and weight shifting while standing ready on tennis court, holding racket. Style: 1990s SNES Super Tennis arcade game. Ground shadow under feet. Dark charcoal background #2d2d2d. 4x2 grid layout, consistent character across all frames." \
        "$ref"
    
    # run sheet
    count=$((count + 1))
    echo "[$count/$total] ${char}-back-run-sheet.png"
    generate "$char" "${char}-back-run-sheet.png" \
        "16-bit retro pixel art sprite sheet, tennis player ${desc}, BACK VIEW, running sideways animation. 8 frames showing shuffling sideways movement on tennis court, racket ready position. Style: 1990s SNES Super Tennis arcade game. Ground shadow under feet. Dark charcoal background #2d2d2d. 4x2 grid layout, consistent character across all frames." \
        "$ref"
    
    # swing sheet
    count=$((count + 1))
    echo "[$count/$total] ${char}-back-swing-sheet.png"
    generate "$char" "${char}-back-swing-sheet.png" \
        "16-bit retro pixel art sprite sheet, tennis player ${desc}, BACK VIEW, forehand swing animation. 8 frames showing tennis forehand swing motion from wind-up to follow-through, holding racket. Style: 1990s SNES Super Tennis arcade game. Ground shadow under feet. Dark charcoal background #2d2d2d. 4x2 grid layout, consistent character across all frames." \
        "$ref"
done

echo ""
echo "DONE. Generated $count sheets."
echo "Existing sheets:"
ls -1 "$SHEETS"/*.png | wc -l
