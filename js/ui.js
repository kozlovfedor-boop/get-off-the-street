// UI Manager - handles all DOM updates
class UIManager {
    constructor(locationManager, timeManager) {
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.characterAnimation = new CharacterAnimationManager(locationManager);

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
            travelButtonContainer: document.getElementById('travel-button-container'),
            locationDestinations: document.getElementById('location-destinations'),
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

        // Initialize character animation immediately (DOM is already ready)
        this.characterAnimation.init();
    }

    // Update all stat displays
    updateStats(player) {
        // Update money (format as whole number)
        this.elements.money.textContent = `£${Math.floor(player.money)}`;

        // Update health (format as whole number)
        this.elements.healthValue.textContent = Math.floor(player.health);
        this.elements.healthBar.style.width = `${player.health}%`;

        // Add critical class if health < 20
        const healthBarParent = this.elements.healthBar.closest('.health-bar');
        if (player.health < CONFIG.STARVATION_THRESHOLD) {
            healthBarParent.classList.add('critical');
        } else {
            healthBarParent.classList.remove('critical');
        }

        // Update hunger (format as whole number)
        this.elements.hungerValue.textContent = Math.floor(player.hunger);
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
        this.renderLocationTravel();
        this.hideTravelMenu(); // Close travel menu when location changes

        // Update character animation location background
        this.characterAnimation.updateLocation();
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

        // Show actions container
        this.elements.actions.classList.remove('hidden');
    }

    // Get action class for preview
    getActionClass(actionType) {
        const actionClassMap = {
            'work': WorkAction,
            'panhandle': PanhandleAction,
            'food': FindFoodAction,
            'sleep': SleepAction,
            'rest': SleepAction,
            'steal': StealAction,
            'eat': EatAction
        };
        return actionClassMap[actionType];
    }

    // Format stat change for display
    formatStatChange(stat, range, isPositive) {
        const [min, max] = range;
        if (min === 0 && max === 0) return null;

        const sign = isPositive ? '+' : '';
        const prefix = stat === 'money' ? '£' : '';

        if (min === max) {
            return `${sign}${prefix}${min}`;
        }
        return `${sign}${prefix}${min} to ${sign}${prefix}${max}`;
    }

    // Create action button with time and effects
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
        const actionName = actionNames[action] || action;

        // Get preview data from action class
        const ActionClass = this.getActionClass(action);
        const preview = ActionClass ? ActionClass.getPreview() : null;

        if (preview) {
            // Create two-line button structure
            const topLine = document.createElement('div');
            topLine.className = 'action-top-line';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'action-name';
            nameSpan.textContent = actionName;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'action-time';
            timeSpan.textContent = preview.timeCost === 0 ? '⏱️ instant' : `⏱️ ${preview.timeCost}h`;

            topLine.appendChild(nameSpan);
            topLine.appendChild(timeSpan);

            // Create effects line
            const effectsLine = document.createElement('div');
            effectsLine.className = 'action-effects';

            const effects = [];

            // Money effect
            const moneyText = this.formatStatChange('money', preview.effects.money, preview.effects.money[0] >= 0);
            if (moneyText) {
                effects.push(`💰 ${moneyText}`);
            }

            // Health effect
            const healthText = this.formatStatChange('health', preview.effects.health, preview.effects.health[0] >= 0);
            if (healthText) {
                effects.push(`❤️ ${healthText}`);
            }

            // Hunger effect
            const hungerText = this.formatStatChange('hunger', preview.effects.hunger, preview.effects.hunger[0] >= 0);
            if (hungerText) {
                effects.push(`🍔 ${hungerText}`);
            }

            effectsLine.textContent = effects.join('  ');

            button.appendChild(topLine);
            button.appendChild(effectsLine);
        } else {
            // Fallback for buttons without preview
            button.textContent = actionName;
        }

        // Disable if not available
        if (!availability.available) {
            button.disabled = true;
            button.title = availability.reason;
        } else {
            // Add tooltip with notes if any
            if (preview && preview.notes) {
                button.title = preview.notes;
            }
            button.onclick = () => window.game.performAction(action);
        }

        return button;
    }

    // Render travel button in location area
    renderLocationTravel() {
        // Create travel button
        this.elements.travelButtonContainer.innerHTML = '';
        const travelButton = document.createElement('button');
        // Toggle button text based on travelMode state
        travelButton.textContent = this.travelMode ? 'Cancel' : 'Travel';
        travelButton.onclick = () => this.toggleTravelMenu();
        this.elements.travelButtonContainer.appendChild(travelButton);
    }

    // Toggle travel destinations menu
    toggleTravelMenu() {
        const isHidden = this.elements.locationDestinations.classList.contains('hidden');

        if (isHidden) {
            this.showTravelMenu();
        } else {
            this.hideTravelMenu();
        }
    }

    // Show travel menu in location area
    showTravelMenu() {
        const currentId = this.locationManager.currentLocation;
        const allLocations = this.locationManager.getAllLocations();

        // Clear and populate destinations
        this.elements.locationDestinations.innerHTML = '';

        const title = document.createElement('h3');
        title.textContent = 'Travel to:';
        this.elements.locationDestinations.appendChild(title);

        allLocations.forEach(dest => {
            if (dest.id === currentId) return; // Skip current location

            // Calculate path and time
            const pathInfo = this.locationManager.calculatePath(currentId, dest.id);
            if (!pathInfo) return;

            const button = document.createElement('button');
            button.className = 'destination-button';

            // Create two-line structure like action buttons
            const topLine = document.createElement('div');
            topLine.className = 'destination-top-line';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'destination-name';
            nameSpan.textContent = dest.name;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'destination-time';
            timeSpan.textContent = `⏱️ ${pathInfo.totalTime}h`;

            topLine.appendChild(nameSpan);
            topLine.appendChild(timeSpan);

            // Create description line
            const descLine = document.createElement('div');
            descLine.className = 'destination-desc';

            // Show path if multi-hop
            if (pathInfo.hops > 1) {
                const pathNames = pathInfo.path
                    .slice(1, -1) // Exclude start and end
                    .map(id => this.locationManager.getLocation(id).name);
                descLine.textContent = `Via: ${pathNames.join(' → ')}`;
            } else {
                descLine.textContent = dest.description;
            }

            button.appendChild(topLine);
            button.appendChild(descLine);

            button.onclick = () => {
                window.game.travel(dest.id);
                this.hideTravelMenu();
            };
            this.elements.locationDestinations.appendChild(button);
        });

        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.onclick = () => this.hideTravelMenu();
        this.elements.locationDestinations.appendChild(cancelButton);

        // Show destinations and hide actions
        this.elements.locationDestinations.classList.remove('hidden');
        this.elements.actions.classList.add('hidden');

        // Update travel mode and button text
        this.travelMode = true;
        this.renderLocationTravel();
    }

    // Hide travel menu
    hideTravelMenu() {
        this.elements.locationDestinations.classList.add('hidden');
        this.elements.actions.classList.remove('hidden');

        // Update travel mode and button text
        this.travelMode = false;
        this.renderLocationTravel();
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

    // Start action animation
    startActionAnimation(actionName, timeCost, direction = null) {
        // Action message text
        const actionMessages = {
            'work': 'Working...',
            'food': 'Searching for food...',
            'eat': 'Eating...',
            'sleep': 'Sleeping...',
            'rest': 'Resting...',
            'steal': 'Stealing...',
            'panhandle': 'Panhandling...',
            'traveling': 'Traveling...'
        };
        const message = actionMessages[actionName] || 'Performing action...';

        // Replace action buttons with progress UI
        this.elements.actions.innerHTML = `
            <div class="action-progress">
                <div class="action-message" id="action-message">${message}</div>
                <div class="action-progress-container">
                    <div class="action-progress-bar" id="action-progress-bar"></div>
                </div>
                <div class="action-time-remaining" id="action-time-remaining">Starting...</div>
            </div>
        `;

        // Update element references
        this.elements.actionMessage = document.getElementById('action-message');
        this.elements.actionProgressBar = document.getElementById('action-progress-bar');
        this.elements.actionTimeRemaining = document.getElementById('action-time-remaining');

        // Start character animation with direction
        this.characterAnimation.setAnimation(actionName, direction);
    }

    // Update action progress
    updateActionProgress(progress, hoursRemaining) {
        if (this.elements.actionProgressBar) {
            this.elements.actionProgressBar.style.width = `${progress * 100}%`;
        }
        if (this.elements.actionTimeRemaining) {
            this.elements.actionTimeRemaining.textContent = `${hoursRemaining.toFixed(1)}h remaining`;
        }
    }

    // End action animation
    endActionAnimation() {
        // Restore action buttons
        this.renderActionButtons();

        // Return character to idle state
        this.characterAnimation.setIdle();
    }

    // Start background scrolling animation for travel
    startBackgroundScroll(direction, fromLocation, toLocation) {
        // Ensure animation manager is initialized
        if (!this.characterAnimation.display) {
            console.warn('Character animation not initialized, calling init()');
            this.characterAnimation.init();
        }

        if (!this.characterAnimation.display) {
            console.error('Character display element not found');
            return;
        }

        const display = this.characterAnimation.display;

        // Set transition state
        display.setAttribute('data-location', `${fromLocation}-to-${toLocation}`);

        // Force reflow to ensure CSS recognizes the attribute change
        void display.offsetHeight;

        // Use requestAnimationFrame to ensure animation classes are applied after reflow
        requestAnimationFrame(() => {
            display.classList.add('transitioning');

            // Add scroll animation class based on direction
            if (direction === 'right') {
                display.classList.add('traveling-right');
            } else {
                display.classList.add('traveling-left');
            }

            // Set character sprite animation to match direction
            this.characterAnimation.setAnimation('traveling', direction);
        });
    }

    // Stop background scrolling
    stopBackgroundScroll() {
        if (!this.characterAnimation.display) return;

        const display = this.characterAnimation.display;
        display.classList.remove('traveling-right', 'traveling-left', 'transitioning');
        display.removeAttribute('data-location');  // Clear the data-location to reset state
        void display.offsetHeight;  // Force browser reflow to allow CSS animations to reset
    }

    // Animate time gradually
    animateTime(startHour, endHour, durationMs, onProgress, onComplete) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const totalChange = endHour - startHour;

            // Track which day boundaries we've crossed
            let lastDayBoundary = Math.floor(startHour / 24);

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / durationMs, 1);

                const currentHour = startHour + (totalChange * progress);
                this.timeManager.setTime(currentHour);
                this.updateTime();

                // Check if we crossed midnight during this frame
                const currentDayBoundary = Math.floor(currentHour / 24);
                if (currentDayBoundary > lastDayBoundary) {
                    // We crossed one or more day boundaries
                    const daysCrossed = currentDayBoundary - lastDayBoundary;
                    for (let i = 0; i < daysCrossed; i++) {
                        window.game.player.nextDay();
                    }
                    // Update day display immediately
                    this.elements.day.textContent = window.game.player.day;
                    lastDayBoundary = currentDayBoundary;
                }

                const hoursRemaining = endHour - currentHour;
                onProgress(progress, hoursRemaining);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    onComplete();
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    // Animate stats gradually (health/hunger animated, money instant)
    animateStats(player, startStats, statChanges, durationMs, payAtEnd = false) {
        return new Promise((resolve) => {
            const startTime = performance.now();

            // INSTANT UPDATE: Apply money changes immediately (no animation)
            if (!payAtEnd) {
                player.money = Math.max(0, startStats.money + statChanges.money);
                this.updateStats(player);  // Update display immediately
            }

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / durationMs, 1);

                // ANIMATED: Gradually update health and hunger only
                const currentHealth = startStats.health + (statChanges.health * progress);
                const currentHunger = startStats.hunger + (statChanges.hunger * progress);

                player.health = Math.round(currentHealth);
                player.hunger = Math.round(currentHunger);

                // Clamp to valid ranges
                player.health = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HEALTH, player.health));
                player.hunger = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HUNGER, player.hunger));

                this.updateStats(player);

                // For payAtEnd: add money at the very end (instant, no animation)
                if (payAtEnd && progress === 1) {
                    player.money = Math.max(0, startStats.money + statChanges.money);
                    this.updateStats(player);
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }
}
