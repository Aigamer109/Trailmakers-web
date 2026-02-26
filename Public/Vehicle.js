import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es/dist/cannon-es.js";
import { BLOCK_SIZES } from "./constants.js";

export class Vehicle {
    constructor(scene, world){
        this.scene = scene;
        this.world = world;

        this.blocks = [];
        this.engines = 0;
        this.health = 0;

        this.body = new CANNON.Body({
            mass:5,
            shape: new CANNON.Box(new CANNON.Vec3(1,1,1))
        });

        this.body.position.set(0,5,0);
        world.addBody(this.body);

        this.mesh = new THREE.Group();
        scene.add(this.mesh);

        this.body.addEventListener("collide", e=>{
            const impact = e.contact.getImpactVelocityAlongNormal();
            if(impact > 5) this.applyDamage(impact*2);
        });
    }

    addBlock(type, position, rotation){
        const size = BLOCK_SIZES[type];

        const geo = new THREE.BoxGeometry(...size);
        const mat = new THREE.MeshStandardMaterial({
            color: type==="engine"?0xff0000:
                   type==="seat"?0x0000ff:
                   type==="wheel"?0x222222:
                   0x00ffcc
        });

        const mesh = new THREE.Mesh(geo,mat);
        mesh.position.copy(position);
        mesh.rotation.y = rotation;

        this.mesh.add(mesh);

        this.blocks.push({type,mesh,health:50});

        if(type==="engine") this.engines++;
        this.health += 50;
    }

    update(){
        if(this.engines>0){
            const force = new CANNON.Vec3(0,0,-80*this.engines);
            this.body.applyLocalForce(force,new CANNON.Vec3(0,0,0));
        }

        const v = this.body.velocity.length();
        const drag = this.body.velocity.scale(-v*0.02);
        this.body.applyForce(drag);

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    applyDamage(amount){
        this.health -= amount;

        this.blocks.forEach(b=>{
            b.health -= amount/this.blocks.length;
            if(b.health<=0){
                this.mesh.remove(b.mesh);
            }
        });
    }

    serialize(){
        return this.blocks.map(b=>({
            type:b.type,
            position:b.mesh.position,
            rotation:b.mesh.rotation.y
        }));
    }
}
