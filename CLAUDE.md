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
│   ├── actions.js          # ActionManager class - player actions
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

**actions.js** - Player actions
- `ActionManager` class handles all player actions
- Actions: `findWork()`, `findFood()`, `eat()`, `sleep()`, `rest()`, `panhandle()`, `steal()`
- All actions now return `{type, message, logType, timeCost}`
- Actions are location-aware (use locationManager for pay/risk modifiers)
- `applyStarvation()` applies hunger penalty

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
- Owns instances of: Player, TimeManager, LocationManager, EventManager, ActionManager, UIManager
- `performAction(actionType)` - main action handler
- `travel(destinationId)` - handles location changes
- `advanceTime(hours)` - processes time advancement, starvation, events, game state
- Turn flow: action → time advance → starvation check → random event → game state check → UI update

### Data Flow

```
User clicks action button
  ↓
UIManager dynamically created onclick calls game.performAction('work')
  ↓
Game checks locationManager.isActionAvailable('work')
  ↓
Game calls actionManager.findWork()
  ↓
ActionManager uses locationManager.getPayModifier() to calculate earnings
ActionManager modifies player stats via player.addMoney(), player.modifyHunger()
Returns {type, message, logType, timeCost}
  ↓
Game.advanceTime() processes:
  - timeManager.advanceTime(timeCost) → returns daysElapsed
  - player.nextDay() if days elapsed
  - actionManager.applyStarvation()
  - eventManager.trigger() (20% chance, location/time filtered)
  - Game.checkGameState()
  ↓
Game calls ui.updateAll(player)
  ↓
UI updates: stats, time display, location display, re-renders action buttons
```

### Key Game Systems

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
1. Add method to `ActionManager` in actions.js (must return timeCost)
2. Add action to location's actions array in locations.js
3. Add case in `Game.performAction()` switch statement in game.js
4. Add button styling in styles.css
5. Add action name mapping in `UIManager.createActionButton()`

**Adding new locations:**
1. Add location object to `locations` in LocationManager constructor
2. Define: id, name, description, actions array, travelTime object
3. Update `CONFIG.LOCATIONS` if needed
4. Add location-specific logic in actions.js if needed

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

Action ranges in `actions.js`:
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

- **Separation of Concerns**: Each class has single responsibility
- **Dependency Injection**: Game class receives dependencies via constructor
- **Dynamic UI**: Buttons created dynamically based on location/time state
- **Configuration Object**: All constants centralized in CONFIG
- **Manager Pattern**: Separate managers for Time, Location, Events, Actions, UI
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
- Adjust pay in actions.js
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
