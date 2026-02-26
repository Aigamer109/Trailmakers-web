import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es/dist/cannon-es.js";
import { Vehicle } from "./vehicle.js";
import { BuildSystem } from "./build.js";
import { Player } from "./player.js";

const socket = io();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);

const world = new CANNON.World({ gravity:new CANNON.Vec3(0,-9.82,0) });

const groundBody = new CANNON.Body({ mass:0, shape:new CANNON.Plane() });
groundBody.quaternion.setFromEuler(-Math.PI/2,0,0);
world.addBody(groundBody);

const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshStandardMaterial({color:0x555555})
);
groundMesh.rotation.x = -Math.PI/2;
scene.add(groundMesh);

const vehicle = new Vehicle(scene, world);
const build = new BuildSystem(vehicle, scene);
const player = new Player(scene, world, camera);

document.addEventListener("keydown", e=>{
    if(e.key==="b") build.toggle();
    if(e.key==="e") player.toggleSeat(vehicle);
});

function animate(){
    world.step(1/60);
    vehicle.update();
    player.update();
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}
animate();
