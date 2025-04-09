import * as THREE from 'three';
import { isOnRunway } from './runway.js';
import { toggleNightMode } from './night.js';

// UI Element References
export const speedElement = document.getElementById('speed');
export const altitudeElement = document.getElementById('altitude');
export const pitchElement = document.getElementById('pitch');
export const rollElement = document.getElementById('roll');
export const bearingElement = document.getElementById('heading-label');
export const messageElement = document.getElementById('message');
export const restartButton = document.getElementById('restartButton');
export const thrustBar = document.getElementById('thrust-bar');
export const speedNeedle = document.getElementById('speed-needle');
export const compassRose = document.querySelector('.compass-rose');
export const speedometer = document.getElementById('speed-value');
export const thrustElement = document.getElementById('thrust-value');
export const yellowMarker = document.getElementById('yellow-marker');
export const horizonElement = document.getElementById('horizon');
export const altimeterValue = document.getElementById('altimeter-value');
export const altimeterNeedle = document.getElementById('altimeter-needle');
export const verticalSpeedElement = document.getElementById('vertical-speed');
export const gearToggleButton = document.getElementById('gearToggleButton');
export const airborneStatus = document.getElementById('airborne-status');

// Flight Simulation UI Elements and Functions

export function initialListeners(state) {
    document.addEventListener('DOMContentLoaded', () => {
        // Load saved selections from localStorage
        const savedMap = localStorage.getItem('selectedMap') || 'mountain';
        const savedAircraft = localStorage.getItem('selectedAircraft') || 'cessna';

        // Add event listener for map selection
        const mapCards = document.querySelectorAll('.map-card');
        mapCards.forEach(card => {
            card.addEventListener('click', () => {
                mapCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                state.selectedMap = card.dataset.map;
                localStorage.setItem('selectedMap', card.dataset.map);
            });
            
            // Select the saved map
            if (card.dataset.map === savedMap) {
                card.classList.add('selected');
                state.selectedMap = savedMap;
            }
        });

        // Set aircraft selector to saved value
        const aircraftSelector = document.getElementById('aircraft-selector');
        aircraftSelector.value = savedAircraft;
        state.selectedAircraft = savedAircraft;

        // Save aircraft selection when changed
        aircraftSelector.addEventListener('change', (e) => {
            state.selectedAircraft = e.target.value;
            localStorage.setItem('selectedAircraft', e.target.value);
        });

        // Ensure a default map is selected if saved map is invalid
        if (!document.querySelector('.map-card.selected')) {
            const defaultCard = document.querySelector('.map-card[data-map="mountain"]');
            if (defaultCard) {
                defaultCard.classList.add('selected');
                state.selectedMap = 'mountain';
                localStorage.setItem('selectedMap', 'mountain');
            }
        }
    });
}

export const addListeners = (state) => {
    const nightmodeButton = document.getElementById('nightmodeButton');
    nightmodeButton.addEventListener('click', () => {
        toggleNightMode(state);
    });

    const engineOffButton = document.getElementById('engineOffButton');
    engineOffButton.addEventListener('click', () => {
        state.aircraft.engineOff = !state.aircraft.engineOff;
        engineOffButton.textContent = state.aircraft.engineOff ? "Engine On" : "Engine Off";
    });

    const parkBrakesButton = document.getElementById('parkBrakesButton');
    parkBrakesButton.addEventListener('click', () => {
        state.aircraft.parkBrakes = !state.aircraft.parkBrakes;
        parkBrakesButton.textContent = state.aircraft.parkBrakes ? "Release Brakes" : "Park Brakes";
    });

    const pauseButton = document.getElementById('pauseButton');
    pauseButton.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
    });
    pauseButton.textContent = state.isPaused ? "Resume" : "Pause";

    if (state.canRetractGear) {
        gearToggleButton.style.display = 'block';
        gearToggleButton.addEventListener('click', () => {
            if (!state.aircraft.confirmedAirborne) return;

            if (state.aircraft.gearDeployed) {
                if (state.aircraft.aesthetic) {
                    state.aircraft.aesthetic.visible = false;
                }
                if (state.aircraft.airModel) {
                    state.aircraft.airModel.visible = true;
                }
                gearToggleButton.textContent = "Deploy Gear";
            } else {
                if (state.aircraft.airModel) {
                    state.aircraft.airModel.visible = false;
                }
                if (state.aircraft.aesthetic) {
                    state.aircraft.aesthetic.visible = true;
                }
                gearToggleButton.textContent = "Retract Gear";
            }
            state.aircraft.gearDeployed = !state.aircraft.gearDeployed;
        });

        state.aircraft.gearDeployed = true;
        gearToggleButton.textContent = "Retract Gear";
        gearToggleButton.disabled = !state.aircraft.confirmedAirborne;

    } else {
        gearToggleButton.style.display = 'none';
    }

    const updateGearButtonState = () => {
        gearToggleButton.disabled = !state.aircraft.confirmedAirborne;
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === 'h' || event.key === 'H') {
            const uiElements = document.querySelectorAll('#info-ui, #gauges-container, #controls, #thrust-bar-container, #footer');
            uiElements.forEach(element => {
                element.style.visibility = element.style.visibility === 'hidden' ? 'visible' : 'hidden';
            });
        } else if(event.key === 'j' || event.key === 'J') {
            if (state.aircraft) {
                state.aircraft.group.traverse((child) => {
                    child.visible = !child.visible;
                });
            }
        } else if (event.key === 'g' || event.key === 'G') {
            if (state.canRetractGear && state.aircraft.confirmedAirborne) {
                if (state.aircraft.gearDeployed) {
                    if (state.aircraft.aesthetic) {
                        state.aircraft.aesthetic.visible = false;
                    }
                    if (state.aircraft.airModel) {
                        state.aircraft.airModel.visible = true;
                    }
                    showMessage("Gear retracted", "green");
                } else {
                    if (state.aircraft.airModel) {
                        state.aircraft.airModel.visible = false;
                    }
                    if (state.aircraft.aesthetic) {
                        state.aircraft.aesthetic.visible = true;
                    }
                    showMessage("Gear deployed", "green");
                }
                state.aircraft.gearDeployed = !state.aircraft.gearDeployed;
            }
        }
    });
}

// Update UI with current flight data
let lastAltitude = 0;
let lastUpdateTime = performance.now();

export function updateUI(state, velocity, aircraft, bearing, thrust) {
    const speed = velocity.length();
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;

    const altitude = Math.max(0, aircraft.position.y - aircraft.children[1]?.geometry.parameters.height / 2 - 0.05);
    const verticalSpeed = deltaTime > 0 ? (altitude - lastAltitude) / deltaTime : 0;
    lastAltitude = altitude;

    const euler = new THREE.Euler().setFromQuaternion(aircraft.quaternion, 'YXZ');
    const pitch = THREE.MathUtils.radToDeg(euler.x);
    const roll = THREE.MathUtils.radToDeg(euler.z);
    
    if (bearingElement) {
        bearingElement.textContent = bearing.toFixed(2);
    }

    const thrustPercentage = Math.round((thrust / state.constants.MAX_THRUST) * 100);
    
    if (thrustElement) {
        thrustElement.textContent = `${thrustPercentage}%`;
        thrustElement.style.color = thrustPercentage > 80 ? 'red' : thrustPercentage > 50 ? 'orange' : 'white';
    }
    
    if (thrustBar) {
        thrustBar.style.height = `${100 - Math.max(0, thrustPercentage)}%`;
    }
    
    if (speedNeedle) {
        const maxDisplaySpeed = 600;
        const speedRotation = (speed * 3) / maxDisplaySpeed * 250 - 125;
        speedNeedle.style.transform = `translateX(-50%) rotate(${speedRotation}deg)`;
    }

    if (speedometer) {
        speedometer.textContent = `${(speed * 3).toFixed(2)}`;
    }
    
    if (compassRose) {
        compassRose.style.transform = `rotate(${bearing}deg)`;
        if (yellowMarker) {
            const aircraftPosition = aircraft.position;
            if (!isOnRunway(aircraftPosition, state)) {
                const directionToRunway = new THREE.Vector3(0, aircraftPosition.y, -135).sub(aircraftPosition).normalize();
                const angleToRunway = Math.atan2(directionToRunway.x, directionToRunway.z);
                const angleToRunwayDegrees = (THREE.MathUtils.radToDeg(angleToRunway) - bearing + 360) % 360;
                const radius = 50;
                const x = radius * Math.sin(THREE.MathUtils.degToRad(360 - angleToRunwayDegrees));
                const y = -radius * Math.cos(THREE.MathUtils.degToRad(360 - angleToRunwayDegrees));
                yellowMarker.style.transform = `translate(${x}px, ${y}px) rotate(${360 - angleToRunwayDegrees}deg)`;
            } else {
                yellowMarker.style.transform = 'translate(-9999px, -9999px)';
            }
        }
    }

    if (horizonElement) {
        const pitchOffset = -pitch * 2;
        horizonElement.style.transform = `translateY(calc(-25% + ${pitchOffset/2}px)) rotate(${-roll}deg)`;
    }

    if (altimeterValue) {
        altimeterValue.textContent = altitude.toFixed(0);
    }

    if (altimeterNeedle) {
        const maxAltitude = 2000;
        const rotation = Math.min(360, altitude / maxAltitude * 360);
        altimeterNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    }

    if (verticalSpeedElement) {
        verticalSpeedElement.textContent = `${verticalSpeed.toFixed(1)} ft/s`;
    }

    if (gearToggleButton && state.canRetractGear) {
        gearToggleButton.disabled = !state.aircraft.confirmedAirborne;
    }

    if(state.doHideAirModel) {
        state.aircraft.airModel.visible = false;
        state.doHideAirModel = false;
    }

    if (airborneStatus) {
        const statusText = [
            `Confirmed Airborne: ${state.aircraft.confirmedAirborne}`,
            `Has Been Airborne: ${state.aircraft.hasBeenAirborne}`,
            `Airborne Timer: ${state.aircraft.airborneTimer.toFixed(1)}s`
        ].join(' | ');
        airborneStatus.textContent = statusText;
        airborneStatus.style.color = state.aircraft.confirmedAirborne ? 'lightgreen' : 'white';
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

export function showToast(title, message) {
    Toastify({
        text: `${title}\n${message}`,
        duration: 5000,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right,rgb(20, 20, 20),rgb(23, 23, 23))",
            // background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}
