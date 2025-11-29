// Shared utility functions for events
const EventUtils = {
    /**
     * Random number generator (inclusive)
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Pick a random element from an array
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Roll probability (returns true if roll succeeds)
     */
    rollChance(probability) {
        return Math.random() < probability;
    },

    /**
     * Get action class name from action instance
     */
    getActionType(action) {
        return action ? action.constructor.name : null;
    },

    /**
     * Format stat changes for log message
     */
    formatStatChanges(moneyChange, healthChange, hungerChange) {
        const parts = [];

        if (moneyChange !== 0) {
            const sign = moneyChange >= 0 ? '+' : '';
            parts.push(`${sign}£${moneyChange}`);
        }

        if (healthChange !== 0) {
            const sign = healthChange >= 0 ? '+' : '';
            parts.push(`${sign}${healthChange} health`);
        }

        if (hungerChange !== 0) {
            const sign = hungerChange >= 0 ? '+' : '';
            parts.push(`${sign}${hungerChange} hunger`);
        }

        return parts.join(', ');
    }
};
