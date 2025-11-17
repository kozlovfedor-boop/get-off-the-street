// Main game controller
class Game {
    constructor() {
        this.player = new Player();
        this.eventManager = new EventManager();
        this.actionManager = new ActionManager(this.player);
        this.ui = new UIManager();

        this.gameOver = false;
        this.victory = false;
    }

    // Initialize the game
    init() {
        this.ui.updateStats(this.player);
        this.ui.addLog("Game started. Goal: Save $2,000 to rent an apartment.", "neutral", this.player.day);
        this.ui.attachActionListeners();
    }

    // Perform an action
    performAction(actionType) {
        if (this.gameOver || this.victory) return;

        let result;

        switch(actionType) {
            case 'work':
                result = this.actionManager.findWork();
                break;
            case 'food':
                result = this.actionManager.findFood();
                break;
            case 'rest':
                result = this.actionManager.rest();
                break;
            case 'steal':
                result = this.actionManager.steal();
                break;
            default:
                console.error('Unknown action:', actionType);
                return;
        }

        this.ui.addLog(result.message, result.logType, this.player.day);
        this.endTurn();
    }

    // End turn and process day cycle
    endTurn() {
        this.player.nextDay();

        // Apply starvation penalty
        const starvationResult = this.actionManager.applyStarvation();
        if (starvationResult) {
            this.ui.addLog(starvationResult.message, starvationResult.logType, this.player.day);
        }

        // Trigger random event
        const event = this.eventManager.trigger(this.player);
        if (event && event.result) {
            this.ui.addLog(`${event.message} ${event.result}`, 'neutral', this.player.day);
        } else if (event && event.id !== 'nothing') {
            this.ui.addLog(event.message, 'neutral', this.player.day);
        }

        // Check win/lose conditions
        this.checkGameState();

        // Update UI
        this.ui.updateStats(this.player);
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
        this.gameOver = false;
        this.victory = false;

        this.ui.reset();
        this.ui.updateStats(this.player);
        this.ui.addLog("New game started.", "neutral", this.player.day);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init();
});
