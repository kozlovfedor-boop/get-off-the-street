// UI Manager - handles all DOM updates
class UIManager {
    constructor() {
        this.elements = {
            money: document.getElementById('money'),
            health: document.getElementById('health'),
            hunger: document.getElementById('hunger'),
            day: document.getElementById('day'),
            story: document.getElementById('story'),
            gameStatus: document.getElementById('game-status'),
            actions: document.getElementById('actions'),
            log: document.getElementById('log')
        };

        this.logEntries = [];
    }

    // Update all stat displays
    updateStats(player) {
        this.elements.money.textContent = `$${player.money}`;
        this.elements.health.textContent = player.health;
        this.elements.hunger.textContent = player.hunger;
        this.elements.day.textContent = player.day;
    }

    // Add entry to game log
    addLog(message, type = 'neutral', day) {
        const entry = {
            day: day,
            message: message,
            type: type
        };

        this.logEntries.unshift(entry);

        // Keep only last N entries
        if (this.logEntries.length > CONFIG.MAX_LOG_ENTRIES) {
            this.logEntries = this.logEntries.slice(0, CONFIG.MAX_LOG_ENTRIES);
        }

        this.renderLog();
    }

    // Render the log
    renderLog() {
        this.elements.log.innerHTML = '';

        this.logEntries.forEach(entry => {
            const div = document.createElement('div');
            div.className = `log-entry ${entry.type}`;
            div.textContent = `Day ${entry.day}: ${entry.message}`;
            this.elements.log.appendChild(div);
        });
    }

    // Clear log
    clearLog() {
        this.logEntries = [];
        this.elements.log.innerHTML = '';
    }

    // Show game over screen
    showGameOver(player) {
        this.elements.gameStatus.innerHTML = `
            <div class="game-over">
                <h2>GAME OVER</h2>
                <p>You died on the streets after ${player.day} days.</p>
                <p>Money earned: $${player.money}</p>
            </div>
        `;

        this.disableActionButtons();
        this.showRestartButton();
    }

    // Show victory screen
    showVictory(player) {
        this.elements.gameStatus.innerHTML = `
            <div class="victory">
                <h2>CONGRATULATIONS!</h2>
                <p>You survived ${player.day} days on the streets and saved enough money to rent an apartment!</p>
                <p>Final money: $${player.money}</p>
                <p>You made it off the street!</p>
            </div>
        `;

        this.disableActionButtons();
        this.showRestartButton();
    }

    // Disable action buttons
    disableActionButtons() {
        const buttons = this.elements.actions.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }

    // Enable action buttons
    enableActionButtons() {
        const buttons = this.elements.actions.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = false);
    }

    // Show restart button
    showRestartButton() {
        const restartBtn = document.createElement('button');
        restartBtn.className = 'restart';
        restartBtn.textContent = 'Start New Game';
        restartBtn.onclick = () => window.game.restart();
        this.elements.actions.appendChild(restartBtn);
    }

    // Reset to initial state
    reset() {
        this.elements.gameStatus.innerHTML = '';
        this.clearLog();
        this.elements.story.innerHTML = `
            <p>You wake up on a cold park bench. Everything you owned is gone. No home. No job. No money.</p>
            <p>You need to survive on the streets and save $2,000 to rent an apartment and start over.</p>
            <p>What will you do?</p>
        `;

        this.elements.actions.innerHTML = `
            <button class="work" data-action="work">Find Work</button>
            <button class="food" data-action="food">Find Food</button>
            <button class="rest" data-action="rest">Rest</button>
            <button class="steal" data-action="steal">Steal</button>
        `;

        // Re-attach event listeners
        this.attachActionListeners();
    }

    // Attach event listeners to action buttons
    attachActionListeners() {
        const buttons = this.elements.actions.querySelectorAll('[data-action]');
        buttons.forEach(btn => {
            const action = btn.getAttribute('data-action');
            btn.onclick = () => window.game.performAction(action);
        });
    }
}
