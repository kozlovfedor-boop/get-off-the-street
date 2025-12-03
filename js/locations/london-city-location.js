// London City Location - Wealthy business district with high pay and high risk
class LondonCityLocation extends BaseLocation {
    constructor() {
        super('london-city', 'London City', 'The wealthy business district. High pay, high risk.');

        // Load actions from balance config
        this.actions = BalanceLoader.loadLocationActions('london_city');
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

        // Check availability using balance config
        const actionConfig = GAME_BALANCE.locations.london_city[action];
        if (actionConfig) {
            return BalanceLoader.checkActionAvailability(action, actionConfig, timeManager, player);
        }

        return { available: true };
    }
}
