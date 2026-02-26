// main.js
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Vehicle } from "./vehicle.js";
import { BuildMode } from "./build.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const dirLight = new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(10,20,10);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x404040));

// Grid
const grid = new THREE.GridHelper(500,50,0x444444,0x888888);
scene.add(grid);

// Physics
const world = new CANNON.World();
world.gravity.set(0,-9.81,0);
world.broadphase = new CANNON.NaiveBroadphase();

// Vehicle
const vehicle = new Vehicle(scene, world);
vehicle.mesh.position.set(0,0,0);

// Default blocks
vehicle.addBlock("seat",{x:0,y:1,z:0});
vehicle.addBlock("engine",{x:1,y:1,z:0});
vehicle.addBlock("wheel",{x:-1,y:0.5,z:1});
vehicle.addBlock("wheel",{x:1,y:0.5,z:1});
vehicle.addBlock("steering",{x:0,y:1.5,z:-1});

// Build mode
const build = new BuildMode(camera, vehicle);

// Animate loop
function animate() {
    requestAnimationFrame(animate);
    world.step(1/60);
    vehicle.update();
    build.update();
    renderer.render(scene,camera);
}
animate();
