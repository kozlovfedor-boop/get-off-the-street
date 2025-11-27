// Camden Town Location - Industrial area with factories and warehouses
class CamdenTownLocation extends BaseLocation {
    constructor() {
        super('camden-town', 'Camden Town', 'Industrial area with factories and warehouses.');

        // Create pre-configured action instances
        this.actions = {
            'work': new WorkAction({
                earnings: 'medium',  // £20-40
                hunger: 'medium'     // -15 to -8
            }),
            'panhandle': new PanhandleAction({
                earnings: 'low',     // £5-20
                hunger: 'low'        // -10 to -5
            }),
            'steal': new StealAction({
                risk: 'medium',      // 15% police
                reward: 'high',      // £50-100
                hunger: 'low'        // -10 to -5
            }),
            'sleep': new SleepAction({
                health: 'low',       // 6-10 recovery
                hunger: 'low',       // -10 to -5
                timeCost: 2,
                safe: false,
                risk: 0.17,          // 17% robbery at night (7% day)
                robberyAmount: [15, 40]
            })
        };
    }

    getTravelTime() {
        return {
            'park': 0.5,
            'london-city': 0.5
        };
    }

    isActionAvailable(action, timeManager) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        if (action === 'work' && !timeManager.isTimeBetween(6, 22)) {
            return { available: false, reason: 'Factories are closed (open 6am-10pm)' };
        }

        // Adjust sleep risk based on time
        if (action === 'sleep') {
            const sleepAction = this.actions[action];
            sleepAction.config.risk = timeManager.isNighttime() ? 0.17 : 0.07;
        }

        return { available: true };
    }
}
