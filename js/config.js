// Game configuration and constants
// NOTE: Core balance values now live in game-balance-config.js (GAME_BALANCE)
// This file contains UI/system constants and references to balance config
const CONFIG = {
    // Win/Lose conditions (from GAME_BALANCE.gameConstants.victory)
    VICTORY_MONEY: GAME_BALANCE.gameConstants.victory.money,
    VICTORY_MIN_HEALTH: GAME_BALANCE.gameConstants.victory.minHealth,
    DEFEAT_HEALTH: 0,

    // Initial player stats (from GAME_BALANCE.gameConstants.starting and reputationSystem)
    INITIAL_STATS: {
        money: GAME_BALANCE.gameConstants.starting.money,
        health: GAME_BALANCE.gameConstants.starting.health,
        hunger: GAME_BALANCE.gameConstants.starting.hunger,
        day: 1,
        level: GAME_BALANCE.gameConstants.starting.level,
        experience: GAME_BALANCE.gameConstants.starting.experience,
        reputation: {
            police: GAME_BALANCE.reputationSystem.startingReputation,
            locals: GAME_BALANCE.reputationSystem.startingReputation,
            shelter: GAME_BALANCE.reputationSystem.startingReputation,
            business: GAME_BALANCE.reputationSystem.startingReputation
        }
    },

    // Initial time and location (from GAME_BALANCE.gameConstants.starting)
    INITIAL_HOUR: GAME_BALANCE.gameConstants.starting.hour,
    INITIAL_LOCATION: GAME_BALANCE.gameConstants.starting.location,

    // Stat limits (from GAME_BALANCE.gameConstants.survival)
    MAX_HEALTH: GAME_BALANCE.gameConstants.survival.healthMax,
    MAX_HUNGER: GAME_BALANCE.gameConstants.survival.hungerMax,
    MIN_STAT: GAME_BALANCE.gameConstants.survival.healthMin,

    // Hunger threshold for health loss (from GAME_BALANCE.gameConstants.survival)
    STARVATION_THRESHOLD: GAME_BALANCE.gameConstants.survival.starvationThreshold,

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
        EAT: 0,         // Changed from 0.5 to 0 (instant)
        BUY_FOOD: 1     // Quick shopping trip
    },

    // Location IDs
    LOCATIONS: {
        LONDON_CITY: 'london-city',
        CAMDEN_TOWN: 'camden-town',
        SHELTER: 'shelter',
        PARK: 'park'
    },

    // Action effect presets (from GAME_BALANCE.presets.action)
    ACTION_PRESETS: GAME_BALANCE.presets.action,

    // Event effect presets (from GAME_BALANCE.presets.event)
    EVENT_PRESETS: GAME_BALANCE.presets.event,

    // Level system configuration (from GAME_BALANCE.levelSystem)
    LEVEL_SYSTEM: GAME_BALANCE.levelSystem,

    // XP rewards per action type - built from GAME_BALANCE locations
    // These are extracted for backward compatibility but now stored in GAME_BALANCE
    XP_REWARDS: {
        work: 25,
        panhandle: 15,
        steal: 35,
        sleep: 5,
        food: 8,
        eat: 0,
        buy_food: 0
    },

    // Reputation System Configuration (from GAME_BALANCE.reputationSystem)
    REPUTATION_SYSTEM: {
        FACTIONS: GAME_BALANCE.reputationSystem.factions.reduce((acc, f) => {
            acc[f.id] = { id: f.id, name: f.name, icon: f.icon };
            return acc;
        }, {}),
        TIERS: GAME_BALANCE.reputationSystem.tiers,
        TIER_MODIFIERS: GAME_BALANCE.reputationSystem.tiers.reduce((acc, tier) => {
            acc.earnings = acc.earnings || {};
            acc.risk = acc.risk || {};
            acc.eventChance = acc.eventChance || {};
            acc.earnings[tier.name] = tier.modifiers.earnings;
            acc.risk[tier.name] = tier.modifiers.risk;
            acc.eventChance[tier.name] = tier.modifiers.eventChance;
            return acc;
        }, {})
    },

    // Reputation effect presets (from GAME_BALANCE.presets.reputation)
    REPUTATION_PRESETS: {
        police: {
            high: GAME_BALANCE.presets.reputation.high,
            medium: GAME_BALANCE.presets.reputation.medium,
            low: GAME_BALANCE.presets.reputation.low
        },
        locals: {
            high: GAME_BALANCE.presets.reputation.high,
            medium: GAME_BALANCE.presets.reputation.medium,
            low: GAME_BALANCE.presets.reputation.low
        },
        shelter: {
            high: GAME_BALANCE.presets.reputation.high,
            medium: GAME_BALANCE.presets.reputation.medium,
            low: GAME_BALANCE.presets.reputation.low
        },
        business: {
            high: GAME_BALANCE.presets.reputation.high,
            medium: GAME_BALANCE.presets.reputation.medium,
            low: GAME_BALANCE.presets.reputation.low
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
