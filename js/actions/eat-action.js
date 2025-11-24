// Eat action - eat free meal at shelter (instant)
class EatAction extends BaseAction {
    execute() {
        const foodAmount = this.random(40, 60);

        return {
            type: 'eat',
            message: `You ate a free meal at the shelter. Hunger +${foodAmount}.`,
            logType: 'positive',
            timeCost: 0, // Instant - no animation
            statChanges: {
                money: 0,
                health: 0,
                hunger: foodAmount
            },
            perHourCalculation: 'instant'
        };
    }

    isInstant() {
        return true;
    }

    static getPreview() {
        return {
            timeCost: 0, // Instant
            effects: {
                money: [0, 0],
                health: [0, 0],
                hunger: [40, 60]
            },
            notes: null
        };
    }

    // No need to override calculatePerHourStats() - won't be called for instant actions
    // No need to override generateLogMessage() - won't be called for instant actions
}
