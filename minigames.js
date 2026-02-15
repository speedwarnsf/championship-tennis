// ========== MINI-GAMES / TRAINING SUITE ==========

// Best scores persistence
const MiniGameScores = {
    _key: 'ct_minigame_scores',
    load() {
        try {
            return JSON.parse(localStorage.getItem(this._key)) || {};
        } catch(e) { return {}; }
    },
    save(scores) {
        try { localStorage.setItem(this._key, JSON.stringify(scores)); } catch(e) {}
    },
    getBest(game) {
        return this.load()[game] || null;
    },
    setBest(game, score) {
        const scores = this.load();
        const prev = scores[game];
        if (!prev || score.score > prev.score) {
            scores[game] = { score: score.score, details: score.details, date: Date.now() };
            this.save(scores);
            return true; // new best
        }
        return false;
    }
};

// ========== PRACTICE MENU ==========
function showPracticeMenu() {
    safeGetElement('mainMenu')?.classList.remove('active');
    const screen = safeGetElement('practiceMenuScreen');
    if (!screen) return;
    screen.classList.add('active');
    renderPracticeMenu();
}

function closePracticeMenu() {
    safeGetElement('practiceMenuScreen')?.classList.remove('active');
    safeGetElement('mainMenu')?.classList.add('active');
}

function renderPracticeMenu() {
    const content = safeGetElement('practiceMenuContent');
    if (!content) return;

    const games = [
        {
            id: 'freeplay',
            name: 'FREE PRACTICE',
            desc: 'Rally with the ball machine. No pressure, no timer.',
            color: '#4caf50',
            best: null,
            action: 'startPracticeMode()'
        },
        {
            id: 'target',
            name: 'TARGET PRACTICE',
            desc: 'Hit targets on the court for points. 60 seconds on the clock.',
            color: '#ff9800',
            best: MiniGameScores.getBest('target'),
            action: 'startTargetPractice()'
        },
        {
            id: 'speed',
            name: 'SPEED CHALLENGE',
            desc: 'Rally as long as you can. Ball gets faster every 5 hits.',
            color: '#f44336',
            best: MiniGameScores.getBest('speed'),
            action: 'startSpeedChallenge()'
        },
        {
            id: 'precision',
            name: 'PRECISION CHALLENGE',
            desc: 'Hit the highlighted zone for bonus points. 90 seconds.',
            color: '#2196f3',
            best: MiniGameScores.getBest('precision'),
            action: 'startPrecisionChallenge()'
        }
    ];

    content.innerHTML = games.map(g => {
        const bestHtml = g.best
            ? `<div style="margin-top:6px;font-size:11px;color:#ffd700">BEST: ${g.best.score}${g.best.details ? ' - ' + g.best.details : ''}</div>`
            : (g.id !== 'freeplay' ? `<div style="margin-top:6px;font-size:11px;color:rgba(255,255,255,0.3)">NO SCORE YET</div>` : '');
        return `
        <div style="background:linear-gradient(180deg,#3a4a6a 0%,#2a3a5a 100%);border:3px solid;border-color:${g.color} #2a3a5a #2a3a5a ${g.color};padding:14px;margin-bottom:10px;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,0.3)" onclick="${g.action}">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${g.color};letter-spacing:2px">${g.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:4px">${g.desc}</div>
            ${bestHtml}
        </div>`;
    }).join('');
}

// Override the original startPracticeMode button to show menu instead
const _originalStartPracticeMode = typeof startPracticeMode === 'function' ? startPracticeMode : null;

// We'll patch the menu button via the HTML onclick

// ========== SHARED MINI-GAME UTILITIES ==========
let miniGameActive = null; // 'target' | 'speed' | 'precision' | null
let miniGameState = {};
let miniGameTimer = null;
let miniGameRAF = null;

function initMiniGameMatch() {
    selectRandomOpponent();
    updateSprites();

    safeGetElement('mainMenu')?.classList.remove('active');
    safeGetElement('practiceMenuScreen')?.classList.remove('active');

    const s = DIFF[G.difficulty];

    M = {
        active: true,
        startTime: Date.now(),
        pPoints: 0, oPoints: 0,
        pGames: 0, oGames: 0,
        pSets: 0, oSets: 0,
        time: 9999,
        matchLimit: null,
        timeExpired: false,
        isTiebreak: false,
        tiebreakServer: 'player',
        servingPlayer: 'opp',
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
        lastHitBy: 'opp',
        canHit: false,
        combo: 0,
        pendingCombo: false,
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
    if(pauseBtn) pauseBtn.style.display = 'flex';
    safeGetElement('gameCourt')?.classList.add('active');
    { const _el = safeGetElement('playerPaddle'); if(_el) _el.style.left = '70%'; }

    updateMatchUI();
}

function endMiniGame() {
    if (miniGameTimer) { clearInterval(miniGameTimer); miniGameTimer = null; }
    if (miniGameRAF) { cancelAnimationFrame(miniGameRAF); miniGameRAF = null; }

    M.active = false;
    miniGameActive = null;

    // Remove any mini-game overlays
    const overlay = document.getElementById('miniGameOverlay');
    if (overlay) overlay.remove();

    // Remove target elements
    document.querySelectorAll('.mg-target, .mg-zone').forEach(el => el.remove());

    safeGetElement('gameHUD')?.classList.remove('active');
    safeGetElement('gameCourt')?.classList.remove('active');
    const pauseBtn = document.getElementById('pauseBtn');
    if(pauseBtn) pauseBtn.style.display = 'none';

    resetBallUI();
}

function showMiniGameResults(title, score, details, gameName) {
    endMiniGame();

    const isNewBest = MiniGameScores.setBest(gameName, { score, details });

    const screen = safeGetElement('miniGameResultsScreen');
    if (!screen) return;

    const content = safeGetElement('miniGameResultsContent');
    if (content) {
        const best = MiniGameScores.getBest(gameName);
        content.innerHTML = `
            <h2 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(42px,12vw,56px);background:linear-gradient(135deg,#ffd700,#ffed4e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px">${title}</h2>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:64px;color:#fff;margin-bottom:5px">${score}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:20px;text-transform:uppercase;letter-spacing:2px">POINTS</div>
            ${isNewBest ? '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:28px;color:#4caf50;margin-bottom:15px;letter-spacing:3px">NEW BEST!</div>' : ''}
            <div style="background:linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,237,78,0.05));border:2px solid rgba(255,215,0,0.3);padding:16px;margin-bottom:20px;width:100%;max-width:320px">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,215,0,0.8);margin-bottom:12px;text-align:center">DETAILS</div>
                ${details}
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(255,215,0,0.1);margin-top:8px">
                    <span style="font-size:12px;color:rgba(255,255,255,0.7);text-transform:uppercase">Best Score</span>
                    <span style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:#ffd700">${best ? best.score : score}</span>
                </div>
            </div>
            <div style="display:flex;gap:10px">
                <button onclick="closeMiniGameResults(); ${gameName === 'target' ? 'startTargetPractice()' : gameName === 'speed' ? 'startSpeedChallenge()' : 'startPrecisionChallenge()'}" style="padding:14px 30px;background:linear-gradient(135deg,#4caf50,#8bc34a);border:none;color:#fff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer">RETRY</button>
                <button onclick="closeMiniGameResults()" style="padding:14px 30px;background:linear-gradient(135deg,#ffd700,#ffed4e);border:none;color:#1a1a2e;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer">DONE</button>
            </div>
        `;
    }

    screen.classList.add('active');
}

function closeMiniGameResults() {
    safeGetElement('miniGameResultsScreen')?.classList.remove('active');
    showPracticeMenu();
}

function createMiniGameHUD(html) {
    let overlay = document.getElementById('miniGameOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'miniGameOverlay';
        overlay.style.cssText = 'position:fixed;top:calc(60px + env(safe-area-inset-top,0px));left:10px;z-index:200;display:flex;flex-direction:column;gap:6px';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = html;
    return overlay;
}

function makeDetailRow(label, value) {
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,215,0,0.1)">
        <span style="font-size:12px;color:rgba(255,255,255,0.7);text-transform:uppercase">${label}</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:22px;background:linear-gradient(135deg,#4caf50,#8bc34a);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${value}</span>
    </div>`;
}

// ========== TARGET PRACTICE ==========
function startTargetPractice() {
    miniGameActive = 'target';
    miniGameState = {
        score: 0,
        hits: 0,
        misses: 0,
        timeLeft: 60,
        targets: [],
        maxTargets: 3
    };

    initMiniGameMatch();
    practiceMode = true; // leverage practice ball feeding

    const el = safeGetElement('matchTimer');
    if (el) el.textContent = '1:00';

    createMiniGameHUD(`
        <div style="background:rgba(0,0,0,0.7);padding:8px 14px;border:1px solid rgba(255,152,0,0.4);color:#ff9800;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px">TARGET PRACTICE</div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Score: <span id="mgTargetScore" style="color:#ffd700;font-weight:700">0</span></div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Accuracy: <span id="mgTargetAcc" style="color:#4caf50;font-weight:700">0%</span></div>
        <button onclick="endTargetPractice()" style="padding:8px 14px;background:rgba(244,67,54,0.8);border:2px solid #f44336;color:#fff;font-size:11px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">EXIT</button>
    `);

    // Spawn initial targets
    spawnTarget();
    spawnTarget();

    // Start timer
    miniGameTimer = setInterval(() => {
        miniGameState.timeLeft--;
        const el = safeGetElement('matchTimer');
        if (el) {
            const m = Math.floor(miniGameState.timeLeft / 60);
            const s = miniGameState.timeLeft % 60;
            el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
        if (miniGameState.timeLeft <= 0) {
            endTargetPractice();
        }
    }, 1000);

    // Feed first ball
    setTimeout(() => feedPracticeBall(), 800);
}

function spawnTarget() {
    if (!miniGameActive || miniGameState.targets.length >= miniGameState.maxTargets) return;

    const court = document.querySelector('.court');
    if (!court) return;

    // Targets on opponent side (top half)
    const x = 15 + Math.random() * 70; // 15-85%
    const y = 10 + Math.random() * 35; // 10-45%
    const points = Math.random() > 0.7 ? 50 : (Math.random() > 0.5 ? 25 : 10);
    const size = points === 50 ? 30 : (points === 25 ? 40 : 50);

    const target = document.createElement('div');
    target.className = 'mg-target';
    target.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;transform:translate(-50%,-50%);z-index:15;pointer-events:none;border:3px solid ${points === 50 ? '#f44336' : points === 25 ? '#ff9800' : '#4caf50'};background:${points === 50 ? 'rgba(244,67,54,0.2)' : points === 25 ? 'rgba(255,152,0,0.2)' : 'rgba(76,175,80,0.2)'};display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:16px;color:${points === 50 ? '#f44336' : points === 25 ? '#ff9800' : '#4caf50'}`;
    target.textContent = points;
    target.dataset.points = points;
    target.dataset.x = x;
    target.dataset.y = y;
    target.dataset.size = size;

    court.appendChild(target);
    miniGameState.targets.push({ el: target, x, y, points, size });
}

// Check if ball hits a target (called from game loop)
function checkTargetHits(ballX, ballY) {
    if (miniGameActive !== 'target') return;

    const hitRadius = 8;
    for (let i = miniGameState.targets.length - 1; i >= 0; i--) {
        const t = miniGameState.targets[i];
        const dx = ballX - t.x;
        const dy = ballY - t.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const threshold = (t.size / 2) * 0.15 + hitRadius; // percentage-based

        if (dist < threshold) {
            // Hit!
            miniGameState.score += t.points;
            miniGameState.hits++;

            // Flash effect
            t.el.style.background = '#ffd700';
            t.el.style.borderColor = '#ffd700';
            t.el.style.color = '#000';
            t.el.textContent = '+' + t.points;
            setTimeout(() => { if (t.el.parentNode) t.el.remove(); }, 300);

            miniGameState.targets.splice(i, 1);

            // Update HUD
            const scoreEl = document.getElementById('mgTargetScore');
            if (scoreEl) scoreEl.textContent = miniGameState.score;
            const total = miniGameState.hits + miniGameState.misses;
            const accEl = document.getElementById('mgTargetAcc');
            if (accEl && total > 0) accEl.textContent = Math.round((miniGameState.hits / total) * 100) + '%';

            // Spawn replacement
            setTimeout(() => spawnTarget(), 500);
            return;
        }
    }

    // Ball crossed into opponent half but didn't hit target
    if (ballY < 50) {
        miniGameState.misses++;
        const total = miniGameState.hits + miniGameState.misses;
        const accEl = document.getElementById('mgTargetAcc');
        if (accEl && total > 0) accEl.textContent = Math.round((miniGameState.hits / total) * 100) + '%';
    }
}

function endTargetPractice() {
    const st = miniGameState;
    const total = st.hits + st.misses;
    const acc = total > 0 ? Math.round((st.hits / total) * 100) : 0;

    practiceMode = false;
    showMiniGameResults(
        'TARGET PRACTICE',
        st.score,
        makeDetailRow('Targets Hit', st.hits) +
        makeDetailRow('Shots Fired', total) +
        makeDetailRow('Accuracy', acc + '%') +
        makeDetailRow('Time', (60 - st.timeLeft) + 's'),
        'target'
    );
}

// ========== SPEED CHALLENGE ==========
function startSpeedChallenge() {
    miniGameActive = 'speed';
    miniGameState = {
        score: 0,
        rally: 0,
        bestRally: 0,
        speedMultiplier: 1.0,
        ballsFed: 0,
        elapsed: 0
    };

    initMiniGameMatch();
    practiceMode = true;

    const el = safeGetElement('matchTimer');
    if (el) el.textContent = '0:00';

    createMiniGameHUD(`
        <div style="background:rgba(0,0,0,0.7);padding:8px 14px;border:1px solid rgba(244,67,54,0.4);color:#f44336;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px">SPEED CHALLENGE</div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Rally: <span id="mgSpeedRally" style="color:#4caf50;font-weight:700">0</span></div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Speed: <span id="mgSpeedMult" style="color:#ff9800;font-weight:700">1.0x</span></div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Score: <span id="mgSpeedScore" style="color:#ffd700;font-weight:700">0</span></div>
        <button onclick="endSpeedChallenge()" style="padding:8px 14px;background:rgba(244,67,54,0.8);border:2px solid #f44336;color:#fff;font-size:11px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">EXIT</button>
    `);

    // Timer for elapsed
    miniGameTimer = setInterval(() => {
        miniGameState.elapsed++;
        const el = safeGetElement('matchTimer');
        if (el) {
            const m = Math.floor(miniGameState.elapsed / 60);
            const s = miniGameState.elapsed % 60;
            el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
    }, 1000);

    setTimeout(() => feedSpeedBall(), 1000);
}

function feedSpeedBall() {
    if (miniGameActive !== 'speed' || !M.active) return;

    M.rally = 0;
    M.ballActive = true;
    M.canHit = false;
    M.lastHitBy = 'opp';
    M.ballBounces = 0;

    const targetX = 30 + Math.random() * 40;
    M.ballPos = {x: 20 + Math.random() * 60, y: 10};

    const spd = miniGameState.speedMultiplier;
    M.ballVel = {
        x: (targetX - M.ballPos.x) * 0.02 + (Math.random() - 0.5) * 0.3,
        y: (1.2 + Math.random() * 0.5) * spd,
        z: 0
    };
    M.ballH = 80 + Math.random() * 40;
    M.ballSpin = (Math.random() - 0.5) * 0.3;

    const ball = safeGetElement('ball');
    if (ball) ball.classList.add('active');
    updateMatchUI();
}

function onSpeedChallengeHit() {
    if (miniGameActive !== 'speed') return;

    miniGameState.rally++;
    // Points scale with speed
    const pts = Math.round(10 * miniGameState.speedMultiplier);
    miniGameState.score += pts;

    // Increase speed every 5 hits
    if (miniGameState.rally % 5 === 0) {
        miniGameState.speedMultiplier = Math.min(3.0, miniGameState.speedMultiplier + 0.2);
    }

    if (miniGameState.rally > miniGameState.bestRally) {
        miniGameState.bestRally = miniGameState.rally;
    }

    // Update HUD
    const rallyEl = document.getElementById('mgSpeedRally');
    if (rallyEl) rallyEl.textContent = miniGameState.rally;
    const multEl = document.getElementById('mgSpeedMult');
    if (multEl) multEl.textContent = miniGameState.speedMultiplier.toFixed(1) + 'x';
    const scoreEl = document.getElementById('mgSpeedScore');
    if (scoreEl) scoreEl.textContent = miniGameState.score;
}

function onSpeedChallengeMiss() {
    if (miniGameActive !== 'speed') return;
    // Rally over - end
    endSpeedChallenge();
}

function endSpeedChallenge() {
    const st = miniGameState;
    practiceMode = false;
    showMiniGameResults(
        'SPEED CHALLENGE',
        st.score,
        makeDetailRow('Best Rally', st.bestRally) +
        makeDetailRow('Top Speed', st.speedMultiplier.toFixed(1) + 'x') +
        makeDetailRow('Time', st.elapsed + 's'),
        'speed'
    );
}

// ========== PRECISION CHALLENGE ==========
const PRECISION_ZONES = [
    { name: 'DEEP LEFT', x: 20, y: 20, w: 25, h: 20 },
    { name: 'DEEP RIGHT', x: 55, y: 20, w: 25, h: 20 },
    { name: 'SHORT LEFT', x: 20, y: 35, w: 25, h: 15 },
    { name: 'SHORT RIGHT', x: 55, y: 35, w: 25, h: 15 },
    { name: 'CENTER', x: 35, y: 25, w: 30, h: 20 }
];

function startPrecisionChallenge() {
    miniGameActive = 'precision';
    miniGameState = {
        score: 0,
        hits: 0,
        misses: 0,
        timeLeft: 90,
        currentZone: null,
        zoneEl: null,
        streak: 0,
        bestStreak: 0
    };

    initMiniGameMatch();
    practiceMode = true;

    const el = safeGetElement('matchTimer');
    if (el) el.textContent = '1:30';

    createMiniGameHUD(`
        <div style="background:rgba(0,0,0,0.7);padding:8px 14px;border:1px solid rgba(33,150,243,0.4);color:#2196f3;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px">PRECISION</div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Score: <span id="mgPrecScore" style="color:#ffd700;font-weight:700">0</span></div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Streak: <span id="mgPrecStreak" style="color:#4caf50;font-weight:700">0</span></div>
        <div style="background:rgba(0,0,0,0.7);padding:6px 14px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px">Zone: <span id="mgPrecZone" style="color:#2196f3;font-weight:700">--</span></div>
        <button onclick="endPrecisionChallenge()" style="padding:8px 14px;background:rgba(244,67,54,0.8);border:2px solid #f44336;color:#fff;font-size:11px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">EXIT</button>
    `);

    // Pick first zone
    pickNewPrecisionZone();

    // Timer
    miniGameTimer = setInterval(() => {
        miniGameState.timeLeft--;
        const el = safeGetElement('matchTimer');
        if (el) {
            const m = Math.floor(miniGameState.timeLeft / 60);
            const s = miniGameState.timeLeft % 60;
            el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
        if (miniGameState.timeLeft <= 0) {
            endPrecisionChallenge();
        }
    }, 1000);

    setTimeout(() => feedPracticeBall(), 1000);
}

function pickNewPrecisionZone() {
    // Remove old zone visual
    if (miniGameState.zoneEl) {
        miniGameState.zoneEl.remove();
        miniGameState.zoneEl = null;
    }

    const zone = PRECISION_ZONES[Math.floor(Math.random() * PRECISION_ZONES.length)];
    miniGameState.currentZone = zone;

    const court = document.querySelector('.court');
    if (!court) return;

    const el = document.createElement('div');
    el.className = 'mg-zone';
    el.style.cssText = `position:absolute;left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%;border:3px solid rgba(33,150,243,0.6);background:rgba(33,150,243,0.12);z-index:14;pointer-events:none;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:14px;color:rgba(33,150,243,0.8);letter-spacing:2px;animation:serviceBoxPulse 2s ease-in-out infinite`;
    el.textContent = zone.name;
    court.appendChild(el);
    miniGameState.zoneEl = el;

    const zoneNameEl = document.getElementById('mgPrecZone');
    if (zoneNameEl) zoneNameEl.textContent = zone.name;
}

function checkPrecisionZone(ballX, ballY) {
    if (miniGameActive !== 'precision' || !miniGameState.currentZone) return;

    const z = miniGameState.currentZone;
    const inZone = ballX >= z.x && ballX <= z.x + z.w && ballY >= z.y && ballY <= z.y + z.h;

    if (inZone) {
        miniGameState.hits++;
        miniGameState.streak++;
        if (miniGameState.streak > miniGameState.bestStreak) {
            miniGameState.bestStreak = miniGameState.streak;
        }
        // Bonus points for streaks
        const bonus = Math.min(miniGameState.streak, 5);
        const pts = 25 + (bonus * 10);
        miniGameState.score += pts;

        // Flash zone green
        if (miniGameState.zoneEl) {
            miniGameState.zoneEl.style.borderColor = '#4caf50';
            miniGameState.zoneEl.style.background = 'rgba(76,175,80,0.3)';
            miniGameState.zoneEl.style.color = '#4caf50';
            miniGameState.zoneEl.textContent = '+' + pts;
        }

        setTimeout(() => pickNewPrecisionZone(), 600);
    } else if (ballY < 50) {
        // Hit opponent side but wrong zone
        miniGameState.misses++;
        miniGameState.streak = 0;
        miniGameState.score += 5; // small consolation

        // Flash zone red briefly
        if (miniGameState.zoneEl) {
            miniGameState.zoneEl.style.borderColor = '#f44336';
            miniGameState.zoneEl.style.background = 'rgba(244,67,54,0.15)';
            setTimeout(() => {
                if (miniGameState.zoneEl) {
                    miniGameState.zoneEl.style.borderColor = 'rgba(33,150,243,0.6)';
                    miniGameState.zoneEl.style.background = 'rgba(33,150,243,0.12)';
                }
            }, 400);
        }
    }

    // Update HUD
    const scoreEl = document.getElementById('mgPrecScore');
    if (scoreEl) scoreEl.textContent = miniGameState.score;
    const streakEl = document.getElementById('mgPrecStreak');
    if (streakEl) streakEl.textContent = miniGameState.streak;
}

function endPrecisionChallenge() {
    const st = miniGameState;
    if (st.zoneEl) { st.zoneEl.remove(); st.zoneEl = null; }
    const total = st.hits + st.misses;
    const acc = total > 0 ? Math.round((st.hits / total) * 100) : 0;

    practiceMode = false;
    showMiniGameResults(
        'PRECISION',
        st.score,
        makeDetailRow('Zone Hits', st.hits) +
        makeDetailRow('Misses', st.misses) +
        makeDetailRow('Accuracy', acc + '%') +
        makeDetailRow('Best Streak', st.bestStreak) +
        makeDetailRow('Time', (90 - st.timeLeft) + 's'),
        'precision'
    );
}

// ========== HOOK INTO GAME LOOP ==========
// We need to intercept ball position updates to check mini-game events.
// This is done by patching into the existing game loop.

// Track ball crossing into opponent half for target/precision checks
let _lastBallY = 100;

function miniGameBallUpdate(ballX, ballY) {
    if (!miniGameActive) return;

    if (miniGameActive === 'target') {
        if (_lastBallY > 50 && ballY < 50) {
            // Ball just crossed into opponent half - will check on landing
        }
        if (ballY < 50) {
            checkTargetHits(ballX, ballY);
        }
    }

    if (miniGameActive === 'precision') {
        if (_lastBallY > 50 && ballY < 50) {
            checkPrecisionZone(ballX, ballY);
        }
    }

    _lastBallY = ballY;
}

// Hook: When player hits ball in speed challenge, count it
function miniGameOnPlayerHit() {
    if (miniGameActive === 'speed') {
        onSpeedChallengeHit();
    }
}

// Hook: When ball is missed/out in speed challenge
function miniGameOnBallMiss() {
    if (miniGameActive === 'speed') {
        onSpeedChallengeMiss();
    }
}

// Hook: When practice ball needs feeding after a return in speed mode
function miniGameFeedBall() {
    if (miniGameActive === 'speed') {
        setTimeout(() => feedSpeedBall(), 800);
        return true;
    }
    return false;
}
