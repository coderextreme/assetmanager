import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';


const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 540;
const MAX_FLOWER_PARAM = 20.0;
const MIN_FLOWER_PARAM = -20.0;
const VELOCITY_STEP = 0.02;
const VELOCITY_BIAS = 0.01;

// Shader code
const vertexSkyboxShader = `
varying vec3 vWorldPosition;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentSkyboxShader = `
uniform samplerCube environmentMap;
varying vec3 vWorldPosition;

void main() {
    vec3 color = textureCube(environmentMap, vWorldPosition).rgb;
    gl_FragColor = vec4(color, 1.0);
}`;

const vertexModelShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float tdelta;
uniform float pdelta;

vec3 cart2sphere(vec3 p) {
    float r = sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    float theta = acos(p.z / r);
    float phi = atan(p.y, p.x);
    return vec3(r, theta, phi);
}

vec3 rose(vec3 p, float a, float b, float c, float d, float tdelta, float pdelta) {
    float rho = a + b * cos(c * p.y + tdelta) * cos(d * p.z + pdelta);
    float x = rho * cos(p.z) * cos(p.y);
    float y = rho * cos(p.z) * sin(p.y);
    float z = rho * sin(p.z);
    return vec3(x, y, z);
}

void main() {
    vec3 sphereCoords = cart2sphere(position);
    vec3 rosePosition = rose(sphereCoords, a, b, c, d, tdelta, pdelta);
    
    vNormal = normalMatrix * normal;
    vPosition = rosePosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(rosePosition, 1.0);
}`;

const fragmentModelShader = `
uniform vec3 chromaticDispersion;
uniform float bias;
uniform float scale;
uniform float power;
uniform samplerCube environmentMap;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    
    vec3 reflected = reflect(-viewDir, normal);
    vec3 refractedR = refract(-viewDir, normal, chromaticDispersion.x);
    vec3 refractedG = refract(-viewDir, normal, chromaticDispersion.y);
    vec3 refractedB = refract(-viewDir, normal, chromaticDispersion.z);
    
    float fresnel = bias + scale * pow(1.0 + dot(-viewDir, normal), power);
    
    vec4 reflectedColor = textureCube(environmentMap, reflected);
    vec4 refractedColor = vec4(
        textureCube(environmentMap, refractedR).r,
        textureCube(environmentMap, refractedG).g,
        textureCube(environmentMap, refractedB).b,
        1.0
    );
    
    gl_FragColor = mix(refractedColor, reflectedColor, fresnel);
}`;

class Flower {
    constructor(scene, environmentMap) {
        this.scene = scene;
        this.translation = new THREE.Vector3();
        this.velocity = new THREE.Vector3(
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01
        );

        // Create shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                environmentMap: { value: environmentMap },
                chromaticDispersion: { value: new THREE.Vector3(0.98, 1.0, 1.033) },
                bias: { value: 0.5 },
                scale: { value: 0.5 },
                power: { value: 2.0 },
                a: { value: 20 },
                b: { value: 10 },
                c: { value: 4 },
                d: { value: 4 },
                tdelta: { value: 0.1 },
                pdelta: { value: 0.1 }
            },
            vertexShader: vertexModelShader,
            fragmentShader: fragmentModelShader
        });

        // Create geometry and mesh
        this.geometry = new THREE.SphereGeometry(10, 64, 64);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.setScalar(0.04);
        scene.add(this.mesh);
    }

    initialize() {
        this.translation.set(0, 0, 0);
        this.velocity.set(
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01
        );
    }

    animate() {
        // Update parameters
        this.material.uniforms.a.value += Math.random() * 0.02 - 0.01;
        this.material.uniforms.a.value = Math.min(Math.max(this.material.uniforms.a.value, MIN_FLOWER_PARAM), MAX_FLOWER_PARAM);

        this.material.uniforms.b.value += Math.random() * 0.02 - 0.01;
        this.material.uniforms.b.value = Math.min(Math.max(this.material.uniforms.b.value, MIN_FLOWER_PARAM), MAX_FLOWER_PARAM);

        this.material.uniforms.c.value += Math.random() * 0.5 - 0.25;
        this.material.uniforms.c.value = Math.min(Math.max(this.material.uniforms.c.value, -5), 5);

        this.material.uniforms.d.value += Math.random() * 0.5 - 0.25;
        this.material.uniforms.d.value = Math.min(Math.max(this.material.uniforms.d.value, -5), 5);

        // Update position
        this.translation.add(this.velocity);
        this.mesh.position.copy(this.translation);

        // Check boundaries
        if (Math.abs(this.translation.x) > 10 ||
            Math.abs(this.translation.y) > 10 ||
            Math.abs(this.translation.z) > 10) {
            this.initialize();
        } else {
            this.velocity.add(new THREE.Vector3(
                Math.random() * 0.02 - 0.01,
                Math.random() * 0.02 - 0.01,
                Math.random() * 0.02 - 0.01
            ));
        }
    }
}

class App {
    constructor() {
        this.init();
        this.animate();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
        this.camera.position.set(2, 2, 2);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        document.body.appendChild(this.renderer.domElement);

        // Create controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Load environment map
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        this.environmentMap = cubeTextureLoader.load([
		'resources/images/all_probes/stpeters_cross/stpeters_right.png',
		'resources/images/all_probes/stpeters_cross/stpeters_left.png',
		'resources/images/all_probes/stpeters_cross/stpeters_top.png',
		'resources/images/all_probes/stpeters_cross/stpeters_bottom.png',
		'resources/images/all_probes/stpeters_cross/stpeters_front.png',
		'resources/images/all_probes/stpeters_cross/stpeters_back.png'
        ]);

        // Create skybox
        const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                environmentMap: { value: this.environmentMap }
            },
            vertexShader: vertexSkyboxShader,
            fragmentShader: fragmentSkyboxShader,
            side: THREE.BackSide
        });
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);

        // Create flowers
        this.flowers = [];
        for (let i = 0; i < 25; i++) {
            this.flowers.push(new Flower(this.scene, this.environmentMap));
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update controls
        this.controls.update();

        // Update flowers
        this.flowers.forEach(flower => flower.animate());

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
