// Work action - find work and earn money over 7 hours
class WorkAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            earnings: config.earnings || 'medium',
            hunger: config.hunger || 'medium',
            events: config.events || []  // Preserve events array
        };
        this.xpReward = config.xpReward || CONFIG.XP_REWARDS.work;
        this.totalEarnings = 0;
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
            perHourCalculation: 'work',
            xpReward: this.xpReward
        };
    }

    calculatePerHourStats(hourIndex) {
        const baseEarningsRange = CONFIG.ACTION_PRESETS.earnings[this.config.earnings];
        const baseHungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Apply level bonuses
        const bonusEarningsRange = this.applyLevelBonus(baseEarningsRange, 'earnings');
        const bonusHungerRange = this.applyLevelBonus(baseHungerRange, 'hunger');

        // Per-hour earnings (roughly total / 7)
        const perHourMin = Math.floor(bonusEarningsRange[0] / 7);
        const perHourMax = Math.ceil(bonusEarningsRange[1] / 7);
        const earnings = this.random(perHourMin, perHourMax);
        this.totalEarnings += earnings;

        // Per-hour hunger cost
        const perHourHungerMin = Math.floor(bonusHungerRange[0] / 7);
        const perHourHungerMax = Math.ceil(bonusHungerRange[1] / 7);

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
