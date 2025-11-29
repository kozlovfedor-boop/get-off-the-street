// Work accident event - injury during work
class WorkAccidentEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'low',
            severity: config.severity || 'medium'
        };
        this.storedHealthLoss = 0;
    }

    canTrigger(context) {
        // Only during work action
        return this.isActionType('WorkAction');
    }

    execute(context) {
        this.player = context.player;
        this.locationManager = context.locationManager;
        this.timeManager = context.timeManager;
        this.actionContext = context.action;

        // Determine injury severity
        const healthRange = this.getPresetRange('healthImpact', this.config.severity);
        this.storedHealthLoss = this.random(...healthRange);

        return {
            type: 'work-accident',
            message: `Accident at work! You've been injured.`,
            logType: 'negative',
            statChanges: {
                money: 0,
                health: this.storedHealthLoss,
                hunger: 0
            }
        };
    }

    getModalContent() {
        return {
            title: 'WORK ACCIDENT',
            description: `You've been injured at work (${this.storedHealthLoss} health). Your employer is asking what happened.`,
            choices: [
                {
                    label: 'Report Injury',
                    value: 'report',
                    variant: 'safe'
                },
                {
                    label: 'Hide It',
                    value: 'hide'
                },
                {
                    label: 'Demand Compensation',
                    value: 'demand',
                    variant: 'danger'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;

        switch (choice) {
            case 'report':
                // Small compensation, health loss
                this.applyStats(0, this.storedHealthLoss, 0);
                const compensation = this.random(10, 20);
                this.applyStats(compensation, 0, 0);
                return {
                    message: `Reported injury. Got £${compensation} compensation and ${this.storedHealthLoss} health.`,
                    logType: 'neutral',
                    stopAction: false  // Continue working
                };

            case 'hide':
                // No compensation, health loss, keep working
                this.applyStats(0, this.storedHealthLoss, 0);
                return {
                    message: `Kept working through pain. ${this.storedHealthLoss} health.`,
                    logType: 'negative',
                    stopAction: false
                };

            case 'demand':
                // 30% chance: good compensation, 70% chance: fired
                if (this.random(1, 100) <= 30) {
                    // Got paid
                    this.applyStats(0, this.storedHealthLoss, 0);
                    const bigCompensation = this.random(30, 50);
                    this.applyStats(bigCompensation, 0, 0);
                    return {
                        message: `They paid £${bigCompensation} to avoid trouble! ${this.storedHealthLoss} health.`,
                        logType: 'positive',
                        stopAction: false
                    };
                } else {
                    // Got fired - lose work earnings
                    this.applyStats(0, this.storedHealthLoss, 0);

                    // Clear accumulated work earnings if action supports it
                    if (this.actionContext && this.actionContext.totalEarnings !== undefined) {
                        this.actionContext.totalEarnings = 0;
                    }

                    return {
                        message: `They fired you! Lost work earnings and ${this.storedHealthLoss} health.`,
                        logType: 'negative',
                        stopAction: true  // Fired, must leave
                    };
                }

            default:
                return {
                    message: 'Something went wrong.',
                    logType: 'neutral',
                    stopAction: false
                };
        }
    }
}
