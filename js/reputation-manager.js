// Reputation Manager - Tracks player standing with 4 factions
class ReputationManager {
    constructor() {
        // Faction scores (0-100 scale, 50 = neutral)
        this.factions = {
            police: CONFIG.INITIAL_STATS.reputation.police,
            locals: CONFIG.INITIAL_STATS.reputation.locals,
            shelter: CONFIG.INITIAL_STATS.reputation.shelter,
            business: CONFIG.INITIAL_STATS.reputation.business
        };
    }

    // Modify reputation for a faction
    modifyReputation(factionId, amount) {
        if (!this.factions.hasOwnProperty(factionId)) {
            console.warn(`Unknown faction: ${factionId}`);
            return;
        }

        this.factions[factionId] += amount;
        this.clampReputation(factionId);
    }

    // Get current reputation score
    getReputation(factionId) {
        return this.factions[factionId] || 50;
    }

    // Get reputation tier object
    getTier(factionId) {
        const score = this.getReputation(factionId);
        const tiers = CONFIG.REPUTATION_SYSTEM.TIERS;

        for (const tier of tiers) {
            if (score >= tier.min && score <= tier.max) {
                return tier;
            }
        }

        // Fallback to neutral
        return tiers[2]; // Neutral tier
    }

    // Get reputation tier name
    getTierName(factionId) {
        return this.getTier(factionId).name;
    }

    // Check if player can perform action based on reputation tier
    canPerformAction(factionId, requiredTier) {
        const currentTier = this.getTier(factionId);
        const tiers = CONFIG.REPUTATION_SYSTEM.TIERS;

        // Find tier indices
        const currentIndex = tiers.findIndex(t => t.name === currentTier.name);
        const requiredIndex = tiers.findIndex(t => t.name === requiredTier);

        return currentIndex >= requiredIndex;
    }

    // Get outcome modifier for a stat type based on reputation tier
    getOutcomeModifier(factionId, modifierType) {
        const tier = this.getTier(factionId);
        const modifiers = CONFIG.REPUTATION_SYSTEM.TIER_MODIFIERS[modifierType];

        if (!modifiers) {
            console.warn(`Unknown modifier type: ${modifierType}`);
            return 1.0;
        }

        return modifiers[tier.name] || 1.0;
    }

    // Get event chance modifier based on reputation tier
    getEventChanceModifier(factionId) {
        return this.getOutcomeModifier(factionId, 'eventChance');
    }

    // Clamp reputation to valid range (0-100)
    clampReputation(factionId) {
        this.factions[factionId] = Math.max(0, Math.min(100, this.factions[factionId]));
    }

    // Reset all reputations to neutral (50)
    reset() {
        const initial = CONFIG.INITIAL_STATS.reputation;
        this.factions = {
            police: initial.police,
            locals: initial.locals,
            shelter: initial.shelter,
            business: initial.business
        };
    }

    // Get current state for serialization (save/load)
    getState() {
        return {
            police: this.factions.police,
            locals: this.factions.locals,
            shelter: this.factions.shelter,
            business: this.factions.business
        };
    }

    // Load state from serialized data
    loadState(state) {
        if (!state) return;

        this.factions.police = state.police !== undefined ? state.police : 50;
        this.factions.locals = state.locals !== undefined ? state.locals : 50;
        this.factions.shelter = state.shelter !== undefined ? state.shelter : 50;
        this.factions.business = state.business !== undefined ? state.business : 50;

        // Clamp all loaded values
        Object.keys(this.factions).forEach(factionId => {
            this.clampReputation(factionId);
        });
    }
}
