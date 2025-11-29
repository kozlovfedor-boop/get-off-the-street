// Sickness event - catch cold/flu
class SicknessEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'medium',
            severity: config.severity || 'medium'
        };
        this.healthLoss = 0;
    }

    canTrigger(context) {
        // Not at shelter (safer there)
        if (this.isAtLocation('shelter')) {
            return false;
        }

        return true;
    }

    execute(context) {
        this.player = context.player;
        this.locationManager = context.locationManager;
        this.timeManager = context.timeManager;
        this.actionContext = context.action;

        const healthRange = this.getPresetRange('healthImpact', this.config.severity);
        this.healthLoss = this.random(...healthRange);

        return {
            type: 'sickness',
            message: `You feel ill...`,
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
            title: 'Feeling Sick',
            description: `You're feeling very ill. Your body aches (${this.healthLoss} health).`,
            choices: [
                {
                    label: 'Push Through',
                    value: 'continue',
                    variant: 'danger'
                },
                {
                    label: 'Stop & Rest',
                    value: 'stop',
                    variant: 'safe'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;
        this.applyStats(0, this.healthLoss, 0);

        if (choice === 'stop') {
            return {
                message: `Stopped to rest. ${this.healthLoss} health.`,
                logType: 'negative',
                stopAction: true
            };
        }

        return {
            message: `Pushed through illness. ${this.healthLoss} health.`,
            logType: 'negative',
            stopAction: false
        };
    }
}
