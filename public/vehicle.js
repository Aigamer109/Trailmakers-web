import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { BLOCK_SIZES } from "./constants.js";

export class Vehicle {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        scene.add(this.mesh);

        this.blocks = [];
        this.remoteBlocks = {};
    }

    addBlock(type, position, rotation = 0) {
        const size = BLOCK_SIZES[type];
        const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const block = new THREE.Mesh(geom, mat);

        block.position.copy(position);
        block.rotation.y = rotation;
        this.mesh.add(block);

        this.blocks.push({ type, position: position.clone(), rotation });
        
        // Multiplayer sync
        if (this.network) {
            this.network.sendBlock(type, position, rotation);
        }
    }

    updateRemoteBlock(data) {
        const { type, pos, rotation } = data;
        const size = BLOCK_SIZES[type];
        const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const mat = new THREE.MeshStandardMaterial({ color: 0x4444ff });
        const block = new THREE.Mesh(geom, mat);

        block.position.set(pos.x, pos.y, pos.z);
        block.rotation.y = rotation;
        this.mesh.add(block);

        this.remoteBlocks[`${pos.x},${pos.y},${pos.z}`] = block;
    }

    attachNetwork(network) {
        this.network = network;
    }

    update() {
        // Update physics or local vehicle logic here
    }
}
