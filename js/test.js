// Automated Test Suite for "Get off the Street" Game

class GameTester {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentTest = null;
    }

    // Add a test case
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    // Wait for animation to complete
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get current player stats
    getPlayerStats() {
        return {
            money: window.game.player.money,
            health: window.game.player.health,
            hunger: window.game.player.hunger,
            day: window.game.player.day
        };
    }

    // Get UI displayed stats
    getUIStats() {
        return {
            money: parseInt(document.getElementById('money').textContent.replace('£', '')),
            health: parseInt(document.getElementById('health-value').textContent),
            hunger: parseInt(document.getElementById('hunger-value').textContent),
            day: parseInt(document.getElementById('day').textContent)
        };
    }

    // Get last log entry
    getLastLog() {
        const logEntries = window.game.ui.logEntries;
        return logEntries.length > 0 ? logEntries[0].message : '';
    }

    // Compare two stat objects
    compareStats(expected, actual, label) {
        const diffs = {};
        let allMatch = true;

        for (const key in expected) {
            if (expected[key] !== actual[key]) {
                diffs[key] = {
                    expected: expected[key],
                    actual: actual[key],
                    diff: actual[key] - expected[key]
                };
                allMatch = false;
            }
        }

        return { match: allMatch, diffs, label };
    }

    // Test an action
    async testAction(actionType, options = {}) {
        const {
            expectedMinChanges = {},
            expectedMaxChanges = {},
            timeCost = 0,
            skipUICheck = false
        } = options;

        // Record starting state
        const startPlayer = this.getPlayerStats();
        const startUI = this.getUIStats();

        // Verify UI matches player before action
        const preCheck = this.compareStats(startPlayer, startUI, 'Pre-action UI vs Player');
        if (!preCheck.match) {
            return {
                pass: false,
                error: 'UI did not match player stats before action',
                details: preCheck.diffs
            };
        }

        // Perform action
        window.game.performAction(actionType);

        // Wait for animation to complete (timeCost * ANIMATION_SPEED + buffer)
        const waitTime = timeCost * CONFIG.ANIMATION_SPEED + 500;
        await this.wait(waitTime);

        // Get final states
        const endPlayer = this.getPlayerStats();
        const endUI = this.getUIStats();
        const logMessage = this.getLastLog();

        // Calculate actual changes
        const actualChanges = {
            money: endPlayer.money - startPlayer.money,
            health: endPlayer.health - startPlayer.health,
            hunger: endPlayer.hunger - startPlayer.hunger,
            day: endPlayer.day - startPlayer.day
        };

        // Verify UI matches player after action
        if (!skipUICheck) {
            const postCheck = this.compareStats(endPlayer, endUI, 'Post-action UI vs Player');
            if (!postCheck.match) {
                return {
                    pass: false,
                    error: 'UI did not match player stats after action',
                    details: {
                        player: endPlayer,
                        ui: endUI,
                        diffs: postCheck.diffs
                    }
                };
            }
        }

        // Verify changes are within expected ranges
        for (const stat in expectedMinChanges) {
            const min = expectedMinChanges[stat];
            const max = expectedMaxChanges[stat];
            const actual = actualChanges[stat];

            if (actual < min || actual > max) {
                return {
                    pass: false,
                    error: `${stat} change out of expected range`,
                    details: {
                        stat,
                        expected: `${min} to ${max}`,
                        actual,
                        logMessage
                    }
                };
            }
        }

        return {
            pass: true,
            startStats: startPlayer,
            endStats: endPlayer,
            changes: actualChanges,
            logMessage
        };
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Starting test suite...\n');

        for (const test of this.tests) {
            this.currentTest = test.name;
            console.log(`Running: ${test.name}`);

            try {
                // Reset game state before each test
                window.game.restart();
                await this.wait(500); // Wait for reset to complete

                // Click Start Game button if needed
                if (!window.game.ui.gameStarted) {
                    window.game.ui.dismissIntro();
                    await this.wait(200);
                }

                const result = await test.testFn(this);

                this.results.push({
                    name: test.name,
                    pass: result.pass,
                    ...result
                });

                if (result.pass) {
                    console.log(`✓ PASS: ${test.name}\n`);
                } else {
                    console.error(`✗ FAIL: ${test.name}`);
                    console.error('Error:', result.error);
                    console.error('Details:', result.details);
                    console.log('');
                }
            } catch (error) {
                console.error(`✗ ERROR in ${test.name}:`, error);
                this.results.push({
                    name: test.name,
                    pass: false,
                    error: error.message,
                    details: error.stack
                });
            }
        }

        this.displayResults();
    }

    // Display test results
    displayResults() {
        const passed = this.results.filter(r => r.pass).length;
        const total = this.results.length;

        console.log('\n' + '='.repeat(50));
        console.log(`TEST SUMMARY: ${passed}/${total} tests passed`);
        console.log('='.repeat(50) + '\n');

        // Display in HTML
        const container = document.getElementById('test-results');
        if (!container) return;

        let html = `
            <div class="test-summary ${passed === total ? 'all-pass' : 'has-failures'}">
                <h2>Test Results: ${passed}/${total} Passed</h2>
            </div>
            <div class="test-list">
        `;

        for (const result of this.results) {
            const statusClass = result.pass ? 'pass' : 'fail';
            const statusIcon = result.pass ? '✓' : '✗';

            html += `
                <div class="test-result ${statusClass}">
                    <div class="test-header">
                        <span class="test-icon">${statusIcon}</span>
                        <span class="test-name">${result.name}</span>
                    </div>
            `;

            if (result.pass) {
                html += `
                    <div class="test-details">
                        <div>Changes: ${JSON.stringify(result.changes)}</div>
                        <div class="test-log">${result.logMessage}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="test-error">
                        <div class="error-message">${result.error}</div>
                        <pre class="error-details">${JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                `;
            }

            html += `</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    }
}

// Initialize tester
const tester = new GameTester();

// TEST: Work action
tester.addTest('Work Action', async (t) => {
    // Work should earn £20-40 base * modifier, reduce hunger by 7-28
    return await t.testAction('work', {
        expectedMinChanges: { money: 20, health: 0, hunger: -28 },
        expectedMaxChanges: { money: 60, health: 0, hunger: -7 },
        timeCost: CONFIG.TIME_COSTS.WORK
    });
});

// TEST: Find Food action
tester.addTest('Find Food Action', async (t) => {
    // Find food should increase hunger
    return await t.testAction('food', {
        expectedMinChanges: { money: 0, health: 0, hunger: 20 },
        expectedMaxChanges: { money: 0, health: 0, hunger: 90 },
        timeCost: CONFIG.TIME_COSTS.FOOD
    });
});

// TEST: Rest action
tester.addTest('Rest Action', async (t) => {
    // Rest should increase health, decrease hunger
    return await t.testAction('rest', {
        expectedMinChanges: { money: 0, health: 10, hunger: -6 },
        expectedMaxChanges: { money: 0, health: 20, hunger: -2 },
        timeCost: CONFIG.TIME_COSTS.REST
    });
});

// TEST: Panhandle action
tester.addTest('Panhandle Action', async (t) => {
    // Panhandle should earn money, reduce hunger
    return await t.testAction('panhandle', {
        expectedMinChanges: { money: 5, health: 0, hunger: -12 },
        expectedMaxChanges: { money: 45, health: 0, hunger: -6 },
        timeCost: CONFIG.TIME_COSTS.PANHANDLE
    });
});

// TEST: Sleep at shelter
tester.addTest('Sleep at Shelter', async (t) => {
    // First travel to shelter
    window.game.locationManager.currentLocation = 'shelter';
    await t.wait(100);

    // Sleep should increase health, decrease hunger
    return await t.testAction('sleep', {
        expectedMinChanges: { money: 0, health: 28, hunger: -21 },
        expectedMaxChanges: { money: 0, health: 49, hunger: -7 },
        timeCost: CONFIG.TIME_COSTS.SLEEP
    });
});

// Run tests when page loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Waiting for game to initialize...');

    // Wait for game object to be created
    let attempts = 0;
    while (!window.game && attempts < 50) {
        await tester.wait(100);
        attempts++;
    }

    if (!window.game) {
        console.error('Game failed to initialize!');
        document.getElementById('test-results').innerHTML = '<div class="error-message">Error: Game failed to initialize</div>';
        return;
    }

    console.log('Game initialized successfully');

    // Dismiss intro if needed
    if (!window.game.ui.gameStarted) {
        window.game.ui.dismissIntro();
        await tester.wait(500);
    }

    console.log('Starting tests...\n');
    await tester.runAllTests();
});
