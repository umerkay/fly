import * as THREE from 'three';
// Flight Simulation Controls
// Import constants
// import { THRUST_FORCE, MAX_THRUST, REVERSE_THRUST_FORCE, PITCH_SPEED, ROLL_SPEED } from './constants.js';

export function setupControls(keysPressed) {
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true;
        keysPressed[event.code] = true; // Store by code for Arrow Keys, etc.
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false;
        keysPressed[event.code] = false;
    });
}

export function handleInput(state, deltaTime, keysPressed, aircraft, velocity, angularVelocity, isOnGround, thrust) {
    // Thrust Control
    // console.log(keysPressed);
    if (keysPressed['w']) { // W = Increase Thrust
        thrust += state.constants.THRUST_FORCE * 0.5 * deltaTime; // Apply thrust increase
        thrust = Math.min(thrust, state.constants.MAX_THRUST); // Cap thrust at maximum
    } else if (keysPressed['s']) { // S = Decrease Thrust / Apply Brake/Reverse
        thrust -= (state.constants.THRUST_FORCE * 0.8 + state.constants.REVERSE_THRUST_FORCE) * deltaTime;
    } else {
        // Auto-reduce thrust when no thrust inputs are given
        // const thrustDecayRate = THRUST_FORCE * 0.1; // 10% of thrust force per second
        // if (thrust > 0) {
        //     thrust -= thrustDecayRate * deltaTime;
        //     thrust = Math.max(0, thrust); // Don't go below zero
        // } else if (thrust < 0) {
        //     thrust += thrustDecayRate * deltaTime;
        //     thrust = Math.min(0, thrust); // Don't go above zero
        // }
    }
    thrust = Math.max(-state.constants.REVERSE_THRUST_FORCE * 0.2, thrust);

    // --- Simplified rotation controls with guard checks ---
    if (aircraft) {
        if (keysPressed['ArrowUp']) {
            //only allow pitch up if pitch is less than 15 degrees
        //     if(isOnGround) {
        //     if (aircraft.rotation.x < -0.20) {
        //         aircraft.rotation.x = -0.20;
        //     } else if (aircraft.rotation.x > -0.20) {
        //         aircraft.rotateX(-PITCH_SPEED * deltaTime);
        //     }
        // } else
            aircraft.rotateX(-state.constants.PITCH_SPEED * deltaTime);
        } else if (keysPressed['ArrowDown']) {
            //dont allow pitch down on ground if pitch greater than zero
            // if (isOnGround) {
            //     // aircraft.rotation.x = 0;
            // } else {
                aircraft.rotateX(state.constants.PITCH_SPEED * deltaTime);
            // }
            // aircraft.rotateX(PITCH_SPEED * deltaTime);
        }
        // else {
        //     // Gradually return to neutral pitch
        //     aircraft.rotation.x = THREE.MathUtils.lerp(aircraft.rotation.x, 0, 0.01);
        // }
        if (keysPressed['ArrowLeft']) {
            aircraft.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), state.constants.ROLL_SPEED * deltaTime);
        } else if (keysPressed['ArrowRight']) {
            aircraft.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -state.constants.ROLL_SPEED * deltaTime);
        }
    } else {
        console.warn('Aircraft or aircraft.group is undefined.', state);
    }
    return thrust;
}
