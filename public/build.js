// build.js
export class BuildMode {
    constructor(camera, vehicle) {
        this.camera = camera;
        this.vehicle = vehicle;
        this.enabled = false;
        this.toolOpen = false;
        this.paintOpen = false;
        this.orbitAngle = 0;
        this.orbitRadius = 10;
        this.keys = { ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false };

        window.addEventListener("keydown", e => {
            if (e.key === "b") this.enabled = !this.enabled;
            if (!this.enabled) return;

            if (e.key in this.keys) this.keys[e.key] = true;
            if (e.key === "t") this.toolOpen = !this.toolOpen;
            if (e.key === "p") this.paintOpen = !this.paintOpen;
        });
        window.addEventListener("keyup", e => { if (e.key in this.keys) this.keys[e.key] = false; });
    }

    update() {
        if (!this.enabled) return;

        const speed = 0.3;
        if (this.keys.ArrowUp) this.orbitRadius -= speed;
        if (this.keys.ArrowDown) this.orbitRadius += speed;
        if (this.keys.ArrowLeft) this.orbitAngle -= speed*0.02;
        if (this.keys.ArrowRight) this.orbitAngle += speed*0.02;

        const center = this.vehicle.mesh.position;
        this.camera.position.x = center.x + this.orbitRadius * Math.sin(this.orbitAngle);
        this.camera.position.z = center.z + this.orbitRadius * Math.cos(this.orbitAngle);
        this.camera.position.y = center.y + 5;
        this.camera.lookAt(center);

        if (this.toolOpen) {
            // Build tool: change keybinds
            const f = prompt("Forward key (current "+this.vehicle.keybinds.forward+"):");
            if(f) this.vehicle.keybinds.forward = f.toLowerCase();
            const b = prompt("Backward key (current "+this.vehicle.keybinds.backward+"):");
            if(b) this.vehicle.keybinds.backward = b.toLowerCase();
            const l = prompt("Left key (current "+this.vehicle.keybinds.left+"):");
            if(l) this.vehicle.keybinds.left = l.toLowerCase();
            const r = prompt("Right key (current "+this.vehicle.keybinds.right+"):");
            if(r) this.vehicle.keybinds.right = r.toLowerCase();
        }

        if (this.paintOpen) {
            // Paint tool: change block colors
            const type = prompt("Block type to paint (seat, engine, wheel, steering, 1x2, 2x4, 4x4):");
            const color = prompt("Hex color (e.g., ff0000):");
            if(type && color) {
                for(let b of this.vehicle.blocks){
                    if(b.type===type) b.mesh.material.color.set(parseInt(color,16));
                }
            }
        }
    }
}
