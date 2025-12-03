// Camden Town Location - Industrial area with factories and warehouses
class CamdenTownLocation extends BaseLocation {
    constructor() {
        super('camden-town', 'Camden Town', 'Industrial area with factories and warehouses.');

        // Load actions from balance config
        this.actions = BalanceLoader.loadLocationActions('camden_town');
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

        // Check availability using balance config
        const actionConfig = GAME_BALANCE.locations.camden_town[action];
        if (actionConfig) {
            return BalanceLoader.checkActionAvailability(action, actionConfig, timeManager, player);
        }

        return { available: true };
    }
}
