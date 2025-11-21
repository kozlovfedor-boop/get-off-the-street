// Base class for all actions
class BaseAction {
    constructor(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;
    }

    // Each action implements these
    execute() {
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
}
