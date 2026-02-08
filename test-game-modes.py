#!/usr/bin/env python3
import re
import json

# Read the HTML file
with open('index.html', 'r') as f:
    content = f.read()

print("🧪 Testing Championship Tennis game modes and features...")

# 1. Test character availability
print("\n👥 CHARACTERS:")
characters = re.findall(r"id:'([^']*)'[^}]*name:'([^']*)'", content)
for char_id, char_name in characters:
    print(f"  ✅ {char_id}: {char_name}")

print(f"Total characters: {len(characters)}")

# 2. Test sprite files
print("\n🎭 SPRITE VERIFICATION:")
import os
missing_sprites = []
available_sprites = []

for char_id, char_name in characters:
    if char_id == 'player1':
        # Check legacy sprites
        legacy_files = ['player-retro-backswing.png', 'player-retro-run.png', 
                       'opponent-retro-frontswing.png', 'opponent-retro-run.png',
                       'player-idle-v2.png', 'opponent-idle-v2.png']
        
        for file in legacy_files:
            if os.path.exists(file):
                available_sprites.append(f"player1: {file}")
            else:
                missing_sprites.append(f"player1: {file}")
    else:
        # Check sprites-v2 files
        required_files = ['back-swing.png', 'back-run.png', 'front-swing.png', 'front-run.png']
        for file in required_files:
            path = f"sprites-v2/characters/{char_id}-{file}"
            if os.path.exists(path):
                available_sprites.append(f"{char_id}: {file}")
            else:
                missing_sprites.append(f"{char_id}: {file}")

print(f"  ✅ Available sprites: {len(available_sprites)}")
print(f"  ❌ Missing sprites: {len(missing_sprites)}")

if missing_sprites[:5]:  # Show first 5 missing
    print("  Missing files (first 5):")
    for missing in missing_sprites[:5]:
        print(f"    - {missing}")

# 3. Test game modes
print("\n🎮 GAME MODES:")
game_modes = re.findall(r"{'mode':'([^']*)'[^}]*'desc':'([^']*)'", content)
for mode, desc in game_modes:
    print(f"  ✅ {mode}: {desc}")

print(f"Total game modes: {len(game_modes)}")

# 4. Test scoring system
print("\n📊 SCORING SYSTEM:")
scoring_functions = ['updateScore', 'checkGameWin', 'checkSetWin', 'checkMatchWin', 'getTiebreakServer']
found_functions = []
for func in scoring_functions:
    if f"function {func}" in content:
        found_functions.append(func)
        print(f"  ✅ {func}")
    else:
        print(f"  ❌ {func} - NOT FOUND")

# 5. Test audio system
print("\n🔊 AUDIO SYSTEM:")
audio_functions = ['playTone', 'AudioManager', 'safePlaySound']
for func in audio_functions:
    if func in content:
        print(f"  ✅ {func} detected")
    else:
        print(f"  ❌ {func} - NOT FOUND")

# 6. Test mobile optimizations
print("\n📱 MOBILE OPTIMIZATIONS:")
mobile_features = ['touch', 'viewport', 'MobileEnhancer', 'mobileVibrate', 'user-scalable=no']
mobile_found = []
for feature in mobile_features:
    if feature in content:
        mobile_found.append(feature)
        print(f"  ✅ {feature}")

# 7. Test production hardening
print("\n🛡️ PRODUCTION HARDENING:")
hardening_features = ['safeGetElement', 'ErrorRecovery', 'LoadingManager', 'PerformanceOptimizer', 'validateCriticalState']
hardening_found = []
for feature in hardening_features:
    if feature in content:
        hardening_found.append(feature)
        print(f"  ✅ {feature}")
    else:
        print(f"  ❌ {feature} - NOT FOUND")

# 8. Test error handling
print("\n🚨 ERROR HANDLING:")
error_patterns = ['try {', 'catch', 'console.error', 'console.warn']
error_counts = {}
for pattern in error_patterns:
    count = len(re.findall(pattern, content))
    error_counts[pattern] = count
    print(f"  📊 {pattern}: {count} occurrences")

# 9. Generate test report
print("\n📋 COMPREHENSIVE TEST REPORT:")
print("=" * 50)

total_score = 0
max_score = 0

# Characters (10 points)
max_score += 10
if len(characters) >= 10:
    total_score += 10
    print("  ✅ Characters: EXCELLENT (10/10)")
else:
    score = min(len(characters), 10)
    total_score += score
    print(f"  ⚠️ Characters: OK ({score}/10)")

# Sprites (15 points)
max_score += 15
sprite_score = max(0, 15 - len(missing_sprites))
total_score += sprite_score
if sprite_score >= 13:
    print(f"  ✅ Sprites: EXCELLENT ({sprite_score}/15)")
else:
    print(f"  ⚠️ Sprites: NEEDS ATTENTION ({sprite_score}/15)")

# Game modes (10 points)
max_score += 10
if len(game_modes) >= 3:
    total_score += 10
    print("  ✅ Game Modes: EXCELLENT (10/10)")
else:
    score = len(game_modes) * 3
    total_score += score
    print(f"  ⚠️ Game Modes: OK ({score}/10)")

# Scoring system (15 points)
max_score += 15
scoring_score = len(found_functions) * 3
total_score += scoring_score
if scoring_score >= 13:
    print(f"  ✅ Scoring: EXCELLENT ({scoring_score}/15)")
else:
    print(f"  ⚠️ Scoring: NEEDS ATTENTION ({scoring_score}/15)")

# Mobile optimization (10 points)
max_score += 10
mobile_score = min(len(mobile_found) * 2, 10)
total_score += mobile_score
if mobile_score >= 8:
    print(f"  ✅ Mobile: EXCELLENT ({mobile_score}/10)")
else:
    print(f"  ⚠️ Mobile: OK ({mobile_score}/10)")

# Production hardening (20 points)
max_score += 20
hardening_score = min(len(hardening_found) * 4, 20)
total_score += hardening_score
if hardening_score >= 16:
    print(f"  ✅ Hardening: EXCELLENT ({hardening_score}/20)")
else:
    print(f"  ⚠️ Hardening: NEEDS WORK ({hardening_score}/20)")

# Error handling (10 points)
max_score += 10
if error_counts.get('try {', 0) >= 5 and error_counts.get('catch', 0) >= 5:
    total_score += 10
    print("  ✅ Error Handling: EXCELLENT (10/10)")
else:
    score = min((error_counts.get('try {', 0) + error_counts.get('catch', 0)) // 2, 10)
    total_score += score
    print(f"  ⚠️ Error Handling: OK ({score}/10)")

# Final score
percentage = (total_score / max_score) * 100
print("=" * 50)
print(f"🏆 FINAL SCORE: {total_score}/{max_score} ({percentage:.1f}%)")

if percentage >= 95:
    grade = "A+ 🌟 TOURNAMENT READY"
elif percentage >= 90:
    grade = "A 🏆 PRODUCTION READY"
elif percentage >= 80:
    grade = "B+ ✅ GOOD QUALITY"
elif percentage >= 70:
    grade = "B ⚠️ NEEDS POLISH"
else:
    grade = "C ❌ NEEDS WORK"

print(f"📊 GRADE: {grade}")

# Recommendations
print("\n💡 RECOMMENDATIONS:")
if len(missing_sprites) > 0:
    print("  🎭 Fix missing sprites for complete character roster")
if len(found_functions) < len(scoring_functions):
    print("  📊 Verify all scoring functions are implemented")
if len(hardening_found) < len(hardening_features):
    print("  🛡️ Add remaining production hardening features")

print("\n🎮 Championship Tennis analysis complete!")