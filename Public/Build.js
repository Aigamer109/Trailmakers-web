export class BuildSystem {
    constructor(vehicle, scene){
        this.vehicle = vehicle;
        this.scene = scene;
        this.enabled = false;

        window.addEventListener("click", ()=>{
            if(this.enabled) this.vehicle.addBlock([1,1,1],"basic");
        });
    }

    toggle(){
        this.enabled = !this.enabled;
    }
}
