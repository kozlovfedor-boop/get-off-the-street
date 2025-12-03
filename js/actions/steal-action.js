// Steal action - risky theft attempt (1 hour)
class StealAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            reward: config.reward || 'high',
            hunger: config.hunger || 'low',
            events: config.events || [],  // Preserve events array
            reputationEffects: config.reputationEffects || {}  // NEW
        };
        this.xpReward = config.xpReward || CONFIG.XP_REWARDS.steal;
    }

    execute(player, locationManager, timeManager, reputationManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.reputationManager = reputationManager;  // NEW

        // Get base preset values
        const baseRewardRange = CONFIG.ACTION_PRESETS.reward[this.config.reward];
        const baseHungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Apply level bonuses
        const bonusRewardRange = this.applyLevelBonus(baseRewardRange, 'earnings');
        const bonusHungerRange = this.applyLevelBonus(baseHungerRange, 'hunger');

        // Always succeed when action executes
        // Failure logic now handled by BeatenUpEvent and PoliceEvent
        const stolen = this.random(...bonusRewardRange);
        const message = `You successfully stole £${stolen}!`;
        const moneyChange = stolen;
        const healthChange = 0;
        const xpReward = this.xpReward;

        const hungerCost = this.random(...bonusHungerRange);

        return {
            type: 'steal',
            message: message,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.STEAL,
            statChanges: {
                money: moneyChange,
                health: healthChange,
                hunger: hungerCost
            },
            perHourCalculation: 'steal',
            xpReward: xpReward
        };
    }

    calculatePerHourStats(hourIndex) {
        // For steal, the result is already determined in execute()
        // We use the saved result instead of recalculating
        if (!this.savedResult) {
            this.savedResult = this.execute(this.player, this.locationManager, this.timeManager);
        }
        return {
            moneyChange: this.savedResult.statChanges.money,
            healthChange: this.savedResult.statChanges.health,
            hungerChange: this.savedResult.statChanges.hunger
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        // Use the message from execute() since it's dynamic
        if (!this.savedResult) {
            this.savedResult = this.execute(this.player, this.locationManager, this.timeManager);
        }
        return {
            message: this.savedResult.message,
            logType: this.savedResult.logType
        };
    }

    getPreview() {
        return {
            timeCost: CONFIG.TIME_COSTS.STEAL,
            effects: {
                money: this.config.reward,
                health: 'none',
                hunger: 'none',
                risk: this.calculateRiskLevel()  // Dynamic calculation from events
            },
            notes: null
        };
    }
}
