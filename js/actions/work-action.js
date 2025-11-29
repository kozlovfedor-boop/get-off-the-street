// Work action - find work and earn money over 7 hours
class WorkAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            earnings: config.earnings || 'medium',
            hunger: config.hunger || 'medium',
            events: config.events || []  // Preserve events array
        };
        this.totalEarnings = 0;
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

        const location = this.locationManager.getCurrentLocation();
        return {
            type: 'work',
            message: `You found work in ${location.name}. Earned £${earnings}. Hunger ${hungerCost}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.WORK,
            statChanges: {
                money: earnings,
                health: 0,
                hunger: hungerCost
            },
            perHourCalculation: 'work'
        };
    }

    calculatePerHourStats(hourIndex) {
        const earningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Per-hour earnings (roughly total / 7)
        const perHourMin = Math.floor(earningsRange[0] / 7);
        const perHourMax = Math.ceil(earningsRange[1] / 7);
        const earnings = this.random(perHourMin, perHourMax);
        this.totalEarnings += earnings;

        // Per-hour hunger cost
        const perHourHungerMin = Math.floor(hungerRange[0] / 7);
        const perHourHungerMax = Math.ceil(hungerRange[1] / 7);

        return {
            moneyChange: 0, // Don't show money yet
            healthChange: 0,
            hungerChange: this.random(perHourHungerMin, perHourHungerMax)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Working: Hour ${hourIndex + 1}/${totalHours} - Hunger ${stats.hungerChange}`,
            logType: 'neutral'
        };
    }

    shouldDeferPayment() {
        return true;
    }

    shouldShowMoneyInTarget() {
        return false;
    }

    getFinalPayment() {
        return this.totalEarnings;
    }

    getFinalLogMessage() {
        return {
            message: `Work complete - Earned £${this.totalEarnings}`,
            logType: 'positive'
        };
    }

    getPreview() {
        return {
            timeCost: CONFIG.TIME_COSTS.WORK,
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
