import { Vector } from "@/core/vector";
import { PI } from "@/utils";
import { Unit } from "./unit";
import { transparent } from "./game-colors";


export class Bullet extends Unit {

    startPosition: Vector;
    lastPosition: Vector;
    targetPosition: Vector;
    targetDistance: number;
    currentDistance: number;
    maxHeight: number = 100;

    color: string = '#fff';

        constructor(props: { position: Vector; size: Vector; team: number; range: number; targetPosition: Vector;}) {


        super(props, props.team);

        this.type = 'bullet';

        this.startPosition = props.position.clone();
        this.lastPosition = props.position.clone();
        this.targetPosition = props.targetPosition;
        this.targetDistance = Vector.distance(this.targetPosition,this.startPosition);
        this.currentDistance = 0;
    }

    _update(dt: number): void {

        let distance = Vector.distance(this.Position, this.lastPosition);

        this.currentDistance += distance;

        this.lastPosition = this.Position.clone();

        // easy simulate parabolic
        this._z = Math.cos(-PI/2 + PI*(this.currentDistance/this.targetDistance))*this.maxHeight;

        if (this._z <= 0 ) {
            this.destroy();
            return;
        }
    }

    // _update(dt: number) {
    //     if (this._z <= 0) {
    //         this.destroy()
    //         return
    //     }
    //     super._update(dt)
    // }

    draw(ctx: CanvasRenderingContext2D) {

        super.draw(ctx);

        // drawEngine.drawCircle(this.Position.clone().add(new Vector(0, -this._z)), this.damageRange, { stroke: 'white', fill: transparent, lineWidth: 3 });

        // drawEngine.drawRectangle(this.Position.clone().add(new Vector(0-this.Radius, 0-this.Radius-this._z)), new Vector(this.Radius*2, this.Radius*8), { stroke: this.color, fill: this.color });

        const pos = this.Position.clone().add(new Vector(0-this.Radius, 0-this.Radius-this._z));
        const siz = new Vector(this.Radius, this.Radius*8);

        ctx.fillStyle = this.gradientUpp(ctx, siz, this.Velocity.y);
    
        ctx.lineWidth = 1;
        ctx.strokeStyle = transparent; 
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.Velocity.heading()+PI/2);
        ctx.beginPath();
        ctx.rect(0, 0, siz.x, siz.y);
        ctx.closePath();
    
        ctx.fill();
        ctx.restore();

    }

    explode(position: Vector) {}

    gradientUpp(ctx: { createLinearGradient: (arg0: number, arg1: number, arg2: number, arg3: number) => any; }, size: Vector, velY: number = 0) {

        const gradient = ctx.createLinearGradient(size.x/2, 0, size.x/2, size.y);
    
        let dir = [0,.4,.5,.6,1]; // velY < 0 ? [0,.8,1]:[1,.8,0]; 
        // Add three color stops
        gradient.addColorStop(dir[0], "#F5F6C5");
        gradient.addColorStop(dir[1], '#CAA594');
        gradient.addColorStop(dir[3], transparent); // '#B17FA3'
        gradient.addColorStop(dir[4], transparent);
        return gradient;
    }

}