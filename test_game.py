#!/usr/bin/env python3
import re

# Read the HTML file
with open('index.html', 'r') as f:
    content = f.read()

print("🕵️ Analyzing Championship Tennis for potential issues...")

# Check for common JavaScript errors
issues = []

# 1. Check for undefined variables
undefined_vars = []
# Look for variables used but not declared
var_uses = re.findall(r'\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=\.\[()]', content)
var_declarations = re.findall(r'(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)', content)
function_declarations = re.findall(r'function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)', content)

# Common globals that are okay
known_globals = {'window', 'document', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 
                'clearInterval', 'Math', 'Date', 'Image', 'localStorage', 'navigator',
                'screen', 'performance', 'requestAnimationFrame', 'location', 'history',
                'XMLHttpRequest', 'fetch', 'URL', 'URLSearchParams', 'JSON', 'Promise',
                'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Error',
                'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent'}

# 2. Check for potential null reference errors
null_refs = re.findall(r'\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\(|\[|\s*=)', content)

# 3. Check for inconsistent timer usage
timers = re.findall(r'(setTimeout|setInterval)\s*\([^,)]+,\s*(\d+)', content)

# 4. Check for potential memory leaks (event listeners without removal)
event_listeners = re.findall(r'addEventListener\s*\(\s*[\'"]([^\'"]+)', content)
event_removals = re.findall(r'removeEventListener\s*\(\s*[\'"]([^\'"]+)', content)

# 5. Check for hardcoded values that might be problematic
hardcoded_checks = [
    ('Fixed delays', re.findall(r'setTimeout[^,]*,\s*(\d{3,})', content)),
    ('Magic numbers in calculations', re.findall(r'[*+\-/]\s*(\d{2,})', content)),
    ('Hardcoded URLs', re.findall(r'https?://[^\s\'"]+', content))
]

print("\n🔍 Potential Issues Found:")

# Check for common error patterns
error_patterns = [
    (r'getElementById\([^)]*\)\.[a-zA-Z]', 'Potential null reference: getElementById without null check'),
    (r'\.length\s*-\s*1\s*\](?!\s*[><=])', 'Array access without bounds check'),
    (r'parseInt\([^,)]+\)', 'parseInt without radix parameter'),
    (r'==\s*null', 'Use === for null comparison'),
    (r'!=\s*null', 'Use !== for null comparison'),
    (r'\.src\s*=\s*[\'"][^\'\"]*[\'"]', 'Direct image src assignment (check for loading errors)'),
    (r'Math\.random\(\)\s*\*\s*\d+(?!\s*[.,)])', 'Math.random() scaling without Math.floor'),
]

found_patterns = []
for pattern, description in error_patterns:
    matches = re.findall(pattern, content)
    if matches:
        found_patterns.append((description, len(matches)))

if found_patterns:
    for desc, count in found_patterns:
        print(f"  ⚠️ {desc} ({count} occurrences)")

# Check for specific game logic issues
print("\n🎮 Game-Specific Checks:")

# Check scoring logic
scoring_keywords = ['score', 'point', 'game', 'set', 'match', 'deuce', 'advantage']
for keyword in scoring_keywords:
    matches = re.findall(f'{keyword}[A-Za-z]*\s*[=+\-]', content, re.IGNORECASE)
    if matches:
        print(f"  📊 {keyword.title()} operations: {len(matches)}")

# Check physics calculations
physics_checks = ['velocity', 'position', 'bounce', 'gravity', 'friction']
for check in physics_checks:
    matches = re.findall(f'{check}[A-Za-z]*\s*[=+\-*]', content, re.IGNORECASE)
    if matches:
        print(f"  🏀 {check.title()} calculations: {len(matches)}")

# Check for sprite animation logic
sprite_checks = ['sprite', 'animation', 'frame']
for check in sprite_checks:
    matches = re.findall(f'{check}[A-Za-z]*\s*[=.]', content, re.IGNORECASE)
    if matches:
        print(f"  🎭 {check.title()} operations: {len(matches)}")

print("\n📈 Performance Considerations:")

# Check for performance issues
perf_issues = []
if 'setInterval' in content:
    intervals = len(re.findall(r'setInterval', content))
    print(f"  ⏱️ setInterval calls: {intervals} (check if all are cleared)")

if 'getBoundingClientRect' in content:
    rect_calls = len(re.findall(r'getBoundingClientRect', content))
    print(f"  📏 getBoundingClientRect calls: {rect_calls} (expensive in loops)")

if 'querySelector' in content:
    query_calls = len(re.findall(r'querySelector', content))
    print(f"  🔍 DOM queries: {query_calls} (cache frequently used elements)")

# Check for mobile optimizations
mobile_features = ['touch', 'pointer', 'orientation', 'viewport', 'devicePixelRatio']
mobile_found = []
for feature in mobile_features:
    if feature in content.lower():
        mobile_found.append(feature)

print(f"\n📱 Mobile Features Detected: {', '.join(mobile_found) if mobile_found else 'None'}")

# Check for error handling
error_handling = ['try', 'catch', 'finally', 'throw', 'Error']
error_found = []
for eh in error_handling:
    count = len(re.findall(f'\\b{eh}\\b', content))
    if count > 0:
        error_found.append(f"{eh}({count})")

print(f"🚨 Error Handling: {', '.join(error_found) if error_found else 'No explicit error handling found'}")

print("\n✅ Analysis complete! Check the items above for potential improvements.")