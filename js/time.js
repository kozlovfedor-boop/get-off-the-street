// Time management system
class TimeManager {
    constructor(initialHour = 6) {
        this.currentHour = initialHour; // 0-23
    }

    // Advance time by hours
    advanceTime(hours) {
        this.currentHour += hours;

        // Calculate day rollover
        const daysElapsed = Math.floor(this.currentHour / 24);
        this.currentHour = this.currentHour % 24;

        return daysElapsed;
    }

    // Get current hour
    getHour() {
        return this.currentHour;
    }

    // Check if time is within range (inclusive)
    isTimeBetween(startHour, endHour) {
        if (startHour <= endHour) {
            // Normal range (e.g., 8-18)
            return this.currentHour >= startHour && this.currentHour < endHour;
        } else {
            // Wraps midnight (e.g., 18-6 means 6pm to 6am)
            return this.currentHour >= startHour || this.currentHour < endHour;
        }
    }

    // Check if it's daytime
    isDaytime() {
        return this.isTimeBetween(6, 18); // 6am - 6pm
    }

    // Check if it's nighttime
    isNighttime() {
        return !this.isDaytime();
    }

    // Get time period as string
    getTimePeriod() {
        if (this.currentHour >= 6 && this.currentHour < 12) return "Morning";
        if (this.currentHour >= 12 && this.currentHour < 18) return "Afternoon";
        if (this.currentHour >= 18 && this.currentHour < 22) return "Evening";
        return "Night";
    }

    // Format time for display (24-hour)
    formatTime() {
        const hours = Math.floor(this.currentHour);
        const minutes = Math.round((this.currentHour - hours) * 60);
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        return `${hoursStr}:${minutesStr}`;
    }

    // Format time for display (12-hour with AM/PM)
    formatTime12Hour() {
        const hours = Math.floor(this.currentHour);
        const minutes = Math.round((this.currentHour - hours) * 60);
        const hour12 = hours === 0 ? 12 :
                      hours > 12 ? hours - 12 : hours;
        const ampm = hours < 12 ? 'AM' : 'PM';
        const minutesStr = minutes.toString().padStart(2, '0');
        return `${hour12}:${minutesStr} ${ampm}`;
    }

    // Reset time to specific hour
    setTime(hour) {
        this.currentHour = hour % 24;
    }

    // Get state for saving
    getState() {
        return {
            currentHour: this.currentHour
        };
    }

    // Load state
    loadState(state) {
        this.currentHour = state.currentHour;
    }
}
