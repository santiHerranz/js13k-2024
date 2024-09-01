import { rand } from "@/utils";
import { Bullet } from "./unit.bullet";
import { Vector } from "@/core/vector";
import { Unit } from "./unit";
import { debug } from "../game-states/game-config";
import { globalParticles } from './game-particle';
import { Particle } from "./game-particle";


export var fireTime = 500;
export var defaultExplosionTime = 10;


export class Fireball extends Bullet {
    r: number;
    initR: any;
    dx: any;
    dy: any;
    time: number;


    // constructor(position: Vector, size: Vector, team: number, range: number, owner: Unit | undefined, targetPosition:Vector, type: number = EntityType.Arrow) {
        constructor(props: { position: Vector; size: Vector; team: number; range: number; owner: Unit | undefined; targetPosition: Vector; type: number }) {

        super(props);

        this.r = props.size.length();
        this.initR = this.r;

        this.time = fireTime;

    }    


    _update (dt: number) {

        super._update(dt);

        for(var i=0 ; i< (this.r/4) ; i++) {
            this.addParticle(rand(-1,1), rand(-1,1),5);
        }
        

        this.r -= (this.initR - 2)/fireTime;
        this.r = Math.max(1, this.r);

        this.time--;
        if (this.time < 0)
            this.destroy();

    }

    draw(ctx: CanvasRenderingContext2D) {

        // super.draw(ctx)

        ctx.beginPath();
        ctx.arc(this.Position.x, this.Position.y - this._z, this.r, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgb('+Math.floor(rand(230,255))+', 60, 0)';
        ctx.lineWidth = this.r;
        ctx.stroke();
        ctx.fillStyle = 'rgb(220, '+Math.floor(rand(120,160))+', 0)';
        ctx.fill();

        !debug.showWires && globalParticles.forEach(_ => _.draw(ctx));

        // drawEngine.drawText(''+ globalParticles.length, 40, this.Position.x, this.Position.y)


    }

    addParticle (dx: any,dy: any,t: any) {
        var angle = rand(0, 2*Math.PI);
        var mag = rand(0.5*this.r,1.5*this.r);
        var offset = [mag*Math.cos(angle),mag*Math.sin(angle)];
        var parR = rand(5, 12);
        let particleColor;

        var colors = [];
        if (Math.random() > 0.25) {
            colors = [Math.floor(rand(200, 255)), Math.floor(rand(40, 120)), 0, 1];
        } else {
            var smoke = Math.floor(rand(0,64));
            colors = [smoke, smoke, smoke, 1];
        }
        particleColor = 'rgb(' + colors[0] + ', ' + colors[1] + ', ' + colors[2] + ')';

        globalParticles.push(new Particle(this.Position.x+offset[0],this.Position.y+offset[1] - this._z,parR,dx,dy,particleColor,t));
    }

}

