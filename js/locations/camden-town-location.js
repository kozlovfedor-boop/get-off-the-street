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
                events: [
                    new WorkAccidentEvent({
                        chance: 'low',       // 3% per hour
                        severity: 'low'      // -10 to -5 health
                    }),
                    new BonusTipEvent({
                        chance: 'low',       // 3% per hour
                        bonus: 'low'         // £5-20
                    })
                ]
            }),
            'panhandle': new PanhandleAction({
                earnings: 'low',     // £5-20
                hunger: 'low',       // -10 to -5
                xpReward: CONFIG.XP_REWARDS.panhandle,
                events: [
                    new FreeResourceEvent({
                        chance: 'low',       // 3% per hour
                        amount: 'low'        // +5-15 hunger
                    })
                ]
            }),
            'steal': new StealAction({
                reward: 'low',    // £10-30
                hunger: 'low',       // -10 to -5
                xpReward: CONFIG.XP_REWARDS.steal,
                events: [
                    new PoliceEvent({
                        chance: 'medium',    // 8% police encounter
                        severity: 'medium'   // £20-50 fine
                    }),
                    new BeatenUpEvent({
                        chance: 'high',      // 15% beaten up
                        severity: 'high'     // -30 to -15 health
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
                        severity: 'low'      // £5-20 loss
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
                xpReward: CONFIG.XP_REWARDS.buy_food
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

        if (action === 'work' && !timeManager.isTimeBetween(6, 22)) {
            return { available: false, reason: 'Factories are closed (open 6am-10pm)' };
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
