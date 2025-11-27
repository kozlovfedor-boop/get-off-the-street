// monitor.js - Game Error Monitoring and State Tracking
// Provides programmatic error tracking for Chrome DevTools MCP integration

window.GameMonitor = {
  errors: [],
  warnings: [],

  init() {
    // Wrap console.error to capture all errors
    const originalError = console.error;
    console.error = (...args) => {
      this.errors.push({
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      originalError.apply(console, args);
    };

    // Wrap console.warn to capture all warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.warnings.push({
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalWarn.apply(console, args);
    };

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        message: `Unhandled Promise: ${event.reason}`,
        timestamp: new Date().toISOString()
      });
    });
  },

  getReport() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      gameState: window.game ? {
        isAnimating: window.game.isAnimating,
        gameOver: window.game.gameOver,
        victory: window.game.victory,
        player: {
          money: window.game.player.money,
          health: window.game.player.health,
          hunger: window.game.player.hunger,
          day: window.game.player.day
        },
        location: window.game.locationManager.currentLocation,
        time: window.game.timeManager.formatTime()
      } : null
    };
  },

  clear() {
    this.errors = [];
    this.warnings = [];
  }
};

// Auto-initialize monitoring on script load
window.GameMonitor.init();
console.log('[GameMonitor] Error tracking initialized');
