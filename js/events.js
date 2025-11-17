// Random events system
class EventManager {
    constructor() {
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

    // Trigger random event based on probability
    trigger(player) {
        const roll = Math.random();
        let cumulative = 0;

        for (const event of this.events) {
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

        // Fallback (should never happen if probabilities sum to 1)
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
