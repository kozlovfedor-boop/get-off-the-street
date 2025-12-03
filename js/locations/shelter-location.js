// Shelter Location - Safe place to sleep and eat (open 6pm-8am)
class ShelterLocation extends BaseLocation {
    constructor() {
        super('shelter', 'Homeless Shelter', 'Safe place to sleep and eat. Open 6pm-8am.');

        // Load actions from balance config
        this.actions = BalanceLoader.loadLocationActions('shelter');
    }

    getTravelTime() {
        return {
            'park': 1.0
        };
    }

    isActionAvailable(action, timeManager, player = null) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }

        // Check availability using balance config
        const actionConfig = GAME_BALANCE.locations.shelter[action];
        if (actionConfig) {
            return BalanceLoader.checkActionAvailability(action, actionConfig, timeManager, player);
        }

        return { available: true };
    }
}
