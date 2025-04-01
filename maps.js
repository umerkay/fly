export const maps = {
    desert: {
        maxTerrainHeight: 30,
        tileSize: 1500,
        segments: 64,
        activeRange: 3,
        noiseScale: 0.003,
        groundType: 'sand2',      // used for texture lookup from textures.js
        skyType: 'day',         // used for sky textures
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.3,
        directionalLightIntensity: 1.5
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
        groundType: 'dirt',      // uses sand texture from textures.js
        skyType: 'day',
        doBuildings: false,
        doTrees: false,
        doMountainTerrain: true,
        doFog: false,
        doAmbientLight: true,
        doDirectionalLight: true,
        ambientLightIntensity: 1.2,
        directionalLightIntensity: 1,
        repeatX: 10,
        repeatY: 10,
        rugged: true
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
        repeatY: 5,
    },
    // ...other map configurations can be added here...
};

export function getCurrentMapConfig(selectedMap = 'mountain') {
    return maps[selectedMap];
}
