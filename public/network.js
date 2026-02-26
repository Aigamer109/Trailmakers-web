import io from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

export class Network {
    constructor(vehicle) {
        this.vehicle = vehicle;
        this.socket = io();

        // When another player joins or updates their vehicle
        this.socket.on("updateBlock", data => {
            if (data.playerId === this.socket.id) return;
            this.vehicle.updateRemoteBlock(data);
        });

        this.socket.on("playerJoined", data => {
            console.log("Player joined:", data.id);
        });
    }

    sendBlock(type, pos, rotation) {
        this.socket.emit("placeBlock", {
            type,
            pos: { x: pos.x, y: pos.y, z: pos.z },
            rotation
        });
    }

    update() {
        // Add any regular position/rotation updates here if needed
    }
}
