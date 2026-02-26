export class Vehicle {
    constructor(scene, world){
        this.scene = scene;
        this.world = world;
        this.blocks = [];
        this.engines = 0;
        this.health = 0;

        this.body = new CANNON.Body({ mass:5 });
        world.addBody(this.body);

        this.mesh = new THREE.Group();
        scene.add(this.mesh);

        this.body.addEventListener("collide", e=>{
            const impact = e.contact.getImpactVelocityAlongNormal();
            if(impact > 5) this.damage(impact*2);
        });
    }

    addBlock(size=[1,1,1], type="basic"){
        const geo = new THREE.BoxGeometry(...size);
        const mat = new THREE.MeshStandardMaterial({color:0x00ffcc});
        const mesh = new THREE.Mesh(geo,mat);

        mesh.position.set(
            Math.random()*2,
            2+this.blocks.length,
            Math.random()*2
        );

        this.mesh.add(mesh);

        this.blocks.push({mesh,health:50,type});

        this.body.mass += 1;
        this.health += 50;

        if(type==="engine") this.engines++;
    }

    update(){
        if(this.engines>0){
            const force = new CANNON.Vec3(0,0,-50*this.engines);
            this.body.applyLocalForce(force,new CANNON.Vec3(0,0,0));
        }

        // drag
        const v = this.body.velocity.length();
        const drag = this.body.velocity.scale(-v*0.02);
        this.body.applyForce(drag);

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    damage(amount){
        this.health -= amount;

        this.blocks.forEach(b=>{
            b.health -= amount/this.blocks.length;
            if(b.health<=0){
                this.mesh.remove(b.mesh);
            }
        });
    }
}
