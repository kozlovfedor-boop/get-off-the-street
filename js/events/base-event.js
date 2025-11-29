// Base class for all random events
class BaseEvent {
    constructor(config = {}) {
        this.config = config;
        // Runtime dependencies (injected during execution)
        this.player = null;
        this.locationManager = null;
        this.timeManager = null;
        this.actionContext = null;
    }

    // Abstract methods - must override in subclasses

    /**
     * Check if event can trigger in current context
     * @param {Object} context - { player, locationManager, timeManager, action, hourIndex }
     * @returns {boolean} - true if event can occur
     */
    canTrigger(context) {
        throw new Error('Must override canTrigger() in subclass');
    }

    /**
     * Execute event and return result
     * @param {Object} context - { player, locationManager, timeManager, action, hourIndex }
     * @returns {Object} - { type, message, logType, statChanges }
     */
    execute(context) {
        throw new Error('Must override execute() in subclass');
    }

    /**
     * Get event description for modal UI
     * @returns {Object} - { title, description, choices }
     */
    getModalContent() {
        throw new Error('Must override getModalContent() in subclass');
    }

    /**
     * Process user choice from modal
     * @param {string} choice - The choice value selected
     * @param {Object} context - { player, locationManager, timeManager, action }
     * @returns {Object} - { message, logType, stopAction }
     */
    processChoice(choice, context) {
        throw new Error('Must override processChoice() in subclass');
    }

    // Common utility methods

    /**
     * Get chance this event triggers (per hour)
     * @returns {number} - 0.0 to 1.0
     */
    getChance() {
        if (typeof this.config.chance === 'string') {
            return CONFIG.EVENT_PRESETS.eventChance[this.config.chance];
        }
        return this.config.chance || 0;
    }

    /**
     * Random number helper (inclusive)
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Check if current location matches requirement
     */
    isAtLocation(locationId) {
        return this.locationManager.getCurrentLocation().id === locationId;
    }

    /**
     * Check if at any of the given locations
     */
    isAtAnyLocation(locationIds) {
        const currentId = this.locationManager.getCurrentLocation().id;
        return locationIds.includes(currentId);
    }

    /**
     * Check if current time is nighttime
     */
    isNighttime() {
        return this.timeManager.isNighttime();
    }

    /**
     * Check if current time is daytime
     */
    isDaytime() {
        return this.timeManager.isDaytime();
    }

    /**
     * Get preset range for effect
     */
    getPresetRange(category, level) {
        return CONFIG.EVENT_PRESETS[category][level];
    }

    /**
     * Apply stat changes to player
     */
    applyStats(moneyChange, healthChange, hungerChange) {
        this.player.money += moneyChange;
        this.player.health += healthChange;
        this.player.hunger += hungerChange;
        this.clampStats();
    }

    /**
     * Clamp stats to valid ranges
     */
    clampStats() {
        this.player.health = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HEALTH, this.player.health));
        this.player.hunger = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HUNGER, this.player.hunger));
        this.player.money = Math.max(0, this.player.money);
    }

    /**
     * Check if event requires modal interaction
     * Always returns true - all events use modal
     */
    requiresModal() {
        return true;
    }

    /**
     * Check if current action matches expected type
     */
    isActionType(actionClassName) {
        return this.actionContext && this.actionContext.constructor.name === actionClassName;
    }

    /**
     * Format money change for display
     */
    formatMoney(amount) {
        if (amount >= 0) {
            return `+£${amount}`;
        }
        return `-£${Math.abs(amount)}`;
    }

    /**
     * Format health/hunger change for display
     */
    formatStat(amount, statName) {
        const sign = amount >= 0 ? '+' : '';
        return `${sign}${amount} ${statName}`;
    }
}
