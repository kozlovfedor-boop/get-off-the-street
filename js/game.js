// Main game controller
class Game {
    constructor() {
        this.player = new Player();
        this.timeManager = new TimeManager(CONFIG.INITIAL_HOUR);
        this.locationManager = new LocationManager(this.timeManager);
        this.eventManager = new EventManager(this.locationManager, this.timeManager);
        this.actionManager = new ActionManager(this.player, this.locationManager);
        this.ui = new UIManager(this.locationManager, this.timeManager);

        this.gameOver = false;
        this.victory = false;
    }

    // Initialize the game
    init() {
        this.ui.updateAll(this.player);
        // Initial log is now added when user clicks "Start Game" button
    }

    // Perform an action
    performAction(actionType) {
        if (this.gameOver || this.victory) return;

        // Check if action is available
        const availability = this.locationManager.isActionAvailable(actionType);
        if (!availability.available) {
            this.ui.addLog(`Can't do that: ${availability.reason}`, 'negative', this.player.day, this.timeManager.formatTime());
            return;
        }

        let result;

        switch(actionType) {
            case 'work':
                result = this.actionManager.findWork();
                break;
            case 'food':
                result = this.actionManager.findFood();
                break;
            case 'eat':
                result = this.actionManager.eat();
                break;
            case 'sleep':
                result = this.actionManager.sleep();
                break;
            case 'rest':
                result = this.actionManager.rest();
                break;
            case 'steal':
                result = this.actionManager.steal();
                break;
            case 'panhandle':
                result = this.actionManager.panhandle();
                break;
            default:
                console.error('Unknown action:', actionType);
                return;
        }

        this.ui.addLog(result.message, result.logType, this.player.day, this.timeManager.formatTime());
        this.advanceTime(result.timeCost);
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

            this.advanceTime(result.timeCost);
        } else {
            this.ui.addLog(result.message, 'negative', this.player.day, this.timeManager.formatTime());
        }
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
        const starvationResult = this.actionManager.applyStarvation();
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
