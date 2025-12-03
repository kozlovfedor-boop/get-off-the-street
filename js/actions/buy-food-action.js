// Buy food action - purchase meal to restore hunger (1 hour)
class BuyFoodAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            cost: config.cost || 'medium',           // Money cost preset
            food: config.food || 'medium',           // Hunger gain preset
            timeCost: config.timeCost || CONFIG.TIME_COSTS.BUY_FOOD,
            events: config.events || [],
            reputationEffects: config.reputationEffects || {}  // NEW
        };
        this.xpReward = config.xpReward || CONFIG.XP_REWARDS.buy_food;
    }

    execute(player, locationManager, timeManager, reputationManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.reputationManager = reputationManager;  // NEW

        // Get preset ranges
        const costRange = CONFIG.ACTION_PRESETS.moneyCost[this.config.cost];
        const foodRange = CONFIG.ACTION_PRESETS.food[this.config.food];

        const actualCost = this.random(...costRange);
        const hungerGain = this.random(...foodRange);

        // Check affordability
        if (this.player.money < actualCost) {
            return {
                type: 'buy-food',
                message: `You don't have enough money. Need £${actualCost}.`,
                logType: 'negative',
                timeCost: 0,  // No time wasted if can't afford
                statChanges: {
                    money: 0,
                    health: 0,
                    hunger: 0
                },
                perHourCalculation: 'instant',
                xpReward: 0
            };
        }

        const location = this.locationManager.getCurrentLocation();
        return {
            type: 'buy-food',
            message: `You bought food in ${location.name}. Cost £${actualCost}. Hunger +${hungerGain}.`,
            logType: 'positive',
            timeCost: this.config.timeCost,
            statChanges: {
                money: -actualCost,  // NEGATIVE for cost
                health: 0,
                hunger: hungerGain
            },
            perHourCalculation: 'buyFood',
            xpReward: this.xpReward
        };
    }

    calculatePerHourStats(hourIndex) {
        // For 1 hour action, just return the full stats
        const costRange = CONFIG.ACTION_PRESETS.moneyCost[this.config.cost];
        const foodRange = CONFIG.ACTION_PRESETS.food[this.config.food];

        return {
            moneyChange: -this.random(...costRange),  // Negative for cost
            healthChange: 0,
            hungerChange: this.random(...foodRange)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Buying food: Hour ${hourIndex + 1}/${totalHours} - Cost £${Math.abs(stats.moneyChange)}, Hunger +${stats.hungerChange}`,
            logType: 'positive'
        };
    }

    getPreview() {
        return {
            timeCost: this.config.timeCost,
            effects: {
                money: this.config.cost,           // Shows cost level (not gain)
                health: 'none',
                hunger: this.config.food,          // Shows hunger gain
                risk: this.calculateRiskLevel()    // Should be 'none'
            },
            notes: null
        };
    }

    /**
     * Check if player can afford this action
     * @param {Player} player - Player to check
     * @returns {Object} - {canAfford: boolean, minCost: number}
     */
    canAfford(player) {
        const costRange = CONFIG.ACTION_PRESETS.moneyCost[this.config.cost];
        const minCost = costRange[0];
        return {
            canAfford: player.money >= minCost,
            minCost: minCost
        };
    }
}
