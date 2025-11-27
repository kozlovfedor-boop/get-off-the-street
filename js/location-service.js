// Location Service - Manages location instances and travel between them
// Renamed from LocationManager to reflect its role as a service layer
class LocationService {
    constructor(timeManager) {
        this.timeManager = timeManager;
        this.currentLocation = 'park'; // Start at park

        // Linear location order for sequential travel
        this.locationOrder = ['shelter', 'park', 'camden-town', 'london-city'];

        // Create location instances using factory
        this.locations = {
            'shelter': createLocation('shelter'),
            'park': createLocation('park'),
            'camden-town': createLocation('camden-town'),
            'london-city': createLocation('london-city')
        };
    }

    // Get current location instance
    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }

    // Get location instance by ID
    getLocation(locationId) {
        return this.locations[locationId];
    }

    // Get all location instances
    getAllLocations() {
        return Object.values(this.locations);
    }

    // Get available destinations from current location
    getAvailableDestinations() {
        const current = this.getCurrentLocation();
        const travelTimes = current.getTravelTime();

        return Object.keys(travelTimes).map(destId => {
            const destLocation = this.locations[destId];
            return {
                id: destLocation.id,
                name: destLocation.name,
                description: destLocation.description,
                travelTime: travelTimes[destId]
            };
        });
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
            totalTime: distance * 0.5,  // 0.5 hour per hop (updated from 1)
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

        const destination = this.locations[destinationId];

        // Don't update location here - let game.js update it after animation completes
        return {
            success: true,
            timeCost: pathInfo.totalTime,
            destination: destination.name,
            destinationId: destinationId,
            path: pathInfo.path,              // Array of locations to pass through
            direction: pathInfo.direction,    // 'left' or 'right'
            hops: pathInfo.hops               // Number of location changes
        };
    }

    // Check if action is available at current location and time
    // Delegates to location instance
    isActionAvailable(action) {
        const location = this.getCurrentLocation();
        return location.isActionAvailable(action, this.timeManager);
    }

}
