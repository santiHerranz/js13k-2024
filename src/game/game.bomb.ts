import { drawEngine } from "@/core/draw-engine";
import { time } from "@/index";
import { UnitProperties } from "./unit";
import { TEAM_B } from "@/game-states/game.state";
import { Vector } from "@/core/vector";
import { Shooter } from "./unit.shooter";

export class Bomb extends Shooter {
    constructor(props: UnitProperties, color: string) {
        super(props.position, props.size, TEAM_B);
        this.type = 'bomb';
        this.color = color;
    }

    _update(dt: any): void {
        super._update(dt);
    }

    explode(position: Vector) {
    }

    draw(ctx: CanvasRenderingContext2D) {
        // console.log(`Rendering a BOMB: ${this.name}`);
        super.draw(ctx);


        ctx.beginPath();
        ctx.arc(this.Position.x, this.Position.y, this.Radius*.8 + this.Radius *.2 * Math.cos(time*4), 0, 2*Math.PI);
        ctx.closePath();
    
        ctx.lineWidth = 10;
        ctx.fillStyle = "red";
        // ctx.strokeStyle = "yellow";
        ctx.stroke();
        ctx.fill();

        // Código específico para representar una gema gráficamente
        // drawEngine.drawCircle(this.Position, this.Radius*1.2 + this.Radius *.2 * Math.cos(time*4), {stroke: this.color, fill: 'red', lineWidth: 16});
        drawEngine.drawCircle(this.Position, this.Radius*.8, {stroke: this.color, fill: this.color, lineWidth: 8});
        drawEngine.drawText(''+ this.number, this.Size.length(), this.Position.x, this.Position.y);

    }
}