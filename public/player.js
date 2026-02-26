import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Player {
    constructor(camera, scene, vehicle) {
        this.camera = camera;
        this.scene = scene;
        this.vehicle = vehicle;

        this.isSeated = true; // Start in vehicle
        this.position = new THREE.Vector3(0, 1, 0);
        this.speed = 0.2;

        // Movement state
        this.keys = { w: false, a: false, s: false, d: false };

        // Event listeners
        window.addEventListener("keydown", e => this.onKeyDown(e));
        window.addEventListener("keyup", e => this.onKeyUp(e));
    }

    onKeyDown(e) {
        if (e.key === "e") {
            // Toggle seat
            this.isSeated = !this.isSeated;
            if (this.isSeated) {
                // Snap camera to vehicle
                this.camera.position.copy(this.vehicle.mesh.position).add(new THREE.Vector3(0, 2, 5));
                this.camera.lookAt(this.vehicle.mesh.position);
            }
        }

        if (!this.isSeated) {
            if (e.key.toLowerCase() in this.keys) this.keys[e.key.toLowerCase()] = true;
        }
    }

    onKeyUp(e) {
        if (!this.isSeated) {
            if (e.key.toLowerCase() in this.keys) this.keys[e.key.toLowerCase()] = false;
        }
    }

    update() {
        if (!this.isSeated) {
            // Basic walking movement
            if (this.keys.w) this.position.z -= this.speed;
            if (this.keys.s) this.position.z += this.speed;
            if (this.keys.a) this.position.x -= this.speed;
            if (this.keys.d) this.position.x += this.speed;

            // Update camera to follow player
            this.camera.position.set(
                this.position.x,
                this.position.y + 1.5,
                this.position.z + 5
            );
            this.camera.lookAt(this.position.x, this.position.y + 1, this.position.z);
        } else {
            // Follow vehicle
            this.camera.position.set(
                this.vehicle.mesh.position.x,
                this.vehicle.mesh.position.y + 2,
                this.vehicle.mesh.position.z + 5
            );
            this.camera.lookAt(this.vehicle.mesh.position);
        }
    }
}
