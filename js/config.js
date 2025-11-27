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

    // Initial time and location
    INITIAL_HOUR: 6, // Start at 6:00 AM
    INITIAL_LOCATION: 'park', // Start at the park

    // Stat limits
    MAX_HEALTH: 100,
    MAX_HUNGER: 100,
    MIN_STAT: 0,

    // Hunger threshold for health loss
    STARVATION_THRESHOLD: 20,

    // UI
    MAX_LOG_ENTRIES: 20,
    INTRO_TEXT: "You wake up on a cold park bench. Everything you owned is gone. No home. No job. No money.\n\nYou need to survive on the streets and save £2,000 to rent an apartment and start over.\n\nWhat will you do?",
    ANIMATION_SPEED: 1000, // Milliseconds per in-game hour

    // Time constants (in hours - all whole numbers)
    TIME_COSTS: {
        WORK: 7,
        SLEEP: 7,       // Default, overridden per location in SleepAction
        FOOD: 2,        // Changed from 1.5 to 2
        STEAL: 1,
        PANHANDLE: 3,   // Changed from 2.5 to 3
        EAT: 0          // Changed from 0.5 to 0 (instant)
    },

    // Location IDs
    LOCATIONS: {
        LONDON_CITY: 'london-city',
        CAMDEN_TOWN: 'camden-town',
        SHELTER: 'shelter',
        PARK: 'park'
    },

    // Action effect presets (high/medium/low)
    ACTION_PRESETS: {
        earnings: {
            high: [30, 60],
            medium: [20, 40],
            low: [5, 20]
        },
        health: {
            high: [30, 50],
            medium: [15, 30],
            low: [6, 10]
        },
        hunger: {
            high: [-25, -10],   // High hunger cost
            medium: [-15, -8],
            low: [-10, -5]
        },
        risk: {
            high: 0.30,         // 30% chance
            medium: 0.15,
            low: 0.05
        },
        reward: {
            high: [50, 100],    // Steal rewards
            medium: [30, 60],
            low: [10, 30]
        },
        food: {
            high: [40, 60],     // Shelter meals
            medium: [20, 45],   // Dumpster diving
            low: [10, 25]
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
