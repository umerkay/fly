import * as THREE from 'three';
import textures from './textures.js';
import { getCurrentMapConfig } from './maps.js';
import { isOnRunway } from './runway.js';
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
            ...(textures.ground[this.config.groundType].ao && { aoMap: loadAndConfigureTexture(textures.ground[this.config.groundType].ao, repeatX, repeatY, this.loadingManager) }),
            roughnessMap: loadAndConfigureTexture(textures.ground[this.config.groundType].rough, repeatX, repeatY, this.loadingManager),
            normalMap: loadAndConfigureTexture(textures.ground[this.config.groundType].normal, repeatX, repeatY, this.loadingManager),
            ...(textures.ground[this.config.groundType].emissive && { emissiveMap: loadAndConfigureTexture(textures.ground[this.config.groundType].emissive, repeatX, repeatY, this.loadingManager) })
        };
        if (this.config.hasSecondTerrain) {
            const secondConfig = this.config.secondTerrain;
            const repeatX = secondConfig.repeatX || 10;
            const repeatY = secondConfig.repeatY || 10;
            this.loadedSecondTextures = {
                map: loadAndConfigureTexture(textures.ground[secondConfig.groundType].color, repeatX, repeatY, this.loadingManager),
                displacementMap: loadAndConfigureTexture(textures.ground[secondConfig.groundType].displacement, repeatX, repeatY, this.loadingManager),
                ...(textures.ground[secondConfig.groundType].ao && { aoMap: loadAndConfigureTexture(textures.ground[secondConfig.groundType].ao, repeatX, repeatY, this.loadingManager) }),
                roughnessMap: loadAndConfigureTexture(textures.ground[secondConfig.groundType].rough, repeatX, repeatY, this.loadingManager),
                normalMap: loadAndConfigureTexture(textures.ground[secondConfig.groundType].normal, repeatX, repeatY, this.loadingManager),
                ...(textures.ground[secondConfig.groundType].emissive && { emissiveMap: loadAndConfigureTexture(textures.ground[secondConfig.groundType].emissive, repeatX, repeatY, this.loadingManager) })
            };
        }
    }
    update(state, position, deltaTime) {
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
                    this.scene.add(tile.main);
                    if (tile.second) {
                        this.scene.add(tile.second);
                    }
                }
            }
        }
        // Unload tiles that are no longer needed
        for (const key in this.tiles) {
            if (!needed[key]) {
                this.scene.remove(this.tiles[key].main);
                this.tiles[key].main.geometry.dispose();
                this.tiles[key].main.material.dispose();
                if (this.tiles[key].second) {
                    this.scene.remove(this.tiles[key].second);
                    this.tiles[key].second.geometry.dispose();
                    this.tiles[key].second.material.dispose();
                }
                delete this.tiles[key];
            }
        }
        // Update tiles if updateTerrain is defined
        if (this.config.updateTerrain) {
            for (const key in this.tiles) {
                this.config.updateTerrain(this.tiles[key].main, deltaTime);
            }
        }
        if (this.config.hasSecondTerrain && this.config.updateTerrain_second) {
            for (const key in this.tiles) {
                this.config.updateTerrain_second(this.tiles[key].second, deltaTime);
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
        if (this.config.staticHeight !== undefined) {
            return this.config.staticHeight; // Return static height if defined
        }
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
    
            // return displacement;
            if(this.config.amplify) {
                // return displacement;
                return displacement > 250 ? 250 + (displacement - 250)**2 : displacement;
            }
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
    getTerrainHeight_second(state, worldX, worldZ) {
        const secondConfig = this.config.secondTerrain;
        if (secondConfig.staticHeight !== undefined) {
            return secondConfig.staticHeight; // Return static height if defined
        }
        // Return -0.5 for runway region.
        if (Math.abs(worldX) <= state.constants.RUNWAY_WIDTH/2 + 15 && Math.abs(worldZ) <= state.constants.RUNWAY_LENGTH/2 + 15) {
            if(secondConfig.inverted) {
                return secondConfig.terrainOffset;
            }
            return -0.5;
        }
        if(secondConfig.doDolomites) {
            const displacement = TerrainManager.generateMountainousTerrain(worldX, worldZ, this.noise, secondConfig);
            const distance = (worldX**2 + worldZ**2); // Radial distance
    
            // Define smooth transition range
            const smoothThreshold = 1000;
            const smoothFactor = Math.min(1, distance / (smoothThreshold ** 2)); // Smooth ramp-up
    
            // Apply gradual noise increase
            const h = displacement * smoothFactor + (secondConfig.terrainOffset || 0);
            const h2 = h > 200 ? h + (h/50)*10 : h > 100 ? h/1.5 : -200;
            return h2-70;
        }
        if (secondConfig.rugged) {
            const displacement = TerrainManager.generateMountainousTerrain(worldX, worldZ, this.noise, secondConfig);
            const distance = (worldX**2 + worldZ**2); // Radial distance
    
            // Define smooth transition range
            const smoothThreshold = 1500;
            const smoothFactor = Math.min(1, distance / (smoothThreshold ** 2)); // Smooth ramp-up
    
            // Apply gradual noise increase
            if(secondConfig.inverted) {
                let d2 = displacement;
                if(this.config.amplify) {
                    // return displacement;
                    d2 = displacement < -500 ? -300 - (displacement + 500)**2 : displacement;
                }
                return d2 + (secondConfig.terrainOffset || 0);
            }
            return displacement * smoothFactor + (secondConfig.terrainOffset || 0);
        }
        if (secondConfig.iceberg) {
            const displacement = TerrainManager.generateMountainousTerrain(worldX, worldZ, this.noise, secondConfig);
            const distance = (worldX**2 + worldZ**2); // Radial distance
    
            // Define smooth transition range
            const smoothThreshold = 150;
            const smoothFactor = Math.min(1, distance / (smoothThreshold ** 2)); // Smooth ramp-up
    
            // Apply gradual noise increase
            const h = displacement * smoothFactor + (secondConfig.terrainOffset || 0);
            return h > 10 ? h + (h/50)*20 : -200;
        }
        if (secondConfig.doIslandTerrain) {
            const displacement = TerrainManager.generateMountainousTerrain(worldX, worldZ, this.noise, secondConfig);
            const distance = (worldX**2 + worldZ**2); // Radial distance
    
            // Define smooth transition range
            const smoothThreshold = distance < 10000 ? 1000 : 400;
            const smoothFactor = Math.min(1, distance / (smoothThreshold ** 2)); // Smooth ramp-up
    
            if(isOnRunway({x: worldX/2, z: worldZ/2}, state)) {
                return -0.5;
            }

            // Apply gradual noise increase
            let height = displacement;

            height = height - 400
            height = height > 30 ? 30 + (height - 30)/10 : height;

            return height * smoothFactor;
        } else {
            return this.noise.perlin2(worldX * secondConfig.noiseScale, worldZ * secondConfig.noiseScale) * secondConfig.maxTerrainHeight;
        }
    }

    createTile(state, tileX, tileZ) {
        const overlap = this.config.overlap || 2;
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
            metalness: this.config.metalness || 0,
            roughness: this.config.roughness || 1,
            map: this.loadedTextures.map,
            displacementMap: this.loadedTextures.displacementMap,
            ...(this.loadedTextures.aoMap && { aoMap: this.loadedTextures.aoMap }),
            roughnessMap: this.loadedTextures.roughnessMap,
            normalMap: this.loadedTextures.normalMap,
            ...(this.loadedTextures.emissiveMap && { emissiveMap: this.loadedTextures.emissiveMap }),
            opacity: this.config.terrainOpacity || 1.0, // Use terrainOpacity or default to 1.0
            transparent: this.config.terrainOpacity !== undefined // Enable transparency if opacity is set
        });

        const baseMesh = new THREE.Mesh(geometry, baseMaterial);
        baseMesh.receiveShadow = true;

        baseMesh.position.set(tileX * this.tileSize + overlap / 2, -0.5, tileZ * this.tileSize + overlap / 2);
        
        const tile = {
            main: baseMesh,
            second: null
        };
        if (this.config.hasSecondTerrain) {
            tile.second = this.createTile_second(state, tileX, tileZ);
            this.scene.add(tile.second);
        }

        return tile;
    }

    createTile_second(state, tileX, tileZ) {
        const secondConfig = this.config.secondTerrain;
        const overlap = secondConfig.overlap || 0.2;
        const geometry = new THREE.PlaneGeometry(this.tileSize + overlap, this.tileSize + overlap, this.segments, this.segments);
        geometry.rotateX(-Math.PI / 2);
        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const localX = positions.getX(i);
            const localZ = positions.getZ(i);
            const worldX = tileX * this.tileSize + localX;
            const worldZ = tileZ * this.tileSize + localZ;
            let height = this.getTerrainHeight_second(state, worldX, worldZ);
            // height = height - 450
            // height = height > 30 ? 30 + (height - 30)/10 : height;
            positions.setY(i, height);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();

        const baseMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(secondConfig.color || 0xaaaaaa),
            metalness: 0.0,
            roughness: 1.0,
            map: this.loadedSecondTextures.map,
            displacementMap: this.loadedSecondTextures.displacementMap,
            ...(this.loadedSecondTextures.aoMap && { aoMap: this.loadedSecondTextures.aoMap }),
            roughnessMap: this.loadedSecondTextures.roughnessMap,
            normalMap: this.loadedSecondTextures.normalMap,
            ...(this.loadedSecondTextures.emissiveMap && { emissiveIntensity: 1.5, emissive: 0x9e5700,  emissiveMap: this.loadedSecondTextures.emissiveMap }),
            opacity: secondConfig.terrainOpacity || 1.0,
            transparent: secondConfig.terrainOpacity !== undefined,
            side: THREE.DoubleSide // Make visible from both sides
        });

        const baseMesh = new THREE.Mesh(geometry, baseMaterial);
        baseMesh.receiveShadow = true;

        baseMesh.position.set(tileX * this.tileSize + overlap / 2, -0.5, tileZ * this.tileSize + overlap / 2);
        return baseMesh;
    }

    isColliding(state, position) {
        const { x: worldX, z: worldZ, y: pointY } = position;
        // If inside runway, terrain height is immediately 0
        if (Math.abs(worldX) <= state.constants.RUNWAY_WIDTH/2 && Math.abs(worldZ) <= state.constants.RUNWAY_LENGTH/2) {
            return false;
        }
        if(this.config.secondTerrain) {
        const terrainHeight = this.getTerrainHeight(state, worldX, worldZ);
        const secondTerrainHeight = this.getTerrainHeight_second(state, worldX, worldZ);
        if (this.config.secondTerrain && this.config.secondTerrain.inverted) {
            return pointY < terrainHeight || pointY > secondTerrainHeight;
        }
        return pointY < terrainHeight || pointY < secondTerrainHeight;
        } else {
            const terrainHeight = this.getTerrainHeight(state, worldX, worldZ);
            return pointY < terrainHeight;
        }
    }
}