#!/usr/bin/env python3
import re

# Read the current HTML file
with open('index.html', 'r') as f:
    content = f.read()

print("✨ Applying final polish for production...")

# 1. Add better loading state management
loading_improvements = '''
// Enhanced loading state management
const LoadingManager = {
    states: {
        INITIALIZING: 'initializing',
        LOADING_SPRITES: 'loading-sprites', 
        LOADING_AUDIO: 'loading-audio',
        READY: 'ready',
        ERROR: 'error'
    },
    currentState: 'initializing',
    
    setState(newState) {
        this.currentState = newState;
        this.updateUI();
    },
    
    updateUI() {
        const loader = safeGetElement('loadingContent');
        if (!loader) return;
        
        const messages = {
            'initializing': 'Preparing court...',
            'loading-sprites': 'Loading players...',
            'loading-audio': 'Tuning audio...',
            'ready': 'Ready to serve!',
            'error': 'Game error - please refresh'
        };
        
        const subtitle = loader.querySelector('.loading-subtitle');
        if (subtitle) {
            subtitle.textContent = messages[this.currentState] || 'Loading...';
        }
    }
};
'''

# 2. Add better mobile optimizations
mobile_optimizations = '''
// Enhanced mobile experience
const MobileEnhancer = {
    init() {
        // Better touch handling
        this.preventZoom();
        this.optimizeForMobile();
        this.addHapticFeedback();
    },
    
    preventZoom() {
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    },
    
    optimizeForMobile() {
        // Reduce animations on lower-end devices
        if (navigator.hardwareConcurrency <= 4) {
            document.body.classList.add('low-performance');
        }
    },
    
    addHapticFeedback() {
        if ('vibrate' in navigator) {
            window.mobileVibrate = (pattern) => navigator.vibrate(pattern);
        } else {
            window.mobileVibrate = () => {}; // No-op for non-supporting devices
        }
    }
};
'''

# 3. Add progressive enhancement for audio
audio_enhancements = '''
// Progressive audio enhancement
const AudioManager = {
    supported: false,
    context: null,
    
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.supported = true;
            console.log('✅ Audio context initialized');
        } catch (error) {
            console.warn('⚠️ Audio not supported or blocked:', error);
            this.supported = false;
        }
    },
    
    playEnhanced(frequency, duration, volume) {
        if (!this.supported || !this.context) {
            return; // Graceful fallback to silence
        }
        
        try {
            playTone(frequency, duration, volume);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
};
'''

# 4. Add better error recovery
error_recovery = '''
// Error recovery system
const ErrorRecovery = {
    retryCount: 0,
    maxRetries: 3,
    
    handleCriticalError(error, context) {
        console.error(`❌ Critical error in ${context}:`, error);
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Attempting recovery (${this.retryCount}/${this.maxRetries})...`);
            
            // Reset game state
            setTimeout(() => {
                try {
                    this.resetGameState();
                    this.retryInitialization();
                } catch (recoveryError) {
                    console.error('❌ Recovery failed:', recoveryError);
                    this.showErrorScreen();
                }
            }, 1000);
        } else {
            this.showErrorScreen();
        }
    },
    
    resetGameState() {
        // Clear any running timers
        for (let i = 1; i < 99999; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
        
        // Reset DOM cache
        if (window.domCache) {
            domCache.clear();
        }
    },
    
    retryInitialization() {
        // Attempt to reinitialize critical systems
        if (typeof initSprites === 'function') {
            initSprites();
        }
    },
    
    showErrorScreen() {
        const body = document.body;
        body.innerHTML = `
            <div style="
                position: fixed; inset: 0; 
                background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
                display: flex; flex-direction: column;
                justify-content: center; align-items: center;
                color: white; text-align: center; padding: 20px;
            ">
                <h1 style="font-size: 2em; margin-bottom: 20px;">🎾</h1>
                <h2 style="margin-bottom: 20px;">Game Error</h2>
                <p style="margin-bottom: 30px; opacity: 0.8;">
                    Something went wrong. Please refresh the page to continue playing.
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px; background: #ffd700; border: none;
                    border-radius: 25px; color: #1a1a2e; font-weight: bold;
                    font-size: 16px; cursor: pointer;
                ">Refresh Game</button>
            </div>
        `;
    }
};
'''

# 5. Add performance optimizations
performance_opts = '''
// Performance optimizations
const PerformanceOptimizer = {
    frameSkipping: false,
    lastAnimationTime: 0,
    
    init() {
        // Adaptive frame skipping for low-end devices
        this.monitorPerformance();
    },
    
    monitorPerformance() {
        let frameCount = 0;
        let lastCheck = performance.now();
        
        const checkPerformance = () => {
            frameCount++;
            const now = performance.now();
            
            if (now - lastCheck >= 1000) {
                const fps = frameCount * 1000 / (now - lastCheck);
                
                if (fps < 25) {
                    this.enableFrameSkipping();
                } else if (fps > 50 && this.frameSkipping) {
                    this.disableFrameSkipping();
                }
                
                frameCount = 0;
                lastCheck = now;
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        requestAnimationFrame(checkPerformance);
    },
    
    enableFrameSkipping() {
        if (!this.frameSkipping) {
            console.log('🚀 Enabling performance optimizations');
            this.frameSkipping = true;
            document.body.classList.add('performance-mode');
        }
    },
    
    disableFrameSkipping() {
        if (this.frameSkipping) {
            console.log('✨ Disabling performance optimizations');
            this.frameSkipping = false;
            document.body.classList.remove('performance-mode');
        }
    }
};
'''

# Apply all polish improvements
print("  1. Adding loading state management...")
content = content.replace('// Production Hardening Utilities', loading_improvements + '\n\n// Production Hardening Utilities')

print("  2. Adding mobile enhancements...")
content = content.replace('// Enhanced sprite loading', mobile_optimizations + '\n\n// Enhanced sprite loading')

print("  3. Adding progressive audio...")
content = content.replace('// Production Hardening Utilities', audio_enhancements + '\n\n// Production Hardening Utilities')

print("  4. Adding error recovery...")
content = content.replace('// Performance monitoring', error_recovery + '\n\n// Performance monitoring')

print("  5. Adding performance optimizations...")
content = content.replace('// Performance monitoring', performance_opts + '\n\n// Performance monitoring')

print("  6. Adding initialization improvements...")

# Improve the initialization sequence
init_improvements = '''
// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🎾 Initializing Championship Tennis...');
        
        LoadingManager.setState(LoadingManager.states.INITIALIZING);
        MobileEnhancer.init();
        AudioManager.init();
        PerformanceOptimizer.init();
        
        LoadingManager.setState(LoadingManager.states.READY);
        console.log('✅ Game initialized successfully');
        
    } catch (error) {
        ErrorRecovery.handleCriticalError(error, 'initialization');
    }
});
'''

# Add to the end of the script section
content = content.replace('</script>', init_improvements + '\n</script>')

print("  7. Adding CSS for performance modes...")

# Add performance CSS
performance_css = '''
/* Performance optimizations */
.performance-mode .particle-effect,
.performance-mode .ball-trail {
    display: none !important;
}

.performance-mode .court-animation,
.performance-mode .screen-shake {
    animation: none !important;
    transform: none !important;
}

.low-performance .complex-gradient {
    background: #1a1a2e !important;
}

.low-performance .text-shadow,
.low-performance .box-shadow {
    text-shadow: none !important;
    box-shadow: none !important;
}
'''

# Add to the style section
content = content.replace('</style>', performance_css + '\n</style>')

print("  8. Adding comprehensive error boundaries...")

# Wrap critical game functions with error boundaries
error_boundary_functions = [
    'startMatch',
    'handleSwipe', 
    'opponentServe',
    'updateScore',
    'updateMatchUI'
]

for func_name in error_boundary_functions:
    # Find and wrap the function
    pattern = f'(function {func_name}\\s*\\([^)]*\\)\\s*{{)'
    replacement = f'\\1\n    if (!validateCriticalState()) {{ console.error("❌ Invalid state for {func_name}"); return; }}\n    try {{'
    content = re.sub(pattern, replacement, content)
    
    # Close the try block before the function ends
    pattern2 = f'(function {func_name}\\s*\\([^)]*\\)\\s*{{[^{{}}]*(?:{{[^{{}}]*}}[^{{}}]*)*)(}})$'
    replacement2 = f'\\1\n    }} catch (error) {{ ErrorRecovery.handleCriticalError(error, "{func_name}"); }}\\2'
    content = re.sub(pattern2, replacement2, content, flags=re.MULTILINE)

print("✅ Final polish applied!")

# Write the polished version
with open('index.html', 'w') as f:
    f.write(content)

print("💎 Championship Tennis is now production-ready with enhanced polish!")
print("🎮 Features added:")
print("  - Comprehensive error recovery")
print("  - Mobile optimizations and haptic feedback")
print("  - Progressive audio enhancement")
print("  - Adaptive performance optimization")
print("  - Enhanced loading states")
print("  - Graceful degradation for low-end devices")

print("\n🚀 Ready for deployment!")