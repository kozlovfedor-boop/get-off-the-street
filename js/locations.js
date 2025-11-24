// Location management system
class LocationManager {
    constructor(timeManager) {
        this.timeManager = timeManager;
        this.currentLocation = 'park'; // Start at park

        // Linear location order for sequential travel
        this.locationOrder = ['shelter', 'park', 'camden-town', 'london-city'];

        // Define all locations
        this.locations = {
            'london-city': {
                id: 'london-city',
                name: 'London City',
                description: 'The wealthy business district. High pay, high risk.',
                actions: ['work', 'panhandle', 'steal', 'rest'],
                travelTime: {
                    'camden-town': 1  // Only adjacent: Camden Town
                }
            },
            'camden-town': {
                id: 'camden-town',
                name: 'Camden Town',
                description: 'Industrial area with factories and warehouses.',
                actions: ['work', 'panhandle', 'steal', 'rest'],
                travelTime: {
                    'park': 1,           // Adjacent: Park
                    'london-city': 1     // Adjacent: London City
                }
            },
            'shelter': {
                id: 'shelter',
                name: 'Homeless Shelter',
                description: 'Safe place to sleep and eat. Open 6pm-8am.',
                actions: ['sleep', 'eat'],
                travelTime: {
                    'park': 1  // Only adjacent: Park
                }
            },
            'park': {
                id: 'park',
                name: 'City Park',
                description: 'Public park. Free but risky at night.',
                actions: ['sleep', 'panhandle', 'food'],
                travelTime: {
                    'shelter': 1,        // Adjacent: Shelter
                    'camden-town': 1     // Adjacent: Camden Town
                }
            }
        };
    }

    // Get current location object
    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }

    // Get location by ID
    getLocation(locationId) {
        return this.locations[locationId];
    }

    // Get all locations
    getAllLocations() {
        return Object.values(this.locations);
    }

    // Get available destinations from current location
    getAvailableDestinations() {
        const current = this.getCurrentLocation();
        return Object.keys(current.travelTime).map(destId => ({
            ...this.locations[destId],
            travelTime: current.travelTime[destId]
        }));
    }

    // Calculate path and total time between two locations
    calculatePath(fromId, toId) {
        const fromIndex = this.locationOrder.indexOf(fromId);
        const toIndex = this.locationOrder.indexOf(toId);

        if (fromIndex === -1 || toIndex === -1) {
            return null;
        }

        if (fromIndex === toIndex) {
            return { path: [fromId], totalTime: 0, hops: 0 };
        }

        const path = [];
        const distance = Math.abs(toIndex - fromIndex);

        if (toIndex > fromIndex) {
            // Travel forward (right)
            for (let i = fromIndex; i <= toIndex; i++) {
                path.push(this.locationOrder[i]);
            }
        } else {
            // Travel backward (left)
            for (let i = fromIndex; i >= toIndex; i--) {
                path.push(this.locationOrder[i]);
            }
        }

        return {
            path: path,           // Array of location IDs to pass through
            totalTime: distance,  // 1 hour per hop
            hops: distance,       // Number of location changes
            direction: toIndex > fromIndex ? 'right' : 'left'  // Travel direction
        };
    }

    // Travel to a new location
    travel(destinationId) {
        const pathInfo = this.calculatePath(this.currentLocation, destinationId);

        if (!pathInfo || pathInfo.totalTime === 0) {
            return { success: false, message: "Can't travel there" };
        }

        // Don't update location here - let game.js update it after animation completes
        return {
            success: true,
            timeCost: pathInfo.totalTime,
            destination: this.locations[destinationId].name,
            destinationId: destinationId,
            path: pathInfo.path,              // Array of locations to pass through
            direction: pathInfo.direction,    // 'left' or 'right'
            hops: pathInfo.hops               // Number of location changes
        };
    }

    // Check if action is available at current location and time
    isActionAvailable(action) {
        const location = this.getCurrentLocation();
        const hour = this.timeManager.getHour();

        // Check if action exists for this location
        if (!location.actions.includes(action)) {
            return { available: false, reason: `Can't ${action} here` };
        }

        // Time-based restrictions
        switch (action) {
            case 'work':
                if (location.id === 'london-city') {
                    // London City: 8am-6pm
                    if (!this.timeManager.isTimeBetween(8, 18)) {
                        return { available: false, reason: 'Businesses are closed' };
                    }
                } else if (location.id === 'camden-town') {
                    // Camden Town: 6am-10pm
                    if (!this.timeManager.isTimeBetween(6, 22)) {
                        return { available: false, reason: 'Factories are closed' };
                    }
                }
                break;

            case 'sleep':
                if (location.id === 'shelter') {
                    // Shelter: 6pm-8am only
                    if (!this.timeManager.isTimeBetween(18, 8)) {
                        return { available: false, reason: 'Shelter is closed' };
                    }
                }
                break;

            case 'eat':
                if (location.id === 'shelter') {
                    // Meal times: 6-8pm (dinner) or 6-8am (breakfast)
                    const isDinnerTime = this.timeManager.isTimeBetween(18, 20);
                    const isBreakfastTime = this.timeManager.isTimeBetween(6, 8);
                    if (!isDinnerTime && !isBreakfastTime) {
                        return { available: false, reason: 'Not meal time (6-8am or 6-8pm)' };
                    }
                }
                break;
        }

        return { available: true };
    }

    // Get location-specific risk modifier
    getRiskModifier(action) {
        const location = this.getCurrentLocation();

        if (action === 'steal') {
            if (location.id === 'london-city') return 0.30; // 30% police chance
            if (location.id === 'camden-town') return 0.15; // 15% police chance
            if (location.id === 'park') return 0.05; // 5% police chance
        }

        if (action === 'sleep' && location.id === 'park') {
            // Robbery risk at park at night
            if (this.timeManager.isNighttime()) return 0.25; // 25% robbery chance
            return 0.05; // 5% during day
        }

        return 0;
    }

    // Get location-specific pay modifier
    getPayModifier() {
        const location = this.getCurrentLocation();

        if (location.id === 'london-city') return 1.5; // 50% more pay
        if (location.id === 'camden-town') return 1.0; // Normal pay
        return 0.5; // Reduced pay elsewhere
    }

    // Check if shelter has capacity (random chance of being turned away late)
    checkShelterCapacity() {
        const hour = this.timeManager.getHour();

        // After 10pm, 20% chance of being turned away
        if (hour >= 22 || hour < 6) {
            return Math.random() > 0.20;
        }

        return true; // Always has room before 10pm
    }

    // Get state for saving
    getState() {
        return {
            currentLocation: this.currentLocation
        };
    }

    // Load state
    loadState(state) {
        this.currentLocation = state.currentLocation;
    }
}
