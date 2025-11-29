// Player state management
class Player {
    constructor(stats = CONFIG.INITIAL_STATS) {
        this.money = stats.money;
        this.health = stats.health;
        this.hunger = stats.hunger;
        this.day = stats.day;
    }

    // Add money
    addMoney(amount) {
        this.money += amount;
        this.clampStats();
    }

    // Remove money
    removeMoney(amount) {
        this.money = Math.max(CONFIG.MIN_STAT, this.money - amount);
    }

    // Modify health
    modifyHealth(amount) {
        this.health += amount;
        this.clampStats();
    }

    // Modify hunger
    modifyHunger(amount) {
        this.hunger += amount;
        this.clampStats();
    }

    // Apply starvation penalty if starving
    applyStarvationPenalty() {
        if (this.hunger < CONFIG.STARVATION_THRESHOLD) {
            const healthLoss = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
            this.modifyHealth(-healthLoss);
            return {
                message: `You're starving! Health -${healthLoss}.`,
                logType: 'negative'
            };
        }
        return null;
    }

    // Advance day
    nextDay() {
        this.day++;
    }

    // Check if starving
    isStarving() {
        return this.hunger < CONFIG.STARVATION_THRESHOLD;
    }

    // Check if alive
    isAlive() {
        return this.health > CONFIG.DEFEAT_HEALTH;
    }

    // Check if won
    hasWon() {
        return this.money >= CONFIG.VICTORY_MONEY &&
               this.health > CONFIG.VICTORY_MIN_HEALTH;
    }

    // Clamp all stats to valid ranges
    clampStats() {
        this.money = Math.max(CONFIG.MIN_STAT, this.money);
        this.health = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HEALTH, this.health));
        this.hunger = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HUNGER, this.hunger));
    }

    // Reset to initial state
    reset() {
        const initial = CONFIG.INITIAL_STATS;
        this.money = initial.money;
        this.health = initial.health;
        this.hunger = initial.hunger;
        this.day = initial.day;
    }

    // Get current state as object
    getState() {
        return {
            money: this.money,
            health: this.health,
            hunger: this.hunger,
            day: this.day
        };
    }
}
