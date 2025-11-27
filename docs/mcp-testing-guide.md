# MCP Testing Guide

## Quick Start

1. Ensure Chrome DevTools MCP is configured in Claude Desktop
2. Reference test-mcp.js for test definitions
3. Execute via natural language: "Run test_complete_startup_flow"

## Common Test Commands

- "Run all E2E tests from test-mcp.js"
- "Test the work action and verify stats with screenshots"
- "Check for console errors during 10 random actions"
- "Run visual regression suite and compare to baseline"

## Test Output

- Screenshots: `test-screenshots/[test-name]/[timestamp].png`
- Baseline screenshots: `test-screenshots/baseline/[test-name].png`
- Console logs: Retrieved via list_console_messages()
- State snapshots: Via evaluate_script(window.GameMonitor.getReport())

## Directory Structure

```
/street
├── test-screenshots/
│   ├── baseline/              # Reference screenshots
│   │   ├── initial-state.png
│   │   ├── game-started.png
│   │   └── after-work.png
│   └── [test-run-timestamp]/  # Test execution results
│       ├── test_complete_startup_flow/
│       └── test_visual_regression/
```

## Debugging Commands

- "Load game in Chrome and show console"
- "Take screenshot of current game state"
- "Execute: window.game.player.money = 500 and verify UI updates"
- "Monitor errors during gameplay session"

## Available Tests

### test_complete_startup_flow
Tests game initialization and first work action from start to finish.

**Expected Results:**
- Money earned: £15-65
- Health unchanged: 0
- Hunger decreased: -5 to -32
- Time elapsed: 7 hours

### test_location_actions
Verifies correct action buttons appear at each location based on time of day.

### test_time_progression
Checks that time display updates correctly during action animations.

### test_starvation
Validates starvation penalty triggers when hunger drops below 20.

### test_visual_regression
Ensures UI layout remains consistent (position, colors, gradients).

## Error Monitoring

The GameMonitor utility tracks all errors, warnings, and game state:

```javascript
// Get error report via MCP
evaluate_script(`window.GameMonitor.getReport()`)

// Clear error history
evaluate_script(`window.GameMonitor.clear()`)
```

## Tips

- Wait for animations: Game uses 1000ms per in-game hour
- Work action = 7 hours = 7000ms wait time
- Sleep action = 7 hours = 7000ms wait time
- Rest action = 2 hours = 2000ms wait time
- Use baseline screenshots for visual regression comparison
