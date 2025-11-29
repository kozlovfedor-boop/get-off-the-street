// Bonus tip event - extra payment from employer
class BonusTipEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'medium',
            bonus: config.bonus || 'medium'
        };
        this.tipAmount = 0;
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

        const bonusRange = this.getPresetRange('moneyGain', this.config.bonus);
        this.tipAmount = this.random(...bonusRange);

        return {
            type: 'bonus-tip',
            message: `Your employer noticed your hard work!`,
            logType: 'positive',
            statChanges: {
                money: this.tipAmount,
                health: 0,
                hunger: 0
            }
        };
    }

    getModalContent() {
        return {
            title: 'Bonus Tip!',
            description: `Your boss gave you a £${this.tipAmount} bonus for good work!`,
            choices: [
                {
                    label: 'Keep Working',
                    value: 'continue',
                    variant: 'safe'
                },
                {
                    label: 'Take a Break',
                    value: 'stop'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;
        this.applyStats(this.tipAmount, 0, 0);

        if (choice === 'stop') {
            return {
                message: `Received £${this.tipAmount} bonus and took a break.`,
                logType: 'positive',
                stopAction: true
            };
        }

        return {
            message: `Received £${this.tipAmount} bonus and kept working.`,
            logType: 'positive',
            stopAction: false
        };
    }
}
