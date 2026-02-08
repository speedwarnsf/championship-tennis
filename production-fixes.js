// Championship Tennis - Production Hardening Fixes
// This file contains the fixes to be applied to index.html

// 1. Safe DOM element getter with null checking
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element not found: ${id}`);
        return null;
    }
    return element;
}

// 2. Safe random number generator for array indices
function safeRandomIndex(array) {
    if (!array || array.length === 0) return 0;
    return Math.floor(Math.random() * array.length);
}

// 3. Safe random number generator for ranges
function safeRandomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 4. Enhanced error handling wrapper
function withErrorHandling(fn, context = 'Unknown') {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error(`❌ Error in ${context}:`, error);
            // Optional: Send to analytics/error reporting
            return null;
        }
    };
}

// 5. Enhanced sprite loading with retries
function loadSpriteWithRetry(src, maxRetries = 3) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        function attemptLoad() {
            const img = new Image();
            
            img.onload = () => {
                console.log(`✅ Sprite loaded: ${src}`);
                resolve(img);
            };
            
            img.onerror = () => {
                attempts++;
                if (attempts < maxRetries) {
                    console.warn(`⚠️ Sprite load failed, retrying (${attempts}/${maxRetries}): ${src}`);
                    setTimeout(attemptLoad, 1000 * attempts); // Progressive delay
                } else {
                    console.error(`❌ Sprite load failed permanently: ${src}`);
                    reject(new Error(`Failed to load sprite: ${src}`));
                }
            };
            
            img.src = src;
        }
        
        attemptLoad();
    });
}

// 6. Performance optimized DOM cache
class DOMCache {
    constructor() {
        this.cache = new Map();
    }
    
    get(id) {
        if (!this.cache.has(id)) {
            const element = document.getElementById(id);
            if (element) {
                this.cache.set(id, element);
            } else {
                console.warn(`⚠️ Element not found for caching: ${id}`);
                return null;
            }
        }
        return this.cache.get(id);
    }
    
    clear() {
        this.cache.clear();
    }
}

// 7. Safe audio context handling
function safePlaySound(frequency, duration = 0.1, volume = 0.3) {
    try {
        if (typeof window.audioContext === 'undefined') return;
        if (!window.audioContext) return;
        
        playTone(frequency, duration, volume);
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
}

// 8. Enhanced game state validation
function validateGameState() {
    const required = ['M', 'G', 'SPRITES', 'selectedChar', 'opponentChar'];
    const missing = required.filter(key => typeof window[key] === 'undefined');
    
    if (missing.length > 0) {
        console.error('❌ Missing required game objects:', missing);
        return false;
    }
    
    // Validate match state if game is active
    if (window.M && window.M.active) {
        const requiredProps = ['playerScore', 'oppScore', 'playerGames', 'oppGames', 'playerSets', 'oppSets'];
        const missingProps = requiredProps.filter(prop => typeof window.M[prop] === 'undefined');
        
        if (missingProps.length > 0) {
            console.error('❌ Invalid match state:', missingProps);
            return false;
        }
    }
    
    return true;
}

// 9. Safe storage operations
function safeLocalStorageSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
        return false;
    }
}

function safeLocalStorageLoad(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('❌ Failed to load from localStorage:', error);
        return defaultValue;
    }
}

// 10. Frame rate monitoring for performance
class FrameRateMonitor {
    constructor() {
        this.frames = [];
        this.lastTime = performance.now();
    }
    
    update() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        
        this.frames.push(delta);
        if (this.frames.length > 60) {
            this.frames.shift();
        }
        
        // Warn if frame rate drops below 30 FPS
        const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
        const fps = 1000 / avgFrameTime;
        
        if (fps < 30 && this.frames.length > 30) {
            console.warn(`⚠️ Low frame rate detected: ${fps.toFixed(1)} FPS`);
        }
    }
}

// Export fixes for integration
window.ProductionFixes = {
    safeGetElement,
    safeRandomIndex,
    safeRandomRange,
    withErrorHandling,
    loadSpriteWithRetry,
    DOMCache,
    safePlaySound,
    validateGameState,
    safeLocalStorageSave,
    safeLocalStorageLoad,
    FrameRateMonitor
};