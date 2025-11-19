// UI Manager - handles all DOM updates
class UIManager {
    constructor(locationManager, timeManager) {
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        this.elements = {
            money: document.getElementById('money'),
            healthValue: document.getElementById('health-value'),
            healthBar: document.getElementById('health-bar'),
            hungerValue: document.getElementById('hunger-value'),
            hungerBar: document.getElementById('hunger-bar'),
            day: document.getElementById('day'),
            time: document.getElementById('time'),
            timePeriod: document.getElementById('time-period'),
            location: document.getElementById('location'),
            locationDesc: document.getElementById('location-desc'),
            story: document.getElementById('story'),
            gameStatus: document.getElementById('game-status'),
            actions: document.getElementById('actions'),
            log: document.getElementById('log'),
            startGameBtn: document.getElementById('start-game'),
            gameContent: document.getElementById('game-content')
        };

        this.logEntries = [];
        this.travelMode = false;
        this.gameStarted = false;

        // Set up start game button listener
        this.elements.startGameBtn.addEventListener('click', () => this.dismissIntro());

        // Show intro text on initial load
        this.showIntro();
    }

    // Update all stat displays
    updateStats(player) {
        // Update money
        this.elements.money.textContent = `£${player.money}`;

        // Update health
        this.elements.healthValue.textContent = player.health;
        this.elements.healthBar.style.width = `${player.health}%`;

        // Add critical class if health < 20
        const healthBarParent = this.elements.healthBar.closest('.health-bar');
        if (player.health < CONFIG.STARVATION_THRESHOLD) {
            healthBarParent.classList.add('critical');
        } else {
            healthBarParent.classList.remove('critical');
        }

        // Update hunger
        this.elements.hungerValue.textContent = player.hunger;
        this.elements.hungerBar.style.width = `${player.hunger}%`;

        // Add critical class if hunger < 20
        const hungerBarParent = this.elements.hungerBar.closest('.hunger-bar');
        if (player.hunger < CONFIG.STARVATION_THRESHOLD) {
            hungerBarParent.classList.add('critical');
        } else {
            hungerBarParent.classList.remove('critical');
        }

        // Update day
        this.elements.day.textContent = player.day;
    }

    // Update time display
    updateTime() {
        this.elements.time.textContent = this.timeManager.formatTime();
        this.elements.timePeriod.textContent = this.timeManager.getTimePeriod();
    }

    // Update location display
    updateLocation() {
        const location = this.locationManager.getCurrentLocation();
        this.elements.location.textContent = location.name;
        this.elements.locationDesc.textContent = location.description;
    }

    // Render action buttons based on current location and time
    renderActionButtons() {
        const location = this.locationManager.getCurrentLocation();
        const actions = location.actions;

        this.elements.actions.innerHTML = '';

        // Add location-specific action buttons
        actions.forEach(action => {
            const availability = this.locationManager.isActionAvailable(action);
            const button = this.createActionButton(action, availability);
            this.elements.actions.appendChild(button);
        });

        // Always add travel button
        const travelButton = document.createElement('button');
        travelButton.className = 'travel';
        travelButton.textContent = 'Travel';
        travelButton.onclick = () => this.showTravelMenu();
        this.elements.actions.appendChild(travelButton);
    }

    // Create action button
    createActionButton(action, availability) {
        const button = document.createElement('button');
        button.className = action;
        button.setAttribute('data-action', action);

        // Set button text
        const actionNames = {
            'work': 'Find Work',
            'food': 'Find Food',
            'sleep': 'Sleep/Rest',
            'rest': 'Rest',
            'steal': 'Steal',
            'panhandle': 'Panhandle',
            'eat': 'Eat Meal'
        };
        button.textContent = actionNames[action] || action;

        // Disable if not available
        if (!availability.available) {
            button.disabled = true;
            button.title = availability.reason;
        } else {
            button.onclick = () => window.game.performAction(action);
        }

        return button;
    }

    // Show travel menu
    showTravelMenu() {
        const destinations = this.locationManager.getAvailableDestinations();
        const currentLocation = this.locationManager.getCurrentLocation();

        this.elements.actions.innerHTML = '<div class="travel-menu"></div>';
        const menu = this.elements.actions.querySelector('.travel-menu');

        const title = document.createElement('h3');
        title.textContent = 'Travel to:';
        title.style.marginBottom = '10px';
        menu.appendChild(title);

        destinations.forEach(dest => {
            const button = document.createElement('button');
            button.className = 'travel-dest';
            button.innerHTML = `
                <strong>${dest.name}</strong><br>
                <small>${dest.description}</small><br>
                <small>Travel time: ${dest.travelTime}h</small>
            `;
            button.onclick = () => window.game.travel(dest.id);
            menu.appendChild(button);
        });

        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.onclick = () => this.renderActionButtons();
        menu.appendChild(cancelButton);
    }

    // Add entry to game log
    addLog(message, type = 'neutral', day, time) {
        const entry = {
            day: day,
            time: time,
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
            div.textContent = `Day ${entry.day}, ${entry.time}: ${entry.message}`;
            this.elements.log.appendChild(div);
        });
    }

    // Clear log
    clearLog() {
        this.logEntries = [];
        this.elements.log.innerHTML = '';
    }

    // Show intro text
    showIntro() {
        const introLines = CONFIG.INTRO_TEXT.split('\n\n');
        let introHTML = '';
        introLines.forEach(line => {
            introHTML += `<p>${line}</p>`;
        });

        this.elements.story.innerHTML = introHTML + '<button class="start-game-btn" id="start-game">Start Game</button>';

        // Re-attach event listener after innerHTML update
        this.elements.startGameBtn = document.getElementById('start-game');
        this.elements.startGameBtn.addEventListener('click', () => this.dismissIntro());

        this.elements.story.classList.remove('hidden');
        this.elements.gameContent.classList.add('hidden');
        this.gameStarted = false;
    }

    // Dismiss intro and move to log
    dismissIntro() {
        if (this.gameStarted) return;

        // Add intro text to log
        this.addLog(CONFIG.INTRO_TEXT, 'neutral', 1, this.timeManager.formatTime());

        // Hide story div and show game content
        this.elements.story.classList.add('hidden');
        this.elements.gameContent.classList.remove('hidden');

        this.gameStarted = true;
    }

    // Show game over screen
    showGameOver(player) {
        this.elements.gameStatus.innerHTML = `
            <div class="game-over">
                <h2>GAME OVER</h2>
                <p>You died on the streets after ${player.day} days.</p>
                <p>Money earned: £${player.money}</p>
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
                <p>Final money: £${player.money}</p>
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
        this.showIntro();
        this.renderActionButtons();
    }

    // Update all displays
    updateAll(player) {
        this.updateStats(player);
        this.updateTime();
        this.updateLocation();
        this.renderActionButtons();
    }
}
