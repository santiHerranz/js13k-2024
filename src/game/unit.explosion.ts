import { Vector } from "@/core/vector";
import { EntityType as EntityType } from "./EntityType";
import { Unit } from "./unit";
import { defaultExplosionTime, fireTime } from "./unit-fireball";
import { globalAddParticle } from "./game-particle";
import { rand } from "@/utils";
import { globalParticleTime, globalParticles } from './game-particle';

export class Explosion extends Unit {

    owner: Unit | undefined;

    lastPos: Vector;
    range: number;
    fillColor = 'white';
    strokeColor = 'white';

    r: number;
    initR: any;
    time: number;
    explosionTime: number;

        
    constructor(position: Vector, size: Vector, team: number, range: number, owner: Unit, explosionTime = defaultExplosionTime) {
        super(position, size, team, EntityType.Explosion);

        this.owner = owner;

        this.lastPos = position.clone();
        this.range = range;
        this.damageRange = range;

        this.r = range;
        this.initR = this.r;  
        this.explosionTime = explosionTime;            
        this.time = explosionTime;            

    }

    _update(dt: any): void {


        if (this.time < this.explosionTime*.5) {
            // final phase explode circle
            for (var theta = 0; theta < 2 * Math.PI; theta += Math.PI / rand(5,10)) {
                globalAddParticle(this.Position, this.r, this.color, 2*Math.cos(theta), 2*Math.sin(theta), globalParticleTime);
                this.r -= (this.initR - 2) / this.explosionTime;
            }        

    
        }

        this.Size.scale(1.02);
        // if (this.Size.length() > this.range)
        //     this.destroy()


        this.time--;
        if (this.time < 0 )
            this.destroy();

        this.r -= (this.initR - 2)/fireTime;
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


    delParticle (i: any) {
        globalParticles.splice(i, 1);
    }

}