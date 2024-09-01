import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { PI } from "@/utils";
import { Unit } from "./unit";


export class Bullet extends Unit {

    owner: Unit | undefined;

    startPosition: Vector;
    lastPosition: Vector;
    targetPosition: Vector;
    targetDistance: number;
    currentDistance: number;
    maxHeight: number = 100;

    color: string = '#fff';

    // constructor(position: Vector, size: Vector, team: number, range: number, owner: Unit | undefined, targetPosition:Vector, type: number = EntityType.Arrow) {
        constructor(props: { position: Vector; size: Vector; team: number; type: number; range: number; owner: Unit | undefined; targetPosition: Vector;}) {


        super(props.position, props.size, props.team, props.type);

        this.owner = props.owner;

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


        const thisPosition = this.Position.clone().add(new Vector(this.Radius, this.Radius).scale(.5));

        // drawEngine.drawCircle(thisPosition.add(new Vector(0, -this._z)), this.Radius, { stroke: this.color, fill: this.color, lineWidth: 3 });


         let offset = 0; //-this.Radius*3
        // // if (this.Velocity.y > 0)
        // //     offset = this.Radius*4


        drawEngine.drawRectangle(this.Position.clone().add(new Vector(0-this.Radius, 0-this.Radius-this._z)), new Vector(this.Radius*2, this.Radius*2), { stroke: this.color, fill: this.color });


        super.draw(ctx);
    }

    explode(position: Vector) {}

}