import * as THREE from 'three';
import textures from './textures.js';
import { getCurrentMapConfig } from './maps.js';
// import { state.constants.RUNWAY_WIDTH, state.constants.RUNWAY_LENGTH } from './constants.js';

// Add texture loading helper
function loadAndConfigureTexture(url, repeatX = 10, repeatY = 10, manager) {
    const loader = manager ? new THREE.TextureLoader(manager) : new THREE.TextureLoader();
    const texture = loader.load(url);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 16;
    return texture;
}

export class TerrainManager {
    constructor(scene, noise, loadingManager, config) {
        this.scene = scene;
        this.noise = noise;
        this.loadingManager = loadingManager;
        this.config = config; // contains tileSize, segments, activeRange, maxTerrainHeight, noiseScale, runwayWidth, runwayLength
        this.tileSize = config.tileSize;
        this.segments = config.segments;
        this.activeRange = config.activeRange;
        this.tiles = {};
        // Preload textures for ground material once
        const repeatX = this.config.repeatX || 10;
        const repeatY = this.config.repeatY || 10;
        this.loadedTextures = {
            map: loadAndConfigureTexture(textures.ground[this.config.groundType].color, repeatX, repeatY, this.loadingManager),
            displacementMap: loadAndConfigureTexture(textures.ground[this.config.groundType].displacement, repeatX, repeatY, this.loadingManager),
            aoMap: loadAndConfigureTexture(textures.ground[this.config.groundType].ao, repeatX, repeatY, this.loadingManager),
            roughnessMap: loadAndConfigureTexture(textures.ground[this.config.groundType].rough, repeatX, repeatY, this.loadingManager),
            normalMap: loadAndConfigureTexture(textures.ground[this.config.groundType].normal, repeatX, repeatY, this.loadingManager)
        };
    }
    update(state, position) {
        const tileX = Math.round(position.x / this.tileSize);
        const tileZ = Math.round(position.z / this.tileSize);
        const needed = {};
        //tileX
        for (let i = tileX - this.activeRange; i <= tileX + this.activeRange; i++) {
            //tileZ 
            for (let j = tileZ - this.activeRange; j <= tileZ + this.activeRange; j++) {
                const key = `${i},${j}`;
                needed[key] = true;
                if (!this.tiles[key]) {
                    const tile = this.createTile(state, i, j);
                    this.tiles[key] = tile;
                    this.scene.add(tile);
                }
            }
        }
        // Unload tiles that are no longer needed
        for (const key in this.tiles) {
            if (!needed[key]) {
                this.scene.remove(this.tiles[key]);
                this.tiles[key].geometry.dispose();
                this.tiles[key].material.dispose();
                delete this.tiles[key];
            }
        }
    }

    static generateMountainousTerrain(worldX, worldZ, noise, config) {
        let totalNoise = 0;
        let amplitude = 1;
        let frequency = config.noiseScale;
        let maxHeight = config.maxTerrainHeight;
        
        // Number of noise layers (octaves)
        const octaves = 5;  
        const persistence = 0.5;  // Controls amplitude decay
        const lacunarity = 2.0;   // Controls frequency increase
    
        for (let i = 0; i < octaves; i++) {
            let noiseVal = noise.perlin2(worldX * frequency, worldZ * frequency);
            totalNoise += (1.0 - Math.abs(noiseVal)) * amplitude;
    
            amplitude *= persistence;  // Reduce amplitude for next octave
            frequency *= lacunarity;   // Increase frequency for next octave
        }
    
        // Adjust height to create sharper peaks
        maxHeight *= Math.pow(totalNoise, 2.5); // Exaggerate peaks non-linearly
    
        return maxHeight;
    }

    getTerrainHeight(state, worldX, worldZ) {
        // Return -0.5 for runway region.
        if (Math.abs(worldX) <= state.constants.RUNWAY_WIDTH/2 + 15 && Math.abs(worldZ) <= state.constants.RUNWAY_LENGTH/2 + 15) {
            return -0.5;
        }
        let displacement = 0;
        if (this.config.rugged) {
            displacement = TerrainManager.generateMountainousTerrain(worldX, worldZ, this.noise, this.config);
            const distance = (worldX**2 + worldZ**2); // Radial distance
    
            // Define smooth transition range
            const smoothThreshold = 1500;
            const smoothFactor = Math.min(1, distance / (smoothThreshold ** 2)); // Smooth ramp-up
    
            // Apply gradual noise increase
            return displacement * smoothFactor;
        } else {
            displacement = this.noise.perlin2(worldX * this.config.noiseScale, worldZ * this.config.noiseScale) * this.config.maxTerrainHeight;
            const dx = Math.max(Math.abs(worldX) - state.constants.RUNWAY_WIDTH, 0);
            const dz = Math.max(Math.abs(worldZ) - state.constants.RUNWAY_LENGTH, 0);
            const smoothThresholdX = 5 * state.constants.RUNWAY_WIDTH;
            const smoothThresholdZ = 5 * state.constants.RUNWAY_WIDTH;
            const factorX = Math.min(1, dx / smoothThresholdX);
            const factorZ = Math.min(1, dz / smoothThresholdZ);
            const factor = Math.max(factorX, factorZ);
            return displacement * factor;

        }

    }
    createTile(state, tileX, tileZ) {
        const overlap = this.config.overlap || 0.2;
        const geometry = new THREE.PlaneGeometry(this.tileSize + overlap, this.tileSize + overlap, this.segments, this.segments);
        geometry.rotateX(-Math.PI / 2);
        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const localX = positions.getX(i);
            const localZ = positions.getZ(i);
            const worldX = tileX * this.tileSize + localX;
            const worldZ = tileZ * this.tileSize + localZ;
            const height = this.getTerrainHeight(state, worldX, worldZ);
            positions.setY(i, height);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();

        // Base material (rock texture)
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.config.color || 0xaaaaaa),
            metalness: 0.0,
            roughness: 1.0,
            map: this.loadedTextures.map,
            displacementMap: this.loadedTextures.displacementMap,
            aoMap: this.loadedTextures.aoMap,
            roughnessMap: this.loadedTextures.roughnessMap,
            normalMap: this.loadedTextures.normalMap
        });

        const baseMesh = new THREE.Mesh(geometry, baseMaterial);
        baseMesh.receiveShadow = true;

        baseMesh.position.set(tileX * this.tileSize + overlap / 2, -0.5, tileZ * this.tileSize + overlap / 2);
        return baseMesh;
    }
    isColliding(state, position) {
        const { x: worldX, z: worldZ, y: pointY } = position;
        // If inside runway, terrain height is immediately 0
        if (Math.abs(worldX) <= state.constants.RUNWAY_WIDTH && Math.abs(worldZ) <= state.constants.RUNWAY_LENGTH) {
            return false;
        }
        const terrainHeight = this.getTerrainHeight(state, worldX, worldZ);
        return pointY < terrainHeight;
    }
}