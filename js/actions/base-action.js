// Base class for all actions
class BaseAction {
    constructor(config = {}) {
        this.config = config;
        // Runtime dependencies injected via execute()
        this.player = null;
        this.locationManager = null;
        this.timeManager = null;
    }

    // Each action implements these
    // Subclasses must accept runtime dependencies as parameters
    execute(player, locationManager, timeManager) {
        throw new Error('Must override execute()');
    }

    calculatePerHourStats(hourIndex) {
        throw new Error('Must override calculatePerHourStats()');
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        throw new Error('Must override generateLogMessage()');
    }

    // Common methods
    isInstant() {
        return false; // Override in EatAction
    }

    shouldDeferPayment() {
        return false;
    }

    shouldShowMoneyInTarget() {
        return !this.shouldDeferPayment();
    }

    applyStats(moneyChange, healthChange, hungerChange) {
        this.player.money += moneyChange;
        this.player.health += healthChange;
        this.player.hunger += hungerChange;
        this.clampStats();
    }

    clampStats() {
        this.player.health = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HEALTH, this.player.health));
        this.player.hunger = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HUNGER, this.player.hunger));
        this.player.money = Math.max(0, this.player.money);
    }

    // Utility
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Instance method to get preview info for UI
    // Override in subclasses to provide specific ranges based on config
    getPreview() {
        return {
            timeCost: 0,
            effects: {
                money: [0, 0],
                health: [0, 0],
                hunger: [0, 0]
            },
            notes: null // Optional: "varies by location", "if successful", etc.
        };
    }
}
