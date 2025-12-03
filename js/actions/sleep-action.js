// Sleep action - recover health over time (location-dependent: 2-7 hours)
class SleepAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            health: config.health || 'medium',
            hunger: config.hunger || 'medium',
            timeCost: config.timeCost || 7,
            events: config.events || [],  // Preserve events array
            reputationEffects: config.reputationEffects || {}  // NEW
        };
        this.xpReward = config.xpReward || CONFIG.XP_REWARDS.sleep;
    }

    execute(player, locationManager, timeManager, reputationManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.reputationManager = reputationManager;  // NEW

        // Get base preset ranges
        const baseHealthRange = CONFIG.ACTION_PRESETS.health[this.config.health];
        const baseHungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Apply level bonuses
        const bonusHealthRange = this.applyLevelBonus(baseHealthRange, 'health');
        const bonusHungerRange = this.applyLevelBonus(baseHungerRange, 'hunger');

        const healthGain = this.random(...bonusHealthRange);
        const hungerCost = this.random(...bonusHungerRange);

        const displayMessage = `You slept for ${this.config.timeCost} hours. Health +${healthGain}, Hunger ${hungerCost}.`;

        return {
            type: 'sleep',
            message: displayMessage,
            logType: 'positive',
            timeCost: this.config.timeCost,
            statChanges: {
                money: 0,
                health: healthGain,
                hunger: hungerCost
            },
            perHourCalculation: 'sleep',
            xpReward: this.xpReward
        };
    }

    calculatePerHourStats(hourIndex) {
        const baseHealthRange = CONFIG.ACTION_PRESETS.health[this.config.health];
        const baseHungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Apply level bonuses
        const bonusHealthRange = this.applyLevelBonus(baseHealthRange, 'health');
        const bonusHungerRange = this.applyLevelBonus(baseHungerRange, 'hunger');

        // Per-hour recovery rates
        const perHourHealthMin = Math.floor(bonusHealthRange[0] / this.config.timeCost);
        const perHourHealthMax = Math.ceil(bonusHealthRange[1] / this.config.timeCost);
        const perHourHungerMin = Math.floor(bonusHungerRange[0] / this.config.timeCost);
        const perHourHungerMax = Math.ceil(bonusHungerRange[1] / this.config.timeCost);

        return {
            moneyChange: 0,
            healthChange: this.random(perHourHealthMin, perHourHealthMax),
            hungerChange: this.random(perHourHungerMin, perHourHungerMax)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Resting: Hour ${hourIndex + 1}/${totalHours} - Health +${stats.healthChange}, Hunger ${stats.hungerChange}`,
            logType: 'neutral'
        };
    }

    getPreview() {
        return {
            timeCost: this.config.timeCost,
            effects: {
                money: 'none',
                health: this.config.health,
                hunger: 'none',
                risk: this.calculateRiskLevel()  // Dynamic calculation from events
            },
            notes: null
        };
    }
}
