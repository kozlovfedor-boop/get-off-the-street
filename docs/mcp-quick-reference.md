# MCP Quick Reference

## Copy-Paste Commands for Claude Desktop

### E2E Test Suite

```
Run test_complete_startup_flow: Navigate to file:///Users/fedulity/Documents/CodingProjects/street/index.html, click start, travel to Camden, work action, verify money earned £15-65, no errors
```

```
Run test_location_actions: Load game, verify Park shows 5 actions, travel to Shelter (context-dependent), travel to London (time-dependent), screenshot each
```

```
Run test_time_progression: Load game at 06:00, rest action (2 hours), verify time is 08:00 and period text updated
```

```
Run test_starvation: Load game, set hunger=15, rest action, verify health penalty and critical CSS class
```

```
Run test_visual_regression: Full layout check - stats grid, health/hunger bars, gradients, buttons
```

### Quick Actions

```
Load the game and verify it starts without errors
```

```
Play 10 random actions and report console errors with game state
```

```
Test the new character animations during travel between all locations
```

### Debugging

```
Load game, show current state: player stats, location, time, and GameMonitor report
```

```
Set player to near-victory (money=1900, health=100) and test win condition
```

---

## Chrome DevTools MCP Tools (Most Used)

### Console & Debugging

- `list_console_messages()` - Get console logs
- `evaluate_script(script)` - Run JavaScript in page context

### DOM Inspection

- `take_screenshot(options)` - Capture visual state
- `wait_for(selector)` - Wait for element

### User Simulation

- `click(selector)` - Click element
- `navigate_page(url)` - Load page

### Performance

- `performance_start_trace()` - Begin recording
- `performance_stop_trace()` - End recording
- `performance_analyze_insight()` - Get analysis

## Example Workflows

### Debug a bug

```
Claude: "Open the game and execute work action, show me console errors"
→ Launches Chrome, clicks work, captures console, reports errors
```

### Test a feature

```
Claude: "Test the sleep action at shelter and verify health increases"
→ Navigates, clicks sleep, evaluates stats, reports results
```

### Performance check

```
Claude: "Analyze performance during 7-hour work animation"
→ Starts trace, executes action, stops trace, provides insights
```

## Common Game State Queries

### Check player stats
```javascript
evaluate_script(`window.game.player`)
// Returns: {money: 0, health: 100, hunger: 50, day: 1}
```

### Check current location
```javascript
evaluate_script(`window.game.locationManager.currentLocation`)
// Returns: "park", "camden-town", "london-city", or "shelter"
```

### Check current time
```javascript
evaluate_script(`window.game.timeManager.formatTime()`)
// Returns: "06:00", "14:30", etc.
```

### Get error report
```javascript
evaluate_script(`window.GameMonitor.getReport()`)
// Returns: {errors: [], warnings: [], gameState: {...}}
```

## Useful Game Commands

### Modify player stats for testing
```javascript
evaluate_script(`window.game.player.money = 500`)
evaluate_script(`window.game.player.health = 20`)
evaluate_script(`window.game.player.hunger = 10`)
```

### Change time/location
```javascript
evaluate_script(`window.game.timeManager.setTime(20)`) // 8 PM
evaluate_script(`window.game.locationManager.currentLocation = 'shelter'`)
```

### Restart game
```javascript
evaluate_script(`window.game.restart()`)
```

## CSS Selectors Reference

### UI Elements
- `#start-game` - Start game button
- `#game-content` - Main game container
- `#money` - Money display
- `#health-value` - Health value
- `#health-bar` - Health progress bar
- `#hunger-value` - Hunger value
- `#hunger-bar` - Hunger progress bar
- `#day` - Day counter
- `#time` - Time display
- `#location` - Location name
- `#actions` - Action buttons container
- `#log` - Game log

### Dynamic Elements
- `button[data-action="work"]` - Work button (if available)
- `button[data-action="sleep"]` - Sleep button
- `.critical` - Critical state CSS class (health/hunger < 20)
