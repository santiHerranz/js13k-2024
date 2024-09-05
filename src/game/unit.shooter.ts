import { Vector } from "@/core/vector";

import { Timer } from "@/utils";
import { Unit } from "./unit";
import { drawEngine } from "@/core/draw-engine";
import { TEAM_A, TEAM_B } from "@/game-states/game.state";
import { BULLET_TYPE, BULLET_TYPE_BULLET } from "./game-weapons";
import { imageSource, time } from "@/index";
import { debug, transparent } from "@/game-states/game-config";

export class Shooter extends Unit {

    scorePoints = 100;

    planeImage = new Image();
    planeImageScale = 8;

    shootCoolDownValue: number = 1;
    shootRangeMinimun: number = 0;
    shootCoolDownTimer: Timer = new Timer(undefined);
    slowWhileInRange: boolean = true;
    shootRange: number = 100;
    speedFactor: number = 1;
    maxSpeed: number = 10;

    targetPosition: Vector | undefined;

    canDodge = false;

    bulletSpeed: number = 14;
    weaponBulletType: BULLET_TYPE = BULLET_TYPE_BULLET;

    shotPhase = 0;

    constructor(position: Vector, size: Vector, team: number) {
        super({ position, size }, team);
        this.targetPosition = undefined;

        this.loadProperties();

        this.planeImage.src = imageSource;

        this.getImage(this.planeImageScale);

    }


    explode(position: Vector) { }


    public shootHandler(targetPosition: Vector, velocity: Vector, zv: number) { }

    private _shoot(targetPosition: Vector, velocity: Vector) {
        if (this.shootCoolDownTimer.elapsed()) {
            this.shootHandler(targetPosition, velocity, 0);
            this.shootCoolDownTimer.set(this.shootCoolDownValue);
        }
    }

    public shootTo(position: Vector, zv: number = 10) {
        const data = this.calculateShoot(position); //.rotate(rand(this.bulletSpread, -this.bulletSpread))
        this._shoot(position, data.velocity);
    }


    _update(dt: any): void {

        this._z = -100;
        this._zv = -this._zgrav;

        let canShoot = false;

        if (this.targetPosition != undefined) {
            let distance = this.Position.distance(this.targetPosition);
            canShoot = distance < this.shootRange && distance > this.shootRangeMinimun;
        }

        // FEATURE slow movement while target
        // if (this.slowWhileInRange && canShoot) { // && this.attackCoolDownTimer.p100() < 100
        //     this.Velocity.scale(.5)
        //     this.Acceleration.scale(.5)
        //     this.maxSpeed = this.Radius * this.speedFactor / 1000
        // }
        // else
        //     this.maxSpeed = this.Radius * this.speedFactor / 100

        // Enemy Jum
        if (this.team == TEAM_B && this.canDodge) {
            this._z = 150 + 50 * Math.cos(time * 2);
        }

        super._update(dt);

        if (this.targetPosition && canShoot) {
            this.shootTo(this.targetPosition);
        }
    }


    draw(ctx: CanvasRenderingContext2D, dir: boolean = false) {

        super.draw(ctx);

        if (!this.Visible) return;

        const renderPosition = this.Position.clone().add(new Vector(0, -this._z)); // flight height

        debug.showTargetWires && this.targetPosition && drawEngine.drawLine(this.Position, this.targetPosition, { stroke: `red` });

        if (this.team == TEAM_A) {
            this.planeImageScale = 4 * this.Size.x * .8 + 4 * this.Size.x * .2 * Math.abs(Math.cos(time)); // 1; //
            !debug.showWires && drawEngine.context.drawImage(this.planeImage, renderPosition.x - .5 * this.planeImageScale, renderPosition.y - .5 * this.planeImageScale, this.planeImageScale, this.planeImageScale);
        }

        if (this.team == TEAM_A) {
            debug.showWires && drawEngine.drawCircle(renderPosition, this.Radius, { stroke: this.color, fill: transparent, lineWidth: 4 }); // this.Size.length()
        } else {
            !debug.showWires && drawEngine.drawRectangle(renderPosition.clone().add(new Vector(-this.Size.x, -this.Size.y)), new Vector(this.Size.x * 2, this.Size.y * 2), { stroke: this.color, fill: this.color });

            // HEALTH BAR
            const healthBarPosition = renderPosition; //.clone().add(new Vector(0, this.Size.y*.1));
            !debug.showWires && drawEngine.drawBar(healthBarPosition, this.Size, this.Size.y * 2, this.healthPoints, this.maxHealthPoints, '#0f0', this.healthPoints < this.maxHealthPoints * .8, 4);
            debug.showWires && drawEngine.drawText(this.healthPoints + "/" + this.maxHealthPoints, 30, healthBarPosition.x, healthBarPosition.y + this.Size.y * 2.4);

        }


        drawEngine.drawLine(this.Position, this.Position.clone().add(this.moveForce().normalize().multiplyByScalar(this.Size.length())), { stroke: 'yellow' });


        let size = this.Radius * .8 + this.Radius * .2 * Math.abs(Math.cos(time)); //this.Radius;// + this.Radius * Math.abs(Math.sin(time));

        // this.team == TEAM_A && 
        if (this.team == TEAM_A && this.number > 0) {
            // const numberPosition = new Vector(this.Position.x, this.Position.y - .7*this.planeImageScale);
            // drawEngine.drawCircle(numberPosition, this.Radius*.6, {stroke: this.color, fill: this.color, lineWidth: 4}); // this.Size.length()
            // drawEngine.drawText(''+ this.number, size , numberPosition.x, numberPosition.y);

        }

        // Show enemy number
        // if (this.team == TEAM_B) {
        //     drawEngine.drawText(''+ this.number, size , this.Position.x, this.Position.y + 5);
        // }
    }


    calculateShoot(targetPosition: Vector): { velocity: Vector } {

        const direction = -Math.atan2(this.Position.x - targetPosition.x, this.Position.y - targetPosition.y) - Math.PI / 2;
        const velocity = new Vector(1, 0).rotate(direction).scale(this.bulletSpeed);
        return { velocity };
    }


    getImage(scale: number = 1) {
        this.planeImage = this.prepareImage(scale);
    }

    prepareImage(scale: number = 1) {

        const canvas = c2d.cloneNode();
        canvas.width = scale * 32;
        canvas.height = scale * 32;
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

        // ctx.translate(-32, -32);
        // ctx.scale(1/2, 1/2);

        ctx.imageSmoothingEnabled = false;
        // ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Dibuja la imagen en el lienzo
        ctx.beginPath();


        // // bright
        // ctx.filter = 'brightness(200) blur()';
        // ctx.drawImage(appSprite, 0 + (32 * Math.floor(index % 8)), 32 * Math.floor(index / 8), 32, 32, 0-1, 0-1, 32, 32); // 

        // // shadow
        // ctx.filter = 'brightness(0)';
        // ctx.drawImage(appSprite, 0 + (32 * Math.floor(index % 8)), 32 * Math.floor(index / 8), 32, 32, 0+1, 0+1, 32, 32); // 


        // image
        ctx.filter = 'drop-shadow(10px 10px 10px #222)';
        ctx.drawImage(this.planeImage, 0, 0, scale * 32, scale * 32); // 
        // ctx.drawImage(appSprite, 0 , 0, scale*32, scale*32); // 

        // ctx.setTransform(1, 0, 0, 1, 0, 0);

        let image = new Image();
        image.src = canvas.toDataURL();

        return image;
    }

}