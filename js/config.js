// Game configuration and constants
const CONFIG = {
    // Win/Lose conditions
    VICTORY_MONEY: 2000,
    VICTORY_MIN_HEALTH: 20,
    DEFEAT_HEALTH: 0,

    // Initial player stats
    INITIAL_STATS: {
        money: 0,
        health: 100,
        hunger: 50,
        day: 1
    },

    // Stat limits
    MAX_HEALTH: 100,
    MAX_HUNGER: 100,
    MIN_STAT: 0,

    // Hunger threshold for health loss
    STARVATION_THRESHOLD: 20,

    // UI
    MAX_LOG_ENTRIES: 20
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
