// Sleep action - recover health over time (location-dependent: 2-7 hours)
class SleepAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            health: config.health || 'medium',
            hunger: config.hunger || 'medium',
            timeCost: config.timeCost || 7,
            safe: config.safe !== undefined ? config.safe : false,
            risk: config.risk || 0,
            robberyAmount: config.robberyAmount || 'medium'
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

        // Handle robbery risk (park, camden-town)
        if (!this.config.safe && this.config.risk > 0 && Math.random() < this.config.risk) {
            const robberyRange = typeof this.config.robberyAmount === 'string'
                ? CONFIG.ACTION_PRESETS.reward[this.config.robberyAmount]
                : this.config.robberyAmount;
            const stolen = this.random(...robberyRange);
            const actualStolen = Math.min(stolen, this.player.money);

            return {
                type: 'sleep',
                message: `You were robbed while sleeping! Lost £${actualStolen}. Health +${healthGain}, Hunger ${hungerCost}.`,
                logType: 'negative',
                timeCost: this.config.timeCost,
                statChanges: {
                    money: -actualStolen,
                    health: healthGain,
                    hunger: hungerCost
                },
                perHourCalculation: 'sleep'
            };
        }

        // Safe sleep
        const displayMessage = this.config.safe
            ? `You slept safely. Health +${healthGain}, Hunger ${hungerCost}.`
            : `You slept for ${this.config.timeCost} hours. Health +${healthGain}, Hunger ${hungerCost}.`;

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
        const healthRange = CONFIG.ACTION_PRESETS.health[this.config.health];
        const hungerRange = CONFIG.ACTION_PRESETS.hunger[this.config.hunger];

        let moneyRange = [0, 0];
        if (!this.config.safe && this.config.risk > 0) {
            const robberyRange = typeof this.config.robberyAmount === 'string'
                ? CONFIG.ACTION_PRESETS.reward[this.config.robberyAmount]
                : this.config.robberyAmount;
            moneyRange = [-robberyRange[1], 0]; // Show max potential loss
        }

        const riskPercent = Math.round(this.config.risk * 100);
        const notes = this.config.safe
            ? 'Safe, best recovery'
            : (this.config.risk > 0 ? `${riskPercent}% robbery risk` : null);

        return {
            timeCost: this.config.timeCost,
            effects: {
                money: moneyRange,
                health: healthRange,
                hunger: hungerRange
            },
            notes: notes
        };
    }
}
