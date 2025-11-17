# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Get off the Street" is a turn-based survival RPG built with vanilla HTML, CSS, and JavaScript. No build process, dependencies, or frameworks required.

**Goal:** Player starts homeless and must survive to save $2,000 to rent an apartment.

## Running the Game

```bash
open index.html
```

No server required - opens directly in browser.

## Architecture (Modular)

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
│   ├── events.js           # EventManager class - random events
│   ├── actions.js          # ActionManager class - player actions
│   ├── ui.js               # UIManager class - DOM manipulation
│   └── game.js             # Game class - main controller
└── README.md
```

### Module Responsibilities

**config.js** - Central configuration
- All game constants (win conditions, stat limits, thresholds)
- Easy to modify for game balance
- No logic, just data

**player.js** - Player state
- `Player` class manages all player stats (money, health, hunger, day)
- Methods: `addMoney()`, `modifyHealth()`, `modifyHunger()`, etc.
- Win/lose condition checks: `isAlive()`, `hasWon()`, `isStarving()`
- Stat clamping to valid ranges

**events.js** - Random event system
- `EventManager` class handles probability-based events
- Each event: `{id, message, effect, chance}`
- `trigger()` uses cumulative probability distribution
- Extensible: `addEvent()`, `removeEvent()`, `getEvent()` methods

**actions.js** - Player actions
- `ActionManager` class handles all player actions
- Actions: `findWork()`, `findFood()`, `rest()`, `steal()`
- Returns standardized result objects: `{type, message, logType}`
- `applyStarvation()` applies hunger penalty

**ui.js** - UI management
- `UIManager` class handles all DOM updates
- Methods: `updateStats()`, `addLog()`, `showGameOver()`, `showVictory()`
- Manages log entries (max 20 entries)
- Event-driven via data attributes (`data-action`)

**game.js** - Main controller
- `Game` class orchestrates all other modules
- Owns instances of Player, EventManager, ActionManager, UIManager
- Turn flow: action → endTurn() → starvation check → random event → game state check → UI update
- Exposes `performAction(actionType)` for UI to call

### Data Flow

```
User clicks button with data-action="work"
  ↓
UIManager event listener calls game.performAction('work')
  ↓
Game calls actionManager.findWork()
  ↓
ActionManager modifies player stats via player.addMoney(), player.modifyHunger()
  ↓
Game.endTurn() processes:
  - player.nextDay()
  - actionManager.applyStarvation()
  - eventManager.trigger()
  - Game.checkGameState()
  - ui.updateStats()
```

### Extending the Game

**Adding new stats:**
1. Update `CONFIG.INITIAL_STATS` in config.js
2. Add properties to Player class in player.js
3. Add UI elements to index.html
4. Update `UIManager.updateStats()` in ui.js

**Adding new actions:**
1. Add method to `ActionManager` in actions.js
2. Add button with `data-action="newAction"` in index.html
3. Add case in `Game.performAction()` switch statement in game.js

**Adding new events:**
1. Call `game.eventManager.addEvent({id, message, effect, chance})`
2. Or add directly to events array in EventManager constructor

**Adding new locations/features:**
1. Create new manager class (e.g., `LocationManager`)
2. Instantiate in `Game` constructor
3. Integrate into turn flow in `Game.endTurn()`

## Key Game Balance Values

All in `config.js`:
- `VICTORY_MONEY: 2000` - Money needed to win
- `VICTORY_MIN_HEALTH: 20` - Min health to win
- `STARVATION_THRESHOLD: 20` - Hunger below this causes health loss
- `INITIAL_STATS` - Starting player state

Action ranges in `actions.js`:
- Work: +$20-50, -10-25 hunger
- Food: +20-45 hunger
- Rest: +10-20 health, -5-13 hunger
- Steal: 50% → +$50-100 or -20 health, -5-15 hunger

Event probabilities in `events.js`:
- Find money: 15%, Get robbed: 10%, Get sick: 12%, Receive food: 10%, Nothing: 53%

## Design Patterns Used

- **Separation of Concerns**: Each class has single responsibility
- **Dependency Injection**: Game class receives dependencies, easy to test
- **Data Attributes**: HTML uses `data-action` for extensible event handling
- **Configuration Object**: All constants centralized in CONFIG
- **Event-driven UI**: UIManager attaches listeners, doesn't hardcode onclick

## Legacy Files

- Old monolithic `game.js` can be deleted (replaced by modular version)
- Game now works with new modular structure
