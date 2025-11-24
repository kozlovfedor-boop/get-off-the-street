// Sleep/Rest action - recover health over time (7 hours for sleep, 2 hours for rest)
class SleepAction extends BaseAction {
    execute() {
        const location = this.locationManager.getCurrentLocation();
        let healthGain, hungerCost, message, risk, moneyLost = 0;

        if (location.id === 'shelter') {
            // Sleeping at shelter - safe and effective
            healthGain = this.random(30, 50);
            hungerCost = this.random(10, 20);
            message = `You slept safely at the shelter. Health +${healthGain}, Hunger -${hungerCost}.`;
            risk = null;
            this.sleepType = 'shelter';
        } else if (location.id === 'park') {
            // Sleeping at park - risky
            healthGain = this.random(20, 35);
            hungerCost = this.random(10, 20);
            risk = this.locationManager.getRiskModifier('sleep');
            this.sleepType = 'park';

            // Check for robbery
            if (Math.random() < risk) {
                const stolenAmount = Math.min(this.random(10, 30), this.player.money);
                moneyLost = stolenAmount;
                message = `You slept in the park but got robbed! Lost £${stolenAmount}. Health +${healthGain}, Hunger -${hungerCost}.`;
            } else {
                message = `You slept in the park. Health +${healthGain}, Hunger -${hungerCost}.`;
            }
        } else {
            // Brief rest on streets
            healthGain = this.random(10, 20);
            hungerCost = this.random(5, 13);
            message = `You took a brief rest. Health +${healthGain}, Hunger -${hungerCost}.`;
            this.sleepType = 'rest';
        }

        const timeCost = (location.id === 'shelter' || location.id === 'park') ?
            CONFIG.TIME_COSTS.SLEEP : CONFIG.TIME_COSTS.REST;

        return {
            type: 'sleep',
            message: message,
            logType: risk && moneyLost > 0 ? 'negative' : 'positive',
            timeCost: timeCost,
            statChanges: {
                money: -moneyLost,
                health: healthGain,
                hunger: -hungerCost
            },
            perHourCalculation: 'sleep',
            sleepType: this.sleepType
        };
    }

    calculatePerHourStats(hourIndex) {
        // sleepType is stored as instance variable after execute()
        return {
            moneyChange: 0,
            healthChange: this.getHealthRecoveryPerHour(this.sleepType),
            hungerChange: -this.random(1, 3)
        };
    }

    getHealthRecoveryPerHour(sleepType) {
        if (sleepType === 'shelter') {
            return this.random(4, 7);  // 4-7 per hour * 7 hours = 28-49 total
        } else if (sleepType === 'park') {
            return this.random(2, 5);  // 2-5 per hour * 7 hours = 14-35 total
        } else if (sleepType === 'rest') {
            return this.random(5, 10); // 5-10 per hour * 2 hours = 10-20 total
        }
        return 0;
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        return {
            message: `Resting: Hour ${hourIndex + 1}/${totalHours} - Health +${stats.healthChange}, Hunger ${stats.hungerChange}`,
            logType: 'neutral'
        };
    }

    static getPreview() {
        // Note: This shows shelter sleep stats as baseline
        // UI will need to show location-specific info
        return {
            timeCost: CONFIG.TIME_COSTS.SLEEP, // 7 hours for shelter/park, 2 for rest
            effects: {
                money: [-30, 0], // Possible robbery at park
                health: [10, 50], // Range from rest (10-20) to shelter (30-50)
                hunger: [-20, -5]
            },
            notes: "varies by location"
        };
    }
}
