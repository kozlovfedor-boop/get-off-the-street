# Claude Desktop Testing Guide

Complete guide for testing "Get off the Street" using Chrome DevTools MCP in Claude Desktop.

## Prerequisites

### 1. Claude Desktop Installed
- Download from: https://claude.ai/download
- Install and sign in to your Anthropic account

### 2. MCP Configuration
Your MCP is already configured at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 3. Verify MCP is Active
Open Claude Desktop and ask:
```
Do you have access to Chrome DevTools MCP tools?
```

You should see confirmation that MCP tools are available.

## Quick Start

### Your First Test

In Claude Desktop, simply say:
```
Load the game and verify it starts without errors
```

Claude will:
1. Open Chrome
2. Navigate to your game
3. Click the start button
4. Check for console errors
5. Report results with screenshots

### Run a Full Test

```
Run test_complete_startup_flow - load game, start, travel to Camden, work action, verify earnings £15-65
```

That's it! No long commands needed.

## E2E Test Suite

### Test 1: Complete Startup Flow

**Command:**
```
Run test_complete_startup_flow
```

**What it tests:**
- Game loads successfully
- Start button works
- Character appears with idle animation
- Travel to Camden Town works
- Work action executes
- Stats update correctly (money, health, hunger)
- Time advances 7 hours
- No console errors

**Expected Results:**
- Money earned: £15-65
- Health unchanged: 0
- Hunger decreased: -5 to -32
- Time: 06:00 → 13:00 (7 hours elapsed)
- No errors in console
- Screenshots captured at each stage

**Typical Output:**
```
✅ Game loaded successfully
✅ Start button clicked
✅ Game started, player stats initialized
✅ Traveled to Camden Town
✅ Work action completed
✅ Money earned: £42
✅ Health unchanged: 100
✅ Hunger decreased: -18 (now 32)
✅ Time: 13:00 (7 hours elapsed)
✅ No console errors
📸 Screenshots saved to test-screenshots/
```

### Test 2: Location Actions

**Command:**
```
Test location_actions - verify correct buttons at Park, Shelter, and London City
```

**What it tests:**
- Park shows all available actions (work, food, rest, steal, panhandle)
- Shelter shows context-dependent actions (sleep always, eat during meal times)
- London City respects time restrictions (work only 8am-6pm)
- Action buttons render correctly
- No duplicate or missing buttons

**Expected Results:**
- Park: 5 action buttons visible
- Shelter: 1-2 buttons depending on time
- London City: Buttons vary by time of day
- All buttons have correct labels and data-action attributes

### Test 3: Time Progression

**Command:**
```
Run time_progression test - verify time advances 06:00→08:00 during rest action
```

**What it tests:**
- Game starts at 06:00
- Rest action takes 2 hours
- Time display updates to 08:00
- Time period text changes (Morning → Mid-Morning)
- Hour-by-hour animation works

**Expected Results:**
- Initial time: 06:00
- After rest: 08:00
- Time period updated correctly
- Animation smooth (1 second per game hour)

### Test 4: Starvation Mechanic

**Command:**
```
Test starvation penalty - set hunger=15, rest, verify health decreased
```

**What it tests:**
- Setting hunger below threshold (20)
- Starvation penalty applies during action
- Health decreases appropriately
- Critical CSS class added to hunger bar
- Console shows starvation log message

**Expected Results:**
- Hunger set to 15 (below 20 threshold)
- Health decreases by ~2 per hour
- Hunger bar has `critical` class (pulsing animation)
- Console log: "You're starving! Health decreased by X"

### Test 5: Visual Regression

**Command:**
```
Run visual_regression - verify stats layout, progress bars, action buttons
```

**What it tests:**
- Stats grid layout (Money top-left, Date/Time top-right)
- Health bar: red gradient, correct width percentage
- Hunger bar: orange gradient, correct width percentage
- Action buttons render in correct location
- No UI glitches or misalignments

**Expected Results:**
- All UI elements in correct positions
- Progress bars match player stats
- Colors and gradients correct
- No layout shifts or overlaps

## Interactive Debugging

### Check Game State

**Command:**
```
Load game, show current state: player stats, location, time, and GameMonitor report
```

**Output:**
```
Player Stats:
- Money: £0
- Health: 100
- Hunger: 50
- Day: 1

Location: Park
Time: 06:00 (Morning)

GameMonitor Report:
- Errors: 0
- Warnings: 0
- Game State: Active
```

### Test Specific Feature

**Command:**
```
Test the new character animations during travel between all locations
```

Claude will:
1. Load the game
2. Travel between all location pairs
3. Verify walk-left animation when traveling "backward"
4. Verify walk-right animation when traveling "forward"
5. Check panoramic background scrolling
6. Capture screenshots of animations

### Modify State for Testing

**Command:**
```
Set player to near-victory (money=1900, health=100) and test win condition
```

Claude will:
1. Evaluate: `window.game.player.money = 1900`
2. Evaluate: `window.game.player.health = 100`
3. Execute work action
4. Verify victory screen appears when money >= £2000

## Advanced Workflows

### Regression Testing After Code Changes

**Workflow:**
1. Make code changes in Claude Code CLI
2. Switch to Claude Desktop
3. Run full test suite:

```
Run all 5 E2E tests in sequence and report pass/fail for each
```

**Output:**
```
Test Results:
✅ test_complete_startup_flow: PASS
✅ test_location_actions: PASS
✅ test_time_progression: PASS
✅ test_starvation: PASS
✅ test_visual_regression: PASS

Summary: 5/5 tests passed
No console errors detected
Screenshots saved for review
```

### Error Monitoring Session

**Command:**
```
Play 10 random actions and monitor for errors, report game state after each action
```

Claude will:
1. Load game
2. Randomly select and execute 10 actions
3. Monitor console for errors after each
4. Track game state progression
5. Report final stats and any issues

**Useful for:**
- Finding edge cases
- Testing random event system
- Validating stat calculations
- Ensuring no memory leaks

### Performance Analysis

**Command:**
```
Run performance analysis on 7-hour work animation
```

Claude will:
1. Start performance trace
2. Execute work action (7-hour animation)
3. Stop trace
4. Analyze frame rate, rendering, JS execution
5. Report bottlenecks or issues

**Output:**
```
Performance Analysis:
- Average FPS: 60
- Frame drops: 0
- JS execution: 12ms (normal)
- Rendering: 8ms (good)
- Memory usage: Stable

✅ Animation performance is excellent
```

## Troubleshooting

### MCP Not Available

**Symptom:** Claude says "I don't have access to Chrome DevTools MCP"

**Solution:**
1. Verify you're in Claude Desktop (not CLI)
2. Check MCP config exists:
   `~/Library/Application Support/Claude/claude_desktop_config.json`
3. Restart Claude Desktop
4. Try again

### Chrome Won't Open

**Symptom:** Error opening Chrome or connection timeout

**Solution:**
1. Make sure Chrome is installed
2. Close any existing Chrome instances
3. Try command again
4. Check if Chrome needs update

### Tests Fail Unexpectedly

**Symptom:** Tests that previously passed now fail

**Solution:**
1. Check if code was modified
2. Clear browser cache
3. Verify game file path is correct
4. Check for JavaScript errors in console
5. Compare screenshots to baseline

### Screenshots Don't Match Baseline

**Symptom:** Visual regression test fails due to screenshot differences

**Solution:**
1. Review screenshot differences
2. Determine if changes are intentional (new features)
3. If intentional, update baseline:
   - Copy new screenshot to `test-screenshots/baseline/`
   - Rename to match expected baseline name
4. Re-run test to verify

## Integration with Development Workflow

### Recommended Workflow

```
┌─────────────────────────────────────┐
│ Terminal: Claude Code CLI           │
├─────────────────────────────────────┤
│ 1. Make code changes                │
│ 2. Edit files (js/css/html)         │
│ 3. Commit when ready                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Claude Desktop: Testing              │
├─────────────────────────────────────┤
│ 1. Run regression tests              │
│ 2. Verify no errors                  │
│ 3. Check screenshots                 │
│ 4. Approve changes                   │
└─────────────────────────────────────┘
```

### Example Session

**In CLI:**
```
User: Add health recovery bonus at shelter during sleep
Claude: [Implements feature in sleep-action.js]
Claude: [Updates documentation]
User: Commit the changes
```

**In Desktop:**
```
User: Test the sleep action at shelter and verify health recovery is higher than park
Claude: [Loads game via MCP]
Claude: [Tests sleep at shelter: +45 health]
Claude: [Tests sleep at park: +25 health]
Claude: ✅ Shelter provides higher health recovery as expected
```

**Back in CLI:**
```
User: Great! Push the changes
```

## Tips & Best Practices

### 1. Use Short Commands
Instead of typing full test steps, use shorthand:
- ❌ "Navigate to the game, click start, execute work action, verify stats"
- ✅ "Run the startup test"

### 2. Reference Tests by Name
Claude Desktop reads CLAUDE.md and knows test names:
- "Run test_complete_startup_flow"
- "Test location_actions"
- "Check visual_regression"

### 3. Combine Multiple Checks
```
Run startup test, then test animations, then check for any errors
```

### 4. Ask for Comparisons
```
Test work action earnings at Park vs London City and compare pay rates
```

### 5. Request Screenshots
```
Take screenshots of all 4 location backgrounds
```

### 6. Monitor During Development
```
Watch for errors while I play the game manually for 2 minutes
```

## Common Test Scenarios

### Before Committing Code
```
Run full regression suite and report any failures
```

### After UI Changes
```
Run visual_regression test and compare to baseline screenshots
```

### Testing New Feature
```
Test [new feature name] - verify it works correctly and doesn't break existing functionality
```

### Performance Check
```
Profile the game during 20 random actions and report any performance issues
```

### Cross-Location Testing
```
Test [action name] at all 4 locations and verify behavior differences
```

## File Locations

### Test Definitions
- `test-mcp.js` - E2E test scenarios (line 6-81)

### Monitoring
- `js/monitor.js` - Error tracking (auto-loaded with game)

### Documentation
- `docs/mcp-quick-reference.md` - Quick command reference
- `docs/mcp-testing-guide.md` - Original testing guide
- `CLAUDE.md` - Project instructions (includes MCP commands section)

### Screenshots
- `test-screenshots/baseline/` - Reference screenshots
- `test-screenshots/[test-run]/` - Test execution results

## Next Steps

### Getting Started
1. Open Claude Desktop
2. Try: "Load the game and verify it starts without errors"
3. Try: "Run test_complete_startup_flow"
4. Explore other commands from this guide

### Daily Usage
- Run quick validation before starting work
- Run full suite before committing
- Use interactive debugging for issues
- Capture screenshots for documentation

### Advanced
- Create custom test scenarios
- Integrate with CI/CD (future)
- Visual regression testing for all UI changes
- Performance benchmarking

## Questions?

If you encounter issues or have questions about MCP testing:
1. Check this guide
2. Review `docs/mcp-quick-reference.md`
3. Ask Claude Desktop: "How do I test [specific feature]?"
4. Claude will guide you through the process

Happy testing! 🎮
