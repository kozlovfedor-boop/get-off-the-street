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
                safe: false,
                risk: 0.25,          // 25% robbery at night (5% day)
                robberyAmount: [10, 30]
            }),
            'panhandle': new PanhandleAction({
                earnings: 'low',     // £5-20
                hunger: 'low'        // -10 to -5
            }),
            'food': new FindFoodAction({
                food: 'medium'       // 20-45 hunger
            })
        };
    }

    getTravelTime() {
        return {
            'shelter': 0.5,
            'camden-town': 0.5
        };
    }

    isActionAvailable(action, timeManager) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        // Adjust sleep risk based on time
        if (action === 'sleep') {
            const sleepAction = this.actions[action];
            sleepAction.config.risk = timeManager.isNighttime() ? 0.25 : 0.05;
        }

        return { available: true };
    }
}
