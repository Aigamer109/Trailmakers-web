// vehicle.js
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { BLOCK_SIZES, BLOCK_COLORS, MAX_SPEED_PER_ENGINE, DEFAULT_KEYBINDS } from "./constants.js";

export class Vehicle {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.blocks = [];
        this.mesh = new THREE.Group();
        this.physicsBodies = [];
        this.scene.add(this.mesh);
        this.seat = null;

        // Keybinds
        this.keybinds = { ...DEFAULT_KEYBINDS };
        this.movementState = { forward:false, backward:false, left:false, right:false };

        window.addEventListener("keydown", e => {
            const key = e.key.toLowerCase();
            if (key === this.keybinds.forward) this.movementState.forward = true;
            if (key === this.keybinds.backward) this.movementState.backward = true;
            if (key === this.keybinds.left) this.movementState.left = true;
            if (key === this.keybinds.right) this.movementState.right = true;
        });
        window.addEventListener("keyup", e => {
            const key = e.key.toLowerCase();
            if (key === this.keybinds.forward) this.movementState.forward = false;
            if (key === this.keybinds.backward) this.movementState.backward = false;
            if (key === this.keybinds.left) this.movementState.left = false;
            if (key === this.keybinds.right) this.movementState.right = false;
        });
    }

    addBlock(type, position, rotation=0) {
        // Prevent overlapping
        for (let b of this.blocks) {
            const dx = Math.abs(b.position.x - position.x);
            const dy = Math.abs(b.position.y - position.y);
            const dz = Math.abs(b.position.z - position.z);
            const size = BLOCK_SIZES[type];
            if (dx < size[0] && dy < size[1] && dz < size[2]) return;
        }

        let geom, shape;
        if (type === "wheel") {
            geom = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 24);
            shape = new CANNON.Cylinder(0.5, 0.5, 0.5, 24);
        } else {
            const s = BLOCK_SIZES[type];
            geom = new THREE.BoxGeometry(s[0], s[1], s[2]);
            shape = new CANNON.Box(new CANNON.Vec3(s[0]/2, s[1]/2, s[2]/2));
        }

        const mat = new THREE.MeshStandardMaterial({ color: BLOCK_COLORS[type] });
        const mesh = new THREE.Mesh(geom, mat);

        if (type === "wheel") mesh.rotation.z = Math.PI / 2;

        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.y = rotation;
        this.mesh.add(mesh);

        const body = new CANNON.Body({ mass: type === "engine" || type === "wheel" ? 1 : 0 });
        body.addShape(shape);
        body.position.set(position.x, position.y, position.z);
        this.world.addBody(body);

        this.blocks.push({ type, mesh, body, position, rotation });

        if (type === "seat") this.seat = mesh;
        if (type === "wheel") this.addHinge(body, position);
    }

    addHinge(body, position) {
        const hinge = new CANNON.HingeConstraint(body, new CANNON.Body({ mass:0 }), {
            pivotA: new CANNON.Vec3(0,0,0),
            axisA: new CANNON.Vec3(0,0,1)
        });
        this.world.addConstraint(hinge);
    }

    getTotalSpeed() {
        const engines = this.blocks.filter(b => b.type === "engine").length;
        return engines * MAX_SPEED_PER_ENGINE;
    }

    canMove() {
        return this.blocks.some(b => b.type === "wheel") &&
               this.blocks.some(b => b.type === "engine");
    }

    update() {
        if (!this.canMove()) return;

        const speed = this.getTotalSpeed();
        let dirZ = 0;
        let dirX = 0;
        if (this.movementState.forward) dirZ -= 1;
        if (this.movementState.backward) dirZ += 1;
        if (this.movementState.left) dirX -= 1;
        if (this.movementState.right) dirX += 1;

        const forwardVec = new CANNON.Vec3(dirX*speed, 0, dirZ*speed);
        for (let block of this.blocks) {
            if (block.type === "wheel") {
                block.body.velocity.set(forwardVec.x, block.body.velocity.y, forwardVec.z);
            }
        }

        for (let block of this.blocks) {
            block.mesh.position.copy(block.body.position);
            block.mesh.quaternion.copy(block.body.quaternion);
        }
    }
}
