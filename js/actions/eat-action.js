// Eat action - eat free meal at shelter (instant)
class EatAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            food: config.food || 'high',
            events: config.events || []  // Preserve events array
        };
    }

    execute(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        // Get preset range
        const foodRange = CONFIG.ACTION_PRESETS.food[this.config.food];
        const foodAmount = this.random(...foodRange);

        return {
            type: 'eat',
            message: `You ate a free meal at the shelter. Hunger +${foodAmount}.`,
            logType: 'positive',
            timeCost: 0, // Instant - no animation
            statChanges: {
                money: 0,
                health: 0,
                hunger: foodAmount
            },
            perHourCalculation: 'instant'
        };
    }

    isInstant() {
        return true;
    }

    getPreview() {
        return {
            timeCost: 0, // Instant
            effects: {
                money: 'none',
                health: 'none',
                hunger: this.config.food,
                risk: this.calculateRiskLevel()  // Dynamic calculation from events
            },
            notes: null
        };
    }

    // No need to override calculatePerHourStats() - won't be called for instant actions
    // No need to override generateLogMessage() - won't be called for instant actions
}
