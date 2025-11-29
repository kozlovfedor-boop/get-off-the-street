// Sleep action - recover health over time (location-dependent: 2-7 hours)
class SleepAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            health: config.health || 'medium',
            hunger: config.hunger || 'medium',
            timeCost: config.timeCost || 7,
            events: config.events || []  // Preserve events array
        };
    }

    execute(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        // Get preset ranges
        const healthRange = CONFIG.ACTION_PRESETS.health[this.config.health];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        const healthGain = this.random(...healthRange);
        const hungerCost = this.random(...hungerRange);

        // Robbery logic now handled by RobberyEvent
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
            perHourCalculation: 'sleep'
        };
    }

    calculatePerHourStats(hourIndex) {
        const healthRange = CONFIG.ACTION_PRESETS.health[this.config.health];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Per-hour recovery rates
        const perHourHealthMin = Math.floor(healthRange[0] / this.config.timeCost);
        const perHourHealthMax = Math.ceil(healthRange[1] / this.config.timeCost);
        const perHourHungerMin = Math.floor(hungerRange[0] / this.config.timeCost);
        const perHourHungerMax = Math.ceil(hungerRange[1] / this.config.timeCost);

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
