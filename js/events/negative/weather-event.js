// Weather event - rain/cold exposure
class WeatherEvent extends BaseEvent {
    constructor(config = {}) {
        super(config);
        this.config = {
            chance: config.chance || 'medium',
            severity: config.severity || 'low'
        };
    }

    canTrigger(context) {
        // Not at shelter (protected there)
        return !this.isAtLocation('shelter');
    }

    execute(context) {
        this.player = context.player;
        return {
            type: 'weather',
            message: `Sudden rain!`,
            logType: 'negative',
            statChanges: {
                money: 0,
                health: -5,
                hunger: -5
            }
        };
    }

    getModalContent() {
        return {
            title: 'Bad Weather',
            description: `It started raining. You're getting soaked and cold (-5 health, -5 hunger).`,
            choices: [
                {
                    label: 'Endure It',
                    value: 'continue'
                },
                {
                    label: 'Seek Shelter',
                    value: 'stop',
                    variant: 'safe'
                }
            ]
        };
    }

    processChoice(choice, context) {
        this.player = context.player;
        this.applyStats(0, -5, -5);

        if (choice === 'stop') {
            return {
                message: `Sought shelter from rain. -5 health, -5 hunger.`,
                logType: 'negative',
                stopAction: true
            };
        }

        return {
            message: `Endured the rain. -5 health, -5 hunger.`,
            logType: 'negative',
            stopAction: false
        };
    }
}
