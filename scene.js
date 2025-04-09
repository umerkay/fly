import * as THREE from 'three';
import { addRunwayMarkings, createRunway } from './runway.js';
import { loadAircraftModel } from './aircraft.js';
// import { state.constants.RUNWAY_WIDTH, state.constants.RUNWAY_LENGTH } from './constants.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import textures from './textures.js';
import { TerrainManager } from './terrainManager.js';
import { getCurrentMapConfig } from './maps.js';

// Remove noisejs import since noisejs is loaded via CDN
// import { Noise } from 'noisejs';

// Create noise instance using the global Noise from CDN
const noise = new Noise(Math.random());

export function createDaySky(state, skyType) {
    //if black set a black color background
    if (skyType === 'black') {
        state.scene.background = new THREE.Color(0x000000);
        return;
    }
    new EXRLoader(state.loadingManager).load(textures.sky[skyType], (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        state.scene.background = texture;
        state.environment = state.environment || {};
        state.environment.sky = texture;
    });
}

export function createScene(state) {
    // Use selected map from state (default to "desert" if not defined)
    const selectedMap = state.selectedMap || 'mountain';
    const mapConfig = getCurrentMapConfig(selectedMap);
    loadAircraftModel(state);
    
    // Scene
    state.scene = new THREE.Scene();
    // Use map's skyType: if defined and not 'none', load sky texture; otherwise, set a default background color
    if (mapConfig.skyType && mapConfig.skyType !== 'none') {
        createDaySky(state, mapConfig.skyType);
    } else {
        state.scene.background = new THREE.Color(0x000000);
    }
    
    if (mapConfig.doFog) {
        state.scene.fog = new THREE.Fog(mapConfig.fogColor || 0xc0edff, 500, 1900);
    }
    
    // Lighting (from map settings)
    if (mapConfig.doAmbientLight) {
        const ambientLight = new THREE.AmbientLight(0xffffff, mapConfig.ambientLightIntensity || 1);
        state.ambientLight = ambientLight;
        state.scene.add(ambientLight);
    }
    if (mapConfig.doDirectionalLight) {
        state.directionalLight = new THREE.DirectionalLight(0xffffff, mapConfig.directionalLightIntensity || 1.5);
        state.directionalLight.position.set(100, 100, 50);
        // state.directionalLight.castShadow = true;
        // state.directionalLight.shadow.mapSize.width = 2048;
        // state.directionalLight.shadow.mapSize.height = 2048;
        // state.directionalLight.shadow.camera.near = 0.5;
        // state.directionalLight.shadow.camera.far = 500;
        // state.directionalLight.shadow.camera.left = -150;
        // state.directionalLight.shadow.camera.right = 150;
        // state.directionalLight.shadow.camera.top = 150;
        // state.directionalLight.shadow.camera.bottom = -150;
        state.scene.add(state.directionalLight);
    }
    
    // Terrain: use mountain terrain if enabled in map config
    if (mapConfig.doMountainTerrain) {
        state.terrainManager = new TerrainManager(state.scene, noise, state.loadingManager, mapConfig);
        const initPos = (state.aircraft && state.aircraft.group) ? state.aircraft.group.position : new THREE.Vector3(0, 0, 0);
        state.terrainManager.update(state, initPos);
        state.updateTerrain = function(state, position, deltaTime) {
            state.terrainManager.update(state, position, deltaTime);
        };
    }

    // Runway
    createRunway(state);
    
    if (/* DO_state.constants.RUNWAY_MARKINGS remains independent */ true) {
        // Runway markings
        // addRunwayMarkings(state);
    }
    
    // Trees if enabled in map config
    if (mapConfig.doTrees) {
        for (let i = 0; i < 30; i++) {
            const treeGeometry = new THREE.ConeGeometry(1, 5, 8);
            const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            const x = (Math.random() - 0.5) * 400;
            const z = (Math.random() > 0.5 ? 1 : -1) * (state.constants.RUNWAY_LENGTH / 2 + 20 + Math.random() * 150);
            const baseHeight = noise.perlin2(x * 0.005, z * 0.005) * mapConfig.maxTerrainHeight;
            const dx = Math.max(Math.abs(x) - state.constants.RUNWAY_WIDTH / 2, 0);
            const dz = Math.max(Math.abs(z) - state.constants.RUNWAY_LENGTH / 2, 0);
            const smoothThresholdX = 5 * state.constants.RUNWAY_WIDTH;
            const smoothThresholdZ = 5 * state.constants.RUNWAY_LENGTH;
            const factorX = Math.min(1, dx / smoothThresholdX);
            const factorZ = Math.min(1, dz / smoothThresholdZ);
            const factor = Math.max(factorX, factorZ);
            const terrainHeight = baseHeight * factor;
            const treeY = Math.max(terrainHeight, 2.5);
            tree.position.set(x, treeY, z);
            tree.castShadow = true;
            tree.receiveShadow = true;
            state.scene.add(tree);
        }
    }
    
    // Buildings if enabled in map config
    if (mapConfig.doBuildings) {
        for (let i = 0; i < 10; i++) {
            const buildingGeometry = new THREE.BoxGeometry(50, 100, 50);
            const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            const x = (Math.random() - 0.5) * 400;
            const z = (Math.random() > 0.5 ? 1 : -1) * (state.constants.RUNWAY_LENGTH / 2 + 20 + Math.random() * 150);
            building.position.set(x, 5, z);
            building.castShadow = true;
            building.receiveShadow = true;
            state.scene.add(building);
        }
    }
    
    // Aircraft Model
    state.aircraft.group = new THREE.Group();
    state.scene.add(state.aircraft.group);
}