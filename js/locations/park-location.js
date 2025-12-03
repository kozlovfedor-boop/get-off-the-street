// Park Location - Public park, free but risky at night
class ParkLocation extends BaseLocation {
    constructor() {
        super('park', 'City Park', 'Public park. Free but risky at night.');

        // Load actions from balance config
        this.actions = BalanceLoader.loadLocationActions('park');
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

        // Check availability using balance config
        const actionConfig = GAME_BALANCE.locations.park[action];
        if (actionConfig) {
            return BalanceLoader.checkActionAvailability(action, actionConfig, timeManager, player);
        }

        return { available: true };
    }
}
