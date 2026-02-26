export class Player {
    constructor(scene, world, camera){
        this.camera = camera;
        this.body = new CANNON.Body({
            mass:1,
            shape:new CANNON.Sphere(0.5)
        });
        this.body.position.set(0,5,5);
        world.addBody(this.body);

        this.inSeat = false;

        window.addEventListener("keydown", e=>{
            if(!this.inSeat){
                if(e.key==="w") this.body.velocity.z=-5;
                if(e.key==="s") this.body.velocity.z=5;
                if(e.key==="a") this.body.velocity.x=-5;
                if(e.key==="d") this.body.velocity.x=5;
            }
        });
    }

    toggleSeat(vehicle){
        this.inSeat = !this.inSeat;
        if(this.inSeat){
            this.camera.position.set(0,2,5);
        }
    }

    update(){
        if(!this.inSeat){
            this.camera.position.copy(this.body.position);
        }
    }
}
