// UI Manager - handles all DOM updates
class UIManager {
    constructor(locationManager, timeManager) {
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        this.elements = {
            money: document.getElementById('money'),
            health: document.getElementById('health'),
            hunger: document.getElementById('hunger'),
            day: document.getElementById('day'),
            time: document.getElementById('time'),
            location: document.getElementById('location'),
            locationDesc: document.getElementById('location-desc'),
            story: document.getElementById('story'),
            gameStatus: document.getElementById('game-status'),
            actions: document.getElementById('actions'),
            log: document.getElementById('log')
        };

        this.logEntries = [];
        this.travelMode = false;
    }

    // Update all stat displays
    updateStats(player) {
        this.elements.money.textContent = `£${player.money}`;
        this.elements.health.textContent = player.health;
        this.elements.hunger.textContent = player.hunger;
        this.elements.day.textContent = player.day;
    }

    // Update time display
    updateTime() {
        this.elements.time.textContent = this.timeManager.formatTime();
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
        this.elements.story.innerHTML = `
            <p>You wake up in the park on a cold morning. Everything you owned is gone. No home. No job. No money.</p>
            <p>You need to survive on the streets and save $2,000 to rent an apartment and start over.</p>
            <p>What will you do?</p>
        `;

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
