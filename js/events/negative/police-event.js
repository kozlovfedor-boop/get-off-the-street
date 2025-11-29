// Police Event - Caught while stealing
class PoliceEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'medium',  // Police encounter chance
            severity: config.severity || 'medium'  // Punishment severity
        };
    }

    canTrigger(context) {
        // Only during steal action
        return this.isActionType('StealAction');
    }

    execute(context) {
        // Apply police catch consequences
        const severityRange = CONFIG.EVENT_PRESETS.moneyLoss[this.config.severity];
        const fine = this.random(...severityRange);
        const actualFine = Math.min(fine, context.player.money);

        this.applyStats(-actualFine, -25, 0);  // Lose money and health

        return {
            type: 'police',
            message: `Caught by police! Lost £${actualFine} and got beaten. Health -25.`,
            logType: 'negative'
        };
    }

    getModalContent() {
        return {
            title: "⚠️ Police!",
            description: "You've been caught by the police while stealing!",
            choices: [
                {
                    label: "Accept punishment",
                    value: "accept",
                    variant: "danger"
                }
            ]
        };
    }

    processChoice(choice, context) {
        // Already applied in execute(), just log
        return {
            message: "You were arrested and fined.",
            logType: 'negative',
            stopAction: false
        };
    }
}
