# 🎾 Tennis Physics Arbiter Report
## Championship Tennis - Physics Analysis

**Date:** February 7, 2026  
**Reviewer:** AI Physics Arbiter  
**Game Version:** v7 (Refinement Release)

---

## Executive Summary

The game has solid foundational physics but several constants need adjustment to better simulate real tennis while maintaining playability. The primary issues are:

1. **Ball size too small** for visibility (Critical)
2. **Bounce damping too aggressive** - balls die too quickly (High)
3. **Gravity constant inconsistent** between serve and rally (Medium)
4. **Spin effects too subtle** to feel impactful (Medium)
5. **Ball arc visual offset needs tuning** (Medium)

---

## 1. Ball Physics Realism

### 1.1 Ball Size
**Status:** ⚠️ CRITICAL

| Property | Current | Recommended | Reasoning |
|----------|---------|-------------|-----------|
| Ball width | 14px | 18-22px | Too small on mobile, hard to track |
| Ball height | 14px | 18-22px | Real tennis balls appear larger relative to court |

**Code Location:** Line ~205
```css
/* CURRENT */
.ball{position:absolute;width:14px;height:14px;background:radial-gradient(circle at 30% 30%,#fcf836,#c9d11a);...}

/* RECOMMENDED */
.ball{position:absolute;width:20px;height:20px;background:radial-gradient(circle at 30% 30%,#fcf836,#c9d11a);...}
```

Also update shadow at line ~215:
```css
/* CURRENT */
.ball-shadow{position:absolute;width:20px;height:8px;...}

/* RECOMMENDED */
.ball-shadow{position:absolute;width:26px;height:10px;...}
```

---

### 1.2 Gravity/Arc of Shots
**Status:** ⚠️ HIGH PRIORITY

The game uses two different gravity constants:

| Context | Current Value | Line | Issue |
|---------|--------------|------|-------|
| Rally gravity | 0.15 | ~1937 | Consistent |
| Serve gravity | 0.12 | ~859 | Inconsistent with rally |
| Return gravity | 0.15 | ~2031 | Matches rally |

**Problem:** Serve balls float slightly more than rally balls, creating inconsistent feel.

**Recommended Changes:**

```javascript
// Line ~859 (animateServeBall function)
/* CURRENT */  M.ballVel.z -= 0.12;
/* RECOMMENDED */ M.ballVel.z -= 0.14;

// Line ~1937 (animateBall function) - Keep as is
M.ballVel.z -= 0.15; // Good for rally feel

// Line ~2031 (animateReturn function) - Keep as is  
M.ballVel.z -= 0.15;
```

**Rationale:** Serves should have slightly less arc (0.14) because they're hit harder and flatter, but not dramatically different from rallies.

---

### 1.3 Bounce Behavior
**Status:** ⚠️ HIGH PRIORITY

| Property | Current | Real Tennis | Recommended | Line |
|----------|---------|-------------|-------------|------|
| Bounce coefficient | 0.65 | 0.73-0.75 | 0.72 | ~1952, ~2040, ~865 |
| Serve bounce | 0.6 | N/A | 0.68 | ~865 |

A tennis ball bounces to ~54% of drop height on hard court, meaning ~73% velocity retention.

**Code Changes:**

```javascript
// Line ~865 (serve bounce in animateServeBall)
/* CURRENT */  M.ballVel.z = -M.ballVel.z * 0.6;
/* RECOMMENDED */ M.ballVel.z = -M.ballVel.z * 0.68;

// Line ~1952 (rally bounce in animateBall)
/* CURRENT */  M.ballVel.z = -M.ballVel.z * 0.65;
/* RECOMMENDED */ M.ballVel.z = -M.ballVel.z * 0.72;

// Line ~2040 (return bounce in animateReturn)
/* CURRENT */  M.ballVel.z = -M.ballVel.z * 0.65;
/* RECOMMENDED */ M.ballVel.z = -M.ballVel.z * 0.72;
```

---

### 1.4 Spin Effects
**Status:** ⚠️ MEDIUM

Current spin implementation is barely perceptible:

```javascript
// Line ~1942-1944
if(M.ballSpin !== 0){
    M.ballVel.x += M.ballSpin * 0.01;  // Too subtle!
}
```

| Property | Current | Recommended | Effect |
|----------|---------|-------------|--------|
| Spin curve factor | 0.01 | 0.025 | Visible curve on shots |
| Spin velocity (animateReturn) | 0.008 | 0.02 | Better spin visual |
| Initial spin range | ±0.5 | ±0.8 | More spin variety |

**Code Changes:**

```javascript
// Line ~1943 (animateBall)
/* CURRENT */  M.ballVel.x += M.ballSpin * 0.01;
/* RECOMMENDED */ M.ballVel.x += M.ballSpin * 0.025;

// Line ~2035 (animateReturn)
/* CURRENT */  M.ballVel.x += M.ballSpin * 0.008;
/* RECOMMENDED */ M.ballVel.x += M.ballSpin * 0.02;

// Line ~2012 (spin assignment in returnBall)
/* CURRENT */  M.ballSpin = Math.sin(angle) * 0.5;
/* RECOMMENDED */ M.ballSpin = Math.sin(angle) * 0.8;
```

---

### 1.5 Ball Speed Relative to Court Size
**Status:** ✅ ACCEPTABLE (minor tweaks)

Current speed settings feel appropriate:

| Difficulty | Speed Mult | Opp Speed | Assessment |
|------------|------------|-----------|------------|
| Rookie | 1.1 | 0.07 | Good for beginners |
| Pro | 1.5 | 0.11 | Balanced |
| Legend | 2.0 | 0.16 | Very fast, challenging |

**Minor Recommendation:** Reduce legend speed slightly for playability:

```javascript
// Line ~573 (DIFF object)
/* CURRENT */  legend:{speed:2,...}
/* RECOMMENDED */ legend:{speed:1.85,...}
```

---

### 1.6 Ball Height Visual Offset
**Status:** ⚠️ MEDIUM

The ball's visual height offset affects perceived arc quality:

```javascript
// Line ~872, ~1973, ~2050
ball.style.top = (M.ballPos.y - M.ballH/12) + '%';
```

| Divisor | Effect | Feel |
|---------|--------|------|
| /12 (current) | Subtle arc | Flat looking |
| /10 (recommended) | More pronounced arc | More "tennisy" |
| /8 | Exaggerated arc | Arcade feel |

**Recommendation:** Change divisor from 12 to 10:

```javascript
// All three locations (~872, ~1973, ~2050)
/* CURRENT */  ball.style.top = (M.ballPos.y - M.ballH/12) + '%';
/* RECOMMENDED */ ball.style.top = (M.ballPos.y - M.ballH/10) + '%';
```

---

## 2. Court Proportions

### 2.1 Court Layout
**Status:** ✅ GOOD

```css
.court{position:absolute;top:12%;left:8%;right:8%;bottom:12%}
```

The court uses 84% width and 76% height - reasonable for the perspective view.

### 2.2 Service Box Accuracy
**Status:** ✅ ACCEPTABLE

| Element | Position | Real Tennis | Assessment |
|---------|----------|-------------|------------|
| Service line (top) | 27% from top | ~25% | Slightly off, acceptable |
| Service line (bottom) | 27% from bottom | ~25% | Matches top |
| Net | 50% | 50% | Perfect |
| Center service line | 50% horizontal | 50% | Perfect |

**Minor Issue:** Service boxes CSS positions don't perfectly match the line positions:

```css
// Line ~271-272
/* CURRENT */
.service-box.deuce{top:27%;bottom:50%;left:50%;right:12%}
.service-box.ad{top:27%;bottom:50%;left:12%;right:50%}
```

This is correct and matches the service lines.

### 2.3 Net Height/Position
**Status:** ✅ GOOD

```css
.net{top:50%;left:-2%;right:-2%;height:6px;...}
```

Net at exactly 50% is correct for the top-down perspective. Height of 6px is proportionally correct.

---

## 3. Shot Mechanics

### 3.1 Serve Physics
**Status:** ⚠️ MEDIUM (improvements possible)

#### Toss Mechanics
Current toss is purely visual (CSS animation):
```css
.ball.toss{animation:ballToss 0.6s ease-out}
@keyframes ballToss{0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-150%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(1)}}
```

**Issue:** Toss goes 150% upward which is dramatic but acceptable for game feel.

#### Serve Speed Calculation (Line ~835-836)
```javascript
const baseServeSpeed = 80 + power * 40 + st.serve * 0.2;
M.lastServeSpeed = Math.round(baseServeSpeed + (Math.random() - 0.5) * 10);
```

| Power | Serve Stat | Speed Range | Real Pro Range |
|-------|------------|-------------|----------------|
| 0% | 10 | 77-87 MPH | 90-110 (2nd) |
| 100% | 10 | 117-127 MPH | 120-140 (1st) |
| 100% | 50 | 127-137 MPH | 130-150 (1st) |

**Recommendation:** Increase base and range:

```javascript
// Line ~835
/* CURRENT */  const baseServeSpeed = 80 + power * 40 + st.serve * 0.2;
/* RECOMMENDED */ const baseServeSpeed = 90 + power * 50 + st.serve * 0.3;
```

This gives:
- Min: ~85 MPH (weak 2nd serve)
- Max: ~155 MPH (elite 1st serve with high serve stat)

#### Serve Initial Ball Height
```javascript
// Line ~850-851
M.ballH = 60;  // Good starting height
```

This is appropriate - ball starts high to simulate contact point.

### 3.2 Groundstroke Trajectories
**Status:** ✅ GOOD

```javascript
// Line ~2003-2009 (returnBall function)
M.ballH = 30;
M.ballVel = {
    x: Math.max(-1.3, Math.min(1.3, (ang + pos) * 0.75)),
    y: -1.6 * spd * qual * 0.65,
    z: 2.5 * qual
};
```

- X velocity capped at ±1.3 (reasonable angle limits)
- Y velocity scales with power and quality
- Z velocity (initial upward) scales with quality

**Minor Enhancement:** Add slight forward velocity variation:

```javascript
// Line ~2007
/* CURRENT */  y: -1.6 * spd * qual * 0.65,
/* RECOMMENDED */ y: -1.6 * spd * qual * (0.55 + Math.random() * 0.2),
```

### 3.3 Return Angles
**Status:** ✅ GOOD

The angle calculation accounts for player position offset:
```javascript
const off = M.playerPos - M.ballPos.x;
const ang = Math.sin(angle) * 1.1 * ctrl;
const pos = off * 0.018;
```

This creates realistic angle variation based on:
- Swipe direction (angle)
- Player control stat
- Ball-to-player offset

---

## 4. Priority Summary

### Critical (Fix Immediately)
| Issue | Line(s) | Current | Change To |
|-------|---------|---------|-----------|
| Ball width | ~205 | 14px | 20px |
| Ball height | ~205 | 14px | 20px |
| Ball shadow width | ~215 | 20px | 26px |

### High Priority
| Issue | Line(s) | Current | Change To |
|-------|---------|---------|-----------|
| Rally bounce damping | ~1952 | 0.65 | 0.72 |
| Return bounce damping | ~2040 | 0.65 | 0.72 |
| Serve bounce damping | ~865 | 0.6 | 0.68 |

### Medium Priority
| Issue | Line(s) | Current | Change To |
|-------|---------|---------|-----------|
| Serve gravity | ~859 | 0.12 | 0.14 |
| Spin curve (animateBall) | ~1943 | 0.01 | 0.025 |
| Spin curve (animateReturn) | ~2035 | 0.008 | 0.02 |
| Spin range | ~2012 | 0.5 | 0.8 |
| Ball height divisor | ~872,1973,2050 | /12 | /10 |
| Serve speed base | ~835 | 80 + power*40 | 90 + power*50 |

### Low Priority
| Issue | Line(s) | Current | Change To |
|-------|---------|---------|-----------|
| Legend difficulty speed | ~573 | 2.0 | 1.85 |
| Groundstroke Y velocity | ~2007 | qual*0.65 | qual*(0.55+random*0.2) |

---

## 5. Complete Code Patch

Apply these changes for improved physics:

### CSS Changes (in `<style>` section)

```css
/* Line ~205 - Ball size */
.ball{position:absolute;width:20px;height:20px;background:radial-gradient(circle at 30% 30%,#fcf836,#c9d11a);border-radius:50%;transform:translate(-50%,-50%);z-index:40;display:none;box-shadow:0 3px 6px rgba(0,0,0,0.5)}

/* Line ~215 - Ball shadow */
.ball-shadow{position:absolute;width:26px;height:10px;background:radial-gradient(ellipse at center,rgba(0,0,0,0.4),transparent 70%);border-radius:50%;transform:translate(-50%,0);z-index:25;display:none}
```

### JavaScript Changes

```javascript
// Line ~573 - DIFF object (optional)
legend:{speed:1.85,oppSpeed:0.16,hitWindow:0.18,oppAcc:0.92,mult:3,time:180,serveFaultChance:0.35,oppServeSpeed:1.2}

// Line ~835 - Serve speed calculation
const baseServeSpeed = 90 + power * 50 + st.serve * 0.3;

// Line ~859 - Serve gravity
M.ballVel.z -= 0.14;

// Line ~865 - Serve bounce
M.ballVel.z = -M.ballVel.z * 0.68;

// Line ~872 - Serve ball visual position
ball.style.top = (M.ballPos.y - M.ballH/10) + '%';

// Line ~1937-1944 - Rally physics
M.ballVel.z -= 0.15; // Keep as is
if(M.ballSpin !== 0){
    M.ballVel.x += M.ballSpin * 0.025;
}

// Line ~1952 - Rally bounce
M.ballVel.z = -M.ballVel.z * 0.72;

// Line ~1973 - Rally ball visual position  
ball.style.top = (M.ballPos.y - M.ballH/10) + '%';

// Line ~2012 - Spin assignment
M.ballSpin = Math.sin(angle) * 0.8;

// Line ~2035 - Return spin effect
M.ballVel.x += M.ballSpin * 0.02;

// Line ~2040 - Return bounce
M.ballVel.z = -M.ballVel.z * 0.72;

// Line ~2050 - Return ball visual position
ball.style.top = (M.ballPos.y - M.ballH/10) + '%';
```

---

## 6. Testing Recommendations

After applying changes, test:

1. **Ball Visibility**: Ball should be easy to track at all difficulty levels
2. **Bounce Height**: Balls should bounce visibly higher (not die immediately)
3. **Arc Feel**: Ball trajectory should have smooth, visible parabolic arc
4. **Spin Effect**: Cross-court shots should curve slightly
5. **Serve Speed Display**: Speeds should feel proportional to displayed MPH
6. **Game Balance**: Ensure legend difficulty is still challenging but fair

---

## Conclusion

The game has a solid foundation. The most impactful changes are:

1. **Ball size increase** - Immediate visual improvement (Critical)
2. **Bounce coefficient adjustment** - Makes rallies feel more realistic (High)
3. **Arc visibility improvement** - Better ball tracking (Medium)

These changes will make the game FEEL like real tennis while maintaining its fun, arcade-accessible nature.

---

*Report generated by Tennis Physics Arbiter*
*Championship Tennis v7 Analysis*
