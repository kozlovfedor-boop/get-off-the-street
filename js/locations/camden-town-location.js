// Camden Town Location - Industrial area with factories and warehouses
class CamdenTownLocation extends BaseLocation {
    constructor() {
        super('camden-town', 'Camden Town', 'Industrial area with factories and warehouses.');

        // Create pre-configured action instances
        this.actions = {
            'work': new WorkAction({
                earnings: 'low',     // £20-40
                hunger: 'medium',    // -15 to -8
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
                events: [
                    new FreeResourceEvent({
                        chance: 'low',       // 3% per hour
                        amount: 'low'        // +5-15 hunger
                    })
                ]
            }),
            'steal': new StealAction({
                reward: 'medium',    // £30-60
                hunger: 'low',       // -10 to -5
                events: [
                    new PoliceEvent({
                        chance: 'medium',    // 15% police encounter
                        severity: 'low'      // £5-20 fine
                    })
                ]
            }),
            'sleep': new SleepAction({
                health: 'low',       // 6-10 recovery
                hunger: 'low',       // -10 to -5
                timeCost: 2,
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
            })
        };
    }

    getTravelTime() {
        return {
            'park': 1.0,
            'london-city': 1.0
        };
    }

    isActionAvailable(action, timeManager) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        if (action === 'work' && !timeManager.isTimeBetween(6, 22)) {
            return { available: false, reason: 'Factories are closed (open 6am-10pm)' };
        }

        return { available: true };
    }
}
