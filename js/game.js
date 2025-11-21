// Main game controller
class Game {
    constructor() {
        this.player = new Player();
        this.timeManager = new TimeManager(CONFIG.INITIAL_HOUR);
        this.locationManager = new LocationManager(this.timeManager);
        this.eventManager = new EventManager(this.locationManager, this.timeManager);
        this.ui = new UIManager(this.locationManager, this.timeManager);

        this.gameOver = false;
        this.victory = false;
        this.isAnimating = false;
    }

    // Initialize the game
    init() {
        this.ui.updateAll(this.player);
        // Initial log is now added when user clicks "Start Game" button
    }

    // Perform an action
    performAction(actionType) {
        if (this.gameOver || this.victory || this.isAnimating) return;

        // Check if action is available
        const availability = this.locationManager.isActionAvailable(actionType);
        if (!availability.available) {
            this.ui.addLog(`Can't do that: ${availability.reason}`, 'negative', this.player.day, this.timeManager.formatTime());
            return;
        }

        // Create action instance
        const action = createAction(actionType, this.player, this.locationManager, this.timeManager);

        // Action generates its own result
        const result = action.execute();

        // Execute the action
        this.executeAction(action, result);
    }

    // Travel to a new location
    travel(destinationId) {
        if (this.gameOver || this.victory) return;

        const result = this.locationManager.travel(destinationId);

        if (result.success) {
            this.ui.addLog(`Traveled to ${result.destination}.`, 'neutral', this.player.day, this.timeManager.formatTime());

            // Travel costs hunger
            const hungerCost = Math.floor(Math.random() * 5) + 3;
            this.player.modifyHunger(-hungerCost);
            this.ui.addLog(`Hunger -${hungerCost}`, 'negative', this.player.day, this.timeManager.formatTime());

            this.advanceTime(result.timeCost);
        } else {
            this.ui.addLog(result.message, 'negative', this.player.day, this.timeManager.formatTime());
        }
    }

    // Execute action with time and stat updates (hour-by-hour execution)
    async executeAction(action, result) {
        this.isAnimating = true;

        // Handle instant actions (any action with timeCost = 0)
        if (action.isInstant()) {
            action.applyStats(result.statChanges.money, result.statChanges.health, result.statChanges.hunger);
            this.ui.updateAll(this.player);
            this.ui.addLog(result.message, result.logType, this.player.day, this.timeManager.formatTime());
            this.isAnimating = false;
            return;
        }

        // Capture starting stats
        const startStats = {
            money: this.player.money,
            health: this.player.health,
            hunger: this.player.hunger
        };

        // Start UI animation for timed actions
        this.ui.startActionAnimation(actionType, result.timeCost);

        const totalHours = Math.ceil(result.timeCost);
        const perHourDuration = CONFIG.ANIMATION_SPEED;

        // Execute hour-by-hour
        for (let hourIndex = 0; hourIndex < totalHours; hourIndex++) {
            const startHour = this.timeManager.currentHour;
            const endHour = startHour + 1;

            // Delegate per-hour calculation to action
            const stats = action.calculatePerHourStats(hourIndex);

            // Calculate target stats for this hour
            const targetStats = {
                money: this.player.money + (action.shouldShowMoneyInTarget() ? stats.moneyChange : 0),
                health: this.player.health + stats.healthChange,
                hunger: this.player.hunger + stats.hungerChange
            };

            // Animate this hour
            await this.animateOneHour(startHour, endHour, perHourDuration, targetStats, false, totalHours, hourIndex);

            action.clampStats();

            // Delegate log message generation to action
            const logInfo = action.generateLogMessage(hourIndex, totalHours, stats);
            this.ui.addLog(logInfo.message, logInfo.logType, this.player.day, this.timeManager.formatTime());

            // Execute per-hour game logic
            const tickResults = this.executeHourTick(hourIndex, totalHours);
            if (tickResults.gameOver) {
                break;
            }
        }

        // Handle deferred payment (work)
        if (action.shouldDeferPayment()) {
            const payment = action.getFinalPayment();
            this.player.money += payment;
            this.player.money = Math.max(0, this.player.money);

            const finalLog = action.getFinalLogMessage();
            this.ui.addLog(finalLog.message, finalLog.logType, this.player.day, this.timeManager.formatTime());
        }

        // Animation complete
        this.completeAction(result, startStats);
    }

    // Animate a single hour (returns promise that resolves when hour animation completes)
    animateOneHour(startHour, endHour, durationMs, targetStats, deferMoney, totalHours, currentHour) {
        return new Promise((resolve) => {
            const currentStats = {
                money: this.player.money,
                health: this.player.health,
                hunger: this.player.hunger
            };

            const statChanges = {
                money: targetStats.money - currentStats.money,
                health: targetStats.health - currentStats.health,
                hunger: targetStats.hunger - currentStats.hunger
            };

            // Calculate progress for progress bar
            const overallProgress = (currentHour + 1) / totalHours;
            const hoursRemaining = totalHours - currentHour - 1;

            // Animate stats for this hour
            this.ui.animateStats(this.player, currentStats, statChanges, durationMs, deferMoney);

            // Animate time for this hour
            this.ui.animateTime(startHour, endHour, durationMs,
                (progress, hourProgress) => {
                    // Update progress bar with overall action progress
                    const totalProgress = (currentHour + progress) / totalHours;
                    const totalHoursRemaining = hoursRemaining + (1 - progress);
                    this.ui.updateActionProgress(totalProgress, totalHoursRemaining);
                },
                () => {
                    // Hour complete
                    resolve();
                }
            );
        });
    }

    // Execute game logic for each simulated hour during action
    executeHourTick(hourIndex, totalHours) {
        const results = {
            starvation: null,
            event: null,
            gameOver: false
        };

        // Apply starvation penalty
        const starvationResult = ActionUtils.applyStarvation(this.player);
        if (starvationResult) {
            results.starvation = starvationResult;
            this.ui.addLog(starvationResult.message, starvationResult.logType, this.player.day, this.timeManager.formatTime());
        }

        // DISABLED FOR DEBUGGING: Random events temporarily disabled
        // Calculate per-hour event probability
        // Formula: 1 - (1 - totalProbability)^(1/hours)
        // This distributes 20% total probability across all hours
        // const totalEventProbability = 0.2;
        // const perHourProbability = 1 - Math.pow(1 - totalEventProbability, 1 / totalHours);

        // Trigger random event with per-hour probability
        // if (Math.random() < perHourProbability) {
        //     const event = this.eventManager.trigger(this.player);
        //     if (event && event.result) {
        //         results.event = event;
        //         this.ui.addLog(`${event.message} ${event.result}`, 'neutral', this.player.day, this.timeManager.formatTime());
        //     } else if (event && event.id !== 'nothing') {
        //         results.event = event;
        //         this.ui.addLog(event.message, 'neutral', this.player.day, this.timeManager.formatTime());
        //     }
        // }

        // Check win/lose conditions
        this.checkGameState();
        if (this.gameOver || this.victory) {
            results.gameOver = true;
        }

        return results;
    }

    // Complete action after animation
    completeAction(result, startStats) {
        // Final summary log removed - per-hour logs provide all details

        // Ensure final game state check (in case last hour tick triggered end condition)
        this.checkGameState();

        // Update UI
        this.ui.updateAll(this.player);

        // End animation
        this.ui.endActionAnimation();
        this.isAnimating = false;
    }

    // Advance time and process turn
    advanceTime(hours) {
        const daysElapsed = this.timeManager.advanceTime(hours);

        // If days elapsed, increment player day counter
        if (daysElapsed > 0) {
            for (let i = 0; i < daysElapsed; i++) {
                this.player.nextDay();
            }
        }

        // Apply starvation penalty
        const starvationResult = ActionUtils.applyStarvation(this.player);
        if (starvationResult) {
            this.ui.addLog(starvationResult.message, starvationResult.logType, this.player.day, this.timeManager.formatTime());
        }

        // Trigger random event (20% chance per action)
        if (Math.random() < 0.2) {
            const event = this.eventManager.trigger(this.player);
            if (event && event.result) {
                this.ui.addLog(`${event.message} ${event.result}`, 'neutral', this.player.day, this.timeManager.formatTime());
            } else if (event && event.id !== 'nothing') {
                this.ui.addLog(event.message, 'neutral', this.player.day, this.timeManager.formatTime());
            }
        }

        // Check win/lose conditions
        this.checkGameState();

        // Update UI
        this.ui.updateAll(this.player);
    }

    // Check win/lose conditions
    checkGameState() {
        if (!this.player.isAlive()) {
            this.gameOver = true;
            this.ui.showGameOver(this.player);
        } else if (this.player.hasWon()) {
            this.victory = true;
            this.ui.showVictory(this.player);
        }
    }

    // Restart the game
    restart() {
        this.player.reset();
        this.timeManager.setTime(CONFIG.INITIAL_HOUR);
        this.locationManager.currentLocation = CONFIG.INITIAL_LOCATION;
        this.gameOver = false;
        this.victory = false;

        this.ui.reset();
        this.ui.updateAll(this.player);
        this.ui.addLog("New game started.", "neutral", this.player.day, this.timeManager.formatTime());
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init();
});
