import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { PI } from "@/utils";
import { Unit } from "./unit";


export class Bullet extends Unit {

    startPosition: Vector;
    lastPosition: Vector;
    targetPosition: Vector;
    targetDistance: number;
    currentDistance: number;
    maxHeight: number = 100;

    color: string = '#fff';

        constructor(props: { position: Vector; size: Vector; team: number; type: number; range: number; targetPosition: Vector;}) {


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

        drawEngine.drawCircle(this.Position.clone().add(new Vector(0, -this._z)), this.damageRange, { stroke: 'white', fill: this.color, lineWidth: 3 });

        drawEngine.drawRectangle(this.Position.clone().add(new Vector(0-this.Radius, 0-this.Radius-this._z)), new Vector(this.Radius*2, this.Radius*2), { stroke: this.color, fill: this.color });

    }

    explode(position: Vector) {}

}