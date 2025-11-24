// Work action - find work and earn money over 7 hours
class WorkAction extends BaseAction {
    constructor(player, locationManager, timeManager) {
        super(player, locationManager, timeManager);
        this.totalEarnings = 0;
    }

    execute() {
        const payModifier = this.locationManager.getPayModifier();
        const baseEarnings = this.random(20, 40);
        const earnings = Math.floor(baseEarnings * payModifier);
        const hungerCost = this.random(10, 25);

        const location = this.locationManager.getCurrentLocation();
        return {
            type: 'work',
            message: `You found work in ${location.name}. Earned £${earnings}. Hunger -${hungerCost}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.WORK,
            statChanges: {
                money: earnings,
                health: 0,
                hunger: -hungerCost
            },
            perHourCalculation: 'work'
        };
    }

    calculatePerHourStats(hourIndex) {
        const payModifier = this.locationManager.getPayModifier();
        const earnings = Math.floor(this.random(3, 8) * payModifier);
        this.totalEarnings += earnings;
        return {
            moneyChange: 0, // Don't show money yet
            healthChange: 0,
            hungerChange: -this.random(1, 4)
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

    static getPreview() {
        return {
            timeCost: CONFIG.TIME_COSTS.WORK,
            effects: {
                money: [20, 40],
                health: [0, 0],
                hunger: [-25, -10]
            },
            notes: "varies by location"
        };
    }
}
