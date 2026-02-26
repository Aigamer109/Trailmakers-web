 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/public/main.js b/public/main.js
index fc4bc606d47235e3b44663419873137e0414a478..789324b0cac59ba4d1355b69721308bc1f06c9db 100644
--- a/public/main.js
+++ b/public/main.js
@@ -1,52 +1,92 @@
-// main.js
-import * as THREE from "three";
-import * as CANNON from "cannon-es";
+import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
 import { Vehicle } from "./vehicle.js";
 import { BuildMode } from "./build.js";
 
 const scene = new THREE.Scene();
-scene.background = new THREE.Color(0x87ceeb);
+scene.background = new THREE.Color(0x9fd8ff);
 
-const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
-const renderer = new THREE.WebGLRenderer({ antialias:true });
+const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
+camera.position.set(0, 8, 12);
+
+const renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setSize(window.innerWidth, window.innerHeight);
+renderer.shadowMap.enabled = true;
 document.body.appendChild(renderer.domElement);
 
-// Lights
-const dirLight = new THREE.DirectionalLight(0xffffff,1);
-dirLight.position.set(10,20,10);
-scene.add(dirLight);
-scene.add(new THREE.AmbientLight(0x404040));
+const hemi = new THREE.HemisphereLight(0xffffff, 0x5d6d7e, 0.8);
+scene.add(hemi);
+
+const sun = new THREE.DirectionalLight(0xffffff, 0.9);
+sun.position.set(15, 25, 10);
+sun.castShadow = true;
+scene.add(sun);
 
-// Grid
-const grid = new THREE.GridHelper(500,50,0x444444,0x888888);
-scene.add(grid);
+const ground = new THREE.Mesh(
+  new THREE.PlaneGeometry(400, 400),
+  new THREE.MeshStandardMaterial({ color: 0x72b86f })
+);
+ground.rotation.x = -Math.PI / 2;
+ground.receiveShadow = true;
+scene.add(ground);
 
-// Physics
-const world = new CANNON.World();
-world.gravity.set(0,-9.81,0);
-world.broadphase = new CANNON.NaiveBroadphase();
+scene.add(new THREE.GridHelper(400, 80, 0x4d4d4d, 0x6b6b6b));
 
-// Vehicle
-const vehicle = new Vehicle(scene, world);
-vehicle.mesh.position.set(0,0,0);
+const vehicle = new Vehicle(scene);
+vehicle.mesh.position.set(0, 0.5, 0);
+vehicle.addBlock("seat", new THREE.Vector3(0, 0, 0));
+vehicle.addBlock("engine", new THREE.Vector3(0, 0, 1));
+vehicle.addBlock("wheel", new THREE.Vector3(-1, 0, 0));
+vehicle.addBlock("wheel", new THREE.Vector3(1, 0, 0));
+vehicle.addBlock("frame", new THREE.Vector3(0, 0, -1));
 
-// Default blocks
-vehicle.addBlock("seat",{x:0,y:1,z:0});
-vehicle.addBlock("engine",{x:1,y:1,z:0});
-vehicle.addBlock("wheel",{x:-1,y:0.5,z:1});
-vehicle.addBlock("wheel",{x:1,y:0.5,z:1});
-vehicle.addBlock("steering",{x:0,y:1.5,z:-1});
+const input = { forward: false, backward: false, left: false, right: false };
+window.addEventListener("keydown", (e) => {
+  const key = e.key.toLowerCase();
+  if (key === "w") input.forward = true;
+  if (key === "s") input.backward = true;
+  if (key === "a") input.left = true;
+  if (key === "d") input.right = true;
+});
+window.addEventListener("keyup", (e) => {
+  const key = e.key.toLowerCase();
+  if (key === "w") input.forward = false;
+  if (key === "s") input.backward = false;
+  if (key === "a") input.left = false;
+  if (key === "d") input.right = false;
+});
 
-// Build mode
-const build = new BuildMode(camera, vehicle);
+const ui = document.getElementById("ui");
+const buildMode = new BuildMode(renderer, camera, scene, vehicle, ({ enabled, selectedType }) => {
+  ui.innerHTML = `
+  <strong>Trailbuilders (Web Lite)</strong><br>
+  B: Toggle Build (${enabled ? "ON" : "OFF"})<br>
+  1: Frame, 2: Engine, 3: Wheel, 4: Seat<br>
+  Click: Place ${selectedType}<br>
+  Drive: W A S D (build must be OFF)
+  `;
+});
 
-// Animate loop
+const clock = new THREE.Clock();
 function animate() {
-    requestAnimationFrame(animate);
-    world.step(1/60);
-    vehicle.update();
-    build.update();
-    renderer.render(scene,camera);
+  requestAnimationFrame(animate);
+  const dt = clock.getDelta();
+
+  buildMode.update();
+  vehicle.update(dt, input, !buildMode.enabled);
+
+  const followDistance = 9;
+  const followHeight = 5;
+  const behind = new THREE.Vector3(0, followHeight, followDistance).applyQuaternion(vehicle.mesh.quaternion);
+  const targetCamPos = vehicle.mesh.position.clone().add(behind);
+  camera.position.lerp(targetCamPos, 0.08);
+  camera.lookAt(vehicle.mesh.position);
+
+  renderer.render(scene, camera);
 }
 animate();
+
+window.addEventListener("resize", () => {
+  camera.aspect = window.innerWidth / window.innerHeight;
+  camera.updateProjectionMatrix();
+  renderer.setSize(window.innerWidth, window.innerHeight);
+});
 
EOF
)
