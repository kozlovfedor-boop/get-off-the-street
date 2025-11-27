// Base Location Class - Abstract base class for all locations
// All specific location classes (ShelterLocation, ParkLocation, etc.) extend this class

class BaseLocation {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.actions = {};  // Subclasses populate this with action instances
    }

    // Abstract methods to override in subclasses
    // These define location-specific behavior and data

    /**
     * Returns array of available action IDs at this location
     * @returns {string[]} - e.g., ['sleep', 'eat', 'work']
     */
    getActions() {
        return Object.keys(this.actions);
    }

    /**
     * Returns action instance for execution
     * @param {string} actionId - Action type to get
     * @returns {BaseAction|null} - Action instance or null if not available
     */
    getAction(actionId) {
        return this.actions[actionId] || null;
    }

    /**
     * Returns travel time map to other locations
     * @returns {Object} - e.g., {'park': 0.5, 'shelter': 1}
     */
    getTravelTime() {
        return {};
    }

    /**
     * Checks if action is available at this location at current time
     * @param {string} action - Action type to check
     * @param {TimeManager} timeManager - Time manager for time-based checks
     * @returns {Object} - {available: boolean, reason?: string}
     */
    isActionAvailable(action, timeManager) {
        if (!this.actions[action]) {
            return { available: false, reason: `Can't ${action} here` };
        }
        return { available: true };
    }
}
