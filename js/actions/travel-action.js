// Travel action - move between locations
class TravelAction extends BaseAction {
    constructor(config = {}) {
        super(config);
        this.config = {
            destinationId: config.destinationId || null,
            timeCost: config.timeCost || 0,
            path: config.path || [],
            direction: config.direction || 'right',
            hungerPerHour: config.hungerPerHour || 0,
            events: config.events || []  // Support travel events
        };
        this.totalHungerCost = 0;
    }

    execute(player, locationManager, timeManager) {
        this.player = player;
        this.locationManager = locationManager;
        this.timeManager = timeManager;

        // Calculate total hunger cost for the journey
        const totalHungerCost = Math.floor(Math.random() * 5) + 3;
        this.config.hungerPerHour = totalHungerCost / this.config.timeCost;
        this.totalHungerCost = totalHungerCost;

        const destination = locationManager.getLocation(this.config.destinationId);

        return {
            type: 'travel',
            message: `Traveling to ${destination.name}...`,
            logType: 'neutral',
            timeCost: this.config.timeCost,
            statChanges: {
                money: 0,
                health: 0,
                hunger: -totalHungerCost
            },
            perHourCalculation: 'travel',
            // Travel-specific data
            path: this.config.path,
            direction: this.config.direction
        };
    }

    calculatePerHourStats(hourIndex) {
        return {
            moneyChange: 0,
            healthChange: 0,
            hungerChange: -Math.round(this.config.hungerPerHour)
        };
    }

    generateLogMessage(hourIndex, totalHours, stats) {
        const currentSegment = hourIndex;
        const fromLocation = this.config.path[currentSegment];
        const toLocation = this.config.path[currentSegment + 1];

        const toName = this.locationManager.getLocation(toLocation).name;

        if (hourIndex < totalHours - 1) {
            return {
                message: `Passing through ${toName}. Hunger ${stats.hungerChange}`,
                logType: 'neutral'
            };
        } else {
            return {
                message: `Arrived at ${toName}. Total hunger -${this.totalHungerCost}`,
                logType: 'neutral'
            };
        }
    }

    getPreview() {
        const destination = this.locationManager?.getLocation(this.config.destinationId);
        return {
            timeCost: this.config.timeCost,
            effects: {
                money: 'none',
                health: 'none',
                hunger: 'low',
                risk: this.calculateRiskLevel()  // Dynamic calculation from events
            },
            notes: destination ? `Travel to ${destination.name}` : null
        };
    }
}
