// Factory function to create appropriate action instance
function createAction(actionType, player, locationManager, timeManager) {
    switch(actionType) {
        case 'work':
            return new WorkAction(player, locationManager, timeManager);
        case 'panhandle':
            return new PanhandleAction(player, locationManager, timeManager);
        case 'food':
            return new FindFoodAction(player, locationManager, timeManager);
        case 'sleep':
        case 'rest':
            return new SleepAction(player, locationManager, timeManager);
        case 'steal':
            return new StealAction(player, locationManager, timeManager);
        case 'eat':
            return new EatAction(player, locationManager, timeManager);
        default:
            throw new Error(`Unknown action type: ${actionType}`);
    }
}
