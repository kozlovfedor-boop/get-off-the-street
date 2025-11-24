// Panhandle action - beg for money over 3 hours
class PanhandleAction extends BaseAction {
    execute() {
        const location = this.locationManager.getCurrentLocation();
        let earnings;

        // Better panhandling in rich areas during day
        if (location.id === 'london-city') {
            earnings = this.random(15, 35);
        } else {
            earnings = this.random(5, 20);
        }

        const hungerCost = this.random(5, 10);

        return {
            type: 'panhandle',
            message: `You panhandled for money. Earned £${earnings}. Hunger -${hungerCost}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.PANHANDLE,
            statChanges: {
                money: earnings,
                health: 0,
                hunger: -hungerCost
            },
            perHourCalculation: 'panhandle'
        };
    }

    calculatePerHourStats(hourIndex) {
        const location = this.locationManager.getCurrentLocation();
        const moneyChange = location.id === 'london-city'
            ? this.random(6, 14)
            : this.random(2, 8);

        return {
            moneyChange: moneyChange,
            healthChange: 0,
            hungerChange: -this.random(2, 4)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Panhandling: Hour ${hourIndex + 1}/${totalHours} - Earned £${stats.moneyChange}, Hunger ${stats.hungerChange}`,
            logType: 'positive'
        };
    }

    static getPreview() {
        return {
            timeCost: CONFIG.TIME_COSTS.PANHANDLE,
            effects: {
                money: [5, 35],
                health: [0, 0],
                hunger: [-10, -5]
            },
            notes: "varies by location"
        };
    }
}
