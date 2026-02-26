import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { BLOCK_SIZES } from "./constants.js";

export class BuildSystem {
    constructor(vehicle, camera, renderer) {
        this.vehicle = vehicle;
        this.camera = camera;
        this.renderer = renderer;

        this.enabled = false;
        this.rotation = 0;
        this.current = "1x2";

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // Preview mesh
        const geom = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });
        this.preview = new THREE.Mesh(geom, mat);
        this.preview.visible = false;
        vehicle.scene.add(this.preview);

        // Orbit camera around vehicle
        this.orbitRadius = 10;
        this.orbitAngle = 0;

        // Controls
        window.addEventListener("keydown", e => this.onKeyDown(e));
        window.addEventListener("mousemove", e => this.onMouseMove(e));
        window.addEventListener("click", e => this.onClick(e));
    }

    onKeyDown(e) {
        if (e.key === "b") {
            this.enabled = !this.enabled;
            this.preview.visible = this.enabled;
        }

        if (!this.enabled) return;

        if (e.key === "r") this.rotation += Math.PI / 2;

        const types = ["1x2", "2x4", "4x4", "seat", "engine", "wheel", "steering"];
        if (parseInt(e.key) >= 1 && parseInt(e.key) <= 7) {
            this.current = types[parseInt(e.key) - 1];
        }
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(e) {
        if (this.enabled) this.placeBlock();
    }

    update() {
        if (!this.enabled) return;

        // Orbit camera automatically around vehicle
        this.orbitAngle += 0.01;
        const center = this.vehicle.mesh.position;
        this.camera.position.x = center.x + this.orbitRadius * Math.sin(this.orbitAngle);
        this.camera.position.z = center.z + this.orbitRadius * Math.cos(this.orbitAngle);
        this.camera.position.y = center.y + 5;
        this.camera.lookAt(center);

        // Update preview position using raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.vehicle.mesh, true);
        if (intersects.length > 0) {
            const p = intersects[0].point;
            this.preview.position.set(
                Math.round(p.x),
                Math.round(p.y),
                Math.round(p.z)
            );
            const size = BLOCK_SIZES[this.current];
            this.preview.scale.set(size[0], size[1], size[2]);
        }
    }

    placeBlock() {
        const pos = this.preview.position.clone();
        this.vehicle.addBlock(this.current, pos, this.rotation);
    }
}
