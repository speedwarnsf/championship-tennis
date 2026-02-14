
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



// AudioManager defined below with full implementation

// Error recovery system
const ErrorRecovery = {
    retryCount: 0,
    maxRetries: 3,

    handleCriticalError(error, context) {
        console.error(`Critical error in ${context}:`, error);

        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Attempting recovery (${this.retryCount}/${this.maxRetries})...`);

            setTimeout(() => {
                try {
                    this.resetGameState();
                    this.retryInitialization();
                } catch (recoveryError) {
                    console.error('ERROR: Recovery failed:', recoveryError);
                    this.showErrorScreen();
                }
            }, 1000);
        } else {
            this.showErrorScreen();
        }
    },

    resetGameState() {
        for (let i = 1; i < 99999; i++) {
            clearTimeout(i);
            clearInterval(i);
        }

        if (window.domCache) {
            domCache.clear();
        }
    },

    retryInitialization() {
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
                <h1 style="font-size: 2em; margin-bottom: 20px;">GAME ERROR</h1>
                <h2 style="margin-bottom: 20px;">Game Error</h2>
                <p style="margin-bottom: 30px; opacity: 0.8;">
                    Something went wrong. Please refresh the page to continue playing.
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px; background: #ffd700; border: none;
                    border-radius: 0; color: #1a1a2e; font-weight: bold;
                    font-size: 16px; cursor: pointer;
                ">Refresh Game</button>
            </div>
        `;
    }
};

// Enhanced performance optimization system
const PerformanceOptimizer = {
    frameSkipping: false,
    frameSkipCount: 0,
    consecutiveLowFPS: 0,

    _monitoring: false,

    init() {
        this.optimizeForDevice();
    },

    startMonitoring() {
        if (this._monitoring) return;
        this._monitoring = true;
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

                if (fps < 30) {
                    this.consecutiveLowFPS++;
                    if (this.consecutiveLowFPS >= 2) {
                        this.enableFrameSkipping();
                    }
                } else if (fps > 50) {
                    this.consecutiveLowFPS = 0;
                    if (fps > 55 && this.frameSkipping) {
                        this.disableFrameSkipping();
                    }
                }

                frameCount = 0;
                lastCheck = now;
            }

            requestAnimationFrame(checkPerformance);
        };

        requestAnimationFrame(checkPerformance);
    },

    optimizeForDevice() {
        // More aggressive optimization for lower-end devices
        if (navigator.hardwareConcurrency <= 4 || navigator.deviceMemory < 4) {
            document.body.classList.add('low-performance');
            this.enableFrameSkipping();
        }
    },

    shouldSkipFrame() {
        if (!this.frameSkipping) return false;
        this.frameSkipCount++;
        return this.frameSkipCount % 2 === 0;
    },

    enableFrameSkipping() {
        if (!this.frameSkipping) {
            console.log('⚡ Enabling performance optimizations - frame skipping active');
            this.frameSkipping = true;
            document.body.classList.add('performance-mode');
        }
    },

    disableFrameSkipping() {
        if (this.frameSkipping) {
            console.log('🔥 Disabling performance optimizations - full frame rate');
            this.frameSkipping = false;
            this.frameSkipCount = 0;
            document.body.classList.remove('performance-mode');
        }
    }
};


// Production Hardening Utilities
const domCache = new Map();

function safeGetElement(id) {
    if (!domCache.has(id)) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element not found: ${id}`);
            return null;
        }
        domCache.set(id, element);
    }
    return domCache.get(id);
}

let cachedCourt = null;
function getCourtElement() {
    if(!cachedCourt){
        cachedCourt = document.querySelector('.court');
    }
    return cachedCourt;
}

function isPerformanceMode(){
    return document.body.classList.contains('performance-mode') || document.body.classList.contains('low-performance');
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
            console.error(`Error in ${context}:`, error);
            return null;
        }
    };
}


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
                console.error(`Failed to load sprite after ${maxRetries} attempts: ${src}`);
                return false;
            }
            console.warn(`Sprite load attempt ${attempt} failed, retrying: ${src}`);
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
    }
    return false;
}

const G={coins:500,gems:20,level:1,xp:0,ntrp:2.5,skillPoints:0,stats:{power:10,speed:10,control:10,serve:10},equipment:{racket:null,shoes:null,special:null,serveGear:null},owned:[],difficulty:'rookie',matchType:'quick',trainingCompleted:[],dailyChallenge:null};

// Daily Challenge System
const DAILY_CHALLENGES = [
    {id:'ace_master',name:'Ace Master',desc:'Score 3 aces in a single match',target:3,type:'aces',reward:{coins:100,gems:2}},
    {id:'winner_streak',name:'Winner Machine',desc:'Hit 5 winners in a match',target:5,type:'winners',reward:{coins:80,gems:1}},
    {id:'rally_king',name:'Rally King',desc:'Win a 10+ shot rally',target:10,type:'longestRally',reward:{coins:120,gems:2}},
    {id:'perfect_serve',name:'Perfect Server',desc:'No double faults in a match',target:0,type:'doubleFaults',reward:{coins:60,gems:1}},
    {id:'quick_win',name:'Speed Demon',desc:'Win a match in under 3 minutes',target:180,type:'matchTime',reward:{coins:150,gems:3}},
    {id:'streak_master',name:'Streak Master',desc:'Get a 8+ point streak',target:8,type:'streak',reward:{coins:90,gems:2}},
    {id:'hold_serve',name:'Iron Serve',desc:'Win without losing a single service game',target:1,type:'noBreak',reward:{coins:120,gems:3}},
    {id:'comeback_kid',name:'Comeback Kid',desc:'Win after being down 0-3 in games',target:1,type:'comeback',reward:{coins:150,gems:3}},
    {id:'flawless',name:'Flawless Victory',desc:'Win a set 6-0',target:1,type:'bagel',reward:{coins:200,gems:4}},
    {id:'ace_barrage',name:'Ace Barrage',desc:'Score 5 aces in a single match',target:5,type:'aces',reward:{coins:180,gems:3}}
];

// ========== ACHIEVEMENT SYSTEM ==========
const ACHIEVEMENTS = [
    {id:'first_ace',name:'First Ace',desc:'Score your first ace',icon:'[+]',check:s=>s.totalAces>=1},
    {id:'ace_10',name:'Ace Machine',desc:'Score 10 total aces',icon:'[!]',check:s=>s.totalAces>=10},
    {id:'ace_50',name:'Ace Legend',desc:'Score 50 total aces',icon:'[*]',check:s=>s.totalAces>=50},
    {id:'first_win',name:'First Victory',desc:'Win your first match',icon:'[1]',check:s=>s.matchesWon>=1},
    {id:'win_10',name:'10 Game Win Streak',desc:'Win 10 matches total',icon:'[X]',check:s=>s.matchesWon>=10},
    {id:'win_50',name:'Half Century',desc:'Win 50 matches',icon:'[K]',check:s=>s.matchesWon>=50},
    {id:'perfect_set',name:'Perfect Set',desc:'Win a set 6-0',icon:'[D]',check:s=>s.perfectSets>=1},
    {id:'streak_5',name:'On Fire',desc:'Get a 5-point streak',icon:'[!]',check:s=>s.bestStreak>=5},
    {id:'streak_10',name:'Unstoppable',desc:'Get a 10-point streak',icon:'[!!]',check:s=>s.bestStreak>=10},
    {id:'rally_15',name:'Rally Master',desc:'Win a 15+ shot rally',icon:'[R]',check:s=>s.longestRally>=15},
    {id:'rally_25',name:'Marathon Rally',desc:'Win a 25+ shot rally',icon:'[M]',check:s=>s.longestRally>=25},
    {id:'rich',name:'High Roller',desc:'Accumulate 1000 coins total',icon:'[C]',check:s=>s.totalCoins>=1000},
    {id:'wealthy',name:'Tennis Tycoon',desc:'Accumulate 5000 coins total',icon:'[$]',check:s=>s.totalCoins>=5000},
    {id:'winner_20',name:'Winner Factory',desc:'Hit 20 winners in career',icon:'[W]',check:s=>s.totalWinners>=20},
    {id:'matches_25',name:'Veteran',desc:'Play 25 matches',icon:'[V]',check:s=>s.matchesPlayed>=25},
    {id:'matches_100',name:'Centurion',desc:'Play 100 matches',icon:'[100]',check:s=>s.matchesPlayed>=100},
    {id:'no_double_fault',name:'Clean Server',desc:'Win a match with zero double faults',icon:'[+]',check:s=>s.cleanServeWins>=1},
    {id:'streak_daily_3',name:'Dedicated',desc:'Complete daily challenges 3 days in a row',icon:'[3]',check:s=>s.bestDailyStreak>=3},
    {id:'streak_daily_7',name:'Weekly Warrior',desc:'Complete daily challenges 7 days in a row',icon:'[7]',check:s=>s.bestDailyStreak>=7},
    {id:'streak_daily_14',name:'Fortnight Force',desc:'14-day daily challenge streak',icon:'[14]',check:s=>s.bestDailyStreak>=14},
    {id:'streak_daily_30',name:'Monthly Master',desc:'30-day daily challenge streak',icon:'[30]',check:s=>s.bestDailyStreak>=30},
    {id:'legend_win',name:'Legend Slayer',desc:'Win a match on Legend difficulty',icon:'[L]',check:s=>s.legendWins>=1},
    {id:'legend_win_5',name:'Legend Master',desc:'Win 5 matches on Legend',icon:'[L5]',check:s=>s.legendWins>=5},
    {id:'rally_50',name:'Endurance King',desc:'50+ shot rally in a match',icon:'[50]',check:s=>s.longestRally>=50},
    {id:'bagel_3',name:'Bagel Baker',desc:'Win 3 sets 6-0',icon:'[B]',check:s=>s.perfectSets>=3},
    {id:'win_no_game_lost',name:'Flawless',desc:'Win without losing a single game',icon:'[F]',check:s=>s.flawlessWins>=1},
    {id:'daily_10',name:'Challenge Hunter',desc:'Complete 10 daily challenges',icon:'[+]',check:s=>s.dailyChallengesCompleted>=10},
    {id:'daily_50',name:'Challenge Legend',desc:'Complete 50 daily challenges',icon:'[T]',check:s=>s.dailyChallengesCompleted>=50},
];

function initAchievements() {
    if(!G.achievements) G.achievements = {};
}

function checkAchievements() {
    if(!G.careerStats) return;
    if(!G.achievements) G.achievements = {};

    const stats = G.careerStats;
    let newUnlocks = [];

    ACHIEVEMENTS.forEach(a => {
        if(!G.achievements[a.id] && a.check(stats)) {
            G.achievements[a.id] = { unlockedAt: new Date().toISOString() };
            newUnlocks.push(a);
        }
    });

    // Show popups for new achievements
    newUnlocks.forEach((a, i) => {
        setTimeout(() => showAchievementPopup(a), i * 2500);
    });

    if(newUnlocks.length > 0) save();
}

function showAchievementPopup(achievement) {
    const popup = safeGetElement('achievementPopup');
    if(!popup) return;
    safeGetElement('achievementPopupIcon').textContent = achievement.icon;
    safeGetElement('achievementPopupTitle').textContent = achievement.name;
    safeGetElement('achievementPopupDesc').textContent = achievement.desc;
    popup.classList.add('show');
    sounds.winner?.();
    setTimeout(() => popup.classList.remove('show'), 2200);
}

function showTrophyCase() {
    safeGetElement('mainMenu')?.classList.remove('active');
    safeGetElement('trophyScreen')?.classList.add('active');
    renderTrophyCase();
}

function closeTrophyCase() {
    safeGetElement('trophyScreen')?.classList.remove('active');
    safeGetElement('mainMenu')?.classList.add('active');
}

function renderTrophyCase() {
    const grid = safeGetElement('trophyGrid');
    if(!grid) return;
    if(!G.achievements) G.achievements = {};

    const unlocked = ACHIEVEMENTS.filter(a => G.achievements[a.id]);
    const locked = ACHIEVEMENTS.filter(a => !G.achievements[a.id]);
    const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

    grid.innerHTML = `
        <div style="text-align:center;margin-bottom:10px">
            <div style="color:#ffd700;font-family:'Bebas Neue',sans-serif;font-size:28px">${unlocked.length} / ${ACHIEVEMENTS.length}</div>
            <div style="color:rgba(255,215,0,0.5);font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Achievements Unlocked</div>
            <div style="height:6px;background:rgba(0,0,0,0.3);border-radius:0;overflow:hidden;margin:0 20px">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ffd700,#ff9800);transition:width 0.5s"></div>
            </div>
        </div>
    `;

    // Show unlocked first, then locked
    [...unlocked, ...locked].forEach(a => {
        const isUnlocked = !!G.achievements[a.id];
        const date = isUnlocked ? new Date(G.achievements[a.id].unlockedAt).toLocaleDateString() : '';
        const card = document.createElement('div');
        card.className = `trophy-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        // Get progress for locked achievements
        let progressHTML = '';
        if(!isUnlocked && G.careerStats) {
            const s = G.careerStats;
            const progressMap = {
                'first_ace': {cur: s.totalAces||0, max: 1},
                'ace_10': {cur: s.totalAces||0, max: 10},
                'ace_50': {cur: s.totalAces||0, max: 50},
                'first_win': {cur: s.matchesWon||0, max: 1},
                'win_10': {cur: s.matchesWon||0, max: 10},
                'win_50': {cur: s.matchesWon||0, max: 50},
                'matches_25': {cur: s.matchesPlayed||0, max: 25},
                'matches_100': {cur: s.matchesPlayed||0, max: 100},
                'streak_5': {cur: s.bestStreak||0, max: 5},
                'streak_10': {cur: s.bestStreak||0, max: 10},
                'rally_15': {cur: s.longestRally||0, max: 15},
                'rally_25': {cur: s.longestRally||0, max: 25},
                'rally_50': {cur: s.longestRally||0, max: 50},
                'rich': {cur: s.totalCoins||0, max: 1000},
                'wealthy': {cur: s.totalCoins||0, max: 5000},
                'winner_20': {cur: s.totalWinners||0, max: 20},
                'streak_daily_3': {cur: s.bestDailyStreak||0, max: 3},
                'streak_daily_7': {cur: s.bestDailyStreak||0, max: 7},
                'streak_daily_14': {cur: s.bestDailyStreak||0, max: 14},
                'streak_daily_30': {cur: s.bestDailyStreak||0, max: 30},
                'legend_win': {cur: s.legendWins||0, max: 1},
                'legend_win_5': {cur: s.legendWins||0, max: 5},
                'bagel_3': {cur: s.perfectSets||0, max: 3},
                'daily_10': {cur: s.dailyChallengesCompleted||0, max: 10},
                'daily_50': {cur: s.dailyChallengesCompleted||0, max: 50},
            };
            const p = progressMap[a.id];
            if(p) {
                const pctDone = Math.min(100, Math.round((p.cur/p.max)*100));
                progressHTML = `<div class="trophy-progress">${p.cur}/${p.max} (${pctDone}%)</div>`;
            }
        }

        card.innerHTML = `
            <div class="trophy-icon" style="${isUnlocked ? 'filter:drop-shadow(0 0 8px rgba(255,215,0,0.6))' : ''}">${isUnlocked ? a.icon : 'LOCKED'}</div>
            <div class="trophy-info">
                <div class="trophy-name">${a.name}</div>
                <div class="trophy-desc">${a.desc}</div>
                ${isUnlocked ? `<div class="trophy-date">Unlocked ${date}</div>` : progressHTML}
            </div>
        `;
        grid.appendChild(card);
    });
}

function initDailyChallenge() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Initialize streak data
    if(!G.dailyStreak) G.dailyStreak = { count: 0, lastCompleted: null, history: [] };
    if(!G.careerStats) G.careerStats = {};
    if(!G.careerStats.bestDailyStreak) G.careerStats.bestDailyStreak = 0;
    if(!G.careerStats.dailyChallengesCompleted) G.careerStats.dailyChallengesCompleted = 0;

    // Check streak continuity
    if(G.dailyStreak.lastCompleted && G.dailyStreak.lastCompleted !== today && G.dailyStreak.lastCompleted !== yesterday) {
        G.dailyStreak.count = 0; // Streak broken
        G.dailyStreak.history = [];
    }

    // Check if challenge is from today
    if(!G.dailyChallenge || G.dailyChallenge.date !== today) {
        // Use date seed for consistent daily challenge
        const dateNum = new Date().getFullYear() * 10000 + (new Date().getMonth()+1) * 100 + new Date().getDate();
        const idx = dateNum % DAILY_CHALLENGES.length;
        const challenge = DAILY_CHALLENGES[idx];
        G.dailyChallenge = {
            ...challenge,
            date: today,
            progress: 0,
            completed: false
        };
    }

    updateChallengeDisplay();
    updateStreakDisplay();
}

function updateStreakDisplay() {
    const streak = G.dailyStreak || { count: 0, history: [] };
    const today = new Date().toDateString();

    { const _el = safeGetElement('streakCount'); if(_el) _el.textContent = streak.count; }

    // Build 7-day streak visualization
    const daysEl = safeGetElement('streakDays');
    if(!daysEl) return;
    daysEl.innerHTML = '';
    const dayNames = ['S','M','T','W','T','F','S'];
    for(let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toDateString();
        const isToday = dateStr === today;
        const isCompleted = (streak.history || []).includes(dateStr);
        const dayEl = document.createElement('div');
        dayEl.className = `streak-day${isCompleted ? ' completed' : ''}${isToday ? ' today' : ''}`;
        dayEl.textContent = dayNames[d.getDay()];
        daysEl.appendChild(dayEl);
    }
}

function updateChallengeDisplay() {
    const challenge = G.dailyChallenge;
    if(!challenge) return;

    { const _el = safeGetElement('challengeTitle'); if(_el) _el.textContent = `Daily Challenge: ${challenge.name}`; }
    { const _el = safeGetElement('challengeDesc'); if(_el) _el.textContent = challenge.desc; }

    const progress = Math.min(100, (challenge.progress / challenge.target) * 100);
    { const _el = safeGetElement('challengeFill'); if(_el) _el.style.width = progress + '%'; }

    const reward = `+${challenge.reward.coins} coins +${challenge.reward.gems} gems`;
    { const _el = safeGetElement('challengeReward'); if(_el) _el.textContent = challenge.completed ? 'COMPLETED!' : reward; }

    // Change banner color if completed
    const banner = safeGetElement('dailyChallenge');
    if(challenge.completed) {
        banner.style.background = 'linear-gradient(135deg,#4caf50,#45a049)';
    }
}

function checkChallengeProgress(type, value) {
    const challenge = G.dailyChallenge;
    if(!challenge || challenge.completed || challenge.type !== type) return;

    if(type === 'doubleFaults' || type === 'matchTime') {
        // For inverted challenges (less is better)
        if(value <= challenge.target) {
            challenge.progress = challenge.target;
        }
    } else {
        // For normal challenges (more is better)
        challenge.progress = Math.max(challenge.progress, value);
    }

    // Check if completed
    if(challenge.progress >= challenge.target && !challenge.completed) {
        challenge.completed = true;
        
        // Streak bonus: extra coins for longer streaks
        const streakBonus = Math.floor((G.dailyStreak?.count || 0) * 10);
        const totalCoins = challenge.reward.coins + streakBonus;
        
        G.coins += totalCoins;
        G.gems += challenge.reward.gems;

        // Update streak
        if(!G.dailyStreak) G.dailyStreak = { count: 0, lastCompleted: null, history: [] };
        const today = new Date().toDateString();
        if(G.dailyStreak.lastCompleted !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if(G.dailyStreak.lastCompleted === yesterday) {
                G.dailyStreak.count++;
            } else {
                G.dailyStreak.count = 1;
            }
            G.dailyStreak.lastCompleted = today;
            if(!G.dailyStreak.history) G.dailyStreak.history = [];
            G.dailyStreak.history.push(today);
            // Keep only last 30 days
            if(G.dailyStreak.history.length > 30) G.dailyStreak.history = G.dailyStreak.history.slice(-30);
        }

        // Update career stats for streak achievements
        if(!G.careerStats.bestDailyStreak) G.careerStats.bestDailyStreak = 0;
        if(!G.careerStats.dailyChallengesCompleted) G.careerStats.dailyChallengesCompleted = 0;
        if(G.dailyStreak.count > G.careerStats.bestDailyStreak) G.careerStats.bestDailyStreak = G.dailyStreak.count;
        G.careerStats.dailyChallengesCompleted++;

        const streakMsg = streakBonus > 0 ? ` (+${streakBonus} streak bonus!)` : '';
        toast(`Daily Challenge Complete! +${totalCoins} coins +${challenge.reward.gems} gems${streakMsg}`);
        if(G.dailyStreak.count >= 3) toast(`${G.dailyStreak.count}-Day Streak!`);
        sounds.winner();
        
        updateStreakDisplay();
        checkAchievements();
    }

    updateChallengeDisplay();
}

// Enhanced shop with serve equipment
const SHOP={
    rackets:[
        {id:'r1',name:'Starter Racket',desc:'Basic frame for beginners',stats:{power:5,control:5},price:100,currency:'coins'},
        {id:'r2',name:'Power Driver',desc:'Heavy head for devastating shots',stats:{power:20,control:5},price:500,currency:'coins'},
        {id:'r3',name:'Precision Pro',desc:'Perfect balance for control',stats:{power:10,control:25,speed:5},price:750,currency:'coins'},
        {id:'r4',name:'Champions Blade',desc:'Used by touring pros',stats:{power:25,control:25,speed:10},price:100,currency:'gems'},
        {id:'r5',name:'Graphite Pro',desc:'Lightweight power frame',stats:{power:15,speed:8,control:15},price:1200,currency:'coins'},
        {id:'r6',name:'Legend Series',desc:'Tournament champion gear',stats:{power:30,speed:5,control:30},price:200,currency:'gems'}
    ],
    shoes:[
        {id:'s1',name:'Court Runners',desc:'Standard court shoes',stats:{speed:10,control:5},price:150,currency:'coins'},
        {id:'s2',name:'Lightning Sprints',desc:'Ultra-light for speed',stats:{speed:30,control:10},price:600,currency:'coins'},
        {id:'s3',name:'Pro Tour Elite',desc:'Professional grade comfort',stats:{power:5,speed:20,control:15},price:1000,currency:'coins'},
        {id:'s4',name:'Rocket Boosters',desc:'Experimental tech shoes',stats:{power:10,speed:40,control:20},price:75,currency:'gems'},
        {id:'s5',name:'Clay Masters',desc:'Grip on any surface',stats:{speed:25,control:20},price:1500,currency:'coins'},
        {id:'s6',name:'Grand Slam Edition',desc:'Worn by champions',stats:{power:8,speed:35,control:25},price:120,currency:'gems'}
    ],
    serve:[
        {id:'sv1',name:'Serve Basics',desc:'Learn proper toss technique',stats:{serve:10,skillPoints:50},price:200,currency:'coins',repeatable:true},
        {id:'sv2',name:'Power Serve Training',desc:'Add MPH to your first serve',stats:{serve:15,power:5},price:400,currency:'coins'},
        {id:'sv3',name:'Kick Serve Clinic',desc:'Master the topspin serve',stats:{serve:20,control:10},price:600,currency:'coins'},
        {id:'sv4',name:'Ace Machine',desc:'Premium serve accuracy boost',stats:{serve:30,control:15},price:80,currency:'gems'},
        {id:'sv5',name:'Serve & Volley Pack',desc:'Complete approach game',stats:{serve:25,speed:15,power:10},price:1000,currency:'coins'},
        {id:'sv6',name:'Pro Serve Masterclass',desc:'Tour-level serving',stats:{serve:40,power:15,control:20},price:150,currency:'gems'}
    ],
    special:[
        {id:'x1',name:'Lucky Charm',desc:'2x coin rewards',stats:{bonus:'2x Coins'},price:150,currency:'gems'},
        {id:'x2',name:'Power Band',desc:'Massive power boost',stats:{power:40},price:50,currency:'gems'},
        {id:'x3',name:'Focus Lens',desc:'Larger hit window',stats:{control:50},price:200,currency:'gems'},
        {id:'x4',name:'Energy Drink',desc:'Faster court coverage',stats:{speed:25},price:30,currency:'gems'},
        {id:'x5',name:'Sweatband Pro',desc:'Balanced improvement',stats:{power:10,speed:10,control:10,serve:10},price:80,currency:'gems'},
        {id:'x6',name:'Tournament Trophy',desc:'Prestige item - all stats',stats:{power:20,speed:20,control:20,serve:20},price:300,currency:'gems'},
        {id:'x7',name:'Gem Magnet',desc:'Gems last 50% longer',stats:{bonus:'Gem Duration+'},price:100,currency:'gems'},
        {id:'x8',name:'Streak Master',desc:'Streaks give 2x bonus',stats:{bonus:'2x Streak'},price:120,currency:'gems'}
    ],
    training:[
        {id:'t1',name:'Private Coaching',desc:'1-on-1 with a pro coach',stats:{skillPoints:100,power:3,control:3},price:250,currency:'coins',repeatable:true},
        {id:'t2',name:'Group Clinic',desc:'Learn with other players',stats:{skillPoints:50,power:2,speed:1},price:100,currency:'coins',repeatable:true},
        {id:'t3',name:'Ball Machine',desc:'Perfect your groundstrokes',stats:{skillPoints:75,control:4,speed:1},price:150,currency:'coins',repeatable:true},
        {id:'t4',name:'Hit with a Friend',desc:'Casual practice session',stats:{skillPoints:30,power:1,speed:1,control:1},price:50,currency:'coins',repeatable:true},
        {id:'t5',name:'Flex League',desc:'Competitive match play',stats:{skillPoints:200,power:5,speed:3,control:5},price:500,currency:'coins',repeatable:true},
        {id:'t6',name:'Elite Camp',desc:'Intensive weekend program',stats:{skillPoints:500,power:10,speed:10,control:10,serve:5},price:150,currency:'gems',repeatable:true},
        {id:'t7',name:'Video Analysis',desc:'Study your technique',stats:{skillPoints:150,control:8,power:4},price:350,currency:'coins',repeatable:true},
        {id:'t8',name:'Fitness Bootcamp',desc:'Build court endurance',stats:{skillPoints:120,speed:7,power:5},price:300,currency:'coins',repeatable:true}
    ]
};

// Difficulty settings with serve parameters
const DIFF={
    rookie:{speed:1.2,oppSpeed:0.08,hitWindow:0.38,oppAcc:0.6,mult:1,time:120,serveFaultChance:0.15,oppServeSpeed:0.85},
    pro:{speed:1.55,oppSpeed:0.12,hitWindow:0.28,oppAcc:0.78,mult:2,time:150,serveFaultChance:0.25,oppServeSpeed:1.0},
    legend:{speed:1.9,oppSpeed:0.17,hitWindow:0.18,oppAcc:0.9,mult:3,time:180,serveFaultChance:0.35,oppServeSpeed:1.2}
};

// Match state with proper tennis rules
let M={
    active:false,
    // Scoring
    pPoints:0,oPoints:0,  // Points in current game (0,1,2,3 = 0,15,30,40)
    pGames:0,oGames:0,    // Games in current set
    pSets:0,oSets:0,      // Sets (optional for longer matches)
    time:120,
    isTiebreak:false,     // Special scoring in tiebreak
    tiebreakServer:'player', // Who serves first in tiebreak
    // Serve state
    isServing:true,       // Is player serving this game?
    serveNum:1,           // 1 = first serve, 2 = second serve
    serveSide:'deuce',    // 'deuce' (right) or 'ad' (left)
    isPlayerServe:false,  // True when player needs to serve
    servingPlayer:'opp',  // 'player' or 'opp' - who is serving this game
    servePhase:'none',    // 'none', 'ready', 'toss', 'swing', 'flight'
    servePower:0,
    serveAimX:50,
    serveAimY:25,
    serveStartY:null,
    lastServeSpeed:0,     // MPH for display
    // Ball state
    rally:0,
    ballActive:false,
    ballPos:{x:50,y:10},
    ballVel:{x:0,y:0,z:0},
    ballH:100,
    ballBounces:0,
    ballSpin:0,           // Spin effect
    canHit:false,
    combo:0,
    streak:0,             // Consecutive points won
    // Positions
    oppPos:50,
    playerPos:50,
    // Gems
    gemActive:false,
    gemPos:{x:50,y:70},
    gemTimer:0,
    gemMultiplier:1,
    // Stats
    aces:0,
    doubleFaults:0,
    winners:0,
    longestRally:0,
    totalRallies:0,
    pointsPlayed:0,
    bestStreak:0,
    lostServiceGame:false,
    wasDown03:false,
    // Settings
    settings:null,
    // Net rush
    playerY:95,           // Player Y position (95=baseline, 58=net)
    atNet:false,
    netRushTimer:0,
    oppAtNet:false,
    oppY:8
};

let audio,sounds={};

const AudioManager = {
    ctx: null,
    muted: false,
    masterGain: null,
    crowdNode: null,
    crowdGain: null,
    _crowdTarget: 0,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        audio = this.ctx;
        this._initCrowdAmbience();
    },

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.05);
        }
        const btn = document.getElementById('muteBtn');
        if (btn) btn.innerHTML = this.muted ? AudioManager._iconMuted : AudioManager._iconUnmuted;
    },

    tone(f, d, v, type) {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type || 'sine';
        o.frequency.value = f;
        o.connect(g);
        g.connect(this.masterGain);
        g.gain.setValueAtTime(v, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + d);
        o.start();
        o.stop(this.ctx.currentTime + d);
    },

    noise(d, v) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * d;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const g = this.ctx.createGain();
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 400;
        src.connect(lp);
        lp.connect(g);
        g.connect(this.masterGain);
        g.gain.setValueAtTime(v, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + d);
        src.start();
        src.stop(this.ctx.currentTime + d);
    },

    _initCrowdAmbience() {
        // Continuous low crowd white noise
        const bufLen = 2 * this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
        this.crowdNode = this.ctx.createBufferSource();
        this.crowdNode.buffer = buf;
        this.crowdNode.loop = true;
        this.crowdGain = this.ctx.createGain();
        this.crowdGain.gain.value = 0.02;
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 300;
        this.crowdNode.connect(lp);
        lp.connect(this.crowdGain);
        this.crowdGain.connect(this.masterGain);
        this.crowdNode.start();
    },

    setCrowdLevel(rallyLength) {
        if (!this.crowdGain || !this.ctx) return;
        // Base 0.02, ramps up with rally length
        const target = rallyLength < 3 ? 0.02 : Math.min(0.02 + (rallyLength - 2) * 0.015, 0.18);
        this.crowdGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
    },

    // SVG icons for mute button
    _iconUnmuted: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    _iconMuted: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
};

function initAudio(){
    AudioManager.init();

    // Ball hit - short percussive, pitch varies by power context
    sounds.hit=(power)=>{
        const p = power || 0.5;
        const baseFreq = 100 + p * 200;
        AudioManager.tone(baseFreq, 0.05, 0.3, 'triangle');
        AudioManager.tone(baseFreq * 3, 0.02, 0.15, 'square');
    };

    sounds.powerHit=()=>{
        AudioManager.tone(60, 0.07, 0.35, 'triangle');
        AudioManager.tone(320, 0.03, 0.2, 'square');
        AudioManager.noise(0.04, 0.12);
    };

    sounds.bounce=()=>AudioManager.tone(120,0.03,0.35);
    sounds.powerBounce=()=>{
        AudioManager.tone(90,0.05,0.4);
        setTimeout(()=>AudioManager.tone(180,0.03,0.3),20);
    };
    sounds.softBounce=()=>AudioManager.tone(140,0.025,0.25);

    sounds.crowdCheer=()=>{
        for(let i=0;i<5;i++){
            setTimeout(()=>AudioManager.tone(800+Math.floor(Math.random()*400),0.1,0.1),i*50);
        }
    };
    sounds.crowdOoh=()=>{
        AudioManager.tone(200,0.2,0.08);
        setTimeout(()=>AudioManager.tone(180,0.15,0.06),100);
    };

    // Point won - ascending two-note
    sounds.pointWon=()=>{
        AudioManager.tone(523, 0.12, 0.45);
        setTimeout(()=>AudioManager.tone(659, 0.15, 0.4), 100);
    };

    sounds.pointLost=()=>{
        AudioManager.tone(220,0.08,0.4);
        setTimeout(()=>AudioManager.tone(160,0.06,0.3),60);
    };

    // Rally tension - visuals + crowd ambience ramp
    sounds.rallyTension=(rallyLength)=>{
        const vignette = safeGetElement('rallyVignette');
        const court = safeGetElement('gameCourt');

        // Set crowd ambience level
        AudioManager.setCrowdLevel(rallyLength);

        if(rallyLength < 3) {
            if(vignette) { vignette.classList.remove('active'); vignette.style.opacity = '0'; }
            if(court) court.style.transform = '';
            return;
        }

        if(vignette) {
            vignette.classList.add('active');
            const vignetteIntensity = Math.min((rallyLength - 3) * 0.12, 0.8);
            vignette.style.opacity = vignetteIntensity;
        }

        if(court && rallyLength >= 5){
            const zoom = 1 + Math.min((rallyLength - 5) * 0.003, 0.025);
            court.style.transition = 'transform 0.8s ease';
            court.style.transform = `scale(${zoom})`;
        }

        if(rallyLength >= 5){
            if(court){
                const shakeClass = rallyLength >= 10 ? 'shake' : 'micro-shake';
                court.classList.remove('micro-shake', 'shake');
                void court.offsetWidth;
                court.classList.add(shakeClass);
                setTimeout(() => court.classList.remove(shakeClass), rallyLength >= 10 ? 150 : 100);
            }
        }

        const volume = Math.min(0.15 + (rallyLength - 3) * 0.03, 0.4);
        const intensity = Math.min(rallyLength - 2, 8);
        for(let i = 0; i < intensity; i++){
            setTimeout(() => {
                AudioManager.tone(400 + Math.floor(Math.random() * 600), 0.05 + Math.random() * 0.05, volume);
            }, i * 30 + Math.floor(Math.random() * 50));
        }

        if(rallyLength >= 8) setTimeout(() => sounds.crowdOoh(), 200);
        if(rallyLength >= 12) setTimeout(() => sounds.crowdCheer(), 300);
    };

    sounds.point=()=>{
        AudioManager.tone(440,0.1,0.35);
        setTimeout(()=>AudioManager.tone(660,0.1,0.35),80);
        setTimeout(()=>AudioManager.tone(880,0.15,0.35),160);
        setTimeout(()=>sounds.crowdCheer(),200);
    };

    sounds.miss=()=>{
        AudioManager.tone(80,0.2,0.2);
        setTimeout(()=>sounds.crowdOoh(),100);
    };

    sounds.coin=()=>{AudioManager.tone(1200,0.05,0.25);setTimeout(()=>AudioManager.tone(1600,0.05,0.25),40)};
    sounds.gem=()=>{AudioManager.tone(1800,0.08,0.3);setTimeout(()=>AudioManager.tone(2200,0.08,0.3),50)};

    // Serve - rising tone during toss, sharp crack on release
    sounds.serve=()=>{
        // Rising tone (toss phase)
        if(AudioManager.ctx){
            const o=AudioManager.ctx.createOscillator();
            const g=AudioManager.ctx.createGain();
            o.type='sine';
            o.frequency.setValueAtTime(150,AudioManager.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(600,AudioManager.ctx.currentTime+0.12);
            o.connect(g);g.connect(AudioManager.masterGain);
            g.gain.setValueAtTime(0.3,AudioManager.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01,AudioManager.ctx.currentTime+0.15);
            o.start();o.stop(AudioManager.ctx.currentTime+0.15);
        }
        // Sharp crack on release
        setTimeout(()=>{
            AudioManager.noise(0.04, 0.35);
            AudioManager.tone(500,0.03,0.4,'square');
        },80);
    };

    sounds.fault=()=>{AudioManager.tone(150,0.15,0.3);setTimeout(()=>AudioManager.tone(100,0.2,0.25),100)};

    sounds.ace=()=>{
        AudioManager.tone(600,0.1,0.4);
        setTimeout(()=>AudioManager.tone(900,0.1,0.4),80);
        setTimeout(()=>AudioManager.tone(1200,0.15,0.4),160);
        setTimeout(()=>sounds.crowdCheer(),250);
    };

    // Net hit - dull thud
    sounds.let=()=>{
        AudioManager.noise(0.08, 0.25);
        AudioManager.tone(80, 0.12, 0.3, 'sine');
    };

    sounds.changeover=()=>{AudioManager.tone(400,0.15,0.25);setTimeout(()=>AudioManager.tone(500,0.15,0.25),100);setTimeout(()=>AudioManager.tone(600,0.2,0.25),200)};

    sounds.winner=()=>{
        AudioManager.tone(800,0.1,0.35);
        setTimeout(()=>AudioManager.tone(1000,0.1,0.35),80);
        setTimeout(()=>AudioManager.tone(1200,0.15,0.35),160);
        setTimeout(()=>sounds.crowdCheer(),200);
    };

    sounds.victory=()=>{
        AudioManager.tone(523,0.15,0.4);
        setTimeout(()=>AudioManager.tone(659,0.15,0.4),150);
        setTimeout(()=>AudioManager.tone(784,0.15,0.4),300);
        setTimeout(()=>AudioManager.tone(1047,0.3,0.5),450);
        setTimeout(()=>sounds.crowdCheer(),600);
    };

    sounds.defeat=()=>{
        AudioManager.tone(220,0.2,0.3);
        setTimeout(()=>AudioManager.tone(196,0.2,0.3),200);
        setTimeout(()=>AudioManager.tone(174,0.3,0.3),400);
        setTimeout(()=>sounds.crowdOoh(),600);
    };

    // Menu/UI click - subtle tick
    sounds.uiClick=()=>{
        AudioManager.tone(1800, 0.015, 0.12, 'square');
    };
}

function playTone(f,d,v){
    AudioManager.tone(f,d,v);
}

// ========== GEM SYSTEM ==========

function spawnGem(){
    if(!M.active||M.gemActive)return;

    // Calculate multiplier based on streak
    const streakBonus = G.owned.includes('x8') ? 2 : 1;
    M.gemMultiplier = Math.min(5, 1 + Math.floor(M.streak / 2) * streakBonus);

    M.gemActive=true;
    M.gemPos={x:20+Math.floor(Math.random() * 60),y:55+Math.floor(Math.random() * 30)};

    // Gem duration - base 8 seconds, +50% with Gem Magnet
    const baseDuration = 8;
    M.gemTimer = G.owned.includes('x7') ? Math.floor(baseDuration * 1.5) : baseDuration;

    const gem=safeGetElement('gemDrop');
    const timerEl=safeGetElement('gemTimer');
    const multEl=safeGetElement('gemMultiplier');

    gem.classList.add('active');
    gem.classList.remove('urgent');
    gem.style.left=M.gemPos.x+'%';
    gem.style.top=M.gemPos.y+'%';

    multEl.textContent = 'x' + M.gemMultiplier;
    multEl.style.display = M.gemMultiplier > 1 ? 'block' : 'none';

    updateGemTimer();

    const interval=setInterval(()=>{
        M.gemTimer--;
        updateGemTimer();

        // Urgent animation when < 3 seconds
        if(M.gemTimer <= 3 && M.gemTimer > 0){
            gem.classList.add('urgent');
        }

        if(M.gemTimer<=0||!M.active){
            clearInterval(interval);
            hideGem();
        }
    },1000);
}

function updateGemTimer(){
    const timerEl=safeGetElement('gemTimer');
    timerEl.textContent = M.gemTimer + 's';
}

function hideGem(){
    M.gemActive=false;
    const gem=safeGetElement('gemDrop');
    gem.classList.remove('active','urgent');
}

function collectGem(){
    if(!M.gemActive)return;

    const baseGems = Math.floor(Math.floor(Math.random() * 3))+1;
    const totalGems = baseGems * M.gemMultiplier;

    G.gems+=totalGems;

    // Create burst particles
    const gem = safeGetElement('gemDrop');
    if(!gem) return;
    if(!isPerformanceMode()){
        const rect = gem.getBoundingClientRect();
        const court = getCourtElement();
        if(court){
            const courtRect = court.getBoundingClientRect();

            for(let i = 0; i < 8; i++){
                const particle = document.createElement('div');
                particle.className = 'gem-particle';
                const angle = (i / 8) * Math.PI * 2;
                const dist = 40 + Math.floor(Math.random() * 30);
                particle.style.cssText = `
                    left: ${((rect.left + rect.width/2 - courtRect.left) / courtRect.width) * 100}%;
                    top: ${((rect.top + rect.height/2 - courtRect.top) / courtRect.height) * 100}%;
                    --tx: ${Math.cos(angle) * dist}px;
                    --ty: ${Math.sin(angle) * dist}px;
                    animation: gemBurst 0.5s ease-out forwards;
                `;
                court.appendChild(particle);
                setTimeout(() => particle.remove(), 500);
            }
        }
    }

    M.gemActive=false;
    gem.classList.remove('active','urgent');
    sounds.gem();

    if(M.gemMultiplier > 1){
        toast(`+${totalGems} gems (x${M.gemMultiplier})`);
    } else {
        toast(`+${totalGems} gems`);
    }

    save();
    updateUI();
}

function updateMatchStreakDisplay(){
    const display = safeGetElement('streakDisplay');
    const valueEl = safeGetElement('streakValue');
    const bonusEl = safeGetElement('streakBonus');

    if(M.streak > M.bestStreak){
        M.bestStreak = M.streak;
    }

    if(M.streak >= 2){
        display.classList.add('active');
        valueEl.textContent = M.streak;
        const bonusPercent = Math.min(200, M.streak * 25);
        bonusEl.textContent = `+${bonusPercent}% gems`;
    } else {
        display.classList.remove('active');
    }
}

// ========== SERVE SYSTEM ==========

function getServeSide(){
    // In tennis: deuce court (right) on even points, ad court (left) on odd points
    const totalPoints = M.pPoints + M.oPoints;
    return totalPoints % 2 === 0 ? 'deuce' : 'ad';
}

function getTiebreakServer(){
    // In tiebreak: first server serves 1 point, then alternate every 2 points
    const totalPoints = M.pPoints + M.oPoints;
    if(totalPoints === 0) return M.tiebreakServer;
    // After first point, switch every 2 points
    const adjustedPoints = totalPoints - 1;
    const switches = Math.floor(adjustedPoints / 2) + 1;
    return switches % 2 === 0 ? M.tiebreakServer : (M.tiebreakServer === 'player' ? 'opp' : 'player');
}

function showNetCordEffect(){
    const netCord = safeGetElement('netCord');
    netCord.classList.remove('active');
    void netCord.offsetWidth;
    netCord.classList.add('active');
    setTimeout(() => netCord.classList.remove('active'), 400);
}

function showCallOverlay(text, isGood){
    const overlay = safeGetElement('callOverlay');
    overlay.textContent = text;
    overlay.classList.remove('active', 'in');
    void overlay.offsetWidth;
    if(isGood) overlay.classList.add('in');
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active', 'in'), 800);
}

function showCourtChange(message, sub){
    return new Promise(resolve => {
        const overlay = safeGetElement('courtChange');
        { const _el = safeGetElement('courtChangeText'); if(_el) _el.textContent = message; }
        { const _el = safeGetElement('courtChangeSub'); if(_el) _el.textContent = sub || ''; }
        overlay.classList.add('active');
        sounds.changeover();
        setTimeout(() => {
            overlay.classList.remove('active');
            resolve();
        }, 2000);
    });
}

function shouldChangeover(){
    // In tennis, players change sides after every odd game (1, 3, 5, etc.)
    const totalGames = M.pGames + M.oGames;
    return totalGames > 0 && totalGames % 2 === 1;
}

function shouldTiebreakChangeover(){
    // In tiebreak, players change ends every 6 points
    const totalPoints = M.pPoints + M.oPoints;
    return totalPoints > 0 && totalPoints % 6 === 0;
}

function updateServeIndicator(){
    const ind = safeGetElement('serveIndicator');
    if(M.serveNum === 1){
        ind.textContent = '1ST SERVE';
        ind.classList.remove('fault');
    } else {
        ind.textContent = '2ND SERVE';
        ind.classList.add('fault');
    }
}

function highlightServiceBox(){
    // Clear all service box highlights
    safeGetElement('serviceBoxOppRight')?.classList.remove('active');
    safeGetElement('serviceBoxOppLeft')?.classList.remove('active');
    safeGetElement('serviceBoxPlayerRight')?.classList.remove('active');
    safeGetElement('serviceBoxPlayerLeft')?.classList.remove('active');

    M.serveSide = getServeSide();

    const isPlayerServing = M.servingPlayer === 'player';
    if(isPlayerServing){
        // Player serves CROSS-COURT into opponent's boxes (top half)
        // Deuce side (player on right) → ball goes to opponent's LEFT box
        // Ad side (player on left) → ball goes to opponent's RIGHT box
        if(M.serveSide === 'deuce'){
            safeGetElement('serviceBoxOppLeft')?.classList.add('active');
        } else {
            safeGetElement('serviceBoxOppRight')?.classList.add('active');
        }
    } else {
        // Opponent serves CROSS-COURT into player's boxes (bottom half)
        // Deuce side → ball goes to player's RIGHT box (cross-court from opp's left)
        if(M.serveSide === 'deuce'){
            safeGetElement('serviceBoxPlayerRight')?.classList.add('active');
        } else {
            safeGetElement('serviceBoxPlayerLeft')?.classList.add('active');
        }
    }
}

function clearServiceBoxHighlight(){
    safeGetElement('serviceBoxOppRight')?.classList.remove('active');
    safeGetElement('serviceBoxOppLeft')?.classList.remove('active');
    safeGetElement('serviceBoxPlayerRight')?.classList.remove('active');
    safeGetElement('serviceBoxPlayerLeft')?.classList.remove('active');
}

function startPlayerServe(){
    M.isPlayerServe = true;
    M.servePhase = 'ready';  // waiting for tap to toss
    M.servePower = 0;
    M.serveStartY = null;
    M.serveStartX = null;
    M.serveTossProgress = 0;
    M.serveTimingValue = null;
    M.serveAimX = M.serveSide === 'deuce' ? 35 : 64;

    // Position player at baseline center
    M.playerPos = 50;
    { const _el = safeGetElement('playerPaddle'); if(_el) _el.style.left = '50%'; }
    safeGetElement('playerPaddle')?.classList.add('serving');

    // Show serve UI
    highlightServiceBox();
    updateServeIndicator();

    const hint = safeGetElement('swipeHint');
    hint.textContent = 'PULL BACK & RELEASE';
    hint.classList.add('active','serve');

    // Position ball with player (held)
    const ball = safeGetElement('ball');
    ball.classList.add('active');
    ball.style.left = '50%';
    ball.style.top = '88%';

    // Hide toss ball
    const tossBall = safeGetElement('serveTossBall');
    if(tossBall) { tossBall.classList.remove('active'); }

    safeGetElement('ballShadow')?.classList.add('active');
    { const _el = safeGetElement('ballShadow'); if(_el) _el.style.left = '50%'; }
    { const _el = safeGetElement('ballShadow'); if(_el) _el.style.top = '92%'; }
}

// STEP 1: Tap to start ball toss
function serveToss(){
    if(M.servePhase !== 'ready') return;
    M.servePhase = 'toss';

    const hint = safeGetElement('swipeHint');
    hint.textContent = 'PULL BACK & RELEASE!';

    // Hide main ball, show toss ball rising above player
    const ball = safeGetElement('ball');
    ball.classList.remove('active');

    const tossBall = safeGetElement('serveTossBall');
    tossBall.classList.add('active');
    tossBall.style.left = '50%';

    // Show timing bar (right side)
    M.serveTossProgress = 0;
    M.serveTossDir = 1;
    const timingEl = safeGetElement('serveTiming');
    timingEl.classList.add('active');
    const cursor = safeGetElement('serveTimingCursor');

    function animateToss(){
        if(M.servePhase !== 'toss' && M.servePhase !== 'charging'){
            return; // Serve was released or cancelled
        }
        M.serveTossProgress += M.serveTossDir * 0.012;

        if(M.serveTossProgress >= 1){
            M.serveTossProgress = 1;
            M.serveTossDir = -1;
        }
        if(M.serveTossProgress <= 0){
            // Ball fell back down — auto-release with weak timing
            M.serveTossProgress = 0;
            if(M.servePhase === 'charging') {
                releaseServe(null, null);
            } else {
                // Player never started pulling — auto weak serve
                M.servePhase = 'charging';
                M.servePower = 0;
                releaseServe(null, null);
            }
            return;
        }

        // Position toss ball: rises from 85% up to 65%
        const ballY = 85 - M.serveTossProgress * 20;
        tossBall.style.top = ballY + '%';

        // Cursor tracks toss progress: 0=bottom(100%), 1=top(0%)
        const cursorPct = (1 - M.serveTossProgress) * 100;
        cursor.style.top = cursorPct + '%';

        requestAnimationFrame(animateToss);
    }
    requestAnimationFrame(animateToss);
}

// STEP 2: Pull back to charge power (touch/mouse down during toss)
function startServeCharge(clientY, clientX){
    if(M.servePhase !== 'toss') return;
    M.servePhase = 'charging';
    M.serveStartY = clientY;
    M.serveStartX = clientX;
    M.servePower = 0;

    // Show power bar (left side)
    safeGetElement('servePower')?.classList.add('active');

    // Show aim indicator
    safeGetElement('serveAim')?.classList.add('active');
    const aimEl = safeGetElement('serveAim');
    aimEl.style.left = M.serveAimX + '%';
    aimEl.style.top = '42%';

    safeGetElement('serveTargetLine')?.classList.add('active');
}

// Update power + aim during pull-back drag
function updateServeCharge(clientY, clientX){
    if(M.servePhase !== 'charging') return;

    // Power from pull-down distance
    const pullDist = clientY - M.serveStartY;
    M.servePower = Math.min(1, Math.max(0, pullDist / 150));
    { const _el = safeGetElement('servePowerFill'); if(_el) _el.style.height = (M.servePower * 100) + '%'; }

    // Aim from horizontal position
    const court = getCourtElement();
    if(court && clientX){
        const rect = court.getBoundingClientRect();
        const relX = ((clientX - rect.left) / rect.width) * 100;

        const isDeuce = M.serveSide === 'deuce';
        const boxLeft = isDeuce ? 22 : 49.5;
        const boxRight = isDeuce ? 49.5 : 78;
        const boxCenter = (boxLeft + boxRight) / 2;
        const aimOffset = (relX - 50) * 0.4;
        M.serveAimX = Math.max(boxLeft, Math.min(boxRight, boxCenter + aimOffset));

        const aimEl = safeGetElement('serveAim');
        aimEl.style.left = M.serveAimX + '%';

        const lineEl = safeGetElement('serveTargetLine');
        lineEl.style.left = '50%';
        lineEl.style.bottom = '10%';
        lineEl.style.height = '50%';
        const angle = Math.atan2(M.serveAimX - 50, 50) * (180 / Math.PI);
        lineEl.style.transform = `rotate(${angle}deg)`;
    }
}

// STEP 3: Release — timing determined by toss position at this moment
function releaseServe(){
    if(M.servePhase !== 'charging') return;
    M.servePhase = 'swing';

    const progress = M.serveTossProgress; // Where the ball is when released

    // Timing quality from toss position at release
    // Zone layout: red-top 85-100%, green sweet spot 65-85%, yellow 40-65%, red-bottom 0-40%
    let quality, qualityLabel, accuracyMult;
    if(progress >= 0.85){
        quality = 'weak'; qualityLabel = 'WEAK'; accuracyMult = 0.3;
    } else if(progress >= 0.65){
        quality = 'perfect'; qualityLabel = 'PERFECT!'; accuracyMult = 1.0;
    } else if(progress >= 0.40){
        quality = 'good'; qualityLabel = 'GOOD'; accuracyMult = 0.7;
    } else {
        quality = 'weak'; qualityLabel = 'WEAK'; accuracyMult = 0.2;
    }

    M.serveTimingQuality = quality;
    M.serveAccuracyMult = accuracyMult;

    // Show feedback text
    const fb = safeGetElement('serveFeedback');
    fb.textContent = qualityLabel;
    fb.className = 'serve-feedback active ' + quality;
    setTimeout(() => fb.classList.remove('active'), 800);

    // Hide all serve UI
    safeGetElement('serveTiming')?.classList.remove('active');
    safeGetElement('servePower')?.classList.remove('active');
    safeGetElement('swipeHint')?.classList.remove('active','serve');
    safeGetElement('playerPaddle')?.classList.remove('serving');
    safeGetElement('serveAim')?.classList.remove('active');
    safeGetElement('serveTargetLine')?.classList.remove('active');
    safeGetElement('serveTossBall')?.classList.remove('active');

    executePlayerServe(M.servePower, M.serveAimX);
}

function executePlayerServe(power, aimX){
    const st = getStats();
    M.lastHitBy = 'player';

    // Show ball again at contact point and play swing
    const ball = safeGetElement('ball');
    ball.classList.add('active');
    ball.style.left = '50%';
    ball.style.top = '80%';

    sounds.serve();
    setPlayerSwinging();

    setTimeout(() => {
        const isDeuceCourt = M.serveSide === 'deuce';
        const boxCenterX = isDeuceCourt ? 35 : 64;
        const boxLeft = isDeuceCourt ? 22 : 49.5;
        const boxRight = isDeuceCourt ? 49.5 : 78;

        const serveAccuracy = st.serve / 100;
        const qualityAcc = M.serveAccuracyMult || 0.5;
        const aimTarget = aimX;

        // Spread: timing controls accuracy, serve stat reduces further
        const maxSpread = (1 - qualityAcc) * 8 + (1 - serveAccuracy) * 3;
        const randomSpread = (Math.random() - 0.5) * maxSpread;
        let targetX = aimTarget + randomSpread;

        // Speed: pull-back power is the base, timing gives a multiplier bonus
        // Perfect timing = 1.3x speed bonus, good = 1.1x, weak = 0.8x
        const timingSpeedMult = M.serveTimingQuality === 'perfect' ? 1.3 : (M.serveTimingQuality === 'good' ? 1.1 : 0.8);
        const baseSpeed = 1.5 + power * 1.5;
        const serveSpeed = baseSpeed * timingSpeedMult * (1 + st.serve * 0.005) * M.settings.speed * 0.65;

        // Fault chance: weak timing + high power = risky, perfect timing = safe
        const qualityFault = M.serveTimingQuality === 'weak' ? 0.4 : (M.serveTimingQuality === 'good' ? 0.08 : 0.02);
        const powerRisk = power > 0.9 ? 1.5 : 1.0;
        const faultChance = qualityFault * M.settings.serveFaultChance * powerRisk * (1 - serveAccuracy * 0.5);
        const isNetFault = power < 0.1 || Math.random() < faultChance * 0.2;
        const isOutFault = targetX < boxLeft - 5 || targetX > boxRight + 5 || Math.random() < faultChance * 0.3;

        // Serve speed display: combines power + timing
        // power 0-1 maps to ~80-120 base, timing bonus adds up to +20
        const timingBonus = M.serveTimingQuality === 'perfect' ? 20 : (M.serveTimingQuality === 'good' ? 8 : -10);
        const baseServeSpeed = 90 + power * 50 + st.serve * 0.3 + timingBonus;
        M.lastServeSpeed = Math.round(baseServeSpeed + (Math.random() - 0.5) * 10);
        { const _el = safeGetElement('serveSpeed'); if(_el) _el.textContent = M.lastServeSpeed + ' MPH'; }

        const isLet = !isNetFault && Math.random() < 0.05;
        if(isLet){
            sounds.let();
            showNetCordEffect();
            toast('LET! Serve again');
            M.servePhase = 'none';
            setTimeout(startPlayerServe, 1000);
            return;
        }

        if(isNetFault){
            handleServeFault('net');
            return;
        }

        if(isOutFault){
            M.ballActive = true;
            M.ballPos = {x: 50, y: 90};
            M.ballH = 100;
            M.ballBounces = 0;
            targetX = targetX < boxCenterX ? boxLeft - 10 : boxRight + 10;
            const faultFrames = (90 - 35) / (serveSpeed * 1.2);
            const faultZ = (0.07 * faultFrames * faultFrames - 100) / faultFrames;
            M.ballVel = {
                x: (targetX - M.ballPos.x) / 80,
                y: -serveSpeed * 1.2,
                z: faultZ
            };
            animateServeBall('out');
            return;
        }

        // Good serve!
        M.ballActive = true;
        M.ballPos = {x: 50, y: 88};
        M.ballH = 100;  // High contact point (ball toss)
        M.ballBounces = 0;
        M.isPlayerServe = false;
        M.servePhase = 'flight';

        clearServiceBoxHighlight();

        // SERVE PHYSICS: Ball starts high, descends over net, bounces in opponent's service box
        // Target bounce at ~42% (middle of opponent's service box 28-54%)
        const targetBounceY = 42;
        const framesToTarget = (88 - targetBounceY) / (serveSpeed * 1.2);
        // ballH = 100 + z0*n - 0.07*n^2 = 0 → z0 = (0.07*n^2 - 100) / n
        const z0 = (0.07 * framesToTarget * framesToTarget - 100) / framesToTarget;

        M.ballVel = {
            x: (targetX - M.ballPos.x) / 70,
            y: -serveSpeed * 1.2,
            z: z0
        };

        // Check if it's an ace (opponent can't reach)
        const aceChance = power * serveAccuracy * 0.15;
        M.pendingAce = Math.random() < aceChance;

        animateServeBall('good');

    }, 400); // Delay for toss animation
}

function animateServeBall(result){
    if(!M.ballActive) return;

    M.ballPos.x += M.ballVel.x;
    M.ballPos.y += M.ballVel.y;
    M.ballH += M.ballVel.z;
    M.ballVel.z -= 0.14;

    // Ground bounce
    if(M.ballH <= 0 && M.ballVel.z < 0){
        M.ballH = 0;
        M.ballVel.z = -M.ballVel.z * 0.72;
        sounds.bounce();
        M.ballBounces++;

        // BULLETPROOF service box detection
        if(M.ballBounces === 1){
            const isDeuce = M.serveSide === 'deuce';
            const isPlayerServing = M.servingPlayer === 'player';

            // Court-relative coords: sidelines 22%-78%, net 54%, service lines 28%/75%, center 49.5%
            // When PLAYER serves: ball must land in OPPONENT's boxes (y: 28-54%)
            // When OPPONENT serves: ball must land in PLAYER's boxes (y: 54-75%)
            // CROSS-COURT RULE: Serve from deuce side (right) goes to LEFT box, and vice versa
            const boxLeft = isDeuce ? 22 : 49.5;   // Deuce serve → left box (cross-court)
            const boxRight = isDeuce ? 49.5 : 78;  // Ad serve → right box (cross-court)
            const boxTop = isPlayerServing ? 28 : 54;
            const boxBottom = isPlayerServing ? 54 : 75;

            // Minimal tolerance for pixel-perfect detection
            const tolerance = 0.3;
            const inBox = M.ballPos.x >= (boxLeft - tolerance) &&
                         M.ballPos.x <= (boxRight + tolerance) &&
                         M.ballPos.y >= (boxTop - tolerance) &&
                         M.ballPos.y <= (boxBottom + tolerance);

            // Debug logging for precision tuning
            if(!inBox) {
                console.log(`FAULT: Ball at (${M.ballPos.x.toFixed(2)}, ${M.ballPos.y.toFixed(2)}) missed ${M.serveSide} box (${boxLeft}-${boxRight}, ${boxTop}-${boxBottom})`);
            } else {
                console.log(`GOOD: Ball at (${M.ballPos.x.toFixed(2)}, ${M.ballPos.y.toFixed(2)}) landed in ${M.serveSide} service box`);
                showCallOverlay('GOOD SERVE', true);
            }

            if(!inBox){
                handleServeFault('out');
                return;
            }

            // Ball in play after valid bounce in service box
            M.servePhase = 'none';

            // If OPPONENT was serving, hand off to main game loop so player can return
            if(!isPlayerServing){
                // Cap post-bounce height so ball is returnable (H < 50 in hit zone)
                // Serve drops from H=100, creating huge bounce velocity — clamp it
                M.ballVel.z = Math.min(M.ballVel.z, 2.2);
                M.ballH = 0;
                requestAnimationFrame(animateBall);
                return; // Stop animateServeBall loop
            }
        }
    }

    const ball = safeGetElement('ball');
    const shadow = safeGetElement('ballShadow');
    ball.style.left = M.ballPos.x + '%';
    ball.style.top = (M.ballPos.y - M.ballH/10) + '%';
    shadow.style.left = M.ballPos.x + '%';
    shadow.style.top = M.ballPos.y + '%';

    // After ball bounces in service box (servePhase becomes 'none'), opponent returns
    if(M.servePhase === 'none' && M.ballBounces >= 1 && M.ballPos.y < 20){
        // Opponent tries to return the serve
        if(M.pendingAce){
            // ACE! Ball unreturnable
            M.ballActive = false;
            resetBallUI();
            M.aces++;
            sounds.ace();
            showCallOverlay('ACE!', true);
            M.streak++;
            updateMatchStreakDisplay();
            if(!scorePoint('p')) setTimeout(startNextPoint, 2000);
            return;
        }

        // Opponent returns
        opponentReturn();
        return;
    }

    // Ball still in flight (hasn't bounced yet) - keep going past net
    // If ball goes way past without bouncing, it's still valid until it bounces

    // Ball out of bounds
    if(M.ballPos.y < 5 || M.ballPos.x < 5 || M.ballPos.x > 95){
        if(result === 'out'){
            handleServeFault('out');
        } else {
            // Opponent missed - point for player
            M.ballActive = false;
            resetBallUI();
            sounds.point();
            M.streak++;
            updateMatchStreakDisplay();
            if(!scorePoint('p')) setTimeout(startNextPoint, 1200);
        }
        return;
    }

    updateOpp();
    requestAnimationFrame(() => animateServeBall(result));
}

function handleServeFault(type){
    M.ballActive = false;
    resetBallUI();
    clearServiceBoxHighlight();
    sounds.fault();

    if(M.serveNum === 1){
        // First serve fault - get second serve
        M.serveNum = 2;
        showCallOverlay('FAULT', false);
        setTimeout(startPlayerServe, 1500);
    } else {
        // Double fault - lose point
        M.serveNum = 1;
        M.doubleFaults++;
        showCallOverlay('DOUBLE FAULT', false);
        M.streak = 0;
        updateMatchStreakDisplay();
        if(!scorePoint('o')) setTimeout(startNextPoint, 2000);
    }
}

function opponentReturn(){
    // Opponent hits the ball back
    M.lastHitBy = 'opp'; // Track who hit last
    const st = getStats();
    M.rally++;

    // Rally tension - crowd gets louder as rally continues
    sounds.rallyTension(M.rally);

    updateMatchUI();

    const oppDist = Math.abs(M.ballPos.x - M.oppPos);
    const canReach = oppDist < 35;

    if(!canReach){
        // Opponent can't reach - point for player (might be from ace-like serve)
        M.ballActive = false;
        resetBallUI();
        sounds.point();
        M.streak++;
        updateMatchStreakDisplay();
        if(!scorePoint('p')) setTimeout(startNextPoint, 1200);
        return;
    }

    // Opponent hits back
    M.oppPos = M.ballPos.x;
    { const _el = safeGetElement('opponent'); if(_el) _el.style.left = M.oppPos + '%'; }

    // Windup anticipation before serve return
    const oppEl = safeGetElement('opponent');
    oppEl?.classList.add('windup');
    setTimeout(() => {
        oppEl?.classList.remove('windup');
        oppEl?.classList.add('hitting');
        setOppSwinging();
        setTimeout(() => oppEl?.classList.remove('hitting'), 250);
        sounds.hit();
    }, 120);

    M.ballBounces = 0;
    M.ballH = 45;

    const targetX = M.playerPos + (Math.random() - 0.5) * 40;
    M.ballVel = {
        x: (targetX - M.ballPos.x) / 85,
        y: M.settings.speed * 0.7,
        z: 1.9
    };

    // Now normal rally begins
    animateBall();
}

// ========== OPPONENT SERVE ==========

function opponentServe(){
    if (!validateCriticalState()) { console.error("Invalid state for opponentServe"); return; }
    if(!M.active) return;

    highlightServiceBox();
    updateServeIndicator();

    // Position opponent at correct baseline side for serve
    // Deuce side: opponent stands right of center (from their POV) = screen left (~35%)
    // Ad side: opponent stands left of center (from their POV) = screen right (~65%)
    const servePosX = M.serveSide === 'deuce' ? 40 : 60;
    M.oppPos = servePosX;
    { const _el = safeGetElement('opponent'); if(_el) _el.style.left = servePosX + '%'; }

    const oppServeDelay = 800;

    setTimeout(() => {
        if(!M.active) return;

        // Opponent can fault too! (slightly better than player)
        const faultChance = M.settings.serveFaultChance * 0.5;
        const isFault = Math.random() < faultChance;

        if(isFault){
            if(M.serveNum === 1){
                M.serveNum = 2;
                sounds.fault();
                showCallOverlay('FAULT', false);
                updateServeIndicator();
                setTimeout(opponentServe, 1500);
                return;
            } else {
                M.serveNum = 1;
                sounds.fault();
                showCallOverlay('DOUBLE FAULT', true);
                M.streak++;
                updateMatchStreakDisplay();
                clearServiceBoxHighlight();
                if(!scorePoint('p')) setTimeout(startNextPoint, 2000);
                return;
            }
        }

        clearServiceBoxHighlight();

        M.ballActive = true;
        M.lastHitBy = 'opp'; // Track who hit last
        M.ballPos = {x: M.oppPos, y: 10};
        M.ballH = 100;  // High contact point (ball toss)
        M.ballBounces = 0;

        const st = getStats();
        const isDeuceCourt = M.serveSide === 'deuce';
        // Opponent serves CROSS-COURT into PLAYER's service boxes
        const targetX = isDeuceCourt ? 55 + Math.floor(Math.random() * 20) : 25 + Math.floor(Math.random() * 20);

        // Opponent serve speed
        const serveSpd = M.settings.speed * M.settings.oppServeSpeed * 0.65;

        // Display opponent serve speed
        const oppServeSpeed = Math.round(90 + M.settings.oppServeSpeed * 30 + Math.floor(Math.random() * 15));
        M.lastServeSpeed = oppServeSpeed;
        { const _el = safeGetElement('serveSpeed'); if(_el) _el.textContent = oppServeSpeed + ' MPH'; }

        // SERVE PHYSICS: Ball starts high, descends sharply over net, bounces in player's service box
        // Must NOT bounce before crossing the net — z must be negative (downward) from the start
        // Calculate z so ball reaches ground (ballH=0) when y reaches the service box (~65%)
        // Target y for bounce: ~65% (middle of player's service box)
        const targetBounceY = 65;
        const framesToBounce = (targetBounceY - 10) / (serveSpd * 1.2);
        // ballH = 100 + z0*n - 0.07*n^2 = 0 → z0 = (0.07*n^2 - 100) / n
        const z0 = (0.07 * framesToBounce * framesToBounce - 100) / framesToBounce;

        M.ballVel = {
            x: (targetX - M.ballPos.x) / 100 * 1.1,
            y: serveSpd * 1.2,
            z: z0
        };

        const ball = safeGetElement('ball');
        const shadow = safeGetElement('ballShadow');
        ball.classList.add('active');
        shadow.classList.add('active');

        safeGetElement('opponent')?.classList.add('hitting');
        setOppSwinging();
        setTimeout(() => safeGetElement('opponent')?.classList.remove('hitting'), 250);
        sounds.serve();

        // Use animateServeBall for proper serve physics (gravity 0.14)
        // so the ball doesn't bounce unreachably high when it lands
        M.servePhase = 'flight';
        animateServeBall('good');
    }, oppServeDelay);
}

// ========== CORE GAME FUNCTIONS ==========

function startGame(){
    console.log(' startGame() function called');
    PerformanceOptimizer.startMonitoring();
    try {
        if(!audio) {
            console.log(' Initializing audio...');
            initAudio();
            // UI click sounds on buttons
            document.addEventListener('pointerdown', function(e) {
                if (e.target.closest('.menu-btn,.difficulty-btn,.back-btn,.shop-tab,.buy-btn,.equip-btn,.play-button,.char-card,.tutorial-btn,.continue-btn,.skip-btn')) {
                    sounds.uiClick && sounds.uiClick();
                }
            });
        }
        
        const loadingScreen = safeGetElement('loadingScreen');
        const mainMenu = safeGetElement('mainMenu');
        
        console.log('Elements found:', { loadingScreen, mainMenu });
        
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            console.log('OK: Removed active class from loading screen');
        } else {
            console.warn('WARN: Loading screen not found');
        }
        
        if (mainMenu) {
            mainMenu.classList.add('active');
            console.log('OK: Added active class to main menu');
        } else {
            console.warn('WARN: Main menu not found');
        }
        
        // Hide any tutorial overlay that might be showing
        const tutorialOverlay = safeGetElement('tutorialOverlay');
        if (tutorialOverlay && tutorialOverlay.classList.contains('active')) {
            tutorialOverlay.classList.remove('active');
            console.log('OK: Hidden tutorial overlay');
        }
        
        load();
        updateUI();
        console.log('OK: startGame completed successfully');
    } catch (error) {
        console.error('ERROR: Error in startGame:', error);
    }
}

function load(){
    const s = localStorage.getItem('tennisGame');
    if(s){
        const saved = JSON.parse(s);
        Object.assign(G, saved);
        // Ensure new stats exist
        if(!G.stats.serve) G.stats.serve = 10;
        if(!G.equipment.serveGear) G.equipment.serveGear = null;
    }

    // Restore unlocked characters from save
    if(G.unlockedChars){
        G.unlockedChars.forEach(id => {
            const c = window.CHARACTERS.find(ch => ch.id === id);
            if(c) c.unlocked = true;
        });
    }

    // Initialize daily challenges
    initDailyChallenge();

    // Initialize achievements
    initAchievements();
}

function save(){
    localStorage.setItem('tennisGame', JSON.stringify(G));
}

function getStats(){
    const s = {...G.stats};
    Object.values(SHOP).flat().forEach(i => {
        if(G.owned.includes(i.id) && Object.values(G.equipment).includes(i.id)){
            if(i.stats.power) s.power += i.stats.power;
            if(i.stats.speed) s.speed += i.stats.speed;
            if(i.stats.control) s.control += i.stats.control;
            if(i.stats.serve) s.serve += i.stats.serve;
        }
    });
    // Also add stats from non-equipment owned items (like serve training)
    SHOP.serve.forEach(i => {
        if(G.owned.includes(i.id) && !i.repeatable){
            if(i.stats.serve) s.serve += i.stats.serve;
            if(i.stats.power) s.power += i.stats.power;
            if(i.stats.control) s.control += i.stats.control;
        }
    });
    return s;
}

const NTRP_LEVELS=[
    {rating:2.5,points:0},
    {rating:3.0,points:300},
    {rating:3.5,points:800},
    {rating:4.0,points:1500},
    {rating:4.5,points:2500},
    {rating:5.0,points:4000},
    {rating:5.5,points:6000}
];

function getNTRP(){
    for(let i=NTRP_LEVELS.length-1;i>=0;i--){
        if(G.skillPoints>=NTRP_LEVELS[i].points) return NTRP_LEVELS[i].rating;
    }
    return 2.5;
}

function getNextNTRP(){
    const current = getNTRP();
    const idx = NTRP_LEVELS.findIndex(l => l.rating === current);
    if(idx < NTRP_LEVELS.length - 1) return NTRP_LEVELS[idx + 1];
    return null;
}

function updateUI(){
    const ntrp = getNTRP();
    const next = getNextNTRP();
    G.ntrp = ntrp;

    { const _el = safeGetElement('playerNTRP'); if(_el) _el.textContent = ntrp.toFixed(1); }
    { const _el = safeGetElement('coinAmount'); if(_el) _el.textContent = G.coins; }
    { const _el = safeGetElement('gemAmount'); if(_el) _el.textContent = G.gems; }
    { const _el = safeGetElement('skillPoints'); if(_el) _el.textContent = G.skillPoints; }

    if(next){
        { const _el = safeGetElement('skillNeeded'); if(_el) _el.textContent = next.points; }
        const progress = (G.skillPoints / next.points) * 100;
        { const _el = safeGetElement('skillFill'); if(_el) _el.style.width = progress + '%'; }
    } else {
        { const _el = safeGetElement('skillNeeded'); if(_el) _el.textContent = 'MAX'; }
        { const _el = safeGetElement('skillFill'); if(_el) _el.style.width = '100%'; }
    }

    const s = getStats();
    { const _el = safeGetElement('statPower'); if(_el) _el.textContent = s.power; }
    { const _el = safeGetElement('statSpeed'); if(_el) _el.textContent = s.speed; }
    { const _el = safeGetElement('statControl'); if(_el) _el.textContent = s.control; }
    { const _el = safeGetElement('statServe'); if(_el) _el.textContent = s.serve; }
}

function selectDifficulty(d){
    G.difficulty = d;
    document.querySelectorAll('.diff-rookie,.diff-pro,.diff-legend').forEach(b => b.classList.remove('selected'));
    document.querySelector('.diff-' + d).classList.add('selected');
}

function selectMatchType(type){
    G.matchType = type;
    safeGetElement('matchQuick')?.classList.remove('selected');
    safeGetElement('matchStandard')?.classList.remove('selected');
    safeGetElement('matchTimed')?.classList.remove('selected');
    safeGetElement('match' + type.charAt(0).toUpperCase() + type.slice(1))?.classList.add('selected');
}

function showShop(){
    safeGetElement('mainMenu')?.classList.remove('active');
    safeGetElement('shopScreen')?.classList.add('active');
    renderShop('training');
}

function closeShop(){
    safeGetElement('shopScreen')?.classList.remove('active');
    safeGetElement('mainMenu')?.classList.add('active');
    updateUI();
}

// Character system - must be before showCharSelect
const V = '?v=32';

window.CHARACTERS = [
    {id:'player1', name:'Roger Fedora', power:50, speed:50, control:50, unlocked:true},
    {id:'player2', name:'Serena Slammin', power:65, speed:50, control:40, unlocked:true},
    {id:'player3', name:'Novak Joke-ovic', power:55, speed:55, control:50, unlocked:false, cost:500},
    {id:'player4', name:'Steffi Gaffe', power:45, speed:60, control:45, unlocked:true},
    {id:'player5', name:'Rafa Noddle', power:65, speed:40, control:45, unlocked:false, cost:500},
    {id:'player6', name:'Martina N.T.O.', power:40, speed:55, control:55, unlocked:false, cost:500},
    {id:'player7', name:'Bjorn Bored', power:45, speed:45, control:60, unlocked:false, cost:750},
    {id:'player8', name:'Venus Will-yams', power:50, speed:55, control:45, unlocked:false, cost:750},
    {id:'player9', name:'Boris Bonkers', power:60, speed:35, control:55, unlocked:false, cost:1000},
    {id:'player10', name:'Chris Ev-hurt', power:45, speed:50, control:55, unlocked:false, cost:1000},
    {id:'player11', name:'Andre A-gassy', power:50, speed:60, control:40, unlocked:false, cost:1250},
    {id:'player12', name:'Naomi Oh-saka', power:40, speed:55, control:55, unlocked:false, cost:1250},
    {id:'punk', name:'John Mac-n-Throw', power:70, speed:50, control:30, unlocked:false, cost:2000, special:true},
    {id:'chubby', name:'Jimmy Con-ers', power:75, speed:30, control:45, unlocked:false, cost:2000, special:true},
    {id:'beach', name:'Maria Shara-Pova', power:40, speed:65, control:45, unlocked:false, cost:2000, special:true},
    {id:'goth', name:'Monica Slay-less', power:55, speed:45, control:50, unlocked:false, cost:2500, special:true},
    {id:'anime', name:'Nick Curious', power:55, speed:65, control:30, unlocked:false, cost:3000, special:true},
    {id:'latino', name:'Carlos All-Crazz', power:60, speed:55, control:35, unlocked:false, cost:3000, special:true},
    {id:'redhead', name:'Billie Jean Queen', power:50, speed:55, control:45, unlocked:false, cost:3000, special:true},
    {id:'grandpa', name:'Rod Staver', power:35, speed:30, control:70, unlocked:false, cost:2500, special:true},
    {id:'indian', name:'Sania Mirror', power:45, speed:60, control:50, unlocked:false, cost:2500, special:true}
];

var selectedChar = window.CHARACTERS[0];
var opponentChar = null; // Selected randomly, different from player

function selectRandomOpponent(){
    // BULLETPROOF: Opponent must ALWAYS be different from player
    let available = window.CHARACTERS.filter(c => c.unlocked && c.id !== selectedChar.id);

    // If no unlocked characters different from player, unlock all characters temporarily for opponent selection
    if(available.length === 0){
        available = window.CHARACTERS.filter(c => c.id !== selectedChar.id);
        if(available.length === 0){
            // Emergency fallback - ensure we have at least 2 characters
            available = window.CHARACTERS.slice(0, 2).filter(c => c.id !== selectedChar.id);
        }
    }

    // Guarantee opponent is different
    if(available.length > 0){
        opponentChar = available[Math.floor(Math.random() * available.length)];
    } else {
        // Ultimate fallback - pick first character that's not player
        opponentChar = window.CHARACTERS.find(c => c.id !== selectedChar.id) || window.CHARACTERS[0];
    }

    // Double-check: If somehow opponent equals player, force different
    if(!opponentChar || opponentChar.id === selectedChar.id){
        const allChars = window.CHARACTERS;
        opponentChar = allChars[selectedChar === allChars[0] ? 1 : 0];
    }

    console.log(`Player: ${selectedChar.name} vs Opponent: ${opponentChar.name}`);
    return opponentChar;
}

// Characters that have dedicated idle sprites
const CHARS_WITH_IDLE = ['player1', 'player2', 'player4'];

function getPlayerSprites(char){
    // Get sprites for player (back view)
    const hasSheet = false;
    const hasIdle = CHARS_WITH_IDLE.includes(char.id);

    if(char.id === 'player1'){
        return {
            swing: 'player-retro-backswing.png' + V,
            run: 'player-retro-run.png' + V,
            idle: 'player-idle-v2.png' + V,
            idleIsSheet: false,
            swingSingle: 'player-retro-backswing.png' + V,
            runSingle: 'player-retro-run.png' + V,
            idleSingle: 'player-idle-v2.png' + V
        };
    }
    const base = 'sprites-v2/characters/' + char.id + '-';
    // Fall back to run sprite for idle if no dedicated idle exists
    const idleSrc = hasIdle ? base + 'back-idle.png' + V : base + 'back-run.png' + V;
    return {
        swing: base + 'back-swing.png' + V,
        run: base + 'back-run.png' + V,
        idle: idleSrc,
        idleIsSheet: !hasIdle, // run sprite is a sheet; idle-only sprites are single frame
        swingSingle: base + 'back-swing.png' + V,
        runSingle: base + 'back-run.png' + V,
        idleSingle: hasIdle ? base + 'back-idle.png' + V : base + 'back-run.png' + V
    };
}

function getOpponentSprites(char){
    // Get sprites for opponent (front view)
    const hasIdle = CHARS_WITH_IDLE.includes(char.id);

    if(char.id === 'player1'){
        return {
            swing: 'opponent-retro-frontswing.png' + V,
            run: 'opponent-retro-run.png' + V,
            idle: 'opponent-idle-v2.png' + V,
            idleIsSheet: false
        };
    }
    const base = 'sprites-v2/characters/' + char.id + '-';
    // Fall back to run sprite for idle if no dedicated idle exists
    const idleSrc = hasIdle ? base + 'front-idle.png' + V : base + 'front-run.png' + V;
    return {
        swing: base + 'front-swing.png' + V,
        run: base + 'front-run.png' + V,
        idle: idleSrc,
        idleIsSheet: !hasIdle // run sprite is a sheet
    };
}

function getCharSprites(char){
    // Combined sprites object for compatibility
    const p = getPlayerSprites(char);
    const opp = opponentChar ? getOpponentSprites(opponentChar) : getOpponentSprites(window.CHARACTERS[1] || char);
    return {
        playerSwing: p.swing,
        playerRun: p.run,
        playerIdle: p.idle,
        playerIdleIsSheet: p.idleIsSheet || false,
        oppSwing: opp.swing,
        oppRun: opp.run,
        oppIdle: opp.idle,
        oppIdleIsSheet: opp.idleIsSheet || false
    };
}

const SPRITES = getCharSprites(selectedChar);

function updateSprites(){
    const s = getCharSprites(selectedChar);
    Object.assign(SPRITES, s);
    // Update animator characters for speed multipliers
    if (typeof playerAnimator !== 'undefined') playerAnimator.setCharacter(selectedChar);
    if (typeof oppAnimator !== 'undefined' && opponentChar) oppAnimator.setCharacter(opponentChar);
}

function showCharSelect(){
    safeGetElement('mainMenu')?.classList.remove('active');
    safeGetElement('charSelect')?.classList.add('active');
    renderCharGrid();
    if(selectedChar) selectCharacter(selectedChar);
}

function closeCharSelect(){
    safeGetElement('charSelect')?.classList.remove('active');
    safeGetElement('mainMenu')?.classList.add('active');
}

function renderCharGrid(){
    var grid = safeGetElement('charGrid');
    if(!grid) return;
    var chars = window.CHARACTERS;
    if(!chars || !chars.length) return;
    var html = '';
    var V = '?v=32';
    for(var i = 0; i < chars.length; i++){
        var c = chars[i];
        var unlocked = c.unlocked || (window.G && window.G.unlockedChars && window.G.unlockedChars.indexOf(c.id) >= 0);
        var spriteUrl = 'sprites-v2/thumbs/' + c.id + '-thumb.png' + V;
        var isSelected = selectedChar && selectedChar.id === c.id;
        html += '<div class="char-card' + (isSelected ? ' selected' : '') + (unlocked ? '' : ' locked') + '" ';
        html += 'onclick="' + (unlocked ? 'selectCharacter(window.CHARACTERS[' + i + '])' : 'tryUnlock(\'' + c.id + '\')') + '">';
        html += '<div class="char-preview" style="background-image:url(' + spriteUrl + ')"></div>';
        if(unlocked){
            html += '<div class="char-name">' + c.name + '</div>';
            html += '<div class="char-stat-bars">';
            html += '<div class="stat-bar-row"><span class="stat-lbl">P</span><div class="stat-bar"><div class="stat-fill pwr" style="width:' + c.power + '%"></div></div></div>';
            html += '<div class="stat-bar-row"><span class="stat-lbl">S</span><div class="stat-bar"><div class="stat-fill spd" style="width:' + c.speed + '%"></div></div></div>';
            html += '<div class="stat-bar-row"><span class="stat-lbl">C</span><div class="stat-bar"><div class="stat-fill ctl" style="width:' + c.control + '%"></div></div></div>';
            html += '</div>';
        } else {
            html += '<div class="char-lock" style="font-size:14px;color:#888;font-weight:700">LOCKED</div>';
            html += '<div class="char-name">' + c.cost + ' coins</div>';
        }
        html += '</div>';
    }
    grid.innerHTML = html;
}

function selectCharacter(char){
    selectedChar = char;
    document.querySelectorAll('.char-card').forEach((el,i) =>
        el.classList.toggle('selected', window.CHARACTERS[i].id === char.id));
    const sprites = getCharSprites(char);
    { const _el = safeGetElement('charDetailPreview'); if(_el) { _el.style.backgroundImage = `url(sprites-v2/thumbs/${char.id}-thumb.png?v=32)`; _el.classList.remove('animating'); } }
    { const _el = safeGetElement('charDetailName'); if(_el) _el.textContent = char.name.toUpperCase(); }
    { const _el = safeGetElement('charPower'); if(_el) _el.textContent = char.power; }
    { const _el = safeGetElement('charSpeed'); if(_el) _el.textContent = char.speed; }
    { const _el = safeGetElement('charControl'); if(_el) _el.textContent = char.control; }
    // Trigger character intro animation + quip
    if (typeof showCharacterIntro === 'function') showCharacterIntro(char);
}

function confirmCharacter(){
    if (typeof hideCharacterIntro === 'function') hideCharacterIntro();
    updateSprites();
    closeCharSelect();
    toast(`${selectedChar.name} selected!`);
}

function tryUnlock(id){
    var char = window.CHARACTERS.find(function(c) { return c.id === id; });
    if(G.coins >= char.cost){
        G.coins -= char.cost;
        char.unlocked = true;
        G.unlockedChars = G.unlockedChars || [];
        G.unlockedChars.push(id);
        save();
        updateUI();
        renderCharGrid();
        selectCharacter(char);
        toast(`${char.name} unlocked!`);
    } else {
        toast('Not enough coins!');
    }
}

function switchTab(cat, btn){
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderShop(cat);
}

function renderShop(cat){
    const c = safeGetElement('shopItems');
    c.innerHTML = '';

    const items = SHOP[cat] || [];

    items.forEach(item => {
        const owned = G.owned.includes(item.id);
        const equipped = Object.values(G.equipment).includes(item.id);
        const canBuy = (item.currency === 'gems' ? G.gems : G.coins) >= item.price;
        const isTraining = cat === 'training' || (cat === 'serve' && item.repeatable);
        const isServeEquip = cat === 'serve' && !item.repeatable;

        let statsHTML = '';
        if(item.stats.skillPoints) statsHTML += `<span class="item-stat">+${item.stats.skillPoints} Skill</span>`;
        if(item.stats.power) statsHTML += `<span class="item-stat">+${item.stats.power} PWR</span>`;
        if(item.stats.speed) statsHTML += `<span class="item-stat">+${item.stats.speed} SPD</span>`;
        if(item.stats.control) statsHTML += `<span class="item-stat">+${item.stats.control} CTL</span>`;
        if(item.stats.serve) statsHTML += `<span class="item-stat">+${item.stats.serve} SRV</span>`;
        if(item.stats.bonus) statsHTML += `<span class="item-stat">${item.stats.bonus}</span>`;

        const d = document.createElement('div');
        d.className = 'shop-item' + (owned && !isTraining ? ' owned' : '');

        let purchaseHTML;
        if(isTraining){
            purchaseHTML = `
                <div class="price-tag">${item.currency === 'gems' ? 'G ' : 'C '}${item.price}</div>
                <button class="buy-btn" ${canBuy ? `onclick="buyItem('${cat}','${item.id}')"` : 'disabled'}>
                    ${item.repeatable ? 'START' : 'BUY'}
                </button>`;
        } else if(!owned){
            purchaseHTML = `
                <div class="price-tag">${item.currency === 'gems' ? 'G ' : 'C '}${item.price}</div>
                <button class="buy-btn" ${canBuy ? `onclick="buyItem('${cat}','${item.id}')"` : 'disabled'}>BUY</button>`;
        } else if(equipped){
            purchaseHTML = '<div class="equipped-badge">EQUIPPED</div>';
        } else {
            purchaseHTML = `<button class="equip-btn" onclick="equipItem('${cat}','${item.id}')">EQUIP</button>`;
        }

        d.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-stats">${statsHTML}</div>
            </div>
            <div class="item-purchase">${purchaseHTML}</div>`;
        c.appendChild(d);
    });
}

function buyItem(cat, id){
    const item = SHOP[cat]?.find(i => i.id === id);
    if(!item) return;

    const curr = item.currency === 'gems' ? 'gems' : 'coins';
    if(G[curr] < item.price) return;

    G[curr] -= item.price;

    if(item.repeatable){
        // Training-style items
        if(item.stats.skillPoints){
            const oldNTRP = getNTRP();
            G.skillPoints += item.stats.skillPoints;
            const newNTRP = getNTRP();
            if(newNTRP > oldNTRP){
                toast(`NTRP UPGRADED to ${newNTRP.toFixed(1)}!`);
                sounds.point();
            }
        }
        if(item.stats.power) G.stats.power += item.stats.power;
        if(item.stats.speed) G.stats.speed += item.stats.speed;
        if(item.stats.control) G.stats.control += item.stats.control;
        if(item.stats.serve) G.stats.serve += item.stats.serve;
        G.trainingCompleted.push(id);
        toast(item.name + ' completed!');
    } else {
        // Equipment items
        G.owned.push(id);

        // Auto-equip if slot is empty
        let slot = cat.slice(0, -1); // 'rackets' -> 'racket'
        if(cat === 'serve') slot = 'serveGear';
        if(cat === 'special') slot = 'special';

        if(!G.equipment[slot]) G.equipment[slot] = id;
        toast(item.name + ' purchased!');
    }

    save();
    renderShop(cat);
    updateUI();
}

function equipItem(cat, id){
    let slot = cat.slice(0, -1);
    if(cat === 'serve') slot = 'serveGear';
    G.equipment[slot] = id;
    save();
    renderShop(cat);
    toast('Equipped!');
}

function showTutorial(){
    safeGetElement('tutorialOverlay')?.classList.add('active');
}

function closeTutorial(){
    safeGetElement('tutorialOverlay')?.classList.remove('active');
}

function toast(msg){
    const t = safeGetElement('progressToast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ========== VIDEO & MATCH START ==========

let ytPlayer;

function onYouTubeIframeAPIReady(){
    ytPlayer = new YT.Player('videoPlayer', {
        height: '100%',
        width: '100%',
        videoId: 'dy1tT2lsISs',
        playerVars: {autoplay:0, controls:0, modestbranding:1, rel:0, showinfo:0, fs:0, playsinline:1},
        events: {onStateChange: onPlayerStateChange}
    });
}

function onPlayerStateChange(event){
    if(event.data === YT.PlayerState.ENDED) transitionToCourt();
}

let gamePaused = false;
function pauseMatch() {
    if (!M || !M.active || gamePaused) return;
    gamePaused = true;
    M.active = false;
    document.getElementById('pauseOverlay').style.display = 'flex';
}
function resumeMatch() {
    if (!gamePaused) return;
    gamePaused = false;
    M.active = true;
    document.getElementById('pauseOverlay').style.display = 'none';
    if (M.time > 0) startTimer();
}
function forfeitMatch() {
    gamePaused = false;
    document.getElementById('pauseOverlay').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'none';
    M.active = false;
    // Go straight to results as a loss
    endMatch();
}

function transitionToCourt(){
    if(videoTimeout) { clearTimeout(videoTimeout); videoTimeout = null; }
    if(ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
    const videoIntro = safeGetElement('videoIntro');
    videoIntro.classList.add('fade-out');
    setTimeout(() => {
        videoIntro.classList.remove('active', 'fade-out');
        actuallyStartMatch();
    }, 500);
}

function actuallyStartMatch(){
    const s = DIFF[G.difficulty];

    // Select random opponent (different from player)
    selectRandomOpponent();
    updateSprites();

    // Adjust time based on match type
    let matchTime = s.time;
    if(G.matchType === 'quick') matchTime = 180;  // 3 minutes for quick match
    else if(G.matchType === 'timed') matchTime = 300; // 5 minutes for timed

    // Randomly decide who serves first
    const playerServesFirst = Math.random() < 0.5;

    M = {
        active: true,
        startTime: Date.now(), // Track match start for duration calculation
        pPoints: 0, oPoints: 0,
        pGames: 0, oGames: 0,
        pSets: 0, oSets: 0,
        time: matchTime,
        matchLimit: G.matchType === 'timed' ? matchTime : null,
        timeExpired: false,
        isTiebreak: false,
        tiebreakServer: 'player',
        servingPlayer: playerServesFirst ? 'player' : 'opp',
        serveNum: 1,
        serveSide: 'deuce',
        isPlayerServe: false,
        servePhase: 'none',
        servePower: 0,
        serveAimX: 50,
        serveAimY: 25,
        serveStartY: null,
        serveStartX: null,
        lastServeSpeed: 0,
        rally: 0,
        ballActive: false,
        ballPos: {x:50, y:10},
        ballVel: {x:0, y:0, z:0},
        ballH: 100,
        ballBounces: 0,
        ballSpin: 0,
        lastHitBy: 'player', // Track who hit the ball last ('player' or 'opp')
        canHit: false,
        combo: 0,
        pendingCombo: false,  // Don't show combo until shot is confirmed successful
        streak: 0,
        bestStreak: 0,
        oppPos: 50,
        playerPos: 70,
        gemActive: false,
        gemPos: {x:50, y:70},
        gemTimer: 0,
        gemMultiplier: 1,
        aces: 0,
        doubleFaults: 0,
        winners: 0,
        longestRally: 0,
        totalRallies: 0,
        pointsPlayed: 0,
        pendingAce: false,
        lostServiceGame: false,
        wasDown03: false,
        bestStreak: 0,
        playerY: 95,
        atNet: false,
        netRushTimer: 0,
        oppAtNet: false,
        oppY: 8,
        settings: s
    };

    initSprites();

    safeGetElement('gameHUD')?.classList.add('active');
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.style.display = 'flex';
    safeGetElement('gameCourt')?.classList.add('active');
    { const _el = safeGetElement('playerPaddle'); if(_el) _el.style.left = '70%'; }
    safeGetElement('streakDisplay')?.classList.remove('active');
    // Show hit zone indicators on mobile/touch devices
    if('ontouchstart' in window) safeGetElement('hitZoneIndicators')?.classList.add('visible');

    updateMatchUI();
    startTimer();

    // Auto-show tutorial for first-time players
    if(!G.hasPlayedBefore){
        G.hasPlayedBefore = true;
        save();
        showTutorial();
        // Delay first point until tutorial is dismissed
        const waitForTutorial = setInterval(() => {
            const tut = safeGetElement('tutorialOverlay');
            if(!tut || !tut.classList.contains('active')){
                clearInterval(waitForTutorial);
                showFirstMatchHints();
                setTimeout(startNextPoint, 1200);
            }
        }, 200);
    } else {
        setTimeout(startNextPoint, 1200);
    }
}

// Show contextual hints during the first few points of a match
function showFirstMatchHints(){
    if((G.careerStats?.matchesPlayed || 0) > 2) return; // Only show for first 3 matches
    M._hintShown = 0;
    M._hintInterval = setInterval(() => {
        if(!M.active || M._hintShown >= 3){ clearInterval(M._hintInterval); return; }
        const hints = [
            'SWIPE UP to return the ball!',
            'Aim your swipe LEFT or RIGHT!',
            'DOUBLE-TAP to rush the net!'
        ];
        if(M._hintShown < hints.length && M.rally === 0 && !M.isPlayerServe){
            toast(hints[M._hintShown]);
            M._hintShown++;
        }
    }, 12000);
}

let _nextPointTimer = null;
function startNextPoint(){
    if(!M.active) return;
    // Prevent double-fire from multiple setTimeout calls
    if(_nextPointTimer) { clearTimeout(_nextPointTimer); _nextPointTimer = null; }
    if(M._startingPoint) return;
    M._startingPoint = true;
    setTimeout(() => { M._startingPoint = false; }, 500);

    resetPlayerToBaseline();
    resetOppFromNet();

    M.serveNum = 1;
    M.serveSide = getServeSide();
    M.rally = 0;
    M.canHit = false;

    // Reset rally tension visuals
    const vignette = safeGetElement('rallyVignette');
    if(vignette) { vignette.classList.remove('active'); vignette.style.opacity = '0'; }
    const court = safeGetElement('gameCourt');
    if(court) { court.style.transform = ''; court.style.transition = ''; }

    // Clear serve speed display
    { const _el = safeGetElement('serveSpeed'); if(_el) _el.textContent = ''; }

    // In tiebreak, recalculate server each point
    if(M.isTiebreak){
        M.servingPlayer = getTiebreakServer();
    }

    updateMatchUI();

    if(M.servingPlayer === 'player'){
        startPlayerServe();
    } else {
        opponentServe();
    }
}

let videoTimeout = null;

function validateCriticalState() {
    const issues = [];

    if (!M) issues.push('Match object missing');
    if (!G) issues.push('Game state missing');
    if (!SPRITES) issues.push('Sprites missing');
    if (!selectedChar) issues.push('Selected character missing');

    if (issues.length > 0) {
        console.error('ERROR: Critical state validation failed:', issues);
        return false;
    }

    return true;
}


function startMatch(){
    if (!validateCriticalState()) { console.error("Invalid state for startMatch"); return; }
    try {
    safeGetElement('mainMenu')?.classList.remove('active');
    safeGetElement('charSelect')?.classList.remove('active');
    safeGetElement('shopScreen')?.classList.remove('active');
    safeGetElement('videoIntro')?.classList.add('active');

    // Auto-skip after 8 seconds if video fails
    if(videoTimeout) clearTimeout(videoTimeout);
    videoTimeout = setTimeout(() => {
        if(safeGetElement('videoIntro')?.classList.contains('active')) {
            transitionToCourt();
        }
    }, 8000);

    if(ytPlayer && ytPlayer.playVideo){
        ytPlayer.seekTo(0);
        ytPlayer.playVideo();
    } else {
        setTimeout(() => {
            if(ytPlayer && ytPlayer.playVideo){
                ytPlayer.seekTo(0);
                ytPlayer.playVideo();
            }
        }, 1000);
    }
    } catch (error) {
        ErrorRecovery.handleCriticalError(error, 'startMatch');
    }
}

function startTimer(){
    // Timer counts up, but timed matches use a limit
    M.time = 0;
    const timerEl = safeGetElement('matchTimer');
    if(!timerEl) return;
    const isTimed = G.matchType === 'timed' && M.matchLimit;
    const renderTime = (seconds) => {
        const safeSeconds = Math.max(0, seconds);
        timerEl.textContent = Math.floor(safeSeconds / 60) + ':' + (safeSeconds % 60).toString().padStart(2, '0');
    };
    renderTime(isTimed ? M.matchLimit : 0);

    const int = setInterval(() => {
        if(!M.active){
            clearInterval(int);
            return;
        }
        M.time++;
        renderTime(isTimed ? (M.matchLimit - M.time) : M.time);

        if(isTimed && M.time >= M.matchLimit){
            clearInterval(int);
            handleTimeExpired();
        }
    }, 1000);
}

function handleTimeExpired(){
    if(!M.active || G.matchType !== 'timed') return;
    const gameDiff = M.pGames - M.oGames;
    const pointDiff = M.pPoints - M.oPoints;

    if(gameDiff !== 0 || pointDiff !== 0){
        endTimedMatch();
        return;
    }

    M.timeExpired = true;
    toast('TIME! NEXT POINT WINS');
}

function endTimedMatch(){
    if(!M.active) return;
    const gameDiff = M.pGames - M.oGames;
    const pointDiff = M.pPoints - M.oPoints;
    const playerWins = gameDiff > 0 || (gameDiff === 0 && pointDiff > 0);

    M.pSets = playerWins ? 1 : 0;
    M.oSets = playerWins ? 0 : 1;
    endMatch();
}

// ========== SCORING ==========

function getTennisScore(pPoints, oPoints){
    // Tiebreak uses simple numbers
    if(M.isTiebreak){
        return {p: String(pPoints), o: String(oPoints), tiebreak: true};
    }

    const scores = ['LOVE','15','30','40'];

    // Both under 4 points - normal scoring
    if(pPoints < 4 && oPoints < 4){
        return {p: scores[pPoints], o: scores[oPoints]};
    }

    // Deuce situation
    if(pPoints === oPoints){
        return {p:'40', o:'40', deuce:true};
    }

    // Advantage
    if(pPoints > oPoints){
        return {p:'AD', o:'40'};
    }
    return {p:'40', o:'AD'};
}

function updateMatchUI(){
    if (!validateCriticalState()) { console.error("Invalid state for updateMatchUI"); return; }
    const score = getTennisScore(M.pPoints, M.oPoints);

    { const _el = safeGetElement('playerPoints'); if(_el) _el.textContent = score.p; }
    { const _el = safeGetElement('opponentPoints'); if(_el) _el.textContent = score.o; }
    { const _el = safeGetElement('playerGames'); if(_el) _el.textContent = M.pGames; }
    { const _el = safeGetElement('opponentGames'); if(_el) _el.textContent = M.oGames; }
    { const _el = safeGetElement('rallyCount'); if(_el) _el.textContent = M.rally; }

    // Show sets if any
    if(M.pSets > 0 || M.oSets > 0){
        { const _el = safeGetElement('playerSets'); if(_el) _el.textContent = `Sets: ${M.pSets}`; }
        { const _el = safeGetElement('opponentSets'); if(_el) _el.textContent = `Sets: ${M.oSets}`; }
    }

    // Show tiebreak/deuce indicator
    const tbInd = safeGetElement('tiebreakIndicator');
    const score2 = getTennisScore(M.pPoints, M.oPoints);
    if(M.isTiebreak){
        tbInd.textContent = 'TIEBREAK';
    } else if(score2.deuce){
        tbInd.textContent = 'DEUCE';
    } else if(score2.p === 'AD' || score2.o === 'AD'){
        tbInd.textContent = score2.p === 'AD' ? 'YOUR ADVANTAGE' : 'OPP ADVANTAGE';
    } else {
        tbInd.textContent = '';
    }

    updateServeIndicator();
}

function celebratePoint(isAce){
    // Screen flash
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:'+(isAce?'rgba(255,215,0,0.35)':'rgba(76,255,80,0.25)')+';pointer-events:none;z-index:999;animation:flashFade 0.3s ease-out forwards;';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
    // Haptic feedback
    if(navigator.vibrate) navigator.vibrate(isAce ? [50,30,50] : 40);
}

function scorePoint(player){
    // Point celebration effects
    if(player === 'p'){
        sounds.pointWon();
        // Flash effect for player point
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:rgba(76,255,80,0.3);z-index:1000;pointer-events:none;animation:flashFade 0.4s ease-out';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
        // Enhanced haptic feedback
        if(navigator.vibrate) navigator.vibrate([80, 50, 80]);
    } else {
        sounds.pointLost();
        // Flash effect for opponent point
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:rgba(244,67,54,0.3);z-index:1000;pointer-events:none;animation:flashFade 0.4s ease-out';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
        // Gentle haptic feedback
        if(navigator.vibrate) navigator.vibrate(60);
    }

    // Track statistics
    M.pointsPlayed++;
    M.totalRallies += M.rally;
    if(M.rally > M.longestRally) M.longestRally = M.rally;

    if(player === 'p'){
        M.pPoints++;
        celebratePoint(false);
    } else {
        M.oPoints++;
        M.streak = 0;
        updateMatchStreakDisplay();
    }

    const diff = M.pPoints - M.oPoints;

    // Tiebreak scoring: first to 7, win by 2
    if(M.isTiebreak){
        if((M.pPoints >= 7 || M.oPoints >= 7) && Math.abs(diff) >= 2){
            // Tiebreak won!
            if(M.pPoints > M.oPoints){
                M.pGames++;
                M.pSets++;
                toast('TIEBREAK WON! You take the set!');
            } else {
                M.oGames++;
                M.oSets++;
                toast('TIEBREAK LOST! Opponent takes the set');
            }

            // Reset for new set
            M.pPoints = 0;
            M.oPoints = 0;
            M.pGames = 0;
            M.oGames = 0;
            M.isTiebreak = false;
            M.serveNum = 1;

            // Whoever received in tiebreak serves first next set
            M.servingPlayer = M.tiebreakServer === 'player' ? 'opp' : 'player';

            sounds.point();
            updateMatchUI();
            if(checkEnd()) return true;
            return false;
        }

        // In tiebreak, server changes after first point, then every 2 points
        M.servingPlayer = getTiebreakServer();
        M.serveNum = 1;

        // Tiebreak changeover every 6 points (proper tennis rules)
        if(shouldTiebreakChangeover()){
            setTimeout(async () => {
                await showCourtChange('CHANGEOVER', `TB: ${M.pPoints}-${M.oPoints}`);
                startNextPoint();
            }, 500);
            updateMatchUI();
            return true;
        }

        updateMatchUI();
        return false;
    }

    // Regular game scoring: need to be at 4+ and 2 ahead
    if((M.pPoints >= 4 || M.oPoints >= 4) && Math.abs(diff) >= 2){
        if(M.pPoints > M.oPoints){
            M.pGames++;
            toast('GAME! You won the game!');
        } else {
            M.oGames++;
            toast('GAME! Opponent won');
            // Track if player lost their own service game
            if(M.servingPlayer === 'player') M.lostServiceGame = true;
        }

        // Track comeback (was down 0-3)
        if(M.pGames === 0 && M.oGames >= 3) M.wasDown03 = true;

        // Track best streak
        if(M.streak > (M.bestStreak || 0)) M.bestStreak = M.streak;

        M.pPoints = 0;
        M.oPoints = 0;

        // Switch server after each game
        M.servingPlayer = M.servingPlayer === 'player' ? 'opp' : 'player';
        M.serveNum = 1;

        sounds.point();

        // Check for set/match win
        if(checkSetWin()){
            return true;
        }

        // Changeover after odd games
        if(shouldChangeover()){
            setTimeout(async () => {
                await showCourtChange('CHANGEOVER', `${M.pGames}-${M.oGames}`);
                startNextPoint();
            }, 500);
            updateMatchUI();
            return true; // Prevent normal startNextPoint
        }
    }

    updateMatchUI();

    if(G.matchType === 'timed' && M.timeExpired){
        endTimedMatch();
        return true;
    }

    if(checkEnd()) return true;
    return false;
}

function checkSetWin(){
    // Quick mode: no sets, checkEnd handles it directly
    if(G.matchType === 'quick') return checkEnd();

    const pGames = M.pGames;
    const oGames = M.oGames;
    const diff = Math.abs(pGames - oGames);

    // Game target depends on match type
    const winGames = 6;

    // Set win: reach target games with 2 game lead
    if((pGames >= winGames || oGames >= winGames) && diff >= 2 && !M.isTiebreak){
        const playerWonSet = pGames > oGames;
        if(playerWonSet){
            M.pSets++;
        } else {
            M.oSets++;
        }
        const setScore = `${pGames}-${oGames}`;
        M.pGames = 0;
        M.oGames = 0;
        M.isTiebreak = false;

        // Check if match is over before showing changeover
        if(checkEnd()) return true;

        // Show set changeover with score
        setTimeout(async () => {
            await showCourtChange(playerWonSet ? 'SET WON!' : 'SET LOST', `Set: ${setScore}`);
            startNextPoint();
        }, 500);
        updateMatchUI();
        return true; // Prevent normal startNextPoint
    }

    // Tiebreak at 6-6
    if(pGames === winGames && oGames === winGames && !M.isTiebreak){
        M.isTiebreak = true;
        M.tiebreakServer = M.servingPlayer;
        M.pPoints = 0;
        M.oPoints = 0;
        toast('TIEBREAK! First to 7 (win by 2)');
        sounds.point();
        return false;
    }

    return false;
}

// ========== BALL PHYSICS ==========

function animateBall(){
    if(!M.ballActive) return;
    if(window.animationPaused){
        requestAnimationFrame(animateBall);
        return;
    }

    // Enhanced physics with momentum conservation
    const speed = Math.sqrt(M.ballVel.x*M.ballVel.x + M.ballVel.y*M.ballVel.y);
    const isHighSpeed = speed > 1.5;

    M.ballPos.x += M.ballVel.x;
    M.ballPos.y += M.ballVel.y;
    M.ballH += M.ballVel.z;

    // Enhanced gravity with speed-dependent effect
    const gravity = 0.15 + (isHighSpeed ? 0.03 : 0);
    M.ballVel.z -= gravity;

    // Enhanced spin physics with Magnus effect
    if(Math.abs(M.ballSpin) > 0.1){
        M.ballVel.x += M.ballSpin * 0.025;
        // Spin decay
        M.ballSpin *= 0.998;
    }

    // Air resistance for realistic deceleration
    const resistance = 0.998;
    M.ballVel.x *= resistance;
    M.ballVel.y *= resistance;

    // Visual speed indicator
    const ball = safeGetElement('ball');
    if(ball) ball.classList.toggle('fast', isHighSpeed);

    // NET COLLISION CHECK: ball must have sufficient height to cross the net (y ~50-54%)
    const prevY = M.ballPos.y - M.ballVel.y;
    const netY = 52; // net position
    const crossingNet = (prevY < netY && M.ballPos.y >= netY) || (prevY > netY && M.ballPos.y <= netY);
    if(crossingNet && M.ballH < 8){
        // Ball hit the net
        M.ballActive = false;
        M.canHit = false;
        resetBallUI();
        sounds.let();
        showNetCordEffect();
        if(M.lastHitBy === 'player'){
            showCallOverlay('NET!', false);
            M.streak = 0;
            updateMatchStreakDisplay();
            if(!scorePoint('o')) setTimeout(startNextPoint, 1200);
        } else {
            showCallOverlay('NET!', true);
            M.streak++;
            updateMatchStreakDisplay();
            if(!scorePoint('p')) setTimeout(startNextPoint, 1200);
        }
        return;
    }

    // Enhanced ground bounce with energy transfer
    if(M.ballH <= 0 && M.ballVel.z < 0){
        M.ballH = 0;

        // Bounce intensity based on impact velocity
        const impactIntensity = Math.abs(M.ballVel.z);
        const bounceEfficiency = 0.72 + (impactIntensity > 2 ? 0.08 : 0); // Higher bounces on hard hits

        M.ballVel.z = -M.ballVel.z * bounceEfficiency;

        // Lateral bounce effects from spin
        if(Math.abs(M.ballSpin) > 0.1){
            M.ballVel.x += M.ballSpin * 0.15; // Spin kick on bounce
        }

        // Enhanced sound based on impact
        if(impactIntensity > 2.5){
            sounds.powerBounce();
        } else if(impactIntensity > 1.5){
            sounds.bounce();
        } else {
            sounds.softBounce();
        }

        // Satisfying screen micro-shake on hard bounces
        if(impactIntensity > 2.8){
            microShake(50);
        }

        if(M.ballPos.y > 50) M.ballBounces++;

        // Double bounce = point lost
        if(M.ballBounces > 1){
            ballMissed();
            return;
        }
    }

    // Out of bounds (sidelines) - whoever hit it last loses the point
    if(M.ballPos.x < 10 || M.ballPos.x > 90){
        M.ballActive = false;
        M.canHit = false;
        resetBallUI();
        sounds.miss();

        if(M.lastHitBy === 'player'){
            // Player hit it out - opponent gets point
            showCallOverlay('OUT!', false);
            M.streak = 0;
            updateMatchStreakDisplay();
            if(!scorePoint('o')) setTimeout(startNextPoint, 1200);
        } else {
            // Opponent hit it out - player gets point
            showCallOverlay('OUT!', true);
            M.streak++;
            updateMatchStreakDisplay();
            if(!scorePoint('p')) setTimeout(startNextPoint, 1200);
        }
        return;
    }

    const shadow = safeGetElement('ballShadow');
    if(ball) {
        ball.style.left = M.ballPos.x + '%';
        ball.style.top = (M.ballPos.y - M.ballH/10) + '%';
    }
    if(shadow) {
        shadow.style.left = M.ballPos.x + '%';
        shadow.style.top = M.ballPos.y + '%';
    }

    // Check if ball is in player's hit zone (adjusted for net position)
    const st = getStats();
    const playerHitY = M.atNet ? M.playerY : 95;
    const hzSize = M.atNet ? 12 : (M.settings.hitWindow * 100 + st.control * 0.12);
    const hzStart = Math.max(52, playerHitY - hzSize);
    const hzEnd = M.atNet ? (playerHitY + 5) : 90;

    if(M.ballPos.y > hzStart && M.ballPos.y < hzEnd && M.ballH < 50 && M.ballBounces <= (M.atNet ? 0 : 1) && !M.canHit){
        M.canHit = true;
        ball.classList.add('glowing');
        safeGetElement('hitZone')?.classList.add('active');
        safeGetElement('hitZoneIndicators')?.classList.add('active');

        const hint = safeGetElement('swipeHint');
        hint.textContent = 'SWIPE UP!';
        hint.classList.remove('serve');
        hint.classList.add('active');

        safeGetElement('playerPaddle')?.classList.add('can-hit');
    }

    // Ball passed hit zone
    if(M.canHit && (M.ballH > 50 || M.ballBounces > 1)){
        M.canHit = false;
        ball.classList.remove('glowing');
        safeGetElement('hitZone')?.classList.remove('active');
        safeGetElement('hitZoneIndicators')?.classList.remove('active');
        safeGetElement('swipeHint')?.classList.remove('active');
        safeGetElement('playerPaddle')?.classList.remove('can-hit');
    }

    // Ball passed player - missed (adjusted for net position)
    const passedY = M.atNet ? (M.playerY + 8) : 93;
    if(M.ballPos.y > passedY){
        ballMissed();
        return;
    }

    // Update opponent position when ball is on their side
    if(M.ballPos.y < 50) updateOpp();

    updatePlayerDirection();
    requestAnimationFrame(animateBall);
}

function updateOpp(){
    const diff = M.ballPos.x - M.oppPos;
    // At net: reduced lateral coverage
    const effSpeed = M.oppAtNet ? M.settings.oppSpeed * 0.7 : M.settings.oppSpeed;
    const moving = Math.abs(diff) > 2;
    setOppRunning(moving);
    M.oppPos += diff * effSpeed;
    const oppEl = safeGetElement('opponent');
    if(oppEl){
        oppEl.style.left = M.oppPos + '%';
        // Anticipation lean: opponent leans toward movement direction
        oppEl.classList.remove('lean-left','lean-right');
        if(Math.abs(diff) > 8){
            oppEl.classList.add(diff < 0 ? 'lean-left' : 'lean-right');
        }
    }
}

function ballMissed(){
    M.ballActive = false;
    M.canHit = false;
    resetBallUI();
    M.combo = 0;
    M.pendingCombo = false;
    M.rally = 0;
    sounds.miss();

    // Reset rally tension visuals
    const vignette = safeGetElement('rallyVignette');
    if(vignette) { vignette.classList.remove('active'); vignette.style.opacity = '0'; }
    const court = safeGetElement('gameCourt');
    if(court) { court.style.transform = ''; court.style.transition = ''; }

    M.streak = 0;
    updateMatchStreakDisplay();

    if(!scorePoint('o')) setTimeout(startNextPoint, 1200);
}

function resetBallUI(){
    const ball = safeGetElement('ball');
    const shadow = safeGetElement('ballShadow');
    ball.classList.remove('active', 'glowing', 'toss');
    shadow.classList.remove('active');
    safeGetElement('hitZone')?.classList.remove('active');
        safeGetElement('hitZoneIndicators')?.classList.remove('active');
    safeGetElement('swipeHint')?.classList.remove('active', 'serve');
    safeGetElement('playerPaddle')?.classList.remove('can-hit', 'serving');
    safeGetElement('serveTiming')?.classList.remove('active');
    safeGetElement('servePower')?.classList.remove('active');
    safeGetElement('serveTossBall')?.classList.remove('active');
    safeGetElement('serveAim')?.classList.remove('active');
    safeGetElement('serveTargetLine')?.classList.remove('active');
    clearServiceBoxHighlight();
    ballTrailPositions = [];
    ballTrailElements.forEach(el => el.style.display = 'none');
}

// ========== HITTING ==========

function hitBall(power, angle){
    if(!M.canHit) return;

    M.lastHitBy = 'player'; // Track who hit last
    M.canHit = false;
    const ball = safeGetElement('ball');
    ball.classList.remove('glowing');
    safeGetElement('hitZone')?.classList.remove('active');
        safeGetElement('hitZoneIndicators')?.classList.remove('active');
    safeGetElement('swipeHint')?.classList.remove('active');
    safeGetElement('playerPaddle')?.classList.remove('can-hit');

    // Show power feedback
    const pf = safeGetElement('powerFill');
    pf.style.width = (power * 100) + '%';
    setTimeout(() => pf.style.width = '0%', 400);

    const st = getStats();
    const dist = Math.abs(M.ballPos.x - M.playerPos);
    // At net: tighter reach but higher base quality for volleys
    const reachDiv = M.atNet ? 35 : 50;
    const acc = Math.max(0, 1 - dist/reachDiv);
    const volleyBonus = M.atNet ? 1.25 : 1;
    const qual = power * acc * (1 + st.control/100) * volleyBonus;

    showHitEffect(power);

    // Enhanced player swing animation
    setPlayerSwinging();

    sounds.hit();

    // Track quality but don't show combo yet - wait until we confirm shot was successful
    if(qual > 0.55){
        M.combo++;
        M.pendingCombo = true;  // Will show combo when opponent fails to return or scrambles
    } else {
        M.combo = 0;
        M.pendingCombo = false;
    }

    returnBall(qual, angle);
}

// ========== VISUAL EFFECTS SYSTEM ==========

function microShake(duration = 100) {
    const court = safeGetElement('gameCourt');
    if(!court) return;
    court.classList.remove('micro-shake');
    void court.offsetWidth;
    court.classList.add('micro-shake');
    setTimeout(() => court.classList.remove('micro-shake'), duration);
}

function powerShake(duration = 200) {
    const court = safeGetElement('gameCourt');
    if(!court) return;
    court.classList.remove('power-shake', 'shake');
    void court.offsetWidth;
    court.classList.add('power-shake');
    setTimeout(() => court.classList.remove('power-shake'), duration);
}

// Hitstop effect - brief frame freeze (2-3 frames ~33-50ms) for powerful hits
function hitstop(duration = 50) {
    const court = safeGetElement('gameCourt');
    if(!court) return;

    // Frame freeze: pause all animation for 2-3 frames
    if(M.ballActive && window.animationPaused !== true) {
        window.animationPaused = true;

        // Flash + contrast boost during freeze
        court.style.filter = 'brightness(1.4) contrast(1.2) saturate(1.3)';
        court.style.transform = 'scale(1.008)';

        // Brief time-dilated unfreeze
        setTimeout(() => {
            court.style.filter = 'brightness(1.15)';
            court.style.transform = '';
        }, duration * 0.6);

        setTimeout(() => {
            window.animationPaused = false;
            court.style.filter = '';
        }, duration);
    }
}

// Enhanced ball trail system - pooled to avoid DOM thrashing
let ballTrailPositions = [];
let ballTrailElements = [];
const MAX_TRAIL_ELEMENTS = 6;

function initBallTrailPool() {
    const court = getCourtElement();
    if(!court || ballTrailElements.length > 0) return;
    for(let i = 0; i < MAX_TRAIL_ELEMENTS; i++) {
        const trail = document.createElement('div');
        trail.className = 'ball-trail';
        trail.style.display = 'none';
        court.appendChild(trail);
        ballTrailElements.push(trail);
    }
}

let trailFrameSkip = 0;
function createBallTrail() {
    if(!M.ballActive || window.animationPaused) return;
    if(isPerformanceMode()) return;

    // Update every 2nd frame for smoother trail
    if(++trailFrameSkip % 2 !== 0) return;

    if(ballTrailElements.length === 0) initBallTrailPool();

    const ball = safeGetElement('ball');
    if(!ball || !ball.classList.contains('active')) return;

    const ballRect = ball.getBoundingClientRect();
    const court = getCourtElement();
    if(!court) return;
    const courtRect = court.getBoundingClientRect();

    const relX = ((ballRect.left + ballRect.width/2 - courtRect.left) / courtRect.width) * 100;
    const relY = ((ballRect.top + ballRect.height/2 - courtRect.top) / courtRect.height) * 100;

    // Detect ball speed for trail intensity
    const speed = M.ballVel ? Math.sqrt(M.ballVel.x*M.ballVel.x + M.ballVel.y*M.ballVel.y) : 0;
    const isPowerShot = speed > 1.5;

    ballTrailPositions.push({x: relX, y: relY, time: Date.now(), power: isPowerShot});
    if(ballTrailPositions.length > MAX_TRAIL_ELEMENTS) ballTrailPositions.shift();

    const now = Date.now();
    const trailDuration = isPowerShot ? 400 : 300;
    for(let i = 0; i < MAX_TRAIL_ELEMENTS; i++) {
        const el = ballTrailElements[i];
        const pos = ballTrailPositions[ballTrailPositions.length - 1 - i];
        if(!pos || now - pos.time > trailDuration) {
            el.style.display = 'none';
            continue;
        }
        const age = now - pos.time;
        const progress = 1 - age / trailDuration;
        el.style.display = 'block';
        el.style.left = pos.x + '%';
        el.style.top = pos.y + '%';
        el.style.opacity = progress * (isPowerShot ? 0.8 : 0.5);
        el.style.width = el.style.height = (isPowerShot ? 14 - i * 1.5 : 10 - i) + 'px';
        // Add power class for hot trail
        if(pos.power) { el.classList.add('power'); } else { el.classList.remove('power'); }
    }
}

// Swipe trail visualization - shows curved swipe path with gradient
function createSwipeTrail(startX, startY, endX, endY) {
    if(isPerformanceMode()) return;
    const court = getCourtElement();
    if(!court) return;
    const courtRect = court.getBoundingClientRect();

    const startRelX = ((startX - courtRect.left) / courtRect.width) * 100;
    const startRelY = ((startY - courtRect.top) / courtRect.height) * 100;
    const endRelX = ((endX - courtRect.left) / courtRect.width) * 100;
    const endRelY = ((endY - courtRect.top) / courtRect.height) * 100;

    // Calculate swipe power for visual intensity
    const swipeDist = Math.sqrt((endX - startX)**2 + (endY - startY)**2);
    const isPowerSwipe = swipeDist > 150;

    const container = document.createElement('div');
    container.className = 'swipe-trail active';
    container.style.position = 'absolute';
    container.style.inset = '0';

    const segments = 16;
    for(let i = 0; i < segments; i++) {
        const progress = i / (segments - 1);
        const x = startRelX + (endRelX - startRelX) * progress;
        const y = startRelY + (endRelY - startRelY) * progress;

        const segment = document.createElement('div');
        segment.className = 'swipe-trail-segment';
        segment.style.left = x + '%';
        segment.style.top = y + '%';

        // Size tapers from thick to thin along swipe
        const size = isPowerSwipe ? (12 - progress * 8) : (8 - progress * 5);
        segment.style.width = size + 'px';
        segment.style.height = size + 'px';

        // Color shifts from green to white along swipe
        const r = Math.floor(76 + progress * 179);
        const g = Math.floor(255 - progress * 55);
        const b = Math.floor(80 + progress * 175);
        segment.style.background = `rgba(${r},${g},${b},${1 - progress * 0.6})`;

        if(isPowerSwipe) {
            segment.style.boxShadow = `0 0 ${6 - progress * 4}px rgba(255,255,100,${0.5 - progress * 0.4})`;
        }

        container.appendChild(segment);
    }

    court.appendChild(container);
    setTimeout(() => container.remove(), 600);
}

function createHitParticles(x, y, power) {
    if(isPerformanceMode()) return;
    const court = getCourtElement();
    if(!court) return;

    const particleCount = Math.floor(3 + power * 8);
    const colors = power > 0.8 ? ['#FFD700', '#FF6B47', '#FF4757'] : ['#4ECDC4', '#45AAF2', '#26DE81'];

    for(let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 20 + power * 40;
        const size = 3 + Math.floor(Math.random() * 4);

        particle.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 200;
            transform: translate(-50%, -50%);
        `;

        court.appendChild(particle);

        // Animate particle
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], {
            duration: 400 + Math.floor(Math.random() * 200),
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
    }
}

function showHitEffect(power){
    const e = safeGetElement('hitEffect');
    const b = safeGetElement('ball');

    if(!e || !b) return;

    const ballRect = b.getBoundingClientRect();
    // Position effect at ball location
    e.style.left = b.style.left;
    e.style.top = b.style.top;
    e.classList.add('active');
    setTimeout(() => e.classList.remove('active'), 600);

    // Create hit particles
    const ballX = parseFloat(b.style.left);
    const ballY = parseFloat(b.style.top);
    createHitParticles(ballX, ballY, power);

    // Enhanced screen shake based on power
    if(power > 0.9){
        powerShake(250);
        hitstop(50); // 2-3 frame freeze for impact
        sounds.powerHit();
    } else if(power > 0.7){
        const court = safeGetElement('gameCourt');
        court.classList.remove('shake');
        void court.offsetWidth;
        court.classList.add('shake');
        setTimeout(() => court.classList.remove('shake'), 150);
        sounds.hit();
    } else {
        sounds.hit();
    }

    // Haptic feedback for mobile
    if(navigator.vibrate && power > 0.6) {
        const intensity = Math.floor(power * 100);
        navigator.vibrate(intensity);
    }
}

function showCombo(){
    const texts = ['NICE!', 'GREAT!', 'PERFECT!', 'AMAZING!', 'INCREDIBLE!'];
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.textContent = texts[Math.min(M.combo - 1, 4)];
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.animation = 'comboFloat 0.9s ease-out forwards';
    const court = getCourtElement();
    if(!court) return;
    court.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function returnBall(qual, angle){
    M.ballActive = true;
    M.ballBounces = 0;
    M.rally++;

    // Rally tension - crowd gets louder as rally continues
    sounds.rallyTension(M.rally);

    // Gem spawn chance increases with rally length
    const gemChance = 0.05 + M.rally * 0.02;
    if(Math.random() < gemChance && !M.gemActive) spawnGem();

    const st = getStats();
    const spd = 1 + st.power * 0.012;
    const ctrl = 1 + st.control * 0.008;
    const off = M.playerPos - M.ballPos.x;
    const ang = Math.sin(angle) * 1.1 * ctrl;
    const pos = off * 0.018;

    // Add spin based on angle
    M.ballSpin = Math.sin(angle) * 0.8;

    // Volley mechanic: at net = flatter, faster, more decisive
    if (M.atNet) {
        M.ballH = 15;
        M.ballVel = {
            x: Math.max(-1.8, Math.min(1.8, (ang + pos) * 1.0)),
            y: -2.6 * spd * qual * 0.7,
            z: 1.0 * qual  // Much flatter trajectory
        };
    } else {
        M.ballH = 25;
        M.ballVel = {
            x: Math.max(-1.5, Math.min(1.5, (ang + pos) * 0.85)),
            y: -2.0 * spd * qual * (0.6 + Math.random() * 0.2),
            z: 2.2 * qual
        };
    }

    animateReturn();
}

function animateReturn(){
    if(!M.ballActive) return;
    if(window.animationPaused){
        requestAnimationFrame(animateReturn);
        return;
    }

    M.ballPos.x += M.ballVel.x;
    M.ballPos.y += M.ballVel.y;
    M.ballH += M.ballVel.z;
    M.ballVel.z -= 0.15;

    // Spin effect
    if(M.ballSpin !== 0){
        M.ballVel.x += M.ballSpin * 0.025;
    }

    // NET COLLISION CHECK for player returns
    const rPrevY = M.ballPos.y - M.ballVel.y;
    const rNetY = 52;
    const rCrossingNet = (rPrevY > rNetY && M.ballPos.y <= rNetY) || (rPrevY < rNetY && M.ballPos.y >= rNetY);
    if(rCrossingNet && M.ballH < 8){
        M.ballActive = false;
        M.canHit = false;
        resetBallUI();
        sounds.let();
        showNetCordEffect();
        showCallOverlay('NET!', false);
        M.streak = 0;
        updateMatchStreakDisplay();
        if(!scorePoint('o')) setTimeout(startNextPoint, 1200);
        return;
    }

    // Ground bounce
    if(M.ballH <= 0 && M.ballVel.z < 0){
        M.ballH = 0;
        M.ballVel.z = -M.ballVel.z * 0.72;
        sounds.bounce();
    }

    // Out wide - whoever hit it last loses the point
    if(M.ballPos.x < 10 || M.ballPos.x > 90){
        M.ballActive = false;
        resetBallUI();
        M.combo = 0;
        M.pendingCombo = false;  // Clear - don't show combo for shot that went out
        M.rally = 0;
        sounds.miss();

        if(M.lastHitBy === 'player'){
            // Player hit it out - opponent gets point
            showCallOverlay('OUT!', false);
            M.streak = 0;
            updateMatchStreakDisplay();
            if(!scorePoint('o')) setTimeout(startNextPoint, 1200);
        } else {
            // Opponent hit it out - player gets point
            showCallOverlay('OUT!', true);
            M.streak++;
            updateMatchStreakDisplay();
            if(!scorePoint('p')) setTimeout(startNextPoint, 1200);
        }
        return;
    }

    const rBall = safeGetElement('ball');
    const rShadow = safeGetElement('ballShadow');
    if(rBall) {
        rBall.style.left = M.ballPos.x + '%';
        rBall.style.top = (M.ballPos.y - M.ballH/10) + '%';
        // Speed visual
        const rSpeed = Math.sqrt(M.ballVel.x*M.ballVel.x + M.ballVel.y*M.ballVel.y);
        rBall.classList.toggle('fast', rSpeed > 1.5);
    }
    if(rShadow) {
        rShadow.style.left = M.ballPos.x + '%';
        rShadow.style.top = M.ballPos.y + '%';
    }

    // Ball reached opponent's side (adjusted for net position)
    const oppReachY = M.oppAtNet ? (M.oppY + 5) : 12;
    if(M.ballPos.y < oppReachY){
        M.ballActive = false;

        const st = getStats();
        const dist = Math.abs(M.ballPos.x - M.oppPos);
        const reach = dist < 28;
        const hq = Math.max(0, 1 - dist * 0.025);
        const prob = reach ? (M.settings.oppAcc * hq - st.power * 0.002) : 0;

        // Check for net cord as ball crosses net zone (43-57%)
        if(M.ballPos.y > 43 && M.ballPos.y < 57 && Math.random() < 0.08){
            showNetCordEffect();
            sounds.let();
        }

        if(Math.random() < prob){
            // Opponent returns - clear pending combo (shot wasn't a winner)
            M.pendingCombo = false;
            M.rally++;
            M.ballBounces = 0;

            // Rally tension - crowd gets louder as rally continues
            sounds.rallyTension(M.rally);

            updateMatchUI();

            M.ballPos = {x: M.oppPos, y: 12};
            M.ballH = 50;

            const tx = M.playerPos > 50 ? 25 + Math.floor(Math.random() * 25) : 50 + Math.floor(Math.random() * 25);
            M.ballVel = {
                x: (tx - M.ballPos.x) / 90 * 1.8,
                y: M.settings.speed * 0.75,
                z: 1.8
            };
            M.ballSpin = (Math.random() - 0.5) * 0.3;

            // Opponent volley: faster/flatter when at net
            if (M.oppAtNet) {
                M.ballPos = {x: M.oppPos, y: M.oppY + 3};
                M.ballH = 18;
                const tx2 = M.playerPos > 50 ? 25 + Math.floor(Math.random() * 25) : 50 + Math.floor(Math.random() * 25);
                M.ballVel = {
                    x: (tx2 - M.ballPos.x) / 80 * 2.2,
                    y: M.settings.speed * 1.0,
                    z: 0.6
                };
            }

            // Maybe opponent rushes net after return
            maybeOppNetRush();

            // Windup anticipation - brief telegraph before hitting
            const oppEl = safeGetElement('opponent');
            oppEl?.classList.add('windup');
            setTimeout(() => {
                oppEl?.classList.remove('windup');
                oppEl?.classList.add('hitting');
                setOppSwinging();
                setTimeout(() => oppEl?.classList.remove('hitting'), 250);
                sounds.hit();

                M.ballActive = true;
                M.canHit = false;
                const returnBall = safeGetElement('ball');
                if(returnBall) { returnBall.classList.add('active'); returnBall.classList.remove('glowing'); }
                const returnShadow = safeGetElement('ballShadow');
                if(returnShadow) returnShadow.classList.add('active');

                animateBall();
            }, 150);
        } else {
            // Opponent missed - point for player! (Winner!)
            resetBallUI();
            M.rally = 0;
            M.winners++;

            let reward = 10 + M.combo * 5;
            if(G.equipment.special === 'x1') reward *= 2;
            G.coins += reward;

            M.streak++;
            updateMatchStreakDisplay();

            // NOW show combo - shot was successful!
            if(M.pendingCombo && M.combo >= 1){
                showCombo();
                M.pendingCombo = false;
            }

            // Show winner call for clean winners
            if(M.combo >= 2 || Math.random() < 0.25){
                showCallOverlay('WINNER!', true);
                sounds.winner();
            } else {
                sounds.coin();
            }

            toast('+' + reward + ' coins');

            if(!scorePoint('p')) setTimeout(startNextPoint, 1500);
        }
        return;
    }

    if(M.ballPos.y < 50) updateOpp();
    updatePlayerDirection();

    // Create ball trail for visual feedback
    createBallTrail();

    requestAnimationFrame(animateReturn);
}

function checkEnd(){
    // Quick mode: first to 6 games wins (no sets)
    if(G.matchType === 'quick'){
        if(M.pGames >= 3){
            M.pSets = 1; M.oSets = 0; // Mark as won for endMatch
            endMatch();
            return true;
        }
        if(M.oGames >= 3){
            M.pSets = 0; M.oSets = 1;
            endMatch();
            return true;
        }
        return false;
    }

    // Standard and other modes: 1 set to win
    const setsToWin = 1;

    if(M.pSets >= setsToWin){
        endMatch();
        return true;
    }
    if(M.oSets >= setsToWin){
        endMatch();
        return true;
    }

    return false;
}

function endMatch(){
    M.active = false;

    const won = M.pSets > M.oSets || (M.pSets === M.oSets && M.pGames > M.oGames);

    // Enhanced reward calculation
    let coins = won ? 100 : 35;

    // Performance bonuses
    if(won) {
        if(M.aces >= 5) coins += 50; // Ace bonus
        if(M.winners >= 10) coins += 40; // Winner bonus
        if(M.doubleFaults <= 1) coins += 30; // Consistency bonus
        if(M.longestRally >= 8) coins += 25; // Rally bonus
        if(M.streak >= 5) coins += M.streak * 5; // Streak bonus
    }

    coins = Math.floor(coins * M.settings.mult);
    if(G.equipment.special === 'x1') coins *= 2;

    const skill = Math.floor((won ? 35 : 15) * M.settings.mult + M.aces * 3 + M.winners * 2);

    let gems = 0;
    if(won) {
        gems = Math.floor(Math.floor(Math.random() * 3)) + 1;
        if(M.aces >= 3) gems += 1;
        if(M.winners >= 8) gems += 1;
        gems += Math.floor(M.streak / 3);
    }

    // Update career stats
    if(!G.careerStats) {
        G.careerStats = {
            matchesPlayed: 0,
            matchesWon: 0,
            totalAces: 0,
            totalWinners: 0,
            totalCoins: 0,
            bestStreak: 0,
            longestRally: 0,
            perfectSets: 0
        };
    }
    if(!G.careerStats.perfectSets) G.careerStats.perfectSets = 0;
    if(!G.careerStats.legendWins) G.careerStats.legendWins = 0;
    if(!G.careerStats.flawlessWins) G.careerStats.flawlessWins = 0;
    if(!G.careerStats.cleanServeWins) G.careerStats.cleanServeWins = 0;
    if(!G.careerStats.bestDailyStreak) G.careerStats.bestDailyStreak = 0;
    if(!G.careerStats.dailyChallengesCompleted) G.careerStats.dailyChallengesCompleted = 0;

    G.careerStats.matchesPlayed++;
    if(won) G.careerStats.matchesWon++;
    G.careerStats.totalAces += M.aces;
    G.careerStats.totalWinners += M.winners;
    G.careerStats.totalCoins += coins;
    if(M.streak > G.careerStats.bestStreak) G.careerStats.bestStreak = M.streak;
    if(M.longestRally > G.careerStats.longestRally) G.careerStats.longestRally = M.longestRally;

    // Track perfect sets (6-0)
    if(won && M.oGames === 0 && M.pGames >= 6) G.careerStats.perfectSets++;
    // Track legend wins
    if(won && G.difficulty === 'legend') G.careerStats.legendWins++;
    // Track flawless wins (no games lost)
    if(won && M.oGames === 0) G.careerStats.flawlessWins++;
    // Track clean serve wins (no double faults)
    if(won && (!M.doubleFaults || M.doubleFaults === 0)) G.careerStats.cleanServeWins++;

    const oldNTRP = getNTRP();
    G.coins += coins;
    G.skillPoints += skill;
    G.gems += gems;
    const newNTRP = getNTRP();

    save();

    // Enhanced victory/defeat presentation
    safeGetElement('gameHUD')?.classList.remove('active');
    safeGetElement('gameCourt')?.classList.remove('active');
    safeGetElement('streakDisplay')?.classList.remove('active');
    const _pb = document.getElementById('pauseBtn');
    if (_pb) _pb.style.display = 'none';

    const rt = safeGetElement('resultsTitle');
    rt.textContent = won ? 'VICTORY!' : 'DEFEAT';
    rt.className = 'results-title ' + (won ? 'victory' : 'defeat');

    // Enhanced score display
    let scoreText;
    if(M.pSets > 0 || M.oSets > 0) {
        scoreText = `${M.pSets}-${M.oSets} (${M.pGames}-${M.oGames})`;
    } else {
        scoreText = `${M.pGames}-${M.oGames}`;
    }

    { const _el = safeGetElement('finalScore'); if(_el) _el.textContent = scoreText; }
    { const _el = safeGetElement('coinsEarned'); if(_el) _el.textContent = '+' + coins; }
    { const _el = safeGetElement('skillGained'); if(_el) _el.textContent = '+' + skill; }
    { const _el = safeGetElement('gemsEarned'); if(_el) _el.textContent = '+' + gems; }
    // Enhanced match statistics
    { const _el = safeGetElement('acesCount'); if(_el) _el.textContent = M.aces; }
    { const _el = safeGetElement('winnersCount'); if(_el) _el.textContent = M.winners; }
    { const _el = safeGetElement('doubleFaultsCount'); if(_el) _el.textContent = M.doubleFaults || 0; }
    { const _el = safeGetElement('bestStreakCount'); if(_el) _el.textContent = M.bestStreak || M.streak; }
    { const _el = safeGetElement('longestRally'); if(_el) _el.textContent = M.longestRally; }
    { const _el = safeGetElement('totalPoints'); if(_el) _el.textContent = M.pointsPlayed || 0; }

    const avgRally = M.pointsPlayed > 0 ? (M.totalRallies / M.pointsPlayed).toFixed(1) : '0';
    { const _el = safeGetElement('avgRally'); if(_el) _el.textContent = avgRally; }

    // Calculate match duration
    const matchDuration = M.startTime ? Math.floor((Date.now() - M.startTime) / 1000) : 0;
    const minutes = Math.floor(matchDuration / 60);
    const seconds = matchDuration % 60;
    { const _el = safeGetElement('matchDuration'); if(_el) _el.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`; }

    // Check daily challenge progress
    if(won) {
        checkChallengeProgress('aces', M.aces || 0);
        checkChallengeProgress('winners', M.winners || 0);
        checkChallengeProgress('longestRally', M.longestRally || 0);
        checkChallengeProgress('doubleFaults', M.doubleFaults || 0);
        checkChallengeProgress('matchTime', matchDuration);
        checkChallengeProgress('streak', M.bestStreak || M.streak || 0);
        // New challenge types
        if(!M.lostServiceGame) checkChallengeProgress('noBreak', 1);
        if(M.wasDown03 && won) checkChallengeProgress('comeback', 1);
        if(M.oGames === 0 && M.pGames >= 6) checkChallengeProgress('bagel', 1);
    }

    // Check achievements
    checkAchievements();

    // Show match performance
    if(won) {
        if(M.aces >= 5 || M.winners >= 10 || M.streak >= 5) {
            setTimeout(() => toast('OUTSTANDING PERFORMANCE!'), 1000);
        }
        setTimeout(() => sounds.victory(), 500);
    } else {
        setTimeout(() => sounds.defeat(), 500);
    }

    if(newNTRP > oldNTRP){
        setTimeout(() => {
            toast(`NTRP UPGRADED to ${newNTRP.toFixed(1)}!`);
            sounds.point();
        }, won ? 2000 : 1500);
    }

    const resultsEl = safeGetElement('matchResults');
    resultsEl?.classList.add('active');

    // Celebratory confetti on victory
    if(won) spawnConfetti();

    // Animate reward values counting up
    animateRewardValues(coins, skill, gems);
}

function spawnConfetti() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1', '#dda0dd', '#f0e68c'];
    for(let i = 0; i < 40; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = (Math.random() * 100) + 'vw';
            piece.style.top = '-10px';
            piece.style.width = (6 + Math.random() * 8) + 'px';
            piece.style.height = (6 + Math.random() * 8) + 'px';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.borderRadius = '0';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            piece.style.animationDelay = '0s';
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 4000);
        }, i * 60);
    }
}

function animateRewardValues(coins, skill, gems) {
    // Count-up animation for reward numbers
    const targets = [
        { id: 'coinsEarned', value: coins, prefix: '+' },
        { id: 'skillGained', value: skill, prefix: '+' },
        { id: 'gemsEarned', value: gems, prefix: '+' }
    ];
    targets.forEach((t, idx) => {
        const el = safeGetElement(t.id);
        if(!el) return;
        let current = 0;
        const step = Math.max(1, Math.floor(t.value / 20));
        const delay = 400 + idx * 300;
        setTimeout(() => {
            const interval = setInterval(() => {
                current = Math.min(current + step, t.value);
                el.textContent = t.prefix + current;
                if(current >= t.value) clearInterval(interval);
            }, 30);
        }, delay);
    });
}

function returnToMenu(){
    safeGetElement('matchResults')?.classList.remove('active');
    safeGetElement('mainMenu')?.classList.add('active');
    // Clean up any remaining confetti
    document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
    resetBallUI();
    updateUI();
}

// ========== NET RUSH SYSTEM ==========

let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;
const DOUBLE_TAP_THRESHOLD = 350; // ms
const DOUBLE_TAP_DISTANCE = 50; // px
const NET_POSITION_Y = 62; // % from top (net is at 53%, stand in service box)
const BASELINE_Y = 95;
const NET_RUSH_DURATION = 4500; // ms before auto-retreat
let playerTargetY = BASELINE_Y;
let playerCurrentY = BASELINE_Y;
let playerYLerpActive = false;

function triggerNetRush() {
    // Block during any serve (player or opponent) and until ball has bounced in service box
    if (M.atNet || !M.active || M.isPlayerServe || M.servePhase !== 'none' || M.ballBounces < 1) return;
    M.atNet = true;
    playerTargetY = NET_POSITION_Y;
    M.netRushTimer = Date.now();
    if (!playerYLerpActive) {
        playerYLerpActive = true;
        requestAnimationFrame(lerpPlayerY);
    }
    const ind = safeGetElement('netRushIndicator');
    if (ind) ind.classList.add('active');
    // Auto-retreat after duration
    setTimeout(() => {
        if (M.atNet) retreatToBaseline();
    }, NET_RUSH_DURATION);
}

function retreatToBaseline() {
    M.atNet = false;
    playerTargetY = BASELINE_Y;
    if (!playerYLerpActive) {
        playerYLerpActive = true;
        requestAnimationFrame(lerpPlayerY);
    }
    const ind = safeGetElement('netRushIndicator');
    if (ind) ind.classList.remove('active');
}

function lerpPlayerY() {
    if (!M.active) { playerYLerpActive = false; return; }
    const speed = 0.12;
    const diff = playerTargetY - playerCurrentY;
    if (Math.abs(diff) > 0.5) {
        playerCurrentY += diff * speed;
        M.playerY = playerCurrentY;
        updatePlayerPaddleY();
        requestAnimationFrame(lerpPlayerY);
    } else {
        playerCurrentY = playerTargetY;
        M.playerY = playerCurrentY;
        updatePlayerPaddleY();
        playerYLerpActive = false;
    }
}

function updatePlayerPaddleY() {
    const paddle = safeGetElement('playerPaddle');
    if (!paddle) return;
    // Convert Y% to bottom%. baseline(95%) = bottom:5%, net(58%) = bottom:42%
    const bottomPct = 100 - M.playerY;
    paddle.style.bottom = bottomPct + '%';
}

function detectDoubleTap(x, y) {
    const now = Date.now();
    const dist = Math.sqrt((x - lastTapX) ** 2 + (y - lastTapY) ** 2);
    if (now - lastTapTime < DOUBLE_TAP_THRESHOLD && dist < DOUBLE_TAP_DISTANCE) {
        lastTapTime = 0;
        return true;
    }
    lastTapTime = now;
    lastTapX = x;
    lastTapY = y;
    return false;
}

function detectSwipeUp(startY, endY, dt) {
    const dy = startY - endY;
    return dy > 80 && dt < 300; // fast upward swipe
}

// Reset player Y on point end
function resetPlayerToBaseline() {
    M.atNet = false;
    M.oppAtNet = false;
    M.oppY = 8;
    playerTargetY = BASELINE_Y;
    playerCurrentY = BASELINE_Y;
    M.playerY = BASELINE_Y;
    updatePlayerPaddleY();
    const ind = safeGetElement('netRushIndicator');
    if (ind) ind.classList.remove('active');
    // Reset opponent Y
    const opp = safeGetElement('opponent');
    if (opp) opp.style.top = '8%';
}

// AI net rush logic
function maybeOppNetRush() {
    if (M.oppAtNet || !M.active) return;
    const s = M.settings || DIFF[G.difficulty];
    // Higher difficulty = more likely to rush net
    let chance = 0;
    if (G.difficulty === 'pro') chance = 0.08;
    if (G.difficulty === 'legend') chance = 0.18;
    // More likely on short balls (ball near net)
    if (M.ballPos.y > 35 && M.ballPos.y < 55) chance += 0.1;
    if (Math.random() < chance) {
        M.oppAtNet = true;
        M.oppY = 42; // Opponent moves to net
        const opp = safeGetElement('opponent');
        if (opp) {
            opp.style.transition = 'top 0.5s ease-out';
            opp.style.top = '42%';
            setTimeout(() => { if(opp) opp.style.transition = ''; }, 600);
        }
    }
}

function resetOppFromNet() {
    if (!M.oppAtNet) return;
    M.oppAtNet = false;
    M.oppY = 8;
    const opp = safeGetElement('opponent');
    if (opp) {
        opp.style.transition = 'top 0.4s ease-in';
        opp.style.top = '8%';
        setTimeout(() => { if(opp) opp.style.transition = ''; }, 500);
    }
}

// ========== INPUT HANDLING ==========

let touchY = null, touchX = null, touchT = null;

document.addEventListener('touchstart', e => {
    if(!M.active) return;

    const t = e.touches[0];
    touchY = t.clientY;
    touchX = t.clientX;
    touchT = Date.now();

    // Double-tap to rush net
    if(detectDoubleTap(t.clientX, t.clientY)) {
        triggerNetRush();
        return;
    }

    // Serve: tap starts toss AND immediately begins pull-back tracking
    if(M.isPlayerServe && M.servePhase === 'ready'){
        serveToss();
        startServeCharge(t.clientY, t.clientX);
        return;
    }

    updatePlayerPos(t.clientX);
    setPlayerRunning(true);
});

document.addEventListener('touchmove', e => {
    if(!M.active) return;
    e.preventDefault();

    const t = e.touches[0];

    // Update pull-back power + aim during charging
    if(M.servePhase === 'charging'){
        updateServeCharge(t.clientY, t.clientX);
        return;
    }

    updatePlayerPos(t.clientX);
}, {passive: false});

document.addEventListener('touchend', e => {
    setPlayerRunning(false);

    if(!M.active) return;

    const t = e.changedTouches[0];

    // Release serve — timing determined by toss position at this moment
    if(M.servePhase === 'charging'){
        releaseServe();
        touchY = touchX = null;
        return;
    }

    // Normal hit
    if(!touchY) { touchY = touchX = null; return; }

    const dy = touchY - t.clientY;
    const dx = t.clientX - touchX;
    const dt = Date.now() - touchT;

    // Swipe-up reserved for power returns — no longer triggers net rush
    // (use double-tap for net rush instead)

    if(!M.canHit) { touchY = touchX = null; return; }

    if(dy > 8 || (dt < 180 && Math.abs(dy) < 8)){
        const pwr = Math.min(1, Math.max(0.3, dy/90));
        const ang = Math.atan2(dx, Math.max(1, dy));

        // Create swipe trail for visual feedback
        createSwipeTrail(touchX, touchY, t.clientX, t.clientY);

        hitBall(pwr, ang);
    }

    touchY = touchX = null;
});

// Mouse support
document.addEventListener('mousedown', e => {
    if(!M.active) return;

    touchY = e.clientY;
    touchX = e.clientX;
    touchT = Date.now();

    // Double-tap to rush net
    if(detectDoubleTap(e.clientX, e.clientY)) {
        triggerNetRush();
        return;
    }

    if(M.isPlayerServe && M.servePhase === 'ready'){
        serveToss();
        startServeCharge(e.clientY, e.clientX);
        return;
    }

    updatePlayerPos(e.clientX);
    setPlayerRunning(true);
});

document.addEventListener('mousemove', e => {
    if(!M.active) return;

    if(M.servePhase === 'charging'){
        updateServeCharge(e.clientY, e.clientX);
        return;
    }

    updatePlayerPos(e.clientX);
});

document.addEventListener('mouseup', e => {
    setPlayerRunning(false);

    if(!M.active) return;

    if(M.servePhase === 'charging'){
        releaseServe();
        touchY = touchX = null;
        return;
    }

    if(!M.canHit || !touchY) return;

    const dy = touchY - e.clientY;
    const dx = e.clientX - touchX;

    if(dy > 8 || Date.now() - touchT < 180){
        const pwr = Math.min(1, Math.max(0.3, dy/90));
        const ang = Math.atan2(dx, Math.max(1, dy));

        // Create swipe trail for visual feedback
        createSwipeTrail(touchX, touchY, e.clientX, e.clientY);

        hitBall(pwr, ang);
    }

    touchY = touchX = null;
});

// Smooth player movement with velocity-damped lerp interpolation
let playerTargetPos = 50;
let playerCurrentPos = 50;
let playerLerpActive = false;
let playerVelocity = 0;

function lerpPlayerMovement() {
    if(!M.active) { playerLerpActive = false; playerVelocity = 0; return; }

    const diff = playerTargetPos - playerCurrentPos;
    // Spring-damper system for fluid motion
    const springForce = diff * 0.15;
    const damping = 0.75;
    playerVelocity = playerVelocity * damping + springForce;

    if(Math.abs(diff) > 0.2 || Math.abs(playerVelocity) > 0.1) {
        playerCurrentPos += playerVelocity;
        // Clamp to bounds
        playerCurrentPos = Math.max(12, Math.min(88, playerCurrentPos));
        M.playerPos = playerCurrentPos;
        const paddle = safeGetElement('playerPaddle');
        if(paddle) paddle.style.left = playerCurrentPos + '%';
        updatePlayerDirection();
        requestAnimationFrame(lerpPlayerMovement);
    } else {
        playerCurrentPos = playerTargetPos;
        playerVelocity = 0;
        M.playerPos = playerCurrentPos;
        const paddle = safeGetElement('playerPaddle');
        if(paddle) paddle.style.left = playerCurrentPos + '%';
        updatePlayerDirection();
        playerLerpActive = false;
    }
}

function updatePlayerPos(x){
    if(M.isPlayerServe) return; // Don't move during serve

    const court = getCourtElement();
    if(!court) return;

    const r = court.getBoundingClientRect();
    const rel = ((x - r.left) / r.width) * 100;
    playerTargetPos = Math.max(12, Math.min(88, rel));

    // Start lerp loop if not already running
    if(!playerLerpActive) {
        playerLerpActive = true;
        requestAnimationFrame(lerpPlayerMovement);
    }
}

function updatePlayerDirection(){
    if(!M.ballActive) return;

    const playerSprite = document.querySelector('.player-sprite-active');
    if(!playerSprite) return;

    if(M.ballPos.x < M.playerPos){
        playerSprite.classList.add('flipped');
    } else {
        playerSprite.classList.remove('flipped');
    }
}

// Gem collection
safeGetElement('gemDrop')?.addEventListener('click', collectGem);
safeGetElement('gemDrop')?.addEventListener('touchstart', e => {
    e.stopPropagation();
    collectGem();
});

window.addEventListener('load', () => {
    // Only prevent touchmove during active gameplay, not on menus
    document.body.addEventListener('touchmove', e => {
        // Only prevent default on game screen to allow menu scrolling
        const gameScreen = safeGetElement('gameCourt');
        if(gameScreen && gameScreen.classList.contains('active')) {
            e.preventDefault();
        }
    }, {passive: false});
    initSprites();
});

// ========== SPRITE ANIMATION ENGINE v2 ==========
// Multi-frame sprite sheet support with graceful single-image fallback
// Supports: idle, run_left, run_right, swing_forehand, swing_backhand, serve, victory_pose

const SpriteStates = {
    IDLE: 'idle',
    RUNNING: 'running',
    RUN_LEFT: 'run_left',
    RUN_RIGHT: 'run_right',
    SWINGING: 'swinging',
    SWING_FOREHAND: 'swing_forehand',
    SWING_BACKHAND: 'swing_backhand',
    SERVE: 'serve',
    VICTORY: 'victory_pose',
    TRANSITIONING: 'transitioning'
};

// --- Animation Definition Registry ---
// Each animation state defines frame count, timing, loop behavior, and per-frame duration overrides.
// When sprite sheets are available, the engine reads horizontal strips (each frame = frameWidth px wide).
// When only single images exist, the engine displays frame 0 (the full image) and skips animation.

const AnimationDefs = {
    idle: {
        frames: 4,
        frameWidth: 80,
        frameHeight: 96,
        loop: true,
        frameDurations: [200, 200, 200, 200],
        defaultDuration: 200
    },
    run_left: {
        frames: 8,
        frameWidth: 80,
        frameHeight: 96,
        loop: true,
        frameDurations: null,
        defaultDuration: 80
    },
    run_right: {
        frames: 8,
        frameWidth: 80,
        frameHeight: 96,
        loop: true,
        frameDurations: null,
        defaultDuration: 80
    },
    swing_forehand: {
        frames: 8,
        frameWidth: 80,
        frameHeight: 96,
        loop: false,
        // Variable timing: wind-up slow, contact fast, follow-through slow
        frameDurations: [90, 80, 60, 35, 30, 50, 80, 120],
        defaultDuration: 65,
        returnTo: 'idle'
    },
    swing_backhand: {
        frames: 8,
        frameWidth: 80,
        frameHeight: 96,
        loop: false,
        frameDurations: [90, 80, 60, 35, 30, 50, 80, 120],
        defaultDuration: 65,
        returnTo: 'idle'
    },
    serve: {
        frames: 10,
        frameWidth: 80,
        frameHeight: 96,
        loop: false,
        // toss(slow) -> reach(med) -> contact(fast) -> follow-through(slow)
        frameDurations: [120, 110, 100, 80, 60, 35, 30, 60, 100, 140],
        defaultDuration: 80,
        returnTo: 'idle'
    },
    victory_pose: {
        frames: 6,
        frameWidth: 80,
        frameHeight: 96,
        loop: false,
        frameDurations: [150, 120, 100, 100, 150, 300],
        defaultDuration: 140
    }
};

// --- Per-character animation speed multipliers ---
function getCharAnimMultipliers(char) {
    if (!char) return { swing: 1, run: 1, serve: 1, idle: 1 };
    const power = char.power || 50;
    const speed = char.speed || 50;
    return {
        swing: 0.7 + (power / 100) * 0.6,
        run: 1.3 - (speed / 100) * 0.6,
        serve: 0.8 + (power / 100) * 0.4,
        idle: 1.0
    };
}

// --- Sprite Sheet Detection & Fallback ---
const _spriteSheetCache = {};

// Pre-seed cache for known sprite dimensions to avoid async race conditions
// All sprites are 640x96 sheets EXCEPT opponent-idle-v2.png (80x96 single frame)
(function preseedSpriteCache() {
    const V = '?v=32';
    const sheetEntry = { isSheet: true, frames: 8, width: 640, height: 96 };
    const singleEntry = { isSheet: false, frames: 1, width: 80, height: 96 };
    // Player1 original sprites
    _spriteSheetCache['player-retro-backswing.png' + V] = sheetEntry;
    _spriteSheetCache['player-retro-run.png' + V] = sheetEntry;
    _spriteSheetCache['player-idle-v2.png' + V] = singleEntry;
    _spriteSheetCache['opponent-retro-frontswing.png' + V] = sheetEntry;
    _spriteSheetCache['opponent-retro-run.png' + V] = sheetEntry;
    _spriteSheetCache['opponent-idle-v2.png' + V] = singleEntry;
    // All v2 character sprites
    var ids = ['player2','player3','player4','player5','player6','player7','player8','player9','player10','player11','player12','punk','chubby','beach','goth','anime','latino','redhead','grandpa','indian'];
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var base = 'sprites-v2/characters/' + id + '-';
        _spriteSheetCache[base + 'back-swing.png' + V] = sheetEntry;
        _spriteSheetCache[base + 'back-run.png' + V] = sheetEntry;
        _spriteSheetCache[base + 'front-swing.png' + V] = sheetEntry;
        _spriteSheetCache[base + 'front-run.png' + V] = sheetEntry;
    }
})();

function detectSpriteSheet(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            if (w > 80) {
                // Sprite sheet: 640x96 = 8 frames at 80px each
                const frames = Math.round(w / 80);
                _spriteSheetCache[url] = { isSheet: true, frames: frames, width: w, height: h };
            } else {
                // Single frame (e.g. opponent-idle-v2.png at 80x96)
                _spriteSheetCache[url] = { isSheet: false, frames: 1, width: w, height: h };
            }
            resolve(_spriteSheetCache[url]);
        };
        img.onerror = function() {
            // Fallback: assume 640x96 sheet
            _spriteSheetCache[url] = { isSheet: true, frames: 8, width: 640, height: 96 };
            resolve(_spriteSheetCache[url]);
        };
        img.src = url;
    });
}

// --- Animation Controller ---
class SpriteAnimator {
    constructor(elementId, role) {
        this.elementId = elementId;
        this.role = role;
        this.currentState = SpriteStates.IDLE;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.lastTick = 0;
        this.animating = false;
        this.rafId = null;
        this.sheetInfo = null;
        this.char = null;
        this.multipliers = { swing: 1, run: 1, serve: 1, idle: 1 };
        this.transitioning = false;
        this.lastChange = 0;
        this.timers = {};
        this.transitionAlpha = 1;
        this.prevImage = null;
        this.prevFrame = 0;
        this.onStateComplete = null;
        this.secondaryMotionCallbacks = [];
    }

    setCharacter(char) {
        this.char = char;
        this.multipliers = getCharAnimMultipliers(char);
    }

    addSecondaryMotion(callback) {
        this.secondaryMotionCallbacks.push(callback);
    }

    clearSecondaryMotion() {
        this.secondaryMotionCallbacks = [];
    }

    getElement() {
        return document.getElementById(this.elementId);
    }

    getSpriteUrl(state) {
        const sprites = SPRITES;
        const prefix = this.role === 'player' ? 'player' : 'opp';
        switch (state) {
            case SpriteStates.RUNNING:
            case SpriteStates.RUN_LEFT:
            case SpriteStates.RUN_RIGHT:
                return sprites[prefix + 'Run'];
            case SpriteStates.SWINGING:
            case SpriteStates.SWING_FOREHAND:
                return sprites[prefix + 'Swing'];
            case SpriteStates.SWING_BACKHAND:
                return sprites[prefix + 'SwingBackhand'] || sprites[prefix + 'Swing'];
            case SpriteStates.SERVE:
                return sprites[prefix + 'Serve'] || sprites[prefix + 'Swing'];
            case SpriteStates.VICTORY:
                return sprites[prefix + 'Victory'] || sprites[prefix + 'Swing'];
            case SpriteStates.IDLE:
            default:
                return sprites[prefix + 'Idle'];
        }
    }

    getAnimKey(state) {
        switch (state) {
            case SpriteStates.RUN_LEFT: return 'run_left';
            case SpriteStates.RUN_RIGHT: return 'run_right';
            case SpriteStates.RUNNING: return 'run_left';
            case SpriteStates.SWING_FOREHAND:
            case SpriteStates.SWINGING: return 'swing_forehand';
            case SpriteStates.SWING_BACKHAND: return 'swing_backhand';
            case SpriteStates.SERVE: return 'serve';
            case SpriteStates.VICTORY: return 'victory_pose';
            case SpriteStates.IDLE:
            default: return 'idle';
        }
    }

    getFrameDuration(animKey, frameIndex) {
        const def = AnimationDefs[animKey];
        if (!def) return 100;
        const baseDur = (def.frameDurations && def.frameDurations[frameIndex] !== undefined)
            ? def.frameDurations[frameIndex]
            : def.defaultDuration;
        let mult = 1;
        if (animKey.startsWith('run')) mult = this.multipliers.run;
        else if (animKey.startsWith('swing')) mult = this.multipliers.swing;
        else if (animKey === 'serve') mult = this.multipliers.serve;
        else mult = this.multipliers.idle;
        return baseDur * mult;
    }

    setState(newState, force = false) {
        const now = Date.now();
        if (!force && this.transitioning) return;
        if (!force && (now - this.lastChange < 40)) return;
        if (newState === this.currentState && !force) return;

        Object.values(this.timers).forEach(t => { if (t) clearTimeout(t); });
        this.timers = {};

        this.prevImage = this.getSpriteUrl(this.currentState);
        this.prevFrame = this.currentFrame;
        this.transitionAlpha = 0;

        this.lastChange = now;
        this.currentState = newState;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.lastTick = performance.now();

        this._applyFrame();

        if (!this.animating) {
            this.animating = true;
            this.rafId = requestAnimationFrame((t) => this._tick(t));
        }

        const animKey = this.getAnimKey(newState);
        const def = AnimationDefs[animKey];
        if (def && !def.loop && def.returnTo) {
            const totalDuration = this._getTotalDuration(animKey, def);
            this.timers.returnToIdle = setTimeout(() => {
                this.setState(SpriteStates.IDLE, true);
                if (this.onStateComplete) this.onStateComplete(newState);
            }, totalDuration);
        }
    }

    _getTotalDuration(animKey, def) {
        const url = this.getSpriteUrl(this.currentState);
        const cached = _spriteSheetCache[url];
        const frameCount = (cached && cached.isSheet) ? cached.frames : def.frames;
        let total = 0;
        for (let i = 0; i < frameCount; i++) {
            total += this.getFrameDuration(animKey, i);
        }
        return total;
    }

    _tick(timestamp) {
        if (!this.animating) return;

        const dt = timestamp - this.lastTick;
        this.lastTick = timestamp;

        const animKey = this.getAnimKey(this.currentState);
        const def = AnimationDefs[animKey];
        if (!def) {
            this.rafId = requestAnimationFrame((t) => this._tick(t));
            return;
        }

        const url = this.getSpriteUrl(this.currentState);
        const cached = _spriteSheetCache[url];
        const actualFrames = (cached && cached.isSheet) ? cached.frames : (this._isSingleImage() ? 1 : def.frames);

        if (actualFrames <= 1) {
            this._runSecondaryMotion(dt);
            if (this.transitionAlpha < 1) {
                this.transitionAlpha = Math.min(1, this.transitionAlpha + dt / 80);
            }
            this.rafId = requestAnimationFrame((t) => this._tick(t));
            return;
        }

        this.frameTimer += dt;
        const frameDur = this.getFrameDuration(animKey, this.currentFrame);

        if (this.frameTimer >= frameDur) {
            this.frameTimer -= frameDur;
            this.currentFrame++;

            if (this.currentFrame >= actualFrames) {
                if (def.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = actualFrames - 1;
                }
            }
            this._applyFrame();
        }

        if (this.transitionAlpha < 1) {
            this.transitionAlpha = Math.min(1, this.transitionAlpha + dt / 80);
        }

        this._runSecondaryMotion(dt);
        this.rafId = requestAnimationFrame((t) => this._tick(t));
    }

    _isSingleImage() {
        const url = this.getSpriteUrl(this.currentState);
        const cached = _spriteSheetCache[url];
        if (cached) return !cached.isSheet;
        return false;
    }

    _applyFrame() {
        const el = this.getElement();
        if (!el) return;

        const url = this.getSpriteUrl(this.currentState);
        const cached = _spriteSheetCache[url];

        // Only update DOM when values actually change to prevent flickering
        const imgVal = `url(${url})`;
        if (this._lastBgImage !== imgVal) {
            // Only remove animation classes on actual image change
            el.classList.remove('cycling', 'playing-4', 'playing-5', 'playing-7', 'playing-8');
            el.style.backgroundImage = imgVal;
            this._lastBgImage = imgVal;
        }

        let newSize, newPos;
        if (cached && cached.isSheet && cached.frames > 1) {
            const fw = Math.floor(cached.width / cached.frames);
            const fh = cached.height;
            newSize = `${cached.width}px ${fh}px`;
            newPos = `-${this.currentFrame * fw}px 0px`;
        } else if (cached && !cached.isSheet) {
            newSize = `${cached.width}px ${cached.height}px`;
            newPos = '0px 0px';
        } else {
            // Legacy fallback for uncached images
            const animKey = this.getAnimKey(this.currentState);
            if (animKey === 'idle' && this.role === 'player' && !SPRITES.playerIdleIsSheet) {
                newSize = '80px 96px';
                newPos = '0px 0px';
            } else if (animKey === 'idle' && this.role !== 'player' && !SPRITES.oppIdleIsSheet) {
                newSize = '80px 96px';
                newPos = '0px 0px';
            } else {
                newSize = '640px 96px';
                newPos = `-${this.currentFrame * 80}px 0px`;
            }
        }

        if (this._lastBgSize !== newSize) {
            el.style.backgroundSize = newSize;
            this._lastBgSize = newSize;
        }
        if (this._lastBgPos !== newPos) {
            el.style.backgroundPosition = newPos;
            this._lastBgPos = newPos;
        }
    }

    _runSecondaryMotion(dt) {
        for (const cb of this.secondaryMotionCallbacks) {
            try { cb(this, dt); } catch(e) { /* silent */ }
        }
    }

    stop() {
        this.animating = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        Object.values(this.timers).forEach(t => { if (t) clearTimeout(t); });
        this.timers = {};
    }

    destroy() {
        this.stop();
        this.secondaryMotionCallbacks = [];
    }
}

// --- Global Animator Instances ---
let playerAnimator = new SpriteAnimator('playerSprite', 'player');
let oppAnimator = new SpriteAnimator('opponentSprite', 'opponent');

// Legacy state objects for backward compatibility
let playerState = {
    get current() { return playerAnimator.currentState; },
    set current(v) { playerAnimator.currentState = v; },
    transitioning: false,
    lastChange: 0
};

let oppState = {
    get current() { return oppAnimator.currentState; },
    set current(v) { oppAnimator.currentState = v; },
    transitioning: false,
    lastChange: 0,
    timers: {}
};

// --- Initialization ---
async function initSprites() {
    const opp = safeGetElement('opponentSprite');
    const player = safeGetElement('playerSprite');

    playerAnimator.setCharacter(selectedChar);
    oppAnimator.setCharacter(opponentChar || window.CHARACTERS[1]);

    const preloadImages = [
        SPRITES.playerRun, SPRITES.playerSwing, SPRITES.oppRun,
        SPRITES.oppSwing, SPRITES.playerIdle, SPRITES.oppIdle
    ];

    LoadingManager.setState(LoadingManager.states.LOADING_SPRITES);

    const results = await Promise.all(preloadImages.map(async (src) => {
        const loaded = await loadSpriteWithRetry(src, 2);
        if (loaded) {
            await detectSpriteSheet(src);
        }
        return loaded;
    }));

    const failed = preloadImages.filter((_, idx) => !results[idx]);
    if (failed.length > 0) {
        console.warn('WARN: Some sprites failed to preload:', failed);
    } else {
        console.log('OK: All sprites preloaded + sheet detection complete');
    }

    LoadingManager.setState(LoadingManager.states.READY);

    if (opp && player) {
        playerAnimator.setState(SpriteStates.IDLE, true);
        oppAnimator.setState(SpriteStates.IDLE, true);
    }
}

// --- Legacy-Compatible Wrapper Functions ---
function setPlayerSprite(newState, force) {
    playerAnimator.setState(newState, force);
}
function setOpponentSprite(newState, force) {
    oppAnimator.setState(newState, force);
}
function playSprite(spriteId, frames) {
    // No-op: SpriteAnimator drives its own frame playback
}

function setPlayerRunning(running) {
    playerAnimator.setState(running ? SpriteStates.RUNNING : SpriteStates.IDLE);
}

function setOppRunning(running) {
    if (oppAnimator.currentState !== SpriteStates.SWINGING &&
        oppAnimator.currentState !== SpriteStates.SWING_FOREHAND &&
        oppAnimator.currentState !== SpriteStates.SWING_BACKHAND &&
        oppAnimator.currentState !== SpriteStates.SERVE) {
        oppAnimator.setState(running ? SpriteStates.RUNNING : SpriteStates.IDLE);
    }
}

function setOppSwinging() {
    oppAnimator.setState(SpriteStates.SWINGING, true);
}

function setPlayerSwinging() {
    playerAnimator.setState(SpriteStates.SWINGING, true);
}

// --- Character Intro System for Selection Screen ---
const CHARACTER_QUIPS = {
    'player1': "Elegance is not optional.",
    'player2': "You cannot be serious... wait, wrong player.",
    'player3': "I will grind you down. Every. Single. Point.",
    'player4': "Forehand? Backhand? Both are weapons.",
    'player5': "No? This ball says YES.",
    'player6': "Left-handed and relentless.",
    'player7': "Ice cold. Every match.",
    'player8': "Power comes standard.",
    'player9': "BOOM. That is all.",
    'player10': "Baseline is my kingdom.",
    'player11': "Return of serve specialist.",
    'player12': "Calm under pressure. Always.",
    'punk': "You CANNOT be serious! That ball was IN!",
    'chubby': "Heavy hands, heavier topspin.",
    'beach': "Graceful destruction.",
    'goth': "Darkness on the court.",
    'anime': "Full send, no regrets!",
    'latino': "VAMOS! Every single point!",
    'redhead': "Equal rights, equal lefts.",
    'grandpa': "Experience beats youth. Always.",
    'indian': "Precision is an art form."
};

// Audio hooks for future ElevenLabs voice integration
const CharacterVoiceHooks = {
    _audioCache: {},
    _speaking: false,

    prepVoice(charId) {
        // Future: preload ElevenLabs voice clip for character
        // const voiceId = CHARACTER_VOICES[charId];
        // if (voiceId) this._preloadClip(charId, voiceId);
    },

    playQuip(charId) {
        if (this._speaking) return;
        // Future: play preloaded ElevenLabs clip
        console.log(`[VoiceHook] Would play quip for ${charId}`);
    },

    stop() {
        this._speaking = false;
    }
};

let _introAnimTimer = null;
let _quipTimer = null;
let _activeQuipEl = null;

function showCharacterIntro(char) {
    if (!char) return;
    hideCharacterIntro();

    const preview = safeGetElement('charDetailPreview');
    if (!preview) return;

    preview.classList.add('animating');

    _quipTimer = setTimeout(() => {
        const quip = CHARACTER_QUIPS[char.id] || "Let us play.";
        let bubble = document.getElementById('charQuipBubble');
        if (!bubble) {
            bubble = document.createElement('div');
            bubble.id = 'charQuipBubble';
            bubble.style.cssText = 'position:absolute;top:-36px;left:50%;transform:translateX(-50%);' +
                'background:#0a0a1a;color:#ffd700;border:2px solid #ffd700;padding:4px 10px;' +
                'font-family:"Press Start 2P",monospace;font-size:8px;white-space:nowrap;' +
                'z-index:10;opacity:0;transition:opacity 0.15s;pointer-events:none;' +
                'box-shadow:2px 2px 0 #000;border-radius:0';
            const detail = safeGetElement('charDetail');
            if (detail) {
                detail.style.position = 'relative';
                detail.appendChild(bubble);
            }
        }
        bubble.textContent = quip;
        bubble.style.opacity = '1';
        _activeQuipEl = bubble;

        CharacterVoiceHooks.prepVoice(char.id);
        CharacterVoiceHooks.playQuip(char.id);
    }, 200);
}

function hideCharacterIntro() {
    if (_introAnimTimer) { clearTimeout(_introAnimTimer); _introAnimTimer = null; }
    if (_quipTimer) { clearTimeout(_quipTimer); _quipTimer = null; }
    if (_activeQuipEl) { _activeQuipEl.style.opacity = '0'; }
    CharacterVoiceHooks.stop();
    const preview = safeGetElement('charDetailPreview');
    if (preview) preview.classList.remove('animating');
}


// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log(' Initializing Championship Tennis...');

        LoadingManager.setState(LoadingManager.states.INITIALIZING);
        MobileEnhancer.init();
        AudioManager.init();
        PerformanceOptimizer.init();

        // Ensure tutorial is hidden on load
        const tutorialOverlay = safeGetElement('tutorialOverlay');
        if (tutorialOverlay && tutorialOverlay.classList.contains('active')) {
            tutorialOverlay.classList.remove('active');
            console.log(' Hidden tutorial overlay on init');
        }

        LoadingManager.setState(LoadingManager.states.READY);
        console.log('OK: Game initialized successfully');

    } catch (error) {
        ErrorRecovery.handleCriticalError(error, 'initialization');
    }
});

