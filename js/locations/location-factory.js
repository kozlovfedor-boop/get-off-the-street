// Location Factory - Creates location instances based on ID
// Factory pattern for creating location objects

/**
 * Creates a location instance based on location ID
 * @param {string} locationId - ID of location to create
 * @returns {BaseLocation} - Location instance
 * @throws {Error} - If locationId is unknown
 */
function createLocation(locationId) {
    switch(locationId) {
        case 'shelter':
            return new ShelterLocation();
        case 'park':
            return new ParkLocation();
        case 'camden-town':
            return new CamdenTownLocation();
        case 'london-city':
            return new LondonCityLocation();
        default:
            throw new Error(`Unknown location: ${locationId}`);
    }
}
