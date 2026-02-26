import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { Vehicle } from "./vehicle.js";
import { BuildSystem } from "./build.js";
import { Network } from "./network.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Ground
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Vehicle + Network + Build System
const vehicle = new Vehicle(scene);
const network = new Network(vehicle);
vehicle.attachNetwork(network);
const build = new BuildSystem(vehicle, camera, renderer);

camera.position.set(10, 10, 10);
camera.lookAt(0,0,0);

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    vehicle.update();
    build.update();
    network.update();

    renderer.render(scene, camera);
}
animate();
