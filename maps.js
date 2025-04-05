export const maps = {
    desert: {
        maxTerrainHeight: 50,
        tileSize: 1500,
        segments: 64,
        activeRange: 3,
        noiseScale: 0.0003,
        groundType: 'sand',      // used for texture lookup from textures.js
        skyType: 'day',         // used for sky textures
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.3,
        directionalLightIntensity: 1.5,
        rugged: true,
        color: 0xd1862a
        // ...other map-specific properties...
    },
    hilly: {
        maxTerrainHeight: 120,
        tileSize: 1500,
        segments: 128,
        activeRange: 1,
        noiseScale: 0.002,
        groundType: 'grass',      // uses grass texture from textures.js
        skyType: 'overcast',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 0.75,
        directionalLightIntensity: 0.5,
        repeatX: 20,
        repeatY: 20,
        // ...other map-specific properties...
    },
    mountain: {
        maxTerrainHeight: 200,
        tileSize: 1500,
        segments: 150,
        activeRange: 2,
        noiseScale: 0.0005,
        groundType: 'rock',      // uses sand texture from textures.js
        skyType: 'day',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.2,
        directionalLightIntensity: 1,
        repeatX: 5,
        repeatY: 5,
        rugged: true,
        // hasSecondTerrain: true, // Enable second terrain
        // secondTerrain: {
        //     maxTerrainHeight: 150,
        //     color: 0x000000,
        //     noiseScale: 0.0008,
        //     groundType: 'snow',
        //     repeatX: 5,
        //     repeatY: 5,
        //     rugged: true,
        // }
    },
    //snowfield
    snowfield: {
        maxTerrainHeight: 50,
        tileSize: 1500,
        segments: 64,
        activeRange: 1,
        noiseScale: 0.003,
        groundType: 'snow',      // uses snow texture from textures.js
        skyType: 'day',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.3,
        directionalLightIntensity: 1.5,
        color: 0xFFFFFF,
        repeatX: 5,
        repeatY: 5
    },
    lavaland: {

        maxTerrainHeight: 100,
        tileSize: 1500,
        segments: 150,
        activeRange: 2,
        noiseScale: 0.0005,
        groundType: 'darkrock',      // uses sand texture from textures.js
        skyType: 'overcast',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: true,
        fogColor: 0x424242,
        doAmbientLight: true,
        doDirectionalLight: false,
        ambientLightIntensity: 0.5,
        // directionalLightIntensity: 1,
        repeatX: 5,
        repeatY: 5,
        rugged: true,
        hasSecondTerrain: true, // Enable second terrain
        secondTerrain: {
            maxTerrainHeight: 70,
            color: 0x000000,
            noiseScale: 0.0008,
            groundType: 'lava',
            repeatX: 5,
            repeatY: 5,
            rugged: true,
        }
    },
    ocean: {
        maxTerrainHeight: 0,
        tileSize: 1500,
        segments: 64,
        activeRange: 3,
        noiseScale: 0.003,
        groundType: 'water',      // used for texture lookup from textures.js
        skyType: 'day',         // used for sky textures
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: true,
        fogColor: 0x828282,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.3,
        directionalLightIntensity: 1.5,
        color: 0xaaaaaa,
        terrainOpacity: 0.6,
        metallness: 1,
        roughness: 0.7,
        hasSecondTerrain: true, // Enable second terrain
        staticHeight: -1,       // Set static height for water
        secondTerrain: {
            maxTerrainHeight: 100,
            noiseScale: 0.0002,
            groundType: 'sand',
            doIslandTerrain: true,
            repeatX: 50,
            repeatY: 50,
            // color: 0x8B4513
        },
        updateTerrain: (tile, deltaTime = 0.03) => {
            const material = tile.material;
            if (material.map) {
                const speed = -0.0005; // Adjust speed of water flow
                material.map.offset.x += speed * deltaTime;
                material.map.offset.y += speed * deltaTime;
                material.displacementMap.offset.x += speed * deltaTime;
                material.displacementMap.offset.y += speed * deltaTime;
                material.roughnessMap.offset.x += speed * deltaTime;
                material.roughnessMap.offset.y += speed * deltaTime;
                material.normalMap.offset.x += speed * deltaTime;
                material.normalMap.offset.y += speed * deltaTime;
                material.aoMap.offset.x += speed * deltaTime;
                material.aoMap.offset.y += speed * deltaTime;
            }
        }
    },
    iceberg: {
        maxTerrainHeight: 0,
        tileSize: 1500,
        segments: 64,
        activeRange: 3,
        noiseScale: 0.003,
        groundType: 'water',      // used for texture lookup from textures.js
        skyType: 'overcast',         // used for sky textures
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: true,
        fogColor: 0x828282,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.3,
        directionalLightIntensity: 1.5,
        color: 0xaaaaaa,
        terrainOpacity: 1,
        metallness: 1,
        roughness: 0.7,
        hasSecondTerrain: true, // Enable second terrain
        staticHeight: -1,       // Set static height for water
        secondTerrain: {
            maxTerrainHeight: 50,
            noiseScale: 0.001,
            groundType: 'snow',
            terrainOffset: -210,
            iceberg: true,
            repeatX: 50,
            repeatY: 50,
            // color: 0x8B4513
        },
        updateTerrain: (tile, deltaTime = 0.03) => {
            const material = tile.material;
            if (material.map) {
                const speed = -0.0005; // Adjust speed of water flow
                material.map.offset.x += speed * deltaTime;
                material.map.offset.y += speed * deltaTime;
                material.displacementMap.offset.x += speed * deltaTime;
                material.displacementMap.offset.y += speed * deltaTime;
                material.roughnessMap.offset.x += speed * deltaTime;
                material.roughnessMap.offset.y += speed * deltaTime;
                material.normalMap.offset.x += speed * deltaTime;
                material.normalMap.offset.y += speed * deltaTime;
                material.aoMap.offset.x += speed * deltaTime;
                material.aoMap.offset.y += speed * deltaTime;
            }
        }
    },
    cavern: {

        amplify: true,
        maxTerrainHeight: 50,
        tileSize: 1000,
        segments: 150,
        activeRange: 1,
        noiseScale: 0.008,
        groundType: 'rock',      // uses sand texture from textures.js
        skyType: 'black',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: true,
        fogColor: 9,
        doAmbientLight: true,
        doDirectionalLight: false,
        ambientLightIntensity: 0.2,
        // directionalLightIntensity: 1,
        repeatX: 5,
        repeatY: 5,
        rugged: true,
        hasSecondTerrain: true, // Enable second terrain
        secondTerrain: {
            amplify: true,
            maxTerrainHeight: -100,
            color: 0x000000,
            inverted: true,
            noiseScale: 0.005,
            groundType: 'rock',
            repeatX: 5,
            repeatY: 5,
            terrainOffset: 1000,
            rugged: true,
        }
    },
    dolomites: {
        maxTerrainHeight: 150,
        tileSize: 1500,
        segments: 128,
        activeRange: 1,
        noiseScale: 0.002,
        groundType: 'grass',      // uses grass texture from textures.js
        skyType: 'day',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        color: 0x00ad28,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1,
        directionalLightIntensity: 1.5,
        repeatX: 20,
        repeatY: 20,
        hasSecondTerrain: true, // Enable second terrain
        secondTerrain: {
            maxTerrainHeight: 50,
            color: 0x000000,
            noiseScale: 0.0008,
            doDolomites: true,
            groundType: 'rock2',
            repeatX: 10,
            repeatY: 10,
            rugged: true,
        }
        // ...other map-specific properties...
    },
};

export function getCurrentMapConfig(selectedMap = 'mountain') {
    return maps[selectedMap];
}
