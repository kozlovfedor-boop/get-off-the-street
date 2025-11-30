// Panhandle action - beg for money over 3 hours
class PanhandleAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            earnings: config.earnings || 'low',
            hunger: config.hunger || 'low',
            events: config.events || []  // Preserve events array
        };
        this.xpReward = config.xpReward || CONFIG.XP_REWARDS.panhandle;
    }

    execute(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        // Get base preset ranges
        const baseEarningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const baseHungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Apply level bonuses
        const bonusEarningsRange = this.applyLevelBonus(baseEarningsRange, 'earnings');
        const bonusHungerRange = this.applyLevelBonus(baseHungerRange, 'hunger');

        const earnings = this.random(...bonusEarningsRange);
        const hungerCost = this.random(...bonusHungerRange);

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
            perHourCalculation: 'panhandle',
            xpReward: this.xpReward
        };
    }

    calculatePerHourStats(hourIndex) {
        const baseEarningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const baseHungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Apply level bonuses
        const bonusEarningsRange = this.applyLevelBonus(baseEarningsRange, 'earnings');
        const bonusHungerRange = this.applyLevelBonus(baseHungerRange, 'hunger');

        // Per-hour earnings and hunger cost
        const perHourMin = Math.floor(bonusEarningsRange[0] / CONFIG.TIME_COSTS.PANHANDLE);
        const perHourMax = Math.ceil(bonusEarningsRange[1] / CONFIG.TIME_COSTS.PANHANDLE);
        const perHourHungerMin = Math.floor(bonusHungerRange[0] / CONFIG.TIME_COSTS.PANHANDLE);
        const perHourHungerMax = Math.ceil(bonusHungerRange[1] / CONFIG.TIME_COSTS.PANHANDLE);

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
        return {
            timeCost: CONFIG.TIME_COSTS.PANHANDLE,
            effects: {
                money: this.config.earnings,
                health: 'none',
                hunger: 'none',
                risk: this.calculateRiskLevel()  // Dynamic calculation from events
            },
            notes: null
        };
    }
}
