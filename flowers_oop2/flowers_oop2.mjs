import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class FlowerScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(0, 5, 10);
        this.controls.update();

        this.flowers = [];
        this.cubemapLoader = new THREE.CubeTextureLoader();
    }

    async initEnvironment() {
        const envMapUrls = [
	    'resources/images/all_probes/stpeters_cross/stpeters_right.png',
	    'resources/images/all_probes/stpeters_cross/stpeters_left.png',
	    'resources/images/all_probes/stpeters_cross/stpeters_top.png',
	    'resources/images/all_probes/stpeters_cross/stpeters_bottom.png',
	    'resources/images/all_probes/stpeters_cross/stpeters_front.png',
	    'resources/images/all_probes/stpeters_cross/stpeters_back.png'
        ];

        this.envMap = await new Promise((resolve) => {
            this.cubemapLoader.load(envMapUrls, (texture) => {
                this.scene.background = texture;
                this.scene.environment = texture;
                resolve(texture);
            });
        });
    }

    createRoseGeometry(params) {
        const { a, b, c, d, tdelta, pdelta } = params;
        
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const indices = [];

        const resolution = 100;
        for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / resolution) {
            for (let phi = 0; phi < Math.PI * 2; phi += Math.PI / resolution) {
                const rho = a + b * Math.cos(c * theta + tdelta) * Math.cos(d * phi + pdelta);
                const x = rho * Math.cos(phi) * Math.cos(theta);
                const y = rho * Math.cos(phi) * Math.sin(theta);
                const z = rho * Math.sin(phi);
                
                positions.push(x, y, z);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geometry;
    }

    createFlowerMaterial() {
        return new THREE.MeshStandardMaterial({
            envMap: this.envMap,
            metalness: 0.8,
            roughness: 0.2
        });
    }

    createFlower(params) {
        const geometry = this.createRoseGeometry(params);
        const material = this.createFlowerMaterial();
        const flower = new THREE.Mesh(geometry, material);
        
        flower.position.x = (Math.random() - 0.5) * 10;
        flower.position.y = (Math.random() - 0.5) * 10;
        flower.position.z = (Math.random() - 0.5) * 10;

        this.scene.add(flower);
        this.flowers.push({
            mesh: flower,
            params: { ...params },
            velocity: new THREE.Vector3(
                Math.random() * 0.02 - 0.01,
                Math.random() * 0.02 - 0.01,
                Math.random() * 0.02 - 0.01
            )
        });
    }

    animateFlowers() {
        const maxParam = 20;
        const minParam = -20;

        this.flowers.forEach(flower => {
            const { mesh, params, velocity } = flower;

            // Randomly modify Rose curve parameters
            params.a += Math.random() * 0.02 - 0.1;
            params.a = Math.max(minParam, Math.min(params.a, maxParam));

            params.b += Math.random() * 0.02 - 0.1;
            params.b = Math.max(minParam, Math.min(params.b, maxParam));

            params.c += Math.random() * 0.5 - 0.25;
            params.c = Math.max(-5, Math.min(params.c, 5));

            params.d += Math.random() * 0.5 - 0.25;
            params.d = Math.max(-5, Math.min(params.d, 5));

            // Update position
            mesh.position.add(velocity);

            // Reset if out of bounds
            if (Math.abs(mesh.position.x) > 10 ||
                Math.abs(mesh.position.y) > 10 ||
                Math.abs(mesh.position.z) > 10) {
                mesh.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
            }

            // Recreate geometry with new parameters
            const newGeometry = this.createRoseGeometry(params);
            mesh.geometry.dispose();
            mesh.geometry = newGeometry;
        });
    }

    async init() {
        await this.initEnvironment();
        
        // Create multiple flowers with different parameters
        for (let i = 0; i < 25; i++) {
            this.createFlower({
                a: 20,
                b: 10,
                c: 4,
                d: 4,
                tdelta: 0.1,
                pdelta: 0.1
            });
        }

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.animateFlowers();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

const flowerScene = new FlowerScene();
flowerScene.init();
