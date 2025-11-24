// Character Animation Manager
// Handles sprite animations for the homeless character

class CharacterAnimationManager {
    constructor(locationManager) {
        this.locationManager = locationManager;
        this.display = null;
        this.sprite = null;
        this.currentAnimation = 'idle';
        this.currentLocation = null;
    }

    // Initialize DOM references
    init() {
        this.display = document.getElementById('character-display');
        this.sprite = document.getElementById('character-sprite');

        if (!this.display || !this.sprite) {
            console.error('Character display elements not found');
            return;
        }

        // Set initial state
        this.updateLocation();
        this.setIdle();
    }

    // Update location background
    updateLocation() {
        if (!this.display) return;

        const location = this.locationManager.getCurrentLocation();
        this.currentLocation = location.id;
        this.display.setAttribute('data-location', location.id);
    }

    // Set character animation based on action type and direction
    setAnimation(actionType, direction = null) {
        if (!this.sprite) return;

        // Remove all animation classes
        this.sprite.className = 'character-sprite';

        // Add new animation class based on action and direction
        const animationClass = this.getAnimationClass(actionType, direction);
        this.sprite.classList.add(animationClass);
        this.currentAnimation = animationClass;
    }

    // Return to idle state
    setIdle() {
        if (!this.sprite) return;

        this.sprite.className = 'character-sprite';
        this.sprite.classList.add('idle');
        this.currentAnimation = 'idle';
    }

    // Map action types to animation classes
    // Only 3 animations: idle, walk-left, walk-right
    getAnimationClass(actionType, direction = null) {
        // Traveling uses directional walking animation
        if (actionType === 'traveling') {
            if (direction === 'left') {
                return 'walk-left';  // Row 2: Walk Left (8 frames)
            } else {
                return 'walk-right';  // Row 1: Walk Right (8 frames, default)
            }
        }

        // All other actions show idle animation
        return 'idle';  // Row 0: Idle (8 frames)
    }

    // Get current animation state (for debugging)
    getCurrentAnimation() {
        return this.currentAnimation;
    }

    // Get current location (for debugging)
    getCurrentLocation() {
        return this.currentLocation;
    }
}
