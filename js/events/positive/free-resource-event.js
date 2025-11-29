// Free resource event - find food or supplies
class FreeResourceEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'low',
            amount: config.amount || 'medium'
        };
        this.hungerGain = 0;
    }

    canTrigger(context) {
        // Can find food at park or camden, not in wealthy areas or shelter
        return this.isAtAnyLocation(['park', 'camden-town']);
    }

    execute(context) {
        this.player = context.player;
        const hungerRange = this.getPresetRange('hungerGain', this.config.amount);
        this.hungerGain = this.random(...hungerRange);

        return {
            type: 'free-resource',
            message: `You found some discarded food!`,
            logType: 'positive',
            statChanges: {
                money: 0,
                health: 0,
                hunger: this.hungerGain
            }
        };
    }

    getModalContent() {
        return {
            title: 'Found Food',
            description: `You found edible food that was thrown away (+${this.hungerGain} hunger).`,
            choices: [
                {
                    label: 'Continue',
                    value: 'continue',
                    variant: 'safe'
                },
                {
                    label: 'Stop',
                    value: 'stop'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;
        this.applyStats(0, 0, this.hungerGain);

        if (choice === 'stop') {
            return {
                message: `Ate the food (+${this.hungerGain} hunger) and stopped.`,
                logType: 'positive',
                stopAction: true
            };
        }

        return {
            message: `Ate the food (+${this.hungerGain} hunger) and continued.`,
            logType: 'positive',
            stopAction: false
        };
    }
}
