import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { Unit, UnitProperties } from "./unit";
import { TEAM_A } from "@/game-states/game.state";
import { time } from "@/index";
import { debug } from "./game-debug";


export type COIN_TYPE = 'collector' | 'yellow' | 'touched' | 'collected' | 'blue' | 'red';

export const COIN_COLLECTOR: COIN_TYPE = 'collector';
export const COIN_YELLOW: COIN_TYPE = 'yellow';
export const COIN_TOUCHED: COIN_TYPE = 'touched';
export const COIN_COLLECTED: COIN_TYPE = 'collected';
export const COIN_BLUE: COIN_TYPE = 'blue';
export const COIN_RED: COIN_TYPE = 'red';


export class Coin extends Unit {

    number: number;
    prefix: string = '';
    color: string = '#fff';
    follow: Unit | undefined;
    showNumber: boolean = true;
    showBall: boolean = true;

    constructor(type: COIN_TYPE, props: UnitProperties) {

        super(props, TEAM_A);

        this.type = type;

        this.number = 0;
        this.maxVelocity = .002;
        this.maxAcceleration = 100;
    }


    moveForce() {
        if (this.movePosition) {
            let dist = this.movePosition.clone().subtract(this.Position);
            if (dist.length() > 1)
                return dist.clone().normalize().multiplyByScalar(100).add(dist.multiplyByScalar(.0000015 * dist.length()));
            return new Vector(0, 0);
        }
        return new Vector(0, 0);
    }

    _update(dt: any): void {
        super._update(dt);
        // this._z = -10 * Math.abs(Math.cos(time/100))
        this._z = -20;

        if (this.follow)
            this.movePosition = this.follow.Position.clone().add(new Vector(0, 100));

    }

    draw(ctx: CanvasRenderingContext2D) {

        super.draw(ctx);

        // if (this.targetPosition)
        //     drawEngine.drawLine(this.Position, this.targetPosition,{ stroke: `green`, fill: '' })

        const renderPosition = this.Position;//.clone().add(new Vector(0, this._z));

        if (!debug.showWires && this.showBall) {
            drawEngine.drawCircle(renderPosition, this.Radius, { stroke: 'orange', fill: 'orange', lineWidth: 4 });
            drawEngine.drawCircle(renderPosition, this.Radius *.9, { stroke: this.color, fill: this.color, lineWidth: 0 });
        }


        let size = this.Radius + this.Radius * .3 * Math.abs(Math.cos(time * 1.5));

        this.showNumber && drawEngine.drawText((this.prefix != '' ? this.prefix + ' ' : '') + this.number, size, renderPosition.x, renderPosition.y);


    }
}


