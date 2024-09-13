import { Vector } from "@/core/vector";
import { Unit, UnitProperties } from "./unit";
import { globalAddParticle } from "./game-particle";
import { rand } from "@/utils";
import { globalParticleTime, globalParticles } from './game-particle';
import { defaultExplosionTime, fireTime } from "./game-config";

export class Explosion extends Unit {

    lastPos: Vector;
    range: number;
    fillColor = 'white';
    strokeColor = 'white';

    r: number;
    initR: any;
    time: number;
    explosionTime: number;


    constructor(props: UnitProperties, team: number, range: number, explosionTime = defaultExplosionTime) {
        super(props, team);

        this.lastPos = props.position.clone();
        this.range = range;
        this.damageRange = range;

        this.r = range;
        this.initR = this.r;
        this.explosionTime = explosionTime;
        this.time = explosionTime;

    }

    _update(dt: any): void {

        let factor = 1;
        if (this.time > this.explosionTime * .85) {
            factor = -1;
            // final phase explode circle
            for (var theta = 0; theta < 2 * Math.PI; theta += Math.PI / rand(1, 5)) {
                globalAddParticle(this.Position, this.r*.1, this.color, 1.5 * Math.cos(theta), 1.5 * Math.sin(theta), globalParticleTime);
                this.r -= (this.initR - 2) / this.explosionTime;
            }
        } 
        // else {
        //     for (var theta = 0; theta < 2 * Math.PI; theta += Math.PI / rand(1, 5)) {
        //         globalAddParticle(this.Position, this.r*.1, rand(1)>.5?'#000':'#ff0', 1.5 * Math.cos(theta), 1.5 * Math.sin(theta), globalParticleTime);
        //         this.r -= (this.initR*.5 - 2) / this.explosionTime;
        //     }

        // }


        this.time--;
        if (this.time < 0)
            this.destroy();

        this.r += factor * (this.initR - 2) / fireTime;
        this.r = Math.max(5, this.r);

        super._update(dt);
    }


    draw(ctx: CanvasRenderingContext2D) {

        const thisPosition = this.Position.clone();//.add(new Vector(this.Radius, this.Radius).scale(.5));

        // drawEngine.context.globalAlpha = .5
        // drawEngine.drawCircle(thisPosition.add(new Vector(0, -this._z)), this.Radius, { stroke: this.strokeColor, fill: this.fillColor, lineWidth: 10 });
        // drawEngine.context.globalAlpha = 1


        // drawEngine.drawText('' + this.healthPoints, 15, thisPosition.x, thisPosition.y); // + '/' + this.damagePoints
        // drawEngine.drawText('' + this.time, 50, thisPosition.x, thisPosition.y); // + '/' + this.damagePoints
        super.draw(ctx);

    }


    delParticle(i: any) {
        globalParticles.splice(i, 1);
    }

}