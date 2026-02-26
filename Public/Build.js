import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { BLOCK_SIZES } from "./constants.js";

export class BuildSystem {

    constructor(vehicle, camera){
        this.vehicle = vehicle;
        this.camera = camera;
        this.enabled = false;
        this.rotation = 0;
        this.current = "1x2";

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.preview = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshStandardMaterial({color:0x00ff00,transparent:true,opacity:0.5})
        );

        vehicle.scene.add(this.preview);

        window.addEventListener("mousemove",e=>{
            this.mouse.x=(e.clientX/window.innerWidth)*2-1;
            this.mouse.y=-(e.clientY/window.innerHeight)*2+1;
        });

        window.addEventListener("keydown",e=>{
            if(e.key==="b") this.enabled=!this.enabled;
            if(e.key==="r") this.rotation+=Math.PI/2;

            const types=["1x2","2x4","4x4","seat","engine","wheel","steering"];
            if(parseInt(e.key)>=1 && parseInt(e.key)<=7){
                this.current=types[parseInt(e.key)-1];
            }
        });

        window.addEventListener("click",()=>{
            if(this.enabled) this.place();
        });
    }

    update(){
        if(!this.enabled) return;

        this.raycaster.setFromCamera(this.mouse,this.camera);
        const intersects=this.raycaster.intersectObject(this.vehicle.mesh,true);

        if(intersects.length>0){
            const p=intersects[0].point;
            this.preview.position.set(
                Math.round(p.x),
                Math.round(p.y),
                Math.round(p.z)
            );
        }
    }

    place(){
        this.vehicle.addBlock(
            this.current,
            this.preview.position.clone(),
            this.rotation
        );
    }
        }
