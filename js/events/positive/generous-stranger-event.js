// Generous stranger event - wealthy person donates during panhandling
class GenerousStrangerEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'low',
            bonus: config.bonus || 'high'
        };
        this.donationAmount = 0;
    }

    canTrigger(context) {
        // Only during panhandle action
        if (!this.isActionType('PanhandleAction')) {
            return false;
        }

        // More likely in wealthy areas (London City) during daytime
        if (this.isAtLocation('london-city') && context.timeManager.isDaytime()) {
            return true;
        }

        // Can happen elsewhere but less likely
        return !this.isAtLocation('shelter');
    }

    execute(context) {
        this.player = context.player;
        this.locationManager = context.locationManager;
        this.timeManager = context.timeManager;
        this.actionContext = context.action;

        // Calculate donation based on config
        const bonusRange = this.getPresetRange('moneyGain', this.config.bonus);
        this.donationAmount = this.random(...bonusRange);

        return {
            type: 'generous-stranger',
            message: `A well-dressed stranger approaches you!`,
            logType: 'positive',
            statChanges: {
                money: this.donationAmount,
                health: 0,
                hunger: 0
            }
        };
    }

    getModalContent() {
        return {
            title: 'Generous Stranger',
            description: `A wealthy-looking person just gave you £${this.donationAmount}! "Good luck to you," they say.`,
            choices: [
                {
                    label: 'Thank Them & Continue',
                    value: 'continue',
                    variant: 'safe'
                },
                {
                    label: 'Thank Them & Leave',
                    value: 'stop'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;

        // Apply the donation
        this.applyStats(this.donationAmount, 0, 0);

        if (choice === 'stop') {
            return {
                message: `Received £${this.donationAmount} and decided to stop panhandling.`,
                logType: 'positive',
                stopAction: true
            };
        }

        return {
            message: `Received £${this.donationAmount} and continued panhandling.`,
            logType: 'positive',
            stopAction: false
        };
    }
}
