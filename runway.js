import * as THREE from 'three';
import textures from './textures.js';

// Helper function to load and configure textures
function loadAndConfigureTexture(url, repeatX = 1, repeatY = 1, manager) {
    const loader = manager ? new THREE.TextureLoader(manager) : new THREE.TextureLoader();
    const texture = loader.load(url);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 16;
    return texture;
}

// --- Add Runway Markings ---
export function addRunwayMarkings(state) {
    const runwayWidth = state.constants.RUNWAY_WIDTH;
    const runwayLength = state.constants.RUNWAY_LENGTH;
    // Create a group for all markings
    const markingsGroup = new THREE.Group();
    
    // 1. Centerline - dashed white line down the center
    const centerlineSegments = 40; // Number of dashes
    const centerlineSegmentLength = runwayLength * 0.8 / centerlineSegments;
    const centerlineWidth = 0.4;
    const centerlineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide // Make visible from both sides
    });
    
    for (let i = 0; i < centerlineSegments; i += 2) {
        const dash = new THREE.Mesh(
            new THREE.PlaneGeometry(centerlineWidth, centerlineSegmentLength * 0.8),
            centerlineMaterial
        );
        dash.rotation.x = -Math.PI / 2;
        // Fix position order (x, y, z)
        dash.position.set(
            0, // centered on x
            0.11, // slightly above runway
            -runwayLength/2 + runwayLength * 0.1 + (i + 0.5) * centerlineSegmentLength
        );
        markingsGroup.add(dash);
    }
    
    // 2. Threshold markings - white bars at the runway ends
    const thresholdCount = 8; // Number of threshold bars on each end
    const thresholdWidth = runwayWidth * 0.8 / thresholdCount;
    const thresholdLength = 1.5;
    const thresholdGap = (runwayWidth * 0.8 - thresholdWidth * thresholdCount) / (thresholdCount - 1);
    const thresholdMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide // Make visible from both sides
    });
    
    // Threshold at the start of the runway
    for (let i = 0; i < thresholdCount; i++) {
        const bar = new THREE.Mesh(
            new THREE.PlaneGeometry(thresholdWidth, thresholdLength),
            thresholdMaterial
        );
        bar.rotation.x = -Math.PI / 2;
        // Fix position order (x, y, z)
        bar.position.set(
            -runwayWidth/2 + runwayWidth * 0.1 + (i * (thresholdWidth + thresholdGap)) + thresholdWidth/2,
            0.11, // slightly above runway
            -runwayLength/2 + 5 // 5 units from the start
        );
        markingsGroup.add(bar);
    }
    
    // Threshold at the end of the runway
    for (let i = 0; i < thresholdCount; i++) {
        const bar = new THREE.Mesh(
            new THREE.PlaneGeometry(thresholdWidth, thresholdLength),
            thresholdMaterial
        );
        bar.rotation.x = -Math.PI / 2;
        // Fix position order (x, y, z)
        bar.position.set(
            -runwayWidth/2 + runwayWidth * 0.1 + (i * (thresholdWidth + thresholdGap)) + thresholdWidth/2,
            0.11, // slightly above runway
            runwayLength/2 - 5 // 5 units from the end
        );
        markingsGroup.add(bar);
    }
    
    // 3. Add touchdown zone markers
    const touchdownMarkerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide // Make visible from both sides
    });
    
    // Touchdown markers at both ends
    for (let end = -1; end <= 1; end += 2) {
        for (let i = 1; i <= 3; i++) {
            // Create two parallel bars for each touchdown marker
            const leftBar = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 4),
                touchdownMarkerMaterial
            );
            leftBar.rotation.x = -Math.PI / 2;
            // Fix position order (x, y, z)
            leftBar.position.set(
                -runwayWidth/4,
                0.2, // slightly above runway
                end * (runwayLength/2 - 15 - i * 10) // Distance from threshold
            );
            
            const rightBar = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 4),
                touchdownMarkerMaterial
            );
            rightBar.rotation.x = -Math.PI / 2;
            // Fix position order (x, y, z)
            rightBar.position.set(
                runwayWidth/4,
                0.2, // slightly above runway
                end * (runwayLength/2 - 15 - i * 10)
            );
            
            markingsGroup.add(leftBar);
            markingsGroup.add(rightBar);
        }
    }
    
    // 4. Edge lighting (modified to use state.runwayLights)
    const edgeLightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        // emissive: 0xFFFFFF, 
        // emissiveIntensity: 0.8 
    });
    const edgeLightMaterialRed = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        // emissive: 0xFFFFFF, 
        // emissiveIntensity: 0.8 
    });
    const edgeLightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
    // Create a separate group for runway lights
    const runwayLightsGroup = new THREE.Group();
    const edgeLightSpacing = 10;
    const edgeLightCount = Math.floor((runwayLength + 4 * edgeLightSpacing) / edgeLightSpacing);
    
    for (let i = 0; i <= edgeLightCount; i++) {

        let material;
        if(i < 2 || i > edgeLightCount - 2) {
            material = edgeLightMaterialRed;
        }
        else {
            material = edgeLightMaterial;
        }
        // Left edge
        const leftLight = new THREE.Mesh(edgeLightGeometry, material);
        leftLight.position.set(
            -runwayWidth/2 - 0.5,
            0.1,
            -runwayLength/2 + (i - 2) * edgeLightSpacing
        );
        
        // Right edge
        const rightLight = new THREE.Mesh(edgeLightGeometry, material);
        rightLight.position.set(
            runwayWidth/2 + 0.5,
            0.1,
            -runwayLength/2 + (i - 2) * edgeLightSpacing
        );
        
        runwayLightsGroup.add(leftLight);
        runwayLightsGroup.add(rightLight);
    }
    // Store runway lights in state and add to scene separately
    state.runwayLights = runwayLightsGroup;
    state.scene.add(runwayLightsGroup);
    
    state.scene.add(markingsGroup);
}

export function updateRunwayLights(state, isNightMode) {
    state.runwayLights.children.forEach(light => {
        if (isNightMode) {
            // Turn on: use the light material's color as emissive
            light.material.emissive = light.material.color;
            light.material.emissiveIntensity = 1;
        } else {
            // Turn off: no emissive effect
            light.material.emissive = new THREE.Color(0x000000);
            light.material.emissiveIntensity = 0;
        }
    });
}

export function createRunway(state) {
    // Load the road texture and associated maps
    const roadTexture = loadAndConfigureTexture(
        textures.ground["road2"].color,
        1, // Repeat X
        1 * state.constants.RUNWAY_LENGTH / state.constants.RUNWAY_WIDTH, // Repeat Y
        state.loadingManager
    );
    const displacementMap = loadAndConfigureTexture(
        textures.ground["road2"].displacement,
        1,
        1 * state.constants.RUNWAY_LENGTH / state.constants.RUNWAY_WIDTH,
        state.loadingManager
    );
    // const aoMap = loadAndConfigureTexture(
    //     textures.ground["road2"].ao,
    //     1,
    //     1 * state.constants.RUNWAY_LENGTH / state.constants.RUNWAY_WIDTH,
    //     state.loadingManager
    // );
    const roughnessMap = loadAndConfigureTexture(
        textures.ground["road2"].rough,
        1,
        1 * state.constants.RUNWAY_LENGTH / state.constants.RUNWAY_WIDTH,
        state.loadingManager
    );
    const normalMap = loadAndConfigureTexture(
        textures.ground["road2"].normal,
        1,
        1 * state.constants.RUNWAY_LENGTH / state.constants.RUNWAY_WIDTH,
        state.loadingManager
    );

    // Create the runway geometry and material
    const runwayGeometry = new THREE.BoxGeometry(state.constants.RUNWAY_WIDTH, 0, state.constants.RUNWAY_LENGTH);
    const runwayMaterial = new THREE.MeshStandardMaterial({
        map: roadTexture,
        displacementMap: displacementMap,
        // aoMap: aoMap,
        roughnessMap: roughnessMap,
        normalMap: normalMap,
        color: 0x666666
    });
    const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
    // runway.position.set(0, -0.85, 0);
    runway.position.set(0, 0.54, 0);
    runway.receiveShadow = true;
    state.scene.add(runway);

    // Runway markings
    addRunwayMarkings(state);
}

export function isOnRunway(point, state) {
    const runwayWidth = state.constants.RUNWAY_WIDTH;
    const runwayLength = state.constants.RUNWAY_LENGTH;

    // Check if the point's x and z (y in 2D plane) are within the runway boundaries
    const isWithinX = point.x >= -runwayWidth / 2 && point.x <= runwayWidth / 2;
    const isWithinZ = point.z >= -runwayLength / 2 && point.z <= runwayLength / 2;

    return isWithinX && isWithinZ;
}