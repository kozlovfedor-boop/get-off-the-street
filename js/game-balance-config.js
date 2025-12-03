/**
 * Game Balance Configuration
 *
 * Single source of truth for all game mechanics, stats, and balance values.
 * Edit this file to adjust game balance - no sync script needed!
 */

const GAME_BALANCE = {
    // ========================================================================
    // ACTIONS BY LOCATION
    // ========================================================================
    locations: {
        park: {
            sleep: {
                health: 'medium',      // 15-30
                hunger: 'low',         // -10 to -5
                timeCost: 3,
                xp: 0,
                reputation: {},
                events: [
                    { type: 'RobberyEvent', chance: 'medium', severity: 'medium', timeCondition: 'nighttime' },
                    { type: 'NightmareEvent', chance: 'low', severity: 'low' },
                    { type: 'WeatherEvent', chance: 'medium', severity: 'low' }
                ]
            },
            panhandle: {
                earnings: 'low',       // £5-20
                hunger: 'low',         // -10 to -5
                timeCost: 3,
                xp: 15,
                reputation: { locals: '-low' },
                gating: { locals: 'Neutral+' },
                events: [
                    { type: 'FreeResourceEvent', chance: 'low', amount: 'low', reputation: { locals: '+low' } },
                    { type: 'FindMoneyEvent', chance: 'low', amount: 'low' }
                    // [TODO] Add fight event
                ]
            },
            food: {
                food: 'low',           // +10-25 hunger
                timeCost: 2,
                xp: 8,
                reputation: {},
                events: [
                    // [TODO] Rat attack event
                ]
            }
        },

        shelter: {
            sleep: {
                health: 'high',        // 30-50
                hunger: 'low',      // -15 to -8
                timeCost: 7,
                xp: 0,
                timeRestriction: '18-8',
                reputation: { shelter: '+low' },
                gating: { shelter: 'Neutral+' },
                events: [
                    // TODO: NightmareEvent
                    // TODO: RobberyEvent
                ]
            },
            eat: {
                food: 'medium',        // +20-45 hunger
                timeCost: 1,           // Instant
                xp: 0,
                timeRestriction: '6-8,18-20',
                reputation: { shelter: '+low' },
                gating: { shelter: 'Neutral+' },
                events: [
                    // TODO: No food event
                    // TODO: Fight in the line event
                ]
            }
        },

        camden_town: {
            work: {
                earnings: 'low',       // £20-40
                hunger: 'medium',      // -15 to -8
                timeCost: 7,
                xp: 25,
                timeRestriction: '6-22',
                reputation: { business: '+low' },
                gating: { business: 'Neutral+' },
                deferredPayment: true,
                events: [
                    { type: 'WorkAccidentEvent', chance: 'low', severity: 'low', reputation: { business: '-low' } },
                    { type: 'BonusTipEvent', chance: 'low', bonus: 'low', reputation: { business: '+low' } }
                ]
            },
            panhandle: {
                earnings: 'low',       // £5-20
                hunger: 'low',         // -10 to -5
                timeCost: 3,
                xp: 15,
                reputation: { locals: '-low' },
                gating: { locals: 'Neutral+' },
                events: [
                    { type: 'FreeResourceEvent', chance: 'low', amount: 'low', reputation: { locals: '+low' } },
                    { type: 'FindMoneyEvent', chance: 'low', amount: 'low' }
                    // [TODO] Add fight event
                ]
            },
            steal: {
                reward: 'medium',         // £10-30
                hunger: 'low',         // -10 to -5
                timeCost: 1,
                xp: 35,
                reputation: { police: '-low', locals: '-low' },
                events: [
                    { type: 'PoliceEvent', chance: 'medium', severity: 'medium', reputation: { police: '-medium' } },
                    { type: 'BeatenUpEvent', chance: 'high', severity: 'high', reputation: { locals: '-low' } }
                    // TODO Replace with fighting event and system isntead of BeatenUpEvent
                ]
            },
            sleep: {
                health: 'low',         // 6-10
                hunger: 'low',         // -10 to -5
                timeCost: 2,
                xp: 0,
                reputation: { police: '-low', locals: '-low' },
                events: [
                    { type: 'RobberyEvent', chance: 'low', severity: 'low', timeCondition: 'nighttime' },
                    { type: 'NightmareEvent', chance: 'high', severity: 'medium' },
                    { type: 'WeatherEvent', chance: 'low', severity: 'low' }
                ]
            },
            buy_food: {
                cost: 'medium',        // £10-20
                food: 'medium',        // +20-45 hunger
                timeCost: 1,
                xp: 0,
                reputation: { business: '+low' },
                gating: { afford: 10, business: 'Neutral+' },
                events: [
                    // TODO: Police suspicion event
                ]
            }
        },

        london_city: {
            work: {
                earnings: 'medium',    // £30-60
                hunger: 'high',        // -25 to -10
                timeCost: 7,
                xp: 25,
                timeRestriction: '8-18',
                reputation: { business: '+low' },
                gating: { business: 'Neutral+' },
                deferredPayment: true,
                events: [
                    { type: 'WorkAccidentEvent', chance: 'low', severity: 'medium', reputation: { business: '-medium' } },
                    { type: 'BonusTipEvent', chance: 'medium', bonus: 'medium', reputation: { business: '+medium' } },
                    { type: 'SicknessEvent', chance: 'low', severity: 'low' }
                    // TODO: Replace sickness with health event system
                ]
            },
            panhandle: {
                earnings: 'medium',    // £30-60
                hunger: 'low',         // -10 to -5
                timeCost: 3,
                xp: 15,
                reputation: { locals: '+low' },
                gating: { locals: 'Neutral+' },
                events: [
                    { type: 'GenerousStrangerEvent', chance: 'low', bonus: 'high', timeCondition: 'daytime', reputation: { locals: '+medium' } },
                    { type: 'FindMoneyEvent', chance: 'low', amount: 'medium' }
                    // [TODO] Add fight event
                    // TODO: Police event
                ]
            },
            steal: {
                reward: 'high',        // £50-100
                hunger: 'low',         // -10 to -5
                timeCost: 1,
                xp: 35,
                reputation: { police: '-medium', locals: '-low' },
                events: [
                    { type: 'PoliceEvent', chance: 'high', severity: 'high', reputation: { police: '-high' } },
                    { type: 'BeatenUpEvent', chance: 'high', severity: 'high', reputation: { locals: '-medium' } }
                    // TODO Replace with fighting event and system isntead of BeatenUpEvent
                ]
            },
            buy_food: {
                cost: 'high',          // £20-35
                food: 'high',          // +40-60 hunger
                timeCost: 1,
                xp: 0,
                reputation: { business: '+low', business: 'Neutral+' },
                gating: { afford: 20 },
                events: []
            }
        }
    },

    // ========================================================================
    // LEVEL SYSTEM
    // ========================================================================
    levelSystem: {
        maxLevel: 10,
        baseXP: 150,               // XP needed for level 2
        xpMultiplier: 1.4,         // Exponential growth

        bonuses: {
            earnings: 0.05,        // +5% per level
            health: 0.05,          // +5% per level
            hungerEfficiency: 0.05, // +5% less hunger per level
            riskReduction: 0.03    // -3% risk per level (flat)
        },

        xpRequirements: {
            1: 0,
            2: 150,
            3: 210,
            4: 294,
            5: 412,
            6: 576,
            7: 807,
            8: 1130,
            9: 1582,
            10: 2215
        }
    },

    // ========================================================================
    // REPUTATION SYSTEM
    // ========================================================================
    reputationSystem: {
        factions: [
            { id: 'police', name: 'Police', icon: '👮' },
            { id: 'locals', name: 'Locals', icon: '👥' },
            { id: 'shelter', name: 'Shelter Staff', icon: '🏠' },
            { id: 'business', name: 'Business Owners', icon: '💼' }
        ],

        startingReputation: 50,    // All factions start at Neutral

        tiers: [
            {
                name: 'Hated',
                min: 0,
                max: 20,
                icon: '💀',
                color: '#ff0000',
                modifiers: {
                    earnings: 0.50,
                    risk: 2.00,
                    eventChance: 1.50
                }
            },
            {
                name: 'Disliked',
                min: 21,
                max: 40,
                icon: '👎',
                color: '#ff6600',
                modifiers: {
                    earnings: 0.75,
                    risk: 1.50,
                    eventChance: 1.25
                }
            },
            {
                name: 'Neutral',
                min: 41,
                max: 60,
                icon: '😐',
                color: '#999999',
                modifiers: {
                    earnings: 1.00,
                    risk: 1.00,
                    eventChance: 1.00
                }
            },
            {
                name: 'Respected',
                min: 61,
                max: 80,
                icon: '👍',
                color: '#00cc00',
                modifiers: {
                    earnings: 1.25,
                    risk: 0.75,
                    eventChance: 0.75
                }
            },
            {
                name: 'Trusted',
                min: 81,
                max: 100,
                icon: '⭐',
                color: '#00ff00',
                modifiers: {
                    earnings: 1.50,
                    risk: 0.50,
                    eventChance: 0.50
                }
            }
        ]
    },

    // ========================================================================
    // PRESET RANGES
    // ========================================================================
    presets: {
        action: {
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
                high: [-25, -10],
                medium: [-15, -8],
                low: [-10, -5]
            },
            food: {
                high: [40, 60],
                medium: [20, 45],
                low: [10, 25]
            },
            cost: {
                high: [20, 35],
                medium: [10, 20],
                low: [5, 15]
            },
            reward: {
                high: [50, 100],
                medium: [30, 60],
                low: [10, 30]
            }
        },

        event: {
            chance: {
                high: 15,          // 15% per hour
                medium: 8,         // 8% per hour
                low: 3             // 3% per hour
            },
            severity: {
                moneyLoss: {
                    high: [30, 50],
                    medium: [20, 40],
                    low: [5, 20]
                },
                moneyGain: {
                    high: [50, 100],
                    medium: [30, 60],
                    low: [10, 30]
                },
                healthLoss: {
                    high: [20, 30],
                    medium: [10, 20],
                    low: [5, 10]
                },
                hungerLoss: {
                    high: [10, 20],
                    medium: [5, 10],
                    low: [3, 5]
                }
            }
        },

        reputation: {
            high: 15,              // ±15 reputation
            medium: 8,             // ±8 reputation
            low: 3                 // ±3 reputation
        }
    },

    // ========================================================================
    // GLOBAL CONSTANTS
    // ========================================================================
    gameConstants: {
        victory: {
            money: 2000,           // £2,000 to win
            minHealth: 20          // Must have 20+ health
        },
        survival: {
            starvationThreshold: 20,  // Below 20 hunger = health loss
            healthMin: 0,
            healthMax: 100,
            hungerMin: 0,
            hungerMax: 100
        },
        starting: {
            location: 'park',
            hour: 6,               // 6:00 AM
            money: 0,
            health: 100,
            hunger: 50,
            level: 1,
            experience: 0
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.GAME_BALANCE = GAME_BALANCE;
}

// For Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_BALANCE;
}
