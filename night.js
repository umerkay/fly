import * as THREE from 'three';
import { updateRunwayLights } from './runway.js';
import { createDaySky } from './scene.js';
import { getCurrentMapConfig } from './maps.js';

// Updated toggleNightMode: no star creation; change sky texture, remove directional light, reduce ambient light
export function toggleNightMode(state) {
    state.isNightMode = !state.isNightMode;
    updateRunwayLights(state, state.isNightMode);
    if (state.isNightMode) {
        //set sky to dark blue
        //no texture
        state.scene.background = new THREE.Color(0x000022);
        // Remove directional light if it exists
        if (state.directionalLight) {
            state.scene.remove(state.directionalLight);
            state.directionalLight = null;
        }
        // Reduce ambient light intensity
        if (state.ambientLight) {
            state.ambientLight.intensity = 0.2;
        }
        state.scene.fog = new THREE.Fog(0x000022, 100, 600);
    } else {
        // Day mode: use createDaySky function
        createDaySky(state, getCurrentMapConfig(state.selectedMap).skyType);
        // Restore directional light by creating a new one
        state.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        state.directionalLight.position.set(100, 100, 50);
        state.directionalLight.castShadow = true;
        state.directionalLight.shadow.mapSize.width = 2048;
        state.directionalLight.shadow.mapSize.height = 2048;
        state.directionalLight.shadow.camera.near = 0.5;
        state.directionalLight.shadow.camera.far = 500;
        state.directionalLight.shadow.camera.left = -150;
        state.directionalLight.shadow.camera.right = 150;
        state.directionalLight.shadow.camera.top = 150;
        state.directionalLight.shadow.camera.bottom = -150;
        state.scene.add(state.directionalLight);
        // Restore ambient light intensity
        if(state.ambientLight) {
            state.ambientLight.intensity = 1.0;
            state.ambientLight.color.set(0xffffff);
        }
        // Remove fog in day time
        state.scene.fog = null;
    }
}