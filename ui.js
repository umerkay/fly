import * as THREE from 'three';

// Import constants
// import { THRUST_FORCE, MAX_THRUST, REVERSE_THRUST_FORCE, PITCH_SPEED, ROLL_SPEED } from './constants.js';

import { toggleNightMode } from './night.js';
// Flight Simulation UI Elements and Functions

// UI Element References
export const speedElement = document.getElementById('speed');
export const altitudeElement = document.getElementById('altitude');
export const pitchElement = document.getElementById('pitch');
export const rollElement = document.getElementById('roll');
export const bearingElement = document.getElementById('heading-label');
export const messageElement = document.getElementById('message');
export const restartButton = document.getElementById('restartButton');

// Gauge Elements
export const thrustBar = document.getElementById('thrust-bar');
export const speedNeedle = document.getElementById('speed-needle');
export const compassRose = document.querySelector('.compass-rose');
export const speedometer = document.getElementById('speed-value');
// export const headingLabel

// Autopilot Toggle
// const autopilotToggle = document.getElementById('autopilotToggle');
// window.autopilotEnabled = autopilotToggle.checked;
// autopilotToggle.addEventListener('change', (e) => {
    // window.autopilotEnabled = e.target.checked;
    // ...optional: update UI feedback...
// });

export const addListeners = (state) => {

    // document.addEventListener('DOMContentLoaded', () => {
        // ...existing UI initialization...
        const nightmodeButton = document.getElementById('nightmodeButton');
        nightmodeButton.addEventListener('click', () => {
            // Assumes 'state' is accessible globally or passed in some way
            toggleNightMode(state);
        });

        // Updated toggle button for engine on/off
        const engineOffButton = document.getElementById('engineOffButton');
        engineOffButton.addEventListener('click', () => {
            state.aircraft.engineOff = !state.aircraft.engineOff;
            engineOffButton.textContent = state.aircraft.engineOff ? "Engine On" : "Engine Off";
        });

        // New button for park brakes (toggle)
        const parkBrakesButton = document.getElementById('parkBrakesButton');
        parkBrakesButton.addEventListener('click', () => {
            state.aircraft.parkBrakes = !state.aircraft.parkBrakes;
            parkBrakesButton.textContent = state.aircraft.parkBrakes ? "Release Brakes" : "Park Brakes";
        });

        // New pause button listener
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.addEventListener('click', () => {
            state.isPaused = !state.isPaused;
            pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
        });
        pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
    // });
}

// Update UI with current flight data
let lastAltitude = 0;
let lastUpdateTime = performance.now();

export function updateUI(state, velocity, aircraft, bearing, thrust) {
    const speed = velocity.length();
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = currentTime;

    const altitude = Math.max(0, aircraft.position.y - aircraft.children[1]?.geometry.parameters.height / 2 - 0.05);
    const verticalSpeed = deltaTime > 0 ? (altitude - lastAltitude) / deltaTime : 0; // ft/s
    lastAltitude = altitude;

    // Calculate Pitch and Roll from Quaternion
    const euler = new THREE.Euler().setFromQuaternion(aircraft.quaternion, 'YXZ'); // YXZ order is often suitable for aircraft
    const pitch = THREE.MathUtils.radToDeg(euler.x);
    const roll = THREE.MathUtils.radToDeg(euler.z);
    
    // Update text displays
    // speedElement.textContent = speed.toFixed(2);
    // altitudeElement.textContent = altitude.toFixed(2);
    // pitchElement.textContent = pitch.toFixed(2);
    // rollElement.textContent = roll.toFixed(2);
    
    // Update bearing display
    if (bearingElement) {
        bearingElement.textContent = bearing.toFixed(2); // Show bearing with two decimal places
    }

    // Calculate thrust percentage based on MAX_THRUST
    const thrustPercentage = Math.round((thrust / state.constants.MAX_THRUST) * 100);
    
    // Update thrust text display
    const thrustElement = document.getElementById('thrust-value');
    if (thrustElement) {
        thrustElement.textContent = `${thrustPercentage}%`;
        
        // Optional: color coding for thrust levels
        if (thrustPercentage > 80) {
            thrustElement.style.color = 'red';
        } else if (thrustPercentage > 50) {
            thrustElement.style.color = 'orange';
        } else {
            thrustElement.style.color = 'white';
        }
    }
    
    // Update thrust bar
    if (thrustBar) {
        thrustBar.style.height = `${100 - Math.max(0, thrustPercentage)}%`;
    }
    
    // Update speedometer (180 degrees rotation from 0-100)
    if (speedNeedle) {
        // Map speed to 0-180 degrees rotation (max speed 100)
        const maxDisplaySpeed = 50;
        const speedRotation = speed / maxDisplaySpeed * 250 - 125;
        speedNeedle.style.transform = `translateX(-50%) rotate(${speedRotation}deg)`;
    }

    if (speedometer) {
        speedometer.textContent = `${speed.toFixed(2)}`;
    }
    
    // Update compass (rotate the rose in the opposite direction of bearing)
    if (compassRose) {
        compassRose.style.transform = `rotate(${bearing}deg)`;
    }

    // Update attitude indicator (Artificial Horizon)
    const horizonElement = document.getElementById('horizon');
    if (horizonElement) {
        // For pitch: -ve (nose up) => horizon moves down; +ve (nose down) => moves up.
        const pitchOffset = -pitch * 2;
        horizonElement.style.transform = `translateY(calc(-25% + ${pitchOffset/2}px)) rotate(${-roll}deg)`;
    }
    // const pitchMarkings = document.getElementById('pitch-markings');
    // if (pitchMarkings) {
    //     // Move pitch markings vertically with the same factor.
    //     pitchMarkings.style.transform = `translateY(${pitchOffset}px)`;
    // }

    // Calculate altitude from aircraft (already computed as 'altitude')
    // Update altimeter gauge:
    const altimeterValue = document.getElementById('altimeter-value');
    if (altimeterValue) {
        altimeterValue.textContent = altitude.toFixed(0);
    }
    // For demonstration, map altitude to a needle rotation (e.g., max 1000 ft equals 180° rotation)
    const altimeterNeedle = document.getElementById('altimeter-needle');
    if (altimeterNeedle) {
        const maxAltitude = 1000;
        const rotation = Math.min(180, altitude / maxAltitude * 180);
        altimeterNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    }

    // Update vertical speed display
    const verticalSpeedElement = document.getElementById('vertical-speed');
    if (verticalSpeedElement) {
        verticalSpeedElement.textContent = `${verticalSpeed.toFixed(1)} ft/s`;
    }
}

// Display messages to the user
export function showMessage(message, color = 'white') {
    messageElement.textContent = message;
    messageElement.style.color = color;
}

// Show/hide restart button
export function toggleRestartButton(visible) {
    restartButton.style.display = visible ? 'block' : 'none';
}
