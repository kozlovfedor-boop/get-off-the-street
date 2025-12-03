// Helper function to map preset levels to icon counts
function getIconCount(presetLevel) {
    if (!presetLevel || presetLevel === 'none') return 0;
    if (presetLevel === 'low') return 1;
    if (presetLevel === 'medium') return 2;
    if (presetLevel === 'high') return 3;
    return 0;
}

// UI Manager - handles all DOM updates
class UIManager {
    constructor(locationManager, timeManager, reputationManager) {
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.reputationManager = reputationManager;  // NEW
        this.characterAnimation = new CharacterAnimationManager(locationManager);

        this.elements = {
            money: document.getElementById('money'),
            healthValue: document.getElementById('health-value'),
            healthBar: document.getElementById('health-bar'),
            hungerValue: document.getElementById('hunger-value'),
            hungerBar: document.getElementById('hunger-bar'),
            level: document.getElementById('level'),
            xpValue: document.getElementById('xp-value'),
            xpBar: document.getElementById('xp-bar'),
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
            gameContent: document.getElementById('game-content'),

            // NEW: Reputation elements
            repPoliceIcon: document.getElementById('rep-police-icon'),
            repPoliceTier: document.getElementById('rep-police-tier'),
            repLocalsIcon: document.getElementById('rep-locals-icon'),
            repLocalsTier: document.getElementById('rep-locals-tier'),
            repShelterIcon: document.getElementById('rep-shelter-icon'),
            repShelterTier: document.getElementById('rep-shelter-tier'),
            repBusinessIcon: document.getElementById('rep-business-icon'),
            repBusinessTier: document.getElementById('rep-business-tier')
        };

        this.logEntries = [];
        this.travelMode = false;
        this.gameStarted = false;

        // Event UI state (inline, no separate modal)
        this.eventUIActive = false;
        this.currentEventResolver = null;

        // Travel button reference for enable/disable control
        this.travelButton = null;

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

        // Update level and XP
        this.elements.level.textContent = player.level;
        const xpNeeded = player.getXPForNextLevel();
        this.elements.xpValue.textContent = `${Math.floor(player.experience)} / ${xpNeeded}`;
        const xpProgress = (player.experience / xpNeeded) * 100;
        this.elements.xpBar.style.width = `${xpProgress}%`;

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
    renderActionButtons(player = null) {
        const location = this.locationManager.getCurrentLocation();
        const actions = location.getActions();

        this.elements.actions.innerHTML = '';

        // Add location-specific action buttons
        actions.forEach(action => {
            const availability = this.locationManager.isActionAvailable(action, player);
            const button = this.createActionButton(action, availability, location);
            this.elements.actions.appendChild(button);
        });

        // Show actions container
        this.elements.actions.classList.remove('hidden');
    }

    // Create action button with time and effects
    createActionButton(action, availability, location) {
        const button = document.createElement('button');
        button.className = action;
        button.setAttribute('data-action', action);

        // Set button text
        const actionNames = {
            'work': 'Find Work',
            'food': 'Find Food',
            'sleep': 'Sleep',
            'steal': 'Steal',
            'panhandle': 'Panhandle',
            'eat': 'Eat Meal',
            'buy-food': 'Buy Food'
        };
        const actionName = actionNames[action] || action;

        // Get preview data from action instance
        const actionInstance = location.getAction(action);
        const preview = actionInstance ? actionInstance.getPreview() : null;

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

            // Get icon counts from preset levels (low=1, medium=2, high=3)
            const moneyIcons = getIconCount(preview.effects.money);
            const healthIcons = getIconCount(preview.effects.health);
            const hungerIcons = getIconCount(preview.effects.hunger);
            const riskIcons = getIconCount(preview.effects.risk);

            // Display icons based on count
            if (moneyIcons > 0) {
                // Use different icon for cost actions (buy-food)
                const moneyIcon = (action === 'buy-food') ? '💸' : '💰';
                effects.push(moneyIcon.repeat(moneyIcons));
            }

            if (healthIcons > 0) {
                effects.push('❤️'.repeat(healthIcons));
            }

            if (hungerIcons > 0) {
                effects.push('🍞'.repeat(hungerIcons));
            }

            if (riskIcons > 0) {
                effects.push('💀'.repeat(riskIcons));
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
        // Store current disabled state before re-creating button
        const wasDisabled = this.travelButton ? this.travelButton.disabled : false;

        // Create travel button
        this.elements.travelButtonContainer.innerHTML = '';
        this.travelButton = document.createElement('button');
        // Toggle button text based on travelMode state
        this.travelButton.textContent = this.travelMode ? 'Cancel' : 'Travel';
        // Add cancel-mode class when in travel mode
        if (this.travelMode) {
            this.travelButton.classList.add('cancel-mode');
        }
        // Restore disabled state
        this.travelButton.disabled = wasDisabled;
        this.travelButton.onclick = () => this.toggleTravelMenu();
        this.elements.travelButtonContainer.appendChild(this.travelButton);
    }

    // Enable or disable travel button (used during actions/travel)
    setTravelButtonEnabled(enabled) {
        if (this.travelButton) {
            this.travelButton.disabled = !enabled;
        }
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
        this.updateReputation();  // NEW
        this.renderActionButtons(player);
    }

    // NEW: Update reputation display
    updateReputation() {
        if (!this.reputationManager) return;

        const factions = ['police', 'locals', 'shelter', 'business'];

        factions.forEach(factionId => {
            const tier = this.reputationManager.getTier(factionId);
            const iconEl = this.elements[`rep${this.capitalize(factionId)}Icon`];
            const tierEl = this.elements[`rep${this.capitalize(factionId)}Tier`];

            if (iconEl && tierEl) {
                // Update icon
                iconEl.textContent = tier.icon;

                // Update tier text
                tierEl.textContent = tier.name;

                // Update tier color class
                tierEl.className = 'faction-tier-text ' + tier.name.toLowerCase();

                // Trigger change animation
                const factionEl = document.getElementById(`rep-${factionId}`);
                if (factionEl) {
                    factionEl.classList.add('changed');
                    setTimeout(() => factionEl.classList.remove('changed'), 500);
                }
            }
        });
    }

    // Helper method to capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
            <div class="action-progress" data-action-message="${message}">
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

    /**
     * Show event modal and pause action
     * Returns a promise that resolves with the user's choice
     * @param {Object} modalContent - { title, description, choices }
     * @returns {Promise<string>} - Resolves with choice value
     */
    showInlineEvent(modalContent, eventType = 'neutral') {
        return new Promise((resolve) => {
            this.currentEventResolver = resolve;
            this.eventUIActive = true;

            const actionProgress = document.querySelector('.action-progress');
            if (!actionProgress) {
                console.error('Action progress container not found');
                resolve('continue');
                return;
            }

            // Add event state classes
            actionProgress.classList.add(`event-${eventType}`, 'showing-event');

            // Replace progress UI with event UI
            actionProgress.innerHTML = `
                <div class="event-title">${modalContent.title}</div>
                <div class="event-inline-content">
                    <div class="event-description">${modalContent.description}</div>
                </div>
                <div class="event-inline-choices" id="event-inline-choices">
                </div>
            `;

            // Create choice buttons
            const choicesContainer = document.getElementById('event-inline-choices');
            modalContent.choices.forEach((choice) => {
                const button = document.createElement('button');
                button.textContent = choice.label;
                button.className = 'event-choice';

                if (choice.variant) {
                    button.classList.add(choice.variant);
                }

                button.onclick = () => {
                    this.hideInlineEvent();
                    resolve(choice.value);
                };

                choicesContainer.appendChild(button);
            });
        });
    }

    /**
     * Hide inline event and restore action progress UI
     */
    hideInlineEvent() {
        this.eventUIActive = false;
        this.currentEventResolver = null;

        const actionProgress = document.querySelector('.action-progress');
        if (!actionProgress) return;

        // Remove event state classes
        actionProgress.classList.remove(
            'event-positive',
            'event-negative',
            'event-neutral',
            'event-info',
            'showing-event'
        );

        // Restore action progress UI
        const actionMessage = actionProgress.dataset.actionMessage || 'Performing action...';

        actionProgress.innerHTML = `
            <div class="action-message" id="action-message">${actionMessage}</div>
            <div class="action-progress-container">
                <div class="action-progress-bar" id="action-progress-bar"></div>
            </div>
            <div class="action-time-remaining" id="action-time-remaining">Resuming...</div>
        `;

        // Update element references
        this.elements.actionMessage = document.getElementById('action-message');
        this.elements.actionProgressBar = document.getElementById('action-progress-bar');
        this.elements.actionTimeRemaining = document.getElementById('action-time-remaining');
    }

    /**
     * Show level up modal with bonuses
     * @param {number} newLevel - The new level reached
     * @param {Object} bonuses - Bonus percentages {earnings, health, hunger, risk}
     */
    showLevelUpModal(newLevel, bonuses) {
        return new Promise((resolve) => {
            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.innerHTML = `
                <div class="modal level-up-modal">
                    <div class="modal-header">
                        <h2>🎉 LEVEL UP! 🎉</h2>
                    </div>
                    <div class="modal-body">
                        <div class="level-display">
                            <span class="new-level">Level ${newLevel}</span>
                        </div>
                        <div class="bonuses-section">
                            <h3>New Bonuses:</h3>
                            <ul class="bonuses-list">
                                <li>+${bonuses.earnings}% Earnings</li>
                                <li>+${bonuses.health}% Health Recovery</li>
                                <li>+${bonuses.hunger}% Hunger Efficiency</li>
                                <li>-${bonuses.risk}% Risk</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-button continue-button" id="level-up-continue">Continue</button>
                    </div>
                </div>
            `;

            // Add to body
            document.body.appendChild(modalOverlay);

            // Add continue button handler
            document.getElementById('level-up-continue').onclick = () => {
                document.body.removeChild(modalOverlay);
                resolve();
            };
        });
    }
}
