// Player actions
class ActionManager {
    constructor(player) {
        this.player = player;
    }

    // Helper for random numbers
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Action: Find Work
    findWork() {
        const earnings = this.random(20, 50);
        const hungerCost = this.random(10, 25);

        this.player.addMoney(earnings);
        this.player.modifyHunger(-hungerCost);

        return {
            type: 'work',
            message: `You found some work. Earned $${earnings}. Hunger -${hungerCost}.`,
            logType: 'positive'
        };
    }

    // Action: Find Food
    findFood() {
        const foodAmount = this.random(20, 45);
        this.player.modifyHunger(foodAmount);

        return {
            type: 'food',
            message: `You searched for food and found something to eat. Hunger +${foodAmount}.`,
            logType: 'positive'
        };
    }

    // Action: Rest
    rest() {
        const healthGain = this.random(10, 20);
        const hungerCost = this.random(5, 13);

        this.player.modifyHealth(healthGain);
        this.player.modifyHunger(-hungerCost);

        return {
            type: 'rest',
            message: `You rested for the day. Health +${healthGain}, Hunger -${hungerCost}.`,
            logType: 'neutral'
        };
    }

    // Action: Steal (risky)
    steal() {
        const success = Math.random() > 0.5;
        let message;

        if (success) {
            const stolen = this.random(50, 100);
            this.player.addMoney(stolen);
            message = `You successfully stole $${stolen}!`;
        } else {
            this.player.modifyHealth(-20);
            message = "You got caught! Someone beat you up. Health -20.";
        }

        const hungerCost = this.random(5, 15);
        this.player.modifyHunger(-hungerCost);

        return {
            type: 'steal',
            message: message,
            logType: success ? 'positive' : 'negative'
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
