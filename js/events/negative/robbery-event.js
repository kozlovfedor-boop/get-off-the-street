// Robbery event - attacked while sleeping at risky locations
class RobberyEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'medium',
            severity: config.severity || 'medium'
        };
        this.storedLoss = 0;
    }

    canTrigger(context) {
        // Only during sleep action
        if (!this.isActionType('SleepAction')) {
            return false;
        }

        // Only at risky locations (park, camden-town)
        const riskyLocations = ['park', 'camden-town'];
        if (!this.isAtAnyLocation(riskyLocations)) {
            return false;
        }

        // Only at nighttime
        if (!context.timeManager.isNighttime()) {
            return false;
        }

        return true;
    }

    execute(context) {
        this.player = context.player;
        this.locationManager = context.locationManager;
        this.timeManager = context.timeManager;
        this.actionContext = context.action;

        // Calculate potential loss based on severity
        const lossRange = this.getPresetRange('moneyLoss', this.config.severity);
        const potentialLoss = this.random(...lossRange);
        this.storedLoss = Math.min(potentialLoss, this.player.money);

        return {
            type: 'robbery',
            message: `Someone is trying to rob you while you sleep!`,
            logType: 'negative',
            statChanges: {
                money: 0,  // Applied in processChoice
                health: 0,
                hunger: 0
            }
        };
    }

    getModalContent() {
        return {
            title: 'ROBBERY!',
            description: `You wake to someone rummaging through your belongings! They're going for your money (£${this.storedLoss}). What do you do?`,
            choices: [
                {
                    label: 'Fight Back',
                    value: 'fight',
                    variant: 'danger'
                },
                {
                    label: 'Let Them Take It',
                    value: 'submit',
                    variant: 'safe'
                },
                {
                    label: 'Run Away',
                    value: 'flee'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;

        switch (choice) {
            case 'fight':
                // 50% chance to keep money but get injured, 50% lose money and get injured
                if (this.random(1, 2) === 1) {
                    // Fought successfully but got hurt
                    this.applyStats(0, -15, 0);
                    return {
                        message: `You fought them off! Minor injury (-15 health) but kept your money.`,
                        logType: 'positive',
                        stopAction: false
                    };
                } else {
                    // Lost fight, injured and robbed
                    this.applyStats(-this.storedLoss, -15, 0);
                    return {
                        message: `You fought back but lost! -£${this.storedLoss}, -15 health.`,
                        logType: 'negative',
                        stopAction: true  // Too injured to continue sleeping
                    };
                }

            case 'submit':
                // Safe but lose money
                this.applyStats(-this.storedLoss, 0, 0);
                return {
                    message: `You let them take £${this.storedLoss}. At least you're safe.`,
                    logType: 'negative',
                    stopAction: false  // Can continue sleeping
                };

            case 'flee':
                // Run away - lose money and some hunger from exertion
                this.applyStats(-this.storedLoss, 0, -5);
                return {
                    message: `You fled quickly. Lost £${this.storedLoss} and -5 hunger from running.`,
                    logType: 'negative',
                    stopAction: true  // Had to leave, stop sleeping
                };

            default:
                return {
                    message: 'Something went wrong.',
                    logType: 'neutral',
                    stopAction: false
                };
        }
    }
}
