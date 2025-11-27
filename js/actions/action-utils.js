// Shared utility functions for actions
const ActionUtils = {
    applyStarvation(player) {
        if (player.hunger < CONFIG.STARVATION_THRESHOLD) {
            const healthLoss = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
            player.modifyHealth(-healthLoss);
            return {
                message: `You're starving! Health -${healthLoss}.`,
                logType: 'negative'
            };
        }
        return null;
    }
};
