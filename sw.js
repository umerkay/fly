// // Texture paths from textures.js
const textureFiles = [
  '/sky/day.exr',
  '/sky/sunset.exr',
  '/sky/overcast.exr',
  '/sky/night.exr',
  // Ground - Sand
  '/textures/ground/sand/Ground079L_1K-JPG_Color.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_Displacement.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_Roughness.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_NormalGL.jpg',
  // Ground - Grass
  '/textures/ground/grass/Grass008_1K-JPG_Color.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_Displacement.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_Roughness.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_NormalGL.jpg',
  // Ground - Dirt
  '/textures/ground/dirt/Ground048_1K-JPG_Color.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_Displacement.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_Roughness.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_NormalGL.jpg',
//   Ground - Rock
  '/textures/ground/rock/Rock029_1K-JPG_Color.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_Displacement.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_Roughness.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_NormalGL.jpg',
//   Ground - Snow
  '/textures/ground/snow/Snow008A_1K-JPG_Color.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_Displacement.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_Roughness.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_NormalGL.jpg',
  // Ground - Road
  '/textures/ground/road/Road006_1K-JPG_Color.jpg',
  '/textures/ground/road/Road006_1K-JPG_Displacement.jpg',
//   '/textures/ground/road/Road006_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/road/Road006_1K-JPG_Roughness.jpg',
  '/textures/ground/road/Road006_1K-JPG_NormalGL.jpg',
  // Ground - Water
//   '/textures/ground/water/Water_002_COLOR.jpg',
//   '/textures/ground/water/Water_002_DISP.png',
//   '/textures/ground/water/Water_002_OCC.jpg',
//   '/textures/ground/water/Water_002_ROUGH.jpg',
//   '/textures/ground/water/Water_002_NORM.jpg',
  // Ground - Dark Rock
//   '/textures/ground/darkrock/Rock035_1K-JPG_Color.jpg',
//   '/textures/ground/darkrock/Rock035_1K-JPG_Displacement.jpg',
//   '/textures/ground/darkrock/Rock035_1K-JPG_AmbientOcclusion.jpg',
//   '/textures/ground/darkrock/Rock035_1K-JPG_Roughness.jpg',
//   '/textures/ground/darkrock/Rock035_1K-JPG_NormalGL.jpg',
  // Ground - Lava
  '/textures/ground/lava/Lava001_1K-JPG_Color.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_Displacement.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_Roughness.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_NormalGL.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_Emission.jpg',
  // Ground - Rock2
  '/textures/ground/rock2/Rocks011_1K-JPG_Color.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_Displacement.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_Roughness.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_NormalGL.jpg'
];

// // Model paths from aircraftModels.js
const modelFiles = [
  '/model/model.glb',
  '/model/G3_LARC_GND_0824.glb',
  '/model/G3_LARC_AIR_0824.glb',
  '/model/uploads_files_800312_Harrier.glb',
];
const cacheName = 'flightsim-v1.0.5'; // ⬅️ Bump version to invalidate old cache

const filesToCache = [
  '/',
  '/index.js',
  '/about.html',
  '/manifest.json',
  // Images
  '/img/cavern-min.jpeg',
  '/img/d-min.jpeg',
  '/img/desert-min.jpeg',
  '/img/dolomites-min.jpeg',
  '/img/hills-min.jpeg',
  '/img/iceberg-min.jpeg',
  '/img/lava-min.jpeg',
  '/img/mountain-min.jpeg',
  '/img/ocean-min.jpeg',
  '/img/snow-min.jpeg',
  // Models
  '/model/G3_LARC_AIR_0824.glb',
  '/model/G3_LARC_GND_0824.glb',
  '/model/model.glb',
  '/model/uploads_files_800312_Harrier.glb',
  // Icons
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/Image 07-04-2025 at 14.02.jpg',
  // Textures: asphalt
  '/textures/ground/asphalt/Asphalt025C.png',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG.mtlx',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG.usdc',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG_Color.jpg',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG_Displacement.jpg',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG_NormalDX.jpg',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG_NormalGL.jpg',
  '/textures/ground/asphalt/Asphalt025C_1K-JPG_Roughness.jpg',
  '/textures/ground/asphalt/Asphalt026C.png',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG.mtlx',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG.usdc',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG_Color.jpg',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG_Displacement.jpg',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG_NormalDX.jpg',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG_NormalGL.jpg',
  '/textures/ground/asphalt/Asphalt026C_1K-JPG_Roughness.jpg',
  // Textures: darkrock
  '/textures/ground/darkrock/Rock035.png',
  '/textures/ground/darkrock/Rock035_1K-JPG.mtlx',
  '/textures/ground/darkrock/Rock035_1K-JPG.usdc',
  '/textures/ground/darkrock/Rock035_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/darkrock/Rock035_1K-JPG_Color.jpg',
  '/textures/ground/darkrock/Rock035_1K-JPG_Displacement.jpg',
  '/textures/ground/darkrock/Rock035_1K-JPG_NormalDX.jpg',
  '/textures/ground/darkrock/Rock035_1K-JPG_NormalGL.jpg',
  '/textures/ground/darkrock/Rock035_1K-JPG_Roughness.jpg',
  // Textures: dirt
  '/textures/ground/dirt/Ground048.png',
  '/textures/ground/dirt/Ground048_1K-JPG.mtlx',
  '/textures/ground/dirt/Ground048_1K-JPG.usdc',
  '/textures/ground/dirt/Ground048_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_Color.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_Displacement.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_NormalDX.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_NormalGL.jpg',
  '/textures/ground/dirt/Ground048_1K-JPG_Roughness.jpg',
  // Textures: grass
  '/textures/ground/grass/Grass008.png',
  '/textures/ground/grass/Grass008_1K-JPG.mtlx',
  '/textures/ground/grass/Grass008_1K-JPG.usdc',
  '/textures/ground/grass/Grass008_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_Color.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_Displacement.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_NormalDX.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_NormalGL.jpg',
  '/textures/ground/grass/Grass008_1K-JPG_Roughness.jpg',
  // Textures: lava
  '/textures/ground/lava/Lava001_1K-JPG_Color.jpg',
  '/textures/ground/lava/Lava002_1K-JPG.mtlx',
  '/textures/ground/lava/Lava002_1K-JPG.usdc',
  '/textures/ground/lava/Lava002_1K-JPG_Color.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_Displacement.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_Emission.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_NormalDX.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_NormalGL.jpg',
  '/textures/ground/lava/Lava002_1K-JPG_Roughness.jpg',
  // Textures: road
  '/textures/ground/road/Road006.png',
  '/textures/ground/road/Road006_1K-JPG.mtlx',
  '/textures/ground/road/Road006_1K-JPG.usdc',
  '/textures/ground/road/Road006_1K-JPG_Color.jpg',
  '/textures/ground/road/Road006_1K-JPG_Displacement.jpg',
  '/textures/ground/road/Road006_1K-JPG_NormalDX.jpg',
  '/textures/ground/road/Road006_1K-JPG_NormalGL.jpg',
  '/textures/ground/road/Road006_1K-JPG_Roughness.jpg',
  // Textures: rock
  '/textures/ground/rock/Rock029.png',
  '/textures/ground/rock/Rock029_1K-JPG.mtlx',
  '/textures/ground/rock/Rock029_1K-JPG.usdc',
  '/textures/ground/rock/Rock029_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_Color.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_Displacement.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_NormalDX.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_NormalGL.jpg',
  '/textures/ground/rock/Rock029_1K-JPG_Roughness.jpg',
  // Textures: rock2
  '/textures/ground/rock2/Rocks011.png',
  '/textures/ground/rock2/Rocks011_1K-JPG.mtlx',
  '/textures/ground/rock2/Rocks011_1K-JPG.usdc',
  '/textures/ground/rock2/Rocks011_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_Color.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_Displacement.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_NormalDX.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_NormalGL.jpg',
  '/textures/ground/rock2/Rocks011_1K-JPG_Roughness.jpg',
  // Textures: sand
  '/textures/ground/sand/Ground079L.png',
  '/textures/ground/sand/Ground079L_1K-JPG.mtlx',
  '/textures/ground/sand/Ground079L_1K-JPG.usdc',
  '/textures/ground/sand/Ground079L_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_Color.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_Displacement.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_NormalDX.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_NormalGL.jpg',
  '/textures/ground/sand/Ground079L_1K-JPG_Roughness.jpg',
  // Textures: snow
  '/textures/ground/snow/Snow008A_1K-JPG.mtlx',
  '/textures/ground/snow/Snow008A_1K-JPG.usdc',
  '/textures/ground/snow/Snow008A_1K-JPG_AmbientOcclusion.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_Color.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_Displacement.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_NormalDX.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_NormalGL.jpg',
  '/textures/ground/snow/Snow008A_1K-JPG_Roughness.jpg',
  // Textures: water
  '/textures/ground/water/Material_604.png',
  '/textures/ground/water/Water_002_COLOR.jpg',
  '/textures/ground/water/Water_002_DISP.png',
  '/textures/ground/water/Water_002_NORM.jpg',
  '/textures/ground/water/Water_002_OCC.jpg',
  '/textures/ground/water/Water_002_ROUGH.jpg',
  // External libraries
  'https://cdn.jsdelivr.net/npm/nipplejs@0.9.0/dist/nipplejs.min.js',
  'https://cdn.jsdelivr.net/npm/noisejs@2.1.0/index.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.175.0/build/three.module.js'
];

filesToCache.push(...textureFiles);
filesToCache.push(...modelFiles);

// ✅ Install
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return Promise.all(
        filesToCache.map(url => {
          return cache.add(url).catch(error => {
            console.error(`Failed to cache: ${url}`, error);
            // Continue with other files even if one fails
            return Promise.resolve();
          });
        })
      );
    })
  );
});

// ✅ Activate and clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ✅ Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      // If it's a .glb file, cache it after fetching
      if (event.request.url.endsWith('.glb')) {
        return fetch(event.request).then(networkResponse => {
          return caches.open(cacheName).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          return new Response("You're offline and this model isn't cached.", {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      }
      // Default fetch for other requests
      return fetch(event.request).catch(() => {
        return new Response("You're offline and this resource isn't cached.", {
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
