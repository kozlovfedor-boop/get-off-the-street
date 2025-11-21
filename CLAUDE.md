# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Get off the Street" is a turn-based survival RPG built with vanilla HTML, CSS, and JavaScript. No build process, dependencies, or frameworks required.

**Goal:** Player starts homeless and must survive to save £2,000 to rent an apartment.

**Current Version:** 2.1.0 - UI Redesign with Progress Bars

## Running the Game

```bash
open index.html
```

No server required - opens directly in browser.

## Architecture (Modular Class-Based)

The codebase follows a **modular class-based architecture** for scalability:

### File Structure

```
/street
├── index.html              # Main HTML (minimal, just structure)
├── css/
│   └── styles.css          # All styles separated from HTML
├── js/
│   ├── config.js           # Game configuration and constants
│   ├── player.js           # Player class - state management
│   ├── time.js             # TimeManager class - 24-hour clock
│   ├── locations.js        # LocationManager class - locations & travel
│   ├── events.js           # EventManager class - random events
│   ├── actions/            # Action system (factory pattern + inheritance)
│   │   ├── base-action.js      # BaseAction class - abstract base
│   │   ├── action-utils.js     # Shared utility functions
│   │   ├── work-action.js      # WorkAction class
│   │   ├── panhandle-action.js # PanhandleAction class
│   │   ├── find-food-action.js # FindFoodAction class
│   │   ├── sleep-action.js     # SleepAction class
│   │   ├── steal-action.js     # StealAction class
│   │   ├── eat-action.js       # EatAction class
│   │   └── action-factory.js   # createAction() factory function
│   ├── ui.js               # UIManager class - DOM manipulation
│   └── game.js             # Game class - main controller
└── README.md
```

### Module Responsibilities

**config.js** - Central configuration
- All game constants (win conditions, stat limits, time costs)
- Location IDs
- Easy to modify for game balance
- No logic, just data

**player.js** - Player state
- `Player` class manages all player stats (money, health, hunger, day)
- Methods: `addMoney()`, `modifyHealth()`, `modifyHunger()`, `nextDay()`
- Win/lose condition checks: `isAlive()`, `hasWon()`, `isStarving()`
- Stat clamping to valid ranges

**time.js** - Time management (NEW in v2.0)
- `TimeManager` class handles 24-hour clock (0-23 with decimal hours for minutes)
- `advanceTime(hours)` - advances time and returns days elapsed
- `isTimeBetween(start, end)` - checks if current time is in range
- `formatTime()` - converts decimal hours to HH:MM format
- `isDaytime()`, `isNighttime()` - time period checks

**locations.js** - Location system (NEW in v2.0)
- `LocationManager` class with 4 locations: london-city, camden-town, shelter, park
- Each location has: name, description, available actions, travel times to other locations
- `isActionAvailable(action)` - checks location + time restrictions
- `getRiskModifier(action)` - returns police/robbery risk for location
- `getPayModifier()` - returns salary multiplier for location
- `travel(destinationId)` - moves player to new location

**events.js** - Random event system
- `EventManager` class handles probability-based events
- Events filtered by location and time (e.g., robbery only at park at night)
- Each event: `{id, message, effect, chance}`
- `trigger()` uses cumulative probability distribution
- Extensible: `addEvent()`, `removeEvent()`, `getEvent()` methods

**actions/** - Action System (Factory Pattern + Inheritance)
- **Factory Pattern**: `createAction()` instantiates appropriate action class based on type
- **Inheritance**: All actions extend `BaseAction` class
- **BaseAction** (base-action.js):
  - Abstract base class with common functionality
  - Methods: `isInstant()`, `applyStats()`, `clampStats()`, `random()`
  - Abstract methods to override: `execute()`, `calculatePerHourStats()`, `generateLogMessage()`
- **Individual Action Classes**:
  - `WorkAction` (work-action.js) - 7 hours, deferred payment, accumulates earnings
  - `PanhandleAction` (panhandle-action.js) - 3 hours, immediate payment each hour
  - `FindFoodAction` (find-food-action.js) - 2 hours, random hunger gain per hour
  - `SleepAction` (sleep-action.js) - 7/2 hours, health recovery (location-dependent)
  - `StealAction` (steal-action.js) - 1 hour, risky outcomes (police/robbery)
  - `EatAction` (eat-action.js) - Instant, dedicated shelter action
- **Action Factory** (action-factory.js): Creates appropriate action instance via switch statement
- **Action Utils** (action-utils.js): Shared utilities (`random()`, `applyStarvation()`)

**ui.js** - UI management
- `UIManager` class handles all DOM updates
- Methods: `updateStats()`, `updateTime()`, `updateLocation()`, `addLog()`, `showGameOver()`, `showVictory()`
- `renderActionButtons()` - dynamically creates buttons based on location + time
- `showTravelMenu()` - displays travel destination options
- Manages log entries (max 20 entries)
- Handles progress bar updates and critical state animations
- Event-driven via dynamically created buttons

**game.js** - Main controller
- `Game` class orchestrates all other modules
- Owns instances of: Player, TimeManager, LocationManager, EventManager, UIManager
- Uses: Action factory pattern (no ActionManager instance)
- `performAction(actionType)` - creates action via factory, executes it
- `executeAction(action, result)` - hour-by-hour execution with per-hour stats and logging
- `travel(destinationId)` - handles location changes
- `advanceTime(hours)` - processes time advancement, starvation, events, game state
- Turn flow: action creation → execution → per-hour processing → time advance → starvation check → random event → game state check → UI update

### Data Flow

```
User clicks action button
  ↓
UIManager dynamically created onclick calls game.performAction('work')
  ↓
Game checks locationManager.isActionAvailable('work')
  ↓
Game calls createAction('work', player, locationManager, timeManager)
  ↓
Factory returns WorkAction instance
  ↓
Game calls workAction.execute()
  ↓
WorkAction uses locationManager.getPayModifier() to calculate earnings
Returns {type, message, logType, timeCost, statChanges, perHourCalculation}
  ↓
Game calls game.executeAction(workAction, result)
  ↓
For each hour (hour-by-hour execution):
  - workAction.calculatePerHourStats(hourIndex) → {moneyChange, healthChange, hungerChange}
  - Animate time and stats for this hour
  - workAction.clampStats() → enforce stat limits
  - workAction.generateLogMessage() → per-hour log entry
  - executeHourTick() → starvation check, random events, game state check
  ↓
If deferred payment (work):
  - workAction.getFinalPayment() → accumulated earnings
  - workAction.getFinalLogMessage() → final summary
  ↓
Game calls ui.updateAll(player)
  ↓
UI updates: stats, time display, location display, re-renders action buttons
```

### Key Game Systems

**Action System Architecture**

The action system uses a **factory pattern** with **inheritance** for flexible, maintainable action handling.

*Design Pattern:*
```
BaseAction (Abstract)
├── WorkAction
├── PanhandleAction
├── FindFoodAction
├── SleepAction
├── StealAction
└── EatAction
```

*Action Lifecycle:*
1. **Creation**: Factory creates appropriate action instance via `createAction(type, player, locationManager, timeManager)`
2. **Execution**: `action.execute()` generates outcome → returns `{type, message, logType, timeCost, statChanges, perHourCalculation}`
3. **Per-Hour Processing**: For each hour, `action.calculatePerHourStats(hourIndex)` → `{moneyChange, healthChange, hungerChange}`
4. **Logging**: For each hour, `action.generateLogMessage(hourIndex, totalHours, stats)` → formatted log entry
5. **Completion**: Final payment if deferred (work), game state checks

*Key Methods in BaseAction:*
- `execute()` - Generate action outcome (called once, returns result object)
- `calculatePerHourStats(hourIndex)` - Per-hour stat changes (called each hour)
- `generateLogMessage(hourIndex, totalHours, stats)` - Per-hour log message (called each hour)
- `isInstant()` - Whether action completes instantly (timeCost === 0)
- `shouldDeferPayment()` - Whether to delay payment until end (work only)
- `applyStats(money, health, hunger)` - Apply stat changes to player
- `clampStats()` - Enforce stat limits (health 0-100, hunger 0-100, money >= 0)
- `random(min, max)` - Utility for random number generation

*Benefits:*
- **Separation of Concerns**: Each action in its own file
- **Open/Closed Principle**: Add new actions without modifying existing code
- **Testability**: Each action can be tested independently
- **Maintainability**: Clear structure, easy to locate action logic
- **Consistency**: All actions follow same interface and patterns

**Time System**
- Tracks decimal hours (9.5 = 9:30, 14.75 = 14:45)
- Actions consume different hours: Work=7, Sleep=7, Rest=2, Steal=1, Panhandle=2.5, etc.
- Day increments when hour >= 24
- Time displayed as HH:MM in UI

**Location System**
- 4 locations with different characteristics:
  - **London City**: Rich area, work 8am-6pm, high pay (1.5x), high police risk (30%)
  - **Camden Town**: Industrial, work 6am-10pm, normal pay (1.0x), moderate police risk (15%)
  - **Shelter**: Night only (6pm-8am), safe sleep, free meals at 6-8pm and 6-8am
  - **Park**: 24/7, risky sleep (25% robbery at night), can find food
- Travel costs time (0.5-1 hour) and hunger (3-8)

**Action Availability**
- Checked via `locationManager.isActionAvailable(action)`
- Returns `{available: boolean, reason: string}`
- Work requires correct location + time
- Eat requires shelter + meal time
- Sleep at shelter requires nighttime

**Event Filtering**
- Events filtered by location/time before probability roll
- Robbery only at park at night
- Sickness less likely at shelter
- Find money only outside shelter
- Generous strangers in London City during day

### Extending the Game

**Adding new stats:**
1. Update `CONFIG.INITIAL_STATS` in config.js
2. Add properties to Player class in player.js
3. Add UI elements to index.html
4. Update `UIManager.updateStats()` in ui.js

**Adding new actions:**

1. **Create new action class file** in `js/actions/` (e.g., `beg-action.js`):
   ```javascript
   // Beg action - ask for help (2 hours)
   class BegAction extends BaseAction {
       execute() {
           // Generate outcome and return result object
           const earnings = this.random(5, 15);
           const hungerCost = this.random(3, 7);

           return {
               type: 'beg',
               message: `You begged for help. Earned £${earnings}. Hunger -${hungerCost}.`,
               logType: 'neutral',
               timeCost: 2,
               statChanges: {
                   money: earnings,
                   health: 0,
                   hunger: -hungerCost
               },
               perHourCalculation: 'beg'
           };
       }

       calculatePerHourStats(hourIndex) {
           // Per-hour logic (random money each hour)
           return {
               moneyChange: this.random(2, 7),
               healthChange: 0,
               hungerChange: -this.random(1, 3)
           };
       }

       generateLogMessage(hourIndex, totalHours, stats) {
           // Log message for each hour
           return {
               message: `Begging: Hour ${hourIndex + 1}/${totalHours} - Earned £${stats.moneyChange}, Hunger ${stats.hungerChange}`,
               logType: 'neutral'
           };
       }
   }
   ```

2. **Add to factory** (`action-factory.js`):
   ```javascript
   case 'beg':
       return new BegAction(player, locationManager, timeManager);
   ```

3. **Add script tag** to `index.html` (after base-action.js, before action-factory.js):
   ```html
   <script src="js/actions/beg-action.js"></script>
   ```

4. **Add to location's actions array** in `locations.js`:
   ```javascript
   actions: ['work', 'food', 'beg', 'rest']  // Add 'beg'
   ```

5. **Add button styling** in `styles.css`:
   ```css
   .beg { background: linear-gradient(135deg, #9c27b0, #673ab7); }
   ```

6. **Add action name mapping** in `UIManager.createActionButton()` (ui.js):
   ```javascript
   case 'beg': return 'Beg for Help';
   ```

**Adding new locations:**
1. Add location object to `locations` in LocationManager constructor
2. Define: id, name, description, actions array, travelTime object
3. Update `CONFIG.LOCATIONS` if needed
4. Add location-specific logic in action class files if needed (e.g., pay modifiers in WorkAction)

**Adding new events:**
```javascript
game.eventManager.addEvent({
    id: 'new-event',
    message: "Something happened!",
    effect: (player) => {
        player.modifyHealth(-10);
        return "-10 health";
    },
    chance: 0.1
});
```

**Modifying time costs:**
- Update `CONFIG.TIME_COSTS` in config.js
- Affects how fast days pass

## Key Game Balance Values

All in `config.js`:
- `VICTORY_MONEY: 2000` - Money needed to win
- `VICTORY_MIN_HEALTH: 20` - Min health to win
- `STARVATION_THRESHOLD: 20` - Hunger below this causes health loss
- `INITIAL_HOUR: 6` - Start at 6:00 AM
- `INITIAL_LOCATION: 'park'` - Start at park
- `TIME_COSTS` - How long each action takes

Action ranges (in action class files):
- Work: £20-40 base * location modifier (London 1.5x, Camden 1.0x)
- Food (dumpster): +20-45 hunger
- Eat (shelter): +40-60 hunger
- Sleep (shelter): +30-50 health, safe
- Sleep (park): +20-35 health, 25% robbery risk at night
- Rest (streets): +10-20 health
- Panhandle: £15-35 (London City), £5-20 (elsewhere)
- Steal: 30% police (London), 15% police (Camden), then 70% success for £50-100

Location travel times in `locations.js`:
- Adjacent locations: 0.5 hours
- Far locations: 1 hour

Event probabilities in `events.js`:
- Filtered by location/time before roll
- 20% chance per action to trigger event
- Base chances: Find money 15%, Robbed 10%, Sick 12%, Food 10%, Nothing 53%

## Design Patterns Used

- **Factory Pattern**: Action creation via `createAction()` factory function
- **Template Method Pattern**: `BaseAction` with overridable methods (`execute()`, `calculatePerHourStats()`, `generateLogMessage()`)
- **Inheritance**: All action classes extend `BaseAction` for code reuse
- **Separation of Concerns**: Each class/module has single responsibility
- **Dependency Injection**: Classes receive dependencies via constructor
- **Dynamic UI**: Buttons created dynamically based on location/time state
- **Configuration Object**: All constants centralized in CONFIG
- **Manager Pattern**: Separate managers for Time, Location, Events, UI
- **State Machine**: Location and time determine available actions

## Common Development Tasks

**Testing location restrictions:**
- Use browser console: `game.timeManager.setTime(12)` to test different times
- Use `game.locationManager.currentLocation = 'shelter'` to test locations

**Debugging time display:**
- Check `timeManager.currentHour` (should be decimal, e.g. 9.5)
- Check `timeManager.formatTime()` output (should be string like "09:30")

**Adding new location:**
1. Add to `locations` object in LocationManager constructor
2. Define all required properties
3. Add travel times from/to other locations

**Balancing game difficulty:**
- Adjust pay in action class files (work-action.js, panhandle-action.js, etc.)
- Adjust time costs in config.js
- Adjust risk modifiers in locations.js
- Adjust event probabilities in events.js

## UI Design (v2.1.0)

**Stats Layout** - Grid-based responsive design:
```
┌─────────────────────────────────────┐
│  [MONEY]            [DATE/TIME]     │
│  £0 / £2,000        Day 1, 06:00    │
│  (green border)     Morning         │
│                     (blue border)   │
├─────────────────────────────────────┤
│  [HEALTH]                           │
│  Progress bar (red gradient)        │
│  (red left border)                  │
├─────────────────────────────────────┤
│  [HUNGER]                           │
│  Progress bar (orange gradient)     │
│  (orange left border)               │
└─────────────────────────────────────┘
```

**Key UI Features:**
- **Money Display**: Left-aligned, shows current/goal (£0 / £2,000), green left border
- **Date/Time Display**: Right-aligned, shows day/time/period, blue right border, consistent blue color scheme
- **Health Bar**: Left-aligned progress bar (0-100), red gradient fill, red left border, pulses when critical (<20)
- **Hunger Bar**: Left-aligned progress bar (0-100), orange gradient fill, orange left border, pulses when critical (<20)
- **Color Coding**: Each stat has consistent color theme (borders match fill colors)
- **Critical States**: Progress bars pulse with animation when health/hunger drops below 20

**CSS Grid Layout:**
```css
.stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 15px;
}
```

Row 1: Money (col 1) + Date/Time (col 2)
Row 2: Health bar (col 1, left-aligned)
Row 3: Hunger bar (col 1, left-aligned)

## Version History

- **v2.1.0**: UI redesign with progress bars and improved stats layout
- **v2.0.0**: Locations and time of day system
- **v1.0.0**: Initial MVP with basic survival mechanics
