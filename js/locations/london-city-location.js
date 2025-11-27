// London City Location - Wealthy business district with high pay and high risk
class LondonCityLocation extends BaseLocation {
    constructor() {
        super('london-city', 'London City', 'The wealthy business district. High pay, high risk.');

        // Create pre-configured action instances
        this.actions = {
            'work': new WorkAction({
                earnings: 'high',    // £30-60
                hunger: 'high'       // -25 to -10
            }),
            'panhandle': new PanhandleAction({
                earnings: 'high',    // £30-60 (better in rich area)
                hunger: 'low'        // -10 to -5
            }),
            'steal': new StealAction({
                risk: 'high',        // 30% police
                reward: 'high',      // £50-100
                hunger: 'low'        // -10 to -5
            })
        };
    }

    getTravelTime() {
        return {
            'camden-town': 0.5
        };
    }

    isActionAvailable(action, timeManager) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        if (action === 'work' && !timeManager.isTimeBetween(8, 18)) {
            return { available: false, reason: 'Businesses are closed (open 8am-6pm)' };
        }

        return { available: true };
    }
}
