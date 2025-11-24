// Find food action - search for food in dumpsters over 2 hours
class FindFoodAction extends BaseAction {
    execute() {
        const foodAmount = this.random(20, 45);

        return {
            type: 'food',
            message: `You searched for food in dumpsters. Hunger +${foodAmount}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.FOOD,
            statChanges: {
                money: 0,
                health: 0,
                hunger: foodAmount
            },
            perHourCalculation: 'findFood'
        };
    }

    calculatePerHourStats(hourIndex) {
        return {
            moneyChange: 0,
            healthChange: 0,
            hungerChange: this.random(10, 30)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Searching for food: Hour ${hourIndex + 1}/${totalHours} - Found +${stats.hungerChange} hunger`,
            logType: 'positive'
        };
    }

    static getPreview() {
        return {
            timeCost: CONFIG.TIME_COSTS.FOOD,
            effects: {
                money: [0, 0],
                health: [0, 0],
                hunger: [20, 45]
            },
            notes: null
        };
    }
}
