// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string' && process.type != 'renderer';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -sPROXY_TO_WORKER) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

// The way we signal to a worker that it is hosting a pthread is to construct
// it with a specific name.
var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name?.startsWith('em-pthread');

if (ENVIRONMENT_IS_NODE) {
  // `require()` is no-op in an ESM module, use `createRequire()` to construct
  // the require()` function.  This is only necessary for multi-environment
  // builds, `-sENVIRONMENT=node` emits a static import declaration instead.
  // TODO: Swap all `require()`'s with `import()`'s?

  var worker_threads = require('worker_threads');
  global.Worker = worker_threads.Worker;
  ENVIRONMENT_IS_WORKER = !worker_threads.isMainThread;
  // Under node we set `workerData` to `em-pthread` to signal that the worker
  // is hosting a pthread.
  ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && worker_threads['workerData'] == 'em-pthread'
}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// include: C:\Users\jcarl\AppData\Local\Temp\tmpzdl8xg3g.js

  Module['expectedDataFileDownloads'] ??= 0;
  Module['expectedDataFileDownloads']++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    var isNode = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
    function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = 'flowers_oop2.nim.data';
      var REMOTE_PACKAGE_BASE = 'flowers_oop2.nim.data';
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (isNode) {
          require('fs').readFile(packageName, (err, contents) => {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
        Module['dataFileDownloads'] ??= {};
        fetch(packageName)
          .catch((cause) => Promise.reject(new Error(`Network Error: ${packageName}`, {cause}))) // If fetch fails, rewrite the error to include the failing URL & the cause.
          .then((response) => {
            if (!response.ok) {
              return Promise.reject(new Error(`${response.status}: ${response.url}`));
            }

            if (!response.body && response.arrayBuffer) { // If we're using the polyfill, readers won't be available...
              return response.arrayBuffer().then(callback);
            }

            const reader = response.body.getReader();
            const iterate = () => reader.read().then(handleChunk).catch((cause) => {
              return Promise.reject(new Error(`Unexpected error while handling : ${response.url} ${cause}`, {cause}));
            });

            const chunks = [];
            const headers = response.headers;
            const total = Number(headers.get('Content-Length') ?? packageSize);
            let loaded = 0;

            const handleChunk = ({done, value}) => {
              if (!done) {
                chunks.push(value);
                loaded += value.length;
                Module['dataFileDownloads'][packageName] = {loaded, total};

                let totalLoaded = 0;
                let totalSize = 0;

                for (const download of Object.values(Module['dataFileDownloads'])) {
                  totalLoaded += download.loaded;
                  totalSize += download.total;
                }

                Module['setStatus']?.(`Downloading data... (${totalLoaded}/${totalSize})`);
                return iterate();
              } else {
                const packageData = new Uint8Array(chunks.map((c) => c.length).reduce((a, b) => a + b, 0));
                let offset = 0;
                for (const chunk of chunks) {
                  packageData.set(chunk, offset);
                  offset += chunk.length;
                }
                callback(packageData.buffer);
              }
            };

            Module['setStatus']?.('Downloading data...');
            return iterate();
          });
      };

      function handleError(error) {
        console.error('package error:', error);
      };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, (data) => {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

    function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "resources", true, true);
Module['FS_createPath']("/resources", "glTF-Sample-Assets", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/.github", "workflows", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets", ".reuse", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets", "LICENSES", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets", "Models", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "ABeautifulGame", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ABeautifulGame", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ABeautifulGame", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AlphaBlendModeTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnimatedColorsCube", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedColorsCube", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedColorsCube", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedColorsCube", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnimatedCube", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedCube", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedCube", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnimatedMorphCube", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedMorphCube", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedMorphCube", "glTF-Quantized", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedMorphCube", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedMorphCube", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnimatedTriangle", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedTriangle", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedTriangle", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnimatedTriangle", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnisotropyBarnLamp", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp", "glTF-KTX-BasisU", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnisotropyDiscTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnisotropyRotationTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AnisotropyStrengthTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AntiqueCamera", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AntiqueCamera", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AntiqueCamera", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AntiqueCamera", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "AttenuationTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AttenuationTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AttenuationTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/AttenuationTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Avocado", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Avocado", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Avocado", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Avocado", "glTF-Quantized", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Avocado", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Avocado", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BarramundiFish", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BarramundiFish", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BarramundiFish", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BarramundiFish", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BarramundiFish", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoomBox", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoomBox", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoomBox", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoomBox", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoomBox", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoomBoxWithAxes", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Box With Spaces", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box With Spaces", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box With Spaces", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Box", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Box", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoxAnimated", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxAnimated", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxAnimated", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxAnimated", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxAnimated", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoxInterleaved", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxInterleaved", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxInterleaved", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxInterleaved", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxInterleaved", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoxTextured", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTextured", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTextured", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTextured", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTextured", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoxTexturedNonPowerOfTwo", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BoxVertexColors", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxVertexColors", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxVertexColors", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxVertexColors", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BoxVertexColors", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "BrainStem", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BrainStem", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BrainStem", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BrainStem", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BrainStem", "glTF-Meshopt", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BrainStem", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/BrainStem", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Cameras", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Cameras", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Cameras", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Cameras", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CarbonFibre", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CarbonFibre", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CarbonFibre", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CarbonFibre", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CesiumMan", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMan", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMan", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMan", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMan", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMan", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CesiumMilkTruck", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMilkTruck", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMilkTruck", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMilkTruck", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMilkTruck", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CesiumMilkTruck", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "ChairDamaskPurplegold", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "ClearCoatCarPaint", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "ClearCoatTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearCoatTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearCoatTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearCoatTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "ClearcoatWicker", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearcoatWicker", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearcoatWicker", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ClearcoatWicker", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareAlphaCoverage", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareAmbientOcclusion", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareAnisotropy", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAnisotropy", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAnisotropy", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareAnisotropy", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareBaseColor", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareBaseColor", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareBaseColor", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareBaseColor", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareClearcoat", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareClearcoat", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareClearcoat", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareClearcoat", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareDispersion", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareDispersion", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareDispersion", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareDispersion", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareEmissiveStrength", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareIor", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareIor", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareIor", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareIor", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareIridescence", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareIridescence", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareIridescence", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareIridescence", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareMetallic", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareMetallic", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareMetallic", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareMetallic", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareNormal", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareNormal", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareNormal", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareNormal", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareRoughness", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareRoughness", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareRoughness", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareRoughness", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareSheen", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareSheen", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareSheen", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareSheen", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareSpecular", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareSpecular", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareSpecular", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareSpecular", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareTransmission", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareTransmission", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareTransmission", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareTransmission", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "CompareVolume", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareVolume", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareVolume", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/CompareVolume", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Corset", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Corset", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Corset", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Corset", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Corset", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Cube", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Cube", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Cube", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DamagedHelmet", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DamagedHelmet", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DamagedHelmet", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DamagedHelmet", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DamagedHelmet", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DiffuseTransmissionPlant", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DiffuseTransmissionTeacup", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DirectionalLight", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DirectionalLight", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DirectionalLight", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DirectionalLight", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DispersionTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DispersionTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DispersionTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DispersionTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DragonAttenuation", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonAttenuation", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonAttenuation", "glTF-Meshopt", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonAttenuation", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonAttenuation", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "DragonDispersion", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonDispersion", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonDispersion", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/DragonDispersion", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Duck", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Duck", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Duck", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Duck", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Duck", "glTF-Quantized", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Duck", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Duck", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "EmissiveStrengthTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "EnvironmentTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EnvironmentTest", "glTF-IBL", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF-IBL", "EnvironmentTest_images", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EnvironmentTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF", "EnvironmentTest_images", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/EnvironmentTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "FlightHelmet", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/FlightHelmet", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/FlightHelmet", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Fox", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Fox", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Fox", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Fox", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "GlamVelvetSofa", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlamVelvetSofa", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlamVelvetSofa", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlamVelvetSofa", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "GlassBrokenWindow", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassBrokenWindow", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassBrokenWindow", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassBrokenWindow", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "GlassHurricaneCandleHolder", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "GlassVaseFlowers", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassVaseFlowers", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassVaseFlowers", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/GlassVaseFlowers", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IORTestGrid", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IORTestGrid", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IORTestGrid", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IORTestGrid", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "InterpolationTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/InterpolationTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/InterpolationTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/InterpolationTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IridescenceAbalone", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceAbalone", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceAbalone", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceAbalone", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IridescenceDielectricSpheres", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/glTF", "textures", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IridescenceLamp", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceLamp", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceLamp", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceLamp", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IridescenceMetallicSpheres", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/glTF", "textures", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IridescenceSuzanne", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceSuzanne", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceSuzanne", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescenceSuzanne", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "IridescentDishWithOlives", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF", "node_modules", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", ".bin", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "accepts", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "array-flatten", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "body-parser", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/lib", "types", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "bytes", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "call-bind", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "content-disposition", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "content-type", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "cookie-signature", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "cookie", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "debug", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug", "src", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "define-data-property", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "depd", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/lib", "browser", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "destroy", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "ee-first", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "encodeurl", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "es-define-property", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "es-errors", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "escape-html", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "etag", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "express", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib", "middleware", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib", "router", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "finalhandler", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "forwarded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "fresh", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "function-bind", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "get-intrinsic", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "gopd", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "has-property-descriptors", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "has-proto", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "has-symbols", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/test", "shams", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "hasown", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "http-errors", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "iconv-lite", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite", "encodings", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings", "tables", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "inherits", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "ipaddr.js", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "media-typer", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "merge-descriptors", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "methods", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "mime-db", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "mime-types", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "mime", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime", "src", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "ms", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "negotiator", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "object-inspect", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect", "example", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test", "browser", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "on-finished", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "parseurl", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "path-to-regexp", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "proxy-addr", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "qs", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs", "dist", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs", "lib", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "range-parser", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "raw-body", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "safe-buffer", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "safer-buffer", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "send", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send", "node_modules", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules", "encodeurl", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules", "ms", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "serve-static", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "set-function-length", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "setprototypeof", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "side-channel", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel", ".github", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel", "test", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "statuses", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "toidentifier", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "type-is", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "unpipe", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "utils-merge", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules", "vary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Lantern", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Lantern", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Lantern", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Lantern", "glTF-Quantized", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Lantern", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Lantern", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "LightsPunctualLamp", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/LightsPunctualLamp", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/LightsPunctualLamp", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/LightsPunctualLamp", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MandarinOrange", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MandarinOrange", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MandarinOrange", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MaterialsVariantsShoe", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MeshPrimitiveModes", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MetalRoughSpheres", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheres", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheres", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheres", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheres", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MetalRoughSpheresNoTextures", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MorphPrimitivesTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MorphStressTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphStressTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphStressTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MorphStressTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MosquitoInAmber", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MosquitoInAmber", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MosquitoInAmber", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MosquitoInAmber", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MultiUVTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultiUVTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultiUVTest", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultiUVTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultiUVTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "MultipleScenes", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultipleScenes", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultipleScenes", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/MultipleScenes", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "NegativeScaleTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NegativeScaleTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NegativeScaleTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NegativeScaleTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "NodePerformanceTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NodePerformanceTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NodePerformanceTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "NormalTangentMirrorTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "NormalTangentTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NormalTangentTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NormalTangentTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/NormalTangentTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "OrientationTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/OrientationTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/OrientationTest", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/OrientationTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/OrientationTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "PlaysetLightTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PlaysetLightTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PlaysetLightTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "PotOfCoals", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PotOfCoals", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PotOfCoals", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PotOfCoals", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "PrimitiveModeNormalsTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "RecursiveSkeletons", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RecursiveSkeletons", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RecursiveSkeletons", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RecursiveSkeletons", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "RiggedFigure", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedFigure", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedFigure", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedFigure", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedFigure", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedFigure", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "RiggedSimple", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedSimple", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedSimple", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedSimple", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedSimple", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/RiggedSimple", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SciFiHelmet", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SciFiHelmet", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SciFiHelmet", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SheenChair", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenChair", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenChair", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenChair", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SheenCloth", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenCloth", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenCloth", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SheenTestGrid", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenTestGrid", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenTestGrid", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenTestGrid", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SheenWoodLeatherSofa", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleInstancing", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleInstancing", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleInstancing", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleInstancing", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleMaterial", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMaterial", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMaterial", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMaterial", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleMeshes", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMeshes", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMeshes", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMeshes", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleMorph", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMorph", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMorph", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleMorph", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleSkin", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleSkin", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleSkin", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleSkin", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleSparseAccessor", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SimpleTexture", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleTexture", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleTexture", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SimpleTexture", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SpecGlossVsMetalRough", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SpecularSilkPouf", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecularSilkPouf", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecularSilkPouf", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecularSilkPouf", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "SpecularTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecularTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecularTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/SpecularTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Sponza", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Sponza", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Sponza", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "StainedGlassLamp", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/StainedGlassLamp", "glTF-JPG-PNG", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/StainedGlassLamp", "glTF-KTX-BasisU", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/StainedGlassLamp", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/StainedGlassLamp", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Suzanne", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Suzanne", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Suzanne", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TextureCoordinateTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureCoordinateTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureCoordinateTest", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureCoordinateTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureCoordinateTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TextureEncodingTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureEncodingTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureEncodingTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureEncodingTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TextureLinearInterpolationTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TextureSettingsTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureSettingsTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureSettingsTest", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureSettingsTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureSettingsTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TextureTransformMultiTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TextureTransformTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureTransformTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TextureTransformTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "ToyCar", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ToyCar", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ToyCar", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/ToyCar", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TransmissionRoughnessTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TransmissionTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF", "TransmissionTest_images", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TransmissionThinwallTestGrid", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Triangle", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Triangle", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Triangle", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Triangle", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TriangleWithoutIndices", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "TwoSidedPlane", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TwoSidedPlane", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/TwoSidedPlane", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "Unicode\u2764\u267bTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "UnlitTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/UnlitTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/UnlitTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/UnlitTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "VertexColorTest", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VertexColorTest", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VertexColorTest", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VertexColorTest", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VertexColorTest", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "VirtualCity", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VirtualCity", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VirtualCity", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VirtualCity", "glTF-Embedded", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VirtualCity", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/VirtualCity", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "WaterBottle", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/WaterBottle", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/WaterBottle", "glTF-Draco", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/WaterBottle", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/WaterBottle", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models", "XmpMetadataRoundedCube", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube", "glTF-Binary", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube", "glTF", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/glTF", "MODEL_ROUNDED_CUBE_PART_1", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube", "screenshot", true, true);
Module['FS_createPath']("/resources/glTF-Sample-Assets", "util", true, true);
Module['FS_createPath']("/resources", "images", true, true);
Module['FS_createPath']("/resources/images", "all_probes", true, true);
Module['FS_createPath']("/resources/images/all_probes", "stpeters_cross", true, true);
Module['FS_createPath']("/resources", "shaders", true, true);
Module['FS_createPath']("/resources/shaders", "glsl330", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency'](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency'](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_flowers_oop2.nim.data');

      };
      Module['addRunDependency']('datafile_flowers_oop2.nim.data');

      Module['preloadResults'] ??= {};

      Module['preloadResults'][PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

    }
    if (Module['calledRun']) {
      runWithFS(Module);
    } else {
      (Module['preRun'] ??= []).push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/resources/JoeSkinTexcoordDisplacerKickUpdate2Export.bin", "start": 0, "end": 173540}, {"filename": "/resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf", "start": 173540, "end": 306363}, {"filename": "/resources/Olives.mtl", "start": 306363, "end": 307799}, {"filename": "/resources/Olives.obj", "start": 307799, "end": 2852682}, {"filename": "/resources/glTF-Sample-Assets/.github/workflows/AssetCheck.yml", "start": 2852682, "end": 2853097}, {"filename": "/resources/glTF-Sample-Assets/.github/workflows/RebuildAllAssets.yml", "start": 2853097, "end": 2854409}, {"filename": "/resources/glTF-Sample-Assets/.github/workflows/ci.yml", "start": 2854409, "end": 2855053}, {"filename": "/resources/glTF-Sample-Assets/.gitignore", "start": 2855053, "end": 2855184}, {"filename": "/resources/glTF-Sample-Assets/.reuse/dep5", "start": 2855184, "end": 2869041}, {"filename": "/resources/glTF-Sample-Assets/.reuse/dep5.error", "start": 2869041, "end": 2869690}, {"filename": "/resources/glTF-Sample-Assets/.reuse/reuse.spdx", "start": 2869690, "end": 3601230}, {"filename": "/resources/glTF-Sample-Assets/CODE_OF_CONDUCT.md", "start": 3601230, "end": 3601511}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/Apache-2.0.txt", "start": 3601511, "end": 3612062}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/CC-BY-4.0.txt", "start": 3612062, "end": 3625364}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/CC-BY-NC-4.0.txt", "start": 3625364, "end": 3639437}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/CC0-1.0.txt", "start": 3639437, "end": 3646075}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-3DRT-Testing.txt", "start": 3646075, "end": 3647730}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-Adobe-Stock.txt", "start": 3647730, "end": 3647883}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-CC-BY-TM.txt", "start": 3647883, "end": 3661400}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-CRYENGINE-Agreement.txt", "start": 3661400, "end": 3661515}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-LegalMark-Cesium.txt", "start": 3661515, "end": 3662157}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-LegalMark-Khronos.txt", "start": 3662157, "end": 3662762}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-LegalMark-UX3D.txt", "start": 3662762, "end": 3663327}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-Poser-EULA.txt", "start": 3663327, "end": 3668852}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/LicenseRef-Stanford-Graphics.txt", "start": 3668852, "end": 3668908}, {"filename": "/resources/glTF-Sample-Assets/LICENSES/SCEA.txt", "start": 3668908, "end": 3675683}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/LICENSE.md", "start": 3675683, "end": 3676490}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/README.body.md", "start": 3676490, "end": 3679167}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/README.md", "start": 3679167, "end": 3682720}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/ABeautifulGame.bin", "start": 3682720, "end": 14512160}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/ABeautifulGame.gltf", "start": 14512160, "end": 14560208}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Bishop_black_ORM.jpg", "start": 14560208, "end": 15191158}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Bishop_white_ORM.jpg", "start": 15191158, "end": 15813929}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Castle_ORM.jpg", "start": 15813929, "end": 17185342}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Castle_normal.jpg", "start": 17185342, "end": 17676738}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Chessboard_ORM.jpg", "start": 17676738, "end": 18264795}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/King_black_ORM.jpg", "start": 18264795, "end": 19047212}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/King_black_normal.jpg", "start": 19047212, "end": 19811301}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/King_white_ORM.jpg", "start": 19811301, "end": 20633787}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/King_white_normal.jpg", "start": 20633787, "end": 21595512}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Knight_ORM.jpg", "start": 21595512, "end": 21957075}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Knight_normal.jpg", "start": 21957075, "end": 22172855}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Pawn_ORM.jpg", "start": 22172855, "end": 22965029}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Pawn_normal.jpg", "start": 22965029, "end": 23715342}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Queen_black_ORM.jpg", "start": 23715342, "end": 24456514}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Queen_black_normal.jpg", "start": 24456514, "end": 25233574}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Queen_white_ORM.jpg", "start": 25233574, "end": 25942801}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/Queen_white_normal.jpg", "start": 25942801, "end": 26605717}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/bishop_black_base_color.jpg", "start": 26605717, "end": 27013529}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/bishop_black_normal.jpg", "start": 27013529, "end": 27892232}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/bishop_white_base_color.jpg", "start": 27892232, "end": 28257181}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/bishop_white_normal.jpg", "start": 28257181, "end": 28942633}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/castle_black_base_color.jpg", "start": 28942633, "end": 29345369}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/castle_white_base_color.jpg", "start": 29345369, "end": 29683443}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/chessboard_base_color.jpg", "start": 29683443, "end": 30219589}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/chessboard_normal.jpg", "start": 30219589, "end": 30949709}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/king_black_base_color.jpg", "start": 30949709, "end": 31319747}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/king_white_base_color.jpg", "start": 31319747, "end": 31718707}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/knight_black_base_color.jpg", "start": 31718707, "end": 31967528}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/knight_white_base_color.jpg", "start": 31967528, "end": 32366995}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/pawn_black_base_color.jpg", "start": 32366995, "end": 32688144}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/pawn_white_base_color.jpg", "start": 32688144, "end": 32995773}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/queen_black_base_color.jpg", "start": 32995773, "end": 33296169}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/glTF/queen_white_base_color.jpg", "start": 33296169, "end": 33609182}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/metadata.json", "start": 33609182, "end": 33610393}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/screenshot/screenshot-babylonjs.jpg", "start": 33610393, "end": 34058641}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/screenshot/screenshot-threejs.jpg", "start": 34058641, "end": 34477693}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/screenshot/screenshot-x150.jpg", "start": 34477693, "end": 34486008}, {"filename": "/resources/glTF-Sample-Assets/Models/ABeautifulGame/screenshot/screenshot.jpg", "start": 34486008, "end": 34523633}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/LICENSE.md", "start": 34523633, "end": 34524316}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/README.body.md", "start": 34524316, "end": 34528850}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/README.md", "start": 34528850, "end": 34534163}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF-Binary/AlphaBlendModeTest.glb", "start": 34534163, "end": 37551299}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF-Embedded/AlphaBlendModeTest.gltf", "start": 37551299, "end": 41590864}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF/AlphaBlendLabels.png", "start": 41590864, "end": 41656386}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF/AlphaBlendModeTest.bin", "start": 41656386, "end": 41663162}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF/AlphaBlendModeTest.gltf", "start": 41663162, "end": 41696107}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF/MatBed_baseColor.jpg", "start": 41696107, "end": 42398821}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF/MatBed_normal.jpg", "start": 42398821, "end": 43615088}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/glTF/MatBed_occlusionRoughnessMetallic.jpg", "start": 43615088, "end": 44628761}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/metadata.json", "start": 44628761, "end": 44629519}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/BlendFail.jpg", "start": 44629519, "end": 44730936}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/CutoffDefaultFail.jpg", "start": 44730936, "end": 44811880}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/CutoffTests.jpg", "start": 44811880, "end": 44943771}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/CutoffValueFail.jpg", "start": 44943771, "end": 45024951}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/MissingBorder.png", "start": 45024951, "end": 45194510}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/OpaqueFail.jpg", "start": 45194510, "end": 45267023}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/OpaqueVsBlend.jpg", "start": 45267023, "end": 45367784}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/PremultipliedAlphaFail.jpg", "start": 45367784, "end": 45428101}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/screenshot-x150.png", "start": 45428101, "end": 45441884}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/screenshot.png", "start": 45441884, "end": 45495623}, {"filename": "/resources/glTF-Sample-Assets/Models/AlphaBlendModeTest/screenshot/screenshot_large.jpg", "start": 45495623, "end": 45584036}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/LICENSE.md", "start": 45584036, "end": 45584716}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/README.body.md", "start": 45584716, "end": 45586064}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/README.md", "start": 45586064, "end": 45588273}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/glTF-Binary/AnimatedColorsCube.glb", "start": 45588273, "end": 45603457}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/glTF/AnimatedColorsCube.bin", "start": 45603457, "end": 45614645}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/glTF/AnimatedColorsCube.gltf", "start": 45614645, "end": 45620924}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/metadata.json", "start": 45620924, "end": 45621704}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/screenshot/screenshot-large.gif", "start": 45621704, "end": 46492195}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedColorsCube/screenshot/screenshot.gif", "start": 46492195, "end": 46533303}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/LICENSE.md", "start": 46533303, "end": 46533976}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/README.body.md", "start": 46533976, "end": 46534035}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/README.md", "start": 46534035, "end": 46534702}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/glTF/AnimatedCube.bin", "start": 46534702, "end": 46536562}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/glTF/AnimatedCube.gltf", "start": 46536562, "end": 46541962}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/glTF/AnimatedCube_BaseColor.png", "start": 46541962, "end": 47433957}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/glTF/AnimatedCube_MetallicRoughness.png", "start": 47433957, "end": 47434276}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/metadata.json", "start": 47434276, "end": 47435022}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedCube/screenshot/screenshot.gif", "start": 47435022, "end": 47952191}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/LICENSE.md", "start": 47952191, "end": 47952870}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/README.body.md", "start": 47952870, "end": 47953182}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/README.md", "start": 47953182, "end": 47954326}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/glTF-Binary/AnimatedMorphCube.glb", "start": 47954326, "end": 47961078}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/glTF-Quantized/AnimatedMorphCube.bin", "start": 47961078, "end": 47962778}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/glTF-Quantized/AnimatedMorphCube.gltf", "start": 47962778, "end": 47967108}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/glTF/AnimatedMorphCube.bin", "start": 47967108, "end": 47971392}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf", "start": 47971392, "end": 47976294}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/metadata.json", "start": 47976294, "end": 47977102}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedMorphCube/screenshot/screenshot.gif", "start": 47977102, "end": 48076156}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/LICENSE.md", "start": 48076156, "end": 48076833}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/README.body.md", "start": 48076833, "end": 48077061}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/README.md", "start": 48077061, "end": 48078036}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/glTF-Embedded/AnimatedTriangle.gltf", "start": 48078036, "end": 48080336}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/glTF/AnimatedTriangle.gltf", "start": 48080336, "end": 48082397}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/glTF/animation.bin", "start": 48082397, "end": 48082497}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/glTF/simpleTriangle.bin", "start": 48082497, "end": 48082541}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/metadata.json", "start": 48082541, "end": 48083406}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/screenshot/animation.png", "start": 48083406, "end": 48135558}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/screenshot/screenshot.gif", "start": 48135558, "end": 48148289}, {"filename": "/resources/glTF-Sample-Assets/Models/AnimatedTriangle/screenshot/simpleTriangle.png", "start": 48148289, "end": 48192147}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/LICENSE.md", "start": 48192147, "end": 48192829}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/README.body.md", "start": 48192829, "end": 48202902}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/README.md", "start": 48202902, "end": 48214033}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-Binary/AnisotropyBarnLamp.glb", "start": 48214033, "end": 56774505}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp.bin", "start": 56774505, "end": 57184085}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp.gltf", "start": 57184085, "end": 57191429}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp_anisotropy.ktx2", "start": 57191429, "end": 58209415}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp_basecolor.ktx2", "start": 58209415, "end": 60336487}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp_normalbump.ktx2", "start": 60336487, "end": 60427701}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF-KTX-BasisU/AnisotropyBarnLamp_occlusionroughnessmetal.ktx2", "start": 60427701, "end": 62000596}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF/AnisotropyBarnLamp.bin", "start": 62000596, "end": 62410176}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF/AnisotropyBarnLamp.gltf", "start": 62410176, "end": 62417330}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF/AnisotropyBarnLamp_anisotropy.png", "start": 62417330, "end": 63924604}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF/AnisotropyBarnLamp_basecolor.png", "start": 63924604, "end": 67807454}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF/AnisotropyBarnLamp_normalbump.png", "start": 67807454, "end": 68008458}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/glTF/AnisotropyBarnLamp_occlusionroughnessmetal.png", "start": 68008458, "end": 70563861}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/metadata.json", "start": 70563861, "end": 70564724}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/Normalize_RG.sbsar", "start": 70564724, "end": 70565652}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/Substance_NormalizeRG.zip", "start": 70565652, "end": 70566714}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_Channels.jpg", "start": 70566714, "end": 70824242}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_Diagram.jpg", "start": 70824242, "end": 71039236}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_Normalize.jpg", "start": 71039236, "end": 71628457}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_NormalizeGraph.jpg", "start": 71628457, "end": 72101001}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_NormalizedColors.jpg", "start": 72101001, "end": 72873858}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_RemovingChannels.jpg", "start": 72873858, "end": 73340391}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_TextureCoordinates.jpg", "start": 73340391, "end": 74947491}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_Textures.jpg", "start": 74947491, "end": 75671608}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/anisotropy_WithWithout.jpg", "start": 75671608, "end": 76346975}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/reference_Photos.jpg", "start": 76346975, "end": 76592919}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/screenshot.jpg", "start": 76592919, "end": 76606364}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyBarnLamp/screenshot/screenshot_Large.jpg", "start": 76606364, "end": 76986650}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/LICENSE.md", "start": 76986650, "end": 76987330}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/README.body.md", "start": 76987330, "end": 76988614}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/README.md", "start": 76988614, "end": 76990753}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/glTF-Binary/AnisotropyDiscTest.glb", "start": 76990753, "end": 77532113}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/glTF/AnisotropyDiscTest.gltf", "start": 77532113, "end": 77554259}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/glTF/AnisotropyDiscTest_data.bin", "start": 77554259, "end": 77651579}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/glTF/AnisotropyDiscs.png", "start": 77651579, "end": 78083173}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/metadata.json", "start": 78083173, "end": 78083944}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/screenshot/screenshot.jpg", "start": 78083944, "end": 78086817}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyDiscTest/screenshot/screenshot_Large.jpg", "start": 78086817, "end": 78306835}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/LICENSE.md", "start": 78306835, "end": 78307521}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/README.body.md", "start": 78307521, "end": 78310391}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/README.md", "start": 78310391, "end": 78314155}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF-Binary/AnisotropyRotationTest.glb", "start": 78314155, "end": 79146495}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/AnisoDonutLabels.png", "start": 79146495, "end": 79171776}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/AnisoDonuts.bin", "start": 79171776, "end": 79471944}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/AnisoRotation10_Linear.png", "start": 79471944, "end": 79472043}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/AnisoRotation30_Linear.png", "start": 79472043, "end": 79472142}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/AnisotropyRotationTest.gltf", "start": 79472142, "end": 79492140}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/GridWithMarkers.png", "start": 79492140, "end": 79500310}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/GridWithMarkers_30deg.png", "start": 79500310, "end": 79990199}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/glTF/Heights_1d_Normals_v2.png", "start": 79990199, "end": 79990368}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/metadata.json", "start": 79990368, "end": 79991186}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/screenshot/fail-example.png", "start": 79991186, "end": 80555512}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/screenshot/ibl-example.png", "start": 80555512, "end": 81262708}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/screenshot/screenshot-large.png", "start": 81262708, "end": 81446224}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyRotationTest/screenshot/screenshot.png", "start": 81446224, "end": 81463931}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/LICENSE.md", "start": 81463931, "end": 81464615}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/README.body.md", "start": 81464615, "end": 81465278}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/README.md", "start": 81465278, "end": 81466820}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/glTF-Binary/AnisotropyStrengthTest.glb", "start": 81466820, "end": 81561264}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/glTF/AnisotropySpheresLabels.png", "start": 81561264, "end": 81573737}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/glTF/AnisotropyStrengthTest.gltf", "start": 81573737, "end": 81607998}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/glTF/AnisotropyStrengthTest_data.bin", "start": 81607998, "end": 81673758}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/metadata.json", "start": 81673758, "end": 81674557}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/screenshot/screenshot-large.png", "start": 81674557, "end": 81942011}, {"filename": "/resources/glTF-Sample-Assets/Models/AnisotropyStrengthTest/screenshot/screenshot.png", "start": 81942011, "end": 81985130}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/LICENSE.md", "start": 81985130, "end": 81985895}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/README.body.md", "start": 81985895, "end": 81986048}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/README.md", "start": 81986048, "end": 81987100}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb", "start": 81987100, "end": 102186748}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/AntiqueCamera.bin", "start": 102186748, "end": 102984840}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/AntiqueCamera.gltf", "start": 102984840, "end": 102993125}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/camera_camera_BaseColor.png", "start": 102993125, "end": 104843030}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/camera_camera_Normal.png", "start": 104843030, "end": 109836169}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/camera_camera_Roughness.png", "start": 109836169, "end": 112716245}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/camera_tripod_BaseColor.png", "start": 112716245, "end": 117279410}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/camera_tripod_Normal.png", "start": 117279410, "end": 120054195}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/glTF/camera_tripod_Roughness.png", "start": 120054195, "end": 122390997}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/metadata.json", "start": 122390997, "end": 122392147}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/screenshot/screenshot.jpg", "start": 122392147, "end": 122399035}, {"filename": "/resources/glTF-Sample-Assets/Models/AntiqueCamera/screenshot/screenshot_large.jpg", "start": 122399035, "end": 122520208}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/LICENSE.md", "start": 122520208, "end": 122520886}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/README.body.md", "start": 122520886, "end": 122524925}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/README.md", "start": 122524925, "end": 122529848}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/glTF-Binary/AttenuationTest.glb", "start": 122529848, "end": 122587380}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/glTF/AttenuationLabels.png", "start": 122587380, "end": 122612313}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/glTF/AttenuationTest.bin", "start": 122612313, "end": 122622897}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/glTF/AttenuationTest.gltf", "start": 122622897, "end": 122658883}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/glTF/PlainGrid.png", "start": 122658883, "end": 122659501}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/glTF/ThicknessTexture.png", "start": 122659501, "end": 122667871}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/metadata.json", "start": 122667871, "end": 122668662}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/screenshot/screenshot-large.jpg", "start": 122668662, "end": 123224510}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/screenshot/screenshot-x150.jpg", "start": 123224510, "end": 123237898}, {"filename": "/resources/glTF-Sample-Assets/Models/AttenuationTest/screenshot/screenshot.jpg", "start": 123237898, "end": 123302519}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/LICENSE.md", "start": 123302519, "end": 123303186}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/README.body.md", "start": 123303186, "end": 123303336}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/README.md", "start": 123303336, "end": 123304200}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Binary/Avocado.glb", "start": 123304200, "end": 131414240}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Draco/Avocado.bin", "start": 131414240, "end": 131422964}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Draco/Avocado.gltf", "start": 131422964, "end": 131426228}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Draco/Avocado_baseColor.png", "start": 131426228, "end": 134584957}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Draco/Avocado_normal.png", "start": 134584957, "end": 137856071}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Draco/Avocado_roughnessMetallic.png", "start": 137856071, "end": 139511130}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Quantized/Avocado.bin", "start": 139511130, "end": 139523342}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Quantized/Avocado.gltf", "start": 139523342, "end": 139527379}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Quantized/Avocado_baseColor.png", "start": 139527379, "end": 142686108}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Quantized/Avocado_normal.png", "start": 142686108, "end": 145957222}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF-Quantized/Avocado_roughnessMetallic.png", "start": 145957222, "end": 147612281}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF/Avocado.bin", "start": 147612281, "end": 147635861}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF/Avocado.gltf", "start": 147635861, "end": 147638428}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF/Avocado_baseColor.png", "start": 147638428, "end": 150797157}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF/Avocado_normal.png", "start": 150797157, "end": 154068271}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/glTF/Avocado_roughnessMetallic.png", "start": 154068271, "end": 155723330}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/metadata.json", "start": 155723330, "end": 155724050}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/screenshot/screenshot-x150.jpg", "start": 155724050, "end": 155727715}, {"filename": "/resources/glTF-Sample-Assets/Models/Avocado/screenshot/screenshot.jpg", "start": 155727715, "end": 155731129}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/LICENSE.md", "start": 155731129, "end": 155731804}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/README.body.md", "start": 155731804, "end": 155731917}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/README.md", "start": 155731917, "end": 155732770}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb", "start": 155732770, "end": 168220914}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF-Draco/BarramundiFish.bin", "start": 168220914, "end": 168264214}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF-Draco/BarramundiFish.gltf", "start": 168264214, "end": 168267665}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF-Draco/BarramundiFish_baseColor.png", "start": 168267665, "end": 173252764}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF-Draco/BarramundiFish_normal.png", "start": 173252764, "end": 176270148}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF-Draco/BarramundiFish_occlusionRoughnessMetallic.png", "start": 176270148, "end": 180625968}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF/BarramundiFish.bin", "start": 180625968, "end": 180754176}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF/BarramundiFish.gltf", "start": 180754176, "end": 180756887}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF/BarramundiFish_baseColor.png", "start": 180756887, "end": 185741986}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF/BarramundiFish_normal.png", "start": 185741986, "end": 188759370}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/glTF/BarramundiFish_occlusionRoughnessMetallic.png", "start": 188759370, "end": 193115190}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/metadata.json", "start": 193115190, "end": 193115915}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/screenshot/screenshot-x150.jpg", "start": 193115915, "end": 193118105}, {"filename": "/resources/glTF-Sample-Assets/Models/BarramundiFish/screenshot/screenshot.jpg", "start": 193118105, "end": 193120243}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/LICENSE.md", "start": 193120243, "end": 193120911}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/README.body.md", "start": 193120911, "end": 193121065}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/README.md", "start": 193121065, "end": 193121959}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Binary/BoomBox.glb", "start": 193121959, "end": 203736143}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Draco/BoomBox.bin", "start": 203736143, "end": 203807287}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Draco/BoomBox.gltf", "start": 203807287, "end": 203810854}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Draco/BoomBox_baseColor.png", "start": 203810854, "end": 207096698}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Draco/BoomBox_emissive.png", "start": 207096698, "end": 207229531}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Draco/BoomBox_normal.png", "start": 207229531, "end": 209744000}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF-Draco/BoomBox_occlusionRoughnessMetallic.png", "start": 209744000, "end": 214215451}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox.bin", "start": 214215451, "end": 214423267}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox.gltf", "start": 214423267, "end": 214426140}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox_baseColor.png", "start": 214426140, "end": 217711984}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox_emissive.png", "start": 217711984, "end": 217844817}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox_normal.png", "start": 217844817, "end": 220359286}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/glTF/BoomBox_occlusionRoughnessMetallic.png", "start": 220359286, "end": 224830737}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/metadata.json", "start": 224830737, "end": 224831483}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/screenshot/screenshot.jpg", "start": 224831483, "end": 224847193}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBox/screenshot/screenshot_large.jpg", "start": 224847193, "end": 225174151}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/LICENSE.md", "start": 225174151, "end": 225174829}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/README.body.md", "start": 225174829, "end": 225175047}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/README.md", "start": 225175047, "end": 225175870}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes.bin", "start": 225175870, "end": 225767038}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes.gltf", "start": 225767038, "end": 225777369}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes_baseColor.png", "start": 225777369, "end": 229063213}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes_baseColor1.png", "start": 229063213, "end": 229063343}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes_emissive.png", "start": 229063343, "end": 229196176}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes_normal.png", "start": 229196176, "end": 231710645}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/glTF/BoomBoxWithAxes_roughnessMetallic.png", "start": 231710645, "end": 234841858}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/metadata.json", "start": 234841858, "end": 234842598}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/screenshot/screenshot.jpg", "start": 234842598, "end": 234854099}, {"filename": "/resources/glTF-Sample-Assets/Models/BoomBoxWithAxes/screenshot/screenshot_large.jpg", "start": 234854099, "end": 235053291}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/LICENSE.md", "start": 235053291, "end": 235054063}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/README.body.md", "start": 235054063, "end": 235054582}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/README.md", "start": 235054582, "end": 235055445}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/glTF/Box With Spaces.bin", "start": 235055445, "end": 235056285}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/glTF/Box With Spaces.gltf", "start": 235056285, "end": 235059834}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/glTF/Normal Map.png", "start": 235059834, "end": 235105082}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/glTF/Roughness Metallic.png", "start": 235105082, "end": 235123516}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/glTF/glTF Logo With Spaces.png", "start": 235123516, "end": 235144156}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/metadata.json", "start": 235144156, "end": 235145335}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/screenshot/screenshot-x150.png", "start": 235145335, "end": 235158422}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/screenshot/screenshot.png", "start": 235158422, "end": 235167426}, {"filename": "/resources/glTF-Sample-Assets/Models/Box With Spaces/screenshot/screenshot_large.png", "start": 235167426, "end": 235253640}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/LICENSE.md", "start": 235253640, "end": 235254305}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/README.body.md", "start": 235254305, "end": 235254402}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/README.md", "start": 235254402, "end": 235255190}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/glTF-Binary/Box.glb", "start": 235255190, "end": 235256854}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/glTF-Draco/Box.bin", "start": 235256854, "end": 235256974}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/glTF-Draco/Box.gltf", "start": 235256974, "end": 235259553}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/glTF-Embedded/Box.gltf", "start": 235259553, "end": 235263486}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/glTF/Box.gltf", "start": 235263486, "end": 235266526}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/glTF/Box0.bin", "start": 235266526, "end": 235267174}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/metadata.json", "start": 235267174, "end": 235267889}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/screenshot/screenshot-x150.png", "start": 235267889, "end": 235273055}, {"filename": "/resources/glTF-Sample-Assets/Models/Box/screenshot/screenshot.png", "start": 235273055, "end": 235276331}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/LICENSE.md", "start": 235276331, "end": 235277005}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/README.body.md", "start": 235277005, "end": 235278166}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/README.md", "start": 235278166, "end": 235280088}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/glTF-Binary/BoxAnimated.glb", "start": 235280088, "end": 235292032}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/glTF-Embedded/BoxAnimated.gltf", "start": 235292032, "end": 235312072}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/glTF/BoxAnimated.gltf", "start": 235312072, "end": 235319679}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/glTF/BoxAnimated0.bin", "start": 235319679, "end": 235328987}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/metadata.json", "start": 235328987, "end": 235329748}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/screenshot/BoxAnimatedBug.png", "start": 235329748, "end": 235344818}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/screenshot/screenshot-x150.gif", "start": 235344818, "end": 235535963}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxAnimated/screenshot/screenshot.gif", "start": 235535963, "end": 235577709}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/LICENSE.md", "start": 235577709, "end": 235578422}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/README.body.md", "start": 235578422, "end": 235578561}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/README.md", "start": 235578561, "end": 235579500}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/glTF-Binary/BoxInterleaved.glb", "start": 235579500, "end": 235581132}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/glTF-Embedded/BoxInterleaved.gltf", "start": 235581132, "end": 235584996}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/glTF/BoxInterleaved.bin", "start": 235584996, "end": 235585644}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/glTF/BoxInterleaved.gltf", "start": 235585644, "end": 235588661}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/metadata.json", "start": 235588661, "end": 235589452}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/screenshot/screenshot-x150.png", "start": 235589452, "end": 235594618}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxInterleaved/screenshot/screenshot.png", "start": 235594618, "end": 235597894}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/LICENSE.md", "start": 235597894, "end": 235598647}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/README.body.md", "start": 235598647, "end": 235598779}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/README.md", "start": 235598779, "end": 235599763}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/glTF-Binary/BoxTextured.glb", "start": 235599763, "end": 235606303}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/glTF-Embedded/BoxTextured.gltf", "start": 235606303, "end": 235617104}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/glTF/BoxTextured.gltf", "start": 235617104, "end": 235620980}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/glTF/BoxTextured0.bin", "start": 235620980, "end": 235621820}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/glTF/CesiumLogoFlat.png", "start": 235621820, "end": 235626153}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/metadata.json", "start": 235626153, "end": 235627292}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/screenshot/screenshot-x150.png", "start": 235627292, "end": 235641536}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTextured/screenshot/screenshot.png", "start": 235641536, "end": 235652429}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/LICENSE.md", "start": 235652429, "end": 235653190}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/README.body.md", "start": 235653190, "end": 235653873}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/README.md", "start": 235653873, "end": 235655526}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/glTF-Binary/BoxTexturedNonPowerOfTwo.glb", "start": 235655526, "end": 235660222}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/glTF-Embedded/BoxTexturedNonPowerOfTwo.gltf", "start": 235660222, "end": 235668487}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/glTF/BoxTextured0.bin", "start": 235668487, "end": 235669327}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/glTF/BoxTexturedNonPowerOfTwo.gltf", "start": 235669327, "end": 235673203}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/glTF/CesiumLogoFlat.png", "start": 235673203, "end": 235675636}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/metadata.json", "start": 235675636, "end": 235676854}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/screenshot/screenshot-x150.png", "start": 235676854, "end": 235691098}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxTexturedNonPowerOfTwo/screenshot/screenshot.png", "start": 235691098, "end": 235701991}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/LICENSE.md", "start": 235701991, "end": 235702668}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/README.body.md", "start": 235702668, "end": 235703064}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/README.md", "start": 235703064, "end": 235704285}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/glTF-Binary/BoxVertexColors.glb", "start": 235704285, "end": 235706209}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/glTF-Embedded/BoxVertexColors.gltf", "start": 235706209, "end": 235709052}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/glTF/BoxVertexColors.gltf", "start": 235709052, "end": 235710769}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/glTF/buffer.bin", "start": 235710769, "end": 235711705}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/metadata.json", "start": 235711705, "end": 235712528}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/screenshot/screenshot-x150.png", "start": 235712528, "end": 235735180}, {"filename": "/resources/glTF-Sample-Assets/Models/BoxVertexColors/screenshot/screenshot.png", "start": 235735180, "end": 235741327}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/LICENSE.md", "start": 235741327, "end": 235742043}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/README.body.md", "start": 235742043, "end": 235742169}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/README.md", "start": 235742169, "end": 235743050}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF-Binary/BrainStem.glb", "start": 235743050, "end": 238937898}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF-Draco/BrainStem.gltf", "start": 238937898, "end": 239134948}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF-Draco/BrainStem0.bin", "start": 239134948, "end": 240936960}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF-Embedded/BrainStem.gltf", "start": 240936960, "end": 245318762}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF-Meshopt/BrainStem.bin", "start": 245318762, "end": 245666602}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF-Meshopt/BrainStem.gltf", "start": 245666602, "end": 245752362}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF/BrainStem.gltf", "start": 245752362, "end": 245994001}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/glTF/BrainStem0.bin", "start": 245994001, "end": 249099105}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/metadata.json", "start": 249099105, "end": 249099845}, {"filename": "/resources/glTF-Sample-Assets/Models/BrainStem/screenshot/screenshot.gif", "start": 249099845, "end": 250044339}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/LICENSE.md", "start": 250044339, "end": 250045006}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/README.body.md", "start": 250045006, "end": 250045482}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/README.md", "start": 250045482, "end": 250046566}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/glTF-Embedded/Cameras.gltf", "start": 250046566, "end": 250048356}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/glTF/Cameras.gltf", "start": 250048356, "end": 250050045}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/glTF/simpleSquare.bin", "start": 250050045, "end": 250050105}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/metadata.json", "start": 250050105, "end": 250050856}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/screenshot/screenshot-x150.png", "start": 250050856, "end": 250051810}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/screenshot/screenshot.png", "start": 250051810, "end": 250052328}, {"filename": "/resources/glTF-Sample-Assets/Models/Cameras/screenshot/simpleSquare.png", "start": 250052328, "end": 250100627}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/LICENSE.md", "start": 250100627, "end": 250101306}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/README.body.md", "start": 250101306, "end": 250102013}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/README.md", "start": 250102013, "end": 250103535}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/glTF-Binary/CarbonFibre.glb", "start": 250103535, "end": 250616583}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/glTF/CarbonFibre.bin", "start": 250616583, "end": 250708519}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/glTF/CarbonFibre.gltf", "start": 250708519, "end": 250713012}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/glTF/CarbonFibre_anisotropy.png", "start": 250713012, "end": 250714677}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/glTF/CarbonFibre_normal.png", "start": 250714677, "end": 251093495}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/glTF/CarbonFibre_occlusion.png", "start": 251093495, "end": 251131906}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/metadata.json", "start": 251131906, "end": 251132694}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/screenshot/screenshot.jpg", "start": 251132694, "end": 251152610}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/screenshot/screenshot_large.jpg", "start": 251152610, "end": 251565204}, {"filename": "/resources/glTF-Sample-Assets/Models/CarbonFibre/screenshot/textures.jpg", "start": 251565204, "end": 251795051}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/LICENSE.md", "start": 251795051, "end": 251795802}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/README.body.md", "start": 251795802, "end": 251795933}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/README.md", "start": 251795933, "end": 251796904}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF-Binary/CesiumMan.glb", "start": 251796904, "end": 252287860}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF-Draco/CesiumMan.gltf", "start": 252287860, "end": 252342452}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF-Draco/CesiumMan_data.bin", "start": 252342452, "end": 252431964}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF-Draco/CesiumMan_img0.jpg", "start": 252431964, "end": 252641872}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF-Embedded/CesiumMan.gltf", "start": 252641872, "end": 253329849}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF/CesiumMan.gltf", "start": 253329849, "end": 253384513}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF/CesiumMan_data.bin", "start": 253384513, "end": 253637177}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/glTF/CesiumMan_img0.jpg", "start": 253637177, "end": 253847085}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/metadata.json", "start": 253847085, "end": 253848218}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMan/screenshot/screenshot.gif", "start": 253848218, "end": 254312164}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/LICENSE.md", "start": 254312164, "end": 254312922}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/README.body.md", "start": 254312922, "end": 254313058}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/README.md", "start": 254313058, "end": 254314081}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb", "start": 254314081, "end": 254761281}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF-Draco/CesiumMilkTruck.gltf", "start": 254761281, "end": 254771722}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF-Draco/CesiumMilkTruck.jpg", "start": 254771722, "end": 255067922}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF-Draco/CesiumMilkTruck_data.bin", "start": 255067922, "end": 255079374}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF-Embedded/CesiumMilkTruck.gltf", "start": 255079374, "end": 255678216}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf", "start": 255678216, "end": 255687313}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF/CesiumMilkTruck.jpg", "start": 255687313, "end": 255983513}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/glTF/CesiumMilkTruck_data.bin", "start": 255983513, "end": 256129605}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/metadata.json", "start": 256129605, "end": 256130767}, {"filename": "/resources/glTF-Sample-Assets/Models/CesiumMilkTruck/screenshot/screenshot.gif", "start": 256130767, "end": 256149311}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/LICENSE.md", "start": 256149311, "end": 256149996}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/README.body.md", "start": 256149996, "end": 256150992}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/README.md", "start": 256150992, "end": 256152871}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF-Binary/ChairDamaskPurplegold.glb", "start": 256152871, "end": 258494315}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/ChairDamaskPurplegold.bin", "start": 258494315, "end": 258805219}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/ChairDamaskPurplegold.gltf", "start": 258805219, "end": 258839483}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_damask_basecolor.jpg", "start": 258839483, "end": 259071728}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_damask_normal.jpg", "start": 259071728, "end": 259356458}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_damask_roughmetal.jpg", "start": 259356458, "end": 259683029}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_label.jpg", "start": 259683029, "end": 260038290}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_metal_roughness255.jpg", "start": 260038290, "end": 260057191}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_occlusion.jpg", "start": 260057191, "end": 260226589}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_wood_albedo.jpg", "start": 260226589, "end": 260450347}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_wood_normal.jpg", "start": 260450347, "end": 260659868}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/glTF/chair_wood_roughness0.jpg", "start": 260659868, "end": 260856004}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/metadata.json", "start": 260856004, "end": 260856784}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/screenshot/screenshot.jpg", "start": 260856784, "end": 260860874}, {"filename": "/resources/glTF-Sample-Assets/Models/ChairDamaskPurplegold/screenshot/screenshot_Large.jpg", "start": 260860874, "end": 261378693}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/LICENSE.md", "start": 261378693, "end": 261379373}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/README.body.md", "start": 261379373, "end": 261380551}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/README.md", "start": 261380551, "end": 261382765}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/glTF-Binary/ClearCoatCarPaint.glb", "start": 261382765, "end": 261504789}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/glTF/ClearCoatCarPaint.bin", "start": 261504789, "end": 261578517}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/glTF/ClearCoatCarPaint.gltf", "start": 261578517, "end": 261582833}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/glTF/ClearCoatCarPaint_Normal.png", "start": 261582833, "end": 261629147}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/metadata.json", "start": 261629147, "end": 261629965}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/screenshot/normal_bump_enlarged.jpg", "start": 261629965, "end": 261732873}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/screenshot/screenshot.jpg", "start": 261732873, "end": 261769406}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatCarPaint/screenshot/screenshot_large.jpg", "start": 261769406, "end": 262103896}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/LICENSE.md", "start": 262103896, "end": 262104586}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/README.body.md", "start": 262104586, "end": 262108588}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/README.md", "start": 262108588, "end": 262113455}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF-Binary/ClearCoatTest.glb", "start": 262113455, "end": 262371503}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/ClearCoatLabels.png", "start": 262371503, "end": 262381773}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/ClearCoatTest.bin", "start": 262381773, "end": 262451061}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/ClearCoatTest.gltf", "start": 262451061, "end": 262483762}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/PartialCoating.png", "start": 262483762, "end": 262488839}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/PartialCoating_Alpha.png", "start": 262488839, "end": 262493904}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/PlasticWrap_normals.jpg", "start": 262493904, "end": 262638114}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/RibsNormal.png", "start": 262638114, "end": 262639719}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/glTF/RoughnessStripes.png", "start": 262639719, "end": 262644752}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/metadata.json", "start": 262644752, "end": 262645555}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/screenshot/FirstRow.jpg", "start": 262645555, "end": 262711519}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/screenshot/PartialCoat.jpg", "start": 262711519, "end": 262748565}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/screenshot/screenshot-x150.jpg", "start": 262748565, "end": 262761197}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/screenshot/screenshot.jpg", "start": 262761197, "end": 262793716}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearCoatTest/screenshot/screenshot_large.jpg", "start": 262793716, "end": 262967536}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/LICENSE.md", "start": 262967536, "end": 262968212}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/README.body.md", "start": 262968212, "end": 262968743}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/README.md", "start": 262968743, "end": 262970178}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF-Binary/ClearcoatWicker.glb", "start": 262970178, "end": 264400030}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF/ClearcoatWicker.bin", "start": 264400030, "end": 264473758}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF/ClearcoatWicker.gltf", "start": 264473758, "end": 264478423}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF/clearcoat_normal.png", "start": 264478423, "end": 264686318}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF/wicker_basecolor.png", "start": 264686318, "end": 265093602}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF/wicker_normal.png", "start": 265093602, "end": 265461983}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/glTF/wicker_occlusion-rough-metal.png", "start": 265461983, "end": 265832184}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/metadata.json", "start": 265832184, "end": 265833030}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/screenshot/screenshot.jpg", "start": 265833030, "end": 265882474}, {"filename": "/resources/glTF-Sample-Assets/Models/ClearcoatWicker/screenshot/screenshot_large.jpg", "start": 265882474, "end": 266317922}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/LICENSE.md", "start": 266317922, "end": 266318701}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/README.body.md", "start": 266318701, "end": 266319121}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/README.md", "start": 266319121, "end": 266320447}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF-Binary/CompareAlphaCoverage.glb", "start": 266320447, "end": 270193051}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/CompareAlphaCoverage.bin", "start": 270193051, "end": 270196831}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/CompareAlphaCoverage.gltf", "start": 270196831, "end": 270212561}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/FloorBaseColor.jpg", "start": 270212561, "end": 270272365}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/FloorNormal.jpg", "start": 270272365, "end": 270382010}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/FurBaseColorAlpha.png", "start": 270382010, "end": 271916980}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/FurEmissive.jpg", "start": 271916980, "end": 271944137}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/FurNormal.png", "start": 271944137, "end": 273796658}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/glTF/FurORM.jpg", "start": 273796658, "end": 274072857}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/metadata.json", "start": 274072857, "end": 274074025}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/screenshot/screenshot.jpg", "start": 274074025, "end": 274076944}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAlphaCoverage/screenshot/screenshot_Large.jpg", "start": 274076944, "end": 274791299}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/LICENSE.md", "start": 274791299, "end": 274792208}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/README.body.md", "start": 274792208, "end": 274792521}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/README.md", "start": 274792521, "end": 274793902}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/glTF-Binary/CompareAmbientOcclusion.glb", "start": 274793902, "end": 279622582}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/glTF/BasketORM.jpg", "start": 279622582, "end": 279934369}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/glTF/CompareAmbientOcclusion.gltf", "start": 279934369, "end": 279948640}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/glTF/CompareAmbientOcclusion_data.bin", "start": 279948640, "end": 283465992}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/glTF/FruitBaseColor.jpg", "start": 283465992, "end": 283998967}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/glTF/FruitORM.jpg", "start": 283998967, "end": 284457581}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/metadata.json", "start": 284457581, "end": 284459187}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/screenshot/screenshot.jpg", "start": 284459187, "end": 284474504}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAmbientOcclusion/screenshot/screenshot_Large.jpg", "start": 284474504, "end": 284953916}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/LICENSE.md", "start": 284953916, "end": 284954691}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/README.body.md", "start": 284954691, "end": 284954997}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/README.md", "start": 284954997, "end": 284956296}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF-Binary/CompareAnisotropy.glb", "start": 284956296, "end": 285972132}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/CompareAnisotropy.bin", "start": 285972132, "end": 286805860}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/CompareAnisotropy.gltf", "start": 286805860, "end": 286818004}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/Compare_Anisotropy_img0.jpg", "start": 286818004, "end": 286837030}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/Compare_Anisotropy_img1.jpg", "start": 286837030, "end": 286885759}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/Compare_Anisotropy_img2.jpg", "start": 286885759, "end": 286903888}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/Compare_Anisotropy_img3.jpg", "start": 286903888, "end": 286958766}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/glTF/Compare_Anisotropy_img4.png", "start": 286958766, "end": 286993327}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/metadata.json", "start": 286993327, "end": 286994509}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/screenshot/screenshot.jpg", "start": 286994509, "end": 287000140}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareAnisotropy/screenshot/screenshot_Large.jpg", "start": 287000140, "end": 287582272}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/LICENSE.md", "start": 287582272, "end": 287583047}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/README.body.md", "start": 287583047, "end": 287583465}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/README.md", "start": 287583465, "end": 287584814}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/glTF-Binary/CompareBaseColor.glb", "start": 287584814, "end": 289117686}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/glTF/CompareBaseColor.gltf", "start": 289117686, "end": 289126311}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/glTF/CompareBasecolor.bin", "start": 289126311, "end": 290232231}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/glTF/Compare_Basecolor_img0.png", "start": 290232231, "end": 290247435}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/glTF/Compare_Basecolor_img1.png", "start": 290247435, "end": 290654719}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/metadata.json", "start": 290654719, "end": 290655875}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/screenshot/screenshot.jpg", "start": 290655875, "end": 290659940}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareBaseColor/screenshot/screenshot_Large.jpg", "start": 290659940, "end": 291089782}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/LICENSE.md", "start": 291089782, "end": 291090556}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/README.body.md", "start": 291090556, "end": 291091005}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/README.md", "start": 291091005, "end": 291092416}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/glTF-Binary/CompareClearcoat.glb", "start": 291092416, "end": 291286336}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/glTF/CompareClearcoat.bin", "start": 291286336, "end": 291373984}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/glTF/CompareClearcoat.gltf", "start": 291373984, "end": 291381918}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/glTF/Compare_Clearcoat_img0.jpg", "start": 291381918, "end": 291430815}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/glTF/Compare_Clearcoat_img1.jpg", "start": 291430815, "end": 291483920}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/metadata.json", "start": 291483920, "end": 291485079}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/screenshot/screenshot.jpg", "start": 291485079, "end": 291489296}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareClearcoat/screenshot/screenshot_Large.jpg", "start": 291489296, "end": 291886707}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/LICENSE.md", "start": 291886707, "end": 291887482}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/README.body.md", "start": 291887482, "end": 291887789}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/README.md", "start": 291887789, "end": 291889119}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/glTF-Binary/CompareDispersion.glb", "start": 291889119, "end": 291949551}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/glTF/CompareDispersion.bin", "start": 291949551, "end": 291956283}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/glTF/CompareDispersion.gltf", "start": 291956283, "end": 291964971}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/glTF/Compare_Dispersion_img0.jpg", "start": 291964971, "end": 292013328}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/glTF/Compare_Dispersion_img1.jpg", "start": 292013328, "end": 292014077}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/metadata.json", "start": 292014077, "end": 292015239}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/screenshot/screenshot.jpg", "start": 292015239, "end": 292020076}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareDispersion/screenshot/screenshot_Large.jpg", "start": 292020076, "end": 292310001}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/LICENSE.md", "start": 292310001, "end": 292310783}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/README.body.md", "start": 292310783, "end": 292311126}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/README.md", "start": 292311126, "end": 292312484}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/glTF-Binary/CompareEmissiveStrength.glb", "start": 292312484, "end": 292424280}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/glTF/CompareEmissiveStrength.bin", "start": 292424280, "end": 292482712}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/glTF/CompareEmissiveStrength.gltf", "start": 292482712, "end": 292488506}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/glTF/Compare_Emissive-Strength_img0.jpg", "start": 292488506, "end": 292538801}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/metadata.json", "start": 292538801, "end": 292540005}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/screenshot/screenshot.jpg", "start": 292540005, "end": 292544747}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareEmissiveStrength/screenshot/screenshot_Large.jpg", "start": 292544747, "end": 292965641}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/LICENSE.md", "start": 292965641, "end": 292966409}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/README.body.md", "start": 292966409, "end": 292966708}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/README.md", "start": 292966708, "end": 292967960}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF-Binary/CompareIor.glb", "start": 292967960, "end": 293181064}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF/CompareIor.bin", "start": 293181064, "end": 293239636}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF/CompareIor.gltf", "start": 293239636, "end": 293248107}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF/Compare_Ior_img0.jpg", "start": 293248107, "end": 293248856}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF/Compare_Ior_img1.jpg", "start": 293248856, "end": 293296569}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF/Compare_Ior_img2.jpg", "start": 293296569, "end": 293349664}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/glTF/Compare_Ior_img3.jpg", "start": 293349664, "end": 293398021}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/metadata.json", "start": 293398021, "end": 293399162}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/screenshot/screenshot.jpg", "start": 293399162, "end": 293404507}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIor/screenshot/screenshot_Large.jpg", "start": 293404507, "end": 293746475}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/LICENSE.md", "start": 293746475, "end": 293747251}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/README.body.md", "start": 293747251, "end": 293747558}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/README.md", "start": 293747558, "end": 293748820}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/glTF-Binary/CompareIridescence.glb", "start": 293748820, "end": 293963576}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/glTF/CompareIridescence.bin", "start": 293963576, "end": 294022008}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/glTF/CompareIridescence.gltf", "start": 294022008, "end": 294027758}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/glTF/Compare_Iridescence_img0.jpg", "start": 294027758, "end": 294078053}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/glTF/Compare_Iridescence_img1.jpg", "start": 294078053, "end": 294131550}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/glTF/Compare_Iridescence_img2.jpg", "start": 294131550, "end": 294180895}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/metadata.json", "start": 294180895, "end": 294182060}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/screenshot/screenshot.jpg", "start": 294182060, "end": 294187628}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareIridescence/screenshot/screenshot_Large.jpg", "start": 294187628, "end": 294638456}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/LICENSE.md", "start": 294638456, "end": 294639229}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/README.body.md", "start": 294639229, "end": 294639533}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/README.md", "start": 294639533, "end": 294640711}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/glTF-Binary/CompareMetallic.glb", "start": 294640711, "end": 294812891}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/glTF/CompareMetallic.bin", "start": 294812891, "end": 294871323}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/glTF/CompareMetallic.gltf", "start": 294871323, "end": 294876629}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/glTF/Compare_Metallic_img0.jpg", "start": 294876629, "end": 294932419}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/glTF/Compare_Metallic_img1.jpg", "start": 294932419, "end": 294987501}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/metadata.json", "start": 294987501, "end": 294988652}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/screenshot/screenshot.jpg", "start": 294988652, "end": 294994143}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareMetallic/screenshot/screenshot_Large.jpg", "start": 294994143, "end": 295397026}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/LICENSE.md", "start": 295397026, "end": 295397797}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/README.body.md", "start": 295397797, "end": 295398099}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/README.md", "start": 295398099, "end": 295399263}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/glTF-Binary/CompareNormal.glb", "start": 295399263, "end": 295620163}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/glTF/CompareNormal.bin", "start": 295620163, "end": 295749235}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/glTF/CompareNormal.gltf", "start": 295749235, "end": 295754475}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/glTF/Compare_Normal_img0.jpg", "start": 295754475, "end": 295843532}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/metadata.json", "start": 295843532, "end": 295844677}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/screenshot/screenshot.jpg", "start": 295844677, "end": 295848278}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareNormal/screenshot/screenshot_Large.jpg", "start": 295848278, "end": 296240944}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/LICENSE.md", "start": 296240944, "end": 296241718}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/README.body.md", "start": 296241718, "end": 296242023}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/README.md", "start": 296242023, "end": 296243208}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/glTF-Binary/CompareRoughness.glb", "start": 296243208, "end": 296398868}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/glTF/CompareRoughness.bin", "start": 296398868, "end": 296457300}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/glTF/CompareRoughness.gltf", "start": 296457300, "end": 296462638}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/glTF/Compare_Roughness_img0.jpg", "start": 296462638, "end": 296512933}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/glTF/Compare_Roughness_img1.jpg", "start": 296512933, "end": 296556971}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/metadata.json", "start": 296556971, "end": 296558125}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/screenshot/screenshot.jpg", "start": 296558125, "end": 296563525}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareRoughness/screenshot/screenshot_Large.jpg", "start": 296563525, "end": 297073742}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/LICENSE.md", "start": 297073742, "end": 297074512}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/README.body.md", "start": 297074512, "end": 297074813}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/README.md", "start": 297074813, "end": 297076027}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/glTF-Binary/CompareSheen.glb", "start": 297076027, "end": 297959995}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/glTF/CompareSheen.bin", "start": 297959995, "end": 298018427}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/glTF/CompareSheen.gltf", "start": 298018427, "end": 298024193}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/glTF/Compare_Sheen_img0.jpg", "start": 298024193, "end": 298074763}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/glTF/Compare_Sheen_img1.jpg", "start": 298074763, "end": 298796250}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/glTF/Compare_Sheen_img2.jpg", "start": 298796250, "end": 298846547}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/metadata.json", "start": 298846547, "end": 298847694}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/screenshot/screenshot.jpg", "start": 298847694, "end": 298853627}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSheen/screenshot/screenshot_Large.jpg", "start": 298853627, "end": 299489591}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/LICENSE.md", "start": 299489591, "end": 299490364}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/README.body.md", "start": 299490364, "end": 299490668}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/README.md", "start": 299490668, "end": 299491906}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/glTF-Binary/CompareSpecular.glb", "start": 299491906, "end": 300900270}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/glTF/CompareSpecular.bin", "start": 300900270, "end": 301129710}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/glTF/CompareSpecular.gltf", "start": 301129710, "end": 301135347}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/glTF/Compare_Specular_img0.jpg", "start": 301135347, "end": 301185644}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/glTF/Compare_Specular_img1.png", "start": 301185644, "end": 302311250}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/metadata.json", "start": 302311250, "end": 302312406}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/screenshot/screenshot.jpg", "start": 302312406, "end": 302317879}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareSpecular/screenshot/screenshot_Large.jpg", "start": 302317879, "end": 302781595}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/LICENSE.md", "start": 302781595, "end": 302782372}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/README.body.md", "start": 302782372, "end": 302782699}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/README.md", "start": 302782699, "end": 302783988}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF-Binary/CompareTransmission.glb", "start": 302783988, "end": 303186560}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF/CompareTransmission.bin", "start": 303186560, "end": 303457228}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF/CompareTransmission.gltf", "start": 303457228, "end": 303470149}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF/Compare_Transmission_img0.jpg", "start": 303470149, "end": 303529404}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF/Compare_Transmission_img1.png", "start": 303529404, "end": 303568475}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF/Compare_Transmission_img2.jpg", "start": 303568475, "end": 303569224}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/glTF/Compare_Transmission_img3.jpg", "start": 303569224, "end": 303595207}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/metadata.json", "start": 303595207, "end": 303596375}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/screenshot/screenshot.jpg", "start": 303596375, "end": 303607703}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareTransmission/screenshot/screenshot_Large.jpg", "start": 303607703, "end": 303807749}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/LICENSE.md", "start": 303807749, "end": 303808520}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/README.body.md", "start": 303808520, "end": 303808866}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/README.md", "start": 303808866, "end": 303810162}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF-Binary/CompareVolume.glb", "start": 303810162, "end": 304275302}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF/CompareVolume.bin", "start": 304275302, "end": 304545970}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF/CompareVolume.gltf", "start": 304545970, "end": 304559193}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF/Compare_Volume_img0.jpg", "start": 304559193, "end": 304618526}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF/Compare_Volume_img1.jpg", "start": 304618526, "end": 304719905}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF/Compare_Volume_img2.jpg", "start": 304719905, "end": 304720654}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/glTF/Compare_Volume_img3.jpg", "start": 304720654, "end": 304746637}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/metadata.json", "start": 304746637, "end": 304747787}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/screenshot/screenshot.jpg", "start": 304747787, "end": 304760330}, {"filename": "/resources/glTF-Sample-Assets/Models/CompareVolume/screenshot/screenshot_Large.jpg", "start": 304760330, "end": 305017777}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/LICENSE.md", "start": 305017777, "end": 305018443}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/README.body.md", "start": 305018443, "end": 305018575}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/README.md", "start": 305018575, "end": 305019372}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF-Binary/Corset.glb", "start": 305019372, "end": 318510736}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF-Draco/Corset.bin", "start": 318510736, "end": 318740852}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF-Draco/Corset.gltf", "start": 318740852, "end": 318744216}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF-Draco/Corset_baseColor.png", "start": 318744216, "end": 323245462}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF-Draco/Corset_normal.png", "start": 323245462, "end": 328128119}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF-Draco/Corset_occlusionRoughnessMetallic.png", "start": 328128119, "end": 331571794}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF/Corset.bin", "start": 331571794, "end": 332233978}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF/Corset.gltf", "start": 332233978, "end": 332236622}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF/Corset_baseColor.png", "start": 332236622, "end": 336737868}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF/Corset_normal.png", "start": 336737868, "end": 341620525}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/glTF/Corset_occlusionRoughnessMetallic.png", "start": 341620525, "end": 345064200}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/metadata.json", "start": 345064200, "end": 345064874}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/screenshot/screenshot-x150.jpg", "start": 345064874, "end": 345068254}, {"filename": "/resources/glTF-Sample-Assets/Models/Corset/screenshot/screenshot.jpg", "start": 345068254, "end": 345071404}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/LICENSE.md", "start": 345071404, "end": 345072068}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/README.body.md", "start": 345072068, "end": 345072178}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/README.md", "start": 345072178, "end": 345072847}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/glTF/Cube.bin", "start": 345072847, "end": 345074647}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/glTF/Cube.gltf", "start": 345074647, "end": 345078511}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/glTF/Cube_BaseColor.png", "start": 345078511, "end": 345970506}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/glTF/Cube_MetallicRoughness.png", "start": 345970506, "end": 345970825}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/metadata.json", "start": 345970825, "end": 345971530}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/screenshot/screenshot-x150.jpg", "start": 345971530, "end": 345977853}, {"filename": "/resources/glTF-Sample-Assets/Models/Cube/screenshot/screenshot.jpg", "start": 345977853, "end": 345986450}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/LICENSE.md", "start": 345986450, "end": 345987264}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/README.body.md", "start": 345987264, "end": 345987629}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/README.md", "start": 345987629, "end": 345988979}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb", "start": 345988979, "end": 349762895}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf", "start": 349762895, "end": 354796655}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/DamagedHelmet.bin", "start": 354796655, "end": 355355159}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/DamagedHelmet.gltf", "start": 355355159, "end": 355359900}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/Default_AO.jpg", "start": 355359900, "end": 355721578}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/Default_albedo.jpg", "start": 355721578, "end": 356657207}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/Default_emissive.jpg", "start": 356657207, "end": 356754706}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/Default_metalRoughness.jpg", "start": 356754706, "end": 358055367}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/glTF/Default_normal.jpg", "start": 358055367, "end": 358573124}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/metadata.json", "start": 358573124, "end": 358574388}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/screenshot/screenshot-x150.png", "start": 358574388, "end": 358623305}, {"filename": "/resources/glTF-Sample-Assets/Models/DamagedHelmet/screenshot/screenshot.png", "start": 358623305, "end": 358669000}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/LICENSE.md", "start": 358669000, "end": 358669813}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/README.body.md", "start": 358669813, "end": 358671109}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/README.md", "start": 358671109, "end": 358673505}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb", "start": 358673505, "end": 363846533}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant.data.bin", "start": 363846533, "end": 366458149}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant.gltf", "start": 366458149, "end": 366515081}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant_Firefly_Emissive.jpg", "start": 366515081, "end": 366516112}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant_Plant_BaseColor.png", "start": 366516112, "end": 368083675}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant_Plant_Normal.jpg", "start": 368083675, "end": 368352761}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant_Pot_BaseColor.jpg", "start": 368352761, "end": 368509787}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant_Pot_Normal.jpg", "start": 368509787, "end": 368750472}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/glTF/DiffuseTransmissionPlant_Pot_Occlusion.jpg", "start": 368750472, "end": 369045910}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/metadata.json", "start": 369045910, "end": 369047165}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/screenshot/screenshot.jpg", "start": 369047165, "end": 369066923}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionPlant/screenshot/screenshot_Large.jpg", "start": 369066923, "end": 369477947}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/LICENSE.md", "start": 369477947, "end": 369478634}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/README.body.md", "start": 369478634, "end": 369479413}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/README.md", "start": 369479413, "end": 369481137}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF-Binary/DiffuseTransmissionTeacup.glb", "start": 369481137, "end": 374657049}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/DiffuseTransmissionTeacup.bin", "start": 374657049, "end": 377700921}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/DiffuseTransmissionTeacup.gltf", "start": 377700921, "end": 377708019}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/teacup_basecolor.jpg", "start": 377708019, "end": 377897976}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/teacup_normal.png", "start": 377897976, "end": 378248221}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/teacup_ormt.png", "start": 378248221, "end": 379046672}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/teasaucer_basecolor.jpg", "start": 379046672, "end": 379176942}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/teasaucer_normal.png", "start": 379176942, "end": 379344707}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/glTF/teasaucer_ormt.png", "start": 379344707, "end": 379835794}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/metadata.json", "start": 379835794, "end": 379836627}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/screenshot/diffuse-transmission-features.jpg", "start": 379836627, "end": 379872224}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/screenshot/screenshot.jpg", "start": 379872224, "end": 379876376}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/screenshot/screenshot_Large.jpg", "start": 379876376, "end": 379979553}, {"filename": "/resources/glTF-Sample-Assets/Models/DiffuseTransmissionTeacup/screenshot/with-vs-without.jpg", "start": 379979553, "end": 380045839}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/LICENSE.md", "start": 380045839, "end": 380046516}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/README.body.md", "start": 380046516, "end": 380049152}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/README.md", "start": 380049152, "end": 380052662}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/glTF-Binary/DirectionalLight.glb", "start": 380052662, "end": 380506182}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/glTF/DirectionalLight.bin", "start": 380506182, "end": 380956710}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/glTF/DirectionalLight.gltf", "start": 380956710, "end": 380962590}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/metadata.json", "start": 380962590, "end": 380963339}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/screenshot/chroma.png", "start": 380963339, "end": 381103796}, {"filename": "/resources/glTF-Sample-Assets/Models/DirectionalLight/screenshot/screenshot.png", "start": 381103796, "end": 381350293}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/LICENSE.md", "start": 381350293, "end": 381350970}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/README.body.md", "start": 381350970, "end": 381351477}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/README.md", "start": 381351477, "end": 381352881}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/glTF-Binary/DispersionTest.glb", "start": 381352881, "end": 383663825}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/glTF/CheckerWithLines.png", "start": 383663825, "end": 383664507}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/glTF/DispersionTest.bin", "start": 383664507, "end": 385940831}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/glTF/DispersionTest.gltf", "start": 385940831, "end": 385968522}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/glTF/Dispersion_Labels2.png", "start": 385968522, "end": 385984149}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/metadata.json", "start": 385984149, "end": 385984905}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/screenshot/screenshot-large.png", "start": 385984905, "end": 387510501}, {"filename": "/resources/glTF-Sample-Assets/Models/DispersionTest/screenshot/screenshot.png", "start": 387510501, "end": 387629383}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/LICENSE.md", "start": 387629383, "end": 387630345}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/README.body.md", "start": 387630345, "end": 387634712}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/README.md", "start": 387634712, "end": 387640397}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF-Binary/DragonAttenuation.glb", "start": 387640397, "end": 394207157}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF-Meshopt/DragonAttenuation.bin", "start": 394207157, "end": 395344305}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF-Meshopt/DragonAttenuation.gltf", "start": 395344305, "end": 395353235}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF-Meshopt/Dragon_ThicknessMap.jpg", "start": 395353235, "end": 395931385}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF-Meshopt/checkerboard.jpg", "start": 395931385, "end": 396099037}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF/DragonAttenuation.bin", "start": 396099037, "end": 401916433}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF/DragonAttenuation.gltf", "start": 401916433, "end": 401925279}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF/Dragon_ThicknessMap.jpg", "start": 401925279, "end": 402503429}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/glTF/checkerboard.jpg", "start": 402503429, "end": 402671081}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/metadata.json", "start": 402671081, "end": 402672833}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/screenshot/screenshot-x150.jpg", "start": 402672833, "end": 402684197}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/screenshot/screenshot.jpg", "start": 402684197, "end": 402706000}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/screenshot/screenshot_large.png", "start": 402706000, "end": 403558231}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/screenshot/screenshot_pathTraced.png", "start": 403558231, "end": 404311560}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/screenshot/surface_color.png", "start": 404311560, "end": 404954667}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonAttenuation/screenshot/too-dark.png", "start": 404954667, "end": 406200940}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/LICENSE.md", "start": 406200940, "end": 406201901}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/README.body.md", "start": 406201901, "end": 406203371}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/README.md", "start": 406203371, "end": 406206170}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/glTF-Binary/DragonDispersion.glb", "start": 406206170, "end": 412607894}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/glTF/CheckerWithLines.png", "start": 412607894, "end": 412608576}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/glTF/DragonDispersion.bin", "start": 412608576, "end": 418428212}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/glTF/DragonDispersion.gltf", "start": 418428212, "end": 418435369}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/glTF/Dragon_ThicknessMap.jpg", "start": 418435369, "end": 419013519}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/metadata.json", "start": 419013519, "end": 419015262}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/screenshot/screenshot-large.jpg", "start": 419015262, "end": 419507935}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/screenshot/screenshot.jpg", "start": 419507935, "end": 419539305}, {"filename": "/resources/glTF-Sample-Assets/Models/DragonDispersion/screenshot/thin-vs-thick.jpg", "start": 419539305, "end": 419579191}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/LICENSE.md", "start": 419579191, "end": 419579850}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/README.body.md", "start": 419579850, "end": 419579953}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/README.md", "start": 419579953, "end": 419580733}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb", "start": 419580733, "end": 419701217}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Draco/Duck.bin", "start": 419701217, "end": 419711585}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Draco/Duck.gltf", "start": 419711585, "end": 419715606}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Draco/DuckCM.png", "start": 419715606, "end": 419731908}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Embedded/Duck.gltf", "start": 419731908, "end": 419894923}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Quantized/Duck.bin", "start": 419894923, "end": 419958579}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Quantized/Duck.gltf", "start": 419958579, "end": 419962308}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF-Quantized/DuckCM.png", "start": 419962308, "end": 419978610}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF/Duck.gltf", "start": 419978610, "end": 419983793}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF/Duck0.bin", "start": 419983793, "end": 420085833}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/glTF/DuckCM.png", "start": 420085833, "end": 420102135}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/metadata.json", "start": 420102135, "end": 420102778}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/screenshot/screenshot-x150.png", "start": 420102778, "end": 420119027}, {"filename": "/resources/glTF-Sample-Assets/Models/Duck/screenshot/screenshot.png", "start": 420119027, "end": 420135018}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/LICENSE.md", "start": 420135018, "end": 420135702}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/README.body.md", "start": 420135702, "end": 420137384}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/README.md", "start": 420137384, "end": 420139947}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/glTF-Binary/EmissiveStrengthTest.glb", "start": 420139947, "end": 420150615}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/glTF/EmissiveStrengthTest.bin", "start": 420150615, "end": 420155923}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/glTF/EmissiveStrengthTest.gltf", "start": 420155923, "end": 420168913}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/glTF/PlainGrid.png", "start": 420168913, "end": 420169531}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/metadata.json", "start": 420169531, "end": 420170321}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/screenshot/screenshot-x150.jpg", "start": 420170321, "end": 420175895}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/screenshot/screenshot.jpg", "start": 420175895, "end": 420196714}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/screenshot/screenshot_large_bloom.jpg", "start": 420196714, "end": 420298177}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/screenshot/screenshot_large_plain.jpg", "start": 420298177, "end": 420393625}, {"filename": "/resources/glTF-Sample-Assets/Models/EmissiveStrengthTest/screenshot/test_fail.jpg", "start": 420393625, "end": 420434697}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/LICENSE.md", "start": 420434697, "end": 420435423}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/README.body.md", "start": 420435423, "end": 420435890}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/README.md", "start": 420435890, "end": 420437083}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF-IBL/EnvironmentTest.gltf", "start": 420437083, "end": 420457197}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF-IBL/EnvironmentTest_binary.bin", "start": 420457197, "end": 421871239}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF-IBL/EnvironmentTest_images/roughness_metallic_0.jpg", "start": 421871239, "end": 421879900}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF-IBL/EnvironmentTest_images/roughness_metallic_1.jpg", "start": 421879900, "end": 421888585}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF/EnvironmentTest.gltf", "start": 421888585, "end": 421897170}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF/EnvironmentTest_binary.bin", "start": 421897170, "end": 422237642}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF/EnvironmentTest_images/roughness_metallic_0.jpg", "start": 422237642, "end": 422246303}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/glTF/EnvironmentTest_images/roughness_metallic_1.jpg", "start": 422246303, "end": 422254988}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/metadata.json", "start": 422254988, "end": 422255831}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/screenshot/screenshot-x150.jpg", "start": 422255831, "end": 422259804}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/screenshot/screenshot.jpg", "start": 422259804, "end": 422273876}, {"filename": "/resources/glTF-Sample-Assets/Models/EnvironmentTest/screenshot/screenshot_large.png", "start": 422273876, "end": 423263630}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/LICENSE.md", "start": 423263630, "end": 423264303}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/README.body.md", "start": 423264303, "end": 423264465}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/README.md", "start": 423264465, "end": 423265320}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet.bin", "start": 423265320, "end": 426492468}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet.gltf", "start": 426492468, "end": 426511878}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_GlassPlasticMat_BaseColor.png", "start": 426511878, "end": 428818527}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_GlassPlasticMat_Normal.png", "start": 428818527, "end": 431467342}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_GlassPlasticMat_OcclusionRoughMetal.png", "start": 431467342, "end": 435163525}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_LeatherPartsMat_BaseColor.png", "start": 435163525, "end": 440642273}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_LeatherPartsMat_Normal.png", "start": 440642273, "end": 446317804}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_LeatherPartsMat_OcclusionRoughMetal.png", "start": 446317804, "end": 450693490}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_LensesMat_BaseColor.png", "start": 450693490, "end": 451389794}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_LensesMat_Normal.png", "start": 451389794, "end": 451395369}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_LensesMat_OcclusionRoughMetal.png", "start": 451395369, "end": 451996972}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_MetalPartsMat_BaseColor.png", "start": 451996972, "end": 454677460}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_MetalPartsMat_Normal.png", "start": 454677460, "end": 457950943}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_MetalPartsMat_OcclusionRoughMetal.png", "start": 457950943, "end": 460927451}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_RubberWoodMat_BaseColor.png", "start": 460927451, "end": 464521751}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_RubberWoodMat_Normal.png", "start": 464521751, "end": 467849317}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/glTF/FlightHelmet_Materials_RubberWoodMat_OcclusionRoughMetal.png", "start": 467849317, "end": 471658601}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/metadata.json", "start": 471658601, "end": 471659361}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/screenshot/screenshot-x150.jpg", "start": 471659361, "end": 471663534}, {"filename": "/resources/glTF-Sample-Assets/Models/FlightHelmet/screenshot/screenshot.jpg", "start": 471663534, "end": 471667329}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/LICENSE.md", "start": 471667329, "end": 471668250}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/README.body.md", "start": 471668250, "end": 471668869}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/README.md", "start": 471668869, "end": 471670509}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/glTF-Binary/Fox.glb", "start": 471670509, "end": 471833361}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/glTF/Fox.bin", "start": 471833361, "end": 471953265}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/glTF/Fox.gltf", "start": 471953265, "end": 472000106}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/glTF/Texture.png", "start": 472000106, "end": 472026870}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/metadata.json", "start": 472026870, "end": 472028491}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/screenshot/screenshot-x150.jpg", "start": 472028491, "end": 472035557}, {"filename": "/resources/glTF-Sample-Assets/Models/Fox/screenshot/screenshot.jpg", "start": 472035557, "end": 472042196}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/LICENSE.md", "start": 472042196, "end": 472042872}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/README.body.md", "start": 472042872, "end": 472049303}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/README.md", "start": 472049303, "end": 472056728}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb", "start": 472056728, "end": 475206572}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/glTF/GlamVelvetSofa.bin", "start": 475206572, "end": 475331524}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/glTF/GlamVelvetSofa.gltf", "start": 475331524, "end": 475349012}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/glTF/GlamVelvetSofa_normal.png", "start": 475349012, "end": 477836838}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/glTF/GlamVelvetSofa_occlusion.png", "start": 477836838, "end": 478367489}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/metadata.json", "start": 478367489, "end": 478368249}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/normalTexture.jpg", "start": 478368249, "end": 478873465}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/photoreference_vs_customer.jpg", "start": 478873465, "end": 479132198}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/screenshot-x150.jpg", "start": 479132198, "end": 479138613}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/screenshot.jpg", "start": 479138613, "end": 479165480}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/screenshot_large.jpg", "start": 479165480, "end": 479285532}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/screenshot_layers.jpg", "start": 479285532, "end": 479535307}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/screenshot_punctual.jpg", "start": 479535307, "end": 479787914}, {"filename": "/resources/glTF-Sample-Assets/Models/GlamVelvetSofa/screenshot/screenshot_variants.jpg", "start": 479787914, "end": 479956629}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/LICENSE.md", "start": 479956629, "end": 479957310}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/README.body.md", "start": 479957310, "end": 479958573}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/README.md", "start": 479958573, "end": 479960791}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF-Binary/GlassBrokenWindow.glb", "start": 479960791, "end": 481286107}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/GlassBrokenWindow.bin", "start": 481286107, "end": 481323519}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/GlassBrokenWindow.gltf", "start": 481323519, "end": 481332229}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/WindowClasp_Occlusion.jpg", "start": 481332229, "end": 481371420}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/WindowFrame_Occlusion.jpg", "start": 481371420, "end": 481550895}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/WindowGlass_ColorAlpha.png", "start": 481550895, "end": 481826515}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/WindowGlass_Normal.png", "start": 481826515, "end": 481902636}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/glTF/WindowGlass_OcclusionRoughMetal.jpg", "start": 481902636, "end": 482616105}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/metadata.json", "start": 482616105, "end": 482616983}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/screenshot/screenshot.jpg", "start": 482616983, "end": 482654216}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassBrokenWindow/screenshot/screenshot_large.jpg", "start": 482654216, "end": 483084319}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/LICENSE.md", "start": 483084319, "end": 483085204}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/README.body.md", "start": 483085204, "end": 483087177}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/README.md", "start": 483087177, "end": 483090379}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/glTF-Binary/GlassHurricaneCandleHolder.glb", "start": 483090379, "end": 486492591}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/glTF/GlassHurricaneCandleHolder.bin", "start": 486492591, "end": 486593699}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/glTF/GlassHurricaneCandleHolder.gltf", "start": 486593699, "end": 486600635}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/glTF/GlassHurricaneCandleHolder_basecolor.png", "start": 486600635, "end": 487505046}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/glTF/GlassHurricaneCandleHolder_orm.png", "start": 487505046, "end": 489756647}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/glTF/GlassHurricaneCandleHolder_thickness.png", "start": 489756647, "end": 489898410}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/metadata.json", "start": 489898410, "end": 489900048}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/screenshot/compare-renderers.jpg", "start": 489900048, "end": 490808038}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/screenshot/screenshot.jpg", "start": 490808038, "end": 490843234}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassHurricaneCandleHolder/screenshot/screenshot_large.jpg", "start": 490843234, "end": 491167127}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/LICENSE.md", "start": 491167127, "end": 491167937}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/README.body.md", "start": 491167937, "end": 491170347}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/README.md", "start": 491170347, "end": 491173885}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF-Binary/GlassVaseFlowers.glb", "start": 491173885, "end": 493245209}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF/GlassVaseFlowers.bin", "start": 493245209, "end": 493424117}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF/GlassVaseFlowers.gltf", "start": 493424117, "end": 493432331}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF/glass_vase_thickness_1k.jpg", "start": 493432331, "end": 493528210}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF/shrub_sorrel_01_color_1k.png", "start": 493528210, "end": 494584092}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF/shrub_sorrel_01_normal_1k.jpg", "start": 494584092, "end": 495107233}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/glTF/shrub_sorrel_01_rough_1k.jpg", "start": 495107233, "end": 495321073}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/metadata.json", "start": 495321073, "end": 495322384}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/screenshot/screenshot.jpg", "start": 495322384, "end": 495370631}, {"filename": "/resources/glTF-Sample-Assets/Models/GlassVaseFlowers/screenshot/screenshot_large.jpg", "start": 495370631, "end": 495920117}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/LICENSE.md", "start": 495920117, "end": 495920788}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/README.body.md", "start": 495920788, "end": 495921580}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/README.md", "start": 495921580, "end": 495923268}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/glTF-Binary/IORTestGrid.glb", "start": 495923268, "end": 498551792}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/glTF/IORTestGrid.bin", "start": 498551792, "end": 501151652}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/glTF/IORTestGrid.gltf", "start": 501151652, "end": 501203775}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/glTF/checker.png", "start": 501203775, "end": 501204602}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/metadata.json", "start": 501204602, "end": 501205361}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/screenshot/screenshot.jpg", "start": 501205361, "end": 501212033}, {"filename": "/resources/glTF-Sample-Assets/Models/IORTestGrid/screenshot/screenshot_Large.jpg", "start": 501212033, "end": 501597668}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/LICENSE.md", "start": 501597668, "end": 501598346}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/README.body.md", "start": 501598346, "end": 501598480}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/README.md", "start": 501598480, "end": 501599388}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/glTF-Binary/InterpolationTest.glb", "start": 501599388, "end": 501616916}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/glTF/InterpolationTest.gltf", "start": 501616916, "end": 501626257}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/glTF/InterpolationTest_data.bin", "start": 501626257, "end": 501627885}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/glTF/InterpolationTest_img0.jpg", "start": 501627885, "end": 501639261}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/metadata.json", "start": 501639261, "end": 501640011}, {"filename": "/resources/glTF-Sample-Assets/Models/InterpolationTest/screenshot/screenshot.gif", "start": 501640011, "end": 501756022}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/LICENSE.md", "start": 501756022, "end": 501756831}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/README.body.md", "start": 501756831, "end": 501758362}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/README.md", "start": 501758362, "end": 501760863}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF-Binary/IridescenceAbalone.glb", "start": 501760863, "end": 511708115}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF/IridescenceAbalone.bin", "start": 511708115, "end": 511870691}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF/IridescenceAbalone.gltf", "start": 511870691, "end": 511875620}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF/IridescenceAbalone_BaseColor.jpg", "start": 511875620, "end": 513437536}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF/IridescenceAbalone_Iridescence.jpg", "start": 513437536, "end": 516080352}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF/IridescenceAbalone_NormalBump.png", "start": 516080352, "end": 519451318}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/glTF/IridescenceAbalone_ORM.jpg", "start": 519451318, "end": 521657782}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/metadata.json", "start": 521657782, "end": 521658980}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/screenshot/screenshot.jpg", "start": 521658980, "end": 521693351}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/screenshot/screenshot_Large.jpg", "start": 521693351, "end": 522581884}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceAbalone/screenshot/textures.jpg", "start": 522581884, "end": 523905541}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/LICENSE.md", "start": 523905541, "end": 523906231}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/README.body.md", "start": 523906231, "end": 523906665}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/README.md", "start": 523906665, "end": 523907839}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/glTF/IridescenceDielectricSpheres.bin", "start": 523907839, "end": 523941907}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/glTF/IridescenceDielectricSpheres.gltf", "start": 523941907, "end": 524253093}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/glTF/textures/guides.png", "start": 524253093, "end": 524295532}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/metadata.json", "start": 524295532, "end": 524296315}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/screenshot/screenshot-x150.jpg", "start": 524296315, "end": 524303625}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/screenshot/screenshot.jpg", "start": 524303625, "end": 524336121}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceDielectricSpheres/screenshot/screenshot_large.jpg", "start": 524336121, "end": 524669407}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/LICENSE.md", "start": 524669407, "end": 524670085}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/README.body.md", "start": 524670085, "end": 524673196}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/README.md", "start": 524673196, "end": 524677225}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/glTF-Binary/IridescenceLamp.glb", "start": 524677225, "end": 529790485}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/glTF/IridescenceLamp.bin", "start": 529790485, "end": 530245537}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/glTF/IridescenceLamp.gltf", "start": 530245537, "end": 530254737}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/glTF/IridescenceLamp_BaseColor.png", "start": 530254737, "end": 531387742}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/glTF/IridescenceLamp_Iridescence.png", "start": 531387742, "end": 532112826}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/glTF/IridescenceLamp_OcclusionRoughnessMetalness.png", "start": 532112826, "end": 534908628}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/metadata.json", "start": 534908628, "end": 534909421}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/screenshot/reference_Photos.jpg", "start": 534909421, "end": 535287637}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/screenshot/screenshot-x150.jpg", "start": 535287637, "end": 535308083}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/screenshot/screenshot.jpg", "start": 535308083, "end": 535348787}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/screenshot/screenshot_Large.jpg", "start": 535348787, "end": 535595881}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceLamp/screenshot/textures.jpg", "start": 535595881, "end": 535810321}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/LICENSE.md", "start": 535810321, "end": 535811009}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/README.body.md", "start": 535811009, "end": 535811432}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/README.md", "start": 535811432, "end": 535812580}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/glTF/IridescenceMetallicSpheres.bin", "start": 535812580, "end": 535846648}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/glTF/IridescenceMetallicSpheres.gltf", "start": 535846648, "end": 536128515}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/glTF/textures/guides.png", "start": 536128515, "end": 536172306}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/metadata.json", "start": 536172306, "end": 536173076}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/screenshot/screenshot-x150.jpg", "start": 536173076, "end": 536184310}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/screenshot/screenshot.jpg", "start": 536184310, "end": 536235671}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceMetallicSpheres/screenshot/screenshot_large.jpg", "start": 536235671, "end": 536851631}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/LICENSE.md", "start": 536851631, "end": 536852437}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/README.body.md", "start": 536852437, "end": 536852895}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/README.md", "start": 536852895, "end": 536854444}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/glTF-Binary/IridescenceSuzanne.glb", "start": 536854444, "end": 537362052}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/glTF/IridescenceSuzanne.bin", "start": 537362052, "end": 537491940}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/glTF/IridescenceSuzanne.gltf", "start": 537491940, "end": 537499973}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/glTF/noise.png", "start": 537499973, "end": 537874241}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/metadata.json", "start": 537874241, "end": 537875434}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/screenshot/screenshot-x150.jpg", "start": 537875434, "end": 537877682}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/screenshot/screenshot.jpg", "start": 537877682, "end": 537887429}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescenceSuzanne/screenshot/screenshot_large.jpg", "start": 537887429, "end": 537999840}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/LICENSE.md", "start": 537999840, "end": 538000529}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/README.body.md", "start": 538000529, "end": 538006401}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/README.md", "start": 538006401, "end": 538013292}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF-Binary/IridescentDishWithOlives.glb", "start": 538013292, "end": 545336144}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/IridescentDishWithOlives.bin", "start": 545336144, "end": 546166824}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/IridescentDishWithOlives.gltf", "start": 546166824, "end": 546184487}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/IridescentDishWithOlives.x3d", "start": 546184487, "end": 549692358}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/app.js", "start": 549692358, "end": 549695386}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glasscover_irid.png", "start": 549695386, "end": 550624147}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glasscover_nrm.png", "start": 550624147, "end": 550993444}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glasscover_orm.png", "start": 550993444, "end": 551003692}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glasscover_spec.png", "start": 551003692, "end": 552845633}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glasscover_thick.png", "start": 552845633, "end": 553389014}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glassdish_irid.png", "start": 553389014, "end": 553901553}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/glassdish_spec.png", "start": 553901553, "end": 554311495}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/goldleaf_col.png", "start": 554311495, "end": 555456019}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/goldleaf_nrm.png", "start": 555456019, "end": 557051776}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/goldleaf_orm.png", "start": 557051776, "end": 557480927}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/index.html", "start": 557480927, "end": 557482507}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/.bin/mime", "start": 557482507, "end": 557482878}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/.bin/mime.cmd", "start": 557482878, "end": 557483194}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/.bin/mime.ps1", "start": 557483194, "end": 557483963}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/.package-lock.json", "start": 557483963, "end": 557512054}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/accepts/HISTORY.md", "start": 557512054, "end": 557517150}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/accepts/LICENSE", "start": 557517150, "end": 557518317}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/accepts/README.md", "start": 557518317, "end": 557522440}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/accepts/index.js", "start": 557522440, "end": 557527692}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/accepts/package.json", "start": 557527692, "end": 557528849}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/array-flatten/LICENSE", "start": 557528849, "end": 557529952}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/array-flatten/README.md", "start": 557529952, "end": 557531197}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/array-flatten/array-flatten.js", "start": 557531197, "end": 557532392}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/array-flatten/package.json", "start": 557532392, "end": 557533271}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/HISTORY.md", "start": 557533271, "end": 557550000}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/LICENSE", "start": 557550000, "end": 557551172}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/README.md", "start": 557551172, "end": 557570352}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/SECURITY.md", "start": 557570352, "end": 557571545}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/index.js", "start": 557571545, "end": 557574226}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/lib/read.js", "start": 557574226, "end": 557578551}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/lib/types/json.js", "start": 557578551, "end": 557583850}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/lib/types/raw.js", "start": 557583850, "end": 557585734}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/lib/types/text.js", "start": 557585734, "end": 557588019}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/lib/types/urlencoded.js", "start": 557588019, "end": 557594423}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/body-parser/package.json", "start": 557594423, "end": 557595895}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/bytes/History.md", "start": 557595895, "end": 557597670}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/bytes/LICENSE", "start": 557597670, "end": 557598823}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/bytes/Readme.md", "start": 557598823, "end": 557603593}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/bytes/index.js", "start": 557603593, "end": 557607206}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/bytes/package.json", "start": 557607206, "end": 557608165}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/.eslintignore", "start": 557608165, "end": 557608175}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/.eslintrc", "start": 557608175, "end": 557608383}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/.github/FUNDING.yml", "start": 557608383, "end": 557608963}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/.nycrc", "start": 557608963, "end": 557609102}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/CHANGELOG.md", "start": 557609102, "end": 557617244}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/LICENSE", "start": 557617244, "end": 557618315}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/README.md", "start": 557618315, "end": 557620341}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/callBound.js", "start": 557620341, "end": 557620754}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/index.js", "start": 557620754, "end": 557621791}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/package.json", "start": 557621791, "end": 557624095}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/test/callBound.js", "start": 557624095, "end": 557626444}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/call-bind/test/index.js", "start": 557626444, "end": 557630283}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-disposition/HISTORY.md", "start": 557630283, "end": 557631303}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-disposition/LICENSE", "start": 557631303, "end": 557632397}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-disposition/README.md", "start": 557632397, "end": 557637602}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-disposition/index.js", "start": 557637602, "end": 557648196}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-disposition/package.json", "start": 557648196, "end": 557649396}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-type/HISTORY.md", "start": 557649396, "end": 557649919}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-type/LICENSE", "start": 557649919, "end": 557651008}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-type/README.md", "start": 557651008, "end": 557653790}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-type/index.js", "start": 557653790, "end": 557658792}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/content-type/package.json", "start": 557658792, "end": 557659867}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie-signature/.npmignore", "start": 557659867, "end": 557659896}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie-signature/History.md", "start": 557659896, "end": 557660591}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie-signature/Readme.md", "start": 557660591, "end": 557662081}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie-signature/index.js", "start": 557662081, "end": 557663311}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie-signature/package.json", "start": 557663311, "end": 557663803}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie/LICENSE", "start": 557663803, "end": 557664978}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie/README.md", "start": 557664978, "end": 557676747}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie/SECURITY.md", "start": 557676747, "end": 557677927}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie/index.js", "start": 557677927, "end": 557686030}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/cookie/package.json", "start": 557686030, "end": 557687122}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/.coveralls.yml", "start": 557687122, "end": 557687168}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/.eslintrc", "start": 557687168, "end": 557687348}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/.npmignore", "start": 557687348, "end": 557687420}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/.travis.yml", "start": 557687420, "end": 557687560}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/CHANGELOG.md", "start": 557687560, "end": 557699267}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/LICENSE", "start": 557699267, "end": 557700374}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/Makefile", "start": 557700374, "end": 557701433}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/README.md", "start": 557701433, "end": 557719351}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/component.json", "start": 557719351, "end": 557719672}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/karma.conf.js", "start": 557719672, "end": 557721408}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/node.js", "start": 557721408, "end": 557721448}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/package.json", "start": 557721448, "end": 557722586}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/src/browser.js", "start": 557722586, "end": 557727320}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/src/debug.js", "start": 557727320, "end": 557731714}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/src/index.js", "start": 557731714, "end": 557731977}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/src/inspector-log.js", "start": 557731977, "end": 557732350}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/debug/src/node.js", "start": 557732350, "end": 557738365}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/.eslintrc", "start": 557738365, "end": 557738656}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/.github/FUNDING.yml", "start": 557738656, "end": 557739247}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/.nycrc", "start": 557739247, "end": 557739463}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/CHANGELOG.md", "start": 557739463, "end": 557744853}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/LICENSE", "start": 557744853, "end": 557745924}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/README.md", "start": 557745924, "end": 557748355}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/index.d.ts", "start": 557748355, "end": 557748670}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/index.js", "start": 557748670, "end": 557751006}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/package.json", "start": 557751006, "end": 557753862}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/test/index.js", "start": 557753862, "end": 557764333}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/define-data-property/tsconfig.json", "start": 557764333, "end": 557769216}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/History.md", "start": 557769216, "end": 557771472}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/LICENSE", "start": 557771472, "end": 557772566}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/Readme.md", "start": 557772566, "end": 557782554}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/index.js", "start": 557782554, "end": 557793486}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/lib/browser/index.js", "start": 557793486, "end": 557794998}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/depd/package.json", "start": 557794998, "end": 557796333}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/destroy/LICENSE", "start": 557796333, "end": 557797506}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/destroy/README.md", "start": 557797506, "end": 557799965}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/destroy/index.js", "start": 557799965, "end": 557804223}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/destroy/package.json", "start": 557804223, "end": 557805351}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ee-first/LICENSE", "start": 557805351, "end": 557806450}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ee-first/README.md", "start": 557806450, "end": 557809067}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ee-first/index.js", "start": 557809067, "end": 557810751}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ee-first/package.json", "start": 557810751, "end": 557811610}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/encodeurl/LICENSE", "start": 557811610, "end": 557812699}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/encodeurl/README.md", "start": 557812699, "end": 557815920}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/encodeurl/index.js", "start": 557815920, "end": 557817498}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/encodeurl/package.json", "start": 557817498, "end": 557818590}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/.eslintrc", "start": 557818590, "end": 557818734}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/.github/FUNDING.yml", "start": 557818734, "end": 557819298}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/.nycrc", "start": 557819298, "end": 557819437}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/CHANGELOG.md", "start": 557819437, "end": 557820259}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/LICENSE", "start": 557820259, "end": 557821330}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/README.md", "start": 557821330, "end": 557823386}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/index.d.ts", "start": 557823386, "end": 557823479}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/index.js", "start": 557823479, "end": 557823837}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/package.json", "start": 557823837, "end": 557825949}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/test/index.js", "start": 557825949, "end": 557827193}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-define-property/tsconfig.json", "start": 557827193, "end": 557830388}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/.eslintrc", "start": 557830388, "end": 557830431}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/.github/FUNDING.yml", "start": 557830431, "end": 557830986}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/CHANGELOG.md", "start": 557830986, "end": 557832819}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/LICENSE", "start": 557832819, "end": 557833890}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/README.md", "start": 557833890, "end": 557836004}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/eval.d.ts", "start": 557836004, "end": 557836072}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/eval.js", "start": 557836072, "end": 557836147}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/index.d.ts", "start": 557836147, "end": 557836203}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/index.js", "start": 557836203, "end": 557836269}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/package.json", "start": 557836269, "end": 557838443}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/range.d.ts", "start": 557838443, "end": 557838514}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/range.js", "start": 557838514, "end": 557838591}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/ref.d.ts", "start": 557838591, "end": 557838674}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/ref.js", "start": 557838674, "end": 557838753}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/syntax.d.ts", "start": 557838753, "end": 557838827}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/syntax.js", "start": 557838827, "end": 557838906}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/test/index.js", "start": 557838906, "end": 557839262}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/tsconfig.json", "start": 557839262, "end": 557842432}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/type.d.ts", "start": 557842432, "end": 557842499}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/type.js", "start": 557842499, "end": 557842574}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/uri.d.ts", "start": 557842574, "end": 557842639}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/es-errors/uri.js", "start": 557842639, "end": 557842712}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/escape-html/LICENSE", "start": 557842712, "end": 557843869}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/escape-html/Readme.md", "start": 557843869, "end": 557844576}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/escape-html/index.js", "start": 557844576, "end": 557845938}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/escape-html/package.json", "start": 557845938, "end": 557846372}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/etag/HISTORY.md", "start": 557846372, "end": 557848104}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/etag/LICENSE", "start": 557848104, "end": 557849198}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/etag/README.md", "start": 557849198, "end": 557853396}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/etag/index.js", "start": 557853396, "end": 557855875}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/etag/package.json", "start": 557855875, "end": 557857181}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/History.md", "start": 557857181, "end": 557972155}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/LICENSE", "start": 557972155, "end": 557973404}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/Readme.md", "start": 557973404, "end": 557983210}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/index.js", "start": 557983210, "end": 557983434}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/application.js", "start": 557983434, "end": 557998027}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/express.js", "start": 557998027, "end": 558000436}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/middleware/init.js", "start": 558000436, "end": 558001289}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/middleware/query.js", "start": 558001289, "end": 558002174}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/request.js", "start": 558002174, "end": 558014679}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/response.js", "start": 558014679, "end": 558043408}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/router/index.js", "start": 558043408, "end": 558058531}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/router/layer.js", "start": 558058531, "end": 558061827}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/router/route.js", "start": 558061827, "end": 558066226}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/utils.js", "start": 558066226, "end": 558072097}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/lib/view.js", "start": 558072097, "end": 558075422}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/express/package.json", "start": 558075422, "end": 558078130}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/finalhandler/HISTORY.md", "start": 558078130, "end": 558082679}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/finalhandler/LICENSE", "start": 558082679, "end": 558083798}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/finalhandler/README.md", "start": 558083798, "end": 558087918}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/finalhandler/SECURITY.md", "start": 558087918, "end": 558089120}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/finalhandler/index.js", "start": 558089120, "end": 558095888}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/finalhandler/package.json", "start": 558095888, "end": 558097164}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/forwarded/HISTORY.md", "start": 558097164, "end": 558097564}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/forwarded/LICENSE", "start": 558097564, "end": 558098658}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/forwarded/README.md", "start": 558098658, "end": 558100312}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/forwarded/index.js", "start": 558100312, "end": 558101890}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/forwarded/package.json", "start": 558101890, "end": 558103040}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/fresh/HISTORY.md", "start": 558103040, "end": 558104540}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/fresh/LICENSE", "start": 558104540, "end": 558105714}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/fresh/README.md", "start": 558105714, "end": 558109088}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/fresh/index.js", "start": 558109088, "end": 558111799}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/fresh/package.json", "start": 558111799, "end": 558113156}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/.eslintrc", "start": 558113156, "end": 558113409}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/.github/FUNDING.yml", "start": 558113409, "end": 558113993}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/.github/SECURITY.md", "start": 558113993, "end": 558114150}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/.nycrc", "start": 558114150, "end": 558114366}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/CHANGELOG.md", "start": 558114366, "end": 558128178}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/LICENSE", "start": 558128178, "end": 558129230}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/README.md", "start": 558129230, "end": 558130985}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/implementation.js", "start": 558130985, "end": 558133028}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/index.js", "start": 558133028, "end": 558133154}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/package.json", "start": 558133154, "end": 558135416}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/test/.eslintrc", "start": 558135416, "end": 558135592}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/function-bind/test/index.js", "start": 558135592, "end": 558144583}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/.eslintrc", "start": 558144583, "end": 558145186}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/.github/FUNDING.yml", "start": 558145186, "end": 558145770}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/.nycrc", "start": 558145770, "end": 558145909}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/CHANGELOG.md", "start": 558145909, "end": 558157549}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/LICENSE", "start": 558157549, "end": 558158620}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/README.md", "start": 558158620, "end": 558161411}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/index.js", "start": 558161411, "end": 558175026}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/package.json", "start": 558175026, "end": 558177440}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/get-intrinsic/test/GetIntrinsic.js", "start": 558177440, "end": 558186207}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/.eslintrc", "start": 558186207, "end": 558186431}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/.github/FUNDING.yml", "start": 558186431, "end": 558187006}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/CHANGELOG.md", "start": 558187006, "end": 558188547}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/LICENSE", "start": 558188547, "end": 558189618}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/README.md", "start": 558189618, "end": 558191180}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/index.js", "start": 558191180, "end": 558191443}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/package.json", "start": 558191443, "end": 558193320}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/gopd/test/index.js", "start": 558193320, "end": 558193910}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/.eslintrc", "start": 558193910, "end": 558194083}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/.github/FUNDING.yml", "start": 558194083, "end": 558194678}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/.nycrc", "start": 558194678, "end": 558194817}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/CHANGELOG.md", "start": 558194817, "end": 558197465}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/LICENSE", "start": 558197465, "end": 558198532}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/README.md", "start": 558198532, "end": 558200738}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/index.js", "start": 558200738, "end": 558201326}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/package.json", "start": 558201326, "end": 558203416}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-property-descriptors/test/index.js", "start": 558203416, "end": 558204821}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/.eslintrc", "start": 558204821, "end": 558204864}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/.github/FUNDING.yml", "start": 558204864, "end": 558205444}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/CHANGELOG.md", "start": 558205444, "end": 558207644}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/LICENSE", "start": 558207644, "end": 558208711}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/README.md", "start": 558208711, "end": 558210334}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/index.d.ts", "start": 558210334, "end": 558210391}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/index.js", "start": 558210391, "end": 558210693}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/package.json", "start": 558210693, "end": 558212697}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/test/index.js", "start": 558212697, "end": 558213174}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-proto/tsconfig.json", "start": 558213174, "end": 558216785}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/.eslintrc", "start": 558216785, "end": 558216949}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/.github/FUNDING.yml", "start": 558216949, "end": 558217531}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/.nycrc", "start": 558217531, "end": 558217670}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/CHANGELOG.md", "start": 558217670, "end": 558225360}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/LICENSE", "start": 558225360, "end": 558226431}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/README.md", "start": 558226431, "end": 558228475}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/index.js", "start": 558228475, "end": 558228895}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/package.json", "start": 558228895, "end": 558231543}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/shams.js", "start": 558231543, "end": 558233304}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/test/index.js", "start": 558233304, "end": 558233958}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/test/shams/core-js.js", "start": 558233958, "end": 558234681}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/test/shams/get-own-property-symbols.js", "start": 558234681, "end": 558235367}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/has-symbols/test/tests.js", "start": 558235367, "end": 558237388}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/.eslintrc", "start": 558237388, "end": 558237431}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/.github/FUNDING.yml", "start": 558237431, "end": 558237983}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/.nycrc", "start": 558237983, "end": 558238199}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/CHANGELOG.md", "start": 558238199, "end": 558240778}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/LICENSE", "start": 558240778, "end": 558241861}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/README.md", "start": 558241861, "end": 558243474}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/index.d.ts", "start": 558243474, "end": 558243591}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/index.js", "start": 558243591, "end": 558243797}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/package.json", "start": 558243797, "end": 558246080}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/hasown/tsconfig.json", "start": 558246080, "end": 558246153}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/http-errors/HISTORY.md", "start": 558246153, "end": 558250126}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/http-errors/LICENSE", "start": 558250126, "end": 558251294}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/http-errors/README.md", "start": 558251294, "end": 558257256}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/http-errors/index.js", "start": 558257256, "end": 558263647}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/http-errors/package.json", "start": 558263647, "end": 558264961}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/Changelog.md", "start": 558264961, "end": 558269303}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/LICENSE", "start": 558269303, "end": 558270367}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/README.md", "start": 558270367, "end": 558276901}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/dbcs-codec.js", "start": 558276901, "end": 558298316}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/dbcs-data.js", "start": 558298316, "end": 558306607}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/index.js", "start": 558306607, "end": 558307317}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/internal.js", "start": 558307317, "end": 558313432}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/sbcs-codec.js", "start": 558313432, "end": 558315623}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/sbcs-data-generated.js", "start": 558315623, "end": 558347657}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/sbcs-data.js", "start": 558347657, "end": 558352343}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/big5-added.json", "start": 558352343, "end": 558370060}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/cp936.json", "start": 558370060, "end": 558417380}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/cp949.json", "start": 558417380, "end": 558455502}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/cp950.json", "start": 558455502, "end": 558497858}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/eucjp.json", "start": 558497858, "end": 558538922}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/gb18030-ranges.json", "start": 558538922, "end": 558541138}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/gbk-added.json", "start": 558541138, "end": 558542365}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/tables/shiftjis.json", "start": 558542365, "end": 558566147}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/utf16.js", "start": 558566147, "end": 558571158}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/encodings/utf7.js", "start": 558571158, "end": 558580373}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/lib/bom-handling.js", "start": 558580373, "end": 558581482}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/lib/extend-node.js", "start": 558581482, "end": 558590183}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/lib/index.d.ts", "start": 558590183, "end": 558591165}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/lib/index.js", "start": 558591165, "end": 558596288}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/lib/streams.js", "start": 558596288, "end": 558599675}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/iconv-lite/package.json", "start": 558599675, "end": 558600902}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/inherits/LICENSE", "start": 558600902, "end": 558601651}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/inherits/README.md", "start": 558601651, "end": 558603276}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/inherits/inherits.js", "start": 558603276, "end": 558603526}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/inherits/inherits_browser.js", "start": 558603526, "end": 558604279}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/inherits/package.json", "start": 558604279, "end": 558604860}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js/LICENSE", "start": 558604860, "end": 558605947}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js/README.md", "start": 558605947, "end": 558614256}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js/ipaddr.min.js", "start": 558614256, "end": 558623994}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js/lib/ipaddr.js", "start": 558623994, "end": 558643327}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js/lib/ipaddr.js.d.ts", "start": 558643327, "end": 558646286}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ipaddr.js/package.json", "start": 558646286, "end": 558647005}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/media-typer/HISTORY.md", "start": 558647005, "end": 558647466}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/media-typer/LICENSE", "start": 558647466, "end": 558648555}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/media-typer/README.md", "start": 558648555, "end": 558650926}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/media-typer/index.js", "start": 558650926, "end": 558657301}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/media-typer/package.json", "start": 558657301, "end": 558658060}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/merge-descriptors/HISTORY.md", "start": 558658060, "end": 558658423}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/merge-descriptors/LICENSE", "start": 558658423, "end": 558659590}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/merge-descriptors/README.md", "start": 558659590, "end": 558660895}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/merge-descriptors/index.js", "start": 558660895, "end": 558662113}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/merge-descriptors/package.json", "start": 558662113, "end": 558663141}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/methods/HISTORY.md", "start": 558663141, "end": 558663568}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/methods/LICENSE", "start": 558663568, "end": 558664748}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/methods/README.md", "start": 558664748, "end": 558666442}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/methods/index.js", "start": 558666442, "end": 558667482}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/methods/package.json", "start": 558667482, "end": 558668429}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-db/HISTORY.md", "start": 558668429, "end": 558681010}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-db/LICENSE", "start": 558681010, "end": 558682182}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-db/README.md", "start": 558682182, "end": 558686273}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-db/db.json", "start": 558686273, "end": 558872155}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-db/index.js", "start": 558872155, "end": 558872344}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-db/package.json", "start": 558872344, "end": 558873968}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-types/HISTORY.md", "start": 558873968, "end": 558882780}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-types/LICENSE", "start": 558882780, "end": 558883947}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-types/README.md", "start": 558883947, "end": 558887428}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-types/index.js", "start": 558887428, "end": 558891091}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime-types/package.json", "start": 558891091, "end": 558892240}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/.npmignore", "start": 558892240, "end": 558892240}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/CHANGELOG.md", "start": 558892240, "end": 558901713}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/LICENSE", "start": 558901713, "end": 558902811}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/README.md", "start": 558902811, "end": 558904930}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/cli.js", "start": 558904930, "end": 558905079}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/mime.js", "start": 558905079, "end": 558907805}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/package.json", "start": 558907805, "end": 558908738}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/src/build.js", "start": 558908738, "end": 558910089}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/src/test.js", "start": 558910089, "end": 558912423}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/mime/types.json", "start": 558912423, "end": 558943978}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ms/index.js", "start": 558943978, "end": 558946742}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ms/license.md", "start": 558946742, "end": 558947819}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ms/package.json", "start": 558947819, "end": 558948523}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/ms/readme.md", "start": 558948523, "end": 558950244}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/HISTORY.md", "start": 558950244, "end": 558952743}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/LICENSE", "start": 558952743, "end": 558953920}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/README.md", "start": 558953920, "end": 558958821}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/index.js", "start": 558958821, "end": 558961272}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/lib/charset.js", "start": 558961272, "end": 558964353}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/lib/encoding.js", "start": 558964353, "end": 558967859}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/lib/language.js", "start": 558967859, "end": 558971268}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/lib/mediaType.js", "start": 558971268, "end": 558976626}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/negotiator/package.json", "start": 558976626, "end": 558977619}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/.eslintrc", "start": 558977619, "end": 558978917}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/.github/FUNDING.yml", "start": 558978917, "end": 558979502}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/.nycrc", "start": 558979502, "end": 558979738}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/CHANGELOG.md", "start": 558979738, "end": 559014522}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/LICENSE", "start": 559014522, "end": 559015593}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/example/all.js", "start": 559015593, "end": 559015984}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/example/circular.js", "start": 559015984, "end": 559016100}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/example/fn.js", "start": 559016100, "end": 559016226}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/example/inspect.js", "start": 559016226, "end": 559016477}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/index.js", "start": 559016477, "end": 559035477}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/package-support.json", "start": 559035477, "end": 559035842}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/package.json", "start": 559035842, "end": 559038644}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/readme.markdown", "start": 559038644, "end": 559041632}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test-core-js.js", "start": 559041632, "end": 559042166}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/bigint.js", "start": 559042166, "end": 559044248}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/browser/dom.js", "start": 559044248, "end": 559044664}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/circular.js", "start": 559044664, "end": 559045115}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/deep.js", "start": 559045115, "end": 559045515}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/element.js", "start": 559045515, "end": 559047090}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/err.js", "start": 559047090, "end": 559048626}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/fakes.js", "start": 559048626, "end": 559049309}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/fn.js", "start": 559049309, "end": 559051536}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/global.js", "start": 559051536, "end": 559051908}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/has.js", "start": 559051908, "end": 559052422}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/holes.js", "start": 559052422, "end": 559052677}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/indent-option.js", "start": 559052677, "end": 559059310}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/inspect.js", "start": 559059310, "end": 559064256}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/lowbyte.js", "start": 559064256, "end": 559064524}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/number.js", "start": 559064524, "end": 559066836}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/quoteStyle.js", "start": 559066836, "end": 559067769}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/toStringTag.js", "start": 559067769, "end": 559069315}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/undef.js", "start": 559069315, "end": 559069617}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/test/values.js", "start": 559069617, "end": 559076651}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/object-inspect/util.inspect.js", "start": 559076651, "end": 559076693}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/on-finished/HISTORY.md", "start": 559076693, "end": 559078558}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/on-finished/LICENSE", "start": 559078558, "end": 559079725}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/on-finished/README.md", "start": 559079725, "end": 559084885}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/on-finished/index.js", "start": 559084885, "end": 559089315}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/on-finished/package.json", "start": 559089315, "end": 559090372}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/parseurl/HISTORY.md", "start": 559090372, "end": 559091415}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/parseurl/LICENSE", "start": 559091415, "end": 559092588}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/parseurl/README.md", "start": 559092588, "end": 559096682}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/parseurl/index.js", "start": 559096682, "end": 559099491}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/parseurl/package.json", "start": 559099491, "end": 559100671}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/path-to-regexp/LICENSE", "start": 559100671, "end": 559101774}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/path-to-regexp/Readme.md", "start": 559101774, "end": 559102876}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/path-to-regexp/index.js", "start": 559102876, "end": 559106493}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/path-to-regexp/package.json", "start": 559106493, "end": 559107047}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/proxy-addr/HISTORY.md", "start": 559107047, "end": 559110038}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/proxy-addr/LICENSE", "start": 559110038, "end": 559111132}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/proxy-addr/README.md", "start": 559111132, "end": 559115263}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/proxy-addr/index.js", "start": 559115263, "end": 559121263}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/proxy-addr/package.json", "start": 559121263, "end": 559122446}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/.editorconfig", "start": 559122446, "end": 559123043}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/.eslintrc", "start": 559123043, "end": 559124069}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/.github/FUNDING.yml", "start": 559124069, "end": 559124617}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/.nycrc", "start": 559124617, "end": 559124833}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/CHANGELOG.md", "start": 559124833, "end": 559156919}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/LICENSE.md", "start": 559156919, "end": 559158519}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/README.md", "start": 559158519, "end": 559183072}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/dist/qs.js", "start": 559183072, "end": 559229721}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/lib/formats.js", "start": 559229721, "end": 559230197}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/lib/index.js", "start": 559230197, "end": 559230408}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/lib/parse.js", "start": 559230408, "end": 559241725}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/lib/stringify.js", "start": 559241725, "end": 559253056}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/lib/utils.js", "start": 559253056, "end": 559260323}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/package.json", "start": 559260323, "end": 559263396}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/test/empty-keys-cases.js", "start": 559263396, "end": 559271094}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/test/parse.js", "start": 559271094, "end": 559317968}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/test/stringify.js", "start": 559317968, "end": 559370915}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/qs/test/utils.js", "start": 559370915, "end": 559376027}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/range-parser/HISTORY.md", "start": 559376027, "end": 559376944}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/range-parser/LICENSE", "start": 559376944, "end": 559378122}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/range-parser/README.md", "start": 559378122, "end": 559380400}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/range-parser/index.js", "start": 559380400, "end": 559383300}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/range-parser/package.json", "start": 559383300, "end": 559384484}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/HISTORY.md", "start": 559384484, "end": 559390532}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/LICENSE", "start": 559390532, "end": 559391713}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/README.md", "start": 559391713, "end": 559398266}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/SECURITY.md", "start": 559398266, "end": 559399454}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/index.d.ts", "start": 559399454, "end": 559401740}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/index.js", "start": 559401740, "end": 559408911}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/raw-body/package.json", "start": 559408911, "end": 559410236}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safe-buffer/LICENSE", "start": 559410236, "end": 559411317}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safe-buffer/README.md", "start": 559411317, "end": 559430872}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safe-buffer/index.d.ts", "start": 559430872, "end": 559439610}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safe-buffer/index.js", "start": 559439610, "end": 559441280}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safe-buffer/package.json", "start": 559441280, "end": 559442337}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/LICENSE", "start": 559442337, "end": 559443431}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/Porting-Buffer.md", "start": 559443431, "end": 559456225}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/Readme.md", "start": 559456225, "end": 559464486}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/dangerous.js", "start": 559464486, "end": 559465969}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/package.json", "start": 559465969, "end": 559466791}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/safer.js", "start": 559466791, "end": 559468901}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/safer-buffer/tests.js", "start": 559468901, "end": 559484636}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/HISTORY.md", "start": 559484636, "end": 559498033}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/LICENSE", "start": 559498033, "end": 559499161}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/README.md", "start": 559499161, "end": 559508637}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/SECURITY.md", "start": 559508637, "end": 559509807}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/index.js", "start": 559509807, "end": 559533262}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/encodeurl/HISTORY.md", "start": 559533262, "end": 559533500}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/encodeurl/LICENSE", "start": 559533500, "end": 559534589}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/encodeurl/README.md", "start": 559534589, "end": 559538444}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/encodeurl/index.js", "start": 559538444, "end": 559540030}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/encodeurl/package.json", "start": 559540030, "end": 559541121}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/ms/index.js", "start": 559541121, "end": 559544145}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/ms/license.md", "start": 559544145, "end": 559545224}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/ms/package.json", "start": 559545224, "end": 559545956}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/node_modules/ms/readme.md", "start": 559545956, "end": 559547842}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/send/package.json", "start": 559547842, "end": 559549413}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/serve-static/HISTORY.md", "start": 559549413, "end": 559560176}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/serve-static/LICENSE", "start": 559560176, "end": 559561365}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/serve-static/README.md", "start": 559561365, "end": 559569177}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/serve-static/index.js", "start": 559569177, "end": 559573698}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/serve-static/package.json", "start": 559573698, "end": 559574839}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/.eslintrc", "start": 559574839, "end": 559575243}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/.github/FUNDING.yml", "start": 559575243, "end": 559575806}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/.nycrc", "start": 559575806, "end": 559576022}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/CHANGELOG.md", "start": 559576022, "end": 559580898}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/LICENSE", "start": 559580898, "end": 559581981}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/README.md", "start": 559581981, "end": 559584148}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/env.d.ts", "start": 559584148, "end": 559584370}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/env.js", "start": 559584370, "end": 559585237}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/index.d.ts", "start": 559585237, "end": 559585493}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/index.js", "start": 559585493, "end": 559586766}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/package.json", "start": 559586766, "end": 559589470}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/set-function-length/tsconfig.json", "start": 559589470, "end": 559589586}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof/LICENSE", "start": 559589586, "end": 559590313}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof/README.md", "start": 559590313, "end": 559591157}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof/index.d.ts", "start": 559591157, "end": 559591250}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof/index.js", "start": 559591250, "end": 559591657}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof/package.json", "start": 559591657, "end": 559592921}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/setprototypeof/test/index.js", "start": 559592921, "end": 559593611}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/.editorconfig", "start": 559593611, "end": 559593756}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/.eslintrc", "start": 559593756, "end": 559593941}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/.github/FUNDING.yml", "start": 559593941, "end": 559594524}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/.nycrc", "start": 559594524, "end": 559594740}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/CHANGELOG.md", "start": 559594740, "end": 559603542}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/LICENSE", "start": 559603542, "end": 559604613}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/README.md", "start": 559604613, "end": 559604711}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/index.d.ts", "start": 559604711, "end": 559605476}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/index.js", "start": 559605476, "end": 559609422}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/package.json", "start": 559609422, "end": 559611697}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/test/index.js", "start": 559611697, "end": 559613656}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/side-channel/tsconfig.json", "start": 559613656, "end": 559616851}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/statuses/HISTORY.md", "start": 559616851, "end": 559618397}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/statuses/LICENSE", "start": 559618397, "end": 559619569}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/statuses/README.md", "start": 559619569, "end": 559623128}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/statuses/codes.json", "start": 559623128, "end": 559624917}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/statuses/index.js", "start": 559624917, "end": 559627527}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/statuses/package.json", "start": 559627527, "end": 559628967}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/toidentifier/HISTORY.md", "start": 559628967, "end": 559629095}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/toidentifier/LICENSE", "start": 559629095, "end": 559630203}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/toidentifier/README.md", "start": 559630203, "end": 559632006}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/toidentifier/index.js", "start": 559632006, "end": 559632510}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/toidentifier/package.json", "start": 559632510, "end": 559633652}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/type-is/HISTORY.md", "start": 559633652, "end": 559639099}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/type-is/LICENSE", "start": 559639099, "end": 559640271}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/type-is/README.md", "start": 559640271, "end": 559645454}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/type-is/index.js", "start": 559645454, "end": 559651016}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/type-is/package.json", "start": 559651016, "end": 559652149}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/unpipe/HISTORY.md", "start": 559652149, "end": 559652208}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/unpipe/LICENSE", "start": 559652208, "end": 559653322}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/unpipe/README.md", "start": 559653322, "end": 559654572}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/unpipe/index.js", "start": 559654572, "end": 559655690}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/unpipe/package.json", "start": 559655690, "end": 559656460}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/utils-merge/.npmignore", "start": 559656460, "end": 559656539}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/utils-merge/LICENSE", "start": 559656539, "end": 559657623}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/utils-merge/README.md", "start": 559657623, "end": 559658942}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/utils-merge/index.js", "start": 559658942, "end": 559659323}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/utils-merge/package.json", "start": 559659323, "end": 559660180}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/vary/HISTORY.md", "start": 559660180, "end": 559660972}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/vary/LICENSE", "start": 559660972, "end": 559662066}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/vary/README.md", "start": 559662066, "end": 559664782}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/vary/index.js", "start": 559664782, "end": 559667712}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/node_modules/vary/package.json", "start": 559667712, "end": 559668927}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/olives_col.png", "start": 559668927, "end": 559852743}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/olives_nrm.png", "start": 559852743, "end": 560081732}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/olives_orm.png", "start": 560081732, "end": 560619240}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/package-lock.json", "start": 560619240, "end": 560647460}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/package.json", "start": 560647460, "end": 560647647}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/metadata.json", "start": 560647647, "end": 560648479}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/DassaultPBRSampleRenderer.jpg", "start": 560648479, "end": 561475871}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/ReferencePhotos.jpg", "start": 561475871, "end": 561765543}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/glassCover_animation.gif", "start": 561765543, "end": 562994245}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/glassCover_textures.jpg", "start": 562994245, "end": 563333984}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/glassDish_occlusion.jpg", "start": 563333984, "end": 563378771}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/screenshot-x150.jpg", "start": 563378771, "end": 563388080}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/screenshot.jpg", "start": 563388080, "end": 563466736}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/screenshot_Large.jpg", "start": 563466736, "end": 563971881}, {"filename": "/resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/screenshot/specular_vs_iridescence.jpg", "start": 563971881, "end": 564287436}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/LICENSE.md", "start": 564287436, "end": 564288230}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/README.body.md", "start": 564288230, "end": 564288333}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/README.md", "start": 564288333, "end": 564289292}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb", "start": 564289292, "end": 573853556}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Draco/Lantern.bin", "start": 573853556, "end": 573934524}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Draco/Lantern.gltf", "start": 573934524, "end": 573941720}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Draco/Lantern_baseColor.png", "start": 573941720, "end": 578403252}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Draco/Lantern_emissive.png", "start": 578403252, "end": 578572587}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Draco/Lantern_normal.png", "start": 578572587, "end": 581192470}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Draco/Lantern_roughnessMetallic.png", "start": 581192470, "end": 583271067}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Quantized/Lantern.bin", "start": 583271067, "end": 583386331}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Quantized/Lantern.gltf", "start": 583386331, "end": 583390891}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Quantized/Lantern_baseColor.png", "start": 583390891, "end": 587852423}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Quantized/Lantern_emissive.png", "start": 587852423, "end": 588021758}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Quantized/Lantern_normal.png", "start": 588021758, "end": 590641641}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF-Quantized/Lantern_roughnessMetallic.png", "start": 590641641, "end": 592720238}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF/Lantern.bin", "start": 592720238, "end": 592951562}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF/Lantern.gltf", "start": 592951562, "end": 592957891}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF/Lantern_baseColor.png", "start": 592957891, "end": 597419423}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF/Lantern_emissive.png", "start": 597419423, "end": 597588758}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF/Lantern_normal.png", "start": 597588758, "end": 600208641}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/glTF/Lantern_roughnessMetallic.png", "start": 600208641, "end": 602287238}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/metadata.json", "start": 602287238, "end": 602288385}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/screenshot/screenshot-x150.jpg", "start": 602288385, "end": 602291069}, {"filename": "/resources/glTF-Sample-Assets/Models/Lantern/screenshot/screenshot.jpg", "start": 602291069, "end": 602293684}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/LICENSE.md", "start": 602293684, "end": 602294371}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/README.body.md", "start": 602294371, "end": 602295910}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/README.md", "start": 602295910, "end": 602298287}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF-Binary/LightsPunctualLamp.glb", "start": 602298287, "end": 606639607}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/LightsPunctualLamp.data.bin", "start": 606639607, "end": 606894247}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/LightsPunctualLamp.gltf", "start": 606894247, "end": 606908353}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material0_basecolor.jpeg", "start": 606908353, "end": 607413757}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material0_emissive.jpeg", "start": 607413757, "end": 607541817}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material0_metallic_roughness.jpeg", "start": 607541817, "end": 607726302}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material0_normal.png", "start": 607726302, "end": 610754447}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material1_basecolor.png", "start": 610754447, "end": 610810021}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material1_normal.png", "start": 610810021, "end": 610810147}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/glTF/material2_transmission.jpeg", "start": 610810147, "end": 610987182}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/metadata.json", "start": 610987182, "end": 610987917}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/screenshot/lamp_white_bg.png", "start": 610987917, "end": 611741670}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/screenshot/lights_on_off.gif", "start": 611741670, "end": 611952241}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/screenshot/screenshot-x150.png", "start": 611952241, "end": 611964289}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/screenshot/screenshot.png", "start": 611964289, "end": 612014288}, {"filename": "/resources/glTF-Sample-Assets/Models/LightsPunctualLamp/screenshot/shade_details.gif", "start": 612014288, "end": 612634779}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/LICENSE.md", "start": 612634779, "end": 612635584}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/README.body.md", "start": 612635584, "end": 612636662}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/README.md", "start": 612636662, "end": 612638636}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/glTF/MandarinOrange.bin", "start": 612638636, "end": 613901084}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/glTF/MandarinOrange.gltf", "start": 613901084, "end": 613905076}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/glTF/MandarinOrange_Basecolor.jpg", "start": 613905076, "end": 614663479}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/glTF/MandarinOrange_DiffuseTransmission.png", "start": 614663479, "end": 615015205}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/glTF/MandarinOrange_Normal.png", "start": 615015205, "end": 616695800}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/glTF/MandarinOrange_OcclusionRough.jpg", "start": 616695800, "end": 616859666}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/metadata.json", "start": 616859666, "end": 616860956}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/screenshot/screenshot-large.jpg", "start": 616860956, "end": 617488162}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/screenshot/screenshot.jpg", "start": 617488162, "end": 617506767}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/screenshot/textures.jpg", "start": 617506767, "end": 618386664}, {"filename": "/resources/glTF-Sample-Assets/Models/MandarinOrange/screenshot/with-without.jpg", "start": 618386664, "end": 619436907}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/LICENSE.md", "start": 619436907, "end": 619437592}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/README.body.md", "start": 619437592, "end": 619438004}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/README.md", "start": 619438004, "end": 619439377}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb", "start": 619439377, "end": 627272969}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/MaterialsVariantsShoe.bin", "start": 627272969, "end": 627978649}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/MaterialsVariantsShoe.gltf", "start": 627978649, "end": 627986047}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/diffuseBeach.jpg", "start": 627986047, "end": 629235219}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/diffuseMidnight.jpg", "start": 629235219, "end": 630487535}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/diffuseStreet.jpg", "start": 630487535, "end": 631692371}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/normal.jpg", "start": 631692371, "end": 633990783}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF/occlusionRougnessMetalness.jpg", "start": 633990783, "end": 635109867}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/metadata.json", "start": 635109867, "end": 635110740}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/screenshot/screenshot-large.png", "start": 635110740, "end": 635963931}, {"filename": "/resources/glTF-Sample-Assets/Models/MaterialsVariantsShoe/screenshot/screenshot.jpg", "start": 635963931, "end": 635986678}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/LICENSE.md", "start": 635986678, "end": 635987358}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/README.body.md", "start": 635987358, "end": 635988553}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/README.md", "start": 635988553, "end": 635990404}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/glTF-Embedded/MeshPrimitiveModes.gltf", "start": 635990404, "end": 635995011}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/glTF/MeshPrimitiveModes.gltf", "start": 635995011, "end": 635999303}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/glTF/buffer.bin", "start": 635999303, "end": 635999519}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/metadata.json", "start": 635999519, "end": 636000336}, {"filename": "/resources/glTF-Sample-Assets/Models/MeshPrimitiveModes/screenshot/screenshot.png", "start": 636000336, "end": 636001639}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/LICENSE.md", "start": 636001639, "end": 636002320}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/README.body.md", "start": 636002320, "end": 636002457}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/README.md", "start": 636002457, "end": 636003394}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb", "start": 636003394, "end": 647224750}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF-Embedded/MetalRoughSpheres.gltf", "start": 647224750, "end": 662192676}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF/MetalRoughSpheres.gltf", "start": 662192676, "end": 662205082}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF/MetalRoughSpheres0.bin", "start": 662205082, "end": 673404986}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF/Spheres_BaseColor.png", "start": 673404986, "end": 673413486}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/glTF/Spheres_MetalRough.png", "start": 673413486, "end": 673421706}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/metadata.json", "start": 673421706, "end": 673422488}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/screenshot/screenshot-x150.png", "start": 673422488, "end": 673462682}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheres/screenshot/screenshot.png", "start": 673462682, "end": 673595292}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/LICENSE.md", "start": 673595292, "end": 673596112}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/README.md", "start": 673596112, "end": 673597243}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/glTF-Binary/MetalRoughSpheresNoTextures.glb", "start": 673597243, "end": 673888559}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/glTF/MetalRoughSpheresNoTextures.bin", "start": 673888559, "end": 674130147}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/glTF/MetalRoughSpheresNoTextures.gltf", "start": 674130147, "end": 674263992}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/metadata.json", "start": 674263992, "end": 674265259}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/screenshot/screenshot-x150.png", "start": 674265259, "end": 674302645}, {"filename": "/resources/glTF-Sample-Assets/Models/MetalRoughSpheresNoTextures/screenshot/screenshot.png", "start": 674302645, "end": 674390467}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-core.md", "start": 674390467, "end": 674441047}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-extension.md", "start": 674441047, "end": 674490595}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-issues.md", "start": 674490595, "end": 674497058}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-showcase.md", "start": 674497058, "end": 674516642}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-testing.md", "start": 674516642, "end": 674592654}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-video.md", "start": 674592654, "end": 674601612}, {"filename": "/resources/glTF-Sample-Assets/Models/Models-written.md", "start": 674601612, "end": 674608892}, {"filename": "/resources/glTF-Sample-Assets/Models/Models.md", "start": 674608892, "end": 674708495}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/LICENSE.md", "start": 674708495, "end": 674709307}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/README.body.md", "start": 674709307, "end": 674710310}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/README.md", "start": 674710310, "end": 674712243}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF-Binary/MorphPrimitivesTest.glb", "start": 674712243, "end": 674765899}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF-Draco/MorphPrimitivesTest.bin", "start": 674765899, "end": 674766779}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF-Draco/MorphPrimitivesTest.gltf", "start": 674766779, "end": 674772371}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF-Draco/uv_texture.jpg", "start": 674772371, "end": 674821906}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF/MorphPrimitivesTest.bin", "start": 674821906, "end": 674823418}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF/MorphPrimitivesTest.gltf", "start": 674823418, "end": 674829359}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/glTF/uv_texture.jpg", "start": 674829359, "end": 674878894}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/metadata.json", "start": 674878894, "end": 674880091}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/screenshot/screenshot-x150.jpg", "start": 674880091, "end": 674888662}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphPrimitivesTest/screenshot/screenshot.jpg", "start": 674888662, "end": 674910820}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/LICENSE.md", "start": 674910820, "end": 674911499}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/README.body.md", "start": 674911499, "end": 674914259}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/README.md", "start": 674914259, "end": 674917779}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/glTF-Binary/MorphStressTest.glb", "start": 674917779, "end": 675493679}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/glTF/Base_AO.png", "start": 675493679, "end": 675672113}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/glTF/ColorSwatches.png", "start": 675672113, "end": 675672321}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/glTF/MorphStressTest.bin", "start": 675672321, "end": 676060405}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/glTF/MorphStressTest.gltf", "start": 676060405, "end": 676085130}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/glTF/TinyGrid.png", "start": 676085130, "end": 676085316}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/metadata.json", "start": 676085316, "end": 676086064}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/screenshot/Anim_Individuals.gif", "start": 676086064, "end": 676276184}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/screenshot/Anim_Pulse.gif", "start": 676276184, "end": 676495601}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/screenshot/Anim_TheWave.gif", "start": 676495601, "end": 676624724}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/screenshot/screenshot-x150.jpg", "start": 676624724, "end": 676634561}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/screenshot/screenshot.jpg", "start": 676634561, "end": 676654165}, {"filename": "/resources/glTF-Sample-Assets/Models/MorphStressTest/screenshot/screenshot_large.png", "start": 676654165, "end": 676804263}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/LICENSE.md", "start": 676804263, "end": 676805071}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/README.body.md", "start": 676805071, "end": 676806240}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/README.md", "start": 676806240, "end": 676808451}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb", "start": 676808451, "end": 701038355}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber.bin", "start": 701038355, "end": 702107087}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber.gltf", "start": 702107087, "end": 702119877}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber0.jpg", "start": 702119877, "end": 707195195}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber1.png", "start": 707195195, "end": 715447701}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber2.png", "start": 715447701, "end": 720556911}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber3.jpg", "start": 720556911, "end": 722535625}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/glTF/MosquitoInAmber4.jpg", "start": 722535625, "end": 725274454}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/metadata.json", "start": 725274454, "end": 725275670}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/screenshot/screenshot-x150.jpg", "start": 725275670, "end": 725283030}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/screenshot/screenshot.jpg", "start": 725283030, "end": 725293888}, {"filename": "/resources/glTF-Sample-Assets/Models/MosquitoInAmber/screenshot/screenshot_large.jpg", "start": 725293888, "end": 725394232}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/LICENSE.md", "start": 725394232, "end": 725395003}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/README.md", "start": 725395003, "end": 725395981}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/glTF-Binary/MultiUVTest.glb", "start": 725395981, "end": 725438985}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/glTF-Embedded/MultiUVTest.gltf", "start": 725438985, "end": 725499241}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/glTF/MultiUVTest.bin", "start": 725499241, "end": 725500621}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/glTF/MultiUVTest.gltf", "start": 725500621, "end": 725506781}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/glTF/uv0.png", "start": 725506781, "end": 725539720}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/glTF/uv1.png", "start": 725539720, "end": 725595905}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/metadata.json", "start": 725595905, "end": 725597072}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/screenshot/screenshot-x150.jpg", "start": 725597072, "end": 725611073}, {"filename": "/resources/glTF-Sample-Assets/Models/MultiUVTest/screenshot/screenshot.jpg", "start": 725611073, "end": 725706123}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/LICENSE.md", "start": 725706123, "end": 725706798}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/README.body.md", "start": 725706798, "end": 725707184}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/README.md", "start": 725707184, "end": 725708207}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/glTF-Embedded/MultipleScenes.gltf", "start": 725708207, "end": 725710400}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/glTF/MultipleScenes.gltf", "start": 725710400, "end": 725712413}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/glTF/simpleSquare.bin", "start": 725712413, "end": 725712473}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/glTF/simpleTriangle.bin", "start": 725712473, "end": 725712517}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/metadata.json", "start": 725712517, "end": 725713306}, {"filename": "/resources/glTF-Sample-Assets/Models/MultipleScenes/screenshot/screenshot.png", "start": 725713306, "end": 725745867}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/LICENSE.md", "start": 725745867, "end": 725746548}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/README.body.md", "start": 725746548, "end": 725749702}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/README.md", "start": 725749702, "end": 725753666}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/glTF-Binary/NegativeScaleTest.glb", "start": 725753666, "end": 725816234}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/glTF/CheckAndX.png", "start": 725816234, "end": 725826009}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/glTF/NegativeScaleLabels2.png", "start": 725826009, "end": 725844991}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/glTF/NegativeScaleTest.bin", "start": 725844991, "end": 725871655}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/glTF/NegativeScaleTest.gltf", "start": 725871655, "end": 725890191}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/metadata.json", "start": 725890191, "end": 725890997}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/screenshot/negative-normal-fail.jpg", "start": 725890997, "end": 725936753}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/screenshot/negative-scale-fail.jpg", "start": 725936753, "end": 725994515}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/screenshot/no-backface-culling.jpg", "start": 725994515, "end": 726114885}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/screenshot/screenshot-large.jpg", "start": 726114885, "end": 726236034}, {"filename": "/resources/glTF-Sample-Assets/Models/NegativeScaleTest/screenshot/screenshot.jpg", "start": 726236034, "end": 726257939}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/LICENSE.md", "start": 726257939, "end": 726258618}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/README.body.md", "start": 726258618, "end": 726259890}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/README.md", "start": 726259890, "end": 726261952}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/glTF-Binary/NodePerformanceTest.glb", "start": 726261952, "end": 764875164}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/metadata.json", "start": 764875164, "end": 764875946}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/screenshot/screenshot.jpg", "start": 764875946, "end": 764878773}, {"filename": "/resources/glTF-Sample-Assets/Models/NodePerformanceTest/screenshot/screenshot_large.jpg", "start": 764878773, "end": 765129960}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/LICENSE.md", "start": 765129960, "end": 765130648}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/README.body.md", "start": 765130648, "end": 765134159}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/README.md", "start": 765134159, "end": 765138519}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/glTF-Binary/NormalTangentMirrorTest.glb", "start": 765138519, "end": 767034195}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/glTF/NormalTangentMirrorTest.bin", "start": 767034195, "end": 767198595}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/glTF/NormalTangentMirrorTest.gltf", "start": 767198595, "end": 767203754}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/glTF/NormalTangentMirrorTest_BaseColor.png", "start": 767203754, "end": 767264201}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/glTF/NormalTangentMirrorTest_OcclusionRoughnessMetallic.png", "start": 767264201, "end": 768720245}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/glTF/NormalTangentTest_Normal.png", "start": 768720245, "end": 768932740}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/metadata.json", "start": 768932740, "end": 768933553}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/back-side.png", "start": 768933553, "end": 769126890}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/incorrect-flipped-y.png", "start": 769126890, "end": 769304245}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/screenshot-larger.png", "start": 769304245, "end": 769570046}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/screenshot-x150.png", "start": 769570046, "end": 769591639}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/screenshot.png", "start": 769591639, "end": 769642046}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/supplied-tangents-ignored.png", "start": 769642046, "end": 769969917}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentMirrorTest/screenshot/top-down.png", "start": 769969917, "end": 769982348}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/LICENSE.md", "start": 769982348, "end": 769983027}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/README.body.md", "start": 769983027, "end": 769985655}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/README.md", "start": 769985655, "end": 769989110}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/glTF-Binary/NormalTangentTest.glb", "start": 769989110, "end": 771786106}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/glTF/NormalTangentTest.gltf", "start": 771786106, "end": 771790756}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/glTF/NormalTangentTest0.bin", "start": 771790756, "end": 771964856}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/glTF/NormalTangentTest_BaseColor.png", "start": 771964856, "end": 772001240}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/glTF/NormalTangentTest_Normal.png", "start": 772001240, "end": 772213735}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/glTF/NormalTangentTest_OcclusionRoughnessMetallic.png", "start": 772213735, "end": 773585575}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/metadata.json", "start": 773585575, "end": 773586378}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/screenshot/back-side.png", "start": 773586378, "end": 773792382}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/screenshot/incorrect-flipped-y.png", "start": 773792382, "end": 773914770}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/screenshot/screenshot-larger.png", "start": 773914770, "end": 774037022}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/screenshot/screenshot-x150.png", "start": 774037022, "end": 774058976}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/screenshot/screenshot.png", "start": 774058976, "end": 774100030}, {"filename": "/resources/glTF-Sample-Assets/Models/NormalTangentTest/screenshot/top-down.png", "start": 774100030, "end": 774113934}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/LICENSE.md", "start": 774113934, "end": 774114612}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/README.body.md", "start": 774114612, "end": 774116240}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/README.md", "start": 774116240, "end": 774118617}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/glTF-Binary/OrientationTest.glb", "start": 774118617, "end": 774157537}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/glTF-Embedded/OrientationTest.gltf", "start": 774157537, "end": 774226322}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/glTF/OrientationTest.bin", "start": 774226322, "end": 774253490}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/glTF/OrientationTest.gltf", "start": 774253490, "end": 774286033}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/metadata.json", "start": 774286033, "end": 774286770}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/screenshot/OrientationTestFail.png", "start": 774286770, "end": 774345290}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/screenshot/screenshot-x150.png", "start": 774345290, "end": 774368227}, {"filename": "/resources/glTF-Sample-Assets/Models/OrientationTest/screenshot/screenshot.png", "start": 774368227, "end": 774412326}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/LICENSE.md", "start": 774412326, "end": 774413037}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/README.body.md", "start": 774413037, "end": 774414790}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/README.md", "start": 774414790, "end": 774417284}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/glTF-Binary/PlaysetLightTest.glb", "start": 774417284, "end": 791376536}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/metadata.json", "start": 791376536, "end": 791377307}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/screenshot/blender_screenshot_large.jpg", "start": 791377307, "end": 791456606}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/screenshot/screenshot.jpg", "start": 791456606, "end": 791460672}, {"filename": "/resources/glTF-Sample-Assets/Models/PlaysetLightTest/screenshot/screenshot_large.jpg", "start": 791460672, "end": 791693090}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/LICENSE.md", "start": 791693090, "end": 791693956}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/README.body.md", "start": 791693956, "end": 791694741}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/README.md", "start": 791694741, "end": 791696586}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF-Binary/PotOfCoals.glb", "start": 791696586, "end": 796752118}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/CopperPot_basecolor.jpg", "start": 796752118, "end": 797068102}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/CopperPot_clearcoat.jpg", "start": 797068102, "end": 797127915}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/CopperPot_normal.png", "start": 797127915, "end": 797708503}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/CopperPot_orm.jpg", "start": 797708503, "end": 798004335}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/HotCoals_basecolor.jpg", "start": 798004335, "end": 798356114}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/HotCoals_emissive.jpg", "start": 798356114, "end": 798419913}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/HotCoals_normal.jpg", "start": 798419913, "end": 799809395}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/HotCoals_orm.jpg", "start": 799809395, "end": 799835128}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/PotOfCoals.bin", "start": 799835128, "end": 801803212}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/glTF/PotOfCoals.gltf", "start": 801803212, "end": 801810302}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/metadata.json", "start": 801810302, "end": 801811876}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/screenshot/screenshot.jpg", "start": 801811876, "end": 801817472}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/screenshot/screenshot_Angles.jpg", "start": 801817472, "end": 801922576}, {"filename": "/resources/glTF-Sample-Assets/Models/PotOfCoals/screenshot/screenshot_Large.jpg", "start": 801922576, "end": 802673770}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/LICENSE.md", "start": 802673770, "end": 802674457}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/README.body.md", "start": 802674457, "end": 802675001}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/README.md", "start": 802675001, "end": 802676238}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/Colors.bin", "start": 802676238, "end": 802938382}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/Labels.png", "start": 802938382, "end": 802970910}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/Lines.bin", "start": 802970910, "end": 803757342}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/Plane.bin", "start": 803757342, "end": 803757434}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/Points.bin", "start": 803757434, "end": 804543866}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/PrimitiveModeNormalsTest.gltf", "start": 804543866, "end": 804561668}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/glTF/Triangles.bin", "start": 804561668, "end": 804566048}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/metadata.json", "start": 804566048, "end": 804566866}, {"filename": "/resources/glTF-Sample-Assets/Models/PrimitiveModeNormalsTest/screenshot/screenshot.png", "start": 804566866, "end": 804723804}, {"filename": "/resources/glTF-Sample-Assets/Models/README.md", "start": 804723804, "end": 804724653}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/LICENSE.md", "start": 804724653, "end": 804725334}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/README.body.md", "start": 804725334, "end": 804726415}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/README.md", "start": 804726415, "end": 804728326}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/glTF-Binary/RecursiveSkeletons.glb", "start": 804728326, "end": 805289946}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/glTF/RecursiveSkeletons.bin", "start": 805289946, "end": 805396002}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/glTF/RecursiveSkeletons.gltf", "start": 805396002, "end": 806394650}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/metadata.json", "start": 806394650, "end": 806395438}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/screenshot/screenshot-skin-rigging.jpg", "start": 806395438, "end": 806444715}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/screenshot/screenshot-x150.jpg", "start": 806444715, "end": 806449317}, {"filename": "/resources/glTF-Sample-Assets/Models/RecursiveSkeletons/screenshot/screenshot.jpg", "start": 806449317, "end": 806453905}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/LICENSE.md", "start": 806453905, "end": 806454580}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/README.md", "start": 806454580, "end": 806455387}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/glTF-Binary/RiggedFigure.glb", "start": 806455387, "end": 806505503}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/glTF-Draco/RiggedFigure.gltf", "start": 806505503, "end": 806559086}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/glTF-Draco/RiggedFigure0.bin", "start": 806559086, "end": 806565258}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/glTF-Embedded/RiggedFigure.gltf", "start": 806565258, "end": 806667805}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/glTF/RiggedFigure.gltf", "start": 806667805, "end": 806740752}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/glTF/RiggedFigure0.bin", "start": 806740752, "end": 806762936}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/metadata.json", "start": 806762936, "end": 806763645}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedFigure/screenshot/screenshot.gif", "start": 806763645, "end": 806799315}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/LICENSE.md", "start": 806799315, "end": 806799990}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/README.md", "start": 806799990, "end": 806800831}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/glTF-Binary/RiggedSimple.glb", "start": 806800831, "end": 806815935}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/glTF-Draco/RiggedSimple.gltf", "start": 806815935, "end": 806823930}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/glTF-Draco/RiggedSimple0.bin", "start": 806823930, "end": 806828450}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/glTF-Embedded/RiggedSimple.gltf", "start": 806828450, "end": 806854336}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/glTF/RiggedSimple.gltf", "start": 806854336, "end": 806865354}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/glTF/RiggedSimple0.bin", "start": 806865354, "end": 806876490}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/metadata.json", "start": 806876490, "end": 806877233}, {"filename": "/resources/glTF-Sample-Assets/Models/RiggedSimple/screenshot/screenshot.gif", "start": 806877233, "end": 806943240}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/LICENSE.md", "start": 806943240, "end": 806944039}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/README.md", "start": 806944039, "end": 806944854}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/glTF/SciFiHelmet.bin", "start": 806944854, "end": 810588702}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/glTF/SciFiHelmet.gltf", "start": 810588702, "end": 810593391}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/glTF/SciFiHelmet_AmbientOcclusion.png", "start": 810593391, "end": 814512947}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/glTF/SciFiHelmet_BaseColor.png", "start": 814512947, "end": 822354085}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/glTF/SciFiHelmet_MetallicRoughness.png", "start": 822354085, "end": 831842896}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/glTF/SciFiHelmet_Normal.png", "start": 831842896, "end": 837232061}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/metadata.json", "start": 837232061, "end": 837233205}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/screenshot/screenshot-x150.jpg", "start": 837233205, "end": 837240710}, {"filename": "/resources/glTF-Sample-Assets/Models/SciFiHelmet/screenshot/screenshot.jpg", "start": 837240710, "end": 837250635}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/LICENSE.md", "start": 837250635, "end": 837251305}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/README.body.md", "start": 837251305, "end": 837254565}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/README.md", "start": 837254565, "end": 837258778}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb", "start": 837258778, "end": 842012098}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/SheenChair.bin", "start": 842012098, "end": 843150074}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/SheenChair.gltf", "start": 843150074, "end": 843171540}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_fabric_albedo.png", "start": 843171540, "end": 843397221}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_fabric_normal.png", "start": 843397221, "end": 845241140}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_label.png", "start": 845241140, "end": 845922176}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_occlusion.png", "start": 845922176, "end": 846130370}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_wood_albedo.png", "start": 846130370, "end": 846429677}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_woodblack_roughnessmetallic.png", "start": 846429677, "end": 846568568}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/glTF/chair_woodbrown_roughnessmetallic.png", "start": 846568568, "end": 846778726}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/metadata.json", "start": 846778726, "end": 846779483}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/screenshot/mango_reference.jpg", "start": 846779483, "end": 847695199}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/screenshot/peacock_reference.jpg", "start": 847695199, "end": 848563932}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/screenshot/screenshot-large.jpg", "start": 848563932, "end": 848880117}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/screenshot/screenshot-x150.jpg", "start": 848880117, "end": 848885786}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenChair/screenshot/screenshot.jpg", "start": 848885786, "end": 848895974}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/LICENSE.md", "start": 848895974, "end": 848896645}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/README.body.md", "start": 848896645, "end": 848898159}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/README.md", "start": 848898159, "end": 848900438}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/SheenCloth.bin", "start": 848900438, "end": 852379526}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/SheenCloth.gltf", "start": 852379526, "end": 852386640}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/SheenCloth_AO.jpg", "start": 852386640, "end": 852558360}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/technicalFabricSmall_basecolor_256.png", "start": 852558360, "end": 852683386}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/technicalFabricSmall_normal_256.png", "start": 852683386, "end": 852811238}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/technicalFabricSmall_orm_256.png", "start": 852811238, "end": 852942541}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/glTF/technicalFabricSmall_sheen_256.png", "start": 852942541, "end": 853112909}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/metadata.json", "start": 853112909, "end": 853113647}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/screenshot/screenshot-x150.jpg", "start": 853113647, "end": 853129555}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/screenshot/screenshot.jpg", "start": 853129555, "end": 853143813}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/screenshot/sheenTextureSample.jpg", "start": 853143813, "end": 853251087}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenCloth/screenshot/sheen_technicalFabric_side.jpg", "start": 853251087, "end": 853365664}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/LICENSE.md", "start": 853365664, "end": 853366337}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/README.body.md", "start": 853366337, "end": 853367641}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/README.md", "start": 853367641, "end": 853369846}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/glTF-Binary/SheenTestGrid.glb", "start": 853369846, "end": 855210910}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/glTF/SheenTestGrid.bin", "start": 855210910, "end": 857029222}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/glTF/SheenTestGrid.gltf", "start": 857029222, "end": 857070804}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/glTF/checker.png", "start": 857070804, "end": 857071631}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/metadata.json", "start": 857071631, "end": 857072396}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/screenshot/screenshot.jpg", "start": 857072396, "end": 857075716}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/screenshot/screenshot_Large.jpg", "start": 857075716, "end": 857294905}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/screenshot/screenshot_Punctual.jpg", "start": 857294905, "end": 857493123}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenTestGrid/screenshot/sheen-sheenColor-sheenRough.jpg", "start": 857493123, "end": 857630154}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/LICENSE.md", "start": 857630154, "end": 857630963}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/README.body.md", "start": 857630963, "end": 857634546}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/README.md", "start": 857634546, "end": 857639357}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb", "start": 857639357, "end": 867747269}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Brown_BaseColor.webp", "start": 867747269, "end": 867783095}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Brown_Normal.webp", "start": 867783095, "end": 867910989}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Cushions_Occlusion.webp", "start": 867910989, "end": 867924807}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Frame_BaseColor.webp", "start": 867924807, "end": 868103837}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Frame_Normal.webp", "start": 868103837, "end": 869910771}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Frame_ORM.webp", "start": 869910771, "end": 869927795}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Fringe_BaseColor.webp", "start": 869927795, "end": 870030263}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Fringe_Normal.webp", "start": 870030263, "end": 870046683}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Fringe_Occlusion.webp", "start": 870046683, "end": 870049849}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Paisley_BaseColor.webp", "start": 870049849, "end": 870513673}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Paisley_Normal.webp", "start": 870513673, "end": 871274591}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/SheenWoodLeatherSofa.bin", "start": 871274591, "end": 877807967}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/SheenWoodLeatherSofa.gltf", "start": 877807967, "end": 877832246}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Striped_BaseColor.webp", "start": 877832246, "end": 877852136}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/glTF/Striped_Normal.webp", "start": 877852136, "end": 877866280}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/metadata.json", "start": 877866280, "end": 877867527}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/screenshot/screenshot.jpg", "start": 877867527, "end": 877876439}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/screenshot/screenshot_BeforeAfter.jpg", "start": 877876439, "end": 878192043}, {"filename": "/resources/glTF-Sample-Assets/Models/SheenWoodLeatherSofa/screenshot/screenshot_Large.jpg", "start": 878192043, "end": 878794021}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/LICENSE.md", "start": 878794021, "end": 878794698}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/README.body.md", "start": 878794698, "end": 878795789}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/README.md", "start": 878795789, "end": 878797749}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/glTF-Binary/SimpleInstancing.glb", "start": 878797749, "end": 878805105}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/glTF/SimpleInstancing.gltf", "start": 878805105, "end": 878808316}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/glTF/SimpleInstancing_data.bin", "start": 878808316, "end": 878814036}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/metadata.json", "start": 878814036, "end": 878814844}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/screenshot/screenshot.png", "start": 878814844, "end": 878826941}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleInstancing/screenshot/screenshot_large.png", "start": 878826941, "end": 878866284}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/LICENSE.md", "start": 878866284, "end": 878866959}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/README.body.md", "start": 878866959, "end": 878867437}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/README.md", "start": 878867437, "end": 878868574}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/glTF-Embedded/SimpleMaterial.gltf", "start": 878868574, "end": 878869987}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/glTF/SimpleMaterial.gltf", "start": 878869987, "end": 878871315}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/glTF/triangle.bin", "start": 878871315, "end": 878871395}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/metadata.json", "start": 878871395, "end": 878872174}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/screenshot/screenshot.png", "start": 878872174, "end": 878942933}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMaterial/screenshot/simpleTriangle.png", "start": 878942933, "end": 878986791}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/LICENSE.md", "start": 878986791, "end": 878987464}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/README.body.md", "start": 878987464, "end": 878988245}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/README.md", "start": 878988245, "end": 878989873}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/glTF-Embedded/SimpleMeshes.gltf", "start": 878989873, "end": 878991447}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/glTF/SimpleMeshes.gltf", "start": 878991447, "end": 878992886}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/glTF/triangle.bin", "start": 878992886, "end": 878992966}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/metadata.json", "start": 878992966, "end": 878993935}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/screenshot/screenshot-x150.png", "start": 878993935, "end": 878995285}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/screenshot/screenshot.png", "start": 878995285, "end": 878996060}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMeshes/screenshot/triangle.png", "start": 878996060, "end": 879058955}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/LICENSE.md", "start": 879058955, "end": 879059627}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/README.body.md", "start": 879059627, "end": 879060093}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/README.md", "start": 879060093, "end": 879061179}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/glTF-Embedded/SimpleMorph.gltf", "start": 879061179, "end": 879064370}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/glTF/SimpleMorph.gltf", "start": 879064370, "end": 879067294}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/glTF/simpleMorphAnimation.bin", "start": 879067294, "end": 879067354}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/glTF/simpleMorphGeometry.bin", "start": 879067354, "end": 879067470}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/metadata.json", "start": 879067470, "end": 879068229}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/screenshot/screenshot-x150.png", "start": 879068229, "end": 879070214}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/screenshot/screenshot.png", "start": 879070214, "end": 879072595}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleMorph/screenshot/simpleMorphStructure.png", "start": 879072595, "end": 879154492}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/LICENSE.md", "start": 879154492, "end": 879155163}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/README.body.md", "start": 879155163, "end": 879155732}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/README.md", "start": 879155732, "end": 879156956}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/glTF-Embedded/SimpleSkin.gltf", "start": 879156956, "end": 879160652}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/glTF/SimpleSkin.gltf", "start": 879160652, "end": 879163132}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/glTF/inverseBindMatrices.bin", "start": 879163132, "end": 879163260}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/glTF/skinAnimation.bin", "start": 879163260, "end": 879163500}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/glTF/skinGeometry.bin", "start": 879163500, "end": 879163668}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/glTF/skinningData.bin", "start": 879163668, "end": 879163988}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/metadata.json", "start": 879163988, "end": 879164767}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/screenshot/inverseBindMatrices.png", "start": 879164767, "end": 879208647}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/screenshot/screenshot.gif", "start": 879208647, "end": 881209507}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/screenshot/skinAnimation.png", "start": 881209507, "end": 881310298}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/screenshot/skinGeometry.png", "start": 881310298, "end": 881384864}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSkin/screenshot/skinningData.png", "start": 881384864, "end": 881471203}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/LICENSE.md", "start": 881471203, "end": 881471887}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/README.body.md", "start": 881471887, "end": 881472441}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/README.md", "start": 881472441, "end": 881473642}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/glTF-Embedded/SimpleSparseAccessor.gltf", "start": 881473642, "end": 881475401}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/glTF/SimpleSparseAccessor.bin", "start": 881475401, "end": 881475685}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf", "start": 881475685, "end": 881477547}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/metadata.json", "start": 881477547, "end": 881478330}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/screenshot/SimpleSparseAccessorDescription.png", "start": 881478330, "end": 881559678}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/screenshot/screenshot-x150.png", "start": 881559678, "end": 881561641}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/screenshot/screenshot.png", "start": 881561641, "end": 881568744}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleSparseAccessor/screenshot/simpleSparseAccessorStructure.png", "start": 881568744, "end": 881676266}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/LICENSE.md", "start": 881676266, "end": 881676940}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/README.body.md", "start": 881676940, "end": 881677242}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/README.md", "start": 881677242, "end": 881678199}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/glTF-Embedded/SimpleTexture.gltf", "start": 881678199, "end": 881684331}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/glTF/SimpleTexture.bin", "start": 881684331, "end": 881684439}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/glTF/SimpleTexture.gltf", "start": 881684439, "end": 881686093}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/glTF/testTexture.png", "start": 881686093, "end": 881689322}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/metadata.json", "start": 881689322, "end": 881690098}, {"filename": "/resources/glTF-Sample-Assets/Models/SimpleTexture/screenshot/screenshot.png", "start": 881690098, "end": 881781979}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/LICENSE.md", "start": 881781979, "end": 881782662}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/README.body.md", "start": 881782662, "end": 881784217}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/README.md", "start": 881784217, "end": 881786773}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF-Binary/SpecGlossVsMetalRough.glb", "start": 881786773, "end": 897252097}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/SpecGlossVsMetalRough.gltf", "start": 897252097, "end": 897264524}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/SpecGlossVsMetalRough.png", "start": 897264524, "end": 897273192}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/SpecGlossVsMetalRoughLabel.bin", "start": 897273192, "end": 897273728}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle.bin", "start": 897273728, "end": 897423140}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_baseColor.png", "start": 897423140, "end": 899588990}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_diffuse.png", "start": 899588990, "end": 902015290}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_emissive.png", "start": 902015290, "end": 902074392}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_normal.png", "start": 902074392, "end": 905081764}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_occlusion.png", "start": 905081764, "end": 905417774}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_roughnessMetallic.png", "start": 905417774, "end": 908749734}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/glTF/WaterBottle_specularGlossiness.png", "start": 908749734, "end": 912724514}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/metadata.json", "start": 912724514, "end": 912725314}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/screenshot/screenshot-large.jpg", "start": 912725314, "end": 912760872}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/screenshot/screenshot-x150.jpg", "start": 912760872, "end": 912767209}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecGlossVsMetalRough/screenshot/screenshot.jpg", "start": 912767209, "end": 912778298}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/LICENSE.md", "start": 912778298, "end": 912778976}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/README.body.md", "start": 912778976, "end": 912780315}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/README.md", "start": 912780315, "end": 912782670}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/glTF-Binary/SpecularSilkPouf.glb", "start": 912782670, "end": 917415182}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/glTF/SpecularSilkPouf.bin", "start": 917415182, "end": 919729166}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/glTF/SpecularSilkPouf.gltf", "start": 919729166, "end": 919733077}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/glTF/SpecularSilkPouf_normal.png", "start": 919733077, "end": 921859873}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/glTF/SpecularSilkPouf_occlusion.png", "start": 921859873, "end": 922049423}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/metadata.json", "start": 922049423, "end": 922050222}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/screenshot/eva-andersson-photo.jpg", "start": 922050222, "end": 922180942}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/screenshot/screenshot.jpg", "start": 922180942, "end": 922184572}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularSilkPouf/screenshot/screenshot_Large.jpg", "start": 922184572, "end": 922275345}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/LICENSE.md", "start": 922275345, "end": 922276020}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/README.body.md", "start": 922276020, "end": 922278771}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/README.md", "start": 922278771, "end": 922282397}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF-Binary/SpecularTest.glb", "start": 922282397, "end": 922505773}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF/LeftLabels.png", "start": 922505773, "end": 922536290}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF/SpecularTest.bin", "start": 922536290, "end": 922716378}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF/SpecularTest.gltf", "start": 922716378, "end": 922750507}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF/WhiteGrid.png", "start": 922750507, "end": 922750712}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF/YellowGrid.png", "start": 922750712, "end": 922750916}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/glTF/specularTextureGrid.png", "start": 922750916, "end": 922751158}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/metadata.json", "start": 922751158, "end": 922751962}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/screenshot/purple.jpg", "start": 922751962, "end": 922780522}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/screenshot/screenshot-large.png", "start": 922780522, "end": 923485542}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/screenshot/screenshot-x150.jpg", "start": 923485542, "end": 923493372}, {"filename": "/resources/glTF-Sample-Assets/Models/SpecularTest/screenshot/screenshot.jpg", "start": 923493372, "end": 923509092}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/LICENSE.md", "start": 923509092, "end": 923509774}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/README.body.md", "start": 923509774, "end": 923512668}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/README.md", "start": 923512668, "end": 923516094}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/10381718147657362067.jpg", "start": 923516094, "end": 924398074}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/10388182081421875623.jpg", "start": 924398074, "end": 925315276}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/11474523244911310074.jpg", "start": 925315276, "end": 926394428}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/11490520546946913238.jpg", "start": 926394428, "end": 926715803}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/11872827283454512094.jpg", "start": 926715803, "end": 927384765}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/11968150294050148237.jpg", "start": 927384765, "end": 927915149}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/1219024358953944284.jpg", "start": 927915149, "end": 928244273}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/12501374198249454378.jpg", "start": 928244273, "end": 928662508}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/13196865903111448057.jpg", "start": 928662508, "end": 928944488}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/13824894030729245199.jpg", "start": 928944488, "end": 929257948}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/13982482287905699490.jpg", "start": 929257948, "end": 929605486}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/14118779221266351425.jpg", "start": 929605486, "end": 931216800}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/14170708867020035030.jpg", "start": 931216800, "end": 931357538}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/14267839433702832875.jpg", "start": 931357538, "end": 932068755}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/14650633544276105767.jpg", "start": 932068755, "end": 932590702}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/15295713303328085182.jpg", "start": 932590702, "end": 933110864}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/15722799267630235092.jpg", "start": 933110864, "end": 933671122}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/16275776544635328252.png", "start": 933671122, "end": 934748554}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/16299174074766089871.jpg", "start": 934748554, "end": 935071247}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/16885566240357350108.jpg", "start": 935071247, "end": 935083822}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/17556969131407844942.jpg", "start": 935083822, "end": 935453883}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/17876391417123941155.jpg", "start": 935453883, "end": 936605331}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2051777328469649772.jpg", "start": 936605331, "end": 936811949}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2185409758123873465.jpg", "start": 936811949, "end": 937592115}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2299742237651021498.jpg", "start": 937592115, "end": 938364787}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2374361008830720677.jpg", "start": 938364787, "end": 939216866}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2411100444841994089.jpg", "start": 939216866, "end": 939616829}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2775690330959970771.jpg", "start": 939616829, "end": 940402507}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/2969916736137545357.jpg", "start": 940402507, "end": 941224880}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/332936164838540657.jpg", "start": 941224880, "end": 942076959}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/3371964815757888145.jpg", "start": 942076959, "end": 942759702}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/3455394979645218238.jpg", "start": 942759702, "end": 943311134}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/3628158980083700836.jpg", "start": 943311134, "end": 943838922}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/3827035219084910048.jpg", "start": 943838922, "end": 944447316}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/4477655471536070370.jpg", "start": 944447316, "end": 944658638}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/4601176305987539675.jpg", "start": 944658638, "end": 945701790}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/466164707995436622.jpg", "start": 945701790, "end": 946188424}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/4675343432951571524.jpg", "start": 946188424, "end": 946952953}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/4871783166746854860.jpg", "start": 946952953, "end": 947523034}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/4910669866631290573.jpg", "start": 947523034, "end": 948566186}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/4975155472559461469.jpg", "start": 948566186, "end": 948965213}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/5061699253647017043.png", "start": 948965213, "end": 951393134}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/5792855332885324923.jpg", "start": 951393134, "end": 951957935}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/5823059166183034438.jpg", "start": 951957935, "end": 952531092}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/6047387724914829168.jpg", "start": 952531092, "end": 953049402}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/6151467286084645207.jpg", "start": 953049402, "end": 953692919}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/6593109234861095314.jpg", "start": 953692919, "end": 954736071}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/6667038893015345571.jpg", "start": 954736071, "end": 955439491}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/6772804448157695701.jpg", "start": 955439491, "end": 956039450}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/7056944414013900257.jpg", "start": 956039450, "end": 956891529}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/715093869573992647.jpg", "start": 956891529, "end": 957172274}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/7268504077753552595.jpg", "start": 957172274, "end": 957744519}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/7441062115984513793.jpg", "start": 957744519, "end": 958410315}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/755318871556304029.jpg", "start": 958410315, "end": 958712678}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/759203620573749278.jpg", "start": 958712678, "end": 959222089}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/7645212358685992005.jpg", "start": 959222089, "end": 959879084}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/7815564343179553343.jpg", "start": 959879084, "end": 960502228}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8006627369776289000.png", "start": 960502228, "end": 961727385}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8051790464816141987.jpg", "start": 961727385, "end": 961987504}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8114461559286000061.jpg", "start": 961987504, "end": 962180581}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8481240838833932244.jpg", "start": 962180581, "end": 962711737}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8503262930880235456.jpg", "start": 962711737, "end": 962816363}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8747919177698443163.jpg", "start": 962816363, "end": 963688618}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8750083169368950601.jpg", "start": 963688618, "end": 964051055}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8773302468495022225.jpg", "start": 964051055, "end": 964464892}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/8783994986360286082.jpg", "start": 964464892, "end": 964853354}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/9288698199695299068.jpg", "start": 964853354, "end": 965897684}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/9916269861720640319.jpg", "start": 965897684, "end": 966506371}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/Sponza.bin", "start": 966506371, "end": 976034591}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/Sponza.gltf", "start": 976034591, "end": 976210340}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/glTF/white.png", "start": 976210340, "end": 976211291}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/metadata.json", "start": 976211291, "end": 976211986}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/screenshot/large.jpg", "start": 976211986, "end": 977097097}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/screenshot/screenshot-x150.jpg", "start": 977097097, "end": 977114974}, {"filename": "/resources/glTF-Sample-Assets/Models/Sponza/screenshot/screenshot.jpg", "start": 977114974, "end": 977146742}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/LICENSE.md", "start": 977146742, "end": 977147420}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/README.body.md", "start": 977147420, "end": 977159914}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/README.md", "start": 977159914, "end": 977173139}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp.bin", "start": 977173139, "end": 979020731}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp.gltf", "start": 979020731, "end": 979043336}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_base_basecolor.jpg", "start": 979043336, "end": 980454027}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_base_emissive.jpg", "start": 980454027, "end": 980911427}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_base_normal.jpg", "start": 980911427, "end": 981122099}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_base_occlusion-rough-metal.jpg", "start": 981122099, "end": 981818301}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_bulbs_occlusion-rough-metal.jpg", "start": 981818301, "end": 981835207}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_glass_basecolor-alpha.png", "start": 981835207, "end": 984412625}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_glass_emissive.jpg", "start": 984412625, "end": 984937403}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_glass_normal.jpg", "start": 984937403, "end": 986231457}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_glass_occlusion-rough-metal.jpg", "start": 986231457, "end": 986856547}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_grill_basecolor-alpha.png", "start": 986856547, "end": 987769809}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_grill_emissive.jpg", "start": 987769809, "end": 987840438}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_grill_normal.jpg", "start": 987840438, "end": 988471462}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_grill_occlusion-rough-metal.jpg", "start": 988471462, "end": 988874289}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_hardware_basecolor.jpg", "start": 988874289, "end": 988922646}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_hardware_emissive.jpg", "start": 988922646, "end": 989076687}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_hardware_normal.jpg", "start": 989076687, "end": 989170696}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_hardware_occlusion-rough-metal.jpg", "start": 989170696, "end": 989383562}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-JPG-PNG/StainedGlassLamp_steel_occlusion-rough-metal.jpg", "start": 989383562, "end": 989425487}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp.bin", "start": 989425487, "end": 991273079}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp.gltf", "start": 991273079, "end": 991305813}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_base_basecolor.ktx2", "start": 991305813, "end": 991609749}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_base_emissive.ktx2", "start": 991609749, "end": 991784570}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_base_normal.ktx2", "start": 991784570, "end": 992066860}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_base_occlusion-rough-metal.ktx2", "start": 992066860, "end": 992986436}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_bulbs_occlusion-rough-metal.ktx2", "start": 992986436, "end": 993013412}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_glass_basecolor-alpha.ktx2", "start": 993013412, "end": 994792737}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_glass_emissive.ktx2", "start": 994792737, "end": 995334136}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_glass_normal.ktx2", "start": 995334136, "end": 996897515}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_glass_occlusion-rough-metal_transmission.ktx2", "start": 996897515, "end": 997401127}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_glass_transmission-clearcoat.ktx2", "start": 997401127, "end": 997840905}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_grill_basecolor-alpha.ktx2", "start": 997840905, "end": 998058025}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_grill_emissive.ktx2", "start": 998058025, "end": 998087208}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_grill_normal.ktx2", "start": 998087208, "end": 998867675}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_grill_occlusion-rough-metal.ktx2", "start": 998867675, "end": 999458486}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_hardware_basecolor.ktx2", "start": 999458486, "end": 999475710}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_hardware_emissive.ktx2", "start": 999475710, "end": 999534718}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_hardware_normal.ktx2", "start": 999534718, "end": 999646841}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_hardware_occlusion-rough-metal.ktx2", "start": 999646841, "end": 999857147}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF-KTX-BasisU/StainedGlassLamp_steel_occlusion-rough-metal.ktx2", "start": 999857147, "end": 999902094}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp.bin", "start": 999902094, "end": 1001749686}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp.gltf", "start": 1001749686, "end": 1001780671}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_base_basecolor.png", "start": 1001780671, "end": 1003528810}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_base_emissive.png", "start": 1003528810, "end": 1006150420}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_base_normal.png", "start": 1006150420, "end": 1007999758}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_base_occlusion-rough-metal.png", "start": 1007999758, "end": 1012027918}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_bulbs_occlusion-rough-metal.png", "start": 1012027918, "end": 1012069405}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_glass_basecolor-alpha.png", "start": 1012069405, "end": 1014646823}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_glass_emissive.png", "start": 1014646823, "end": 1016733114}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_glass_normal.png", "start": 1016733114, "end": 1018882498}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_glass_occlusion-rough-metal_transmission.png", "start": 1018882498, "end": 1020925584}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_glass_transmission-clearcoat.png", "start": 1020925584, "end": 1022443969}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_grill_basecolor-alpha.png", "start": 1022443969, "end": 1024632594}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_grill_emissive.png", "start": 1024632594, "end": 1025759554}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_grill_normal.png", "start": 1025759554, "end": 1028752013}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_grill_occlusion-rough-metal.png", "start": 1028752013, "end": 1030875003}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_hardware_basecolor.png", "start": 1030875003, "end": 1031781528}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_hardware_emissive.png", "start": 1031781528, "end": 1034953547}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_hardware_normal.png", "start": 1034953547, "end": 1037462711}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_hardware_occlusion-rough-metal.png", "start": 1037462711, "end": 1039953029}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/glTF/StainedGlassLamp_steel_occlusion-rough-metal.png", "start": 1039953029, "end": 1039995584}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/metadata.json", "start": 1039995584, "end": 1039996297}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/chart_jpg-ktx.jpg", "start": 1039996297, "end": 1040052964}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/photo2.jpg", "start": 1040052964, "end": 1040172664}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/photo3.jpg", "start": 1040172664, "end": 1040294087}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/photo_and_screenshot.jpg", "start": 1040294087, "end": 1041159060}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/render_enterprisepbr.jpg", "start": 1041159060, "end": 1041884969}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/render_ospray.jpg", "start": 1041884969, "end": 1042042947}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot-x150.jpg", "start": 1042042947, "end": 1042097779}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot.jpg", "start": 1042097779, "end": 1042205194}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_clearcoat_on-off.gif", "start": 1042205194, "end": 1042350905}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_jpg-png.jpg", "start": 1042350905, "end": 1042768806}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_ktx.jpg", "start": 1042768806, "end": 1044183672}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_large.jpg", "start": 1044183672, "end": 1044684822}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_transmission_on-off.gif", "start": 1044684822, "end": 1044943054}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_transmission_rotation.gif", "start": 1044943054, "end": 1045709193}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_variants_on-off.gif", "start": 1045709193, "end": 1045938103}, {"filename": "/resources/glTF-Sample-Assets/Models/StainedGlassLamp/screenshot/screenshot_volume_on-off.gif", "start": 1045938103, "end": 1046139482}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/LICENSE.md", "start": 1046139482, "end": 1046140149}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/README.body.md", "start": 1046140149, "end": 1046140248}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/README.md", "start": 1046140248, "end": 1046140931}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/glTF/Suzanne.bin", "start": 1046140931, "end": 1046731331}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/glTF/Suzanne.gltf", "start": 1046731331, "end": 1046735254}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/glTF/Suzanne_BaseColor.png", "start": 1046735254, "end": 1047896878}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/glTF/Suzanne_MetallicRoughness.png", "start": 1047896878, "end": 1048757356}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/metadata.json", "start": 1048757356, "end": 1048758083}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/screenshot/screenshot-x150.jpg", "start": 1048758083, "end": 1048765617}, {"filename": "/resources/glTF-Sample-Assets/Models/Suzanne/screenshot/screenshot.jpg", "start": 1048765617, "end": 1048775237}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/LICENSE.md", "start": 1048775237, "end": 1048775920}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/README.body.md", "start": 1048775920, "end": 1048776625}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/README.md", "start": 1048776625, "end": 1048778152}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/glTF-Binary/TextureCoordinateTest.glb", "start": 1048778152, "end": 1048792384}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/glTF-Embedded/TextureCoordinateTest.gltf", "start": 1048792384, "end": 1048818766}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/glTF/TextureCoordinateTemplate.png", "start": 1048818766, "end": 1048826050}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/glTF/TextureCoordinateTest.bin", "start": 1048826050, "end": 1048826698}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/glTF/TextureCoordinateTest.gltf", "start": 1048826698, "end": 1048842499}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/metadata.json", "start": 1048842499, "end": 1048843285}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/screenshot/screenshot-x150.png", "start": 1048843285, "end": 1048852465}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureCoordinateTest/screenshot/screenshot.png", "start": 1048852465, "end": 1048863943}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/LICENSE.md", "start": 1048863943, "end": 1048864624}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/README.body.md", "start": 1048864624, "end": 1048865762}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/README.md", "start": 1048865762, "end": 1048867710}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF-Binary/TextureEncodingTest.glb", "start": 1048867710, "end": 1048894546}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/0_136_0.png", "start": 1048894546, "end": 1048894615}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/0_136_0_gamma.png", "start": 1048894615, "end": 1048894744}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/0_136_0_icc.png", "start": 1048894744, "end": 1048895215}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/0_136_255.png", "start": 1048895215, "end": 1048895284}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/0_136_255_gamma.png", "start": 1048895284, "end": 1048895413}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/0_136_255_icc.png", "start": 1048895413, "end": 1048895884}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/Plane.bin", "start": 1048895884, "end": 1048895976}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/SlotLabels.png", "start": 1048895976, "end": 1048902524}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/Sphere.bin", "start": 1048902524, "end": 1048911004}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/TestLabels.png", "start": 1048911004, "end": 1048916215}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/glTF/TextureEncodingTest.gltf", "start": 1048916215, "end": 1048931578}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/metadata.json", "start": 1048931578, "end": 1048932358}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/screenshot/non-ignored_metadata.png", "start": 1048932358, "end": 1049009969}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/screenshot/screenshot-x150.png", "start": 1049009969, "end": 1049025990}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureEncodingTest/screenshot/screenshot.png", "start": 1049025990, "end": 1049221657}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/LICENSE.md", "start": 1049221657, "end": 1049222350}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/README.body.md", "start": 1049222350, "end": 1049223368}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/README.md", "start": 1049223368, "end": 1049225273}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/glTF-Binary/TextureLinearInterpolationTest.glb", "start": 1049225273, "end": 1049238741}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/glTF/0_0_0-0_255_0.png", "start": 1049238741, "end": 1049238813}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/glTF/Plane.bin", "start": 1049238813, "end": 1049238905}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/glTF/Sphere.bin", "start": 1049238905, "end": 1049247385}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/glTF/TestLabels.png", "start": 1049247385, "end": 1049250102}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/glTF/TextureLinearInterpolationTest.gltf", "start": 1049250102, "end": 1049256005}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/metadata.json", "start": 1049256005, "end": 1049256829}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/screenshot/incorrect.png", "start": 1049256829, "end": 1049275346}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/screenshot/screenshot-x150.png", "start": 1049275346, "end": 1049284543}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureLinearInterpolationTest/screenshot/screenshot.png", "start": 1049284543, "end": 1049315949}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/LICENSE.md", "start": 1049315949, "end": 1049316632}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/README.body.md", "start": 1049316632, "end": 1049318475}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/README.md", "start": 1049318475, "end": 1049321124}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF-Binary/TextureSettingsTest.glb", "start": 1049321124, "end": 1049363964}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF-Embedded/TextureSettingsTest.gltf", "start": 1049363964, "end": 1049434491}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF/CheckAndX.png", "start": 1049434491, "end": 1049444266}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF/CheckAndX_V.png", "start": 1049444266, "end": 1049454144}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF/TextureSettingsTest.gltf", "start": 1049454144, "end": 1049481959}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF/TextureSettingsTest0.bin", "start": 1049481959, "end": 1049486935}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/glTF/TextureTestLabels.png", "start": 1049486935, "end": 1049494311}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/metadata.json", "start": 1049494311, "end": 1049495093}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/screenshot/screenshot-x150.png", "start": 1049495093, "end": 1049514416}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureSettingsTest/screenshot/screenshot.png", "start": 1049514416, "end": 1049549529}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/LICENSE.md", "start": 1049549529, "end": 1049550219}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/README.body.md", "start": 1049550219, "end": 1049554476}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/README.md", "start": 1049554476, "end": 1049559777}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF-Binary/TextureTransformMultiTest.glb", "start": 1049559777, "end": 1049948041}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF/TTMT_Labels.png", "start": 1049948041, "end": 1049970527}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF/TestMap-1.png", "start": 1049970527, "end": 1050001787}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF/TestMap.png", "start": 1050001787, "end": 1050027578}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF/TestMap_Normal.png", "start": 1050027578, "end": 1050227092}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF/TextureTransformMultiTest.bin", "start": 1050227092, "end": 1050314752}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/glTF/TextureTransformMultiTest.gltf", "start": 1050314752, "end": 1050356639}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/metadata.json", "start": 1050356639, "end": 1050357462}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/sample_clearcoat.jpg", "start": 1050357462, "end": 1050431350}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/sample_notNormal.jpg", "start": 1050431350, "end": 1050513697}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/sample_occlusion.jpg", "start": 1050513697, "end": 1050596297}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/sample_wrongMath.jpg", "start": 1050596297, "end": 1050630669}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/screenshot-x150.jpg", "start": 1050630669, "end": 1050648781}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/screenshot.jpg", "start": 1050648781, "end": 1050691423}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformMultiTest/screenshot/screenshot_large.jpg", "start": 1050691423, "end": 1050856293}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/LICENSE.md", "start": 1050856293, "end": 1050856975}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/README.body.md", "start": 1050856975, "end": 1050858550}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/README.md", "start": 1050858550, "end": 1050860834}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/Arrow.png", "start": 1050860834, "end": 1050861701}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/Correct.png", "start": 1050861701, "end": 1050864158}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/Error.png", "start": 1050864158, "end": 1050866431}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/NotSupported.png", "start": 1050866431, "end": 1050869722}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/TextureTransformTest.bin", "start": 1050869722, "end": 1050869858}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/TextureTransformTest.gltf", "start": 1050869858, "end": 1050879576}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/glTF/UV.png", "start": 1050879576, "end": 1050891921}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/metadata.json", "start": 1050891921, "end": 1050892706}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/screenshot/screenshot-x150.jpg", "start": 1050892706, "end": 1050900631}, {"filename": "/resources/glTF-Sample-Assets/Models/TextureTransformTest/screenshot/screenshot.jpg", "start": 1050900631, "end": 1050918534}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/LICENSE.md", "start": 1050918534, "end": 1050919328}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/README.body.md", "start": 1050919328, "end": 1050920227}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/README.md", "start": 1050920227, "end": 1050922197}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb", "start": 1050922197, "end": 1056727917}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/Fabric_baseColor.png", "start": 1056727917, "end": 1057202669}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/Fabric_normal.png", "start": 1057202669, "end": 1057529369}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/Fabric_occlusion.png", "start": 1057529369, "end": 1057826908}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar.bin", "start": 1057826908, "end": 1061491276}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar.gltf", "start": 1061491276, "end": 1061509614}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar_basecolor.png", "start": 1061509614, "end": 1061780197}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar_clearcoat.png", "start": 1061780197, "end": 1061809485}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar_emissive.png", "start": 1061809485, "end": 1061912318}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar_normal.png", "start": 1061912318, "end": 1062026089}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/glTF/ToyCar_occlusion_roughness_metallic.png", "start": 1062026089, "end": 1062544335}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/metadata.json", "start": 1062544335, "end": 1062545551}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/screenshot/screenshot-x150.jpg", "start": 1062545551, "end": 1062556614}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/screenshot/screenshot.jpg", "start": 1062556614, "end": 1062582487}, {"filename": "/resources/glTF-Sample-Assets/Models/ToyCar/screenshot/screenshot_large.jpg", "start": 1062582487, "end": 1063254402}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/LICENSE.md", "start": 1063254402, "end": 1063255091}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/README.body.md", "start": 1063255091, "end": 1063260200}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/README.md", "start": 1063260200, "end": 1063266248}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF-Binary/TransmissionRoughnessTest.glb", "start": 1063266248, "end": 1063660056}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/GridWithDetails.png", "start": 1063660056, "end": 1063687669}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/IOR_Labels.png", "start": 1063687669, "end": 1063708869}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/RoughnessGrid-1.png", "start": 1063708869, "end": 1063709159}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/RoughnessGrid.png", "start": 1063709159, "end": 1063709343}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/SmoothVsRough.png", "start": 1063709343, "end": 1063714628}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/TransmissionRoughnessTest.bin", "start": 1063714628, "end": 1064046340}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/glTF/TransmissionRoughnessTest.gltf", "start": 1064046340, "end": 1064065158}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/metadata.json", "start": 1064065158, "end": 1064065951}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/screenshot/left-column-detail.jpg", "start": 1064065951, "end": 1064529756}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/screenshot/screenshot-large.png", "start": 1064529756, "end": 1065447708}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/screenshot/screenshot-x150.jpg", "start": 1065447708, "end": 1065455576}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionRoughnessTest/screenshot/screenshot.jpg", "start": 1065455576, "end": 1065492173}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/LICENSE.md", "start": 1065492173, "end": 1065492850}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/README.body.md", "start": 1065492850, "end": 1065493219}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/README.md", "start": 1065493219, "end": 1065494448}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF-Binary/TransmissionTest.glb", "start": 1065494448, "end": 1067192340}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest.gltf", "start": 1067192340, "end": 1067236989}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_binary.bin", "start": 1067236989, "end": 1068678145}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture10487.png", "start": 1068678145, "end": 1068682560}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture14184.jpg", "start": 1068682560, "end": 1068703679}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture15366.jpg", "start": 1068703679, "end": 1068725406}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture175763.png", "start": 1068725406, "end": 1068729903}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture177328.png", "start": 1068729903, "end": 1068734437}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture214190.png", "start": 1068734437, "end": 1068738210}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture28577.jpg", "start": 1068738210, "end": 1068905862}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture4086.png", "start": 1068905862, "end": 1068910771}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/glTF/TransmissionTest_images/texture6807.png", "start": 1068910771, "end": 1068916401}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/metadata.json", "start": 1068916401, "end": 1068917170}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/screenshot/screenshot-x150.jpg", "start": 1068917170, "end": 1068945713}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/screenshot/screenshot.jpg", "start": 1068945713, "end": 1069006035}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionTest/screenshot/screenshot_large.png", "start": 1069006035, "end": 1071530661}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/LICENSE.md", "start": 1071530661, "end": 1071531349}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/README.body.md", "start": 1071531349, "end": 1071532264}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/README.md", "start": 1071532264, "end": 1071534147}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/glTF-Binary/TransmissionThinwallTestGrid.glb", "start": 1071534147, "end": 1072722871}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/glTF/TransmissionThinwallTestGrid.bin", "start": 1072722871, "end": 1073897407}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/glTF/TransmissionThinwallTestGrid.gltf", "start": 1073897407, "end": 1073924039}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/glTF/checker.png", "start": 1073924039, "end": 1073924866}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/metadata.json", "start": 1073924866, "end": 1073925672}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/screenshot/screenshot.jpg", "start": 1073925672, "end": 1073928163}, {"filename": "/resources/glTF-Sample-Assets/Models/TransmissionThinwallTestGrid/screenshot/screenshot_Large.jpg", "start": 1073928163, "end": 1074120932}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/LICENSE.md", "start": 1074120932, "end": 1074121600}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/README.body.md", "start": 1074121600, "end": 1074122055}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/README.md", "start": 1074122055, "end": 1074123266}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/glTF-Embedded/Triangle.gltf", "start": 1074123266, "end": 1074124458}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/glTF/Triangle.gltf", "start": 1074124458, "end": 1074125571}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/glTF/simpleTriangle.bin", "start": 1074125571, "end": 1074125615}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/metadata.json", "start": 1074125615, "end": 1074126497}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/screenshot/screenshot-x150.png", "start": 1074126497, "end": 1074127892}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/screenshot/screenshot.png", "start": 1074127892, "end": 1074128728}, {"filename": "/resources/glTF-Sample-Assets/Models/Triangle/screenshot/simpleTriangle.png", "start": 1074128728, "end": 1074172586}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/LICENSE.md", "start": 1074172586, "end": 1074173270}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/README.body.md", "start": 1074173270, "end": 1074173784}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/README.md", "start": 1074173784, "end": 1074175112}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/glTF-Embedded/TriangleWithoutIndices.gltf", "start": 1074175112, "end": 1074175969}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/glTF/TriangleWithoutIndices.gltf", "start": 1074175969, "end": 1074176771}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/glTF/triangleWithoutIndices.bin", "start": 1074176771, "end": 1074176807}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/metadata.json", "start": 1074176807, "end": 1074177749}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/screenshot/screenshot-x150.png", "start": 1074177749, "end": 1074179144}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/screenshot/screenshot.png", "start": 1074179144, "end": 1074179980}, {"filename": "/resources/glTF-Sample-Assets/Models/TriangleWithoutIndices/screenshot/triangleWithoutIndices.png", "start": 1074179980, "end": 1074205329}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/LICENSE.md", "start": 1074205329, "end": 1074206004}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/README.md", "start": 1074206004, "end": 1074206676}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/glTF/TwoSidedPlane.bin", "start": 1074206676, "end": 1074206976}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/glTF/TwoSidedPlane.gltf", "start": 1074206976, "end": 1074211107}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/glTF/TwoSidedPlane_BaseColor.png", "start": 1074211107, "end": 1074294104}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/glTF/TwoSidedPlane_MetallicRoughness.png", "start": 1074294104, "end": 1074315758}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/glTF/TwoSidedPlane_Normal.png", "start": 1074315758, "end": 1074367208}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/metadata.json", "start": 1074367208, "end": 1074367938}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/screenshot/screenshot-x150.jpg", "start": 1074367938, "end": 1074374342}, {"filename": "/resources/glTF-Sample-Assets/Models/TwoSidedPlane/screenshot/screenshot.jpg", "start": 1074374342, "end": 1074382992}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/LICENSE.md", "start": 1074382992, "end": 1074383669}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/README.body.md", "start": 1074383669, "end": 1074383909}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/README.md", "start": 1074383909, "end": 1074384941}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/glTF-Binary/Unicode\u2764\u267bTest.glb", "start": 1074384941, "end": 1074393029}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/glTF/Unicode\u2764\u267bBinary.bin", "start": 1074393029, "end": 1074393181}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/glTF/Unicode\u2764\u267bTest.gltf", "start": 1074393181, "end": 1074396022}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/glTF/Unicode\u2764\u267bTexture.png", "start": 1074396022, "end": 1074402776}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/metadata.json", "start": 1074402776, "end": 1074403560}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/screenshot/screenshot-x150.png", "start": 1074403560, "end": 1074414287}, {"filename": "/resources/glTF-Sample-Assets/Models/Unicode\u2764\u267bTest/screenshot/screenshot.png", "start": 1074414287, "end": 1074432592}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/LICENSE.md", "start": 1074432592, "end": 1074433264}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/README.body.md", "start": 1074433264, "end": 1074435439}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/README.md", "start": 1074435439, "end": 1074438508}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/glTF-Binary/UnlitTest.glb", "start": 1074438508, "end": 1074442500}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/glTF/UnlitTest.bin", "start": 1074442500, "end": 1074445068}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/glTF/UnlitTest.gltf", "start": 1074445068, "end": 1074448718}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/metadata.json", "start": 1074448718, "end": 1074449495}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/screenshot/screenshot-x150.png", "start": 1074449495, "end": 1074453044}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/screenshot/screenshot.png", "start": 1074453044, "end": 1074454294}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/screenshot/screenshot_large.jpg", "start": 1074454294, "end": 1074469489}, {"filename": "/resources/glTF-Sample-Assets/Models/UnlitTest/screenshot/unlit_test_fail.jpg", "start": 1074469489, "end": 1074491475}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/LICENSE.md", "start": 1074491475, "end": 1074492154}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/README.body.md", "start": 1074492154, "end": 1074493475}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/README.md", "start": 1074493475, "end": 1074495565}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/glTF-Binary/VertexColorTest.glb", "start": 1074495565, "end": 1074521785}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/glTF-Embedded/VertexColorTest.gltf", "start": 1074521785, "end": 1074561047}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/glTF/VertexColorChecks.png", "start": 1074561047, "end": 1074569705}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/glTF/VertexColorTest.bin", "start": 1074569705, "end": 1074574037}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/glTF/VertexColorTest.gltf", "start": 1074574037, "end": 1074583063}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/glTF/VertexColorTestLabels.png", "start": 1074583063, "end": 1074592737}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/metadata.json", "start": 1074592737, "end": 1074593494}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/screenshot/screenshot-x150.png", "start": 1074593494, "end": 1074605604}, {"filename": "/resources/glTF-Sample-Assets/Models/VertexColorTest/screenshot/screenshot.png", "start": 1074605604, "end": 1074625961}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/LICENSE.md", "start": 1074625961, "end": 1074626618}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/README.md", "start": 1074626618, "end": 1074627440}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Binary/VirtualCity.glb", "start": 1074627440, "end": 1077712856}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/001.jpg", "start": 1077712856, "end": 1077773823}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/002.jpg", "start": 1077773823, "end": 1077811265}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/11.jpg", "start": 1077811265, "end": 1077843788}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/5.jpg", "start": 1077843788, "end": 1077875004}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/O21.jpg", "start": 1077875004, "end": 1077910917}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/VC0.bin", "start": 1077910917, "end": 1079303121}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/VirtualCity.gltf", "start": 1079303121, "end": 1079822321}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/cockpit-map.jpg", "start": 1079822321, "end": 1079886313}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/f22.jpg", "start": 1079886313, "end": 1080029694}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/heli.jpg", "start": 1080029694, "end": 1080235750}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/machine.jpg", "start": 1080235750, "end": 1080293309}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/prop128.png", "start": 1080293309, "end": 1080297522}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_01.jpg", "start": 1080297522, "end": 1080317575}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_02.jpg", "start": 1080317575, "end": 1080337898}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_03.jpg", "start": 1080337898, "end": 1080358080}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_04.jpg", "start": 1080358080, "end": 1080375078}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_05.jpg", "start": 1080375078, "end": 1080397977}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_06.jpg", "start": 1080397977, "end": 1080419242}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_07.jpg", "start": 1080419242, "end": 1080440725}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/s_08.jpg", "start": 1080440725, "end": 1080459675}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/scrapsurf03-red.jpg", "start": 1080459675, "end": 1080483701}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Draco/surface01.jpg", "start": 1080483701, "end": 1080505932}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF-Embedded/VirtualCity.gltf", "start": 1080505932, "end": 1084919068}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/001.jpg", "start": 1084919068, "end": 1084980035}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/002.jpg", "start": 1084980035, "end": 1085017477}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/11.jpg", "start": 1085017477, "end": 1085050000}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/5.jpg", "start": 1085050000, "end": 1085081216}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/O21.jpg", "start": 1085081216, "end": 1085117129}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/VC0.bin", "start": 1085117129, "end": 1087084355}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/VirtualCity.gltf", "start": 1087084355, "end": 1087698618}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/cockpit-map.jpg", "start": 1087698618, "end": 1087762610}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/f22.jpg", "start": 1087762610, "end": 1087905991}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/heli.jpg", "start": 1087905991, "end": 1088112047}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/machine.jpg", "start": 1088112047, "end": 1088169606}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/prop128.png", "start": 1088169606, "end": 1088173819}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_01.jpg", "start": 1088173819, "end": 1088193872}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_02.jpg", "start": 1088193872, "end": 1088214195}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_03.jpg", "start": 1088214195, "end": 1088234377}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_04.jpg", "start": 1088234377, "end": 1088251375}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_05.jpg", "start": 1088251375, "end": 1088274274}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_06.jpg", "start": 1088274274, "end": 1088295539}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_07.jpg", "start": 1088295539, "end": 1088317022}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/s_08.jpg", "start": 1088317022, "end": 1088335972}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/scrapsurf03-red.jpg", "start": 1088335972, "end": 1088359998}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/glTF/surface01.jpg", "start": 1088359998, "end": 1088382229}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/metadata.json", "start": 1088382229, "end": 1088382937}, {"filename": "/resources/glTF-Sample-Assets/Models/VirtualCity/screenshot/screenshot.gif", "start": 1088382937, "end": 1088878031}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/LICENSE.md", "start": 1088878031, "end": 1088878703}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/README.body.md", "start": 1088878703, "end": 1088878843}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/README.md", "start": 1088878843, "end": 1088879746}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Binary/WaterBottle.glb", "start": 1088879746, "end": 1097846446}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Draco/WaterBottle.bin", "start": 1097846446, "end": 1097896026}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Draco/WaterBottle.gltf", "start": 1097896026, "end": 1097899640}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Draco/WaterBottle_baseColor.png", "start": 1097899640, "end": 1100065490}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Draco/WaterBottle_emissive.png", "start": 1100065490, "end": 1100124592}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Draco/WaterBottle_normal.png", "start": 1100124592, "end": 1103137325}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF-Draco/WaterBottle_occlusionRoughnessMetallic.png", "start": 1103137325, "end": 1106715157}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF/WaterBottle.bin", "start": 1106715157, "end": 1106864569}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF/WaterBottle.gltf", "start": 1106864569, "end": 1106867467}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF/WaterBottle_baseColor.png", "start": 1106867467, "end": 1109033317}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF/WaterBottle_emissive.png", "start": 1109033317, "end": 1109092419}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF/WaterBottle_normal.png", "start": 1109092419, "end": 1112105152}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/glTF/WaterBottle_occlusionRoughnessMetallic.png", "start": 1112105152, "end": 1115682984}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/metadata.json", "start": 1115682984, "end": 1115683725}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/screenshot/screenshot-x150.jpg", "start": 1115683725, "end": 1115687557}, {"filename": "/resources/glTF-Sample-Assets/Models/WaterBottle/screenshot/screenshot.jpg", "start": 1115687557, "end": 1115691114}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/LICENSE.md", "start": 1115691114, "end": 1115691801}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/README.body.md", "start": 1115691801, "end": 1115693744}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/README.md", "start": 1115693744, "end": 1115696549}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/glTF-Binary/XmpMetadataRoundedCube.glb", "start": 1115696549, "end": 1115802485}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/glTF/MODEL_ROUNDED_CUBE_PART_1/indices.bin", "start": 1115802485, "end": 1115823173}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/glTF/MODEL_ROUNDED_CUBE_PART_1/normals.bin", "start": 1115823173, "end": 1115864645}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/glTF/MODEL_ROUNDED_CUBE_PART_1/positions.bin", "start": 1115864645, "end": 1115906117}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/glTF/XmpMetadataRoundedCube.gltf", "start": 1115906117, "end": 1115910273}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/metadata.json", "start": 1115910273, "end": 1115911068}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/screenshot/screenshot-1520x955.jpg", "start": 1115911068, "end": 1115954785}, {"filename": "/resources/glTF-Sample-Assets/Models/XmpMetadataRoundedCube/screenshot/screenshot.jpg", "start": 1115954785, "end": 1115960669}, {"filename": "/resources/glTF-Sample-Assets/Models/glTF_RGB_June16.svg", "start": 1115960669, "end": 1115964220}, {"filename": "/resources/glTF-Sample-Assets/Models/model-index.Khronos.json", "start": 1115964220, "end": 1115995579}, {"filename": "/resources/glTF-Sample-Assets/Models/model-index.json", "start": 1115995579, "end": 1116033625}, {"filename": "/resources/glTF-Sample-Assets/README.md", "start": 1116033625, "end": 1116039644}, {"filename": "/resources/glTF-Sample-Assets/SubmittingModels.md", "start": 1116039644, "end": 1116050306}, {"filename": "/resources/glTF-Sample-Assets/util/CreateJson.html", "start": 1116050306, "end": 1116060983}, {"filename": "/resources/glTF-Sample-Assets/util/ReleaseNotes.txt", "start": 1116060983, "end": 1116061124}, {"filename": "/resources/glTF-Sample-Assets/util/model.php", "start": 1116061124, "end": 1116085609}, {"filename": "/resources/glTF-Sample-Assets/util/modelmetadata.php", "start": 1116085609, "end": 1116119402}, {"filename": "/resources/glTF-Sample-Assets/util/run.bash", "start": 1116119402, "end": 1116120626}, {"filename": "/resources/images/all_probes/LICENSE", "start": 1116120626, "end": 1116120727}, {"filename": "/resources/images/all_probes/stpeters_cross.png", "start": 1116120727, "end": 1117092815}, {"filename": "/resources/images/all_probes/stpeters_cross/stpeters_back.png", "start": 1117092815, "end": 1117189857}, {"filename": "/resources/images/all_probes/stpeters_cross/stpeters_bottom.png", "start": 1117189857, "end": 1117272946}, {"filename": "/resources/images/all_probes/stpeters_cross/stpeters_front.png", "start": 1117272946, "end": 1117373234}, {"filename": "/resources/images/all_probes/stpeters_cross/stpeters_left.png", "start": 1117373234, "end": 1117467024}, {"filename": "/resources/images/all_probes/stpeters_cross/stpeters_right.png", "start": 1117467024, "end": 1117561281}, {"filename": "/resources/images/all_probes/stpeters_cross/stpeters_top.png", "start": 1117561281, "end": 1117671893}, {"filename": "/resources/shaders/glsl330/modelShader.fs", "start": 1117671893, "end": 1117673731}, {"filename": "/resources/shaders/glsl330/modelShader.vs", "start": 1117673731, "end": 1117677648}, {"filename": "/resources/shaders/glsl330/skyboxShader.fs", "start": 1117677648, "end": 1117677916}, {"filename": "/resources/shaders/glsl330/skyboxShader.vs", "start": 1117677916, "end": 1117678397}, {"filename": "/resources/sphere.bin", "start": 1117678397, "end": 1117686557}, {"filename": "/resources/sphere.fbx", "start": 1117686557, "end": 1140043481}, {"filename": "/resources/sphere.gltf", "start": 1140043481, "end": 1140044828}, {"filename": "/resources/sphere.mtl", "start": 1140044828, "end": 1140044883}, {"filename": "/resources/sphere.obj", "start": 1140044883, "end": 1149297137}], "remote_package_size": 1149297137});

  })();

// end include: C:\Users\jcarl\AppData\Local\Temp\tmpzdl8xg3g.js
// include: C:\Users\jcarl\AppData\Local\Temp\tmp08fewfc5.js

    // All the pre-js content up to here must remain later on, we need to run
    // it.
    if (Module['$ww'] || (typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD)) Module['preRun'] = [];
    var necessaryPreJSTasks = Module['preRun'].slice();
  // end include: C:\Users\jcarl\AppData\Local\Temp\tmp08fewfc5.js
// include: C:\Users\jcarl\AppData\Local\Temp\tmpqdkquq96.js

    if (!Module['preRun']) throw 'Module.preRun should exist because file support used it; did a pre-js delete it?';
    necessaryPreJSTasks.forEach((task) => {
      if (Module['preRun'].indexOf(task) < 0) throw 'All preRun tasks that exist before user pre-js code should remain after; did you replace Module or modify Module.preRun?';
    });
  // end include: C:\Users\jcarl\AppData\Local\Temp\tmpqdkquq96.js


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// In MODULARIZE mode _scriptName needs to be captured already at the very top of the page immediately when the page is parsed, so it is generated there
// before the page load. In non-MODULARIZE modes generate it here.
var _scriptName = (typeof document != 'undefined') ? document.currentScript?.src : undefined;

if (ENVIRONMENT_IS_NODE) {
  _scriptName = __filename;
} else
if (ENVIRONMENT_IS_WORKER) {
  _scriptName = self.location.href;
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
  if (typeof process == 'undefined' || !process.release || process.release.name !== 'node') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  var nodeVersion = process.versions.node;
  var numericVersion = nodeVersion.split('.').slice(0, 3);
  numericVersion = (numericVersion[0] * 10000) + (numericVersion[1] * 100) + (numericVersion[2].split('-')[0] * 1);
  var minVersion = 160000;
  if (numericVersion < 160000) {
    throw new Error('This emscripten-generated code requires node v16.0.0 (detected v' + nodeVersion + ')');
  }

  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require('fs');
  var nodePath = require('path');

  scriptDirectory = __dirname + '/';

// include: node_shell_read.js
readBinary = (filename) => {
  // We need to re-wrap `file://` strings to URLs. Normalizing isn't
  // necessary in that case, the path should already be absolute.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  var ret = fs.readFileSync(filename);
  assert(ret.buffer);
  return ret;
};

readAsync = (filename, binary = true) => {
  // See the comment in the `readBinary` function.
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return new Promise((resolve, reject) => {
    fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(binary ? data.buffer : data);
    });
  });
};
// end include: node_shell_read.js
  if (!Module['thisProgram'] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }

  arguments_ = process.argv.slice(2);

  if (typeof module != 'undefined') {
    module['exports'] = Module;
  }

  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };

} else
if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof WorkerGlobalScope != 'undefined') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.startsWith('blob:')) {
    scriptDirectory = '';
  } else {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/')+1);
  }

  if (!(typeof window == 'object' || typeof WorkerGlobalScope != 'undefined')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  if (!ENVIRONMENT_IS_NODE)
  {
// include: web_or_worker_shell_read.js
if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url) => {
    // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
    // See https://github.com/github/fetch/pull/92#issuecomment-140665932
    // Cordova or Electron apps are typically loaded from a file:// url.
    // So use XHR on webview if URL is a file URL.
    if (isFileURI(url)) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            resolve(xhr.response);
            return;
          }
          reject(xhr.status);
        };
        xhr.onerror = reject;
        xhr.send(null);
      });
    }
    return fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (response.ok) {
          return response.arrayBuffer();
        }
        return Promise.reject(new Error(response.status + ' : ' + response.url));
      })
  };
// end include: web_or_worker_shell_read.js
  }
} else
{
  throw new Error('environment detection error');
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// Normally just binding console.log/console.error here works fine, but
// under node (with workers) we see missing/out-of-order messages so route
// directly to stdout and stderr.
// See https://github.com/emscripten-core/emscripten/issues/14804
var defaultPrint = console.log.bind(console);
var defaultPrintErr = console.error.bind(console);
if (ENVIRONMENT_IS_NODE) {
  defaultPrint = (...args) => fs.writeSync(1, args.join(' ') + '\n');
  defaultPrintErr = (...args) => fs.writeSync(2, args.join(' ') + '\n');
}
var out = Module['print'] || defaultPrint;
var err = Module['printErr'] || defaultPrintErr;

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('asm', 'wasmExports');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(
  ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, 'Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)');

assert(!ENVIRONMENT_IS_SHELL, 'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.');

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');

if (typeof WebAssembly != 'object') {
  err('no native wasm support detected');
}

// include: base64Utils.js
// Converts a string of base64 into a byte array (Uint8Array).
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE != 'undefined' && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  }

  var decoded = atob(s);
  var bytes = new Uint8Array(decoded.length);
  for (var i = 0 ; i < decoded.length ; ++i) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
// end include: base64Utils.js
// Wasm globals

var wasmMemory;

// For sending to workers.
var wasmModule;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

// include: runtime_shared.js
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

// end include: runtime_shared.js
// include: runtime_pthread.js
// Pthread Web Worker handling code.
// This code runs only on pthread web workers and handles pthread setup
// and communication with the main thread via postMessage.

// Unique ID of the current pthread worker (zero on non-pthread-workers
// including the main thread).
var workerID = 0;

if (ENVIRONMENT_IS_PTHREAD) {
  var wasmPromiseResolve;
  var wasmPromiseReject;
  var receivedWasmModule;

  // Node.js support
  if (ENVIRONMENT_IS_NODE) {
    // Create as web-worker-like an environment as we can.

    var parentPort = worker_threads['parentPort'];
    parentPort.on('message', (msg) => onmessage({ data: msg }));

    Object.assign(globalThis, {
      self: global,
      postMessage: (msg) => parentPort.postMessage(msg),
    });
  }

  // Thread-local guard variable for one-time init of the JS state
  var initializedJS = false;

  function threadPrintErr(...args) {
    var text = args.join(' ');
    // See https://github.com/emscripten-core/emscripten/issues/14804
    if (ENVIRONMENT_IS_NODE) {
      fs.writeSync(2, text + '\n');
      return;
    }
    console.error(text);
  }

  if (!Module['printErr'])
    err = threadPrintErr;
  dbg = threadPrintErr;
  function threadAlert(...args) {
    var text = args.join(' ');
    postMessage({cmd: 'alert', text, threadId: _pthread_self()});
  }
  self.alert = threadAlert;

  Module['instantiateWasm'] = (info, receiveInstance) => {
    return new Promise((resolve, reject) => {
      wasmPromiseResolve = (module) => {
        // Instantiate from the module posted from the main thread.
        // We can just use sync instantiation in the worker.
        var instance = new WebAssembly.Instance(module, getWasmImports());
        // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193,
        // the above line no longer optimizes out down to the following line.
        // When the regression is fixed, we can remove this if/else.
        receiveInstance(instance);
        resolve();
      };
      wasmPromiseReject = reject;
    });
  }

  // Turn unhandled rejected promises into errors so that the main thread will be
  // notified about them.
  self.onunhandledrejection = (e) => { throw e.reason || e; };

  function handleMessage(e) {
    try {
      var msgData = e['data'];
      //dbg('msgData: ' + Object.keys(msgData));
      var cmd = msgData.cmd;
      if (cmd === 'load') { // Preload command that is called once per worker to parse and load the Emscripten code.
        workerID = msgData.workerID;

        // Until we initialize the runtime, queue up any further incoming messages.
        let messageQueue = [];
        self.onmessage = (e) => messageQueue.push(e);

        // And add a callback for when the runtime is initialized.
        self.startWorker = (instance) => {
          // Notify the main thread that this thread has loaded.
          postMessage({ cmd: 'loaded' });
          // Process any messages that were queued before the thread was ready.
          for (let msg of messageQueue) {
            handleMessage(msg);
          }
          // Restore the real message handler.
          self.onmessage = handleMessage;
        };

        // Use `const` here to ensure that the variable is scoped only to
        // that iteration, allowing safe reference from a closure.
        for (const handler of msgData.handlers) {
          // The the main module has a handler for a certain even, but no
          // handler exists on the pthread worker, then proxy that handler
          // back to the main thread.
          if (!Module[handler] || Module[handler].proxy) {
            Module[handler] = (...args) => {
              postMessage({ cmd: 'callHandler', handler, args: args });
            }
            // Rebind the out / err handlers if needed
            if (handler == 'print') out = Module[handler];
            if (handler == 'printErr') err = Module[handler];
          }
        }

        wasmMemory = msgData.wasmMemory;
        updateMemoryViews();

        wasmPromiseResolve(msgData.wasmModule);
      } else if (cmd === 'run') {
        assert(msgData.pthread_ptr);
        // Call inside JS module to set up the stack frame for this pthread in JS module scope.
        // This needs to be the first thing that we do, as we cannot call to any C/C++ functions
        // until the thread stack is initialized.
        establishStackSpace(msgData.pthread_ptr);

        // Pass the thread address to wasm to store it for fast access.
        __emscripten_thread_init(msgData.pthread_ptr, /*is_main=*/0, /*is_runtime=*/0, /*can_block=*/1, 0, 0);

        PThread.receiveObjectTransfer(msgData);
        PThread.threadInitTLS();

        // Await mailbox notifications with `Atomics.waitAsync` so we can start
        // using the fast `Atomics.notify` notification path.
        __emscripten_thread_mailbox_await(msgData.pthread_ptr);

        if (!initializedJS) {
          initializedJS = true;
        }

        try {
          invokeEntryPoint(msgData.start_routine, msgData.arg);
        } catch(ex) {
          if (ex != 'unwind') {
            // The pthread "crashed".  Do not call `_emscripten_thread_exit` (which
            // would make this thread joinable).  Instead, re-throw the exception
            // and let the top level handler propagate it back to the main thread.
            throw ex;
          }
        }
      } else if (msgData.target === 'setimmediate') {
        // no-op
      } else if (cmd === 'checkMailbox') {
        if (initializedJS) {
          checkMailbox();
        }
      } else if (cmd) {
        // The received message looks like something that should be handled by this message
        // handler, (since there is a cmd field present), but is not one of the
        // recognized commands:
        err(`worker: received unknown command ${cmd}`);
        err(msgData);
      }
    } catch(ex) {
      err(`worker: onmessage() captured an uncaught exception: ${ex}`);
      if (ex?.stack) err(ex.stack);
      __emscripten_thread_crashed();
      throw ex;
    }
  };

  self.onmessage = handleMessage;

} // ENVIRONMENT_IS_PTHREAD
// end include: runtime_pthread.js
assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')

assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js
// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)

if (!ENVIRONMENT_IS_PTHREAD) {

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 67108864;legacyModuleProp('INITIAL_MEMORY', 'INITIAL_MEMORY');

    assert(INITIAL_MEMORY >= 65536, 'INITIAL_MEMORY should be larger than STACK_SIZE, was ' + INITIAL_MEMORY + '! (STACK_SIZE=' + 65536 + ')');
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536,
      'shared': true,
    });
  }

  updateMemoryViews();
}

// end include: runtime_init_memory.js

// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x02135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[((0)>>2)] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[((0)>>2)] != 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}
// end include: runtime_stack_check.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function preRun() {
  assert(!ENVIRONMENT_IS_PTHREAD); // PThreads reuse the runtime from the main thread.
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  if (ENVIRONMENT_IS_PTHREAD) return;

  checkStackCookie();

  
if (!Module['noFSInit'] && !FS.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  if (ENVIRONMENT_IS_PTHREAD) return; // PThreads reuse the runtime from the main thread.
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  checkStackCookie();
  if (ENVIRONMENT_IS_PTHREAD) return; // PThreads reuse the runtime from the main thread.

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  Module['onAbort']?.(what);

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;

  if (what.indexOf('RuntimeError: unreachable') >= 0) {
    what += '. "unreachable" may be due to ASYNCIFY_STACK_SIZE not being large enough (try increasing it)';
  }

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
function createExportWrapper(name, nargs) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
    assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
    return f(...args);
  };
}

// include: runtime_exceptions.js
// end include: runtime_exceptions.js
function findWasmBinary() {
    var f = 'flowers_oop2.nim.wasm';
    if (!isDataURI(f)) {
      return locateFile(f);
    }
    return f;
}

var wasmBinaryFile;

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}

function getBinaryPromise(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary
      ) {
    // Fetch the binary using readAsync
    return readAsync(binaryFile).then(
      (response) => new Uint8Array(/** @type{!ArrayBuffer} */(response)),
      // Fall back to getBinarySync if readAsync fails
      () => getBinarySync(binaryFile)
    );
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then(receiver, (reason) => {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    // Warn on some common problems.
    if (isFileURI(wasmBinaryFile)) {
      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  if (!binary &&
      typeof WebAssembly.instantiateStreaming == 'function' &&
      !isDataURI(binaryFile) &&
      // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
      !isFileURI(binaryFile) &&
      // Avoid instantiateStreaming() on Node.js environment for now, as while
      // Node.js v18.1.0 implements it, it does not have a full fetch()
      // implementation yet.
      //
      // Reference:
      //   https://github.com/emscripten-core/emscripten/pull/16917
      !ENVIRONMENT_IS_NODE &&
      typeof fetch == 'function') {
    return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
      // Suppress closure warning here since the upstream definition for
      // instantiateStreaming only allows Promise<Repsponse> rather than
      // an actual Response.
      // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
      /** @suppress {checkTypes} */
      var result = WebAssembly.instantiateStreaming(response, imports);

      return result.then(
        callback,
        function(reason) {
          // We expect the most common failure cause to be a bad MIME type for the binary,
          // in which case falling back to ArrayBuffer instantiation should work.
          err(`wasm streaming compile failed: ${reason}`);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
    });
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

function getWasmImports() {
  assignWasmImports();
  // instrumenting imports is used in asyncify in two ways: to add assertions
  // that check for proper import use, and for ASYNCIFY=2 we use them to set up
  // the Promise API on the import side.
  // In pthreads builds getWasmImports is called more than once but we only
  // and the instrument the imports once.
  if (!wasmImports.__instrumented) {
    wasmImports.__instrumented = true;
    Asyncify.instrumentWasmImports(wasmImports);
  }
  // prepare imports
  return {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  }
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  var info = getWasmImports();
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    wasmExports = Asyncify.instrumentWasmExports(wasmExports);

    

    registerTLSInit(wasmExports['_emscripten_tls_init']);

    addOnInit(wasmExports['__wasm_call_ctors']);

    // We now have the Wasm module loaded up, keep a reference to the compiled module so we can post it to the workers.
    wasmModule = module;
    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    receiveInstance(result['instance'], result['module']);
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {
    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
        return false;
    }
  }

  wasmBinaryFile ??= findWasmBinary();

  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
// Endianness check
(() => {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

function legacyModuleProp(prop, newName, incoming=true) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get() {
        let extra = incoming ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)' : '';
        abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);

      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

/**
 * Intercept access to a global symbol.  This enables us to give informative
 * warnings/errors when folks attempt to use symbols they did not include in
 * their build, or no symbols that no longer exist.
 */
function hookGlobalSymbolAccess(sym, func) {
  if (typeof globalThis != 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        func();
        return undefined;
      }
    });
  }
}

function missingGlobal(sym, msg) {
  hookGlobalSymbolAccess(sym, () => {
    warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
  });
}

missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
missingGlobal('asm', 'Please use wasmExports instead');

function missingLibrarySymbol(sym) {
  hookGlobalSymbolAccess(sym, () => {
    // Can't `abort()` here because it would break code that does runtime
    // checks.  e.g. `if (typeof SDL === 'undefined')`.
    var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
    // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
    // library.js, which means $name for a JS name with no prefix, or name
    // for a JS name like _name.
    var librarySymbol = sym;
    if (!librarySymbol.startsWith('_')) {
      librarySymbol = '$' + sym;
    }
    msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
    if (isExportedByForceFilesystem(sym)) {
      msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
    }
    warnOnce(msg);
  });

  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (ENVIRONMENT_IS_PTHREAD) {
    return;
  }
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(...args) {
  // Avoid using the console for debugging in multi-threaded node applications
  // See https://github.com/emscripten-core/emscripten/issues/14804
  if (ENVIRONMENT_IS_NODE && fs) {
    fs.writeSync(2, args.join(' ') + '\n');
  } else
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn(...args);
}
// end include: runtime_debug.js
// === Body ===

var ASM_CONSTS = {
  106200: () => { if (document.fullscreenElement) return 1; },  
 106246: () => { return document.getElementById('canvas').width; },  
 106298: () => { return parseInt(document.getElementById('canvas').style.width); },  
 106366: () => { document.exitFullscreen(); },  
 106393: () => { setTimeout(function() { Module.requestFullscreen(false, false); }, 100); },  
 106466: () => { if (document.fullscreenElement) return 1; },  
 106512: () => { return document.getElementById('canvas').width; },  
 106564: () => { return screen.width; },  
 106589: () => { document.exitFullscreen(); },  
 106616: () => { setTimeout(function() { Module.requestFullscreen(false, true); setTimeout(function() { canvas.style.width="unset"; }, 100); }, 100); },  
 106749: () => { return window.innerWidth; },  
 106775: () => { return window.innerHeight; },  
 106802: () => { if (document.fullscreenElement) return 1; },  
 106848: () => { return document.getElementById('canvas').width; },  
 106900: () => { return parseInt(document.getElementById('canvas').style.width); },  
 106968: () => { if (document.fullscreenElement) return 1; },  
 107014: () => { return document.getElementById('canvas').width; },  
 107066: () => { return screen.width; },  
 107091: () => { return window.innerWidth; },  
 107117: () => { return window.innerHeight; },  
 107144: () => { if (document.fullscreenElement) return 1; },  
 107190: () => { return document.getElementById('canvas').width; },  
 107242: () => { return screen.width; },  
 107267: () => { document.exitFullscreen(); },  
 107294: () => { if (document.fullscreenElement) return 1; },  
 107340: () => { return document.getElementById('canvas').width; },  
 107392: () => { return parseInt(document.getElementById('canvas').style.width); },  
 107460: () => { document.exitFullscreen(); },  
 107487: ($0) => { document.getElementById('canvas').style.opacity = $0; },  
 107545: () => { return screen.width; },  
 107570: () => { return screen.height; },  
 107596: () => { return window.screenX; },  
 107623: () => { return window.screenY; },  
 107650: ($0) => { navigator.clipboard.writeText(UTF8ToString($0)); },  
 107703: ($0) => { document.getElementById("canvas").style.cursor = UTF8ToString($0); },  
 107774: () => { document.getElementById('canvas').style.cursor = 'none'; },  
 107831: ($0, $1, $2, $3) => { try { navigator.getGamepads()[$0].vibrationActuator.playEffect('dual-rumble', { startDelay: 0, duration: $3, weakMagnitude: $1, strongMagnitude: $2 }); } catch (e) { try { navigator.getGamepads()[$0].hapticActuators[0].pulse($2, $3); } catch (e) { } } },  
 108087: ($0) => { document.getElementById('canvas').style.cursor = UTF8ToString($0); },  
 108158: () => { if (document.fullscreenElement) return 1; },  
 108204: () => { return window.innerWidth; },  
 108230: () => { return window.innerHeight; },  
 108257: () => { if (document.pointerLockElement) return 1; }
};

// end include: preamble.js


  class ExitStatus {
      name = 'ExitStatus';
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }

  
  var terminateWorker = (worker) => {
      worker.terminate();
      // terminate() can be asynchronous, so in theory the worker can continue
      // to run for some amount of time after termination.  However from our POV
      // the worker now dead and we don't want to hear from it again, so we stub
      // out its message handler here.  This avoids having to check in each of
      // the onmessage handlers if the message was coming from valid worker.
      worker.onmessage = (e) => {
        var cmd = e['data'].cmd;
        err(`received "${cmd}" command from terminated worker: ${worker.workerID}`);
      };
    };
  
  var cleanupThread = (pthread_ptr) => {
      assert(!ENVIRONMENT_IS_PTHREAD, 'Internal Error! cleanupThread() can only ever be called from main application thread!');
      assert(pthread_ptr, 'Internal Error! Null pthread_ptr in cleanupThread!');
      var worker = PThread.pthreads[pthread_ptr];
      assert(worker);
      PThread.returnWorkerToPool(worker);
    };
  
  var spawnThread = (threadParams) => {
      assert(!ENVIRONMENT_IS_PTHREAD, 'Internal Error! spawnThread() can only ever be called from main application thread!');
      assert(threadParams.pthread_ptr, 'Internal error, no pthread ptr!');
  
      var worker = PThread.getNewWorker();
      if (!worker) {
        // No available workers in the PThread pool.
        return 6;
      }
      assert(!worker.pthread_ptr, 'Internal error!');
  
      PThread.runningWorkers.push(worker);
  
      // Add to pthreads map
      PThread.pthreads[threadParams.pthread_ptr] = worker;
  
      worker.pthread_ptr = threadParams.pthread_ptr;
      var msg = {
          cmd: 'run',
          start_routine: threadParams.startRoutine,
          arg: threadParams.arg,
          pthread_ptr: threadParams.pthread_ptr,
      };
      if (ENVIRONMENT_IS_NODE) {
        // Mark worker as weakly referenced once we start executing a pthread,
        // so that its existence does not prevent Node.js from exiting.  This
        // has no effect if the worker is already weakly referenced (e.g. if
        // this worker was previously idle/unused).
        worker.unref();
      }
      // Ask the worker to start executing its pthread entry point function.
      worker.postMessage(msg, threadParams.transferList);
      return 0;
    };
  
  
  
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  
  var stackSave = () => _emscripten_stack_get_current();
  
  var stackRestore = (val) => __emscripten_stack_restore(val);
  
  var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
  
  
  var convertI32PairToI53Checked = (lo, hi) => {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    };
  
  /** @type{function(number, (number|boolean), ...number)} */
  var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => {
      // EM_ASM proxying is done by passing a pointer to the address of the EM_ASM
      // content as `emAsmAddr`.  JS library proxying is done by passing an index
      // into `proxiedJSCallArgs` as `funcIndex`. If `emAsmAddr` is non-zero then
      // `funcIndex` will be ignored.
      // Additional arguments are passed after the first three are the actual
      // function arguments.
      // The serialization buffer contains the number of call params, and then
      // all the args here.
      // We also pass 'sync' to C separately, since C needs to look at it.
      // Allocate a buffer, which will be copied by the C code.
      //
      // First passed parameter specifies the number of arguments to the function.
      // When BigInt support is enabled, we must handle types in a more complex
      // way, detecting at runtime if a value is a BigInt or not (as we have no
      // type info here). To do that, add a "prefix" before each value that
      // indicates if it is a BigInt, which effectively doubles the number of
      // values we serialize for proxying. TODO: pack this?
      var serializedNumCallArgs = callArgs.length ;
      var sp = stackSave();
      var args = stackAlloc(serializedNumCallArgs * 8);
      var b = ((args)>>3);
      for (var i = 0; i < callArgs.length; i++) {
        var arg = callArgs[i];
        HEAPF64[b + i] = arg;
      }
      var rtn = __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
      stackRestore(sp);
      return rtn;
    };
  
  function _proc_exit(code) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(0, 0, 1, code);
  
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        PThread.terminateAllThreads();
        Module['onExit']?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    
  }
  
  
  
  
  var handleException = (e) => {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      checkStackCookie();
      if (e instanceof WebAssembly.RuntimeError) {
        if (_emscripten_stack_get_current() <= 0) {
          err('Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)');
        }
      }
      quit_(1, e);
    };
  
  
  
  function exitOnMainThread(returnCode) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(1, 0, 0, returnCode);
  
      _exit(returnCode);
    
  }
  
  
  /** @suppress {duplicate } */
  /** @param {boolean|number=} implicit */
  var exitJS = (status, implicit) => {
      EXITSTATUS = status;
  
      checkUnflushedContent();
  
      if (ENVIRONMENT_IS_PTHREAD) {
        // implicit exit can never happen on a pthread
        assert(!implicit);
        // When running in a pthread we propagate the exit back to the main thread
        // where it can decide if the whole process should be shut down or not.
        // The pthread may have decided not to exit its own runtime, for example
        // because it runs a main loop, but that doesn't affect the main thread.
        exitOnMainThread(status);
        throw 'unwind';
      }
  
      // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
      if (keepRuntimeAlive() && !implicit) {
        var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
        err(msg);
      }
  
      _proc_exit(status);
    };
  var _exit = exitJS;
  
  var ptrToString = (ptr) => {
      assert(typeof ptr === 'number');
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };
  
  
  var PThread = {
  unusedWorkers:[],
  runningWorkers:[],
  tlsInitFunctions:[],
  pthreads:{
  },
  nextWorkerID:1,
  debugInit() {
        function pthreadLogPrefix() {
          var t = 0;
          if (runtimeInitialized && typeof _pthread_self != 'undefined'
          ) {
            t = _pthread_self();
          }
          return `w:${workerID},t:${ptrToString(t)}: `;
        }
  
        // Prefix all err()/dbg() messages with the calling thread ID.
        var origDbg = dbg;
        dbg = (...args) => origDbg(pthreadLogPrefix() + args.join(' '));
      },
  init() {
        PThread.debugInit();
        if ((!(ENVIRONMENT_IS_PTHREAD))) {
          PThread.initMainThread();
        }
      },
  initMainThread() {
        var pthreadPoolSize = 2;
        // Start loading up the Worker pool, if requested.
        while (pthreadPoolSize--) {
          PThread.allocateUnusedWorker();
        }
        // MINIMAL_RUNTIME takes care of calling loadWasmModuleToAllWorkers
        // in postamble_minimal.js
        addOnPreRun(() => {
          addRunDependency('loading-workers')
          PThread.loadWasmModuleToAllWorkers(() => removeRunDependency('loading-workers'));
        });
      },
  terminateAllThreads:() => {
        assert(!ENVIRONMENT_IS_PTHREAD, 'Internal Error! terminateAllThreads() can only ever be called from main application thread!');
        // Attempt to kill all workers.  Sadly (at least on the web) there is no
        // way to terminate a worker synchronously, or to be notified when a
        // worker in actually terminated.  This means there is some risk that
        // pthreads will continue to be executing after `worker.terminate` has
        // returned.  For this reason, we don't call `returnWorkerToPool` here or
        // free the underlying pthread data structures.
        for (var worker of PThread.runningWorkers) {
          terminateWorker(worker);
        }
        for (var worker of PThread.unusedWorkers) {
          terminateWorker(worker);
        }
        PThread.unusedWorkers = [];
        PThread.runningWorkers = [];
        PThread.pthreads = {};
      },
  returnWorkerToPool:(worker) => {
        // We don't want to run main thread queued calls here, since we are doing
        // some operations that leave the worker queue in an invalid state until
        // we are completely done (it would be bad if free() ends up calling a
        // queued pthread_create which looks at the global data structures we are
        // modifying). To achieve that, defer the free() til the very end, when
        // we are all done.
        var pthread_ptr = worker.pthread_ptr;
        delete PThread.pthreads[pthread_ptr];
        // Note: worker is intentionally not terminated so the pool can
        // dynamically grow.
        PThread.unusedWorkers.push(worker);
        PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
        // Not a running Worker anymore
        // Detach the worker from the pthread object, and return it to the
        // worker pool as an unused worker.
        worker.pthread_ptr = 0;
  
        // Finally, free the underlying (and now-unused) pthread structure in
        // linear memory.
        __emscripten_thread_free_data(pthread_ptr);
      },
  receiveObjectTransfer(data) {
      },
  threadInitTLS() {
        // Call thread init functions (these are the _emscripten_tls_init for each
        // module loaded.
        PThread.tlsInitFunctions.forEach((f) => f());
      },
  loadWasmModuleToWorker:(worker) => new Promise((onFinishedLoading) => {
        worker.onmessage = (e) => {
          var d = e['data'];
          var cmd = d.cmd;
  
          // If this message is intended to a recipient that is not the main
          // thread, forward it to the target thread.
          if (d.targetThread && d.targetThread != _pthread_self()) {
            var targetWorker = PThread.pthreads[d.targetThread];
            if (targetWorker) {
              targetWorker.postMessage(d, d.transferList);
            } else {
              err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d.targetThread}, but that thread no longer exists!`);
            }
            return;
          }
  
          if (cmd === 'checkMailbox') {
            checkMailbox();
          } else if (cmd === 'spawnThread') {
            spawnThread(d);
          } else if (cmd === 'cleanupThread') {
            cleanupThread(d.thread);
          } else if (cmd === 'loaded') {
            worker.loaded = true;
            // Check that this worker doesn't have an associated pthread.
            if (ENVIRONMENT_IS_NODE && !worker.pthread_ptr) {
              // Once worker is loaded & idle, mark it as weakly referenced,
              // so that mere existence of a Worker in the pool does not prevent
              // Node.js from exiting the app.
              worker.unref();
            }
            onFinishedLoading(worker);
          } else if (cmd === 'alert') {
            alert(`Thread ${d.threadId}: ${d.text}`);
          } else if (d.target === 'setimmediate') {
            // Worker wants to postMessage() to itself to implement setImmediate()
            // emulation.
            worker.postMessage(d);
          } else if (cmd === 'callHandler') {
            Module[d.handler](...d.args);
          } else if (cmd) {
            // The received message looks like something that should be handled by this message
            // handler, (since there is a e.data.cmd field present), but is not one of the
            // recognized commands:
            err(`worker sent an unknown command ${cmd}`);
          }
        };
  
        worker.onerror = (e) => {
          var message = 'worker sent an error!';
          if (worker.pthread_ptr) {
            message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
          }
          err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
          throw e;
        };
  
        if (ENVIRONMENT_IS_NODE) {
          worker.on('message', (data) => worker.onmessage({ data: data }));
          worker.on('error', (e) => worker.onerror(e));
        }
  
        assert(wasmMemory instanceof WebAssembly.Memory, 'WebAssembly memory should have been loaded by now!');
        assert(wasmModule instanceof WebAssembly.Module, 'WebAssembly Module should have been loaded by now!');
  
        // When running on a pthread, none of the incoming parameters on the module
        // object are present. Proxy known handlers back to the main thread if specified.
        var handlers = [];
        var knownHandlers = [
          'onExit',
          'onAbort',
          'print',
          'printErr',
        ];
        for (var handler of knownHandlers) {
          if (Module.propertyIsEnumerable(handler)) {
            handlers.push(handler);
          }
        }
  
        worker.workerID = PThread.nextWorkerID++;
  
        // Ask the new worker to load up the Emscripten-compiled page. This is a heavy operation.
        worker.postMessage({
          cmd: 'load',
          handlers: handlers,
          wasmMemory,
          wasmModule,
          'workerID': worker.workerID,
        });
      }),
  loadWasmModuleToAllWorkers(onMaybeReady) {
        // Instantiation is synchronous in pthreads.
        if (
          ENVIRONMENT_IS_PTHREAD
        ) {
          return onMaybeReady();
        }
  
        let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
        pthreadPoolReady.then(onMaybeReady);
      },
  allocateUnusedWorker() {
        var worker;
        var workerOptions = {
          // This is the way that we signal to the node worker that it is hosting
          // a pthread.
          'workerData': 'em-pthread',
          // This is the way that we signal to the Web Worker that it is hosting
          // a pthread.
          'name': 'em-pthread-' + PThread.nextWorkerID,
        };
        var pthreadMainJs = _scriptName;
        // We can't use makeModuleReceiveWithVar here since we want to also
        // call URL.createObjectURL on the mainScriptUrlOrBlob.
        if (Module['mainScriptUrlOrBlob']) {
          pthreadMainJs = Module['mainScriptUrlOrBlob'];
          if (typeof pthreadMainJs != 'string') {
            pthreadMainJs = URL.createObjectURL(pthreadMainJs);
          }
        }
        worker = new Worker(pthreadMainJs, workerOptions);
        PThread.unusedWorkers.push(worker);
      },
  getNewWorker() {
        if (PThread.unusedWorkers.length == 0) {
  // PTHREAD_POOL_SIZE_STRICT should show a warning and, if set to level `2`, return from the function.
  // However, if we're in Node.js, then we can create new workers on the fly and PTHREAD_POOL_SIZE_STRICT
  // should be ignored altogether.
          if (!ENVIRONMENT_IS_NODE) {
              err('Tried to spawn a new thread, but the thread pool is exhausted.\n' +
              'This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n' +
              'If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`.'
                + '\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.'
              );
          }
          PThread.allocateUnusedWorker();
          PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
        }
        return PThread.unusedWorkers.pop();
      },
  };

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

  
  var establishStackSpace = (pthread_ptr) => {
      var stackHigh = HEAPU32[(((pthread_ptr)+(52))>>2)];
      var stackSize = HEAPU32[(((pthread_ptr)+(56))>>2)];
      var stackLow = stackHigh - stackSize;
      assert(stackHigh != 0);
      assert(stackLow != 0);
      assert(stackHigh > stackLow, 'stackHigh must be higher then stackLow');
      // Set stack limits used by `emscripten/stack.h` function.  These limits are
      // cached in wasm-side globals to make checks as fast as possible.
      _emscripten_stack_set_limits(stackHigh, stackLow);
  
      // Call inside wasm module to set up the stack frame for this pthread in wasm module scope
      stackRestore(stackHigh);
  
      // Write the stack cookie last, after we have set up the proper bounds and
      // current position of the stack.
      writeStackCookie();
    };

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[ptr];
      case 'i8': return HEAP8[ptr];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  
  
  
  var invokeEntryPoint = (ptr, arg) => {
      // An old thread on this worker may have been canceled without returning the
      // `runtimeKeepaliveCounter` to zero. Reset it now so the new thread won't
      // be affected.
      runtimeKeepaliveCounter = 0;
  
      // Same for noExitRuntime.  The default for pthreads should always be false
      // otherwise pthreads would never complete and attempts to pthread_join to
      // them would block forever.
      // pthreads can still choose to set `noExitRuntime` explicitly, or
      // call emscripten_unwind_to_js_event_loop to extend their lifetime beyond
      // their main function.  See comment in src/runtime_pthread.js for more.
      noExitRuntime = 0;
  
      // pthread entry points are always of signature 'void *ThreadMain(void *arg)'
      // Native codebases sometimes spawn threads with other thread entry point
      // signatures, such as void ThreadMain(void *arg), void *ThreadMain(), or
      // void ThreadMain().  That is not acceptable per C/C++ specification, but
      // x86 compiler ABI extensions enable that to work. If you find the
      // following line to crash, either change the signature to "proper" void
      // *ThreadMain(void *arg) form, or try linking with the Emscripten linker
      // flag -sEMULATE_FUNCTION_POINTER_CASTS to add in emulation for this x86
      // ABI extension.
      var result = ((a1) => dynCall_ii(ptr, a1))(arg);
      checkStackCookie();
      function finish(result) {
        if (keepRuntimeAlive()) {
          EXITSTATUS = result;
        } else {
          __emscripten_thread_exit(result);
        }
      }
      finish(result);
    };

  var noExitRuntime = Module['noExitRuntime'] || true;


  var registerTLSInit = (tlsInitFunc) => PThread.tlsInitFunctions.push(tlsInitFunc);

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[ptr] = value; break;
      case 'i8': HEAP8[ptr] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }



  var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
        err(text);
      }
    };

  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number=} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined/NaN means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
  var ___assert_fail = (condition, filename, line, func) => {
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    };

  var PATH = {
  isAbs:(path) => path.charAt(0) === '/',
  splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
  normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },
  normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },
  dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },
  basename:(path) => {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },
  join:(...paths) => PATH.normalize(paths.join('/')),
  join2:(l, r) => PATH.normalize(l + '/' + r),
  };
  
  var initRandomFill = () => {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        // like with most Web APIs, we can't use Web Crypto API directly on shared memory,
        // so we need to create an intermediate buffer and copy it to the destination
        return (view) => (
          view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))),
          // Return the original view to match modern native implementations.
          view
        );
      } else
      if (ENVIRONMENT_IS_NODE) {
        // for nodejs with or without crypto support included
        try {
          var crypto_module = require('crypto');
          var randomFillSync = crypto_module['randomFillSync'];
          if (randomFillSync) {
            // nodejs with LTS crypto support
            return (view) => crypto_module['randomFillSync'](view);
          }
          // very old nodejs with the original crypto API
          var randomBytes = crypto_module['randomBytes'];
          return (view) => (
            view.set(randomBytes(view.byteLength)),
            // Return the original view to match modern native implementations.
            view
          );
        } catch (e) {
          // nodejs doesn't have crypto support
        }
      }
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      abort('no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };');
    };
  var randomFill = (view) => {
      // Lazily init on the first invocation.
      return (randomFill = initRandomFill())(view);
    };
  
  
  
  var PATH_FS = {
  resolve:(...args) => {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? args[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },
  relative:(from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      },
  };
  
  
  
  var FS_stdin_getChar_buffer = [];
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) {
          var u1 = str.charCodeAt(++i);
          u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
        }
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  /** @type {function(string, boolean=, number=)} */
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          // we will read data by chunks of BUFSIZE
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;
  
          // For some reason we must suppress a closure warning here, even though
          // fd definitely exists on process.stdin, and is even the proper way to
          // get the fd of stdin,
          // https://github.com/nodejs/help/issues/2136#issuecomment-523649904
          // This started to happen after moving this logic out of library_tty.js,
          // so it is related to the surrounding code in some unclear manner.
          /** @suppress {missingProperties} */
          var fd = process.stdin.fd;
  
          try {
            bytesRead = fs.readSync(fd, buf, 0, BUFSIZE);
          } catch(e) {
            // Cross-platform differences: on Windows, reading EOF throws an
            // exception, but on other OSes, reading EOF returns 0. Uniformize
            // behavior by treating the EOF exception to return 0.
            if (e.toString().includes('EOF')) bytesRead = 0;
            else throw e;
          }
  
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString('utf-8');
          }
        } else
        if (typeof window != 'undefined' &&
          typeof window.prompt == 'function') {
          // Browser.
          result = window.prompt('Input: ');  // returns null on cancel
          if (result !== null) {
            result += '\n';
          }
        } else
        {}
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
  var TTY = {
  ttys:[],
  init() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process.stdin.setEncoding('utf8');
        // }
      },
  shutdown() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process.stdin.pause();
        // }
      },
  register(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
  stream_ops:{
  open(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
  close(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },
  fsync(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
  read(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
  write(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        },
  },
  default_tty_ops:{
  get_char(tty) {
          return FS_stdin_getChar();
        },
  put_char(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },
  fsync(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
  ioctl_tcgets(tty) {
          // typical setting
          return {
            c_iflag: 25856,
            c_oflag: 5,
            c_cflag: 191,
            c_lflag: 35387,
            c_cc: [
              0x03, 0x1c, 0x7f, 0x15, 0x04, 0x00, 0x01, 0x00, 0x11, 0x13, 0x1a, 0x00,
              0x12, 0x0f, 0x17, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
              0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]
          };
        },
  ioctl_tcsets(tty, optional_actions, data) {
          // currently just ignore
          return 0;
        },
  ioctl_tiocgwinsz(tty) {
          return [24, 80];
        },
  },
  default_tty1_ops:{
  put_char(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
  fsync(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
  },
  };
  
  
  var zeroMemory = (address, size) => {
      HEAPU8.fill(0, address, address + size);
    };
  
  var alignMemory = (size, alignment) => {
      assert(alignment, "alignment argument is required");
      return Math.ceil(size / alignment) * alignment;
    };
  var mmapAlloc = (size) => {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (ptr) zeroMemory(ptr, size);
      return ptr;
    };
  var MEMFS = {
  ops_table:null,
  mount(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },
  createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        MEMFS.ops_table ||= {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek
            }
          },
          file: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              allocate: MEMFS.stream_ops.allocate,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync
            }
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink
            },
            stream: {}
          },
          chrdev: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: FS.chrdev_stream_ops
          }
        };
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },
  getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },
  expandFileStorage(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },
  resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },
  node_ops:{
  getattr(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
  setattr(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
  lookup(parent, name) {
          throw FS.genericErrors[44];
        },
  mknod(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
  rename(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
        },
  unlink(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  rmdir(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  readdir(node) {
          var entries = ['.', '..'];
          for (var key of Object.keys(node.contents)) {
            entries.push(key);
          }
          return entries;
        },
  symlink(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },
  readlink(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
  },
  stream_ops:{
  read(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },
  write(stream, buffer, offset, length, position, canOwn) {
          // The data buffer should be a typed array view
          assert(!(buffer instanceof ArrayBuffer));
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
  llseek(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },
  allocate(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },
  mmap(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the
            // buffer we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            if (contents) {
              // Try to avoid unnecessary slices.
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              HEAP8.set(contents, ptr);
            }
          }
          return { ptr, allocated };
        },
  msync(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        },
  },
  };
  
  /** @param {boolean=} noRunDep */
  var asyncLoad = (url, onload, onerror, noRunDep) => {
      var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
      readAsync(url).then(
        (arrayBuffer) => {
          assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
          onload(new Uint8Array(arrayBuffer));
          if (dep) removeRunDependency(dep);
        },
        (err) => {
          if (onerror) {
            onerror();
          } else {
            throw `Loading data file "${url}" failed.`;
          }
        }
      );
      if (dep) addRunDependency(dep);
    };
  
  
  var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
  
  var preloadPlugins = Module['preloadPlugins'] || [];
  var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      // Ensure plugins are ready.
      if (typeof Browser != 'undefined') Browser.init();
  
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
  var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      // TODO we should allow people to just pass in a complete filename instead
      // of parent and name being that we just join them anyways
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`); // might have several active requests for the same fullname
      function processData(byteArray) {
        function finish(byteArray) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == 'string') {
        asyncLoad(url, processData, onerror);
      } else {
        processData(url);
      }
    };
  
  var FS_modeStringToFlags = (str) => {
      var flagModes = {
        'r': 0,
        'r+': 2,
        'w': 512 | 64 | 1,
        'w+': 512 | 64 | 2,
        'a': 1024 | 64 | 1,
        'a+': 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == 'undefined') {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
  
  var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
  
  
  
  
  
  
  var strError = (errno) => {
      return UTF8ToString(_strerror(errno));
    };
  
  var ERRNO_CODES = {
      'EPERM': 63,
      'ENOENT': 44,
      'ESRCH': 71,
      'EINTR': 27,
      'EIO': 29,
      'ENXIO': 60,
      'E2BIG': 1,
      'ENOEXEC': 45,
      'EBADF': 8,
      'ECHILD': 12,
      'EAGAIN': 6,
      'EWOULDBLOCK': 6,
      'ENOMEM': 48,
      'EACCES': 2,
      'EFAULT': 21,
      'ENOTBLK': 105,
      'EBUSY': 10,
      'EEXIST': 20,
      'EXDEV': 75,
      'ENODEV': 43,
      'ENOTDIR': 54,
      'EISDIR': 31,
      'EINVAL': 28,
      'ENFILE': 41,
      'EMFILE': 33,
      'ENOTTY': 59,
      'ETXTBSY': 74,
      'EFBIG': 22,
      'ENOSPC': 51,
      'ESPIPE': 70,
      'EROFS': 69,
      'EMLINK': 34,
      'EPIPE': 64,
      'EDOM': 18,
      'ERANGE': 68,
      'ENOMSG': 49,
      'EIDRM': 24,
      'ECHRNG': 106,
      'EL2NSYNC': 156,
      'EL3HLT': 107,
      'EL3RST': 108,
      'ELNRNG': 109,
      'EUNATCH': 110,
      'ENOCSI': 111,
      'EL2HLT': 112,
      'EDEADLK': 16,
      'ENOLCK': 46,
      'EBADE': 113,
      'EBADR': 114,
      'EXFULL': 115,
      'ENOANO': 104,
      'EBADRQC': 103,
      'EBADSLT': 102,
      'EDEADLOCK': 16,
      'EBFONT': 101,
      'ENOSTR': 100,
      'ENODATA': 116,
      'ETIME': 117,
      'ENOSR': 118,
      'ENONET': 119,
      'ENOPKG': 120,
      'EREMOTE': 121,
      'ENOLINK': 47,
      'EADV': 122,
      'ESRMNT': 123,
      'ECOMM': 124,
      'EPROTO': 65,
      'EMULTIHOP': 36,
      'EDOTDOT': 125,
      'EBADMSG': 9,
      'ENOTUNIQ': 126,
      'EBADFD': 127,
      'EREMCHG': 128,
      'ELIBACC': 129,
      'ELIBBAD': 130,
      'ELIBSCN': 131,
      'ELIBMAX': 132,
      'ELIBEXEC': 133,
      'ENOSYS': 52,
      'ENOTEMPTY': 55,
      'ENAMETOOLONG': 37,
      'ELOOP': 32,
      'EOPNOTSUPP': 138,
      'EPFNOSUPPORT': 139,
      'ECONNRESET': 15,
      'ENOBUFS': 42,
      'EAFNOSUPPORT': 5,
      'EPROTOTYPE': 67,
      'ENOTSOCK': 57,
      'ENOPROTOOPT': 50,
      'ESHUTDOWN': 140,
      'ECONNREFUSED': 14,
      'EADDRINUSE': 3,
      'ECONNABORTED': 13,
      'ENETUNREACH': 40,
      'ENETDOWN': 38,
      'ETIMEDOUT': 73,
      'EHOSTDOWN': 142,
      'EHOSTUNREACH': 23,
      'EINPROGRESS': 26,
      'EALREADY': 7,
      'EDESTADDRREQ': 17,
      'EMSGSIZE': 35,
      'EPROTONOSUPPORT': 66,
      'ESOCKTNOSUPPORT': 137,
      'EADDRNOTAVAIL': 4,
      'ENETRESET': 39,
      'EISCONN': 30,
      'ENOTCONN': 53,
      'ETOOMANYREFS': 141,
      'EUSERS': 136,
      'EDQUOT': 19,
      'ESTALE': 72,
      'ENOTSUP': 138,
      'ENOMEDIUM': 148,
      'EILSEQ': 25,
      'EOVERFLOW': 61,
      'ECANCELED': 11,
      'ENOTRECOVERABLE': 56,
      'EOWNERDEAD': 62,
      'ESTRPIPE': 135,
    };
  var FS = {
  root:null,
  mounts:[],
  devices:{
  },
  streams:[],
  nextInode:1,
  nameTable:null,
  currentPath:"/",
  initialized:false,
  ignorePermissions:true,
  ErrnoError:class extends Error {
        name = 'ErrnoError';
        // We set the `name` property to be able to identify `FS.ErrnoError`
        // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
        // - when using PROXYFS, an error can come from an underlying FS
        // as different FS objects have their own FS.ErrnoError each,
        // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
        // we'll use the reliable test `err.name == "ErrnoError"` instead
        constructor(errno) {
          super(runtimeInitialized ? strError(errno) : '');
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
        }
      },
  genericErrors:{
  },
  filesystems:null,
  syncFSRequests:0,
  readFiles:{
  },
  FSStream:class {
        shared = {};
        get object() {
          return this.node;
        }
        set object(val) {
          this.node = val;
        }
        get isRead() {
          return (this.flags & 2097155) !== 1;
        }
        get isWrite() {
          return (this.flags & 2097155) !== 0;
        }
        get isAppend() {
          return (this.flags & 1024);
        }
        get flags() {
          return this.shared.flags;
        }
        set flags(val) {
          this.shared.flags = val;
        }
        get position() {
          return this.shared.position;
        }
        set position(val) {
          this.shared.position = val;
        }
      },
  FSNode:class {
        node_ops = {};
        stream_ops = {};
        readMode = 292 | 73;
        writeMode = 146;
        mounted = null;
        constructor(parent, name, mode, rdev) {
          if (!parent) {
            parent = this;  // root node sets parent to itself
          }
          this.parent = parent;
          this.mount = parent.mount;
          this.id = FS.nextInode++;
          this.name = name;
          this.mode = mode;
          this.rdev = rdev;
        }
        get read() {
          return (this.mode & this.readMode) === this.readMode;
        }
        set read(val) {
          val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
        }
        get write() {
          return (this.mode & this.writeMode) === this.writeMode;
        }
        set write(val) {
          val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
        }
        get isFolder() {
          return FS.isDir(this.mode);
        }
        get isDevice() {
          return FS.isChrdev(this.mode);
        }
      },
  lookupPath(path, opts = {}) {
        path = PATH_FS.resolve(path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        opts = Object.assign(defaults, opts)
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the absolute path
        var parts = path.split('/').filter((p) => !!p);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },
  getPath(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? `${mount}/${path}` : mount + path;
          }
          path = path ? `${node.name}/${path}` : node.name;
          node = node.parent;
        }
      },
  hashName(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
  hashAddNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
  hashRemoveNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
  lookupNode(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },
  createNode(parent, name, mode, rdev) {
        assert(typeof parent == 'object')
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },
  destroyNode(node) {
        FS.hashRemoveNode(node);
      },
  isRoot(node) {
        return node === node.parent;
      },
  isMountpoint(node) {
        return !!node.mounted;
      },
  isFile(mode) {
        return (mode & 61440) === 32768;
      },
  isDir(mode) {
        return (mode & 61440) === 16384;
      },
  isLink(mode) {
        return (mode & 61440) === 40960;
      },
  isChrdev(mode) {
        return (mode & 61440) === 8192;
      },
  isBlkdev(mode) {
        return (mode & 61440) === 24576;
      },
  isFIFO(mode) {
        return (mode & 61440) === 4096;
      },
  isSocket(mode) {
        return (mode & 49152) === 49152;
      },
  flagsToPermissionString(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },
  nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
  mayLookup(dir) {
        if (!FS.isDir(dir.mode)) return 54;
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
  mayCreate(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },
  mayDelete(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },
  mayOpen(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
  MAX_OPEN_FDS:4096,
  nextfd() {
        for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
  getStreamChecked(fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        return stream;
      },
  getStream:(fd) => FS.streams[fd],
  createStream(stream, fd = -1) {
        assert(fd >= -1);
  
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        if (fd == -1) {
          fd = FS.nextfd();
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
  closeStream(fd) {
        FS.streams[fd] = null;
      },
  dupStream(origStream, fd = -1) {
        var stream = FS.createStream(origStream, fd);
        stream.stream_ops?.dup?.(stream);
        return stream;
      },
  chrdev_stream_ops:{
  open(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          stream.stream_ops.open?.(stream);
        },
  llseek() {
          throw new FS.ErrnoError(70);
        },
  },
  major:(dev) => ((dev) >> 8),
  minor:(dev) => ((dev) & 0xff),
  makedev:(ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
  getDevice:(dev) => FS.devices[dev],
  getMounts(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push(...m.mounts);
        }
  
        return mounts;
      },
  syncfs(populate, callback) {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
  mount(type, opts, mountpoint) {
        if (typeof type == 'string') {
          // The filesystem was not included, and instead we have an error
          // message stored in the variable.
          throw type;
        }
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type,
          opts,
          mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },
  unmount(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },
  lookup(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
  mknod(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
  create(path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
  mkdir(path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
  mkdirTree(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },
  mkdev(path, mode, dev) {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
  symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
  rename(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existent directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
          // update old node (we do this here to avoid each backend 
          // needing to)
          old_node.parent = new_dir;
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },
  rmdir(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
  readdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },
  unlink(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
  readlink(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },
  stat(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },
  lstat(path) {
        return FS.stat(path, true);
      },
  chmod(path, mode, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },
  lchmod(path, mode) {
        FS.chmod(path, mode, true);
      },
  fchmod(fd, mode) {
        var stream = FS.getStreamChecked(fd);
        FS.chmod(stream.node, mode);
      },
  chown(path, uid, gid, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },
  lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
  fchown(fd, uid, gid) {
        var stream = FS.getStreamChecked(fd);
        FS.chown(stream.node, uid, gid);
      },
  truncate(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },
  ftruncate(fd, len) {
        var stream = FS.getStreamChecked(fd);
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },
  utime(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },
  open(path, flags, mode) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
        if ((flags & 64)) {
          mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
  close(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
  isClosed(stream) {
        return stream.fd === null;
      },
  llseek(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
  read(stream, buffer, offset, length, position) {
        assert(offset >= 0);
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
  write(stream, buffer, offset, length, position, canOwn) {
        assert(offset >= 0);
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
  allocate(stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },
  mmap(stream, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        if (!length) {
          throw new FS.ErrnoError(28);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
  msync(stream, buffer, offset, length, mmapFlags) {
        assert(offset >= 0);
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },
  ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
  readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error(`Invalid encoding type "${opts.encoding}"`);
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
  writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },
  cwd:() => FS.currentPath,
  chdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
  createDefaultDirectories() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },
  createDefaultDevices() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        // use a buffer to avoid overhead of individual crypto calls per byte
        var randomBuffer = new Uint8Array(1024), randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomLeft = randomFill(randomBuffer).byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice('/dev', 'random', randomByte);
        FS.createDevice('/dev', 'urandom', randomByte);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },
  createSpecialDirectories() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount() {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup(parent, name) {
                var fd = +name;
                var stream = FS.getStreamChecked(fd);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },
  createStandardStreams(input, output, error) {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (input) {
          FS.createDevice('/dev', 'stdin', input);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (output) {
          FS.createDevice('/dev', 'stdout', null, output);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (error) {
          FS.createDevice('/dev', 'stderr', null, error);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
        assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
        assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
        assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`);
      },
  staticInit() {
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },
  init(input, output, error) {
        assert(!FS.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.initialized = true;
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input ??= Module['stdin'];
        output ??= Module['stdout'];
        error ??= Module['stderr'];
  
        FS.createStandardStreams(input, output, error);
      },
  quit() {
        FS.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        _fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },
  findObject(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
  analyzePath(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },
  createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },
  createFile(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
      },
  createDevice(parent, name, input, output) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(!!input, !!output);
        FS.createDevice.major ??= 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open(stream) {
            stream.seekable = false;
          },
          close(stream) {
            // flush any pending line data
            if (output?.buffer?.length) {
              output(10);
            }
          },
          read(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },
  forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else { // Command-line.
          try {
            obj.contents = readBinary(obj.url);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
      },
  createLazyFile(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array).
        // Actual getting is abstracted away for eventual reuse.
        class LazyUint8Array {
          lengthKnown = false;
          chunks = []; // Loaded chunks. Index is the chunk number
          get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize)|0;
            return this.getter(chunkNum)[chunkOffset];
          }
          setDataGetter(getter) {
            this.getter = getter;
          }
          cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (from, to) => {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
              }
              return intArrayFromString(xhr.responseText || '', true);
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
  
            if (usesGzip || !datalength) {
              // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
              chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out("LazyFiles on gzip forces download of the whole file when length is accessed");
            }
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          }
          get length() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          }
          get chunkSize() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          }
        }
  
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = (...args) => {
            FS.forceLoadFile(node);
            return fn(...args);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
  absolutePath() {
        abort('FS.absolutePath has been removed; use PATH_FS.resolve instead');
      },
  createFolder() {
        abort('FS.createFolder has been removed; use FS.mkdir instead');
      },
  createLink() {
        abort('FS.createLink has been removed; use FS.symlink instead');
      },
  joinPath() {
        abort('FS.joinPath has been removed; use PATH.join instead');
      },
  mmapAlloc() {
        abort('FS.mmapAlloc has been replaced by the top level function mmapAlloc');
      },
  standardizePath() {
        abort('FS.standardizePath has been removed; use PATH.normalize instead');
      },
  };
  
  var SYSCALLS = {
  DEFAULT_POLLMASK:5,
  calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },
  doStat(func, path, buf) {
        var stat = func(path);
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = stat.mode;
        HEAPU32[(((buf)+(8))>>2)] = stat.nlink;
        HEAP32[(((buf)+(12))>>2)] = stat.uid;
        HEAP32[(((buf)+(16))>>2)] = stat.gid;
        HEAP32[(((buf)+(20))>>2)] = stat.rdev;
        (tempI64 = [stat.size>>>0,(tempDouble = stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(24))>>2)] = tempI64[0],HEAP32[(((buf)+(28))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(32))>>2)] = 4096;
        HEAP32[(((buf)+(36))>>2)] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        (tempI64 = [Math.floor(atime / 1000)>>>0,(tempDouble = Math.floor(atime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(48))>>2)] = (atime % 1000) * 1000 * 1000;
        (tempI64 = [Math.floor(mtime / 1000)>>>0,(tempDouble = Math.floor(mtime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(56))>>2)] = tempI64[0],HEAP32[(((buf)+(60))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(64))>>2)] = (mtime % 1000) * 1000 * 1000;
        (tempI64 = [Math.floor(ctime / 1000)>>>0,(tempDouble = Math.floor(ctime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(72))>>2)] = tempI64[0],HEAP32[(((buf)+(76))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(80))>>2)] = (ctime % 1000) * 1000 * 1000;
        (tempI64 = [stat.ino>>>0,(tempDouble = stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(88))>>2)] = tempI64[0],HEAP32[(((buf)+(92))>>2)] = tempI64[1]);
        return 0;
      },
  doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
  getStreamFromFD(fd) {
        var stream = FS.getStreamChecked(fd);
        return stream;
      },
  varargs:undefined,
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  
  
  function ___syscall_faccessat(dirfd, path, amode, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(2, 0, 1, dirfd, path, amode, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      assert(flags === 0 || flags == 512);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (amode & ~7) {
        // need a valid mode
        return -28;
      }
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node) {
        return -44;
      }
      var perms = '';
      if (amode & 4) perms += 'r';
      if (amode & 2) perms += 'w';
      if (amode & 1) perms += 'x';
      if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
        return -2;
      }
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  /** @suppress {duplicate } */
  var syscallGetVarargI = () => {
      assert(SYSCALLS.varargs != undefined);
      // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
      var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
      SYSCALLS.varargs += 4;
      return ret;
    };
  var syscallGetVarargP = syscallGetVarargI;
  
  
  
  
  function ___syscall_fcntl64(fd, cmd, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(3, 0, 1, fd, cmd, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = syscallGetVarargI();
          if (arg < 0) {
            return -28;
          }
          while (FS.streams[arg]) {
            arg++;
          }
          var newStream;
          newStream = FS.dupStream(stream, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = syscallGetVarargI();
          stream.flags |= arg;
          return 0;
        }
        case 12: {
          var arg = syscallGetVarargP();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 13:
        case 14:
          return 0; // Pretend that the locking is successful.
      }
      return -28;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  
  
  function ___syscall_getcwd(buf, size) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(4, 0, 1, buf, size);
  
  try {
  
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
      if (size < cwdLengthInBytes) return -68;
      stringToUTF8(cwd, buf, size);
      return cwdLengthInBytes;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_ioctl(fd, op, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(5, 0, 1, fd, op, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21505: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcgets) {
            var termios = stream.tty.ops.ioctl_tcgets(stream);
            var argp = syscallGetVarargP();
            HEAP32[((argp)>>2)] = termios.c_iflag || 0;
            HEAP32[(((argp)+(4))>>2)] = termios.c_oflag || 0;
            HEAP32[(((argp)+(8))>>2)] = termios.c_cflag || 0;
            HEAP32[(((argp)+(12))>>2)] = termios.c_lflag || 0;
            for (var i = 0; i < 32; i++) {
              HEAP8[(argp + i)+(17)] = termios.c_cc[i] || 0;
            }
            return 0;
          }
          return 0;
        }
        case 21510:
        case 21511:
        case 21512: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcsets) {
            var argp = syscallGetVarargP();
            var c_iflag = HEAP32[((argp)>>2)];
            var c_oflag = HEAP32[(((argp)+(4))>>2)];
            var c_cflag = HEAP32[(((argp)+(8))>>2)];
            var c_lflag = HEAP32[(((argp)+(12))>>2)];
            var c_cc = []
            for (var i = 0; i < 32; i++) {
              c_cc.push(HEAP8[(argp + i)+(17)]);
            }
            return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
          }
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = syscallGetVarargP();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = syscallGetVarargP();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tiocgwinsz) {
            var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
            var argp = syscallGetVarargP();
            HEAP16[((argp)>>1)] = winsize[0];
            HEAP16[(((argp)+(2))>>1)] = winsize[1];
          }
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        case 21515: {
          if (!stream.tty) return -59;
          return 0;
        }
        default: return -28; // not supported
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  
  
  
  function ___syscall_openat(dirfd, path, flags, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(6, 0, 1, dirfd, path, flags, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      var mode = varargs ? syscallGetVarargI() : 0;
      return FS.open(path, flags, mode).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  

  var nowIsMonotonic = 1;
  var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

  var __emscripten_init_main_thread_js = (tb) => {
      // Pass the thread address to the native code where they stored in wasm
      // globals which act as a form of TLS. Global constructors trying
      // to access this value will read the wrong value, but that is UB anyway.
      __emscripten_thread_init(
        tb,
        /*is_main=*/!ENVIRONMENT_IS_WORKER,
        /*is_runtime=*/1,
        /*can_block=*/!ENVIRONMENT_IS_WEB,
        /*default_stacksize=*/65536,
        /*start_profiling=*/false,
      );
      PThread.threadInitTLS();
    };

  
  
  
  
  var maybeExit = () => {
      if (!keepRuntimeAlive()) {
        try {
          if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
          else
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    };
  var callUserCallback = (func) => {
      if (ABORT) {
        err('user callback triggered after runtime exited or application aborted.  Ignoring.');
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    };
  
  
  
  var __emscripten_thread_mailbox_await = (pthread_ptr) => {
      if (typeof Atomics.waitAsync === 'function') {
        // Wait on the pthread's initial self-pointer field because it is easy and
        // safe to access from sending threads that need to notify the waiting
        // thread.
        // TODO: How to make this work with wasm64?
        var wait = Atomics.waitAsync(HEAP32, ((pthread_ptr)>>2), pthread_ptr);
        assert(wait.async);
        wait.value.then(checkMailbox);
        var waitingAsync = pthread_ptr + 128;
        Atomics.store(HEAP32, ((waitingAsync)>>2), 1);
      }
      // If `Atomics.waitAsync` is not implemented, then we will always fall back
      // to postMessage and there is no need to do anything here.
    };
  
  var checkMailbox = () => {
      // Only check the mailbox if we have a live pthread runtime. We implement
      // pthread_self to return 0 if there is no live runtime.
      var pthread_ptr = _pthread_self();
      if (pthread_ptr) {
        // If we are using Atomics.waitAsync as our notification mechanism, wait
        // for a notification before processing the mailbox to avoid missing any
        // work that could otherwise arrive after we've finished processing the
        // mailbox and before we're ready for the next notification.
        __emscripten_thread_mailbox_await(pthread_ptr);
        callUserCallback(__emscripten_check_mailbox);
      }
    };
  
  var __emscripten_notify_mailbox_postmessage = (targetThread, currThreadId) => {
      if (targetThread == currThreadId) {
        setTimeout(checkMailbox);
      } else if (ENVIRONMENT_IS_PTHREAD) {
        postMessage({targetThread, cmd: 'checkMailbox'});
      } else {
        var worker = PThread.pthreads[targetThread];
        if (!worker) {
          err(`Cannot send message to thread with ID ${targetThread}, unknown thread ID!`);
          return;
        }
        worker.postMessage({cmd: 'checkMailbox'});
      }
    };

  
  var proxiedJSCallArgs = [];
  
  var __emscripten_receive_on_main_thread_js = (funcIndex, emAsmAddr, callingThread, numCallArgs, args) => {
      // Sometimes we need to backproxy events to the calling thread (e.g.
      // HTML5 DOM events handlers such as
      // emscripten_set_mousemove_callback()), so keep track in a globally
      // accessible variable about the thread that initiated the proxying.
      proxiedJSCallArgs.length = numCallArgs;
      var b = ((args)>>3);
      for (var i = 0; i < numCallArgs; i++) {
        proxiedJSCallArgs[i] = HEAPF64[b + i];
      }
      // Proxied JS library funcs use funcIndex and EM_ASM functions use emAsmAddr
      var func = emAsmAddr ? ASM_CONSTS[emAsmAddr] : proxiedFunctionTable[funcIndex];
      assert(!(funcIndex && emAsmAddr));
      assert(func.length == numCallArgs, 'Call args mismatch in _emscripten_receive_on_main_thread_js');
      PThread.currentProxiedOperationCallerThread = callingThread;
      var rtn = func(...proxiedJSCallArgs);
      PThread.currentProxiedOperationCallerThread = 0;
      // Proxied functions can return any type except bigint.  All other types
      // cooerce to f64/double (the return type of this function in C) but not
      // bigint.
      assert(typeof rtn != "bigint");
      return rtn;
    };

  var __emscripten_thread_cleanup = (thread) => {
      // Called when a thread needs to be cleaned up so it can be reused.
      // A thread is considered reusable when it either returns from its
      // entry point, calls pthread_exit, or acts upon a cancellation.
      // Detached threads are responsible for calling this themselves,
      // otherwise pthread_join is responsible for calling this.
      if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
      else postMessage({ cmd: 'cleanupThread', thread });
    };


  var __emscripten_thread_set_strongref = (thread) => {
      // Called when a thread needs to be strongly referenced.
      // Currently only used for:
      // - keeping the "main" thread alive in PROXY_TO_PTHREAD mode;
      // - crashed threads that needs to propagate the uncaught exception
      //   back to the main thread.
      if (ENVIRONMENT_IS_NODE) {
        PThread.pthreads[thread].ref();
      }
    };

  
  
  
  
  
  
  
  function __mmap_js(len,prot,flags,fd,offset_low, offset_high,allocated,addr) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(7, 0, 1, len,prot,flags,fd,offset_low, offset_high,allocated,addr);
  
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      var res = FS.mmap(stream, len, offset, prot, flags);
      var ptr = res.ptr;
      HEAP32[((allocated)>>2)] = res.allocated;
      HEAPU32[((addr)>>2)] = ptr;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  
  
  
  function __munmap_js(addr,len,prot,flags,fd,offset_low, offset_high) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(8, 0, 1, addr,len,prot,flags,fd,offset_low, offset_high);
  
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
  
    
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      if (prot & 2) {
        SYSCALLS.doMsync(addr, stream, len, flags, offset);
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  

  var readEmAsmArgsArray = [];
  var readEmAsmArgs = (sigPtr, buf) => {
      // Nobody should have mutated _readEmAsmArgsArray underneath us to be something else than an array.
      assert(Array.isArray(readEmAsmArgsArray));
      // The input buffer is allocated on the stack, so it must be stack-aligned.
      assert(buf % 16 == 0);
      readEmAsmArgsArray.length = 0;
      var ch;
      // Most arguments are i32s, so shift the buffer pointer so it is a plain
      // index into HEAP32.
      while (ch = HEAPU8[sigPtr++]) {
        var chr = String.fromCharCode(ch);
        var validChars = ['d', 'f', 'i', 'p'];
        assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
        // Floats are always passed as doubles, so all types except for 'i'
        // are 8 bytes and require alignment.
        var wide = (ch != 105);
        wide &= (ch != 112);
        buf += wide && (buf % 8) ? 4 : 0;
        readEmAsmArgsArray.push(
          // Special case for pointers under wasm64 or CAN_ADDRESS_2GB mode.
          ch == 112 ? HEAPU32[((buf)>>2)] :
          ch == 105 ?
            HEAP32[((buf)>>2)] :
            HEAPF64[((buf)>>3)]
        );
        buf += wide ? 8 : 4;
      }
      return readEmAsmArgsArray;
    };
  var runEmAsmFunction = (code, sigPtr, argbuf) => {
      var args = readEmAsmArgs(sigPtr, argbuf);
      assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
      return ASM_CONSTS[code](...args);
    };
  var _emscripten_asm_const_int = (code, sigPtr, argbuf) => {
      return runEmAsmFunction(code, sigPtr, argbuf);
    };

  
  var _emscripten_check_blocking_allowed = () => {
      if (ENVIRONMENT_IS_NODE) return;
  
      if (ENVIRONMENT_IS_WORKER) return; // Blocking in a worker/pthread is fine.
  
      warnOnce('Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread');
  
    };

  var _emscripten_date_now = () => Date.now();

  var runtimeKeepalivePush = () => {
      runtimeKeepaliveCounter += 1;
    };
  var _emscripten_exit_with_live_runtime = () => {
      runtimeKeepalivePush();
      throw 'unwind';
    };

  var JSEvents = {
  removeAllEventListeners() {
        while (JSEvents.eventHandlers.length) {
          JSEvents._removeHandler(JSEvents.eventHandlers.length - 1);
        }
        JSEvents.deferredCalls = [];
      },
  inEventHandler:0,
  deferredCalls:[],
  deferCall(targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
          if (arrA.length != arrB.length) return false;
  
          for (var i in arrA) {
            if (arrA[i] != arrB[i]) return false;
          }
          return true;
        }
        // Test if the given call was already queued, and if so, don't add it again.
        for (var call of JSEvents.deferredCalls) {
          if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
            return;
          }
        }
        JSEvents.deferredCalls.push({
          targetFunction,
          precedence,
          argsList
        });
  
        JSEvents.deferredCalls.sort((x,y) => x.precedence < y.precedence);
      },
  removeDeferredCalls(targetFunction) {
        JSEvents.deferredCalls = JSEvents.deferredCalls.filter((call) => call.targetFunction != targetFunction);
      },
  canPerformEventHandlerRequests() {
        if (navigator.userActivation) {
          // Verify against transient activation status from UserActivation API
          // whether it is possible to perform a request here without needing to defer. See
          // https://developer.mozilla.org/en-US/docs/Web/Security/User_activation#transient_activation
          // and https://caniuse.com/mdn-api_useractivation
          // At the time of writing, Firefox does not support this API: https://bugzilla.mozilla.org/show_bug.cgi?id=1791079
          return navigator.userActivation.isActive;
        }
  
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
      },
  runDeferredCalls() {
        if (!JSEvents.canPerformEventHandlerRequests()) {
          return;
        }
        var deferredCalls = JSEvents.deferredCalls;
        JSEvents.deferredCalls = [];
        for (var call of deferredCalls) {
          call.targetFunction(...call.argsList);
        }
      },
  eventHandlers:[],
  removeAllHandlersOnTarget:(target, eventTypeString) => {
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
          if (JSEvents.eventHandlers[i].target == target &&
            (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
             JSEvents._removeHandler(i--);
           }
        }
      },
  _removeHandler(i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i, 1);
      },
  registerOrRemoveHandler(eventHandler) {
        if (!eventHandler.target) {
          err('registerOrRemoveHandler: the target element for event handler registration does not exist, when processing the following event handler registration:');
          console.dir(eventHandler);
          return -4;
        }
        if (eventHandler.callbackfunc) {
          eventHandler.eventListenerFunc = function(event) {
            // Increment nesting count for the event handler.
            ++JSEvents.inEventHandler;
            JSEvents.currentEventHandler = eventHandler;
            // Process any old deferred calls the user has placed.
            JSEvents.runDeferredCalls();
            // Process the actual event, calls back to user C code handler.
            eventHandler.handlerFunc(event);
            // Process any new deferred calls that were placed right now from this event handler.
            JSEvents.runDeferredCalls();
            // Out of event handler - restore nesting count.
            --JSEvents.inEventHandler;
          };
  
          eventHandler.target.addEventListener(eventHandler.eventTypeString,
                                               eventHandler.eventListenerFunc,
                                               eventHandler.useCapture);
          JSEvents.eventHandlers.push(eventHandler);
        } else {
          for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (JSEvents.eventHandlers[i].target == eventHandler.target
             && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
               JSEvents._removeHandler(i--);
             }
          }
        }
        return 0;
      },
  getTargetThreadForEventCallback(targetThread) {
        switch (targetThread) {
          case 1:
            // The event callback for the current event should be called on the
            // main browser thread. (0 == don't proxy)
            return 0;
          case 2:
            // The event callback for the current event should be backproxied to
            // the thread that is registering the event.
            // This can be 0 in the case that the caller uses
            // EM_CALLBACK_THREAD_CONTEXT_CALLING_THREAD but on the main thread
            // itself.
            return PThread.currentProxiedOperationCallerThread;
          default:
            // The event callback for the current event should be proxied to the
            // given specific thread.
            return targetThread;
        }
      },
  getNodeNameForTarget(target) {
        if (!target) return '';
        if (target == window) return '#window';
        if (target == screen) return '#screen';
        return target?.nodeName || '';
      },
  fullscreenEnabled() {
        return document.fullscreenEnabled
        // Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitFullscreenEnabled.
        // TODO: If Safari at some point ships with unprefixed version, update the version check above.
        || document.webkitFullscreenEnabled
         ;
      },
  };
  
  var maybeCStringToJsString = (cString) => {
      // "cString > 2" checks if the input is a number, and isn't of the special
      // values we accept here, EMSCRIPTEN_EVENT_TARGET_* (which map to 0, 1, 2).
      // In other words, if cString > 2 then it's a pointer to a valid place in
      // memory, and points to a C string.
      return cString > 2 ? UTF8ToString(cString) : cString;
    };
  
  /** @type {Object} */
  var specialHTMLTargets = [0, typeof document != 'undefined' ? document : 0, typeof window != 'undefined' ? window : 0];
  var findEventTarget = (target) => {
      target = maybeCStringToJsString(target);
      var domElement = specialHTMLTargets[target] || (typeof document != 'undefined' ? document.querySelector(target) : undefined);
      return domElement;
    };
  
  var getBoundingClientRect = (e) => specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : {'left':0,'top':0};
  
  
  function _emscripten_get_element_css_size(target, width, height) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(9, 0, 1, target, width, height);
  
      target = findEventTarget(target);
      if (!target) return -4;
  
      var rect = getBoundingClientRect(target);
      HEAPF64[((width)>>3)] = rect.width;
      HEAPF64[((height)>>3)] = rect.height;
  
      return 0;
    
  }
  

  
  var fillGamepadEventData = (eventStruct, e) => {
      HEAPF64[((eventStruct)>>3)] = e.timestamp;
      for (var i = 0; i < e.axes.length; ++i) {
        HEAPF64[(((eventStruct+i*8)+(16))>>3)] = e.axes[i];
      }
      for (var i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] == 'object') {
          HEAPF64[(((eventStruct+i*8)+(528))>>3)] = e.buttons[i].value;
        } else {
          HEAPF64[(((eventStruct+i*8)+(528))>>3)] = e.buttons[i];
        }
      }
      for (var i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] == 'object') {
          HEAP8[(eventStruct+i)+(1040)] = e.buttons[i].pressed;
        } else {
          // Assigning a boolean to HEAP32, that's ok, but Closure would like to warn about it:
          /** @suppress {checkTypes} */
          HEAP8[(eventStruct+i)+(1040)] = e.buttons[i] == 1;
        }
      }
      HEAP8[(eventStruct)+(1104)] = e.connected;
      HEAP32[(((eventStruct)+(1108))>>2)] = e.index;
      HEAP32[(((eventStruct)+(8))>>2)] = e.axes.length;
      HEAP32[(((eventStruct)+(12))>>2)] = e.buttons.length;
      stringToUTF8(e.id, eventStruct + 1112, 64);
      stringToUTF8(e.mapping, eventStruct + 1176, 64);
    };
  
  
  function _emscripten_get_gamepad_status(index, gamepadState) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(10, 0, 1, index, gamepadState);
  
      if (!JSEvents.lastGamepadState) throw 'emscripten_get_gamepad_status() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!';
      // INVALID_PARAM is returned on a Gamepad index that never was there.
      if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
  
      // NO_DATA is returned on a Gamepad index that was removed.
      // For previously disconnected gamepads there should be an empty slot (null/undefined/false) at the index.
      // This is because gamepads must keep their original position in the array.
      // For example, removing the first of two gamepads produces [null/undefined/false, gamepad].
      if (!JSEvents.lastGamepadState[index]) return -7;
  
      fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
      return 0;
    
  }
  

  var _emscripten_get_now = () => performance.timeOrigin + performance.now();

  
  
  function _emscripten_get_num_gamepads() {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(11, 0, 1);
  
      if (!JSEvents.lastGamepadState) throw 'emscripten_get_num_gamepads() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!';
      // N.B. Do not call emscripten_get_num_gamepads() unless having first called emscripten_sample_gamepad_data(), and that has returned EMSCRIPTEN_RESULT_SUCCESS.
      // Otherwise the following line will throw an exception.
      return JSEvents.lastGamepadState.length;
    
  }
  

  var getHeapMax = () =>
      HEAPU8.length;
  
  
  var abortOnCannotGrowMemory = (requestedSize) => {
      abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
    };
  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      abortOnCannotGrowMemory(requestedSize);
    };

  
  /** @suppress {checkTypes} */
  
  function _emscripten_sample_gamepad_data() {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(12, 0, 1);
  
      try {
        if (navigator.getGamepads) return (JSEvents.lastGamepadState = navigator.getGamepads())
          ? 0 : -1;
      } catch(e) {
        err(`navigator.getGamepads() exists, but failed to execute with exception ${e}. Disabling Gamepad access.`);
        navigator.getGamepads = null; // Disable getGamepads() so that it won't be attempted to be used again.
      }
      return -1;
    
  }
  

  
  
  var findCanvasEventTarget = findEventTarget;
  var setCanvasElementSizeCallingThread = (target, width, height) => {
      var canvas = findCanvasEventTarget(target);
      if (!canvas) return -4;
  
      if (!canvas.controlTransferredOffscreen) {
        var autoResizeViewport = false;
        if (canvas.GLctxObject?.GLctx) {
          var prevViewport = canvas.GLctxObject.GLctx.getParameter(0xBA2 /* GL_VIEWPORT */);
          // TODO: Perhaps autoResizeViewport should only be true if FBO 0 is currently active?
          autoResizeViewport = (prevViewport[0] === 0 && prevViewport[1] === 0 && prevViewport[2] === canvas.width && prevViewport[3] === canvas.height);
        }
        canvas.width = width;
        canvas.height = height;
        if (autoResizeViewport) {
          // TODO: Add -sCANVAS_RESIZE_SETS_GL_VIEWPORT=0/1 option (default=1). This is commonly done and several graphics engines depend on this,
          // but this can be quite disruptive.
          canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
        }
      } else {
        return -4;
      }
      return 0;
    };
  
  
  
  function setCanvasElementSizeMainThread(target, width, height) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(13, 0, 1, target, width, height);
  return setCanvasElementSizeCallingThread(target, width, height)
  }
  
  
  var _emscripten_set_canvas_element_size = (target, width, height) => {
      var canvas = findCanvasEventTarget(target);
      if (canvas) {
        return setCanvasElementSizeCallingThread(target, width, height);
      }
      return setCanvasElementSizeMainThread(target, width, height);
    };

  
  
  
  var fillMouseEventData = (eventStruct, e, target) => {
      assert(eventStruct % 4 == 0);
      HEAPF64[((eventStruct)>>3)] = e.timeStamp;
      var idx = ((eventStruct)>>2);
      HEAP32[idx + 2] = e.screenX;
      HEAP32[idx + 3] = e.screenY;
      HEAP32[idx + 4] = e.clientX;
      HEAP32[idx + 5] = e.clientY;
      HEAP8[eventStruct + 24] = e.ctrlKey;
      HEAP8[eventStruct + 25] = e.shiftKey;
      HEAP8[eventStruct + 26] = e.altKey;
      HEAP8[eventStruct + 27] = e.metaKey;
      HEAP16[idx*2 + 14] = e.button;
      HEAP16[idx*2 + 15] = e.buttons;
  
      HEAP32[idx + 8] = e["movementX"]
        ;
  
      HEAP32[idx + 9] = e["movementY"]
        ;
  
      // Note: rect contains doubles (truncated to placate SAFE_HEAP, which is the same behaviour when writing to HEAP32 anyway)
      var rect = getBoundingClientRect(target);
      HEAP32[idx + 10] = e.clientX - (rect.left | 0);
      HEAP32[idx + 11] = e.clientY - (rect.top  | 0);
  
    };
  
  
  var registerMouseEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
      targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
      JSEvents.mouseEvent ||= _malloc(64);
      target = findEventTarget(target);
  
      var mouseEventHandlerFunc = (e = event) => {
        // TODO: Make this access thread safe, or this could update live while app is reading it.
        fillMouseEventData(JSEvents.mouseEvent, e, target);
  
        if (targetThread) {
          var mouseEventData = _malloc(64); // This allocated block is passed as satellite data to the proxied function call, so the call frees up the data block when done.
          fillMouseEventData(mouseEventData, e, target);
          __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, mouseEventData, userData);
        } else
        if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault();
      };
  
      var eventHandler = {
        target,
        allowsDeferredCalls: eventTypeString != 'mousemove' && eventTypeString != 'mouseenter' && eventTypeString != 'mouseleave', // Mouse move events do not allow fullscreen/pointer lock requests to be handled in them!
        eventTypeString,
        callbackfunc,
        handlerFunc: mouseEventHandlerFunc,
        useCapture
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    };
  
  
  function _emscripten_set_click_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(14, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 4, "click", targetThread)
  }
  

  
  
  
  var fillFullscreenChangeEventData = (eventStruct) => {
      var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      var isFullscreen = !!fullscreenElement;
      // Assigning a boolean to HEAP32 with expected type coercion.
      /** @suppress{checkTypes} */
      HEAP8[eventStruct] = isFullscreen;
      HEAP8[(eventStruct)+(1)] = JSEvents.fullscreenEnabled();
      // If transitioning to fullscreen, report info about the element that is now fullscreen.
      // If transitioning to windowed mode, report info about the element that just was fullscreen.
      var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
      var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
      var id = reportedElement?.id || '';
      stringToUTF8(nodeName, eventStruct + 2, 128);
      stringToUTF8(id, eventStruct + 130, 128);
      HEAP32[(((eventStruct)+(260))>>2)] = reportedElement ? reportedElement.clientWidth : 0;
      HEAP32[(((eventStruct)+(264))>>2)] = reportedElement ? reportedElement.clientHeight : 0;
      HEAP32[(((eventStruct)+(268))>>2)] = screen.width;
      HEAP32[(((eventStruct)+(272))>>2)] = screen.height;
      if (isFullscreen) {
        JSEvents.previousFullscreenElement = fullscreenElement;
      }
    };
  
  
  var registerFullscreenChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
      targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
      JSEvents.fullscreenChangeEvent ||= _malloc(276);
  
      var fullscreenChangeEventhandlerFunc = (e = event) => {
        var fullscreenChangeEvent = targetThread ? _malloc(276) : JSEvents.fullscreenChangeEvent;
  
        fillFullscreenChangeEventData(fullscreenChangeEvent);
  
        if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, fullscreenChangeEvent, userData);
        else
        if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, fullscreenChangeEvent, userData)) e.preventDefault();
      };
  
      var eventHandler = {
        target,
        eventTypeString,
        callbackfunc,
        handlerFunc: fullscreenChangeEventhandlerFunc,
        useCapture
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    };
  
  
  
  
  function _emscripten_set_fullscreenchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(15, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  
      if (!JSEvents.fullscreenEnabled()) return -1;
      target = findEventTarget(target);
      if (!target) return -4;
  
      // Unprefixed Fullscreen API shipped in Chromium 71 (https://bugs.chromium.org/p/chromium/issues/detail?id=383813)
      // As of Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitfullscreenchange. TODO: revisit this check once Safari ships unprefixed version.
      registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread);
  
      return registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread);
    
  }
  

  
  
  
  var registerGamepadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
      targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
      JSEvents.gamepadEvent ||= _malloc(1240);
  
      var gamepadEventHandlerFunc = (e = event) => {
        var gamepadEvent = targetThread ? _malloc(1240) : JSEvents.gamepadEvent;
        fillGamepadEventData(gamepadEvent, e["gamepad"]);
  
        if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, gamepadEvent, userData);
        else
        if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, gamepadEvent, userData)) e.preventDefault();
      };
  
      var eventHandler = {
        target: findEventTarget(target),
        allowsDeferredCalls: true,
        eventTypeString,
        callbackfunc,
        handlerFunc: gamepadEventHandlerFunc,
        useCapture
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    };
  
  
  
  function _emscripten_set_gamepadconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(16, 0, 1, userData, useCapture, callbackfunc, targetThread);
  
      if (_emscripten_sample_gamepad_data()) return -1;
      return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread);
    
  }
  

  
  
  
  function _emscripten_set_gamepaddisconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(17, 0, 1, userData, useCapture, callbackfunc, targetThread);
  
      if (_emscripten_sample_gamepad_data()) return -1;
      return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread);
    
  }
  

  
  
  function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(18, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread)
  }
  

  
  
  
  var fillPointerlockChangeEventData = (eventStruct) => {
      var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
      var isPointerlocked = !!pointerLockElement;
      // Assigning a boolean to HEAP32 with expected type coercion.
      /** @suppress{checkTypes} */
      HEAP8[eventStruct] = isPointerlocked;
      var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
      var id = pointerLockElement?.id || '';
      stringToUTF8(nodeName, eventStruct + 1, 128);
      stringToUTF8(id, eventStruct + 129, 128);
    };
  
  
  var registerPointerlockChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
      targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
      JSEvents.pointerlockChangeEvent ||= _malloc(257);
  
      var pointerlockChangeEventHandlerFunc = (e = event) => {
        var pointerlockChangeEvent = targetThread ? _malloc(257) : JSEvents.pointerlockChangeEvent;
        fillPointerlockChangeEventData(pointerlockChangeEvent);
  
        if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, pointerlockChangeEvent, userData);
        else
        if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault();
      };
  
      var eventHandler = {
        target,
        eventTypeString,
        callbackfunc,
        handlerFunc: pointerlockChangeEventHandlerFunc,
        useCapture
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    };
  
  
  
  /** @suppress {missingProperties} */
  
  function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(19, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  
      // TODO: Currently not supported in pthreads or in --proxy-to-worker mode. (In pthreads mode, document object is not defined)
      if (!document || !document.body || (!document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock)) {
        return -1;
      }
  
      target = findEventTarget(target);
      if (!target) return -4;
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
      registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
      return registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread);
    
  }
  

  
  
  var registerUiEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
      targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
      JSEvents.uiEvent ||= _malloc(36);
  
      target = findEventTarget(target);
  
      var uiEventHandlerFunc = (e = event) => {
        if (e.target != target) {
          // Never take ui events such as scroll via a 'bubbled' route, but always from the direct element that
          // was targeted. Otherwise e.g. if app logs a message in response to a page scroll, the Emscripten log
          // message box could cause to scroll, generating a new (bubbled) scroll message, causing a new log print,
          // causing a new scroll, etc..
          return;
        }
        var b = document.body; // Take document.body to a variable, Closure compiler does not outline access to it on its own.
        if (!b) {
          // During a page unload 'body' can be null, with "Cannot read property 'clientWidth' of null" being thrown
          return;
        }
        var uiEvent = targetThread ? _malloc(36) : JSEvents.uiEvent;
        HEAP32[((uiEvent)>>2)] = 0; // always zero for resize and scroll
        HEAP32[(((uiEvent)+(4))>>2)] = b.clientWidth;
        HEAP32[(((uiEvent)+(8))>>2)] = b.clientHeight;
        HEAP32[(((uiEvent)+(12))>>2)] = innerWidth;
        HEAP32[(((uiEvent)+(16))>>2)] = innerHeight;
        HEAP32[(((uiEvent)+(20))>>2)] = outerWidth;
        HEAP32[(((uiEvent)+(24))>>2)] = outerHeight;
        HEAP32[(((uiEvent)+(28))>>2)] = pageXOffset | 0; // scroll offsets are float
        HEAP32[(((uiEvent)+(32))>>2)] = pageYOffset | 0;
        if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, uiEvent, userData);
        else
        if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, uiEvent, userData)) e.preventDefault();
      };
  
      var eventHandler = {
        target,
        eventTypeString,
        callbackfunc,
        handlerFunc: uiEventHandlerFunc,
        useCapture
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    };
  
  
  function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(20, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread)
  }
  

  
  
  
  var registerTouchEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
      targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
      JSEvents.touchEvent ||= _malloc(1552);
  
      target = findEventTarget(target);
  
      var touchEventHandlerFunc = (e) => {
        assert(e);
        var t, touches = {}, et = e.touches;
        // To ease marshalling different kinds of touches that browser reports (all touches are listed in e.touches,
        // only changed touches in e.changedTouches, and touches on target at a.targetTouches), mark a boolean in
        // each Touch object so that we can later loop only once over all touches we see to marshall over to Wasm.
  
        for (let t of et) {
          // Browser might recycle the generated Touch objects between each frame (Firefox on Android), so reset any
          // changed/target states we may have set from previous frame.
          t.isChanged = t.onTarget = 0;
          touches[t.identifier] = t;
        }
        // Mark which touches are part of the changedTouches list.
        for (let t of e.changedTouches) {
          t.isChanged = 1;
          touches[t.identifier] = t;
        }
        // Mark which touches are part of the targetTouches list.
        for (let t of e.targetTouches) {
          touches[t.identifier].onTarget = 1;
        }
  
        var touchEvent = targetThread ? _malloc(1552) : JSEvents.touchEvent;
        HEAPF64[((touchEvent)>>3)] = e.timeStamp;
        HEAP8[touchEvent + 12] = e.ctrlKey;
        HEAP8[touchEvent + 13] = e.shiftKey;
        HEAP8[touchEvent + 14] = e.altKey;
        HEAP8[touchEvent + 15] = e.metaKey;
        var idx = touchEvent + 16;
        var targetRect = getBoundingClientRect(target);
        var numTouches = 0;
        for (let t of Object.values(touches)) {
          var idx32 = ((idx)>>2); // Pre-shift the ptr to index to HEAP32 to save code size
          HEAP32[idx32 + 0] = t.identifier;
          HEAP32[idx32 + 1] = t.screenX;
          HEAP32[idx32 + 2] = t.screenY;
          HEAP32[idx32 + 3] = t.clientX;
          HEAP32[idx32 + 4] = t.clientY;
          HEAP32[idx32 + 5] = t.pageX;
          HEAP32[idx32 + 6] = t.pageY;
          HEAP8[idx + 28] = t.isChanged;
          HEAP8[idx + 29] = t.onTarget;
          HEAP32[idx32 + 8] = t.clientX - (targetRect.left | 0);
          HEAP32[idx32 + 9] = t.clientY - (targetRect.top  | 0);
  
          idx += 48;
  
          if (++numTouches > 31) {
            break;
          }
        }
        HEAP32[(((touchEvent)+(8))>>2)] = numTouches;
  
        if (targetThread) __emscripten_run_callback_on_thread(targetThread, callbackfunc, eventTypeId, touchEvent, userData);
        else
        if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, touchEvent, userData)) e.preventDefault();
      };
  
      var eventHandler = {
        target,
        allowsDeferredCalls: eventTypeString == 'touchstart' || eventTypeString == 'touchend',
        eventTypeString,
        callbackfunc,
        handlerFunc: touchEventHandlerFunc,
        useCapture
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    };
  
  
  function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(21, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread)
  }
  

  
  
  function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(22, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread)
  }
  

  
  
  function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(23, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread)
  }
  

  
  
  function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(24, 0, 1, target, userData, useCapture, callbackfunc, targetThread);
  return registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread)
  }
  

  
  
  
  var runtimeKeepalivePop = () => {
      assert(runtimeKeepaliveCounter > 0);
      runtimeKeepaliveCounter -= 1;
    };
  /** @param {number=} timeout */
  var safeSetTimeout = (func, timeout) => {
      runtimeKeepalivePush();
      return setTimeout(() => {
        runtimeKeepalivePop();
        callUserCallback(func);
      }, timeout);
    };
  
  
  
  var Browser = {
  useWebGL:false,
  isFullscreen:false,
  pointerLock:false,
  moduleContextCreatedCallbacks:[],
  workers:[],
  init() {
        if (Browser.initted) return;
        Browser.initted = true;
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module['noImageDecoding'] && /\.(jpg|jpeg|png|bmp|webp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          if (b.size !== byteArray.length) { // Safari bug #118630
            // Safari's Blob can only take an ArrayBuffer
            b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
          }
          var url = URL.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = () => {
            assert(img.complete, `Image ${name} could not be decoded`);
            var canvas = /** @type {!HTMLCanvasElement} */ (document.createElement('canvas'));
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            preloadedImages[name] = canvas;
            URL.revokeObjectURL(url);
            onload?.(byteArray);
          };
          img.onerror = (event) => {
            err(`Image ${url} could not be decoded`);
            onerror?.();
          };
          img.src = url;
        };
        preloadPlugins.push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module['noAudioDecoding'] && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            preloadedAudios[name] = audio;
            onload?.(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            preloadedAudios[name] = new Audio(); // empty shim
            onerror?.();
          }
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          var url = URL.createObjectURL(b); // XXX we never revoke this!
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var audio = new Audio();
          audio.addEventListener('canplaythrough', () => finish(audio), false); // use addEventListener due to chromium bug 124926
          audio.onerror = function audio_onerror(event) {
            if (done) return;
            err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);
            function encode64(data) {
              var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              var PAD = '=';
              var ret = '';
              var leftchar = 0;
              var leftbits = 0;
              for (var i = 0; i < data.length; i++) {
                leftchar = (leftchar << 8) | data[i];
                leftbits += 8;
                while (leftbits >= 6) {
                  var curr = (leftchar >> (leftbits-6)) & 0x3f;
                  leftbits -= 6;
                  ret += BASE[curr];
                }
              }
              if (leftbits == 2) {
                ret += BASE[(leftchar&3) << 4];
                ret += PAD + PAD;
              } else if (leftbits == 4) {
                ret += BASE[(leftchar&0xf) << 2];
                ret += PAD;
              }
              return ret;
            }
            audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
            finish(audio); // we don't wait for confirmation this worked - but it's worth trying
          };
          audio.src = url;
          // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
          safeSetTimeout(() => {
            finish(audio); // try to use it even though it is not necessarily ready to play
          }, 10000);
        };
        preloadPlugins.push(audioPlugin);
  
        // Canvas event setup
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === Module['canvas'] ||
                                document['mozPointerLockElement'] === Module['canvas'] ||
                                document['webkitPointerLockElement'] === Module['canvas'] ||
                                document['msPointerLockElement'] === Module['canvas'];
        }
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
  
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      (() => {});
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   (() => {}); // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", (ev) => {
              if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                Module['canvas'].requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },
  createContext(/** @type {HTMLCanvasElement} */ canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false,
            majorVersion: 2,
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
          // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
          // Browser.createContext() should not even be emitted.
          if (typeof GL != 'undefined') {
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
              ctx = GL.getContext(contextHandle).GLctx;
            }
          }
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx == 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Browser.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach((callback) => callback());
          Browser.init();
        }
        return ctx;
      },
  fullscreenHandlersInstalled:false,
  lockPointer:undefined,
  resizeCanvas:undefined,
  requestFullscreen(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
               document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
  
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          Module['onFullScreen']?.(Browser.isFullscreen);
          Module['onFullscreen']?.(Browser.isFullscreen);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullscreen'] ? () => canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) : null) ||
                                           (canvasContainer['webkitRequestFullScreen'] ? () => canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) : null);
  
        canvasContainer.requestFullscreen();
      },
  requestFullScreen() {
        abort('Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)');
      },
  exitFullscreen() {
        // This is workaround for chrome. Trying to exit from fullscreen
        // not in fullscreen state will cause "TypeError: Document not active"
        // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
        if (!Browser.isFullscreen) {
          return false;
        }
  
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['msExitFullscreen'] ||
                  document['webkitCancelFullScreen'] ||
            (() => {});
        CFS.apply(document, []);
        return true;
      },
  safeSetTimeout(func, timeout) {
        // Legacy function, this is used by the SDL2 port so we need to keep it
        // around at least until that is updated.
        // See https://github.com/libsdl-org/SDL/pull/6304
        return safeSetTimeout(func, timeout);
      },
  getMimetype(name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },
  getUserMedia(func) {
        window.getUserMedia ||= navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        window.getUserMedia(func);
      },
  getMovementX(event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },
  getMovementY(event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },
  getMouseWheelDelta(event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll':
            // 3 lines make up a step
            delta = event.detail / 3;
            break;
          case 'mousewheel':
            // 120 units make up a step
            delta = event.wheelDelta / 120;
            break;
          case 'wheel':
            delta = event.deltaY
            switch (event.deltaMode) {
              case 0:
                // DOM_DELTA_PIXEL: 100 pixels make up a step
                delta /= 100;
                break;
              case 1:
                // DOM_DELTA_LINE: 3 lines make up a step
                delta /= 3;
                break;
              case 2:
                // DOM_DELTA_PAGE: A page makes up 80 steps
                delta *= 80;
                break;
              default:
                throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
            }
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },
  mouseX:0,
  mouseY:0,
  mouseMovementX:0,
  mouseMovementY:0,
  touches:{
  },
  lastTouches:{
  },
  calculateMouseCoords(pageX, pageY) {
        // Calculate the movement based on the changes
        // in the coordinates.
        var rect = Module["canvas"].getBoundingClientRect();
        var cw = Module["canvas"].width;
        var ch = Module["canvas"].height;
  
        // Neither .scrollX or .pageXOffset are defined in a spec, but
        // we prefer .scrollX because it is currently in a spec draft.
        // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
        var scrollX = ((typeof window.scrollX != 'undefined') ? window.scrollX : window.pageXOffset);
        var scrollY = ((typeof window.scrollY != 'undefined') ? window.scrollY : window.pageYOffset);
        // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
        // and we have no viable fallback.
        assert((typeof scrollX != 'undefined') && (typeof scrollY != 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
        var adjustedX = pageX - (scrollX + rect.left);
        var adjustedY = pageY - (scrollY + rect.top);
  
        // the canvas might be CSS-scaled compared to its backbuffer;
        // SDL-using content will want mouse coordinates in terms
        // of backbuffer units.
        adjustedX = adjustedX * (cw / rect.width);
        adjustedY = adjustedY * (ch / rect.height);
  
        return { x: adjustedX, y: adjustedY };
      },
  setMouseCoords(pageX, pageY) {
        const {x, y} = Browser.calculateMouseCoords(pageX, pageY);
        Browser.mouseMovementX = x - Browser.mouseX;
        Browser.mouseMovementY = y - Browser.mouseY;
        Browser.mouseX = x;
        Browser.mouseY = y;
      },
  calculateMouseEvent(event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
  
          // add the mouse delta to the current absolute mouse position
          Browser.mouseX += Browser.mouseMovementX;
          Browser.mouseY += Browser.mouseMovementY;
        } else {
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
  
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              last ||= coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
  
          Browser.setMouseCoords(event.pageX, event.pageY);
        }
      },
  resizeListeners:[],
  updateResizeListeners() {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach((listener) => listener(canvas.width, canvas.height));
      },
  setCanvasSize(width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },
  windowedWidth:0,
  windowedHeight:0,
  setFullscreenCanvasSize() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags;
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },
  setWindowedCanvasSize() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags;
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },
  updateCanvasDimensions(canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
             document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },
  };
  
  
  
  function _emscripten_set_window_title(title) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(25, 0, 1, title);
  return document.title = UTF8ToString(title)
  }
  

  var _emscripten_sleep = (ms) => {
      // emscripten_sleep() does not return a value, but we still need a |return|
      // here for stack switching support (ASYNCIFY=2). In that mode this function
      // returns a Promise instead of nothing, and that Promise is what tells the
      // wasm VM to pause the stack.
      return Asyncify.handleSleep((wakeUp) => safeSetTimeout(wakeUp, ms));
    };
  _emscripten_sleep.isAsync = true;


  
  
  function _fd_close(fd) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(26, 0, 1, fd);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  

  /** @param {number=} offset */
  var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  
  
  function _fd_read(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(27, 0, 1, fd, iov, iovcnt, pnum);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  

  
  
  
  function _fd_seek(fd,offset_low, offset_high,whence,newOffset) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(28, 0, 1, fd,offset_low, offset_high,whence,newOffset);
  
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble = stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  
  }
  

  /** @param {number=} offset */
  var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
          // No more space to write.
          break;
        }
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  
  
  function _fd_write(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(29, 0, 1, fd, iov, iovcnt, pnum);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  

  var GLctx;
  
  
  
  var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = (ctx) =>
      // Closure is expected to be allowed to minify the '.dibvbi' property, so not accessing it quoted.
      !!(ctx.dibvbi = ctx.getExtension('WEBGL_draw_instanced_base_vertex_base_instance'));
  
  var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = (ctx) => {
      // Closure is expected to be allowed to minify the '.mdibvbi' property, so not accessing it quoted.
      return !!(ctx.mdibvbi = ctx.getExtension('WEBGL_multi_draw_instanced_base_vertex_base_instance'));
    };
  
  var webgl_enable_EXT_polygon_offset_clamp = (ctx) => {
      return !!(ctx.extPolygonOffsetClamp = ctx.getExtension('EXT_polygon_offset_clamp'));
    };
  
  var webgl_enable_EXT_clip_control = (ctx) => {
      return !!(ctx.extClipControl = ctx.getExtension('EXT_clip_control'));
    };
  
  var webgl_enable_WEBGL_polygon_mode = (ctx) => {
      return !!(ctx.webglPolygonMode = ctx.getExtension('WEBGL_polygon_mode'));
    };
  
  var webgl_enable_WEBGL_multi_draw = (ctx) => {
      // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
      return !!(ctx.multiDrawWebgl = ctx.getExtension('WEBGL_multi_draw'));
    };
  
  var getEmscriptenSupportedExtensions = (ctx) => {
      // Restrict the list of advertised extensions to those that we actually
      // support.
      var supportedExtensions = [
        // WebGL 2 extensions
        'EXT_color_buffer_float',
        'EXT_conservative_depth',
        'EXT_disjoint_timer_query_webgl2',
        'EXT_texture_norm16',
        'NV_shader_noperspective_interpolation',
        'WEBGL_clip_cull_distance',
        // WebGL 1 and WebGL 2 extensions
        'EXT_clip_control',
        'EXT_color_buffer_half_float',
        'EXT_depth_clamp',
        'EXT_float_blend',
        'EXT_polygon_offset_clamp',
        'EXT_texture_compression_bptc',
        'EXT_texture_compression_rgtc',
        'EXT_texture_filter_anisotropic',
        'KHR_parallel_shader_compile',
        'OES_texture_float_linear',
        'WEBGL_blend_func_extended',
        'WEBGL_compressed_texture_astc',
        'WEBGL_compressed_texture_etc',
        'WEBGL_compressed_texture_etc1',
        'WEBGL_compressed_texture_s3tc',
        'WEBGL_compressed_texture_s3tc_srgb',
        'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders',
        'WEBGL_lose_context',
        'WEBGL_multi_draw',
        'WEBGL_polygon_mode'
      ];
      // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
      return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext));
    };
  
  
  var GL = {
  counter:1,
  buffers:[],
  programs:[],
  framebuffers:[],
  renderbuffers:[],
  textures:[],
  shaders:[],
  vaos:[],
  contexts:{
  },
  offscreenCanvases:{
  },
  queries:[],
  samplers:[],
  transformFeedbacks:[],
  syncs:[],
  stringCache:{
  },
  stringiCache:{
  },
  unpackAlignment:4,
  unpackRowLength:0,
  recordError:(errorCode) => {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },
  getNewId:(table) => {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },
  genObject:(n, buffers, createFunction, objectTable
        ) => {
        for (var i = 0; i < n; i++) {
          var buffer = GLctx[createFunction]();
          var id = buffer && GL.getNewId(objectTable);
          if (buffer) {
            buffer.name = id;
            objectTable[id] = buffer;
          } else {
            GL.recordError(0x502 /* GL_INVALID_OPERATION */);
          }
          HEAP32[(((buffers)+(i*4))>>2)] = id;
        }
      },
  getSource:(shader, count, string, length) => {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var len = length ? HEAPU32[(((length)+(i*4))>>2)] : undefined;
          source += UTF8ToString(HEAPU32[(((string)+(i*4))>>2)], len);
        }
        return source;
      },
  createContext:(/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
  
        // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL
        // context on a canvas, calling .getContext() will always return that
        // context independent of which 'webgl' or 'webgl2'
        // context version was passed. See:
        //   https://bugs.webkit.org/show_bug.cgi?id=222758
        // and:
        //   https://github.com/emscripten-core/emscripten/issues/13295.
        // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari
        // version field in above check.
        if (!canvas.getContextSafariWebGL2Fixed) {
          canvas.getContextSafariWebGL2Fixed = canvas.getContext;
          /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */
          function fixedGetContext(ver, attrs) {
            var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
            return ((ver == 'webgl') == (gl instanceof WebGLRenderingContext)) ? gl : null;
          }
          canvas.getContext = fixedGetContext;
        }
  
        var ctx = canvas.getContext("webgl2", webGLContextAttributes);
  
        if (!ctx) return 0;
  
        var handle = GL.registerContext(ctx, webGLContextAttributes);
  
        return handle;
      },
  registerContext:(ctx, webGLContextAttributes) => {
        // with pthreads a context is a location in memory with some synchronized
        // data between threads
        var handle = _malloc(8);
        HEAPU32[(((handle)+(4))>>2)] = _pthread_self(); // the thread pointer of the thread that owns the control of the context
  
        var context = {
          handle,
          attributes: webGLContextAttributes,
          version: webGLContextAttributes.majorVersion,
          GLctx: ctx
        };
  
        // Store the created context object so that we can access the context
        // given a canvas without having to pass the parameters again.
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes.enableExtensionsByDefault == 'undefined' || webGLContextAttributes.enableExtensionsByDefault) {
          GL.initExtensions(context);
        }
  
        return handle;
      },
  makeContextCurrent:(contextHandle) => {
  
        // Active Emscripten GL layer context object.
        GL.currentContext = GL.contexts[contextHandle];
        // Active WebGL context object.
        Module.ctx = GLctx = GL.currentContext?.GLctx;
        return !(contextHandle && !GLctx);
      },
  getContext:(contextHandle) => {
        return GL.contexts[contextHandle];
      },
  deleteContext:(contextHandle) => {
        if (GL.currentContext === GL.contexts[contextHandle]) {
          GL.currentContext = null;
        }
        if (typeof JSEvents == 'object') {
          // Release all JS event handlers on the DOM element that the GL context is
          // associated with since the context is now deleted.
          JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
        }
        // Make sure the canvas object no longer refers to the context object so
        // there are no GC surprises.
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) {
          GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        }
        _free(GL.contexts[contextHandle].handle);
        GL.contexts[contextHandle] = null;
      },
  initExtensions:(context) => {
        // If this function is called without a specific context object, init the
        // extensions of the currently active context.
        context ||= GL.currentContext;
  
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
  
        var GLctx = context.GLctx;
  
        // Detect the presence of a few extensions manually, ction GL interop
        // layer itself will need to know if they exist.
  
        // Extensions that are available in both WebGL 1 and WebGL 2
        webgl_enable_WEBGL_multi_draw(GLctx);
        webgl_enable_EXT_polygon_offset_clamp(GLctx);
        webgl_enable_EXT_clip_control(GLctx);
        webgl_enable_WEBGL_polygon_mode(GLctx);
        // Extensions that are available from WebGL >= 2 (no-op if called on a WebGL 1 context active)
        webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
        webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
  
        // On WebGL 2, EXT_disjoint_timer_query is replaced with an alternative
        // that's based on core APIs, and exposes only the queryCounterEXT()
        // entrypoint.
        if (context.version >= 2) {
          GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
        }
  
        // However, Firefox exposes the WebGL 1 version on WebGL 2 as well and
        // thus we look for the WebGL 1 version again if the WebGL 2 version
        // isn't present. https://bugzilla.mozilla.org/show_bug.cgi?id=1328882
        if (context.version < 2 || !GLctx.disjointTimerQueryExt)
        {
          GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
        }
  
        getEmscriptenSupportedExtensions(GLctx).forEach((ext) => {
          // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders
          // are not enabled by default.
          if (!ext.includes('lose_context') && !ext.includes('debug')) {
            // Call .getExtension() to enable that extension permanently.
            GLctx.getExtension(ext);
          }
        });
      },
  };
  var _glActiveTexture = (x0) => GLctx.activeTexture(x0);

  var _glAttachShader = (program, shader) => {
      GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
    };

  
  var _glBindAttribLocation = (program, index, name) => {
      GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
    };

  var _glBindBuffer = (target, buffer) => {
  
      if (target == 0x88EB /*GL_PIXEL_PACK_BUFFER*/) {
        // In WebGL 2 glReadPixels entry point, we need to use a different WebGL 2
        // API function call when a buffer is bound to
        // GL_PIXEL_PACK_BUFFER_BINDING point, so must keep track whether that
        // binding point is non-null to know what is the proper API function to
        // call.
        GLctx.currentPixelPackBufferBinding = buffer;
      } else if (target == 0x88EC /*GL_PIXEL_UNPACK_BUFFER*/) {
        // In WebGL 2 gl(Compressed)Tex(Sub)Image[23]D entry points, we need to
        // use a different WebGL 2 API function call when a buffer is bound to
        // GL_PIXEL_UNPACK_BUFFER_BINDING point, so must keep track whether that
        // binding point is non-null to know what is the proper API function to
        // call.
        GLctx.currentPixelUnpackBufferBinding = buffer;
      }
      GLctx.bindBuffer(target, GL.buffers[buffer]);
    };

  var _glBindTexture = (target, texture) => {
      GLctx.bindTexture(target, GL.textures[texture]);
    };

  var _glBindVertexArray = (vao) => {
      GLctx.bindVertexArray(GL.vaos[vao]);
    };

  var _glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);

  var _glBufferData = (target, size, data, usage) => {
  
      if (true) {
        // If size is zero, WebGL would interpret uploading the whole input
        // arraybuffer (starting from given offset), which would not make sense in
        // WebAssembly, so avoid uploading if size is zero. However we must still
        // call bufferData to establish a backing storage of zero bytes.
        if (data && size) {
          GLctx.bufferData(target, HEAPU8, usage, data, size);
        } else {
          GLctx.bufferData(target, size, usage);
        }
        return;
      }
    };

  var _glBufferSubData = (target, offset, size, data) => {
      if (true) {
        size && GLctx.bufferSubData(target, offset, HEAPU8, data, size);
        return;
      }
    };

  var _glClear = (x0) => GLctx.clear(x0);

  var _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);

  var _glClearDepthf = (x0) => GLctx.clearDepth(x0);

  var _glCompileShader = (shader) => {
      GLctx.compileShader(GL.shaders[shader]);
    };

  var _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => {
      // `data` may be null here, which means "allocate uniniitalized space but
      // don't upload" in GLES parlance, but `compressedTexImage2D` requires the
      // final data parameter, so we simply pass a heap view starting at zero
      // effectively uploading whatever happens to be near address zero.  See
      // https://github.com/emscripten-core/emscripten/issues/19300.
      if (true) {
        if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
          GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data);
          return;
        }
        GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, HEAPU8, data, imageSize);
        return;
      }
    };

  var _glCreateProgram = () => {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      // Store additional information needed for each shader program:
      program.name = id;
      // Lazy cache results of
      // glGetProgramiv(GL_ACTIVE_UNIFORM_MAX_LENGTH/GL_ACTIVE_ATTRIBUTE_MAX_LENGTH/GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH)
      program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
      program.uniformIdCounter = 1;
      GL.programs[id] = program;
      return id;
    };

  var _glCreateShader = (shaderType) => {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
  
      return id;
    };

  var _glCullFace = (x0) => GLctx.cullFace(x0);

  var _glDeleteBuffers = (n, buffers) => {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        var buffer = GL.buffers[id];
  
        // From spec: "glDeleteBuffers silently ignores 0's and names that do not
        // correspond to existing buffer objects."
        if (!buffer) continue;
  
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
  
        if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
        if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
      }
    };

  var _glDeleteProgram = (id) => {
      if (!id) return;
      var program = GL.programs[id];
      if (!program) {
        // glDeleteProgram actually signals an error when deleting a nonexisting
        // object, unlike some other GL delete functions.
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
    };

  var _glDeleteShader = (id) => {
      if (!id) return;
      var shader = GL.shaders[id];
      if (!shader) {
        // glDeleteShader actually signals an error when deleting a nonexisting
        // object, unlike some other GL delete functions.
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    };

  var _glDeleteTextures = (n, textures) => {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        var texture = GL.textures[id];
        // GL spec: "glDeleteTextures silently ignores 0s and names that do not
        // correspond to existing textures".
        if (!texture) continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    };

  var _glDeleteVertexArrays = (n, vaos) => {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((vaos)+(i*4))>>2)];
        GLctx.deleteVertexArray(GL.vaos[id]);
        GL.vaos[id] = null;
      }
    };

  var _glDepthFunc = (x0) => GLctx.depthFunc(x0);

  var _glDetachShader = (program, shader) => {
      GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
    };

  var _glDisable = (x0) => GLctx.disable(x0);

  var _glDisableVertexAttribArray = (index) => {
      GLctx.disableVertexAttribArray(index);
    };

  var _glDrawArrays = (mode, first, count) => {
  
      GLctx.drawArrays(mode, first, count);
  
    };

  var _glDrawElements = (mode, count, type, indices) => {
  
      GLctx.drawElements(mode, count, type, indices);
  
    };

  var _glEnable = (x0) => GLctx.enable(x0);

  var _glEnableVertexAttribArray = (index) => {
      GLctx.enableVertexAttribArray(index);
    };

  var _glFrontFace = (x0) => GLctx.frontFace(x0);

  var _glGenBuffers = (n, buffers) => {
      GL.genObject(n, buffers, 'createBuffer', GL.buffers
        );
    };

  var _glGenTextures = (n, textures) => {
      GL.genObject(n, textures, 'createTexture', GL.textures
        );
    };

  var _glGenVertexArrays = (n, arrays) => {
      GL.genObject(n, arrays, 'createVertexArray', GL.vaos
        );
    };

  
  var _glGetAttribLocation = (program, name) => {
      return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
    };

  var readI53FromI64 = (ptr) => {
      return HEAPU32[((ptr)>>2)] + HEAP32[(((ptr)+(4))>>2)] * 4294967296;
    };
  
  var readI53FromU64 = (ptr) => {
      return HEAPU32[((ptr)>>2)] + HEAPU32[(((ptr)+(4))>>2)] * 4294967296;
    };
  var writeI53ToI64 = (ptr, num) => {
      HEAPU32[((ptr)>>2)] = num;
      var lower = HEAPU32[((ptr)>>2)];
      HEAPU32[(((ptr)+(4))>>2)] = (num - lower)/4294967296;
      var deserialized = (num >= 0) ? readI53FromU64(ptr) : readI53FromI64(ptr);
      var offset = ((ptr)>>2);
      if (deserialized != num) warnOnce(`writeI53ToI64() out of range: serialized JS Number ${num} to Wasm heap as bytes lo=${ptrToString(HEAPU32[offset])}, hi=${ptrToString(HEAPU32[offset+1])}, which deserializes back to ${deserialized} instead!`);
    };
  
  
  var webglGetExtensions = function $webglGetExtensions() {
      var exts = getEmscriptenSupportedExtensions(GLctx);
      exts = exts.concat(exts.map((e) => "GL_" + e));
      return exts;
    };
  
  var emscriptenWebGLGet = (name_, p, type) => {
      // Guard against user passing a null pointer.
      // Note that GLES2 spec does not say anything about how passing a null
      // pointer should be treated.  Testing on desktop core GL 3, the application
      // crashes on glGetIntegerv to a null pointer, but better to report an error
      // instead of doing anything random.
      if (!p) {
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
        return;
      }
      var ret = undefined;
      switch (name_) { // Handle a few trivial GLES values
        case 0x8DFA: // GL_SHADER_COMPILER
          ret = 1;
          break;
        case 0x8DF8: // GL_SHADER_BINARY_FORMATS
          if (type != 0 && type != 1) {
            GL.recordError(0x500); // GL_INVALID_ENUM
          }
          // Do not write anything to the out pointer, since no binary formats are
          // supported.
          return;
        case 0x87FE: // GL_NUM_PROGRAM_BINARY_FORMATS
        case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
          ret = 0;
          break;
        case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
          // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete
          // since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be
          // queried for length), so implement it ourselves to allow C++ GLES2
          // code get the length.
          var formats = GLctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
          ret = formats ? formats.length : 0;
          break;
  
        case 0x821D: // GL_NUM_EXTENSIONS
          if (GL.currentContext.version < 2) {
            // Calling GLES3/WebGL2 function with a GLES2/WebGL1 context
            GL.recordError(0x502 /* GL_INVALID_OPERATION */);
            return;
          }
          ret = webglGetExtensions().length;
          break;
        case 0x821B: // GL_MAJOR_VERSION
        case 0x821C: // GL_MINOR_VERSION
          if (GL.currentContext.version < 2) {
            GL.recordError(0x500); // GL_INVALID_ENUM
            return;
          }
          ret = name_ == 0x821B ? 3 : 0; // return version 3.0
          break;
      }
  
      if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
          case "number":
            ret = result;
            break;
          case "boolean":
            ret = result ? 1 : 0;
            break;
          case "string":
            GL.recordError(0x500); // GL_INVALID_ENUM
            return;
          case "object":
            if (result === null) {
              // null is a valid result for some (e.g., which buffer is bound -
              // perhaps nothing is bound), but otherwise can mean an invalid
              // name_, which we need to report as an error
              switch (name_) {
                case 0x8894: // ARRAY_BUFFER_BINDING
                case 0x8B8D: // CURRENT_PROGRAM
                case 0x8895: // ELEMENT_ARRAY_BUFFER_BINDING
                case 0x8CA6: // FRAMEBUFFER_BINDING or DRAW_FRAMEBUFFER_BINDING
                case 0x8CA7: // RENDERBUFFER_BINDING
                case 0x8069: // TEXTURE_BINDING_2D
                case 0x85B5: // WebGL 2 GL_VERTEX_ARRAY_BINDING, or WebGL 1 extension OES_vertex_array_object GL_VERTEX_ARRAY_BINDING_OES
                case 0x8F36: // COPY_READ_BUFFER_BINDING or COPY_READ_BUFFER
                case 0x8F37: // COPY_WRITE_BUFFER_BINDING or COPY_WRITE_BUFFER
                case 0x88ED: // PIXEL_PACK_BUFFER_BINDING
                case 0x88EF: // PIXEL_UNPACK_BUFFER_BINDING
                case 0x8CAA: // READ_FRAMEBUFFER_BINDING
                case 0x8919: // SAMPLER_BINDING
                case 0x8C1D: // TEXTURE_BINDING_2D_ARRAY
                case 0x806A: // TEXTURE_BINDING_3D
                case 0x8E25: // TRANSFORM_FEEDBACK_BINDING
                case 0x8C8F: // TRANSFORM_FEEDBACK_BUFFER_BINDING
                case 0x8A28: // UNIFORM_BUFFER_BINDING
                case 0x8514: { // TEXTURE_BINDING_CUBE_MAP
                  ret = 0;
                  break;
                }
                default: {
                  GL.recordError(0x500); // GL_INVALID_ENUM
                  return;
                }
              }
            } else if (result instanceof Float32Array ||
                       result instanceof Uint32Array ||
                       result instanceof Int32Array ||
                       result instanceof Array) {
              for (var i = 0; i < result.length; ++i) {
                switch (type) {
                  case 0: HEAP32[(((p)+(i*4))>>2)] = result[i]; break;
                  case 2: HEAPF32[(((p)+(i*4))>>2)] = result[i]; break;
                  case 4: HEAP8[(p)+(i)] = result[i] ? 1 : 0; break;
                }
              }
              return;
            } else {
              try {
                ret = result.name | 0;
              } catch(e) {
                GL.recordError(0x500); // GL_INVALID_ENUM
                err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
                return;
              }
            }
            break;
          default:
            GL.recordError(0x500); // GL_INVALID_ENUM
            err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof(result)}!`);
            return;
        }
      }
  
      switch (type) {
        case 1: writeI53ToI64(p, ret); break;
        case 0: HEAP32[((p)>>2)] = ret; break;
        case 2:   HEAPF32[((p)>>2)] = ret; break;
        case 4: HEAP8[p] = ret ? 1 : 0; break;
      }
    };
  
  var _glGetFloatv = (name_, p) => emscriptenWebGLGet(name_, p, 2);

  
  var _glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);

  var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null) log = '(unknown error)';
      var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length) HEAP32[((length)>>2)] = numBytesWrittenExclNull;
    };

  var _glGetProgramiv = (program, pname, p) => {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null
        // pointer. Since calling this function does not make sense if p == null,
        // issue a GL error to notify user about it.
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
        return;
      }
  
      if (program >= GL.counter) {
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
        return;
      }
  
      program = GL.programs[program];
  
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getProgramInfoLog(program);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)] = log.length + 1;
      } else if (pname == 0x8B87 /* GL_ACTIVE_UNIFORM_MAX_LENGTH */) {
        if (!program.maxUniformLength) {
          var numActiveUniforms = GLctx.getProgramParameter(program, 0x8B86/*GL_ACTIVE_UNIFORMS*/);
          for (var i = 0; i < numActiveUniforms; ++i) {
            program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length+1);
          }
        }
        HEAP32[((p)>>2)] = program.maxUniformLength;
      } else if (pname == 0x8B8A /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */) {
        if (!program.maxAttributeLength) {
          var numActiveAttributes = GLctx.getProgramParameter(program, 0x8B89/*GL_ACTIVE_ATTRIBUTES*/);
          for (var i = 0; i < numActiveAttributes; ++i) {
            program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length+1);
          }
        }
        HEAP32[((p)>>2)] = program.maxAttributeLength;
      } else if (pname == 0x8A35 /* GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH */) {
        if (!program.maxUniformBlockNameLength) {
          var numActiveUniformBlocks = GLctx.getProgramParameter(program, 0x8A36/*GL_ACTIVE_UNIFORM_BLOCKS*/);
          for (var i = 0; i < numActiveUniformBlocks; ++i) {
            program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length+1);
          }
        }
        HEAP32[((p)>>2)] = program.maxUniformBlockNameLength;
      } else {
        HEAP32[((p)>>2)] = GLctx.getProgramParameter(program, pname);
      }
    };

  
  var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null) log = '(unknown error)';
      var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length) HEAP32[((length)>>2)] = numBytesWrittenExclNull;
    };

  var _glGetShaderiv = (shader, pname, p) => {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null
        // pointer. Since calling this function does not make sense if p == null,
        // issue a GL error to notify user about it.
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = '(unknown error)';
        // The GLES2 specification says that if the shader has an empty info log,
        // a value of 0 is returned. Otherwise the log has a null char appended.
        // (An empty string is falsey, so we can just check that instead of
        // looking at log.length.)
        var logLength = log ? log.length + 1 : 0;
        HEAP32[((p)>>2)] = logLength;
      } else if (pname == 0x8B88) { // GL_SHADER_SOURCE_LENGTH
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        // source may be a null, or the empty string, both of which are falsey
        // values that we report a 0 length for.
        var sourceLength = source ? source.length + 1 : 0;
        HEAP32[((p)>>2)] = sourceLength;
      } else {
        HEAP32[((p)>>2)] = GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    };

  
  
  var stringToNewUTF8 = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8(str, ret, size);
      return ret;
    };
  
  
  var _glGetString = (name_) => {
      var ret = GL.stringCache[name_];
      if (!ret) {
        switch (name_) {
          case 0x1F03 /* GL_EXTENSIONS */:
            ret = stringToNewUTF8(webglGetExtensions().join(' '));
            break;
          case 0x1F00 /* GL_VENDOR */:
          case 0x1F01 /* GL_RENDERER */:
          case 0x9245 /* UNMASKED_VENDOR_WEBGL */:
          case 0x9246 /* UNMASKED_RENDERER_WEBGL */:
            var s = GLctx.getParameter(name_);
            if (!s) {
              GL.recordError(0x500/*GL_INVALID_ENUM*/);
            }
            ret = s ? stringToNewUTF8(s) : 0;
            break;
  
          case 0x1F02 /* GL_VERSION */:
            var webGLVersion = GLctx.getParameter(0x1F02 /*GL_VERSION*/);
            // return GLES version string corresponding to the version of the WebGL context
            var glVersion = `OpenGL ES 2.0 (${webGLVersion})`;
            if (true) glVersion = `OpenGL ES 3.0 (${webGLVersion})`;
            ret = stringToNewUTF8(glVersion);
            break;
          case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
            var glslVersion = GLctx.getParameter(0x8B8C /*GL_SHADING_LANGUAGE_VERSION*/);
            // extract the version number 'N.M' from the string 'WebGL GLSL ES N.M ...'
            var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
            var ver_num = glslVersion.match(ver_re);
            if (ver_num !== null) {
              if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + '0'; // ensure minor version has 2 digits
              glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`;
            }
            ret = stringToNewUTF8(glslVersion);
            break;
          default:
            GL.recordError(0x500/*GL_INVALID_ENUM*/);
            // fall through
        }
        GL.stringCache[name_] = ret;
      }
      return ret;
    };

  /** @suppress {checkTypes} */
  var jstoi_q = (str) => parseInt(str);
  
  /** @noinline */
  var webglGetLeftBracePos = (name) => name.slice(-1) == ']' && name.lastIndexOf('[');
  
  var webglPrepareUniformLocationsBeforeFirstUse = (program) => {
      var uniformLocsById = program.uniformLocsById, // Maps GLuint -> WebGLUniformLocation
        uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, // Maps name -> [uniform array length, GLuint]
        i, j;
  
      // On the first time invocation of glGetUniformLocation on this shader program:
      // initialize cache data structures and discover which uniforms are arrays.
      if (!uniformLocsById) {
        // maps GLint integer locations to WebGLUniformLocations
        program.uniformLocsById = uniformLocsById = {};
        // maps integer locations back to uniform name strings, so that we can lazily fetch uniform array locations
        program.uniformArrayNamesById = {};
  
        var numActiveUniforms = GLctx.getProgramParameter(program, 0x8B86/*GL_ACTIVE_UNIFORMS*/);
        for (i = 0; i < numActiveUniforms; ++i) {
          var u = GLctx.getActiveUniform(program, i);
          var nm = u.name;
          var sz = u.size;
          var lb = webglGetLeftBracePos(nm);
          var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
  
          // Assign a new location.
          var id = program.uniformIdCounter;
          program.uniformIdCounter += sz;
          // Eagerly get the location of the uniformArray[0] base element.
          // The remaining indices >0 will be left for lazy evaluation to
          // improve performance. Those may never be needed to fetch, if the
          // application fills arrays always in full starting from the first
          // element of the array.
          uniformSizeAndIdsByName[arrayName] = [sz, id];
  
          // Store placeholder integers in place that highlight that these
          // >0 index locations are array indices pending population.
          for (j = 0; j < sz; ++j) {
            uniformLocsById[id] = j;
            program.uniformArrayNamesById[id++] = arrayName;
          }
        }
      }
    };
  
  
  
  var _glGetUniformLocation = (program, name) => {
  
      name = UTF8ToString(name);
  
      if (program = GL.programs[program]) {
        webglPrepareUniformLocationsBeforeFirstUse(program);
        var uniformLocsById = program.uniformLocsById; // Maps GLuint -> WebGLUniformLocation
        var arrayIndex = 0;
        var uniformBaseName = name;
  
        // Invariant: when populating integer IDs for uniform locations, we must
        // maintain the precondition that arrays reside in contiguous addresses,
        // i.e. for a 'vec4 colors[10];', colors[4] must be at location
        // colors[0]+4.  However, user might call glGetUniformLocation(program,
        // "colors") for an array, so we cannot discover based on the user input
        // arguments whether the uniform we are dealing with is an array. The only
        // way to discover which uniforms are arrays is to enumerate over all the
        // active uniforms in the program.
        var leftBrace = webglGetLeftBracePos(name);
  
        // If user passed an array accessor "[index]", parse the array index off the accessor.
        if (leftBrace > 0) {
          arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0; // "index]", coerce parseInt(']') with >>>0 to treat "foo[]" as "foo[0]" and foo[-1] as unsigned out-of-bounds.
          uniformBaseName = name.slice(0, leftBrace);
        }
  
        // Have we cached the location of this uniform before?
        // A pair [array length, GLint of the uniform location]
        var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
  
        // If an uniform with this name exists, and if its index is within the
        // array limits (if it's even an array), query the WebGLlocation, or
        // return an existing cached location.
        if (sizeAndId && arrayIndex < sizeAndId[0]) {
          arrayIndex += sizeAndId[1]; // Add the base location of the uniform to the array index offset.
          if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
            return arrayIndex;
          }
        }
      }
      else {
        // N.b. we are currently unable to distinguish between GL program IDs that
        // never existed vs GL program IDs that have been deleted, so report
        // GL_INVALID_VALUE in both cases.
        GL.recordError(0x501 /* GL_INVALID_VALUE */);
      }
      return -1;
    };

  var _glLinkProgram = (program) => {
      program = GL.programs[program];
      GLctx.linkProgram(program);
      // Invalidate earlier computed uniform->ID mappings, those have now become stale
      program.uniformLocsById = 0; // Mark as null-like so that glGetUniformLocation() knows to populate this again.
      program.uniformSizeAndIdsByName = {};
  
    };

  var _glPixelStorei = (pname, param) => {
      if (pname == 3317) {
        GL.unpackAlignment = param;
      } else if (pname == 3314) {
        GL.unpackRowLength = param;
      }
      GLctx.pixelStorei(pname, param);
    };

  var computeUnpackAlignedImageSize = (width, height, sizePerPixel) => {
      function roundedToNextMultipleOf(x, y) {
        return (x + y - 1) & -y;
      }
      var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
      var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
      return height * alignedRowSize;
    };
  
  var colorChannelsInGlTextureFormat = (format) => {
      // Micro-optimizations for size: map format to size by subtracting smallest
      // enum value (0x1902) from all values first.  Also omit the most common
      // size value (1) from the list, which is assumed by formats not on the
      // list.
      var colorChannels = {
        // 0x1902 /* GL_DEPTH_COMPONENT */ - 0x1902: 1,
        // 0x1906 /* GL_ALPHA */ - 0x1902: 1,
        5: 3,
        6: 4,
        // 0x1909 /* GL_LUMINANCE */ - 0x1902: 1,
        8: 2,
        29502: 3,
        29504: 4,
        // 0x1903 /* GL_RED */ - 0x1902: 1,
        26917: 2,
        26918: 2,
        // 0x8D94 /* GL_RED_INTEGER */ - 0x1902: 1,
        29846: 3,
        29847: 4
      };
      return colorChannels[format - 0x1902]||1;
    };
  
  var heapObjectForWebGLType = (type) => {
      // Micro-optimization for size: Subtract lowest GL enum number (0x1400/* GL_BYTE */) from type to compare
      // smaller values for the heap, for shorter generated code size.
      // Also the type HEAPU16 is not tested for explicitly, but any unrecognized type will return out HEAPU16.
      // (since most types are HEAPU16)
      type -= 0x1400;
      if (type == 0) return HEAP8;
  
      if (type == 1) return HEAPU8;
  
      if (type == 2) return HEAP16;
  
      if (type == 4) return HEAP32;
  
      if (type == 6) return HEAPF32;
  
      if (type == 5
        || type == 28922
        || type == 28520
        || type == 30779
        || type == 30782
        )
        return HEAPU32;
  
      return HEAPU16;
    };
  
  var toTypedArrayIndex = (pointer, heap) =>
      pointer >>> (31 - Math.clz32(heap.BYTES_PER_ELEMENT));
  
  var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
      var heap = heapObjectForWebGLType(type);
      var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
      var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
      return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap));
    };
  
  
  
  var _glReadPixels = (x, y, width, height, format, type, pixels) => {
      if (true) {
        if (GLctx.currentPixelPackBufferBinding) {
          GLctx.readPixels(x, y, width, height, format, type, pixels);
          return;
        }
        var heap = heapObjectForWebGLType(type);
        var target = toTypedArrayIndex(pixels, heap);
        GLctx.readPixels(x, y, width, height, format, type, heap, target);
        return;
      }
    };

  var _glShaderSource = (shader, count, string, length) => {
      var source = GL.getSource(shader, count, string, length);
  
      GLctx.shaderSource(GL.shaders[shader], source);
    };

  
  
  
  var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
      if (true) {
        if (GLctx.currentPixelUnpackBufferBinding) {
          GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
          return;
        }
        if (pixels) {
          var heap = heapObjectForWebGLType(type);
          var index = toTypedArrayIndex(pixels, heap);
          GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, index);
          return;
        }
      }
      var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
    };

  var _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);

  var webglGetUniformLocation = (location) => {
      var p = GLctx.currentProgram;
  
      if (p) {
        var webglLoc = p.uniformLocsById[location];
        // p.uniformLocsById[location] stores either an integer, or a
        // WebGLUniformLocation.
        // If an integer, we have not yet bound the location, so do it now. The
        // integer value specifies the array index we should bind to.
        if (typeof webglLoc == 'number') {
          p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ''));
        }
        // Else an already cached WebGLUniformLocation, return it.
        return webglLoc;
      } else {
        GL.recordError(0x502/*GL_INVALID_OPERATION*/);
      }
    };
  
  var _glUniform1fv = (location, count, value) => {
  
      count && GLctx.uniform1fv(webglGetUniformLocation(location), HEAPF32, ((value)>>2), count);
    };

  
  var _glUniform1i = (location, v0) => {
      GLctx.uniform1i(webglGetUniformLocation(location), v0);
    };

  
  var _glUniform1iv = (location, count, value) => {
  
      count && GLctx.uniform1iv(webglGetUniformLocation(location), HEAP32, ((value)>>2), count);
    };

  
  var _glUniform2fv = (location, count, value) => {
  
      count && GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, ((value)>>2), count*2);
    };

  
  var _glUniform2iv = (location, count, value) => {
  
      count && GLctx.uniform2iv(webglGetUniformLocation(location), HEAP32, ((value)>>2), count*2);
    };

  
  var _glUniform3fv = (location, count, value) => {
  
      count && GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, ((value)>>2), count*3);
    };

  
  var _glUniform3iv = (location, count, value) => {
  
      count && GLctx.uniform3iv(webglGetUniformLocation(location), HEAP32, ((value)>>2), count*3);
    };

  
  var _glUniform4f = (location, v0, v1, v2, v3) => {
      GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
    };

  
  var _glUniform4fv = (location, count, value) => {
  
      count && GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, ((value)>>2), count*4);
    };

  
  var _glUniform4iv = (location, count, value) => {
  
      count && GLctx.uniform4iv(webglGetUniformLocation(location), HEAP32, ((value)>>2), count*4);
    };

  
  var _glUniformMatrix4fv = (location, count, transpose, value) => {
  
      count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, ((value)>>2), count*16);
    };

  var _glUseProgram = (program) => {
      program = GL.programs[program];
      GLctx.useProgram(program);
      // Record the currently active program so that we can access the uniform
      // mapping table of that program.
      GLctx.currentProgram = program;
    };

  var _glVertexAttrib1fv = (index, v) => {
  
      GLctx.vertexAttrib1f(index, HEAPF32[v>>2]);
    };

  var _glVertexAttrib2fv = (index, v) => {
  
      GLctx.vertexAttrib2f(index, HEAPF32[v>>2], HEAPF32[v+4>>2]);
    };

  var _glVertexAttrib3fv = (index, v) => {
  
      GLctx.vertexAttrib3f(index, HEAPF32[v>>2], HEAPF32[v+4>>2], HEAPF32[v+8>>2]);
    };

  var _glVertexAttrib4fv = (index, v) => {
  
      GLctx.vertexAttrib4f(index, HEAPF32[v>>2], HEAPF32[v+4>>2], HEAPF32[v+8>>2], HEAPF32[v+12>>2]);
    };

  var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
      GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
    };

  var _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

  
  
  
  /** @constructor */
  function GLFW_Window(id, width, height, framebufferWidth, framebufferHeight, title, monitor, share) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.fullscreen = false; // Used to determine if app in fullscreen mode
        this.storedX = 0; // Used to store X before fullscreen
        this.storedY = 0; // Used to store Y before fullscreen
        this.width = width;
        this.height = height;
        this.framebufferWidth = framebufferWidth;
        this.framebufferHeight = framebufferHeight;
        this.storedWidth = width; // Used to store width before fullscreen
        this.storedHeight = height; // Used to store height before fullscreen
        this.title = title;
        this.monitor = monitor;
        this.share = share;
        this.attributes = Object.assign({}, GLFW.hints);
        this.inputModes = {
          0x00033001:0x00034001, // GLFW_CURSOR (GLFW_CURSOR_NORMAL)
          0x00033002:0, // GLFW_STICKY_KEYS
          0x00033003:0, // GLFW_STICKY_MOUSE_BUTTONS
        };
        this.buttons = 0;
        this.keys = new Array();
        this.domKeys = new Array();
        this.shouldClose = 0;
        this.title = null;
        this.windowPosFunc = 0; // GLFWwindowposfun
        this.windowSizeFunc = 0; // GLFWwindowsizefun
        this.windowCloseFunc = 0; // GLFWwindowclosefun
        this.windowRefreshFunc = 0; // GLFWwindowrefreshfun
        this.windowFocusFunc = 0; // GLFWwindowfocusfun
        this.windowIconifyFunc = 0; // GLFWwindowiconifyfun
        this.windowMaximizeFunc = 0; // GLFWwindowmaximizefun
        this.framebufferSizeFunc = 0; // GLFWframebuffersizefun
        this.windowContentScaleFunc = 0; // GLFWwindowcontentscalefun
        this.mouseButtonFunc = 0; // GLFWmousebuttonfun
        this.cursorPosFunc = 0; // GLFWcursorposfun
        this.cursorEnterFunc = 0; // GLFWcursorenterfun
        this.scrollFunc = 0; // GLFWscrollfun
        this.dropFunc = 0; // GLFWdropfun
        this.keyFunc = 0; // GLFWkeyfun
        this.charFunc = 0; // GLFWcharfun
        this.userptr = 0;
      }
  
  
  
  var _emscripten_set_main_loop_timing = (mode, value) => {
      MainLoop.timingMode = mode;
      MainLoop.timingValue = value;
  
      if (!MainLoop.func) {
        err('emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.');
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (!MainLoop.running) {
        runtimeKeepalivePush();
        MainLoop.running = true;
      }
      if (mode == 0) {
        MainLoop.scheduler = function MainLoop_scheduler_setTimeout() {
          var timeUntilNextTick = Math.max(0, MainLoop.tickStartTime + value - _emscripten_get_now())|0;
          setTimeout(MainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
        };
        MainLoop.method = 'timeout';
      } else if (mode == 1) {
        MainLoop.scheduler = function MainLoop_scheduler_rAF() {
          MainLoop.requestAnimationFrame(MainLoop.runner);
        };
        MainLoop.method = 'rAF';
      } else if (mode == 2) {
        if (typeof MainLoop.setImmediate == 'undefined') {
          if (typeof setImmediate == 'undefined') {
            // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
            var setImmediates = [];
            var emscriptenMainLoopMessageId = 'setimmediate';
            /** @param {Event} event */
            var MainLoop_setImmediate_messageHandler = (event) => {
              // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
              // so check for both cases.
              if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                event.stopPropagation();
                setImmediates.shift()();
              }
            };
            addEventListener("message", MainLoop_setImmediate_messageHandler, true);
            MainLoop.setImmediate = /** @type{function(function(): ?, ...?): number} */((func) => {
              setImmediates.push(func);
              if (ENVIRONMENT_IS_WORKER) {
                Module['setImmediates'] ??= [];
                Module['setImmediates'].push(func);
                postMessage({target: emscriptenMainLoopMessageId}); // In --proxy-to-worker, route the message via proxyClient.js
              } else postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
            });
          } else {
            MainLoop.setImmediate = setImmediate;
          }
        }
        MainLoop.scheduler = function MainLoop_scheduler_setImmediate() {
          MainLoop.setImmediate(MainLoop.runner);
        };
        MainLoop.method = 'immediate';
      }
      return 0;
    };
  
  
  
  
    /**
     * @param {number=} arg
     * @param {boolean=} noSetTiming
     */
  var setMainLoop = (iterFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
      assert(!MainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
      MainLoop.func = iterFunc;
      MainLoop.arg = arg;
  
      var thisMainLoopId = MainLoop.currentlyRunningMainloop;
      function checkIsRunning() {
        if (thisMainLoopId < MainLoop.currentlyRunningMainloop) {
          runtimeKeepalivePop();
          maybeExit();
          return false;
        }
        return true;
      }
  
      // We create the loop runner here but it is not actually running until
      // _emscripten_set_main_loop_timing is called (which might happen a
      // later time).  This member signifies that the current runner has not
      // yet been started so that we can call runtimeKeepalivePush when it
      // gets it timing set for the first time.
      MainLoop.running = false;
      MainLoop.runner = function MainLoop_runner() {
        if (ABORT) return;
        if (MainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = MainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (MainLoop.remainingBlockers) {
            var remaining = MainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              MainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              MainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          MainLoop.updateStatus();
  
          // catches pause/resume main loop from blocker execution
          if (!checkIsRunning()) return;
  
          setTimeout(MainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (!checkIsRunning()) return;
  
        // Implement very basic swap interval control
        MainLoop.currentFrameNumber = MainLoop.currentFrameNumber + 1 | 0;
        if (MainLoop.timingMode == 1 && MainLoop.timingValue > 1 && MainLoop.currentFrameNumber % MainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          MainLoop.scheduler();
          return;
        } else if (MainLoop.timingMode == 0) {
          MainLoop.tickStartTime = _emscripten_get_now();
        }
  
        if (MainLoop.method === 'timeout' && Module.ctx) {
          warnOnce('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          MainLoop.method = ''; // just warn once per call to set main loop
        }
  
        MainLoop.runIter(iterFunc);
  
        // catch pauses from the main loop itself
        if (!checkIsRunning()) return;
  
        MainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) {
          _emscripten_set_main_loop_timing(0, 1000.0 / fps);
        } else {
          // Do rAF by rendering each frame (no decimating)
          _emscripten_set_main_loop_timing(1, 1);
        }
  
        MainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'unwind';
      }
    };
  
  
  var MainLoop = {
  running:false,
  scheduler:null,
  method:"",
  currentlyRunningMainloop:0,
  func:null,
  arg:0,
  timingMode:0,
  timingValue:0,
  currentFrameNumber:0,
  queue:[],
  preMainLoop:[],
  postMainLoop:[],
  pause() {
        MainLoop.scheduler = null;
        // Incrementing this signals the previous main loop that it's now become old, and it must return.
        MainLoop.currentlyRunningMainloop++;
      },
  resume() {
        MainLoop.currentlyRunningMainloop++;
        var timingMode = MainLoop.timingMode;
        var timingValue = MainLoop.timingValue;
        var func = MainLoop.func;
        MainLoop.func = null;
        // do not set timing and call scheduler, we will do it on the next lines
        setMainLoop(func, 0, false, MainLoop.arg, true);
        _emscripten_set_main_loop_timing(timingMode, timingValue);
        MainLoop.scheduler();
      },
  updateStatus() {
        if (Module['setStatus']) {
          var message = Module['statusMessage'] || 'Please wait...';
          var remaining = MainLoop.remainingBlockers ?? 0;
          var expected = MainLoop.expectedBlockers ?? 0;
          if (remaining) {
            if (remaining < expected) {
              Module['setStatus'](`{message} ({expected - remaining}/{expected})`);
            } else {
              Module['setStatus'](message);
            }
          } else {
            Module['setStatus']('');
          }
        }
      },
  init() {
        Module['preMainLoop'] && MainLoop.preMainLoop.push(Module['preMainLoop']);
        Module['postMainLoop'] && MainLoop.postMainLoop.push(Module['postMainLoop']);
      },
  runIter(func) {
        if (ABORT) return;
        for (var pre of MainLoop.preMainLoop) {
          if (pre() === false) {
            return; // |return false| skips a frame
          }
        }
        callUserCallback(func);
        for (var post of MainLoop.postMainLoop) {
          post();
        }
        checkStackCookie();
      },
  nextRAF:0,
  fakeRequestAnimationFrame(func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (MainLoop.nextRAF === 0) {
          MainLoop.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= MainLoop.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            MainLoop.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(MainLoop.nextRAF - now, 0);
        setTimeout(func, delay);
      },
  requestAnimationFrame(func) {
        if (typeof requestAnimationFrame == 'function') {
          requestAnimationFrame(func);
          return;
        }
        var RAF = MainLoop.fakeRequestAnimationFrame;
        RAF(func);
      },
  };
  
  
  
  
  var GLFW = {
  WindowFromId:(id) => {
        if (id <= 0 || !GLFW.windows) return null;
        return GLFW.windows[id - 1];
      },
  joystickFunc:0,
  errorFunc:0,
  monitorFunc:0,
  active:null,
  scale:null,
  windows:null,
  monitors:null,
  monitorString:null,
  versionString:null,
  initialTime:null,
  extensions:null,
  devicePixelRatioMQL:null,
  hints:null,
  primaryTouchId:null,
  defaultHints:{
  131073:0,
  131074:0,
  131075:1,
  131076:1,
  131077:1,
  131082:0,
  135169:8,
  135170:8,
  135171:8,
  135172:8,
  135173:24,
  135174:8,
  135175:0,
  135176:0,
  135177:0,
  135178:0,
  135179:0,
  135180:0,
  135181:0,
  135182:0,
  135183:0,
  139265:196609,
  139266:1,
  139267:0,
  139268:0,
  139269:0,
  139270:0,
  139271:0,
  139272:0,
  139276:0,
  },
  DOMToGLFWKeyCode:(keycode) => {
        switch (keycode) {
          // these keycodes are only defined for GLFW3, assume they are the same for GLFW2
          case 0x20:return 32; // DOM_VK_SPACE -> GLFW_KEY_SPACE
          case 0xDE:return 39; // DOM_VK_QUOTE -> GLFW_KEY_APOSTROPHE
          case 0xBC:return 44; // DOM_VK_COMMA -> GLFW_KEY_COMMA
          case 0xAD:return 45; // DOM_VK_HYPHEN_MINUS -> GLFW_KEY_MINUS
          case 0xBD:return 45; // DOM_VK_MINUS -> GLFW_KEY_MINUS
          case 0xBE:return 46; // DOM_VK_PERIOD -> GLFW_KEY_PERIOD
          case 0xBF:return 47; // DOM_VK_SLASH -> GLFW_KEY_SLASH
          case 0x30:return 48; // DOM_VK_0 -> GLFW_KEY_0
          case 0x31:return 49; // DOM_VK_1 -> GLFW_KEY_1
          case 0x32:return 50; // DOM_VK_2 -> GLFW_KEY_2
          case 0x33:return 51; // DOM_VK_3 -> GLFW_KEY_3
          case 0x34:return 52; // DOM_VK_4 -> GLFW_KEY_4
          case 0x35:return 53; // DOM_VK_5 -> GLFW_KEY_5
          case 0x36:return 54; // DOM_VK_6 -> GLFW_KEY_6
          case 0x37:return 55; // DOM_VK_7 -> GLFW_KEY_7
          case 0x38:return 56; // DOM_VK_8 -> GLFW_KEY_8
          case 0x39:return 57; // DOM_VK_9 -> GLFW_KEY_9
          case 0x3B:return 59; // DOM_VK_SEMICOLON -> GLFW_KEY_SEMICOLON
          case 0x3D:return 61; // DOM_VK_EQUALS -> GLFW_KEY_EQUAL
          case 0xBB:return 61; // DOM_VK_EQUALS -> GLFW_KEY_EQUAL
          case 0x41:return 65; // DOM_VK_A -> GLFW_KEY_A
          case 0x42:return 66; // DOM_VK_B -> GLFW_KEY_B
          case 0x43:return 67; // DOM_VK_C -> GLFW_KEY_C
          case 0x44:return 68; // DOM_VK_D -> GLFW_KEY_D
          case 0x45:return 69; // DOM_VK_E -> GLFW_KEY_E
          case 0x46:return 70; // DOM_VK_F -> GLFW_KEY_F
          case 0x47:return 71; // DOM_VK_G -> GLFW_KEY_G
          case 0x48:return 72; // DOM_VK_H -> GLFW_KEY_H
          case 0x49:return 73; // DOM_VK_I -> GLFW_KEY_I
          case 0x4A:return 74; // DOM_VK_J -> GLFW_KEY_J
          case 0x4B:return 75; // DOM_VK_K -> GLFW_KEY_K
          case 0x4C:return 76; // DOM_VK_L -> GLFW_KEY_L
          case 0x4D:return 77; // DOM_VK_M -> GLFW_KEY_M
          case 0x4E:return 78; // DOM_VK_N -> GLFW_KEY_N
          case 0x4F:return 79; // DOM_VK_O -> GLFW_KEY_O
          case 0x50:return 80; // DOM_VK_P -> GLFW_KEY_P
          case 0x51:return 81; // DOM_VK_Q -> GLFW_KEY_Q
          case 0x52:return 82; // DOM_VK_R -> GLFW_KEY_R
          case 0x53:return 83; // DOM_VK_S -> GLFW_KEY_S
          case 0x54:return 84; // DOM_VK_T -> GLFW_KEY_T
          case 0x55:return 85; // DOM_VK_U -> GLFW_KEY_U
          case 0x56:return 86; // DOM_VK_V -> GLFW_KEY_V
          case 0x57:return 87; // DOM_VK_W -> GLFW_KEY_W
          case 0x58:return 88; // DOM_VK_X -> GLFW_KEY_X
          case 0x59:return 89; // DOM_VK_Y -> GLFW_KEY_Y
          case 0x5a:return 90; // DOM_VK_Z -> GLFW_KEY_Z
          case 0xDB:return 91; // DOM_VK_OPEN_BRACKET -> GLFW_KEY_LEFT_BRACKET
          case 0xDC:return 92; // DOM_VK_BACKSLASH -> GLFW_KEY_BACKSLASH
          case 0xDD:return 93; // DOM_VK_CLOSE_BRACKET -> GLFW_KEY_RIGHT_BRACKET
          case 0xC0:return 96; // DOM_VK_BACK_QUOTE -> GLFW_KEY_GRAVE_ACCENT
  
          case 0x1B:return 256; // DOM_VK_ESCAPE -> GLFW_KEY_ESCAPE
          case 0x0D:return 257; // DOM_VK_RETURN -> GLFW_KEY_ENTER
          case 0x09:return 258; // DOM_VK_TAB -> GLFW_KEY_TAB
          case 0x08:return 259; // DOM_VK_BACK -> GLFW_KEY_BACKSPACE
          case 0x2D:return 260; // DOM_VK_INSERT -> GLFW_KEY_INSERT
          case 0x2E:return 261; // DOM_VK_DELETE -> GLFW_KEY_DELETE
          case 0x27:return 262; // DOM_VK_RIGHT -> GLFW_KEY_RIGHT
          case 0x25:return 263; // DOM_VK_LEFT -> GLFW_KEY_LEFT
          case 0x28:return 264; // DOM_VK_DOWN -> GLFW_KEY_DOWN
          case 0x26:return 265; // DOM_VK_UP -> GLFW_KEY_UP
          case 0x21:return 266; // DOM_VK_PAGE_UP -> GLFW_KEY_PAGE_UP
          case 0x22:return 267; // DOM_VK_PAGE_DOWN -> GLFW_KEY_PAGE_DOWN
          case 0x24:return 268; // DOM_VK_HOME -> GLFW_KEY_HOME
          case 0x23:return 269; // DOM_VK_END -> GLFW_KEY_END
          case 0x14:return 280; // DOM_VK_CAPS_LOCK -> GLFW_KEY_CAPS_LOCK
          case 0x91:return 281; // DOM_VK_SCROLL_LOCK -> GLFW_KEY_SCROLL_LOCK
          case 0x90:return 282; // DOM_VK_NUM_LOCK -> GLFW_KEY_NUM_LOCK
          case 0x2C:return 283; // DOM_VK_SNAPSHOT -> GLFW_KEY_PRINT_SCREEN
          case 0x13:return 284; // DOM_VK_PAUSE -> GLFW_KEY_PAUSE
          case 0x70:return 290; // DOM_VK_F1 -> GLFW_KEY_F1
          case 0x71:return 291; // DOM_VK_F2 -> GLFW_KEY_F2
          case 0x72:return 292; // DOM_VK_F3 -> GLFW_KEY_F3
          case 0x73:return 293; // DOM_VK_F4 -> GLFW_KEY_F4
          case 0x74:return 294; // DOM_VK_F5 -> GLFW_KEY_F5
          case 0x75:return 295; // DOM_VK_F6 -> GLFW_KEY_F6
          case 0x76:return 296; // DOM_VK_F7 -> GLFW_KEY_F7
          case 0x77:return 297; // DOM_VK_F8 -> GLFW_KEY_F8
          case 0x78:return 298; // DOM_VK_F9 -> GLFW_KEY_F9
          case 0x79:return 299; // DOM_VK_F10 -> GLFW_KEY_F10
          case 0x7A:return 300; // DOM_VK_F11 -> GLFW_KEY_F11
          case 0x7B:return 301; // DOM_VK_F12 -> GLFW_KEY_F12
          case 0x7C:return 302; // DOM_VK_F13 -> GLFW_KEY_F13
          case 0x7D:return 303; // DOM_VK_F14 -> GLFW_KEY_F14
          case 0x7E:return 304; // DOM_VK_F15 -> GLFW_KEY_F15
          case 0x7F:return 305; // DOM_VK_F16 -> GLFW_KEY_F16
          case 0x80:return 306; // DOM_VK_F17 -> GLFW_KEY_F17
          case 0x81:return 307; // DOM_VK_F18 -> GLFW_KEY_F18
          case 0x82:return 308; // DOM_VK_F19 -> GLFW_KEY_F19
          case 0x83:return 309; // DOM_VK_F20 -> GLFW_KEY_F20
          case 0x84:return 310; // DOM_VK_F21 -> GLFW_KEY_F21
          case 0x85:return 311; // DOM_VK_F22 -> GLFW_KEY_F22
          case 0x86:return 312; // DOM_VK_F23 -> GLFW_KEY_F23
          case 0x87:return 313; // DOM_VK_F24 -> GLFW_KEY_F24
          case 0x88:return 314; // 0x88 (not used?) -> GLFW_KEY_F25
          case 0x60:return 320; // DOM_VK_NUMPAD0 -> GLFW_KEY_KP_0
          case 0x61:return 321; // DOM_VK_NUMPAD1 -> GLFW_KEY_KP_1
          case 0x62:return 322; // DOM_VK_NUMPAD2 -> GLFW_KEY_KP_2
          case 0x63:return 323; // DOM_VK_NUMPAD3 -> GLFW_KEY_KP_3
          case 0x64:return 324; // DOM_VK_NUMPAD4 -> GLFW_KEY_KP_4
          case 0x65:return 325; // DOM_VK_NUMPAD5 -> GLFW_KEY_KP_5
          case 0x66:return 326; // DOM_VK_NUMPAD6 -> GLFW_KEY_KP_6
          case 0x67:return 327; // DOM_VK_NUMPAD7 -> GLFW_KEY_KP_7
          case 0x68:return 328; // DOM_VK_NUMPAD8 -> GLFW_KEY_KP_8
          case 0x69:return 329; // DOM_VK_NUMPAD9 -> GLFW_KEY_KP_9
          case 0x6E:return 330; // DOM_VK_DECIMAL -> GLFW_KEY_KP_DECIMAL
          case 0x6F:return 331; // DOM_VK_DIVIDE -> GLFW_KEY_KP_DIVIDE
          case 0x6A:return 332; // DOM_VK_MULTIPLY -> GLFW_KEY_KP_MULTIPLY
          case 0x6D:return 333; // DOM_VK_SUBTRACT -> GLFW_KEY_KP_SUBTRACT
          case 0x6B:return 334; // DOM_VK_ADD -> GLFW_KEY_KP_ADD
          // case 0x0D:return 335; // DOM_VK_RETURN -> GLFW_KEY_KP_ENTER (DOM_KEY_LOCATION_RIGHT)
          // case 0x61:return 336; // DOM_VK_EQUALS -> GLFW_KEY_KP_EQUAL (DOM_KEY_LOCATION_RIGHT)
          case 0x10:return 340; // DOM_VK_SHIFT -> GLFW_KEY_LEFT_SHIFT
          case 0x11:return 341; // DOM_VK_CONTROL -> GLFW_KEY_LEFT_CONTROL
          case 0x12:return 342; // DOM_VK_ALT -> GLFW_KEY_LEFT_ALT
          case 0x5B:return 343; // DOM_VK_WIN -> GLFW_KEY_LEFT_SUPER
          case 0xE0:return 343; // DOM_VK_META -> GLFW_KEY_LEFT_SUPER
          // case 0x10:return 344; // DOM_VK_SHIFT -> GLFW_KEY_RIGHT_SHIFT (DOM_KEY_LOCATION_RIGHT)
          // case 0x11:return 345; // DOM_VK_CONTROL -> GLFW_KEY_RIGHT_CONTROL (DOM_KEY_LOCATION_RIGHT)
          // case 0x12:return 346; // DOM_VK_ALT -> GLFW_KEY_RIGHT_ALT (DOM_KEY_LOCATION_RIGHT)
          // case 0x5B:return 347; // DOM_VK_WIN -> GLFW_KEY_RIGHT_SUPER (DOM_KEY_LOCATION_RIGHT)
          case 0x5D:return 348; // DOM_VK_CONTEXT_MENU -> GLFW_KEY_MENU
          // XXX: GLFW_KEY_WORLD_1, GLFW_KEY_WORLD_2 what are these?
          default:return -1; // GLFW_KEY_UNKNOWN
        };
      },
  getModBits:(win) => {
        var mod = 0;
        if (win.keys[340]) mod |= 0x0001; // GLFW_MOD_SHIFT
        if (win.keys[341]) mod |= 0x0002; // GLFW_MOD_CONTROL
        if (win.keys[342]) mod |= 0x0004; // GLFW_MOD_ALT
        if (win.keys[343] || win.keys[348]) mod |= 0x0008; // GLFW_MOD_SUPER
        // add caps and num lock keys? only if lock_key_mod is set
        return mod;
      },
  onKeyPress:(event) => {
        if (!GLFW.active || !GLFW.active.charFunc) return;
        if (event.ctrlKey || event.metaKey) return;
  
        // correct unicode charCode is only available with onKeyPress event
        var charCode = event.charCode;
        if (charCode == 0 || (charCode >= 0x00 && charCode <= 0x1F)) return;
  
        ((a1, a2) => dynCall_vii(GLFW.active.charFunc, a1, a2))(GLFW.active.id, charCode);
      },
  onKeyChanged:(keyCode, status) => {
        if (!GLFW.active) return;
  
        var key = GLFW.DOMToGLFWKeyCode(keyCode);
        if (key == -1) return;
  
        var repeat = status && GLFW.active.keys[key];
        GLFW.active.keys[key] = status;
        GLFW.active.domKeys[keyCode] = status;
  
        if (GLFW.active.keyFunc) {
          if (repeat) status = 2; // GLFW_REPEAT
          ((a1, a2, a3, a4, a5) => dynCall_viiiii(GLFW.active.keyFunc, a1, a2, a3, a4, a5))(GLFW.active.id, key, keyCode, status, GLFW.getModBits(GLFW.active));
        }
      },
  onGamepadConnected:(event) => {
        GLFW.refreshJoysticks();
      },
  onGamepadDisconnected:(event) => {
        GLFW.refreshJoysticks();
      },
  onKeydown:(event) => {
        GLFW.onKeyChanged(event.keyCode, 1); // GLFW_PRESS or GLFW_REPEAT
  
        // This logic comes directly from the sdl implementation. We cannot
        // call preventDefault on all keydown events otherwise onKeyPress will
        // not get called
        if (event.key == 'Backspace' || event.key == 'Tab') {
          event.preventDefault();
        }
      },
  onKeyup:(event) => {
        GLFW.onKeyChanged(event.keyCode, 0); // GLFW_RELEASE
      },
  onBlur:(event) => {
        if (!GLFW.active) return;
  
        for (var i = 0; i < GLFW.active.domKeys.length; ++i) {
          if (GLFW.active.domKeys[i]) {
            GLFW.onKeyChanged(i, 0); // GLFW_RELEASE
          }
        }
      },
  onMousemove:(event) => {
        if (!GLFW.active) return;
  
        if (event.type === 'touchmove') {
          // Handling for touch events that are being converted to mouse input.
  
          // Don't let the browser fire a duplicate mouse event.
          event.preventDefault();
  
          let primaryChanged = false;
          for (let i of event.changedTouches) {
            // If our chosen primary touch moved, update Browser mouse coords
            if (GLFW.primaryTouchId === i.identifier) {
              Browser.setMouseCoords(i.pageX, i.pageY);
              primaryChanged = true;
              break;
            }
          }
  
          if (!primaryChanged) {
            // Do not send mouse events if some touch other than the primary triggered this.
            return;
          }
  
        } else {
          // Handling for non-touch mouse input events.
          Browser.calculateMouseEvent(event);
        }
  
        if (event.target != Module["canvas"] || !GLFW.active.cursorPosFunc) return;
  
        if (GLFW.active.cursorPosFunc) {
          ((a1, a2, a3) => dynCall_vidd(GLFW.active.cursorPosFunc, a1, a2, a3))(GLFW.active.id, Browser.mouseX, Browser.mouseY);
        }
      },
  DOMToGLFWMouseButton:(event) => {
        // DOM and glfw have different button codes.
        // See http://www.w3schools.com/jsref/event_button.asp.
        var eventButton = event['button'];
        if (eventButton > 0) {
          if (eventButton == 1) {
            eventButton = 2;
          } else {
            eventButton = 1;
          }
        }
        return eventButton;
      },
  onMouseenter:(event) => {
        if (!GLFW.active) return;
  
        if (event.target != Module["canvas"]) return;
  
        if (GLFW.active.cursorEnterFunc) {
          ((a1, a2) => dynCall_vii(GLFW.active.cursorEnterFunc, a1, a2))(GLFW.active.id, 1);
        }
      },
  onMouseleave:(event) => {
        if (!GLFW.active) return;
  
        if (event.target != Module["canvas"]) return;
  
        if (GLFW.active.cursorEnterFunc) {
          ((a1, a2) => dynCall_vii(GLFW.active.cursorEnterFunc, a1, a2))(GLFW.active.id, 0);
        }
      },
  onMouseButtonChanged:(event, status) => {
        if (!GLFW.active) return;
  
        if (event.target != Module["canvas"]) return;
  
        // Is this from a touch event?
        const isTouchType = event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchcancel';
  
        // Only emulating mouse left-click behavior for touches.
        let eventButton = 0;
        if (isTouchType) {
          // Handling for touch events that are being converted to mouse input.
  
          // Don't let the browser fire a duplicate mouse event.
          event.preventDefault();
  
          let primaryChanged = false;
  
          // Set a primary touch if we have none.
          if (GLFW.primaryTouchId === null && event.type === 'touchstart' && event.targetTouches.length > 0) {
            // Pick the first touch that started in the canvas and treat it as primary.
            const chosenTouch = event.targetTouches[0];
            GLFW.primaryTouchId = chosenTouch.identifier;
  
            Browser.setMouseCoords(chosenTouch.pageX, chosenTouch.pageY);
            primaryChanged = true;
          } else if (event.type === 'touchend' || event.type === 'touchcancel') {
            // Clear the primary touch if it ended.
            for (let i of event.changedTouches) {
              // If our chosen primary touch ended, remove it.
              if (GLFW.primaryTouchId === i.identifier) {
                GLFW.primaryTouchId = null;
                primaryChanged = true;
                break;
              }
            }
          }
  
          if (!primaryChanged) {
            // Do not send mouse events if some touch other than the primary triggered this.
            return;
          }
  
        } else {
          // Handling for non-touch mouse input events.
          Browser.calculateMouseEvent(event);
          eventButton = GLFW.DOMToGLFWMouseButton(event);
        }
  
        if (status == 1) { // GLFW_PRESS
          GLFW.active.buttons |= (1 << eventButton);
          try {
            event.target.setCapture();
          } catch (e) {}
        } else {  // GLFW_RELEASE
          GLFW.active.buttons &= ~(1 << eventButton);
        }
  
        // Send mouse event to GLFW.
        if (GLFW.active.mouseButtonFunc) {
          ((a1, a2, a3, a4) => dynCall_viiii(GLFW.active.mouseButtonFunc, a1, a2, a3, a4))(GLFW.active.id, eventButton, status, GLFW.getModBits(GLFW.active));
        }
      },
  onMouseButtonDown:(event) => {
        if (!GLFW.active) return;
        GLFW.onMouseButtonChanged(event, 1); // GLFW_PRESS
      },
  onMouseButtonUp:(event) => {
        if (!GLFW.active) return;
        GLFW.onMouseButtonChanged(event, 0); // GLFW_RELEASE
      },
  onMouseWheel:(event) => {
        // Note the minus sign that flips browser wheel direction (positive direction scrolls page down) to native wheel direction (positive direction is mouse wheel up)
        var delta = -Browser.getMouseWheelDelta(event);
        delta = (delta == 0) ? 0 : (delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1)); // Quantize to integer so that minimum scroll is at least +/- 1.
        GLFW.wheelPos += delta;
  
        if (!GLFW.active || !GLFW.active.scrollFunc || event.target != Module['canvas']) return;
        var sx = 0;
        var sy = delta;
        if (event.type == 'mousewheel') {
          sx = event.wheelDeltaX;
        } else {
          sx = event.deltaX;
        }
  
        ((a1, a2, a3) => dynCall_vidd(GLFW.active.scrollFunc, a1, a2, a3))(GLFW.active.id, sx, sy);
  
        event.preventDefault();
      },
  onCanvasResize:(width, height, framebufferWidth, framebufferHeight) => {
        if (!GLFW.active) return;
  
        var resizeNeeded = false;
  
        // If the client is requesting fullscreen mode
        if (document["fullscreen"] || document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
          if (!GLFW.active.fullscreen) {
            resizeNeeded = width != screen.width || height != screen.height;
            GLFW.active.storedX = GLFW.active.x;
            GLFW.active.storedY = GLFW.active.y;
            GLFW.active.storedWidth = GLFW.active.width;
            GLFW.active.storedHeight = GLFW.active.height;
            GLFW.active.x = GLFW.active.y = 0;
            GLFW.active.width = screen.width;
            GLFW.active.height = screen.height;
            GLFW.active.fullscreen = true;
          }
        // If the client is reverting from fullscreen mode
        } else if (GLFW.active.fullscreen == true) {
          resizeNeeded = width != GLFW.active.storedWidth || height != GLFW.active.storedHeight;
          GLFW.active.x = GLFW.active.storedX;
          GLFW.active.y = GLFW.active.storedY;
          GLFW.active.width = GLFW.active.storedWidth;
          GLFW.active.height = GLFW.active.storedHeight;
          GLFW.active.fullscreen = false;
        }
  
        if (resizeNeeded) {
          // width or height is changed (fullscreen / exit fullscreen) which will call this listener back
          // with proper framebufferWidth/framebufferHeight
          Browser.setCanvasSize(GLFW.active.width, GLFW.active.height);
        } else if (GLFW.active.width != width ||
                   GLFW.active.height != height ||
                   GLFW.active.framebufferWidth != framebufferWidth ||
                   GLFW.active.framebufferHeight != framebufferHeight) {
          GLFW.active.width = width;
          GLFW.active.height = height;
          GLFW.active.framebufferWidth = framebufferWidth;
          GLFW.active.framebufferHeight = framebufferHeight;
          GLFW.onWindowSizeChanged();
          GLFW.onFramebufferSizeChanged();
        }
      },
  onWindowSizeChanged:() => {
        if (!GLFW.active) return;
  
        if (GLFW.active.windowSizeFunc) {
          ((a1, a2, a3) => dynCall_viii(GLFW.active.windowSizeFunc, a1, a2, a3))(GLFW.active.id, GLFW.active.width, GLFW.active.height);
        }
      },
  onFramebufferSizeChanged:() => {
        if (!GLFW.active) return;
  
        if (GLFW.active.framebufferSizeFunc) {
          ((a1, a2, a3) => dynCall_viii(GLFW.active.framebufferSizeFunc, a1, a2, a3))(GLFW.active.id, GLFW.active.framebufferWidth, GLFW.active.framebufferHeight);
        }
      },
  onWindowContentScaleChanged:(scale) => {
        GLFW.scale = scale;
        if (!GLFW.active) return;
  
        if (GLFW.active.windowContentScaleFunc) {
          ((a1, a2, a3) => dynCall_viff(GLFW.active.windowContentScaleFunc, a1, a2, a3))(GLFW.active.id, GLFW.scale, GLFW.scale);
        }
      },
  getTime:() => _emscripten_get_now() / 1000,
  setWindowTitle:(winid, title) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        win.title = title;
        if (GLFW.active.id == win.id) {
          _emscripten_set_window_title(title);
        }
      },
  setJoystickCallback:(cbfun) => {
        var prevcbfun = GLFW.joystickFunc;
        GLFW.joystickFunc = cbfun;
        GLFW.refreshJoysticks();
        return prevcbfun;
      },
  joys:{
  },
  lastGamepadState:[],
  lastGamepadStateFrame:null,
  refreshJoysticks:() => {
        // Produce a new Gamepad API sample if we are ticking a new game frame, or if not using emscripten_set_main_loop() at all to drive animation.
        if (MainLoop.currentFrameNumber !== GLFW.lastGamepadStateFrame || !MainLoop.currentFrameNumber) {
          GLFW.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads || []);
          GLFW.lastGamepadStateFrame = MainLoop.currentFrameNumber;
  
          for (var joy = 0; joy < GLFW.lastGamepadState.length; ++joy) {
            var gamepad = GLFW.lastGamepadState[joy];
  
            if (gamepad) {
              if (!GLFW.joys[joy]) {
                out('glfw joystick connected:',joy);
                GLFW.joys[joy] = {
                  id: stringToNewUTF8(gamepad.id),
                  buttonsCount: gamepad.buttons.length,
                  axesCount: gamepad.axes.length,
                  buttons: _malloc(gamepad.buttons.length),
                  axes: _malloc(gamepad.axes.length*4),
                };
  
                if (GLFW.joystickFunc) {
                  ((a1, a2) => dynCall_vii(GLFW.joystickFunc, a1, a2))(joy, 0x00040001); // GLFW_CONNECTED
                }
              }
  
              var data = GLFW.joys[joy];
  
              for (var i = 0; i < gamepad.buttons.length;  ++i) {
                HEAP8[data.buttons + i] = gamepad.buttons[i].pressed;
              }
  
              for (var i = 0; i < gamepad.axes.length; ++i) {
                HEAPF32[((data.axes + i*4)>>2)] = gamepad.axes[i];
              }
            } else {
              if (GLFW.joys[joy]) {
                out('glfw joystick disconnected',joy);
  
                if (GLFW.joystickFunc) {
                  ((a1, a2) => dynCall_vii(GLFW.joystickFunc, a1, a2))(joy, 0x00040002); // GLFW_DISCONNECTED
                }
  
                _free(GLFW.joys[joy].id);
                _free(GLFW.joys[joy].buttons);
                _free(GLFW.joys[joy].axes);
  
                delete GLFW.joys[joy];
              }
            }
          }
        }
      },
  setKeyCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.keyFunc;
        win.keyFunc = cbfun;
        return prevcbfun;
      },
  setCharCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.charFunc;
        win.charFunc = cbfun;
        return prevcbfun;
      },
  setMouseButtonCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.mouseButtonFunc;
        win.mouseButtonFunc = cbfun;
        return prevcbfun;
      },
  setCursorPosCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.cursorPosFunc;
        win.cursorPosFunc = cbfun;
        return prevcbfun;
      },
  setScrollCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.scrollFunc;
        win.scrollFunc = cbfun;
        return prevcbfun;
      },
  setDropCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.dropFunc;
        win.dropFunc = cbfun;
        return prevcbfun;
      },
  onDrop:(event) => {
        if (!GLFW.active || !GLFW.active.dropFunc) return;
        if (!event.dataTransfer || !event.dataTransfer.files || event.dataTransfer.files.length == 0) return;
  
        event.preventDefault();
  
        var filenames = _malloc(event.dataTransfer.files.length*4);
        var filenamesArray = [];
        var count = event.dataTransfer.files.length;
  
        // Read and save the files to emscripten's FS
        var written = 0;
        var drop_dir = '.glfw_dropped_files';
        FS.createPath('/', drop_dir);
  
        function save(file) {
          var path = '/' + drop_dir + '/' + file.name.replace(/\//g, '_');
          var reader = new FileReader();
          reader.onloadend = (e) => {
            if (reader.readyState != 2) { // not DONE
              ++written;
              out('failed to read dropped file: '+file.name+': '+reader.error);
              return;
            }
  
            var data = e.target.result;
            FS.writeFile(path, new Uint8Array(data));
            if (++written === count) {
              ((a1, a2, a3) => dynCall_viii(GLFW.active.dropFunc, a1, a2, a3))(GLFW.active.id, count, filenames);
  
              for (var i = 0; i < filenamesArray.length; ++i) {
                _free(filenamesArray[i]);
              }
              _free(filenames);
            }
          };
          reader.readAsArrayBuffer(file);
  
          var filename = stringToNewUTF8(path);
          filenamesArray.push(filename);
          HEAPU32[((filenames + i*4)>>2)] = filename;
        }
  
        for (var i = 0; i < count; ++i) {
          save(event.dataTransfer.files[i]);
        }
  
        return false;
      },
  onDragover:(event) => {
        if (!GLFW.active || !GLFW.active.dropFunc) return;
  
        event.preventDefault();
        return false;
      },
  setWindowSizeCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.windowSizeFunc;
        win.windowSizeFunc = cbfun;
  
        return prevcbfun;
      },
  setWindowCloseCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.windowCloseFunc;
        win.windowCloseFunc = cbfun;
        return prevcbfun;
      },
  setWindowRefreshCallback:(winid, cbfun) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return null;
        var prevcbfun = win.windowRefreshFunc;
        win.windowRefreshFunc = cbfun;
        return prevcbfun;
      },
  onClickRequestPointerLock:(e) => {
        if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
          Module['canvas'].requestPointerLock();
          e.preventDefault();
        }
      },
  setInputMode:(winid, mode, value) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        switch (mode) {
          case 0x00033001: { // GLFW_CURSOR
            switch (value) {
              case 0x00034001: { // GLFW_CURSOR_NORMAL
                win.inputModes[mode] = value;
                Module['canvas'].removeEventListener('click', GLFW.onClickRequestPointerLock, true);
                Module['canvas'].exitPointerLock();
                break;
              }
              case 0x00034002: { // GLFW_CURSOR_HIDDEN
                err('glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented');
                break;
              }
              case 0x00034003: { // GLFW_CURSOR_DISABLED
                win.inputModes[mode] = value;
                Module['canvas'].addEventListener('click', GLFW.onClickRequestPointerLock, true);
                Module['canvas'].requestPointerLock();
                break;
              }
              default: {
                err(`glfwSetInputMode called with unknown value parameter value: ${value}`);
                break;
              }
            }
            break;
          }
          case 0x00033002: { // GLFW_STICKY_KEYS
            err('glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented');
            break;
          }
          case 0x00033003: { // GLFW_STICKY_MOUSE_BUTTONS
            err('glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented');
            break;
          }
          case 0x00033004: { // GLFW_LOCK_KEY_MODS
            err('glfwSetInputMode called with GLFW_LOCK_KEY_MODS mode not implemented');
            break;
          }
          case 0x000330005: { // GLFW_RAW_MOUSE_MOTION
            err('glfwSetInputMode called with GLFW_RAW_MOUSE_MOTION mode not implemented');
            break;
          }
          default: {
            err(`glfwSetInputMode called with unknown mode parameter value: ${mode}`);
            break;
          }
        }
      },
  getKey:(winid, key) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return win.keys[key];
      },
  getMouseButton:(winid, button) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return (win.buttons & (1 << button)) > 0;
      },
  getCursorPos:(winid, x, y) => {
        HEAPF64[((x)>>3)] = Browser.mouseX;
        HEAPF64[((y)>>3)] = Browser.mouseY;
      },
  getMousePos:(winid, x, y) => {
        HEAP32[((x)>>2)] = Browser.mouseX;
        HEAP32[((y)>>2)] = Browser.mouseY;
      },
  setCursorPos:(winid, x, y) => {
      },
  getWindowPos:(winid, x, y) => {
        var wx = 0;
        var wy = 0;
  
        var win = GLFW.WindowFromId(winid);
        if (win) {
          wx = win.x;
          wy = win.y;
        }
  
        if (x) {
          HEAP32[((x)>>2)] = wx;
        }
  
        if (y) {
          HEAP32[((y)>>2)] = wy;
        }
      },
  setWindowPos:(winid, x, y) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.x = x;
        win.y = y;
      },
  getWindowSize:(winid, width, height) => {
        var ww = 0;
        var wh = 0;
  
        var win = GLFW.WindowFromId(winid);
        if (win) {
          ww = win.width;
          wh = win.height;
        }
  
        if (width) {
          HEAP32[((width)>>2)] = ww;
        }
  
        if (height) {
          HEAP32[((height)>>2)] = wh;
        }
      },
  setWindowSize:(winid, width, height) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        if (GLFW.active.id == win.id) {
          Browser.setCanvasSize(width, height); // triggers the listener (onCanvasResize) + windowSizeFunc
        }
      },
  defaultWindowHints:() => {
        GLFW.hints = Object.assign({}, GLFW.defaultHints);
      },
  createWindow:(width, height, title, monitor, share) => {
        var i, id;
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] !== null; i++) {
          // no-op
        }
        if (i > 0) throw "glfwCreateWindow only supports one window at time currently";
  
        // id for window
        id = i + 1;
  
        // not valid
        if (width <= 0 || height <= 0) return 0;
  
        if (monitor) {
          Browser.requestFullscreen();
        } else {
          Browser.setCanvasSize(width, height);
        }
  
        // Create context when there are no existing alive windows
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] == null; i++) {
          // no-op
        }
        var useWebGL = GLFW.hints[0x00022001] > 0; // Use WebGL when we are told to based on GLFW_CLIENT_API
        if (i == GLFW.windows.length) {
          if (useWebGL) {
            var contextAttributes = {
              antialias: (GLFW.hints[0x0002100D] > 1), // GLFW_SAMPLES
              depth: (GLFW.hints[0x00021005] > 0),     // GLFW_DEPTH_BITS
              stencil: (GLFW.hints[0x00021006] > 0),   // GLFW_STENCIL_BITS
              alpha: (GLFW.hints[0x00021004] > 0)      // GLFW_ALPHA_BITS
            }
            Browser.createContext(Module['canvas'], /*useWebGL=*/true, /*setInModule=*/true, contextAttributes);
          } else {
            Browser.init();
          }
        }
  
        // If context creation failed, do not return a valid window
        if (!Module.ctx && useWebGL) return 0;
  
        // Get non alive id
        const canvas = Module['canvas'];
  
        var win = new GLFW_Window(id, width, height, canvas.width, canvas.height, title, monitor, share);
  
        // Set window to array
        if (id - 1 == GLFW.windows.length) {
          GLFW.windows.push(win);
        } else {
          GLFW.windows[id - 1] = win;
        }
  
        GLFW.active = win;
        GLFW.adjustCanvasDimensions();
        return win.id;
      },
  destroyWindow:(winid) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        if (win.windowCloseFunc) {
          ((a1) => dynCall_vi(win.windowCloseFunc, a1))(win.id);
        }
  
        GLFW.windows[win.id - 1] = null;
        if (GLFW.active.id == win.id)
          GLFW.active = null;
  
        // Destroy context when no alive windows
        for (var i = 0; i < GLFW.windows.length; i++)
          if (GLFW.windows[i] !== null) return;
  
        delete Module.ctx;
      },
  swapBuffers:(winid) => {
      },
  requestFullscreen(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
            document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
            document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
              Browser.updateResizeListeners();
            }
          } else {
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
  
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
              Browser.updateResizeListeners();
            }
          }
          Module['onFullScreen']?.(Browser.isFullscreen);
          Module['onFullscreen']?.(Browser.isFullscreen);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
          canvasContainer['mozRequestFullScreen'] ||
          canvasContainer['msRequestFullscreen'] ||
          (canvasContainer['webkitRequestFullscreen'] ? () => canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) : null) ||
          (canvasContainer['webkitRequestFullScreen'] ? () => canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) : null);
  
        canvasContainer.requestFullscreen();
      },
  updateCanvasDimensions(canvas, wNative, hNative) {
        const scale = GLFW.getHiDPIScale();
  
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
          document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
          document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
          var factor = Math.min(screen.width / w, screen.height / h);
          w = Math.round(w * factor);
          h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          wNative = w;
          hNative = h;
        }
        const wNativeScaled = Math.floor(wNative * scale);
        const hNativeScaled = Math.floor(hNative * scale);
        if (canvas.width  != wNativeScaled) canvas.width  = wNativeScaled;
        if (canvas.height != hNativeScaled) canvas.height = hNativeScaled;
        if (typeof canvas.style != 'undefined') {
          if (!GLFW.isCSSScalingEnabled()) {
            canvas.style.setProperty( "width", wNative + "px", "important");
            canvas.style.setProperty("height", hNative + "px", "important");
          } else {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        }
      },
  calculateMouseCoords(pageX, pageY) {
        // Calculate the movement based on the changes
        // in the coordinates.
        const rect = Module["canvas"].getBoundingClientRect();
  
        // Neither .scrollX or .pageXOffset are defined in a spec, but
        // we prefer .scrollX because it is currently in a spec draft.
        // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
        var scrollX = ((typeof window.scrollX != 'undefined') ? window.scrollX : window.pageXOffset);
        var scrollY = ((typeof window.scrollY != 'undefined') ? window.scrollY : window.pageYOffset);
        // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
        // and we have no viable fallback.
        assert((typeof scrollX != 'undefined') && (typeof scrollY != 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
        var adjustedX = pageX - (scrollX + rect.left);
        var adjustedY = pageY - (scrollY + rect.top);
  
        // getBoundingClientRect() returns dimension affected by CSS, so as a result:
        // - when CSS scaling is enabled, this will fix the mouse coordinates to match the width/height of the window
        // - otherwise the CSS width/height are forced to the width/height of the GLFW window (see updateCanvasDimensions),
        //   so there is no need to adjust the position
        if (GLFW.isCSSScalingEnabled() && GLFW.active) {
          adjustedX = adjustedX * (GLFW.active.width / rect.width);
          adjustedY = adjustedY * (GLFW.active.height / rect.height);
        }
  
        return { x: adjustedX, y: adjustedY };
      },
  setWindowAttrib:(winid, attrib, value) => {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        const isHiDPIAware = GLFW.isHiDPIAware();
        win.attributes[attrib] = value;
        if (isHiDPIAware !== GLFW.isHiDPIAware())
          GLFW.adjustCanvasDimensions();
      },
  getDevicePixelRatio() {
        return (typeof devicePixelRatio == 'number' && devicePixelRatio) || 1.0;
      },
  isHiDPIAware() {
        if (GLFW.active)
          return GLFW.active.attributes[0x0002200C] > 0; // GLFW_SCALE_TO_MONITOR
        else
          return false;
      },
  isCSSScalingEnabled() {
        return !GLFW.isHiDPIAware();
      },
  adjustCanvasDimensions() {
        if (GLFW.active) {
          Browser.updateCanvasDimensions(Module['canvas'], GLFW.active.width, GLFW.active.height);
          Browser.updateResizeListeners();
        }
      },
  getHiDPIScale() {
        return GLFW.isHiDPIAware() ? GLFW.scale : 1.0;
      },
  onDevicePixelRatioChange() {
        GLFW.onWindowContentScaleChanged(GLFW.getDevicePixelRatio());
        GLFW.adjustCanvasDimensions();
      },
  GLFW2ParamToGLFW3Param:(param) => {
        var table = {
          0x00030001:0, // GLFW_MOUSE_CURSOR
          0x00030002:0, // GLFW_STICKY_KEYS
          0x00030003:0, // GLFW_STICKY_MOUSE_BUTTONS
          0x00030004:0, // GLFW_SYSTEM_KEYS
          0x00030005:0, // GLFW_KEY_REPEAT
          0x00030006:0, // GLFW_AUTO_POLL_EVENTS
          0x00020001:0, // GLFW_OPENED
          0x00020002:0, // GLFW_ACTIVE
          0x00020003:0, // GLFW_ICONIFIED
          0x00020004:0, // GLFW_ACCELERATED
          0x00020005:0x00021001, // GLFW_RED_BITS
          0x00020006:0x00021002, // GLFW_GREEN_BITS
          0x00020007:0x00021003, // GLFW_BLUE_BITS
          0x00020008:0x00021004, // GLFW_ALPHA_BITS
          0x00020009:0x00021005, // GLFW_DEPTH_BITS
          0x0002000A:0x00021006, // GLFW_STENCIL_BITS
          0x0002000B:0x0002100F, // GLFW_REFRESH_RATE
          0x0002000C:0x00021007, // GLFW_ACCUM_RED_BITS
          0x0002000D:0x00021008, // GLFW_ACCUM_GREEN_BITS
          0x0002000E:0x00021009, // GLFW_ACCUM_BLUE_BITS
          0x0002000F:0x0002100A, // GLFW_ACCUM_ALPHA_BITS
          0x00020010:0x0002100B, // GLFW_AUX_BUFFERS
          0x00020011:0x0002100C, // GLFW_STEREO
          0x00020012:0, // GLFW_WINDOW_NO_RESIZE
          0x00020013:0x0002100D, // GLFW_FSAA_SAMPLES
          0x00020014:0x00022002, // GLFW_OPENGL_VERSION_MAJOR
          0x00020015:0x00022003, // GLFW_OPENGL_VERSION_MINOR
          0x00020016:0x00022006, // GLFW_OPENGL_FORWARD_COMPAT
          0x00020017:0x00022007, // GLFW_OPENGL_DEBUG_CONTEXT
          0x00020018:0x00022008, // GLFW_OPENGL_PROFILE
        };
        return table[param];
      },
  };
  var _glfwCreateWindow = (width, height, title, monitor, share) => GLFW.createWindow(width, height, title, monitor, share);

  var _glfwDefaultWindowHints = () => GLFW.defaultWindowHints();

  var _glfwDestroyWindow = (winid) => GLFW.destroyWindow(winid);

  var _glfwGetPrimaryMonitor = () => 1;

  var _glfwGetTime = () => GLFW.getTime() - GLFW.initialTime;

  var _glfwGetVideoModes = (monitor, count) => {
      HEAP32[((count)>>2)] = 0;
      return 0;
    };

  
  
  var _glfwInit = () => {
      if (GLFW.windows) return 1; // GL_TRUE
  
      GLFW.initialTime = GLFW.getTime();
      GLFW.defaultWindowHints();
      GLFW.windows = new Array()
      GLFW.active = null;
      GLFW.scale  = GLFW.getDevicePixelRatio();
  
      window.addEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
      window.addEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, true);
      window.addEventListener("keydown", GLFW.onKeydown, true);
      window.addEventListener("keypress", GLFW.onKeyPress, true);
      window.addEventListener("keyup", GLFW.onKeyup, true);
      window.addEventListener("blur", GLFW.onBlur, true);
  
      // watch for devicePixelRatio changes
      GLFW.devicePixelRatioMQL = window.matchMedia('(resolution: ' + GLFW.getDevicePixelRatio() + 'dppx)');
      GLFW.devicePixelRatioMQL.addEventListener('change', GLFW.onDevicePixelRatioChange);
  
      Module["canvas"].addEventListener("touchmove", GLFW.onMousemove, true);
      Module["canvas"].addEventListener("touchstart", GLFW.onMouseButtonDown, true);
      Module["canvas"].addEventListener("touchcancel", GLFW.onMouseButtonUp, true);
      Module["canvas"].addEventListener("touchend", GLFW.onMouseButtonUp, true);
      Module["canvas"].addEventListener("mousemove", GLFW.onMousemove, true);
      Module["canvas"].addEventListener("mousedown", GLFW.onMouseButtonDown, true);
      Module["canvas"].addEventListener("mouseup", GLFW.onMouseButtonUp, true);
      Module["canvas"].addEventListener('wheel', GLFW.onMouseWheel, true);
      Module["canvas"].addEventListener('mousewheel', GLFW.onMouseWheel, true);
      Module["canvas"].addEventListener('mouseenter', GLFW.onMouseenter, true);
      Module["canvas"].addEventListener('mouseleave', GLFW.onMouseleave, true);
      Module["canvas"].addEventListener('drop', GLFW.onDrop, true);
      Module["canvas"].addEventListener('dragover', GLFW.onDragover, true);
  
      // Overriding implementation to account for HiDPI
      Browser.requestFullscreen = GLFW.requestFullscreen;
      Browser.calculateMouseCoords = GLFW.calculateMouseCoords;
      Browser.updateCanvasDimensions = GLFW.updateCanvasDimensions;
  
      Browser.resizeListeners.push((width, height) => {
        if (GLFW.isHiDPIAware()) {
          var canvas = Module['canvas'];
          GLFW.onCanvasResize(canvas.clientWidth, canvas.clientHeight, width, height);
        } else {
          GLFW.onCanvasResize(width, height, width, height);
        }
      });
  
      return 1; // GL_TRUE
    };

  var _glfwMakeContextCurrent = (winid) => {};

  var _glfwSetCharCallback = (winid, cbfun) => GLFW.setCharCallback(winid, cbfun);

  var _glfwSetCursorEnterCallback = (winid, cbfun) => {
      var win = GLFW.WindowFromId(winid);
      if (!win) return null;
      var prevcbfun = win.cursorEnterFunc;
      win.cursorEnterFunc = cbfun;
      return prevcbfun;
    };

  var _glfwSetCursorPosCallback = (winid, cbfun) => GLFW.setCursorPosCallback(winid, cbfun);

  var _glfwSetDropCallback = (winid, cbfun) => GLFW.setDropCallback(winid, cbfun);

  var _glfwSetErrorCallback = (cbfun) => {
      var prevcbfun = GLFW.errorFunc;
      GLFW.errorFunc = cbfun;
      return prevcbfun;
    };

  var _glfwSetKeyCallback = (winid, cbfun) => GLFW.setKeyCallback(winid, cbfun);

  var _glfwSetMouseButtonCallback = (winid, cbfun) => GLFW.setMouseButtonCallback(winid, cbfun);

  var _glfwSetScrollCallback = (winid, cbfun) => GLFW.setScrollCallback(winid, cbfun);

  var _glfwSetWindowContentScaleCallback = (winid, cbfun) => {
      var win = GLFW.WindowFromId(winid);
      if (!win) return null;
      var prevcbfun = win.windowContentScaleFunc;
      win.windowContentScaleFunc = cbfun;
      return prevcbfun;
    };

  var _glfwSetWindowFocusCallback = (winid, cbfun) => {
      var win = GLFW.WindowFromId(winid);
      if (!win) return null;
      var prevcbfun = win.windowFocusFunc;
      win.windowFocusFunc = cbfun;
      return prevcbfun;
    };

  var _glfwSetWindowIconifyCallback = (winid, cbfun) => {
      var win = GLFW.WindowFromId(winid);
      if (!win) return null;
      var prevcbfun = win.windowIconifyFunc;
      win.windowIconifyFunc = cbfun;
      return prevcbfun;
    };

  var _glfwSetWindowShouldClose = (winid, value) => {
      var win = GLFW.WindowFromId(winid);
      if (!win) return;
      win.shouldClose = value;
    };

  var _glfwSetWindowSizeCallback = (winid, cbfun) => GLFW.setWindowSizeCallback(winid, cbfun);

  var _glfwSwapBuffers = (winid) => GLFW.swapBuffers(winid);

  var _glfwTerminate = () => {
      window.removeEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
      window.removeEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, true);
      window.removeEventListener("keydown", GLFW.onKeydown, true);
      window.removeEventListener("keypress", GLFW.onKeyPress, true);
      window.removeEventListener("keyup", GLFW.onKeyup, true);
      window.removeEventListener("blur", GLFW.onBlur, true);
      Module["canvas"].removeEventListener("touchmove", GLFW.onMousemove, true);
      Module["canvas"].removeEventListener("touchstart", GLFW.onMouseButtonDown, true);
      Module["canvas"].removeEventListener("touchcancel", GLFW.onMouseButtonUp, true);
      Module["canvas"].removeEventListener("touchend", GLFW.onMouseButtonUp, true);
      Module["canvas"].removeEventListener("mousemove", GLFW.onMousemove, true);
      Module["canvas"].removeEventListener("mousedown", GLFW.onMouseButtonDown, true);
      Module["canvas"].removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
      Module["canvas"].removeEventListener('wheel', GLFW.onMouseWheel, true);
      Module["canvas"].removeEventListener('mousewheel', GLFW.onMouseWheel, true);
      Module["canvas"].removeEventListener('mouseenter', GLFW.onMouseenter, true);
      Module["canvas"].removeEventListener('mouseleave', GLFW.onMouseleave, true);
      Module["canvas"].removeEventListener('drop', GLFW.onDrop, true);
      Module["canvas"].removeEventListener('dragover', GLFW.onDragover, true);
  
      if (GLFW.devicePixelRatioMQL)
        GLFW.devicePixelRatioMQL.removeEventListener('change', GLFW.onDevicePixelRatioChange);
  
      Module["canvas"].width = Module["canvas"].height = 1;
      GLFW.windows = null;
      GLFW.active = null;
    };

  var _glfwWindowHint = (target, hint) => {
      GLFW.hints[target] = hint;
    };



  
  
  var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };


  var runAndAbortIfError = (func) => {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    };
  
  
  var sigToWasmTypes = (sig) => {
      assert(!sig.includes('j'), 'i64 not permitted in function signatures when WASM_BIGINT is disabled');
      var typeNames = {
        'i': 'i32',
        'j': 'i64',
        'f': 'f32',
        'd': 'f64',
        'e': 'externref',
        'p': 'i32',
      };
      var type = {
        parameters: [],
        results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
      };
      for (var i = 1; i < sig.length; ++i) {
        assert(sig[i] in typeNames, 'invalid signature char: ' + sig[i]);
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };
  
  
  
  
  
  
  var Asyncify = {
  instrumentWasmImports(imports) {
        var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
  
        for (let [x, original] of Object.entries(imports)) {
          if (typeof original == 'function') {
            let isAsyncifyImport = original.isAsync || importPattern.test(x);
            imports[x] = (...args) => {
              var originalAsyncifyState = Asyncify.state;
              try {
                return original(...args);
              } finally {
                // Only asyncify-declared imports are allowed to change the
                // state.
                // Changing the state from normal to disabled is allowed (in any
                // function) as that is what shutdown does (and we don't have an
                // explicit list of shutdown imports).
                var changedToDisabled =
                      originalAsyncifyState === Asyncify.State.Normal &&
                      Asyncify.state        === Asyncify.State.Disabled;
                // invoke_* functions are allowed to change the state if we do
                // not ignore indirect calls.
                var ignoredInvoke = x.startsWith('invoke_') &&
                                    true;
                if (Asyncify.state !== originalAsyncifyState &&
                    !isAsyncifyImport &&
                    !changedToDisabled &&
                    !ignoredInvoke) {
                  throw new Error(`import ${x} was not in ASYNCIFY_IMPORTS, but changed the state`);
                }
              }
            };
          }
        }
      },
  instrumentWasmExports(exports) {
        var ret = {};
        for (let [x, original] of Object.entries(exports)) {
          if (typeof original == 'function') {
            ret[x] = (...args) => {
              Asyncify.exportCallStack.push(x);
              try {
                return original(...args);
              } finally {
                if (!ABORT) {
                  var y = Asyncify.exportCallStack.pop();
                  assert(y === x);
                  Asyncify.maybeStopUnwind();
                }
              }
            };
          } else {
            ret[x] = original;
          }
        }
        return ret;
      },
  State:{
  Normal:0,
  Unwinding:1,
  Rewinding:2,
  Disabled:3,
  },
  state:0,
  StackSize:4096,
  currData:null,
  handleSleepReturnValue:0,
  exportCallStack:[],
  callStackNameToId:{
  },
  callStackIdToName:{
  },
  callStackId:0,
  asyncPromiseHandlers:null,
  sleepCallbacks:[],
  getCallStackId(funcName) {
        var id = Asyncify.callStackNameToId[funcName];
        if (id === undefined) {
          id = Asyncify.callStackId++;
          Asyncify.callStackNameToId[funcName] = id;
          Asyncify.callStackIdToName[id] = funcName;
        }
        return id;
      },
  maybeStopUnwind() {
        if (Asyncify.currData &&
            Asyncify.state === Asyncify.State.Unwinding &&
            Asyncify.exportCallStack.length === 0) {
          // We just finished unwinding.
          // Be sure to set the state before calling any other functions to avoid
          // possible infinite recursion here (For example in debug pthread builds
          // the dbg() function itself can call back into WebAssembly to get the
          // current pthread_self() pointer).
          Asyncify.state = Asyncify.State.Normal;
          runtimeKeepalivePush();
          // Keep the runtime alive so that a re-wind can be done later.
          runAndAbortIfError(_asyncify_stop_unwind);
          if (typeof Fibers != 'undefined') {
            Fibers.trampoline();
          }
        }
      },
  whenDone() {
        assert(Asyncify.currData, 'Tried to wait for an async operation when none is in progress.');
        assert(!Asyncify.asyncPromiseHandlers, 'Cannot have multiple async operations in flight at once');
        return new Promise((resolve, reject) => {
          Asyncify.asyncPromiseHandlers = { resolve, reject };
        });
      },
  allocateData() {
        // An asyncify data structure has three fields:
        //  0  current stack pos
        //  4  max stack pos
        //  8  id of function at bottom of the call stack (callStackIdToName[id] == name of js function)
        //
        // The Asyncify ABI only interprets the first two fields, the rest is for the runtime.
        // We also embed a stack in the same memory region here, right next to the structure.
        // This struct is also defined as asyncify_data_t in emscripten/fiber.h
        var ptr = _malloc(12 + Asyncify.StackSize);
        Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
        Asyncify.setDataRewindFunc(ptr);
        return ptr;
      },
  setDataHeader(ptr, stack, stackSize) {
        HEAPU32[((ptr)>>2)] = stack;
        HEAPU32[(((ptr)+(4))>>2)] = stack + stackSize;
      },
  setDataRewindFunc(ptr) {
        var bottomOfCallStack = Asyncify.exportCallStack[0];
        var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
        HEAP32[(((ptr)+(8))>>2)] = rewindId;
      },
  getDataRewindFuncName(ptr) {
        var id = HEAP32[(((ptr)+(8))>>2)];
        var name = Asyncify.callStackIdToName[id];
        return name;
      },
  getDataRewindFunc(name) {
        var func = wasmExports[name];
        return func;
      },
  doRewind(ptr) {
        var name = Asyncify.getDataRewindFuncName(ptr);
        var func = Asyncify.getDataRewindFunc(name);
        // Once we have rewound and the stack we no longer need to artificially
        // keep the runtime alive.
        runtimeKeepalivePop();
        return func();
      },
  handleSleep(startAsync) {
        assert(Asyncify.state !== Asyncify.State.Disabled, 'Asyncify cannot be done during or after the runtime exits');
        if (ABORT) return;
        if (Asyncify.state === Asyncify.State.Normal) {
          // Prepare to sleep. Call startAsync, and see what happens:
          // if the code decided to call our callback synchronously,
          // then no async operation was in fact begun, and we don't
          // need to do anything.
          var reachedCallback = false;
          var reachedAfterCallback = false;
          startAsync((handleSleepReturnValue = 0) => {
            assert(!handleSleepReturnValue || typeof handleSleepReturnValue == 'number' || typeof handleSleepReturnValue == 'boolean'); // old emterpretify API supported other stuff
            if (ABORT) return;
            Asyncify.handleSleepReturnValue = handleSleepReturnValue;
            reachedCallback = true;
            if (!reachedAfterCallback) {
              // We are happening synchronously, so no need for async.
              return;
            }
            // This async operation did not happen synchronously, so we did
            // unwind. In that case there can be no compiled code on the stack,
            // as it might break later operations (we can rewind ok now, but if
            // we unwind again, we would unwind through the extra compiled code
            // too).
            assert(!Asyncify.exportCallStack.length, 'Waking up (starting to rewind) must be done from JS, without compiled code on the stack.');
            Asyncify.state = Asyncify.State.Rewinding;
            runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
            if (typeof MainLoop != 'undefined' && MainLoop.func) {
              MainLoop.resume();
            }
            var asyncWasmReturnValue, isError = false;
            try {
              asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
            } catch (err) {
              asyncWasmReturnValue = err;
              isError = true;
            }
            // Track whether the return value was handled by any promise handlers.
            var handled = false;
            if (!Asyncify.currData) {
              // All asynchronous execution has finished.
              // `asyncWasmReturnValue` now contains the final
              // return value of the exported async WASM function.
              //
              // Note: `asyncWasmReturnValue` is distinct from
              // `Asyncify.handleSleepReturnValue`.
              // `Asyncify.handleSleepReturnValue` contains the return
              // value of the last C function to have executed
              // `Asyncify.handleSleep()`, where as `asyncWasmReturnValue`
              // contains the return value of the exported WASM function
              // that may have called C functions that
              // call `Asyncify.handleSleep()`.
              var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
              if (asyncPromiseHandlers) {
                Asyncify.asyncPromiseHandlers = null;
                (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
                handled = true;
              }
            }
            if (isError && !handled) {
              // If there was an error and it was not handled by now, we have no choice but to
              // rethrow that error into the global scope where it can be caught only by
              // `onerror` or `onunhandledpromiserejection`.
              throw asyncWasmReturnValue;
            }
          });
          reachedAfterCallback = true;
          if (!reachedCallback) {
            // A true async operation was begun; start a sleep.
            Asyncify.state = Asyncify.State.Unwinding;
            // TODO: reuse, don't alloc/free every sleep
            Asyncify.currData = Asyncify.allocateData();
            if (typeof MainLoop != 'undefined' && MainLoop.func) {
              MainLoop.pause();
            }
            runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
          }
        } else if (Asyncify.state === Asyncify.State.Rewinding) {
          // Stop a resume.
          Asyncify.state = Asyncify.State.Normal;
          runAndAbortIfError(_asyncify_stop_rewind);
          _free(Asyncify.currData);
          Asyncify.currData = null;
          // Call all sleep callbacks now that the sleep-resume is all done.
          Asyncify.sleepCallbacks.forEach(callUserCallback);
        } else {
          abort(`invalid state: ${Asyncify.state}`);
        }
        return Asyncify.handleSleepReturnValue;
      },
  handleAsync(startAsync) {
        return Asyncify.handleSleep((wakeUp) => {
          // TODO: add error handling as a second param when handleSleep implements it.
          startAsync().then(wakeUp);
        });
      },
  };

  var getCFunc = (ident) => {
      var func = Module['_' + ident]; // closure exported function
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    };
  
  var writeArrayToMemory = (array, buffer) => {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    };
  
  
  
  
  
  
  
  
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
  var ccall = (ident, returnType, argTypes, args, opts) => {
      // For fast lookup of conversion functions
      var toC = {
        'string': (str) => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) { // null string
            ret = stringToUTF8OnStack(str);
          }
          return ret;
        },
        'array': (arr) => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        }
      };
  
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
  
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      // Data for a previous async operation that was in flight before us.
      var previousAsync = Asyncify.currData;
      var ret = func(...cArgs);
      function onDone(ret) {
        runtimeKeepalivePop();
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
    var asyncMode = opts?.async;
  
      // Keep the runtime alive through all calls. Note that this call might not be
      // async, but for simplicity we push and pop in all calls.
      runtimeKeepalivePush();
      if (Asyncify.currData != previousAsync) {
        // A change in async operation happened. If there was already an async
        // operation in flight before us, that is an error: we should not start
        // another async operation while one is active, and we should not stop one
        // either. The only valid combination is to have no change in the async
        // data (so we either had one in flight and left it alone, or we didn't have
        // one), or to have nothing in flight and to start one.
        assert(!(previousAsync && Asyncify.currData), 'We cannot start an async operation when one is already flight');
        assert(!(previousAsync && !Asyncify.currData), 'We cannot stop an async operation in flight');
        // This is a new async operation. The wasm is paused and has unwound its stack.
        // We need to return a Promise that resolves the return value
        // once the stack is rewound and execution finishes.
        assert(asyncMode, 'The call to ' + ident + ' is running asynchronously. If this was intended, add the async option to the ccall/cwrap call.');
        return Asyncify.whenDone().then(onDone);
      }
  
      ret = onDone(ret);
      // If this is an async ccall, ensure we return a promise
      if (asyncMode) return Promise.resolve(ret);
      return ret;
    };

  var FS_createPath = FS.createPath;



  var FS_unlink = (path) => FS.unlink(path);

  var FS_createLazyFile = FS.createLazyFile;

  var FS_createDevice = FS.createDevice;
PThread.init();;

  FS.createPreloadedFile = FS_createPreloadedFile;
  FS.staticInit();
  // Set module methods based on EXPORTED_RUNTIME_METHODS
  Module["FS_createPath"] = FS.createPath;
  Module["FS_createDataFile"] = FS.createDataFile;
  Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
  Module["FS_unlink"] = FS.unlink;
  Module["FS_createLazyFile"] = FS.createLazyFile;
  Module["FS_createDevice"] = FS.createDevice;
  ;

      // exports
      Module["requestFullscreen"] = Browser.requestFullscreen;
      Module["requestFullScreen"] = Browser.requestFullScreen;
      Module["setCanvasSize"] = Browser.setCanvasSize;
      Module["getUserMedia"] = Browser.getUserMedia;
      Module["createContext"] = Browser.createContext;
      var preloadedImages = {};
      var preloadedAudios = {};;

      Module["requestAnimationFrame"] = MainLoop.requestAnimationFrame;
      Module["pauseMainLoop"] = MainLoop.pause;
      Module["resumeMainLoop"] = MainLoop.resume;
      MainLoop.init();;

// proxiedFunctionTable specifies the list of functions that can be called
// either synchronously or asynchronously from other threads in postMessage()d
// or internally queued events. This way a pthread in a Worker can synchronously
// access e.g. the DOM on the main thread.
var proxiedFunctionTable = [
  _proc_exit,
  exitOnMainThread,
  ___syscall_faccessat,
  ___syscall_fcntl64,
  ___syscall_getcwd,
  ___syscall_ioctl,
  ___syscall_openat,
  __mmap_js,
  __munmap_js,
  _emscripten_get_element_css_size,
  _emscripten_get_gamepad_status,
  _emscripten_get_num_gamepads,
  _emscripten_sample_gamepad_data,
  setCanvasElementSizeMainThread,
  _emscripten_set_click_callback_on_thread,
  _emscripten_set_fullscreenchange_callback_on_thread,
  _emscripten_set_gamepadconnected_callback_on_thread,
  _emscripten_set_gamepaddisconnected_callback_on_thread,
  _emscripten_set_mousemove_callback_on_thread,
  _emscripten_set_pointerlockchange_callback_on_thread,
  _emscripten_set_resize_callback_on_thread,
  _emscripten_set_touchcancel_callback_on_thread,
  _emscripten_set_touchend_callback_on_thread,
  _emscripten_set_touchmove_callback_on_thread,
  _emscripten_set_touchstart_callback_on_thread,
  _emscripten_set_window_title,
  _fd_close,
  _fd_read,
  _fd_seek,
  _fd_write
];

function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports;
function assignWasmImports() {
  wasmImports = {
    /** @export */
    __assert_fail: ___assert_fail,
    /** @export */
    __syscall_faccessat: ___syscall_faccessat,
    /** @export */
    __syscall_fcntl64: ___syscall_fcntl64,
    /** @export */
    __syscall_getcwd: ___syscall_getcwd,
    /** @export */
    __syscall_ioctl: ___syscall_ioctl,
    /** @export */
    __syscall_openat: ___syscall_openat,
    /** @export */
    _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
    /** @export */
    _emscripten_init_main_thread_js: __emscripten_init_main_thread_js,
    /** @export */
    _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
    /** @export */
    _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
    /** @export */
    _emscripten_thread_cleanup: __emscripten_thread_cleanup,
    /** @export */
    _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
    /** @export */
    _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
    /** @export */
    _mmap_js: __mmap_js,
    /** @export */
    _munmap_js: __munmap_js,
    /** @export */
    emscripten_asm_const_int: _emscripten_asm_const_int,
    /** @export */
    emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
    /** @export */
    emscripten_date_now: _emscripten_date_now,
    /** @export */
    emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
    /** @export */
    emscripten_get_element_css_size: _emscripten_get_element_css_size,
    /** @export */
    emscripten_get_gamepad_status: _emscripten_get_gamepad_status,
    /** @export */
    emscripten_get_now: _emscripten_get_now,
    /** @export */
    emscripten_get_num_gamepads: _emscripten_get_num_gamepads,
    /** @export */
    emscripten_resize_heap: _emscripten_resize_heap,
    /** @export */
    emscripten_sample_gamepad_data: _emscripten_sample_gamepad_data,
    /** @export */
    emscripten_set_canvas_element_size: _emscripten_set_canvas_element_size,
    /** @export */
    emscripten_set_click_callback_on_thread: _emscripten_set_click_callback_on_thread,
    /** @export */
    emscripten_set_fullscreenchange_callback_on_thread: _emscripten_set_fullscreenchange_callback_on_thread,
    /** @export */
    emscripten_set_gamepadconnected_callback_on_thread: _emscripten_set_gamepadconnected_callback_on_thread,
    /** @export */
    emscripten_set_gamepaddisconnected_callback_on_thread: _emscripten_set_gamepaddisconnected_callback_on_thread,
    /** @export */
    emscripten_set_mousemove_callback_on_thread: _emscripten_set_mousemove_callback_on_thread,
    /** @export */
    emscripten_set_pointerlockchange_callback_on_thread: _emscripten_set_pointerlockchange_callback_on_thread,
    /** @export */
    emscripten_set_resize_callback_on_thread: _emscripten_set_resize_callback_on_thread,
    /** @export */
    emscripten_set_touchcancel_callback_on_thread: _emscripten_set_touchcancel_callback_on_thread,
    /** @export */
    emscripten_set_touchend_callback_on_thread: _emscripten_set_touchend_callback_on_thread,
    /** @export */
    emscripten_set_touchmove_callback_on_thread: _emscripten_set_touchmove_callback_on_thread,
    /** @export */
    emscripten_set_touchstart_callback_on_thread: _emscripten_set_touchstart_callback_on_thread,
    /** @export */
    emscripten_set_window_title: _emscripten_set_window_title,
    /** @export */
    emscripten_sleep: _emscripten_sleep,
    /** @export */
    exit: _exit,
    /** @export */
    fd_close: _fd_close,
    /** @export */
    fd_read: _fd_read,
    /** @export */
    fd_seek: _fd_seek,
    /** @export */
    fd_write: _fd_write,
    /** @export */
    glActiveTexture: _glActiveTexture,
    /** @export */
    glAttachShader: _glAttachShader,
    /** @export */
    glBindAttribLocation: _glBindAttribLocation,
    /** @export */
    glBindBuffer: _glBindBuffer,
    /** @export */
    glBindTexture: _glBindTexture,
    /** @export */
    glBindVertexArray: _glBindVertexArray,
    /** @export */
    glBlendFunc: _glBlendFunc,
    /** @export */
    glBufferData: _glBufferData,
    /** @export */
    glBufferSubData: _glBufferSubData,
    /** @export */
    glClear: _glClear,
    /** @export */
    glClearColor: _glClearColor,
    /** @export */
    glClearDepthf: _glClearDepthf,
    /** @export */
    glCompileShader: _glCompileShader,
    /** @export */
    glCompressedTexImage2D: _glCompressedTexImage2D,
    /** @export */
    glCreateProgram: _glCreateProgram,
    /** @export */
    glCreateShader: _glCreateShader,
    /** @export */
    glCullFace: _glCullFace,
    /** @export */
    glDeleteBuffers: _glDeleteBuffers,
    /** @export */
    glDeleteProgram: _glDeleteProgram,
    /** @export */
    glDeleteShader: _glDeleteShader,
    /** @export */
    glDeleteTextures: _glDeleteTextures,
    /** @export */
    glDeleteVertexArrays: _glDeleteVertexArrays,
    /** @export */
    glDepthFunc: _glDepthFunc,
    /** @export */
    glDetachShader: _glDetachShader,
    /** @export */
    glDisable: _glDisable,
    /** @export */
    glDisableVertexAttribArray: _glDisableVertexAttribArray,
    /** @export */
    glDrawArrays: _glDrawArrays,
    /** @export */
    glDrawElements: _glDrawElements,
    /** @export */
    glEnable: _glEnable,
    /** @export */
    glEnableVertexAttribArray: _glEnableVertexAttribArray,
    /** @export */
    glFrontFace: _glFrontFace,
    /** @export */
    glGenBuffers: _glGenBuffers,
    /** @export */
    glGenTextures: _glGenTextures,
    /** @export */
    glGenVertexArrays: _glGenVertexArrays,
    /** @export */
    glGetAttribLocation: _glGetAttribLocation,
    /** @export */
    glGetFloatv: _glGetFloatv,
    /** @export */
    glGetIntegerv: _glGetIntegerv,
    /** @export */
    glGetProgramInfoLog: _glGetProgramInfoLog,
    /** @export */
    glGetProgramiv: _glGetProgramiv,
    /** @export */
    glGetShaderInfoLog: _glGetShaderInfoLog,
    /** @export */
    glGetShaderiv: _glGetShaderiv,
    /** @export */
    glGetString: _glGetString,
    /** @export */
    glGetUniformLocation: _glGetUniformLocation,
    /** @export */
    glLinkProgram: _glLinkProgram,
    /** @export */
    glPixelStorei: _glPixelStorei,
    /** @export */
    glReadPixels: _glReadPixels,
    /** @export */
    glShaderSource: _glShaderSource,
    /** @export */
    glTexImage2D: _glTexImage2D,
    /** @export */
    glTexParameteri: _glTexParameteri,
    /** @export */
    glUniform1fv: _glUniform1fv,
    /** @export */
    glUniform1i: _glUniform1i,
    /** @export */
    glUniform1iv: _glUniform1iv,
    /** @export */
    glUniform2fv: _glUniform2fv,
    /** @export */
    glUniform2iv: _glUniform2iv,
    /** @export */
    glUniform3fv: _glUniform3fv,
    /** @export */
    glUniform3iv: _glUniform3iv,
    /** @export */
    glUniform4f: _glUniform4f,
    /** @export */
    glUniform4fv: _glUniform4fv,
    /** @export */
    glUniform4iv: _glUniform4iv,
    /** @export */
    glUniformMatrix4fv: _glUniformMatrix4fv,
    /** @export */
    glUseProgram: _glUseProgram,
    /** @export */
    glVertexAttrib1fv: _glVertexAttrib1fv,
    /** @export */
    glVertexAttrib2fv: _glVertexAttrib2fv,
    /** @export */
    glVertexAttrib3fv: _glVertexAttrib3fv,
    /** @export */
    glVertexAttrib4fv: _glVertexAttrib4fv,
    /** @export */
    glVertexAttribPointer: _glVertexAttribPointer,
    /** @export */
    glViewport: _glViewport,
    /** @export */
    glfwCreateWindow: _glfwCreateWindow,
    /** @export */
    glfwDefaultWindowHints: _glfwDefaultWindowHints,
    /** @export */
    glfwDestroyWindow: _glfwDestroyWindow,
    /** @export */
    glfwGetPrimaryMonitor: _glfwGetPrimaryMonitor,
    /** @export */
    glfwGetTime: _glfwGetTime,
    /** @export */
    glfwGetVideoModes: _glfwGetVideoModes,
    /** @export */
    glfwInit: _glfwInit,
    /** @export */
    glfwMakeContextCurrent: _glfwMakeContextCurrent,
    /** @export */
    glfwSetCharCallback: _glfwSetCharCallback,
    /** @export */
    glfwSetCursorEnterCallback: _glfwSetCursorEnterCallback,
    /** @export */
    glfwSetCursorPosCallback: _glfwSetCursorPosCallback,
    /** @export */
    glfwSetDropCallback: _glfwSetDropCallback,
    /** @export */
    glfwSetErrorCallback: _glfwSetErrorCallback,
    /** @export */
    glfwSetKeyCallback: _glfwSetKeyCallback,
    /** @export */
    glfwSetMouseButtonCallback: _glfwSetMouseButtonCallback,
    /** @export */
    glfwSetScrollCallback: _glfwSetScrollCallback,
    /** @export */
    glfwSetWindowContentScaleCallback: _glfwSetWindowContentScaleCallback,
    /** @export */
    glfwSetWindowFocusCallback: _glfwSetWindowFocusCallback,
    /** @export */
    glfwSetWindowIconifyCallback: _glfwSetWindowIconifyCallback,
    /** @export */
    glfwSetWindowShouldClose: _glfwSetWindowShouldClose,
    /** @export */
    glfwSetWindowSizeCallback: _glfwSetWindowSizeCallback,
    /** @export */
    glfwSwapBuffers: _glfwSwapBuffers,
    /** @export */
    glfwTerminate: _glfwTerminate,
    /** @export */
    glfwWindowHint: _glfwWindowHint,
    /** @export */
    memory: wasmMemory
  };
}
var wasmExports = createWasm();
var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors', 0);
var _free = createExportWrapper('free', 1);
var _malloc = createExportWrapper('malloc', 1);
var _fflush = createExportWrapper('fflush', 1);
var _strerror = createExportWrapper('strerror', 1);
var _ma_device__on_notification_unlocked = Module['_ma_device__on_notification_unlocked'] = createExportWrapper('ma_device__on_notification_unlocked', 1);
var _ma_malloc_emscripten = Module['_ma_malloc_emscripten'] = createExportWrapper('ma_malloc_emscripten', 2);
var _ma_free_emscripten = Module['_ma_free_emscripten'] = createExportWrapper('ma_free_emscripten', 2);
var _ma_device_process_pcm_frames_capture__webaudio = Module['_ma_device_process_pcm_frames_capture__webaudio'] = createExportWrapper('ma_device_process_pcm_frames_capture__webaudio', 3);
var _ma_device_process_pcm_frames_playback__webaudio = Module['_ma_device_process_pcm_frames_playback__webaudio'] = createExportWrapper('ma_device_process_pcm_frames_playback__webaudio', 3);
var _main = Module['_main'] = createExportWrapper('main', 3);
var __emscripten_tls_init = createExportWrapper('_emscripten_tls_init', 0);
var _pthread_self = () => (_pthread_self = wasmExports['pthread_self'])();
var _emscripten_builtin_memalign = createExportWrapper('emscripten_builtin_memalign', 2);
var __emscripten_run_callback_on_thread = createExportWrapper('_emscripten_run_callback_on_thread', 5);
var __emscripten_thread_init = createExportWrapper('_emscripten_thread_init', 6);
var __emscripten_thread_crashed = createExportWrapper('_emscripten_thread_crashed', 0);
var _emscripten_main_thread_process_queued_calls = createExportWrapper('emscripten_main_thread_process_queued_calls', 0);
var _emscripten_main_runtime_thread_id = createExportWrapper('emscripten_main_runtime_thread_id', 0);
var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'])();
var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'])();
var __emscripten_run_on_main_thread_js = createExportWrapper('_emscripten_run_on_main_thread_js', 5);
var __emscripten_thread_free_data = createExportWrapper('_emscripten_thread_free_data', 1);
var __emscripten_thread_exit = createExportWrapper('_emscripten_thread_exit', 1);
var __emscripten_check_mailbox = createExportWrapper('_emscripten_check_mailbox', 0);
var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports['emscripten_stack_init'])();
var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports['emscripten_stack_set_limits'])(a0, a1);
var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();
var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports['_emscripten_stack_restore'])(a0);
var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'])(a0);
var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'])();
var dynCall_vii = Module['dynCall_vii'] = createExportWrapper('dynCall_vii', 3);
var dynCall_viii = Module['dynCall_viii'] = createExportWrapper('dynCall_viii', 4);
var dynCall_fffi = Module['dynCall_fffi'] = createExportWrapper('dynCall_fffi', 4);
var dynCall_ffi = Module['dynCall_ffi'] = createExportWrapper('dynCall_ffi', 3);
var dynCall_iii = Module['dynCall_iii'] = createExportWrapper('dynCall_iii', 3);
var dynCall_viiiiii = Module['dynCall_viiiiii'] = createExportWrapper('dynCall_viiiiii', 7);
var dynCall_viiii = Module['dynCall_viiii'] = createExportWrapper('dynCall_viiii', 5);
var dynCall_viff = Module['dynCall_viff'] = createExportWrapper('dynCall_viff', 4);
var dynCall_viiiii = Module['dynCall_viiiii'] = createExportWrapper('dynCall_viiiii', 6);
var dynCall_vidd = Module['dynCall_vidd'] = createExportWrapper('dynCall_vidd', 4);
var dynCall_iiii = Module['dynCall_iiii'] = createExportWrapper('dynCall_iiii', 4);
var dynCall_vi = Module['dynCall_vi'] = createExportWrapper('dynCall_vi', 2);
var dynCall_jiji = Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji', 5);
var dynCall_ii = Module['dynCall_ii'] = createExportWrapper('dynCall_ii', 2);
var dynCall_v = Module['dynCall_v'] = createExportWrapper('dynCall_v', 1);
var dynCall_iidiiii = Module['dynCall_iidiiii'] = createExportWrapper('dynCall_iidiiii', 7);
var _asyncify_start_unwind = createExportWrapper('asyncify_start_unwind', 1);
var _asyncify_stop_unwind = createExportWrapper('asyncify_stop_unwind', 0);
var _asyncify_start_rewind = createExportWrapper('asyncify_start_rewind', 1);
var _asyncify_stop_rewind = createExportWrapper('asyncify_stop_rewind', 0);


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

Module['addRunDependency'] = addRunDependency;
Module['removeRunDependency'] = removeRunDependency;
Module['ccall'] = ccall;
Module['FS_createPreloadedFile'] = FS_createPreloadedFile;
Module['FS_unlink'] = FS_unlink;
Module['FS_createPath'] = FS_createPath;
Module['FS_createDevice'] = FS_createDevice;
Module['FS_createDataFile'] = FS_createDataFile;
Module['FS_createLazyFile'] = FS_createLazyFile;
var missingLibrarySymbols = [
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'getTempRet0',
  'setTempRet0',
  'growMemory',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'emscriptenLog',
  'runMainThreadEmAsm',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'asmjsMangle',
  'HandleAllocator',
  'getNativeTypeSize',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'cwrap',
  'uleb128Encode',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'registerKeyEventCallback',
  'registerWheelEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasSizeCallingThread',
  'getCanvasSizeMainThread',
  'getCanvasElementSize',
  'jsStackTrace',
  'getCallstack',
  'convertPCtoSourceLocation',
  'getEnvStrings',
  'checkWasiClock',
  'wasiRightsToMuslOFlags',
  'wasiOFlagsToMuslOFlags',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'registerPostMainLoop',
  'registerPreMainLoop',
  'getPromise',
  'makePromise',
  'idsToPromises',
  'makePromiseCallback',
  'ExceptionInfo',
  'findMatchingCatch',
  'Browser_asyncPrepareDataCounter',
  'safeRequestAnimationFrame',
  'isLeapYear',
  'ydayFromDate',
  'arraySum',
  'addDays',
  'getSocketFromFD',
  'getSocketAddress',
  'FS_mkdirTree',
  '_setNetworkCallback',
  'emscriptenWebGLGetUniform',
  'emscriptenWebGLGetVertexAttrib',
  '__glGetActiveAttribOrUniform',
  'writeGLArray',
  'emscripten_webgl_destroy_context_before_on_calling_thread',
  'registerWebGlEventCallback',
  'emscriptenWebGLGetIndexed',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'setErrNo',
  'demangle',
  'stackTrace',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

var unexportedSymbols = [
  'run',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'out',
  'err',
  'callMain',
  'abort',
  'wasmMemory',
  'wasmExports',
  'writeStackCookie',
  'checkStackCookie',
  'writeI53ToI64',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53Checked',
  'stackSave',
  'stackRestore',
  'stackAlloc',
  'ptrToString',
  'zeroMemory',
  'exitJS',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'ENV',
  'ERRNO_CODES',
  'strError',
  'DNS',
  'Protocols',
  'Sockets',
  'timers',
  'warnOnce',
  'readEmAsmArgsArray',
  'readEmAsmArgs',
  'runEmAsmFunction',
  'jstoi_q',
  'jstoi_s',
  'handleException',
  'keepRuntimeAlive',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'wasmTable',
  'noExitRuntime',
  'getCFunc',
  'sigToWasmTypes',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'UTF8Decoder',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'intArrayFromString',
  'UTF16Decoder',
  'stringToNewUTF8',
  'stringToUTF8OnStack',
  'writeArrayToMemory',
  'JSEvents',
  'specialHTMLTargets',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerUiEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'setCanvasElementSizeCallingThread',
  'setCanvasElementSizeMainThread',
  'UNWIND_CACHE',
  'ExitStatus',
  'doReadv',
  'doWritev',
  'initRandomFill',
  'randomFill',
  'safeSetTimeout',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'Browser',
  'getPreloadedImageData__data',
  'wget',
  'MONTH_DAYS_REGULAR',
  'MONTH_DAYS_LEAP',
  'MONTH_DAYS_REGULAR_CUMULATIVE',
  'MONTH_DAYS_LEAP_CUMULATIVE',
  'SYSCALLS',
  'preloadPlugins',
  'FS_modeStringToFlags',
  'FS_getMode',
  'FS_stdin_getChar_buffer',
  'FS_stdin_getChar',
  'FS_readFile',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'miniTempWebGLIntBuffers',
  'heapObjectForWebGLType',
  'toTypedArrayIndex',
  'webgl_enable_WEBGL_multi_draw',
  'webgl_enable_EXT_polygon_offset_clamp',
  'webgl_enable_EXT_clip_control',
  'webgl_enable_WEBGL_polygon_mode',
  'GL',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'colorChannelsInGlTextureFormat',
  'emscriptenWebGLGetTexPixelData',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'AL',
  'GLUT',
  'EGL',
  'GLEW',
  'IDBStore',
  'runAndAbortIfError',
  'Asyncify',
  'Fibers',
  'SDL',
  'SDL_gfx',
  'GLFW_Window',
  'GLFW',
  'webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance',
  'webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'print',
  'printErr',
  'PThread',
  'terminateWorker',
  'cleanupThread',
  'registerTLSInit',
  'spawnThread',
  'exitOnMainThread',
  'proxyToMainThread',
  'proxiedJSCallArgs',
  'invokeEntryPoint',
  'checkMailbox',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);



var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args = []) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  var entryFunction = _main;

  args.unshift(thisProgram);

  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv;
  args.forEach((arg) => {
    HEAPU32[((argv_ptr)>>2)] = stringToUTF8OnStack(arg);
    argv_ptr += 4;
  });
  HEAPU32[((argv_ptr)>>2)] = 0;

  try {

    var ret = entryFunction(argc, argv);

    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  // See $establishStackSpace for the equivalent code that runs on a thread
  assert(!ENVIRONMENT_IS_PTHREAD);
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run(args = arguments_) {

  if (runDependencies > 0) {
    return;
  }

  if (ENVIRONMENT_IS_PTHREAD) {
    initRuntime();
    startWorker(Module);
    return;
  }

  stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    Module['onRuntimeInitialized']?.();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(() => {
      setTimeout(() => Module['setStatus'](''), 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    _fflush(0);
    // also flush in the JS FS layer
    ['stdout', 'stderr'].forEach((name) => {
      var info = FS.analyzePath('/dev/' + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty?.output?.length) {
        has = true;
      }
    });
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();

// end include: postamble.js

