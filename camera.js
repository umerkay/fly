import * as THREE from 'three';
import { showMessage } from './ui.js';

// --- Update Camera ---
export function updateCamera(state) {
    if (state.cameraMode === 'follow') {
        const desiredCamPos = state.aircraft.group.position.clone().add(state.aircraft.followCameraOffset.clone().applyQuaternion(state.aircraft.group.quaternion));
        state.camera.position.lerp(desiredCamPos, 0.1); // Smooth interpolation

        // Look slightly ahead of the aircraft for better context
        const lookAtOffset = new THREE.Vector3(0, 1.5, 5); // Adjust Y and Z as needed
        const lookAtPos = state.aircraft.group.position.clone().add(lookAtOffset.applyQuaternion(state.aircraft.group.quaternion));
        state.camera.lookAt(lookAtPos);
    } else if (state.cameraMode === 'orbit') {
        // Update orbit controls target to follow the aircraft
        state.orbitControls.target.copy(state.aircraft.group.position);
    } else if (state.cameraMode === 'cockpit') {
        // Position the camera inside the cockpit
        const cockpitPos = state.aircraft.group.position.clone().add(state.aircraft.cockpitCameraOffset.clone().applyQuaternion(state.aircraft.group.quaternion));
        state.camera.position.copy(cockpitPos);
        
        // Look forward from the cockpit (in the aircraft's forward direction)
        const forward = new THREE.Vector3(0, 0, 10).applyQuaternion(state.aircraft.group.quaternion);
        const lookAtPoint = cockpitPos.clone().add(forward);
        state.camera.lookAt(lookAtPoint);
    }

    // Calculate bearing (yaw angle in degrees)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(state.aircraft.group.quaternion);
    state.aircraft.bearing = (Math.atan2(forward.x, forward.z) * (180 / Math.PI) + 360) % 360; // Normalize to 0-360 degrees

    // --- Update Aircraft Glass Visibility ---
    // Hide glass layer "11804_Airplane_glass" in cockpit mode.
    if (state.aircraft.model) {
        const glass = state.aircraft.model.getObjectByName('11804_Airplane_glass');
        if (glass) {
            //set opacity to low
            // glass.visible = (state.cameraMode !== 'cockpit');
            glass.material.transparent = true;
            glass.material.opacity = (state.cameraMode !== 'cockpit') ? 1 : 0.2; // Set opacity based on camera mode
        }
    }
}

// --- Toggle Camera Mode ---
export function toggleCameraMode(state, event) {
    if (event.code === 'KeyC') {
        // Cycle through the three camera modes
        if (state.cameraMode === 'follow') {
            state.cameraMode = 'orbit';
            state.orbitControls.enabled = true;
            state.orbitControls.target.copy(state.aircraft.group.position);
            showMessage('Camera Mode: Orbit (Free)', 'lightblue');
        } else if (state.cameraMode === 'orbit') {
            state.cameraMode = 'cockpit';
            state.orbitControls.enabled = false;
            updateCamera(state); // Immediately update cockpit camera position
            showMessage('Camera Mode: Cockpit', 'lightblue');
        } else {
            state.cameraMode = 'follow';
            state.orbitControls.enabled = false;
            updateCamera(state); // Immediately update follow camera position
            showMessage('Camera Mode: Follow', 'lightblue');
        }
    }
}
