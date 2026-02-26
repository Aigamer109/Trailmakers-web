diff --git a/public/build.js b/public/build.js
index 5065debe1578d0f6765801a144d72b22dde1fcaa..aecb7ab6c078342c52db448c8d94ea25b3613897 100644
--- a/public/build.js
+++ b/public/build.js
@@ -1,62 +1,90 @@
-// build.js
+import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
+import { BUILD_GRID } from "./constants.js";
+
 export class BuildMode {
-    constructor(camera, vehicle) {
-        this.camera = camera;
-        this.vehicle = vehicle;
-        this.enabled = false;
-        this.toolOpen = false;
-        this.paintOpen = false;
-        this.orbitAngle = 0;
-        this.orbitRadius = 10;
-        this.keys = { ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false };
-
-        window.addEventListener("keydown", e => {
-            if (e.key === "b") this.enabled = !this.enabled;
-            if (!this.enabled) return;
-
-            if (e.key in this.keys) this.keys[e.key] = true;
-            if (e.key === "t") this.toolOpen = !this.toolOpen;
-            if (e.key === "p") this.paintOpen = !this.paintOpen;
-        });
-        window.addEventListener("keyup", e => { if (e.key in this.keys) this.keys[e.key] = false; });
+  constructor(renderer, camera, scene, vehicle, onUiUpdate) {
+    this.renderer = renderer;
+    this.camera = camera;
+    this.scene = scene;
+    this.vehicle = vehicle;
+    this.onUiUpdate = onUiUpdate;
+
+    this.enabled = true;
+    this.selectedType = "frame";
+
+    this.raycaster = new THREE.Raycaster();
+    this.mouse = new THREE.Vector2();
+    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
+
+    this.preview = new THREE.Mesh(
+      new THREE.BoxGeometry(1, 1, 1),
+      new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.4 })
+    );
+    this.scene.add(this.preview);
+
+    window.addEventListener("keydown", (e) => this.onKeyDown(e));
+    this.renderer.domElement.addEventListener("mousemove", (e) => this.onMouseMove(e));
+    this.renderer.domElement.addEventListener("click", () => this.tryPlace());
+
+    this.hoverPos = new THREE.Vector3();
+    this.updateUi();
+  }
+
+  updateUi() {
+    this.onUiUpdate({ enabled: this.enabled, selectedType: this.selectedType });
+  }
+
+  onKeyDown(e) {
+    if (e.key.toLowerCase() === "b") {
+      this.enabled = !this.enabled;
+      this.preview.visible = this.enabled;
+      this.updateUi();
+      return;
     }
 
-    update() {
-        if (!this.enabled) return;
-
-        const speed = 0.3;
-        if (this.keys.ArrowUp) this.orbitRadius -= speed;
-        if (this.keys.ArrowDown) this.orbitRadius += speed;
-        if (this.keys.ArrowLeft) this.orbitAngle -= speed*0.02;
-        if (this.keys.ArrowRight) this.orbitAngle += speed*0.02;
-
-        const center = this.vehicle.mesh.position;
-        this.camera.position.x = center.x + this.orbitRadius * Math.sin(this.orbitAngle);
-        this.camera.position.z = center.z + this.orbitRadius * Math.cos(this.orbitAngle);
-        this.camera.position.y = center.y + 5;
-        this.camera.lookAt(center);
-
-        if (this.toolOpen) {
-            // Build tool: change keybinds
-            const f = prompt("Forward key (current "+this.vehicle.keybinds.forward+"):");
-            if(f) this.vehicle.keybinds.forward = f.toLowerCase();
-            const b = prompt("Backward key (current "+this.vehicle.keybinds.backward+"):");
-            if(b) this.vehicle.keybinds.backward = b.toLowerCase();
-            const l = prompt("Left key (current "+this.vehicle.keybinds.left+"):");
-            if(l) this.vehicle.keybinds.left = l.toLowerCase();
-            const r = prompt("Right key (current "+this.vehicle.keybinds.right+"):");
-            if(r) this.vehicle.keybinds.right = r.toLowerCase();
-        }
-
-        if (this.paintOpen) {
-            // Paint tool: change block colors
-            const type = prompt("Block type to paint (seat, engine, wheel, steering, 1x2, 2x4, 4x4):");
-            const color = prompt("Hex color (e.g., ff0000):");
-            if(type && color) {
-                for(let b of this.vehicle.blocks){
-                    if(b.type===type) b.mesh.material.color.set(parseInt(color,16));
-                }
-            }
-        }
+    if (e.key === "1") this.selectedType = "frame";
+    if (e.key === "2") this.selectedType = "engine";
+    if (e.key === "3") this.selectedType = "wheel";
+    if (e.key === "4") this.selectedType = "seat";
+
+    this.updateUi();
+  }
+
+  onMouseMove(e) {
+    const rect = this.renderer.domElement.getBoundingClientRect();
+    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
+    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
+  }
+
+  updatePreview() {
+    this.raycaster.setFromCamera(this.mouse, this.camera);
+    const worldHit = new THREE.Vector3();
+    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, worldHit);
+
+    if (!hit) {
+      this.preview.visible = false;
+      return;
     }
+
+    this.preview.visible = this.enabled;
+    const localGrid = this.vehicle.worldToLocalGrid(worldHit);
+    localGrid.y = 0;
+    this.hoverPos.copy(localGrid);
+
+    const worldPos = this.vehicle.mesh.localToWorld(localGrid.clone());
+    worldPos.x = Math.round(worldPos.x / BUILD_GRID) * BUILD_GRID;
+    worldPos.z = Math.round(worldPos.z / BUILD_GRID) * BUILD_GRID;
+
+    this.preview.position.copy(this.vehicle.worldToLocal(worldPos));
+  }
+
+  tryPlace() {
+    if (!this.enabled) return;
+    this.vehicle.addBlock(this.selectedType, this.hoverPos.clone());
+  }
+
+  update() {
+    if (!this.enabled) return;
+    this.updatePreview();
+  }
 }
