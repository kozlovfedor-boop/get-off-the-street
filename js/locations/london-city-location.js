// London City Location - Wealthy business district with high pay and high risk
class LondonCityLocation extends BaseLocation {
    constructor() {
        super('london-city', 'London City', 'The wealthy business district. High pay, high risk.');

        // Create pre-configured action instances
        this.actions = {
            'work': new WorkAction({
                earnings: 'medium',    // £30-60
                hunger: 'high',        // -25 to -10
                xpReward: CONFIG.XP_REWARDS.work,
                events: [
                    new WorkAccidentEvent({
                        chance: 'low',         // 3% per hour
                        severity: 'medium'     // -20 to -10 health
                    }),
                    new BonusTipEvent({
                        chance: 'medium',      // 8% per hour
                        bonus: 'medium'        // £20-50
                    }),
                    new SicknessEvent({
                        chance: 'low',         // 3% per hour
                        severity: 'low'        // -10 to -5 health
                    })
                ]
            }),
            'panhandle': new PanhandleAction({
                earnings: 'medium',    // £30-60 (better in rich area)
                hunger: 'low',         // -10 to -5
                xpReward: CONFIG.XP_REWARDS.panhandle,
                events: [
                    new GenerousStrangerEvent({
                        chance: 'low',         // 3% per hour
                        bonus: 'high'          // £50-100
                    }),
                    new FindMoneyEvent({
                        chance: 'low',         // 3% per hour
                        amount: 'medium'       // £20-50
                    })
                ]
            }),
            'steal': new StealAction({
                reward: 'high',        // £50-100
                hunger: 'low',         // -10 to -5
                xpReward: CONFIG.XP_REWARDS.steal,
                events: [
                    new PoliceEvent({
                        chance: 'high',      // 15% police encounter
                        severity: 'medium'   // £20-50 fine
                    }),
                    new BeatenUpEvent({
                        chance: 'high',      // 15% beaten up
                        severity: 'high'     // -30 to -15 health
                    })
                ]
            }),
            'buy-food': new BuyFoodAction({
                cost: 'high',          // £20-35
                food: 'high',          // 20-40 hunger
                timeCost: 1,
                xpReward: CONFIG.XP_REWARDS.buy_food
            })
        };
    }

    getTravelTime() {
        return {
            'camden-town': 1.0
        };
    }

    isActionAvailable(action, timeManager, player = null) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        if (action === 'work' && !timeManager.isTimeBetween(8, 18)) {
            return { available: false, reason: 'Businesses are closed (open 8am-6pm)' };
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
