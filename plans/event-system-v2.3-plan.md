# Plan: Enhanced Random Events System v2.3.0

## Overview

Comprehensive overhaul of the random event system with:
- **Event modal dialog** that pauses actions and allows player choice (Continue/Stop Action)
- **15 new events** (80% minor flavor, 20% major impact)
- **Action-specific events** (work accidents, panhandling success, etc.)
- **Re-enabled per-hour events** during multi-hour actions
- **Enhanced UI** with color-coded logs, icons, and visual severity indicators

## Current State

### Existing Architecture (v2.2.0)
- **EventManager class** (js/events.js): Fully functional with 5 events
- **Location/time filtering**: Context-aware (robbery only at park at night)
- **Two trigger mechanisms**:
  - ✅ End-of-turn events (ENABLED) - advanceTime() at line 309
  - ❌ Per-hour events (DISABLED) - executeHourTick() lines 248-265
- **Disabled reason**: "DISABLED FOR DEBUGGING" to prevent event spam

### Current Events
| Event | Effect | Chance | Filters |
|-------|--------|--------|---------|
| find-money | +£5-20 | 15% | Not at shelter |
| get-robbed | -£10-40 | 10% | Park + night only |
| get-sick | -15 health | 12% | Not at shelter |
| receive-food | +30 hunger | 10% | London City + day only |
| nothing | None | 53% | Fallback |

## User Requirements

Based on user feedback:
1. **Scope**: Comprehensive overhaul (re-enable per-hour, add events, action-specific)
2. **Balance**: Mixed approach (80% minor flavor, 20% major consequences)
3. **UI/UX**:
   - Color-coded log entries
   - Event icons/emojis
   - **Event dialog modal** that pauses action
   - Continue/Stop Action buttons
   - Visual severity indicators

## Recommended Implementation Approach

### 1. Event Modal System (Core Innovation)

**Architecture:**
- Modal pauses action execution mid-loop using async/await
- User chooses: Continue (resume) or Stop Action (cancel remaining hours)
- Modal displays: icon, message, stat changes, severity styling

**Key Technical Challenge:**
The existing `executeAction()` loop (game.js:154) is already async for animation. We'll inject modal pause points in `executeHourTick()` by making it async and awaiting user input.

**Implementation Strategy:**
```javascript
// game.js - Make executeHourTick async
async executeHourTick(hourIndex, totalHours, currentAction, eventTriggered) {
    // ... starvation logic ...

    // Re-enable events with modal pause
    if (Math.random() < perHourProbability && !eventTriggered) {
        const event = this.eventManager.triggerWithContext(this.player, context);
        if (event) {
            // PAUSE: Show modal and await user choice
            const shouldContinue = await this.ui.showEventModal(event);
            if (!shouldContinue) {
                return { stopAction: true, event, ... };
            }
        }
    }

    return { stopAction: false, ... };
}
```

### 2. Enhanced Event Data Structure

**New Event Schema:**
```javascript
{
    id: 'work-accident',
    message: "You injured yourself at work!",
    icon: '🤕',              // NEW: Visual icon
    severity: 'moderate',    // NEW: minor|moderate|major|critical
    type: 'negative',        // NEW: positive|negative|neutral
    effect: (player) => {
        player.modifyHealth(-15);
        return { health: -15 }; // Return changes for modal display
    },
    chance: 0.08,
    filters: {
        locations: ['london-city', 'camden-town'],
        times: null,
        actions: ['work'],           // NEW: Action-specific
        conditions: (player) => player.health < 50  // NEW: Dynamic
    }
}
```

### 3. New Event Catalog (15 Events)

**Minor Events (12 total - 80%):**
1. **pocket-change** (💰, +£2-5) - Found coins
2. **friendly-chat** (😊, +5 health) - Uplifting conversation
3. **minor-stumble** (🤕, -5 health) - Tripped
4. **discarded-food** (🥪, +8 hunger) - Found sandwich at lunch
5. **suspicious-looks** (👀, -3 health) - Uncomfortable stares
6. **rain-shower** (🌧️, -4 health, -3 hunger) - Caught in rain
7. **helpful-tip** (💡, no effect) - Advice from another homeless person
8. **free-newspaper** (📰, +3 health) - Blanket for sleep
9. **drink-water** (💧, +5 hunger, +2 health) - Public fountain
10. **avoid-conflict** (🏃, -2 hunger) - Ran from aggressor
11. **cigarette-find** (🚬, +£3-8) - Sold found cigarettes
12. **bus-ticket** (🎫, +3 hunger) - Saved walking energy

**Major Events (3 total - 20%):**
13. **generous-donation** (💸, +£40-70) - Wealthy donor while panhandling
14. **work-accident** (🏥, -30 health, -£20-40) - Injury at Camden work
15. **police-harassment** (👮, -£30-60, -10 health) - Nighttime harassment

### 4. Per-Hour Event Re-enabling

**Strategy:**
- Reduce total probability: 0.15 (down from 0.20) to reduce spam
- Max 1 event per action (use `eventTriggered` flag)
- Use existing formula: `1 - Math.pow(1 - 0.15, 1/totalHours)`
- Make `executeHourTick()` async for modal integration

**Modified Flow:**
```
executeAction() loop
  → For each hour:
     → calculatePerHourStats()
     → animateOneHour()
     → await executeHourTick() [NOW ASYNC]
        → IF event triggers:
           → await showEventModal()
           → IF user clicks Stop: return {stopAction: true}
        → return results
     → IF stopAction: break loop early
```

### 5. Event Modal UI Design

**HTML Structure** (add to index.html after line 105):
```html
<div class="event-modal-overlay hidden" id="event-modal-overlay">
    <div class="event-modal" id="event-modal">
        <div class="event-modal-header">
            <div class="event-icon" id="event-icon">⚠️</div>
            <h2 class="event-title">Random Event</h2>
        </div>
        <div class="event-modal-body">
            <p class="event-message" id="event-message"></p>
            <div class="event-effects" id="event-effects"></div>
        </div>
        <div class="event-modal-footer">
            <button class="event-btn event-continue">Continue Action</button>
            <button class="event-btn event-stop">Stop Action</button>
        </div>
    </div>
</div>
```

**CSS Styling** (add to css/styles.css):
- Full-screen overlay with dark background
- Centered modal with severity-based border colors
- Animated entrance (fadeIn + slideDown)
- Icon bounce animation
- Color-coded effect display (green/red/gray)
- Severity classes: .minor (blue), .moderate (yellow), .major (red), .critical (red+pulse)

### 6. Enhanced Logging System

**Color-Coded Event Logs:**
```css
.log-entry.event-positive {
    color: #4ecb71;
    border-left: 3px solid #4ecb71;
}
.log-entry.event-negative {
    color: #ff6b6b;
    border-left: 3px solid #ff6b6b;
}
.log-entry.event-neutral {
    color: #ffd700;
    border-left: 3px solid #ffd700;
}
```

**Updated addLog() method:**
```javascript
addLog(message, type = 'neutral', day, time, isEvent = false) {
    const entry = {
        message,
        type: isEvent ? `event-${type}` : type  // Prefix for styling
    };
    // ... rest of method
}
```

## Implementation Phases

### Phase 1: Event Modal Foundation (Priority: HIGH)
**Estimated: 3-4 hours**

Tasks:
1. Add modal HTML to index.html (after line 105)
2. Add modal CSS to styles.css (new section)
3. Add modal elements to UIManager constructor
4. Implement `showEventModal()` - returns Promise<boolean>
5. Implement `renderEventEffects()` - display stat changes
6. Test modal with hardcoded data

Success Criteria:
- Modal displays centered with correct styling
- Severity classes change border colors
- Buttons resolve promise correctly
- Modal dismisses cleanly

### Phase 2: Event Data Structure Update (Priority: HIGH)
**Estimated: 2-3 hours**

Tasks:
1. Update EventManager to support new event schema
2. Implement `filterEventsByContext()` method
3. Implement `triggerWithContext()` method
4. Add all 15 new events to events.js
5. Migrate existing 5 events to new structure

Success Criteria:
- Events filter by location/time/action
- Custom conditions work correctly
- Effects return stat change objects
- No breaking changes to existing code

### Phase 3: Per-Hour Event Re-enabling (Priority: CRITICAL)
**Estimated: 3-4 hours**

Tasks:
1. Make `executeHourTick()` async
2. Add parameters: currentAction, eventTriggered
3. Uncomment and update event trigger code (lines 248-265)
4. Integrate modal pause/resume logic
5. Update `executeAction()` to handle stopAction
6. Add eventTriggered flag to prevent spam

Success Criteria:
- Events trigger during multi-hour actions
- Modal pauses action correctly
- Continue resumes all action types
- Stop cancels remaining hours
- Max 1 event per action enforced

### Phase 4: Enhanced Logging & UI (Priority: MEDIUM)
**Estimated: 2 hours**

Tasks:
1. Update `addLog()` to accept isEvent parameter
2. Add CSS for event log styling
3. Add event icons to log messages
4. Test color-coding across all event types

Success Criteria:
- Event logs have colored left borders
- Icons display correctly in logs
- Events visually distinct from regular logs
- No layout issues

### Phase 5: Testing & Balancing (Priority: HIGH)
**Estimated: 3-4 hours**

Tasks:
1. Manual test all 15 events
2. Test event filtering (location/time/action/conditions)
3. Test modal during each action type
4. Test Stop Action at different hours
5. Adjust probabilities for game balance
6. Test edge cases (last hour, multiple events, etc.)

Success Criteria:
- Events feel natural (not spammy)
- Major events are impactful but rare
- Minor events add flavor
- No crashes or broken states
- Game remains balanced

## Critical Files to Modify

### Priority 1 (Core System)
1. **js/events.js** - Event catalog and filtering logic
   - Lines 6-51: Replace with 15 new events
   - After line 57: Add `filterEventsByContext()`
   - Lines 59-105: Replace with `triggerWithContext()`

2. **js/game.js** - Event triggering and modal integration
   - Lines 10-13: Add state variables (eventModalActive, actionCancelled)
   - Lines 154-230: Update `executeAction()` loop for stopAction
   - Lines 234-274: Make `executeHourTick()` async, re-enable events

3. **js/ui.js** - Modal display and enhanced logging
   - Lines 7-27: Add eventModalElements to constructor
   - After line 693: Add `showEventModal()` (~40 lines)
   - After showEventModal: Add `hideEventModal()` (~10 lines)
   - After hideEventModal: Add `renderEventEffects()` (~50 lines)
   - Lines 368-384: Update `addLog()` for event styling

### Priority 2 (Presentation)
4. **index.html** - Modal HTML structure
   - After line 105: Add event modal markup

5. **css/styles.css** - Modal and event styling
   - End of file: Add modal section (~150 lines)
   - Add event log entry styles (~20 lines)

### Priority 3 (Documentation)
6. **CLAUDE.md** - Documentation
   - Update version to 2.3.0
   - Add "Enhanced Event System" section
   - Document event structure and modal usage
   - Update version history

## Key Technical Decisions

### 1. Async/Await for Modal Pause
**Rationale:** Cleanest way to pause action loop without complex state machines. Existing `executeAction()` is already async for animations.

### 2. Max 1 Event Per Action
**Rationale:** Prevents event spam during long actions (7-hour work). Maintains pacing and prevents modal fatigue.

### 3. Reduced Total Probability (0.15 vs 0.20)
**Rationale:** With 15 events (vs 5), more variety means lower total probability feels better. ~15% per action is balanced.

### 4. Action-Specific Filtering
**Rationale:** Creates contextual storytelling (work accidents during work, generous donors during panhandling). More immersive.

### 5. Severity-Based Presentation
**Rationale:** Critical events deserve visual emphasis (pulsing red border). Communicates impact before reading text.

## Risk Mitigation

### Risk: Modal breaks action animation flow
**Mitigation:** Test all action types (work, sleep, panhandle, steal, food, rest) with Continue and Stop buttons.

### Risk: Events feel too frequent/rare
**Mitigation:** Phase 5 includes extensive balancing. Start conservative (0.15), adjust based on playtesting.

### Risk: Stop Action creates broken game state
**Mitigation:** Ensure stats are clamped after partial action, log shows cancelled message, UI updates correctly.

### Risk: Custom conditions cause errors
**Mitigation:** Wrap condition functions in try/catch in `filterEventsByContext()`.

## Success Metrics

**Gameplay:**
- Events trigger ~1 per 2-3 actions (feels natural, not spammy)
- Major events occur ~1 per 10-15 actions (rare but memorable)
- Players use Stop Action ~20% of the time when bad events occur
- Events add narrative depth without breaking balance

**Technical:**
- No crashes or console errors
- Modal responsive on all screen sizes
- Action animations resume smoothly after modal
- Game state remains consistent

**User Experience:**
- Events feel impactful and contextual
- Modal is visually appealing and clear
- Color-coding makes event types immediately recognizable
- Stop Action provides meaningful player agency

## Future Enhancements (Post-v2.3.0)

- **Event chains**: Multi-stage events that unlock follow-ups
- **Event history**: Track triggered events for achievements
- **Choice-based events**: Modal with 2-3 choice buttons (risk/reward)
- **Dynamic scaling**: Event severity scales with player stats
- **Weather system**: Weather events that persist across actions

## Estimated Total Time

**Development:** 13-17 hours
**Testing:** 3-4 hours
**Documentation:** 1-2 hours
**Total:** 17-23 hours

## Version Designation

**Version:** 2.3.0 - Enhanced Random Events
**Release Name:** "Choose Your Fate"
