// Main game controller
class Game {
    constructor() {
        this.player = new Player();
        this.timeManager = new TimeManager(CONFIG.INITIAL_HOUR);
        this.locationManager = new LocationService(this.timeManager);
        this.ui = new UIManager(this.locationManager, this.timeManager);
        this.eventCoordinator = new EventCoordinator(this.ui);

        this.gameOver = false;
        this.victory = false;
        this.isAnimating = false;
    }

    // Initialize the game
    init() {
        // Ensure character animation is initialized
        this.ui.characterAnimation.init();
        this.ui.updateAll(this.player);
        // Initial log is now added when user clicks "Start Game" button
    }

    // Perform an action
    async performAction(actionType) {
        if (this.gameOver || this.victory || this.isAnimating) return;

        // Get current location
        const location = this.locationManager.getCurrentLocation();

        // Check if action is available
        const availability = location.isActionAvailable(actionType, this.timeManager);
        if (!availability.available) {
            this.ui.addLog(`Can't do that: ${availability.reason}`, 'negative', this.player.day, this.timeManager.formatTime());
            return;
        }

        // Get pre-configured action from location
        const action = location.getAction(actionType);
        if (!action) {
            this.ui.addLog(`Action ${actionType} not found`, 'negative', this.player.day, this.timeManager.formatTime());
            return;
        }

        // Execute action with runtime dependencies
        const result = action.execute(this.player, this.locationManager, this.timeManager);

        // Execute the action
        await this.executeAction(action, result);
    }

    // Travel to a new location
    async travel(destinationId) {
        if (this.gameOver || this.victory || this.isAnimating) return;

        const result = this.locationManager.travel(destinationId);

        if (!result.success) {
            this.ui.addLog(result.message, 'negative', this.player.day, this.timeManager.formatTime());
            return;
        }

        // Create travel action instance
        const travelAction = new TravelAction({
            destinationId: destinationId,
            timeCost: result.timeCost,
            path: result.path,
            direction: result.direction
        });

        // Execute travel action
        const actionResult = travelAction.execute(this.player, this.locationManager, this.timeManager);

        // Execute using specialized travel execution
        await this.executeTravelAction(travelAction, actionResult);

        // Travel complete - NOW update the location
        this.locationManager.currentLocation = destinationId;

        // Update UI
        this.ui.updateAll(this.player);
    }

    // Execute travel action with background scrolling animation
    async executeTravelAction(travelAction, result) {
        this.isAnimating = true;
        this.ui.setTravelButtonEnabled(false);

        // Start UI animation
        this.ui.startActionAnimation('traveling', result.timeCost, result.direction);

        const totalHours = Math.ceil(result.timeCost);
        const perHourDuration = CONFIG.ANIMATION_SPEED;
        const path = result.path;

        // Animate through each segment of the path
        for (let hourIndex = 0; hourIndex < totalHours; hourIndex++) {
            const fromLocation = path[hourIndex];
            const toLocation = path[hourIndex + 1];

            // Start background scroll animation for this segment
            this.ui.startBackgroundScroll(result.direction, fromLocation, toLocation);

            const startHour = this.timeManager.currentHour;
            const endHour = startHour + 1;

            // Get per-hour stats from action
            const stats = travelAction.calculatePerHourStats(hourIndex);

            const targetStats = {
                money: this.player.money,
                health: this.player.health,
                hunger: this.player.hunger + stats.hungerChange
            };

            // Animate this hour/segment
            await this.animateOneHour(startHour, endHour, perHourDuration, targetStats, false, totalHours, hourIndex);

            // Stop background scroll
            this.ui.stopBackgroundScroll();

            // Clamp stats
            travelAction.clampStats();

            // Generate log message
            const logInfo = travelAction.generateLogMessage(hourIndex, totalHours, stats);
            this.ui.addLog(logInfo.message, logInfo.logType, this.player.day, this.timeManager.formatTime());

            // Execute hour tick - NOW WITH EVENT SUPPORT during travel
            const tickResults = await this.executeHourTick(hourIndex, totalHours, travelAction);
            if (tickResults.gameOver) {
                break;
            }
        }

        this.ui.endActionAnimation();
        this.isAnimating = false;
        this.ui.setTravelButtonEnabled(true);
    }

    // Execute action with time and stat updates (hour-by-hour execution)
    async executeAction(action, result) {
        this.isAnimating = true;
        this.ui.setTravelButtonEnabled(false);

        // Handle instant actions (any action with timeCost = 0)
        if (action.isInstant()) {
            action.applyStats(result.statChanges.money, result.statChanges.health, result.statChanges.hunger);
            this.ui.updateAll(this.player);
            this.ui.addLog(result.message, result.logType, this.player.day, this.timeManager.formatTime());
            this.isAnimating = false;
            this.ui.setTravelButtonEnabled(true);
            return;
        }

        // Capture starting stats
        const startStats = {
            money: this.player.money,
            health: this.player.health,
            hunger: this.player.hunger
        };

        // Start UI animation for timed actions
        this.ui.startActionAnimation(result.type, result.timeCost);

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

            // Execute per-hour game logic (including events)
            const tickResults = await this.executeHourTick(hourIndex, totalHours, action);

            // Check if game ended or action should be stopped
            if (tickResults.gameOver || tickResults.stopAction) {
                if (tickResults.stopAction) {
                    this.ui.addLog('Action stopped early.', 'neutral', this.player.day, this.timeManager.formatTime());
                }
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
    async animateOneHour(startHour, endHour, durationMs, targetStats, deferMoney, totalHours, currentHour) {
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

        // Animate both stats and time in parallel, wait for both to complete
        await Promise.all([
            this.ui.animateStats(this.player, currentStats, statChanges, durationMs, deferMoney),
            this.ui.animateTime(startHour, endHour, durationMs,
                (progress, hourProgress) => {
                    // Update progress bar with overall action progress
                    const totalProgress = (currentHour + progress) / totalHours;
                    const totalHoursRemaining = hoursRemaining + (1 - progress);
                    this.ui.updateActionProgress(totalProgress, totalHoursRemaining);
                },
                () => {
                    // Hour complete
                }
            )
        ]);
    }

    // Execute game logic for each simulated hour during action
    async executeHourTick(hourIndex, totalHours, currentAction) {
        console.log(`[executeHourTick] Hour ${hourIndex + 1}/${totalHours}, action: ${currentAction ? currentAction.constructor.name : 'none'}`);

        const results = {
            starvation: null,
            event: null,
            gameOver: false,
            stopAction: false
        };

        // Apply starvation penalty
        const starvationResult = this.player.applyStarvationPenalty();
        if (starvationResult) {
            results.starvation = starvationResult;
            this.ui.addLog(starvationResult.message, starvationResult.logType, this.player.day, this.timeManager.formatTime());
        }

        // Evaluate action-specific events
        if (currentAction) {
            console.log(`[executeHourTick] Evaluating events for ${currentAction.constructor.name}`);

            // Use EventCoordinator
            const context = {
                player: this.player,
                locationManager: this.locationManager,
                timeManager: this.timeManager
            };

            const eventResult = await this.eventCoordinator.evaluateAndHandleEvents(
                currentAction,
                hourIndex,
                totalHours,
                context
            );

            if (eventResult) {
                results.event = eventResult;
                this.ui.addLog(eventResult.message, eventResult.logType, this.player.day, this.timeManager.formatTime());

                if (eventResult.stopAction) {
                    results.stopAction = true;
                }
            }
        }

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
        this.ui.setTravelButtonEnabled(true);
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
        const starvationResult = this.player.applyStarvationPenalty();
        if (starvationResult) {
            this.ui.addLog(starvationResult.message, starvationResult.logType, this.player.day, this.timeManager.formatTime());
        }

        // Events now handled during action execution via executeHourTick()

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
        this.isAnimating = false;

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
