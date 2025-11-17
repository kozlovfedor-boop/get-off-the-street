// Random events system
class EventManager {
    constructor(locationManager, timeManager) {
        this.locationManager = locationManager;
        this.timeManager = timeManager;
        this.events = [
            {
                id: 'find-money',
                message: "You found some spare change on the ground!",
                effect: (player) => {
                    const amount = this.random(5, 20);
                    player.addMoney(amount);
                    return `+$${amount}`;
                },
                chance: 0.15
            },
            {
                id: 'get-robbed',
                message: "Someone stole your belongings while you slept!",
                effect: (player) => {
                    const loss = Math.min(this.random(10, 40), player.money);
                    player.removeMoney(loss);
                    return `-$${loss}`;
                },
                chance: 0.10
            },
            {
                id: 'get-sick',
                message: "You caught a cold sleeping outside.",
                effect: (player) => {
                    player.modifyHealth(-15);
                    return "-15 health";
                },
                chance: 0.12
            },
            {
                id: 'receive-food',
                message: "A kind stranger gave you some food.",
                effect: (player) => {
                    player.modifyHunger(30);
                    return "+30 hunger";
                },
                chance: 0.10
            },
            {
                id: 'nothing',
                message: "The day passes uneventfully.",
                effect: () => "",
                chance: 0.53
            }
        ];
    }

    // Generate random number between min and max (inclusive)
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Trigger random event based on probability (filtered by location/time)
    trigger(player) {
        const location = this.locationManager.getCurrentLocation();
        const hour = this.timeManager.getHour();
        const isNight = this.timeManager.isNighttime();

        // Filter events based on location and time
        let availableEvents = this.events.filter(event => {
            // Skip robbery if not at risky location
            if (event.id === 'get-robbed') {
                return location.id === 'park' && isNight;
            }
            // Skip sickness more often at shelter
            if (event.id === 'get-sick') {
                return location.id !== 'shelter';
            }
            // Generous strangers more common in rich areas during day
            if (event.id === 'receive-food') {
                return location.id === 'london-city' && !isNight;
            }
            // Find money more likely in busy areas
            if (event.id === 'find-money') {
                return location.id !== 'shelter';
            }
            return true;
        });

        // Recalculate probabilities
        const totalChance = availableEvents.reduce((sum, e) => sum + e.chance, 0);
        const roll = Math.random() * totalChance;
        let cumulative = 0;

        for (const event of availableEvents) {
            cumulative += event.chance;
            if (roll <= cumulative) {
                const result = event.effect(player);
                return {
                    message: event.message,
                    result: result,
                    id: event.id
                };
            }
        }

        // Fallback
        return null;
    }

    // Add new event
    addEvent(event) {
        this.events.push(event);
    }

    // Remove event by id
    removeEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
    }

    // Get event by id
    getEvent(id) {
        return this.events.find(e => e.id === id);
    }
}
