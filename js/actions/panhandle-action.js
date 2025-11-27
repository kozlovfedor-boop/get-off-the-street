// Panhandle action - beg for money over 3 hours
class PanhandleAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            earnings: config.earnings || 'low',
            hunger: config.hunger || 'low'
        };
    }

    execute(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        // Get preset ranges
        const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        const earnings = this.random(...earningsRange);
        const hungerCost = this.random(...hungerRange);

        return {
            type: 'panhandle',
            message: `You panhandled for money. Earned £${earnings}. Hunger ${hungerCost}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.PANHANDLE,
            statChanges: {
                money: earnings,
                health: 0,
                hunger: hungerCost
            },
            perHourCalculation: 'panhandle'
        };
    }

    calculatePerHourStats(hourIndex) {
        const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Per-hour earnings and hunger cost
        const perHourMin = Math.floor(earningsRange[0] / CONFIG.TIME_COSTS.PANHANDLE);
        const perHourMax = Math.ceil(earningsRange[1] / CONFIG.TIME_COSTS.PANHANDLE);
        const perHourHungerMin = Math.floor(hungerRange[0] / CONFIG.TIME_COSTS.PANHANDLE);
        const perHourHungerMax = Math.ceil(hungerRange[1] / CONFIG.TIME_COSTS.PANHANDLE);

        return {
            moneyChange: this.random(perHourMin, perHourMax),
            healthChange: 0,
            hungerChange: this.random(perHourHungerMin, perHourHungerMax)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Panhandling: Hour ${hourIndex + 1}/${totalHours} - Earned £${stats.moneyChange}, Hunger ${stats.hungerChange}`,
            logType: 'positive'
        };
    }

    getPreview() {
        const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        return {
            timeCost: CONFIG.TIME_COSTS.PANHANDLE,
            effects: {
                money: earningsRange,
                health: [0, 0],
                hunger: hungerRange
            },
            notes: null
        };
    }
}
