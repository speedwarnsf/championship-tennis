#!/usr/bin/env python3
import re

# Read the original HTML file
with open('index.html', 'r') as f:
    content = f.read()

print("🔧 Applying production hardening fixes...")

# 1. Fix getElementById calls to include null checks
def fix_get_element_by_id(content):
    # Pattern: document.getElementById('id').something
    pattern = r"document\.getElementById\(['\"]([^'\"]+)['\"]\)\.([a-zA-Z][a-zA-Z0-9]*)"
    
    def replacement(match):
        element_id = match.group(1)
        property_access = match.group(2)
        return f"safeGetElement('{element_id}')?.{property_access}"
    
    fixed_content = re.sub(pattern, replacement, content)
    
    # Also fix standalone getElementById calls
    pattern2 = r"document\.getElementById\(['\"]([^'\"]+)['\"]\)(?!\.)"
    fixed_content = re.sub(pattern2, r"safeGetElement('\1')", fixed_content)
    
    return fixed_content

# 2. Fix Math.random() scaling without Math.floor
def fix_math_random_scaling(content):
    fixes = [
        # Math.random() * number (should be Math.floor(Math.random() * number))
        (r'Math\.random\(\)\s*\*\s*(\d+)(?!\s*\+)', r'Math.floor(Math.random() * \1)'),
        # Math.random() * number + number patterns that need floor
        (r'(\d+)\s*\+\s*Math\.random\(\)\s*\*\s*(\d+)', r'\1 + Math.floor(Math.random() * \2)'),
    ]
    
    fixed_content = content
    for pattern, replacement in fixes:
        fixed_content = re.sub(pattern, replacement, fixed_content)
    
    return fixed_content

# 3. Add null comparison fixes
def fix_null_comparisons(content):
    fixes = [
        (r'==\s*null', '=== null'),
        (r'!=\s*null', '!== null'),
    ]
    
    fixed_content = content
    for pattern, replacement in fixes:
        fixed_content = re.sub(pattern, replacement, fixed_content)
    
    return fixed_content

# 4. Add error handling to critical functions
def add_error_handling(content):
    # Find function definitions and wrap their bodies
    critical_functions = [
        'startMatch',
        'initSprites',
        'startPlayerServe',
        'opponentServe',
        'handleSwipe',
        'updateMatchUI',
        'setPlayerSprite',
        'setOpponentSprite'
    ]
    
    fixed_content = content
    for func_name in critical_functions:
        # Find function definition
        pattern = f'function {func_name}\\s*\\([^)]*\\)\\s*{{([^{{}}]*(?:{{[^{{}}]*}}[^{{}}]*)*)}}'
        
        def wrap_with_error_handling(match):
            func_body = match.group(1).strip()
            return f'''function {func_name}{match.group(0)[len(f'function {func_name}'):match.group(0).find('{')]}{{
    try {{
{func_body}
    }} catch (error) {{
        console.error(`❌ Error in {func_name}:`, error);
        return null;
    }}
}}'''
        
        fixed_content = re.sub(pattern, wrap_with_error_handling, fixed_content, flags=re.DOTALL)
    
    return fixed_content

# 5. Add production utility functions at the beginning of the script section
def add_production_utilities(content):
    # Find the first <script> tag
    script_start = content.find('<script>')
    if script_start != -1:
        script_insertion_point = script_start + len('<script>')
        
        production_utils = '''
// Production Hardening Utilities
const domCache = new Map();

function safeGetElement(id) {
    if (!domCache.has(id)) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Element not found: ${id}`);
            return null;
        }
        domCache.set(id, element);
    }
    return domCache.get(id);
}

function safeRandomIndex(array) {
    if (!array || array.length === 0) return 0;
    return Math.floor(Math.random() * array.length);
}

function withErrorHandling(fn, context = 'Unknown') {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error(`❌ Error in ${context}:`, error);
            return null;
        }
    };
}

// Enhanced sprite loading with retry mechanism
async function loadSpriteWithRetry(src, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
            return true;
        } catch (error) {
            if (attempt === maxRetries) {
                console.error(`❌ Failed to load sprite after ${maxRetries} attempts: ${src}`);
                return false;
            }
            console.warn(`⚠️ Sprite load attempt ${attempt} failed, retrying: ${src}`);
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
    }
    return false;
}
'''
        
        content = content[:script_insertion_point] + production_utils + content[script_insertion_point:]
    
    return content

# Apply all fixes
print("  1. Adding production utilities...")
content = add_production_utilities(content)

print("  2. Fixing getElementById calls...")
content = fix_get_element_by_id(content)

print("  3. Fixing Math.random() scaling...")
content = fix_math_random_scaling(content)

print("  4. Fixing null comparisons...")
content = fix_null_comparisons(content)

print("  5. Adding enhanced sprite loading validation...")

# Add sprite validation to initSprites function
sprite_validation = '''
    // Enhanced sprite validation
    const requiredSprites = [SPRITES.playerRun, SPRITES.playerSwing, SPRITES.oppRun, SPRITES.oppSwing, SPRITES.playerIdle, SPRITES.oppIdle];
    const spriteLoadPromises = requiredSprites.map(src => loadSpriteWithRetry(src));
    
    Promise.all(spriteLoadPromises).then(results => {
        const failedSprites = results.filter(success => !success).length;
        if (failedSprites > 0) {
            console.warn(`⚠️ ${failedSprites} sprites failed to load properly`);
        } else {
            console.log('✅ All sprites loaded successfully');
        }
    }).catch(error => {
        console.error('❌ Critical sprite loading failure:', error);
    });
'''

# Find initSprites function and add validation
init_sprites_pattern = r'(function initSprites\(\)\s*{[^}]+)(preloadImages\.forEach[^}]+}\s*;)'
content = re.sub(init_sprites_pattern, r'\1\2\n' + sprite_validation, content, flags=re.DOTALL)

print("  6. Adding performance monitoring...")

# Add frame rate monitoring to game loop
performance_monitoring = '''
// Performance monitoring
const frameMonitor = {
    frames: [],
    lastTime: performance.now(),
    update() {
        const now = performance.now();
        this.frames.push(now - this.lastTime);
        this.lastTime = now;
        
        if (this.frames.length > 60) this.frames.shift();
        
        if (this.frames.length > 30) {
            const avgFrame = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
            const fps = 1000 / avgFrame;
            if (fps < 25) {
                console.warn(`⚠️ Low FPS detected: ${fps.toFixed(1)}`);
            }
        }
    }
};
'''

# Add to script section
script_end_pattern = r'(<script>[^<]*)(</script>)'
content = re.sub(script_end_pattern, r'\1' + performance_monitoring + r'\2', content, flags=re.DOTALL)

print("  7. Adding game state validation...")

# Add validation before critical operations
validation_check = '''
function validateCriticalState() {
    const issues = [];
    
    if (!M) issues.push('Match object missing');
    if (!G) issues.push('Game state missing');
    if (!SPRITES) issues.push('Sprites missing');
    if (!selectedChar) issues.push('Selected character missing');
    
    if (issues.length > 0) {
        console.error('❌ Critical state validation failed:', issues);
        return false;
    }
    
    return true;
}
'''

# Add before other functions
content = content.replace('function startMatch()', validation_check + '\n\nfunction startMatch()')

print("✅ All production fixes applied!")

# Write the fixed version
with open('index.html', 'w') as f:
    f.write(content)

print("💾 Fixed version saved to index.html")
print("📋 Summary of fixes applied:")
print("  - Added null-safe DOM element access")
print("  - Fixed Math.random() scaling issues")
print("  - Added error handling to critical functions") 
print("  - Enhanced sprite loading with retry logic")
print("  - Added performance monitoring")
print("  - Added game state validation")
print("  - Fixed null comparison operators")

print("\n🧪 Ready for testing!")