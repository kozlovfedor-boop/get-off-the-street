# Baseline Screenshots

This directory contains reference screenshots for visual regression testing.

## Files

Baseline screenshots are created when running E2E tests for the first time:

- `initial-state.png` - Game before clicking "Start Game"
- `game-started.png` - Game immediately after starting
- `after-work.png` - Game state after completing a work action
- `health-critical.png` - UI when health drops below 20 (critical state)
- `hunger-critical.png` - UI when hunger drops below 20 (critical state)

## Usage

These screenshots serve as the "golden master" for visual regression tests. When running tests, new screenshots are compared against these baselines to detect unintended UI changes.

## Updating Baselines

If you intentionally change the UI (colors, layout, fonts), update the baseline screenshots by:

1. Running the test suite to generate new screenshots
2. Manually reviewing the new screenshots
3. If changes are correct, replace the baseline files with the new versions
4. Commit the updated baselines to version control

## Test Coverage

Each baseline screenshot tests specific UI elements:

- **initial-state.png**: Intro screen, start button
- **game-started.png**: Stats grid, action buttons, location display
- **after-work.png**: Stat updates, time progression, log entries
- **health-critical.png**: Critical state CSS (pulsing animation, red borders)
- **hunger-critical.png**: Critical state CSS (pulsing animation, orange borders)
