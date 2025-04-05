import * as THREE from 'three';
// OrbitControls for debugging camera
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { updateUI, addListeners, initialListeners } from './ui.js';
import { setupControls, handleInput } from './controls.js';
import { updatePhysics } from './physics.js';
import { updateAircraft, resetAircraftState } from './aircraft.js';
import { toggleCameraMode, updateCamera } from './camera.js';
import { createScene } from './scene.js';
import { setConstants } from './constants.js';

// --- Global State Object ---
const state = {
    scene: null,
    frames: 0,
    camera: null,
    renderer: null,
    clock: null,
    environment: {}, // new environment object
    aircraft: {
        group: null,
        body: null,
        model: null,
        velocity: new THREE.Vector3(),
        angularVelocity: new THREE.Vector3(),
        thrust: 0,
        keysPressed: {},
        isOnGround: true,
        isCrashed: false,
        hasBeenAirborne: false,
        followCameraOffset: new THREE.Vector3(0, 5, -15),
        followSmoothCameraOffset: new THREE.Vector3(0, 0, -5), // New offset for followSmooth
        cockpitCameraOffset: new THREE.Vector3(0, 0.05, 0.5),
        bearing: 0,
        airborneTimer: 0,
        confirmedAirborne: false
    },
    orbitControls: null,
    followSmoothControls: null, // new followSmoothControls
    cameraMode: 'followSmooth',
    isNightMode: false,  // new flag
    stars: null,         // reference to stars object
    isPaused: false,     // new pause flag
    loadingManager: null
};

// --- Initialization ---
function init() {
    // Set constants
    setConstants(state);
    // Create a loading manager for textures and other assets
    state.loadingManager = new THREE.LoadingManager();
    state.loadingManager.onLoad = () => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        const container = document.getElementById('container');
        if (container) {
            container.style.display = 'block';
        }
    };

    state.clock = new THREE.Clock();

    state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(state.renderer.domElement);

    // Call new createScene() function
    createScene(state);

    // Controls Setup
    setupControls(state.aircraft.keysPressed);

    // Add OrbitControls
    state.orbitControls = new OrbitControls(state.camera, state.renderer.domElement);
    state.orbitControls.enableDamping = true;
    state.orbitControls.dampingFactor = 0.25;
    state.orbitControls.screenSpacePanning = false;
    state.orbitControls.minDistance = 5;
    state.orbitControls.maxDistance = 1000;
    // state.orbitControls.maxPolarAngle = Math.PI / 2;
    state.orbitControls.enabled = false; // Start with follow camera mode

    // Add a second OrbitControls for followSmooth mode
    state.followSmoothControls = new OrbitControls(state.camera, state.renderer.domElement);
    state.followSmoothControls.enableDamping = true;
    state.followSmoothControls.dampingFactor = 0.25;
    state.followSmoothControls.screenSpacePanning = false;
    state.followSmoothControls.minDistance = 15;
    state.followSmoothControls.maxDistance = 15; // Fixed distance for followSmooth mode
    state.followSmoothControls.enabled = false; // Disabled by default

    // Set initial camera mode to followSmooth
    // state.cameraMode = 'followSmooth';
    // state.followSmoothControls.enabled = true;
    // state.followSmoothControls.target.copy(state.aircraft.group.position);

    // // Position the camera behind the airplane
    // const initialCamPos = state.aircraft.group.position.clone().add(state.aircraft.followCameraOffset);
    // state.camera.position.copy(initialCamPos);
    // state.camera.lookAt(state.aircraft.group.position);

    // Window Resize Listener
    window.addEventListener('resize', onWindowResize.bind(null, state), false);

    // Restart Button Listener
    restartButton.addEventListener('click', resetGame.bind(null, state));

    // Add event listener for camera mode toggle
    window.addEventListener('keydown', toggleCameraMode.bind(null, state));
    addListeners(state); // Add UI listeners
    // Start Animation Loop
    // state.followSmoothControls.target.copy(state.aircraft.group.position).add(state.aircraft.followSmoothCameraOffset);

    animate(state);
}

function resetGame(state) {
    resetAircraftState(state);
    // state.aircraft.keysPressed = {}; // Reset keysPressed to ensure no stale inputs
    state.aircraft.isCrashed = false; // Ensure the aircraft is no longer marked as crashed
    state.aircraft.thrust = 0; // Reset thrust to default
    state.aircraft.velocity.set(0, 0, 0); // Reset velocity
    state.aircraft.angularVelocity.set(0, 0, 0); // Reset angular velocity
    state.airborneTimer = 0; // Reset airborne timer
    state.confirmedAirborne = false; // Reset airborne confirmation
    state.hasBeenAirborne = false; // Reset legacy airborne flag
    state.isPaused = false; // Ensure the game is unpaused
}

// --- Window Resize ---
function onWindowResize(state) {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Animation Loop ---
function animate(state) {
    requestAnimationFrame(() => animate(state)); // Keep the loop going even if crashed to allow restart
    
    state.frames++;

    if (!state.isPaused) {
        const deltaTime = Math.min(0.05, state.clock.getDelta()); // Get delta time, clamp to prevent large jumps
        state.updateTerrain && state.updateTerrain(state, state.aircraft.group.position, deltaTime); // Update terrain based on aircraft position

        // Update aircraft state
        // updateBlinkingLights(state, deltaTime); // Update blinking lights

        if (!state.aircraft.isCrashed) { 
            state.aircraft.thrust = handleInput(state, deltaTime, state.aircraft.keysPressed, state.aircraft.group, state.aircraft.velocity, state.aircraft.angularVelocity, state.aircraft.isOnGround, state.aircraft.thrust);
            updatePhysics(deltaTime, state);
            // You can eventually call the unified aircraft update function like this:
            updateAircraft(state, deltaTime);
        }
        
        // Update camera based on mode
        updateCamera(state);
        
        // Update orbit controls if enabled
        if (state.cameraMode === 'orbit') {
            state.orbitControls.update();
        }
        
        state.renderer.render(state.scene, state.camera);
    }
    // console.log(state.isPaused)
    // Always update UI even when paused.
    updateUI(state, state.aircraft.velocity, state.aircraft.group, state.aircraft.bearing, state.aircraft.thrust);
}

initialListeners(state); // Initial listeners for UI elements

// --- Start ---
document.getElementById('startButton').addEventListener('click', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    // Retrieve selected map from dropdown
    // state.selectedMap = document.getElementById('map-selector').value;
    // Show loading screen and hide canvas container during loading
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    const container = document.getElementById('container');
    if (container) {
        container.style.display = 'none';
    }
    init();
});