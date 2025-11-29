// Event Coordinator - Manages event triggering and user interaction
class EventCoordinator {
    constructor(ui) {
        this.ui = ui;
    }

    /**
     * Evaluate and trigger action-specific events
     * Uses pick-one-randomly probability model
     */
    evaluateEvents(action, hourIndex, totalHours, context) {
        if (!action.config.events || action.config.events.length === 0) {
            console.log(`[Events] No events configured for action ${action.constructor.name}`);
            return null;
        }

        const events = action.config.events;
        console.log(`[Events] Action has ${events.length} events configured`);

        // Set runtime dependencies on all events BEFORE checking canTrigger
        events.forEach(event => {
            event.player = context.player;
            event.locationManager = context.locationManager;
            event.timeManager = context.timeManager;
            event.actionContext = action;
        });

        // Build context object
        const fullContext = {
            ...context,
            action: action,
            hourIndex: hourIndex,
            totalHours: totalHours
        };

        // Filter events by availability (location/time/conditions)
        const availableEvents = events.filter(event => {
            try {
                const canTrigger = event.canTrigger(fullContext);
                console.log(`[Events] ${event.constructor.name} canTrigger: ${canTrigger}`);
                return canTrigger;
            } catch (error) {
                console.error('Error checking event availability:', error);
                return false;
            }
        });

        console.log(`[Events] ${availableEvents.length} events available after filtering`);

        if (availableEvents.length === 0) {
            return null;
        }

        // Roll for each event independently, first success triggers
        for (const event of availableEvents) {
            const chance = event.getChance();
            const roll = Math.random();
            console.log(`[Events] ${event.constructor.name}: roll=${roll.toFixed(3)}, chance=${chance} => ${roll < chance ? 'TRIGGER' : 'skip'}`);

            if (roll < chance) {
                // This event triggers!
                try {
                    const result = event.execute(fullContext);
                    console.log(`[Events] Event triggered: ${event.constructor.name}`);
                    return {
                        event: event,
                        result: result,
                        modalContent: event.getModalContent()
                    };
                } catch (error) {
                    console.error('Error executing event:', error);
                    return null;
                }
            }
        }

        console.log(`[Events] No event triggered this hour`);
        return null;
    }

    /**
     * Handle event modal interaction
     * Shows modal, waits for user choice, processes choice
     */
    async handleEventModal(eventData, action, context) {
        // Determine event type from logType
        const eventType = this.getEventTypeFromLogType(eventData.result.logType);

        // Show inline event UI and wait for user choice
        const choice = await this.ui.showInlineEvent(eventData.modalContent, eventType);

        try {
            // Process user's choice
            const consequence = eventData.event.processChoice(choice, {
                ...context,
                action: action
            });

            return {
                stopAction: consequence.stopAction || false,
                message: consequence.message,
                logType: consequence.logType || 'neutral'
            };
        } catch (error) {
            console.error('Error processing event choice:', error);
            return {
                stopAction: false,
                message: 'Event processing error',
                logType: 'negative'
            };
        }
    }

    /**
     * Map event logType to visual event type
     * @param {string} logType - 'positive', 'negative', 'neutral'
     * @returns {string} - 'positive', 'negative', 'neutral', 'info'
     */
    getEventTypeFromLogType(logType) {
        const typeMap = {
            'positive': 'positive',
            'negative': 'negative',
            'neutral': 'neutral'
        };
        return typeMap[logType] || 'neutral';
    }

    /**
     * Evaluate events and handle modal if triggered
     * Convenience method combining evaluation + modal handling
     */
    async evaluateAndHandleEvents(action, hourIndex, totalHours, context) {
        if (!action) return null;

        const eventData = this.evaluateEvents(action, hourIndex, totalHours, context);

        if (eventData) {
            return await this.handleEventModal(eventData, action, context);
        }

        return null;
    }
}
