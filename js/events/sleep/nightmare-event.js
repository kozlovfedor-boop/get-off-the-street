// Nightmare event - bad dream during sleep
class NightmareEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'low',
            severity: config.severity || 'low'
        };
        this.healthLoss = 0;
    }

    canTrigger(context) {
        // Only during sleep action
        return this.isActionType('SleepAction');
    }

    execute(context) {
        this.player = context.player;
        this.locationManager = context.locationManager;
        this.timeManager = context.timeManager;
        this.actionContext = context.action;

        const healthRange = this.getPresetRange('healthImpact', this.config.severity);
        this.healthLoss = this.random(...healthRange);

        return {
            type: 'nightmare',
            message: `You're having a nightmare...`,
            logType: 'negative',
            statChanges: {
                money: 0,
                health: this.healthLoss,
                hunger: 0
            }
        };
    }

    getModalContent() {
        return {
            title: 'Nightmare',
            description: `You wake from a terrible nightmare, heart pounding (${this.healthLoss} health).`,
            choices: [
                {
                    label: 'Try to Sleep More',
                    value: 'continue',
                    variant: 'safe'
                },
                {
                    label: 'Give Up',
                    value: 'stop'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;
        this.applyStats(0, this.healthLoss, 0);

        if (choice === 'stop') {
            return {
                message: `Gave up trying to sleep. ${this.healthLoss} health.`,
                logType: 'negative',
                stopAction: true
            };
        }

        return {
            message: `Tried to sleep despite nightmare. ${this.healthLoss} health.`,
            logType: 'negative',
            stopAction: false
        };
    }
}
