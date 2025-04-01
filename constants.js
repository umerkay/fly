// Flight Simulation Constants

export function setConstants(state) {
    state.constants = {
        // Physics Constants
        GRAVITY: 20.0,             // Increased slightly
        THRUST_FORCE: 50.0,        // Force multiplier for thrust
        MAX_THRUST: 300.0,         // Maximum available thrust
        REVERSE_THRUST_FORCE: 10.0,// Force for slowing down with 'S'
        DRAG_COEFFICIENT: 0.1,     // Increased air resistance
        LIFT_COEFFICIENT: 0.001,   // Reduced lift generation
        PITCH_SPEED: 0.1,          // Radians per second (Slightly increased responsiveness)
        ROLL_SPEED: 0.3,           // Radians per second

        // Landing and Takeoff Parameters
        MAX_SPEED_LANDING: 18.0,   // Slightly increased tolerance
        MAX_SINK_RATE_LANDING: 2.5,// Slightly increased tolerance
        TAKEOFF_SPEED: 12.0,       // Reduced slightly due to physics changes
        AIRBORNE_CONFIRMATION_TIME: 5.0, // Seconds required to be in air before considering truly airborne

        // Environment Settings
        GROUND_LEVEL: 0.5,         // Y position of the ground plane + runway height
        RUNWAY_WIDTH: 30,
        RUNWAY_LENGTH: 300
    };
}
