// Park Location - Public park, free but risky at night
class ParkLocation extends BaseLocation {
    constructor() {
        super('park', 'City Park', 'Public park. Free but risky at night.');

        // Create pre-configured action instances
        this.actions = {
            'sleep': new SleepAction({
                health: 'medium',    // 15-30 recovery
                hunger: 'low',       // -10 to -5
                timeCost: 3,
                xpReward: CONFIG.XP_REWARDS.sleep,
                events: [
                    new RobberyEvent({
                        chance: 'medium',    // 8% per hour
                        severity: 'medium'   // £20-50 loss
                    }),
                    new NightmareEvent({
                        chance: 'low',       // 3% per hour
                        severity: 'low'      // -10 to -5 health
                    }),
                    new WeatherEvent({
                        chance: 'medium',    // 8% per hour
                        severity: 'low'
                    })
                ]
            }),
            'panhandle': new PanhandleAction({
                earnings: 'low',     // £5-20
                hunger: 'low',       // -10 to -5
                xpReward: CONFIG.XP_REWARDS.panhandle,
                events: [
                    new FindMoneyEvent({
                        chance: 'low',       // 3% per hour
                        amount: 'low'        // £5-20
                    })
                ]
            }),
            'food': new FindFoodAction({
                food: 'low',
                xpReward: CONFIG.XP_REWARDS.food
            })
        };
    }

    getTravelTime() {
        return {
            'shelter': 1.0,
            'camden-town': 1.0
        };
    }

    isActionAvailable(action, timeManager, player = null) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        return { available: true };
    }
}
