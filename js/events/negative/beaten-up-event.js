// Beaten Up Event - Caught and attacked while stealing
class BeatenUpEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'high',        // 15% per hour
            severity: config.severity || 'high'     // -30 to -15 health
        };
        this.healthLoss = 0;
    }

    canTrigger(context) {
        // Only during steal action
        return this.isActionType('StealAction');
    }

    execute(context) {
        this.player = context.player;

        // Apply damage using EVENT_PRESETS.healthImpact
        const damageRange = this.getPresetRange('healthImpact', this.config.severity);
        this.healthLoss = this.random(...damageRange);

        this.applyStats(0, this.healthLoss, 0);  // Only health damage, no money/hunger

        return {
            type: 'beaten-up',
            message: `Caught and beaten up! Health ${this.healthLoss}.`,
            logType: 'negative'
        };
    }

    getModalContent() {
        return {
            title: "💥 Caught!",
            description: "Someone caught you stealing and beat you up!",
            choices: [
                {
                    label: "Flee",
                    value: "flee",
                    variant: "danger"
                }
            ]
        };
    }

    processChoice(choice, context) {
        // Already applied in execute(), force stop
        return {
            message: "You fled from the scene in pain.",
            logType: 'negative',
            stopAction: true  // Always stop the steal action
        };
    }
}
