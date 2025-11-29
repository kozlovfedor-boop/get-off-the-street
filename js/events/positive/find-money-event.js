// Find money event - discover money on the ground
class FindMoneyEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'low',
            amount: config.amount || 'low'
        };
        this.foundAmount = 0;
    }

    canTrigger(context) {
        // Can find money anywhere except shelter
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

        // Calculate found amount based on config
        const amountRange = this.getPresetRange('moneyGain', this.config.amount);
        this.foundAmount = this.random(...amountRange);

        return {
            type: 'find-money',
            message: `You spotted some money on the ground!`,
            logType: 'positive',
            statChanges: {
                money: this.foundAmount,
                health: 0,
                hunger: 0
            }
        };
    }

    getModalContent() {
        return {
            title: 'Found Money!',
            description: `You found £${this.foundAmount} on the ground! Lucky find.`,
            choices: [
                {
                    label: 'Continue',
                    value: 'continue',
                    variant: 'safe'
                },
                {
                    label: 'Stop Action',
                    value: 'stop'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;

        // Apply the money gain
        this.applyStats(this.foundAmount, 0, 0);

        if (choice === 'stop') {
            return {
                message: `Picked up £${this.foundAmount} and stopped.`,
                logType: 'positive',
                stopAction: true
            };
        }

        return {
            message: `Picked up £${this.foundAmount} and continued.`,
            logType: 'positive',
            stopAction: false
        };
    }
}
