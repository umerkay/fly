import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { showMessage, toggleRestartButton } from './ui.js';
import { updateCamera } from './camera.js';
import { getAircraftModel } from './aircraftModels.js';

// --- Reset Game State ---
export function resetAircraftState(state) {
    state.aircraft.group.position.set(0, state.constants.GROUND_LEVEL, -state.constants.RUNWAY_LENGTH / 2 + 15);
    state.aircraft.group.rotation.set(0, 0, 0);
    state.aircraft.group.quaternion.set(0, 0, 0, 1);

    state.aircraft.velocity.set(0, 0, 0);
    state.aircraft.angularVelocity.set(0, 0, 0);
    state.aircraft.thrust = 0;
    state.aircraft.isOnGround = true;
    state.aircraft.isCrashed = false;
    state.aircraft.hasBeenAirborne = false; // Reset airborne state
    state.aircraft.airborneTimer = 0; // Reset the airborne timer
    state.aircraft.confirmedAirborne = false; // Reset confirmed airborne state

    showMessage('On Runway. Increase thrust (W) to take off.', 'white');
    toggleRestartButton(false);

    // Ensure camera is reset too
    updateCamera(state); // Place camera correctly at start
    state.camera.lookAt(state.aircraft.group.position); // Look at the plane initially
}

// Add blinking lights to airplane wings
function addBlinkingLights(state) {
    // If lights already added, do not create again
    if (!state.aircraft.blinkLights) {
        state.aircraft.blinkLights = [];
        // Create a yellow point light for the left wing
        const leftLight = new THREE.PointLight(0x0000ff, 2, 10);
        leftLight.position.set(-4.5, 0.2, 0);
        // Create a yellow point light for the right wing
        const rightLight = new THREE.PointLight(0xff0000, 2, 10);
        rightLight.position.set(4.5, 0.2, 0);
        state.aircraft.group.add(leftLight);
        state.aircraft.group.add(rightLight);
        state.aircraft.blinkLights.push(leftLight, rightLight);
        state.aircraft.blinkTime = 0;
    }
}

// Update blinking lights; call this in your animation loop with the delta time.
export function updateBlinkingLights(state, delta) {
    if (state.aircraft.blinkLights) {
        state.aircraft.blinkTime += delta;
        const blinkSpeed = 5; // Adjust speed as needed
        // Calculate intensity between 0.5 and 1
        const intensity = 1 + 2 * Math.abs(Math.sin(state.aircraft.blinkTime * blinkSpeed));
        state.aircraft.blinkLights[0].intensity = intensity;
        state.aircraft.blinkLights[1].intensity = 3 - intensity;
    }
}

// --- Load Aircraft Model from GLTF file ---
export function loadAircraftModel(state) {
    const loader = new GLTFLoader();
    const selectedModel = getAircraftModel(state.aircraft.selectedModel);
    Object.assign(state.constants, selectedModel.constants);

    loader.load(
        selectedModel.modelPath,
        function(gltf) {
            state.aircraft.model = gltf.scene;
            state.aircraft.model.scale.set(...selectedModel.scale);
            state.aircraft.model.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            state.aircraft.model.rotation.set(...selectedModel.rotation);
            state.aircraft.model.position.set(...selectedModel.position);

            // const prop = state.aircraft.model.getObjectByName(selectedModel.propellorName);
            // if (prop) {
            //     const bbox = new THREE.Box3().setFromObject(prop);
            //     const center = new THREE.Vector3();
            //     bbox.getCenter(center);
            //     const pivot = new THREE.Group();
            //     pivot.position.copy(center);
            //     prop.position.sub(center);
            //     pivot.add(prop);
            //     state.aircraft.model.add(pivot);
            //     state.aircraft.propellorPivot = pivot;
            // }
            state.aircraft.aesthetic = state.aircraft.model;
            state.aircraft.group.add(state.aircraft.aesthetic);

            const bodyDimensions = new THREE.Box3().setFromObject(state.aircraft.model);
            const bodySize = bodyDimensions.getSize(new THREE.Vector3());
            const bodyGeometry = new THREE.BoxGeometry(bodySize.x, bodySize.y, bodySize.z);
            const bodyMaterial = new THREE.MeshBasicMaterial({ visible: false });
            state.aircraft.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            state.aircraft.group.add(state.aircraft.body);

            resetAircraftState(state);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.error('An error happened during model loading:', error);
            createFallbackAircraft(state);
        }
    );
}

// Create fallback aircraft if model loading fails
function createFallbackAircraft(state) {
    console.warn('Using fallback aircraft model');
    
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
    state.aircraft.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    state.aircraft.body.castShadow = true;
    state.aircraft.body.receiveShadow = true;
    state.aircraft.group.add(state.aircraft.body);

    const wingGeometry = new THREE.BoxGeometry(8, 0.2, 1.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc }); // Light grey
    const wingL = new THREE.Mesh(wingGeometry, wingMaterial);
    const wingR = new THREE.Mesh(wingGeometry, wingMaterial);
    wingL.position.set(-4.5, 0, 0); // Adjusted position for visual center
    wingR.position.set(4.5, 0, 0);  // Adjusted position for visual center
    wingL.castShadow = true; wingR.castShadow = true;
    wingL.receiveShadow = true; wingR.receiveShadow = true;
    state.aircraft.group.add(wingL);
    state.aircraft.group.add(wingR);

    const tailGeometry = new THREE.BoxGeometry(0.3, 1.5, 1);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.75, -2);
    tail.castShadow = true;
    tail.receiveShadow = true;
    state.aircraft.group.add(tail);
    
    resetAircraftState(state);
    // Add blinking wing lights in fallback model
    // addBlinkingLights(state);
}

// Modify updatePropellor to use aircraft speed from state.aircraft.velocity.length()
export function updatePropellor(state, delta) {
    if (state.aircraft.propellorPivot) {
        const speed = state.aircraft.velocity.length(); // Use aircraft speed from ui.js
        state.aircraft.propellorPivot.rotateOnAxis(new THREE.Vector3(0, 0, 1), 5 * speed * delta);
    }
}

// New updateAircraft function to update both blinking lights and propellor
export function updateAircraft(state, delta) {
    // updatePropellor(state, delta);
    // updateBlinkingLights(state, delta);
}
