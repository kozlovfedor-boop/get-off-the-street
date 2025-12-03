// Find food action - search for food in dumpsters over 2 hours
class FindFoodAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            food: config.food || 'medium',
            events: config.events || [],  // Preserve events array
            reputationEffects: config.reputationEffects || {}  // NEW
        };
        this.xpReward = config.xpReward || CONFIG.XP_REWARDS.food;
    }

    execute(player, locationManager, timeManager, reputationManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.reputationManager = reputationManager;  // NEW

        // Get preset range
        const foodRange = CONFIG.ACTION_PRESETS.food[this.config.food];
        const foodAmount = this.random(...foodRange);

        return {
            type: 'food',
            message: `You searched for food in dumpsters. Hunger +${foodAmount}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.FOOD,
            statChanges: {
                money: 0,
                health: 0,
                hunger: foodAmount
            },
            perHourCalculation: 'findFood',
            xpReward: this.xpReward
        };
    }

    calculatePerHourStats(hourIndex) {
        const foodRange = CONFIG.ACTION_PRESETS.food[this.config.food];

        // Per-hour food gain
        const perHourMin = Math.floor(foodRange[0] / CONFIG.TIME_COSTS.FOOD);
        const perHourMax = Math.ceil(foodRange[1] / CONFIG.TIME_COSTS.FOOD);

        return {
            moneyChange: 0,
            healthChange: 0,
            hungerChange: this.random(perHourMin, perHourMax)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Searching for food: Hour ${hourIndex + 1}/${totalHours} - Found +${stats.hungerChange} hunger`,
            logType: 'positive'
        };
    }

    getPreview() {
        return {
            timeCost: CONFIG.TIME_COSTS.FOOD,
            effects: {
                money: 'none',
                health: 'none',
                hunger: this.config.food,
                risk: this.calculateRiskLevel()  // Dynamic calculation from events
            },
            notes: null
        };
    }
}
