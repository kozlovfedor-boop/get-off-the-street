// Shared utility functions for actions
const ActionUtils = {
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    applyStarvation(player) {
        if (player.hunger < CONFIG.STARVATION_THRESHOLD) {
            const healthLoss = this.random(5, 12);
            player.modifyHealth(-healthLoss);
            return {
                message: `You're starving! Health -${healthLoss}.`,
                logType: 'negative'
            };
        }
        return null;
    }
};
