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
];
const cacheName = 'flightsim-v1.0.5'; // ⬅️ Bump version to invalidate old cache

const filesToCache = [
  '/',
  // '/index.html',
  // '/style.css',
  '/index.js',
  '/about.html',
  '/img/mountain.jpeg',
  '/img/lava.jpeg',
  '/img/iceberg.jpeg',
  '/img/ocean.jpeg',
  '/img/dolomites.jpeg',
  '/img/cavern.jpeg',
  '/img/snow.jpeg',
  '/img/desert.jpeg',
  '/manifest.json',
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
      return response || fetch(event.request).catch(() => {
        // Optional fallback (like offline.html)
        return new Response("You're offline and this resource isn't cached.", {
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
