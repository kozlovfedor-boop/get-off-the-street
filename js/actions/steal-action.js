// Steal action - risky theft attempt (1 hour)
class StealAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            reward: config.reward || 'high',
            hunger: config.hunger || 'low',
            events: config.events || []  // Preserve events array
        };
    }

    execute(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        // Get preset values
        const rewardRange = CONFIG.ACTION_PRESETS.reward[this.config.reward];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        // Base steal attempt (70% success rate)
        // Police catch logic now handled by PoliceEvent
        const success = Math.random() > 0.3; // 70% success rate
        let message, moneyChange = 0, healthChange = 0;

        if (success) {
            const stolen = this.random(...rewardRange);
            moneyChange = stolen;
            message = `You successfully stole £${stolen}!`;
        } else {
            healthChange = -15;
            message = "You got caught by someone and got beaten up. Health -15.";
        }

        const hungerCost = this.random(...hungerRange);

        return {
            type: 'steal',
            message: message,
            logType: healthChange < 0 ? 'negative' : 'positive',
            timeCost: CONFIG.TIME_COSTS.STEAL,
            statChanges: {
                money: moneyChange,
                health: healthChange,
                hunger: hungerCost
            },
            perHourCalculation: 'steal'
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
