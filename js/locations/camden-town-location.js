// Camden Town Location - Industrial area with factories and warehouses
class CamdenTownLocation extends BaseLocation {
    constructor() {
        super('camden-town', 'Camden Town', 'Industrial area with factories and warehouses.');

        // Create pre-configured action instances
        this.actions = {
            'work': new WorkAction({
                earnings: 'low',     // £20-40
                hunger: 'medium',    // -15 to -8
                xpReward: CONFIG.XP_REWARDS.work,
                reputationEffects: {   // NEW: Working improves business reputation
                    business: { change: 'low', positive: true }  // +3 business rep
                },
                events: [
                    new WorkAccidentEvent({
                        chance: 'low',       // 3% per hour
                        severity: 'low',     // -10 to -5 health
                        reputationEffects: {   // NEW: Accidents hurt business reputation
                            business: { change: 'low', positive: false }  // -3 business rep
                        }
                    }),
                    new BonusTipEvent({
                        chance: 'low',       // 3% per hour
                        bonus: 'low',        // £5-20
                        reputationEffects: {   // NEW: Good service improves reputation
                            business: { change: 'low', positive: true }  // +3 business rep
                        }
                    })
                ]
            }),
            'panhandle': new PanhandleAction({
                earnings: 'low',     // £5-20
                hunger: 'low',       // -10 to -5
                xpReward: CONFIG.XP_REWARDS.panhandle,
                reputationEffects: {   // NEW: Panhandling builds local reputation
                    locals: { change: 'low', positive: true }  // +3 locals rep
                },
                events: [
                    new FreeResourceEvent({
                        chance: 'low',       // 3% per hour
                        amount: 'low',       // +5-15 hunger
                        reputationEffects: {   // NEW: Kindness improves local reputation
                            locals: { change: 'low', positive: true }  // +3 locals rep
                        }
                    })
                ]
            }),
            'steal': new StealAction({
                reward: 'low',    // £10-30
                hunger: 'low',       // -10 to -5
                xpReward: CONFIG.XP_REWARDS.steal,
                reputationEffects: {   // NEW: Stealing damages reputation with police and locals
                    police: { change: 'low', positive: false },  // -3 police rep
                    locals: { change: 'low', positive: false }   // -3 locals rep
                },
                events: [
                    new PoliceEvent({
                        chance: 'medium',    // 8% police encounter
                        severity: 'medium',  // £20-50 fine
                        reputationEffects: { // NEW: Getting caught damages police reputation
                            police: { change: 'medium', positive: false }  // -8 police rep
                        }
                    }),
                    new BeatenUpEvent({
                        chance: 'high',      // 15% beaten up
                        severity: 'high',    // -30 to -15 health
                        reputationEffects: { // NEW: Getting beaten up hurts local reputation
                            locals: { change: 'low', positive: false }  // -3 locals rep
                        }
                    })
                ]
            }),
            'sleep': new SleepAction({
                health: 'low',       // 6-10 recovery
                hunger: 'low',       // -10 to -5
                timeCost: 2,
                xpReward: CONFIG.XP_REWARDS.sleep,
                events: [
                    new RobberyEvent({
                        chance: 'low',       // 3% per hour
                        severity: 'low',     // £5-20 loss
                        reputationEffects: { // NEW: Getting robbed slightly hurts local reputation
                            locals: { change: 'low', positive: false }  // -3 locals rep
                        }
                    }),
                    new WeatherEvent({
                        chance: 'low',       // 3% per hour
                        severity: 'low'
                    })
                ]
            }),
            'buy-food': new BuyFoodAction({
                cost: 'medium',      // £10-20
                food: 'medium',      // 10-30 hunger
                timeCost: 1,
                xpReward: CONFIG.XP_REWARDS.buy_food,
                reputationEffects: {   // NEW: Buying food slightly improves business reputation
                    business: { change: 'low', positive: true }  // +3 business rep
                }
            })
        };
    }

    getTravelTime() {
        return {
            'park': 1.0,
            'london-city': 1.0
        };
    }

    isActionAvailable(action, timeManager, player = null) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        // Time-based gating for work
        if (action === 'work' && !timeManager.isTimeBetween(6, 22)) {
            return { available: false, reason: 'Factories are closed (open 6am-10pm)' };
        }

        // NEW: Reputation gating for work - need Neutral+ business reputation
        if (action === 'work' && player && player.reputationManager) {
            const tier = player.reputationManager.getTierName('business');
            if (tier === 'Hated' || tier === 'Disliked') {
                return { available: false, reason: 'Factory owners refuse to hire you (low reputation)' };
            }
        }

        // NEW: Reputation gating for panhandle - need Neutral+ locals reputation
        if (action === 'panhandle' && player && player.reputationManager) {
            const tier = player.reputationManager.getTierName('locals');
            if (tier === 'Hated') {
                return { available: false, reason: 'Locals avoid you (very low reputation)' };
            }
        }

        // Check affordability for buy-food action
        if (action === 'buy-food' && player) {
            const buyFoodAction = this.actions['buy-food'];
            const affordability = buyFoodAction.canAfford(player);
            if (!affordability.canAfford) {
                return { available: false, reason: `Need at least £${affordability.minCost}` };
            }
        }

        return { available: true };
    }
}
