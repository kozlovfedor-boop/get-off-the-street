# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Get off the Street" is a turn-based survival RPG built with vanilla HTML, CSS, and JavaScript. No build process, dependencies, or frameworks required.

**Goal:** Player starts homeless and must survive to save £2,000 to rent an apartment.

**Current Version:** 2.3.0 - Location-Owned Pre-Configured Actions (Architectural Refactor)

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
├── index.html                  # Main HTML (minimal, just structure)
├── css/
│   ├── styles.css              # Main game styles
│   └── character.css           # Character animations & backgrounds (NEW v2.2)
├── js/
│   ├── config.js               # Game configuration and constants
│   ├── player.js               # Player class - state management
│   ├── time.js                 # TimeManager class - 24-hour clock
│   ├── locations/              # Location system (class hierarchy + factory)
│   │   ├── base-location.js        # BaseLocation class - abstract base
│   │   ├── shelter-location.js     # ShelterLocation class
│   │   ├── park-location.js        # ParkLocation class
│   │   ├── camden-town-location.js # CamdenTownLocation class
│   │   ├── london-city-location.js # LondonCityLocation class
│   │   └── location-factory.js     # createLocation() factory function
│   ├── location-service.js     # LocationService class - coordinates locations & travel
│   ├── events.js               # EventManager class - random events
│   ├── character-animation.js  # CharacterAnimationManager class (NEW v2.2)
│   ├── actions/                # Action system (factory pattern + inheritance)
│   │   ├── base-action.js      # BaseAction class - abstract base
│   │   ├── action-utils.js     # Shared utility functions
│   │   ├── work-action.js      # WorkAction class
│   │   ├── panhandle-action.js # PanhandleAction class
│   │   ├── find-food-action.js # FindFoodAction class
│   │   ├── sleep-action.js     # SleepAction class
│   │   ├── steal-action.js     # StealAction class
│   │   ├── eat-action.js       # EatAction class
│   │   └── action-factory.js   # createAction() factory function
│   ├── ui.js                   # UIManager class - DOM manipulation
│   └── game.js                 # Game class - main controller
├── assets/                     # Game assets (NEW v2.2)
│   ├── character/
│   │   └── homeless-character.png  # 8-frame sprite sheet (256x256px)
│   └── background/
│       ├── bg-city-park.png        # Park background (1400x600px)
│       ├── bg-london-city.png      # London City background (1400x600px)
│       ├── bg-camden-town.png      # Camden Town background (1400x600px)
│       └── bg-homeless-shelter.png # Shelter background (1400x600px)
└── README.md
```

### Module Responsibilities

**config.js** - Central configuration
- All game constants (win conditions, stat limits, time costs)
- Location IDs
- **ACTION_PRESETS** (NEW v2.3): Standardized effect levels for actions
  - `earnings`: high [30,60], medium [20,40], low [5,20]
  - `health`: high [30,50], medium [15,30], low [6,10]
  - `hunger`: high [-25,-10], medium [-15,-8], low [-10,-5]
  - `risk`: high 0.30, medium 0.15, low 0.05
  - `reward`: high [50,100], medium [30,60], low [10,30]
  - `food`: high [40,60], medium [20,45], low [10,25]
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

**locations/** - Location system (class hierarchy + factory pattern)
- **Class Hierarchy**: All locations extend `BaseLocation` abstract class
- **BaseLocation** (base-location.js): Defines interface for all locations
  - Properties: `id`, `name`, `description`, `actions` (object of pre-configured action instances)
  - Methods: `getActions()` (returns action IDs), `getAction(actionId)` (returns action instance), `getTravelTime()`, `isActionAvailable()`
  - **REMOVED in v2.3**: `getPayModifier()`, `getRiskModifier()`, preview methods - now handled by action configs
- **Specific Locations**: ShelterLocation, ParkLocation, CamdenTownLocation, LondonCityLocation
  - **NEW v2.3**: Each location owns pre-instantiated action objects with preset configs
  - Example: `this.actions = { 'work': new WorkAction({ earnings: 'high', hunger: 'high' }) }`
  - Location-specific action configurations live in constructor
  - Each location defines which actions are available and their difficulty/reward levels
- **Factory Pattern**: `createLocation(id)` instantiates appropriate location class

**location-service.js** - Location coordination service
- `LocationService` class coordinates location instances and travel (renamed from LocationManager)
- Manages current location and delegates to location instances for behavior
- `getCurrentLocation()` - returns current location instance
- `isActionAvailable(action)` - delegates to location's method
- `travel(destinationId)` - handles travel between locations with path calculation
- **REMOVED in v2.3**: `getRiskModifier()`, `getPayModifier()` - no longer needed, configs live in action instances

**events.js** - Random event system
- `EventManager` class handles probability-based events
- Events filtered by location and time (e.g., robbery only at park at night)
- Each event: `{id, message, effect, chance}`
- `trigger()` uses cumulative probability distribution
- Extensible: `addEvent()`, `removeEvent()`, `getEvent()` methods

**actions/** - Action System (Preset-Based Configuration + Inheritance)
- **NEW v2.3 Architecture**: Locations own pre-configured action instances; actions are reusable objects
- **Inheritance**: All actions extend `BaseAction` class
- **BaseAction** (base-action.js):
  - Constructor: `constructor(config = {})` - accepts preset-based config (e.g., `{earnings: 'high', hunger: 'medium'}`)
  - Execute: `execute(player, locationManager, timeManager)` - runtime dependencies injected at execution
  - Methods: `isInstant()`, `applyStats()`, `clampStats()`, `random()`, `getPreview()` (instance method, not static)
  - Abstract methods to override: `execute()`, `calculatePerHourStats()`, `generateLogMessage()`, `getPreview()`
- **Individual Action Classes**:
  - `WorkAction` - Config: earnings (preset), hunger (preset)
  - `PanhandleAction` - Config: earnings (preset), hunger (preset)
  - `FindFoodAction` - Config: food (preset)
  - `SleepAction` - Config: health (preset), hunger (preset), timeCost
  - `StealAction` - Config: reward (preset), hunger (preset)
  - `EatAction` - Config: food (preset)
  - `BuyFoodAction` - Config: cost (preset), food (preset), timeCost
- **Action Factory** (action-factory.js): **DEPRECATED in v2.3** - actions created by locations, not factory
- **Action Utils** (action-utils.js): Shared utilities (`random()`, `applyStarvation()`)

**character-animation.js** - Character animation system (NEW v2.2)
- `CharacterAnimationManager` class handles sprite animations and backgrounds
- Methods: `init()`, `updateLocation()`, `setAnimation()`, `setIdle()`, `getAnimationClass()`
- Manages 8-frame sprite animations: idle, walk-left, walk-right
- Updates location backgrounds dynamically
- Integrated with travel system for walking animations

**ui.js** - UI management
- `UIManager` class handles all DOM updates
- Methods: `updateStats()`, `updateTime()`, `updateLocation()`, `addLog()`, `showGameOver()`, `showVictory()`
- `renderActionButtons()` - dynamically creates buttons based on location + time
- `showTravelMenu()` - displays travel destination options
- `startBackgroundScroll()` - triggers panoramic scrolling animations (NEW v2.2)
- `stopBackgroundScroll()` - stops scrolling and resets animation state (NEW v2.2)
- Manages log entries (max 20 entries)
- Handles progress bar updates and critical state animations
- Event-driven via dynamically created buttons

**game.js** - Main controller
- `Game` class orchestrates all other modules
- Owns instances of: Player, TimeManager, LocationService, EventManager, UIManager
- **CHANGED v2.3**: Gets actions from locations, not factory
- Uses: Location factory pattern via LocationService (no direct location instantiation)
- `performAction(actionType)` - gets action from location via `location.getAction()`, executes with runtime dependencies
- `executeAction(action, result)` - hour-by-hour execution with per-hour stats and logging
- `travel(destinationId)` - handles location changes
- `advanceTime(hours)` - processes time advancement, starvation, events, game state
- Turn flow: get action from location → execute with dependencies → per-hour processing → time advance → starvation check → random event → game state check → UI update

### Data Flow

```
User clicks action button
  ↓
UIManager dynamically created onclick calls game.performAction('work')
  ↓
Game gets current location via locationManager.getCurrentLocation()
  ↓
Game checks location.isActionAvailable('work', timeManager)
  ↓
Game gets pre-configured action via location.getAction('work')
  ↓
Location returns its WorkAction instance (configured with earnings: 'high', hunger: 'high')
  ↓
Game calls workAction.execute(player, locationManager, timeManager)
  ↓
WorkAction uses CONFIG.ACTION_PRESETS to get ranges for earnings and hunger
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

**Character Animation System (NEW v2.2)**

The game features a pixel art character with sprite animations and panoramic background scrolling.

*Visual Components:*
- **Character Sprite**: 8-frame animations (idle, walk-left, walk-right)
  - Source: 256×256px sprite sheet (8×4 grid, 32×32px frames)
  - Display: 108×108px (scaled 1.5x for visibility)
  - Animation technique: CSS background-position with steps() timing
- **Backgrounds**: PNG images for all 4 locations
  - Source: 1400×600px images
  - Display: 467×200px (3x scale down, maintains proportions)
  - Dual-layer system for panoramic scrolling

*Animation System:*
```
CharacterAnimationManager
├── Sprite Animations (CSS keyframes)
│   ├── sprite-idle: 8 frames, 1.6s loop
│   ├── sprite-walk-right: 8 frames, 0.8s loop
│   └── sprite-walk-left: 8 frames, 0.8s loop
└── Background System
    ├── Static backgrounds (4 locations)
    └── Scrolling backgrounds (travel transitions)
```

*Dual-Layer Background Scrolling:*
- **Main Element**: Displays destination background
- **::before Pseudo-element**: Displays origin background
- **Z-Index Layering**: origin (z-1) → destination (z-0) → character (z-10)
- **Animation**: Both layers scroll simultaneously
  - Travel right: backgrounds scroll left (side-scroller effect)
  - Travel left: backgrounds scroll right
- **Technical Implementation**:
  - `startBackgroundScroll()`: Sets data-location, forces reflow, adds animation classes via requestAnimationFrame
  - `stopBackgroundScroll()`: Removes classes and attributes, forces reflow to allow animation retriggering
  - Reflow forcing prevents CSS animation bug where classes don't retrigger on multi-hop travel

*Character Animation States:*
- **Idle**: Default state, slow breathing animation (1.6s loop)
- **Walk Right**: Used when traveling to higher-indexed locations (park → camden → london)
- **Walk Left**: Used when traveling to lower-indexed locations (london → camden → park)

*Integration with Game:*
1. `CharacterAnimationManager.init()` - Initialize DOM references
2. `updateLocation()` - Update background when location changes
3. `setAnimation(actionType, direction)` - Set character animation during actions
4. `setIdle()` - Return to idle state after action completes
5. Travel triggers: `startBackgroundScroll()` → animate → `stopBackgroundScroll()`

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

**Adding new actions (UPDATED for v2.3):**

1. **Create new action class file** in `js/actions/` (e.g., `beg-action.js`):
   ```javascript
   // Beg action - ask for help (2 hours)
   class BegAction extends BaseAction {
       constructor(config = {}) {
           super(config);
           this.config = {
               earnings: config.earnings || 'low',
               hunger: config.hunger || 'low'
           };
       }

       execute(player, locationManager, timeManager) {
           this.player = player;
           this.locationManager = locationManager;
           this.timeManager = timeManager;

           // Use preset ranges from CONFIG.ACTION_PRESETS
           const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
           const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

           const earnings = this.random(...earningsRange);
           const hungerCost = this.random(...hungerRange);

           return {
               type: 'beg',
               message: `You begged for help. Earned £${earnings}. Hunger ${hungerCost}.`,
               logType: 'neutral',
               timeCost: 2,
               statChanges: {
                   money: earnings,
                   health: 0,
                   hunger: hungerCost
               },
               perHourCalculation: 'beg'
           };
       }

       calculatePerHourStats(hourIndex) {
           const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
           const perHourMin = Math.floor(earningsRange[0] / 2);
           const perHourMax = Math.ceil(earningsRange[1] / 2);
           return {
               moneyChange: this.random(perHourMin, perHourMax),
               healthChange: 0,
               hungerChange: this.random(-2, -1)
           };
       }

       generateLogMessage(hourIndex, totalHours, stats) {
           return {
               message: `Begging: Hour ${hourIndex + 1}/${totalHours} - Earned £${stats.moneyChange}, Hunger ${stats.hungerChange}`,
               logType: 'neutral'
           };
       }

       getPreview() {
           const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
           const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];
           return {
               timeCost: 2,
               effects: {
                   money: earningsRange,
                   health: [0, 0],
                   hunger: hungerRange
               },
               notes: null
           };
       }
   }
   ```

2. **Add script tag** to `index.html` (after base-action.js):
   ```html
   <script src="js/actions/beg-action.js"></script>
   ```

3. **Add to location's actions object** in the location class constructor:
   ```javascript
   // In park-location.js constructor
   this.actions = {
       'sleep': new SleepAction({ health: 'medium', hunger: 'low', timeCost: 3, ... }),
       'panhandle': new PanhandleAction({ earnings: 'low', hunger: 'low' }),
       'food': new FindFoodAction({ food: 'medium' }),
       'beg': new BegAction({ earnings: 'low', hunger: 'low' })  // Add this
   };
   ```

4. **Add button styling** in `styles.css`:
   ```css
   .beg { background: linear-gradient(135deg, #9c27b0, #673ab7); }
   ```

5. **Add action name mapping** in `UIManager.createActionButton()` (ui.js):
   ```javascript
   case 'beg': return 'Beg for Help';
   ```

**Adding new locations (UPDATED for v2.3):**

1. **Create new location class** in `js/locations/` (e.g., `train-station-location.js`):
   ```javascript
   class TrainStationLocation extends BaseLocation {
       constructor() {
           super('train-station', 'Train Station', 'Busy transit hub.');

           // Pre-configure actions with preset levels
           this.actions = {
               'panhandle': new PanhandleAction({
                   earnings: 'medium',  // £20-40 (decent traffic)
                   hunger: 'low'        // -10 to -5
               }),
               'steal': new StealAction({
                   risk: 'medium',      // 15% police
                   reward: 'medium',    // £30-60
                   hunger: 'low'
               })
           };
       }

       getTravelTime() {
           return { 'camden-town': 0.5 };
       }

       isActionAvailable(action, timeManager) {
           if (!this.actions[action]) {
               return { available: false, reason: `Can't ${action} here` };
           }
           // Add time restrictions if needed
           return { available: true };
       }
   }
   ```

2. **Add to location factory** (`js/locations/location-factory.js`):
   ```javascript
   case 'train-station':
       return new TrainStationLocation();
   ```

3. **Add to LocationService** (`js/location-service.js`):
   ```javascript
   this.locations = {
       'shelter': createLocation('shelter'),
       'park': createLocation('park'),
       'camden-town': createLocation('camden-town'),
       'london-city': createLocation('london-city'),
       'train-station': createLocation('train-station')  // Add here
   };
   ```

4. **Add script tag** to `index.html`:
   ```html
   <script src="js/locations/train-station-location.js"></script>
   ```

5. **Update travel times** in adjacent locations to include the new location

**Adding new events (UPDATED for v2.4.0):**

Events are now class-based and owned by actions. To add a new event:

1. **Create event class** in appropriate `js/events/` subdirectory (e.g., `js/events/positive/lucky-find-event.js`):
   ```javascript
   class LuckyFindEvent extends BaseEvent {
       constructor(config = {}) {
           super(config);
           this.config = {
               chance: config.chance || 'low',
               amount: config.amount || 'medium'
           };
           this.foundAmount = 0;
       }

       canTrigger(context) {
           // Define when event can occur
           return !this.isAtLocation('shelter');
       }

       execute(context) {
           this.player = context.player;
           const amountRange = this.getPresetRange('moneyGain', this.config.amount);
           this.foundAmount = this.random(...amountRange);

           return {
               type: 'lucky-find',
               message: `You found something valuable!`,
               logType: 'positive',
               statChanges: {
                   money: this.foundAmount,
                   health: 0,
                   hunger: 0
               }
           };
       }

       getModalContent() {
           return {
               title: 'Lucky Find!',
               description: `You found £${this.foundAmount}!`,
               choices: [
                   {
                       label: 'Continue',
                       value: 'continue',
                       variant: 'safe'
                   },
                   {
                       label: 'Stop',
                       value: 'stop'
                   }
               ]
           };
       }

       processChoice(choice, context) {
           this.player = context.player;
           this.applyStats(this.foundAmount, 0, 0);

           if (choice === 'stop') {
               return {
                   message: `Found £${this.foundAmount} and stopped.`,
                   logType: 'positive',
                   stopAction: true
               };
           }

           return {
               message: `Found £${this.foundAmount} and continued.`,
               logType: 'positive',
               stopAction: false
           };
       }
   }
   ```

2. **Add script tag** to `index.html` (in appropriate event section):
   ```html
   <script src="js/events/positive/lucky-find-event.js"></script>
   ```

3. **Assign to action** in location constructor:
   ```javascript
   // In park-location.js
   'panhandle': new PanhandleAction({
       earnings: 'low',
       hunger: 'low',
       events: [
           new LuckyFindEvent({ chance: 'low', amount: 'medium' })
       ]
   })
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

Location travel times (defined in location class `getTravelTime()` methods):
- Adjacent locations: 1.0 hour per hop
- Path calculation handled by LocationService

Event probabilities in `events.js`:
- Filtered by location/time before roll
- 20% chance per action to trigger event
- Base chances: Find money 15%, Robbed 10%, Sick 12%, Food 10%, Nothing 53%

## Design Patterns Used

- **Factory Pattern**:
  - Action creation via `createAction()` factory function
  - Location creation via `createLocation()` factory function
- **Template Method Pattern**:
  - `BaseAction` with overridable methods (`execute()`, `calculatePerHourStats()`, `generateLogMessage()`)
  - `BaseLocation` with overridable methods (`getActions()`, `getTravelTime()`, `isActionAvailable()`)
- **Inheritance**:
  - All action classes extend `BaseAction` for code reuse
  - All location classes extend `BaseLocation` for code reuse
- **Service Layer Pattern**: `LocationService` coordinates location instances and delegates behavior
- **Separation of Concerns**: Each class/module has single responsibility
- **Dependency Injection**: Classes receive dependencies via constructor
- **Dynamic UI**: Buttons created dynamically based on location/time state
- **Configuration Object**: All constants centralized in CONFIG
- **Manager Pattern**: Separate managers for Time, Events, UI
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

## Chrome DevTools MCP Integration (v2.2+)

### Setup

MCP configured in `~/Library/Application Support/Claude/claude_desktop_config.json`

### Quick Commands (via Claude Code)

- "Load game in Chrome and show console"
- "Run all E2E tests from test-mcp.js"
- "Test [action] and verify stats"
- "Check for errors during gameplay"
- "Take screenshot of current state"
- "Run performance analysis on animations"

### Common MCP Commands (Claude Desktop)

Quick commands for testing in Claude Desktop:

1. **Quick validation**: "Load the game and verify it starts without errors"
2. **Startup flow test**: "Run test_complete_startup_flow - load game, start, travel to Camden, work action, verify earnings £15-65"
3. **Location test**: "Test location_actions - verify correct buttons at Park, Shelter, and London City"
4. **Time test**: "Run time_progression test - verify time advances 06:00→08:00 during rest action"
5. **Starvation test**: "Test starvation penalty - set hunger=15, rest, verify health decreased"
6. **Visual check**: "Run visual_regression - verify stats layout, progress bars, action buttons"
7. **Error monitoring**: "Play 10 random actions and report any console errors"

Full details: See `docs/desktop-testing-guide.md`

### Files

- `js/monitor.js` - Error tracking (auto-loads with game)
- `test-mcp.js` - E2E test definitions
- `docs/mcp-testing-guide.md` - Full testing guide
- `docs/mcp-quick-reference.md` - Command reference
- `test-screenshots/` - Screenshot storage
  - `baseline/` - Reference screenshots for visual regression

### Workflow

1. Make code changes
2. Ask Claude: "Run regression tests"
3. Claude executes via MCP, reports results with screenshots
4. If pass: commit changes with confidence

### Benefits

- **Live Debugging**: Claude can automatically debug issues via Chrome DevTools
- **E2E Testing**: Real browser automation with user interaction simulation
- **Visual Regression**: Screenshot comparison for UI consistency
- **Error Monitoring**: Automatic error tracking with game state context
- **Performance Analysis**: Profile animations and identify bottlenecks

## Version History

- **v2.4.0**: Interactive Event System (Class-Based Architecture)
  - **Class-based event architecture** following v2.3.0 preset-based patterns
  - Added `EVENT_PRESETS` in config.js for standardized event effects (high/medium/low)
  - Events extend `BaseEvent` abstract class with common utilities
  - Actions own event instances configured in location constructors
  - **Event modal system** - all events pause action and show interactive modal
  - **Pick-one-randomly probability model** - weighted event selection per hour
  - **Stop-action functionality** - player choices can cancel remaining action hours
  - Implemented 9 core events:
    - Positive: FindMoneyEvent, GenerousStrangerEvent, BonusTipEvent, FreeResourceEvent
    - Negative: RobberyEvent, SicknessEvent, WeatherEvent
    - Work-specific: WorkAccidentEvent
    - Sleep-specific: NightmareEvent
  - Event assignment to actions across all locations (Park, London City, Camden Town)
  - Event filtering by location, time, and action type via `canTrigger()`
  - Modal UI with animations, choice buttons, and pause/resume flow
  - **Benefits**: Contextual storytelling, player agency, dramatic gameplay moments
- **v2.3.0**: Location-Owned Pre-Configured Actions (Architectural Refactor)
  - **Major architectural refactor** to eliminate duplication and circular dependencies
  - Added `ACTION_PRESETS` in config.js for standardized effect levels (high/medium/low)
  - Locations now own pre-instantiated action objects with preset configurations
  - Actions accept config in constructor and runtime dependencies in execute()
  - Removed circular dependencies (actions no longer query locations)
  - Removed location preview methods (getSleepPreview, getWorkPreview, getPanhandlePreview)
  - Removed getPayModifier() and getRiskModifier() from locations (configs now in actions)
  - Changed getPreview() from static to instance method on actions
  - Updated BaseAction constructor pattern: `constructor(config)` + `execute(player, locationManager, timeManager)`
  - Updated all 6 action classes to use preset system
  - Single source of truth for action configurations (locations define configs once)
  - **Benefits**: No duplication, no data mismatches, cleaner separation of concerns
- **v2.2.0**: Character animations and panoramic background scrolling
  - Added 8-frame pixel art character sprite with idle/walk animations
  - Integrated PNG backgrounds for all 4 locations (1400×600px, displayed at 467×200px)
  - Implemented dual-layer panoramic scrolling system during travel
  - Fixed CSS animation retriggering bug for multi-hop travel using reflow forcing
  - Character scales 1.5x for visibility, backgrounds maintain aspect ratio
- **v2.1.0**: UI redesign with progress bars and improved stats layout
- **v2.0.0**: Locations and time of day system
- **v1.0.0**: Initial MVP with basic survival mechanics
