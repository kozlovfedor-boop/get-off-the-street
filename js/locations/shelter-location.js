// Shelter Location - Safe place to sleep and eat (open 6pm-8am)
class ShelterLocation extends BaseLocation {
    constructor() {
        super('shelter', 'Homeless Shelter', 'Safe place to sleep and eat. Open 6pm-8am.');

        // Create pre-configured action instances
        this.actions = {
            'sleep': new SleepAction({
                health: 'high',      // 30-50 recovery
                hunger: 'medium',    // -15 to -8
                timeCost: 7,
                xpReward: CONFIG.XP_REWARDS.sleep,
                reputationEffects: {   // NEW: Using shelter improves shelter reputation
                    shelter: { change: 'low', positive: true }  // +3 shelter rep
                }
            }),
            'eat': new EatAction({
                food: 'medium',         // 40-60 hunger
                xpReward: CONFIG.XP_REWARDS.eat,
                reputationEffects: {   // NEW: Using meal service improves shelter reputation
                    shelter: { change: 'low', positive: true }  // +3 shelter rep
                }
            })
        };
    }

    getTravelTime() {
        return {
            'park': 1.0
        };
    }

    isActionAvailable(action, timeManager, player = null) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        if (action === 'sleep') {
            if (!timeManager.isTimeBetween(18, 8)) {
                return { available: false, reason: 'Shelter is closed (open 6pm-8am)' };
            }
            // NEW: Reputation gating for sleep - need Neutral+ shelter reputation
            if (player && player.reputationManager) {
                const tier = player.reputationManager.getTierName('shelter');
                if (tier === 'Hated' || tier === 'Disliked') {
                    return { available: false, reason: 'Shelter staff have banned you (low reputation)' };
                }
            }
        }

        if (action === 'eat') {
            const isDinner = timeManager.isTimeBetween(18, 20);
            const isBreakfast = timeManager.isTimeBetween(6, 8);
            if (!isDinner && !isBreakfast) {
                return { available: false, reason: 'Not meal time (6-8am or 6-8pm)' };
            }
            // NEW: Reputation gating for eat - need Neutral+ shelter reputation
            if (player && player.reputationManager) {
                const tier = player.reputationManager.getTierName('shelter');
                if (tier === 'Hated' || tier === 'Disliked') {
                    return { available: false, reason: 'Shelter staff refuse to serve you (low reputation)' };
                }
            }
        }

        return { available: true };
    }
}
