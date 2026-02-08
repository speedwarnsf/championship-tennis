#!/usr/bin/env python3
import os

# Read the HTML file to extract character definitions
with open('index.html', 'r') as f:
    content = f.read()

# Extract character IDs from the HTML
characters = []
start_chars = content.find('window.CHARACTERS = [')
if start_chars != -1:
    end_chars = content.find('];', start_chars)
    char_section = content[start_chars:end_chars]
    
    # Find all id: patterns
    import re
    ids = re.findall(r"id:'([^']*)'", char_section)
    characters = ids

print("🎾 Characters defined in game:")
for char in characters:
    print(f"  - {char}")

print("\n🗂️ Sprite files available in sprites-v2/characters/:")
sprite_files = {}
for file in os.listdir('sprites-v2/characters/'):
    if file.endswith('.png'):
        parts = file.split('-')
        if len(parts) >= 3:  # e.g., player4-back-swing.png
            char_id = parts[0]
            view = parts[1]  # back or front
            action = parts[2].replace('.png', '')  # swing or run
            
            if char_id not in sprite_files:
                sprite_files[char_id] = {}
            if view not in sprite_files[char_id]:
                sprite_files[char_id][view] = []
            sprite_files[char_id][view].append(action)

for char_id, views in sprite_files.items():
    print(f"  - {char_id}: {views}")

print("\n⚠️ Missing sprite files:")
missing = []
for char in characters:
    if char == 'player1':
        # player1 uses legacy sprites in root directory
        continue
    
    if char not in sprite_files:
        missing.append(f"{char}: No sprite files found")
        continue
    
    required = ['back-swing.png', 'back-run.png', 'front-swing.png', 'front-run.png']
    for req in required:
        path = f"sprites-v2/characters/{char}-{req}"
        if not os.path.exists(path):
            missing.append(f"{char}: Missing {req}")

if missing:
    for miss in missing:
        print(f"  - {miss}")
else:
    print("  ✅ All required sprite files present!")

# Check for orphaned sprite files (characters not in game)
orphaned = []
for char_id in sprite_files:
    if char_id not in characters and char_id != 'player1':
        orphaned.append(char_id)

if orphaned:
    print("\n🧩 Orphaned sprite files (characters not defined in game):")
    for orphan in orphaned:
        print(f"  - {orphan}")

print(f"\n📊 Summary:")
print(f"  Characters in game: {len(characters)}")
print(f"  Character sprites available: {len(sprite_files)}")
print(f"  Missing sprites: {len(missing)}")
print(f"  Orphaned sprites: {len(orphaned)}")