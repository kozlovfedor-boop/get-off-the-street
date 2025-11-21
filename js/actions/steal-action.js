// Steal action - risky theft attempt (1 hour)
class StealAction extends BaseAction {
    execute() {
        const policeRisk = this.locationManager.getRiskModifier('steal');
        const caughtByPolice = Math.random() < policeRisk;

        let message, moneyChange = 0, healthChange = 0;

        if (caughtByPolice) {
            healthChange = -25;
            const fine = Math.min(this.random(20, 50), this.player.money);
            moneyChange = -fine;
            message = `You got caught by police! Lost £${fine} and got beaten. Health -25.`;
        } else {
            const success = Math.random() > 0.3; // 70% success if no police
            if (success) {
                const stolen = this.random(50, 100);
                moneyChange = stolen;
                message = `You successfully stole £${stolen}!`;
            } else {
                healthChange = -15;
                message = "You got caught by someone and got beaten up. Health -15.";
            }
        }

        const hungerCost = this.random(5, 15);

        return {
            type: 'steal',
            message: message,
            logType: caughtByPolice || healthChange < 0 ? 'negative' : 'positive',
            timeCost: CONFIG.TIME_COSTS.STEAL,
            statChanges: {
                money: moneyChange,
                health: healthChange,
                hunger: -hungerCost
            },
            perHourCalculation: 'steal'
        };
    }

    calculatePerHourStats(hourIndex) {
        // For steal, the result is already determined in execute()
        // We use the saved result instead of recalculating
        if (!this.savedResult) {
            this.savedResult = this.execute();
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
            this.savedResult = this.execute();
        }
        return {
            message: this.savedResult.message,
            logType: this.savedResult.logType
        };
    }
}
