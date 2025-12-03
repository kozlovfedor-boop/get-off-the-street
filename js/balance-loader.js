/**
 * Balance Loader
 *
 * Constructs actions and events from GAME_BALANCE configuration.
 * This eliminates the need for hardcoded action configurations in location files.
 */

class BalanceLoader {
    /**
     * Build an action instance from balance config
     * @param {string} actionId - Action identifier (e.g., 'work', 'sleep')
     * @param {object} config - Action configuration from GAME_BALANCE
     * @returns {BaseAction} Configured action instance
     */
    static buildAction(actionId, config) {
        const ActionClass = this.getActionClass(actionId);
        const actionConfig = {};

        // Map stat presets
        if (config.earnings) actionConfig.earnings = config.earnings;
        if (config.health) actionConfig.health = config.health;
        if (config.hunger) actionConfig.hunger = config.hunger;
        if (config.food) actionConfig.food = config.food;
        if (config.cost) actionConfig.cost = config.cost;
        if (config.reward) actionConfig.reward = config.reward;

        // Add time cost and XP
        if (config.timeCost !== undefined) actionConfig.timeCost = config.timeCost;
        if (config.xp !== undefined) actionConfig.xpReward = config.xp;

        // Add reputation effects
        if (config.reputation && Object.keys(config.reputation).length > 0) {
            actionConfig.reputationEffects = this.parseReputationEffects(config.reputation);
        }

        // Build events
        if (config.events && config.events.length > 0) {
            actionConfig.events = config.events.map(eventConfig => this.buildEvent(eventConfig));
        }

        return new ActionClass(actionConfig);
    }

    /**
     * Build an event instance from config
     * @param {object} config - Event configuration
     * @returns {BaseEvent} Configured event instance
     */
    static buildEvent(config) {
        const EventClass = this.getEventClass(config.type);
        const eventConfig = {};

        // Map event properties
        if (config.chance) eventConfig.chance = config.chance;
        if (config.severity) eventConfig.severity = config.severity;
        if (config.bonus) eventConfig.bonus = config.bonus;
        if (config.amount) eventConfig.amount = config.amount;

        // Add reputation effects
        if (config.reputation) {
            eventConfig.reputationEffects = this.parseReputationEffects(config.reputation);
        }

        return new EventClass(eventConfig);
    }

    /**
     * Parse reputation effects from config format
     * @param {object} reputation - Reputation config (e.g., { police: '-medium', locals: '+low' })
     * @returns {object} Parsed reputation effects
     */
    static parseReputationEffects(reputation) {
        const effects = {};

        for (const [faction, effect] of Object.entries(reputation)) {
            const positive = !effect.startsWith('-');
            const preset = effect.replace('+', '').replace('-', '');
            effects[faction] = {
                change: preset,
                positive: positive
            };
        }

        return effects;
    }

    /**
     * Get the action class for a given action ID
     * @param {string} actionId - Action identifier
     * @returns {Function} Action class constructor
     */
    static getActionClass(actionId) {
        const classMap = {
            'work': WorkAction,
            'panhandle': PanhandleAction,
            'steal': StealAction,
            'sleep': SleepAction,
            'food': FindFoodAction,
            'eat': EatAction,
            'buy_food': BuyFoodAction
        };

        return classMap[actionId] || BaseAction;
    }

    /**
     * Get the event class for a given event type
     * @param {string} eventType - Event type name
     * @returns {Function} Event class constructor
     */
    static getEventClass(eventType) {
        // Event classes are already defined globally
        return window[eventType] || BaseEvent;
    }

    /**
     * Load all actions for a location from balance config
     * @param {string} locationId - Location identifier (e.g., 'park', 'camden_town')
     * @returns {object} Object mapping action IDs to action instances
     */
    static loadLocationActions(locationId) {
        const locationConfig = GAME_BALANCE.locations[locationId];
        if (!locationConfig) {
            console.error(`Location ${locationId} not found in GAME_BALANCE`);
            return {};
        }

        const actions = {};
        for (const [actionId, actionConfig] of Object.entries(locationConfig)) {
            actions[actionId] = this.buildAction(actionId, actionConfig);
        }

        return actions;
    }

    /**
     * Check if an action is available based on balance config gating rules
     * @param {string} actionId - Action identifier
     * @param {object} actionConfig - Action configuration from GAME_BALANCE
     * @param {TimeManager} timeManager - Time manager instance
     * @param {Player} player - Player instance
     * @returns {object} { available: boolean, reason: string }
     */
    static checkActionAvailability(actionId, actionConfig, timeManager, player) {
        // Check time restrictions
        if (actionConfig.timeRestriction) {
            const times = actionConfig.timeRestriction.split(',');
            let inTimeRange = false;

            for (const timeRange of times) {
                const [start, end] = timeRange.split('-').map(Number);
                if (timeManager.isTimeBetween(start, end)) {
                    inTimeRange = true;
                    break;
                }
            }

            if (!inTimeRange) {
                return { available: false, reason: 'Not available at this time' };
            }
        }

        // Check reputation gating
        if (actionConfig.gating && player) {
            for (const [key, value] of Object.entries(actionConfig.gating)) {
                if (key === 'afford') {
                    // Affordability check
                    if (player.money < value) {
                        return { available: false, reason: `Need at least £${value}` };
                    }
                } else if (player.reputationManager) {
                    // Reputation tier check
                    const requiredTier = value.replace('+', '');
                    const currentTier = player.reputationManager.getTierName(key);
                    const blockedTiers = this.getBlockedTiers(requiredTier);

                    if (blockedTiers.includes(currentTier)) {
                        return { available: false, reason: `${key} reputation too low` };
                    }
                }
            }
        }

        return { available: true };
    }

    /**
     * Get list of tiers that are below the required tier
     * @param {string} requiredTier - Required tier name
     * @returns {string[]} Array of blocked tier names
     */
    static getBlockedTiers(requiredTier) {
        const tiers = ['Hated', 'Disliked', 'Neutral', 'Respected', 'Trusted'];
        const requiredIndex = tiers.indexOf(requiredTier);
        return tiers.slice(0, requiredIndex);
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.BalanceLoader = BalanceLoader;
}
