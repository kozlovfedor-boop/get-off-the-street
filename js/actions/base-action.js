// Base class for all actions
class BaseAction {
    constructor(config = {}) {
        this.config = config;
        // Runtime dependencies injected via execute()
        this.player = null;
        this.locationManager = null;
        this.timeManager = null;
        // XP configuration
        this.xpReward = config.xpReward || 0;
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

    // XP system methods
    getXPReward() {
        return this.xpReward;
    }

    // Apply level bonuses to a stat range
    applyLevelBonus(range, bonusType) {
        if (!this.player) return range;

        const bonus = this.player.getLevelBonus(bonusType);
        return [
            Math.floor(range[0] * bonus),
            Math.ceil(range[1] * bonus)
        ];
    }

    // Apply level-based risk reduction
    applyRiskReduction(baseRisk) {
        if (!this.player) return baseRisk;

        const reduction = this.player.getRiskReduction();
        return Math.max(0.01, baseRisk - reduction); // Min 1% risk
    }

    // Calculate risk level dynamically from negative events
    calculateRiskLevel() {
        if (!this.config.events || this.config.events.length === 0) {
            return 'none';
        }

        // Get all negative events (events that cause damage/loss)
        const negativeEvents = this.config.events.filter(event => {
            // Check if event is negative based on class name
            const className = event.constructor.name;
            return className.includes('Police') ||
                   className.includes('Robbery') ||
                   className.includes('Accident') ||
                   className.includes('Sickness') ||
                   className.includes('Weather');
        });

        if (negativeEvents.length === 0) {
            return 'none';
        }

        // Calculate combined chance (1 - probability of no event)
        let noEventProbability = 1.0;
        for (const event of negativeEvents) {
            const chance = event.getChance();
            noEventProbability *= (1 - chance);
        }
        const combinedChance = 1 - noEventProbability;

        // Map combined chance to risk level
        if (combinedChance >= 0.25) return 'high';    // 25%+ risk
        if (combinedChance >= 0.10) return 'medium';  // 10-25% risk
        if (combinedChance > 0) return 'low';         // <10% risk
        return 'none';
    }

    // Instance method to get preview info for UI
    // Override in subclasses to provide specific ranges based on config
    getPreview() {
        return {
            timeCost: 0,
            effects: {
                money: 'none',
                health: 'none',
                hunger: 'none',
                risk: 'none'
            },
            notes: null
        };
    }
}
