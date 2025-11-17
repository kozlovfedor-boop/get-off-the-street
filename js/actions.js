// Player actions
class ActionManager {
    constructor(player, locationManager) {
        this.player = player;
        this.locationManager = locationManager;
    }

    // Helper for random numbers
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Action: Find Work
    findWork() {
        const payModifier = this.locationManager.getPayModifier();
        const baseEarnings = this.random(20, 40);
        const earnings = Math.floor(baseEarnings * payModifier);
        const hungerCost = this.random(10, 25);

        this.player.addMoney(earnings);
        this.player.modifyHunger(-hungerCost);

        const location = this.locationManager.getCurrentLocation();
        return {
            type: 'work',
            message: `You found work in ${location.name}. Earned $${earnings}. Hunger -${hungerCost}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.WORK
        };
    }

    // Action: Find Food
    findFood() {
        const foodAmount = this.random(20, 45);
        this.player.modifyHunger(foodAmount);

        return {
            type: 'food',
            message: `You searched for food in dumpsters. Hunger +${foodAmount}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.FOOD
        };
    }

    // Action: Eat (at shelter)
    eat() {
        const foodAmount = this.random(40, 60);
        this.player.modifyHunger(foodAmount);

        return {
            type: 'eat',
            message: `You ate a free meal at the shelter. Hunger +${foodAmount}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.EAT
        };
    }

    // Action: Sleep/Rest
    sleep() {
        const location = this.locationManager.getCurrentLocation();
        let healthGain, hungerCost, message, risk;

        if (location.id === 'shelter') {
            // Sleeping at shelter - safe and effective
            healthGain = this.random(30, 50);
            hungerCost = this.random(10, 20);
            message = `You slept safely at the shelter. Health +${healthGain}, Hunger -${hungerCost}.`;
            risk = null;
        } else if (location.id === 'park') {
            // Sleeping at park - risky
            healthGain = this.random(20, 35);
            hungerCost = this.random(10, 20);
            risk = this.locationManager.getRiskModifier('sleep');

            // Check for robbery
            if (Math.random() < risk) {
                const stolenAmount = Math.min(this.random(10, 30), this.player.money);
                this.player.removeMoney(stolenAmount);
                message = `You slept in the park but got robbed! Lost $${stolenAmount}. Health +${healthGain}, Hunger -${hungerCost}.`;
            } else {
                message = `You slept in the park. Health +${healthGain}, Hunger -${hungerCost}.`;
            }
        } else {
            // Brief rest on streets
            healthGain = this.random(10, 20);
            hungerCost = this.random(5, 13);
            message = `You took a brief rest. Health +${healthGain}, Hunger -${hungerCost}.`;
        }

        this.player.modifyHealth(healthGain);
        this.player.modifyHunger(-hungerCost);

        const timeCost = (location.id === 'shelter' || location.id === 'park') ?
                        CONFIG.TIME_COSTS.SLEEP : CONFIG.TIME_COSTS.REST;

        return {
            type: 'sleep',
            message: message,
            logType: risk && Math.random() < risk ? 'negative' : 'positive',
            timeCost: timeCost
        };
    }

    // Action: Panhandle
    panhandle() {
        const location = this.locationManager.getCurrentLocation();
        let earnings;

        // Better panhandling in rich areas during day
        if (location.id === 'london-city') {
            earnings = this.random(15, 35);
        } else {
            earnings = this.random(5, 20);
        }

        this.player.addMoney(earnings);
        const hungerCost = this.random(5, 10);
        this.player.modifyHunger(-hungerCost);

        return {
            type: 'panhandle',
            message: `You panhandled for money. Earned $${earnings}. Hunger -${hungerCost}.`,
            logType: 'positive',
            timeCost: CONFIG.TIME_COSTS.PANHANDLE
        };
    }

    // Action: Steal (risky, location affects risk)
    steal() {
        const policeRisk = this.locationManager.getRiskModifier('steal');
        const caughtByPolice = Math.random() < policeRisk;

        let message;
        if (caughtByPolice) {
            this.player.modifyHealth(-25);
            const fine = Math.min(this.random(20, 50), this.player.money);
            this.player.removeMoney(fine);
            message = `You got caught by police! Lost $${fine} and got beaten. Health -25.`;
        } else {
            const success = Math.random() > 0.3; // 70% success if no police
            if (success) {
                const stolen = this.random(50, 100);
                this.player.addMoney(stolen);
                message = `You successfully stole $${stolen}!`;
            } else {
                this.player.modifyHealth(-15);
                message = "You got caught by someone and got beaten up. Health -15.";
            }
        }

        const hungerCost = this.random(5, 15);
        this.player.modifyHunger(-hungerCost);

        return {
            type: 'steal',
            message: message,
            logType: caughtByPolice ? 'negative' : 'positive',
            timeCost: CONFIG.TIME_COSTS.STEAL
        };
    }

    // Action: Rest (brief, on streets)
    rest() {
        const healthGain = this.random(10, 20);
        const hungerCost = this.random(5, 13);

        this.player.modifyHealth(healthGain);
        this.player.modifyHunger(-hungerCost);

        return {
            type: 'rest',
            message: `You took a brief rest. Health +${healthGain}, Hunger -${hungerCost}.`,
            logType: 'neutral',
            timeCost: CONFIG.TIME_COSTS.REST
        };
    }

    // Apply starvation penalty
    applyStarvation() {
        if (this.player.isStarving()) {
            const healthLoss = this.random(5, 12);
            this.player.modifyHealth(-healthLoss);
            return {
                message: `You're starving! Health -${healthLoss}.`,
                logType: 'negative'
            };
        }
        return null;
    }
}
