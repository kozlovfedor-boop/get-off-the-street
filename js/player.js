// Player state management
class Player {
    constructor(stats = CONFIG.INITIAL_STATS) {
        this.money = stats.money;
        this.health = stats.health;
        this.hunger = stats.hunger;
        this.day = stats.day;
        this.level = stats.level;
        this.experience = stats.experience;
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

    // Add experience points
    addExperience(amount) {
        this.experience += amount;
        const levelsGained = this.checkLevelUp();
        return levelsGained; // Return number of levels gained (for UI notification)
    }

    // Check and handle level-ups
    checkLevelUp() {
        let levelsGained = 0;

        while (this.level < CONFIG.LEVEL_SYSTEM.MAX_LEVEL) {
            const xpNeeded = this.getXPForNextLevel();

            if (this.experience >= xpNeeded) {
                this.level++;
                this.experience -= xpNeeded; // Carry over excess XP
                levelsGained++;
            } else {
                break;
            }
        }

        return levelsGained;
    }

    // Calculate XP needed for next level
    getXPForNextLevel() {
        const base = CONFIG.LEVEL_SYSTEM.BASE_XP_FOR_LEVEL;
        const multiplier = CONFIG.LEVEL_SYSTEM.XP_MULTIPLIER;
        return Math.floor(base * Math.pow(multiplier, this.level - 1));
    }

    // Get current level bonus for a stat type
    getLevelBonus(type) {
        if (!CONFIG.LEVEL_SYSTEM.BONUS_PER_LEVEL[type]) {
            return 1.0; // No bonus
        }

        const bonusRate = CONFIG.LEVEL_SYSTEM.BONUS_PER_LEVEL[type];
        return 1 + ((this.level - 1) * bonusRate);
    }

    // Get risk reduction percentage
    getRiskReduction() {
        const bonusRate = CONFIG.LEVEL_SYSTEM.BONUS_PER_LEVEL.risk;
        return (this.level - 1) * bonusRate;
    }

    // Clamp all stats to valid ranges
    clampStats() {
        this.money = Math.max(CONFIG.MIN_STAT, this.money);
        this.health = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HEALTH, this.health));
        this.hunger = Math.max(CONFIG.MIN_STAT, Math.min(CONFIG.MAX_HUNGER, this.hunger));
        this.experience = Math.max(0, this.experience);
        this.level = Math.max(1, Math.min(CONFIG.LEVEL_SYSTEM.MAX_LEVEL, this.level));
    }

    // Reset to initial state
    reset() {
        const initial = CONFIG.INITIAL_STATS;
        this.money = initial.money;
        this.health = initial.health;
        this.hunger = initial.hunger;
        this.day = initial.day;
        this.level = initial.level;
        this.experience = initial.experience;
    }

    // Get current state as object
    getState() {
        return {
            money: this.money,
            health: this.health,
            hunger: this.hunger,
            day: this.day,
            level: this.level,
            experience: this.experience
        };
    }
}
