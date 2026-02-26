export class Network {
    constructor(vehicle, player){
        this.socket = io();
        this.vehicle = vehicle;
        this.player = player;
        this.others = {};

        this.socket.on("init", players=>{
            for(let id in players){
                if(id !== this.socket.id){
                    this.spawnOther(players[id]);
                }
            }
        });

        this.socket.on("playerJoined", data=>{
            this.spawnOther(data);
        });

        this.socket.on("playerState", data=>{
            if(this.others[data.id]){
                this.others[data.id].position.set(
                    data.position.x,
                    data.position.y,
                    data.position.z
                );
            }
        });

        this.socket.on("removePlayer", id=>{
            if(this.others[id]){
                this.vehicle.scene.remove(this.others[id]);
                delete this.others[id];
            }
        });
    }

    spawnOther(data){
        const geo = new THREE.BoxGeometry(1,2,1);
        const mat = new THREE.MeshStandardMaterial({color:0xff0000});
        const mesh = new THREE.Mesh(geo,mat);
        this.vehicle.scene.add(mesh);
        this.others[data.id] = mesh;
    }

    update(){
        this.socket.emit("stateUpdate", {
            id: this.socket.id,
            position: this.player.body.position,
            rotation: this.vehicle.body.quaternion,
            build: this.vehicle.serialize(),
            health: this.vehicle.health
        });
    }
}
