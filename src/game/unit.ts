import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { GameObject } from "@/game-object";
import { debug, colorShadow } from "@/game-states/game-config";
import { EntityType } from "./EntityType";

export class Unit extends GameObject {

    showShadow: boolean = true;

    type: number = EntityType.None;
    
    team: number;
    number: number;

    // Health
    private _maxHealthPoints: number = 100;
    private _healthPoints: number = this._maxHealthPoints;


    damagePoints: number;
    damageRange: number;

    color: string = '';

    movePosition: Vector | undefined;
    path: Vector[] = [];
    currentPoint: number = 0;


    public get maxHealthPoints(): number {
        return this._maxHealthPoints;
    }
    public set maxHealthPoints(value: number) {
        this._maxHealthPoints = value;
        this._healthPoints = value;
    }

    public get healthPoints(): number {
        return this._healthPoints;
    }    

    applyDamage(value: number) {
        this._healthPoints -= value;
        this._healthPoints = Math.max(0,this._healthPoints);
        // console.log('applyDamage: '+ this._healthPoints +' ' + value);
      }

    constructor(position: Vector, size: Vector, team: number, type: number) {
        super(position, size);

        this.type = type;
        this.team = team;
        this.number = 0;       

        this.maxVelocity = .02;
        this.maxAcceleration = 100;

        this.damagePoints = 100;
        this.damageRange = this.Radius;
    }


    moveForce() { 
        if (this.movePosition) {
            let dist = this.movePosition.clone().subtract(this.Position);
            if (dist.length() > this.Radius*3)
                return dist.clone().normalize().multiplyByScalar(.1);//.add(dist.multiplyByScalar(.0000015*dist.length()));
            else {
                this.currentPoint += 1;
                if (this.currentPoint > this.path.length-1) this.currentPoint = 0;
                this.movePosition = this.path[this.currentPoint];
            }
            return new Vector(0,0);
        }
        return new Vector(0,0);
    }

    loadProperties() {

        // this.healthPoints = this.healthPointsMax = this.dataValues.health

        // this.attackDamagePoints = this.dataValues.attackDamage
        // this.attackRangeFactor = this.dataValues.attackRangeFactor
        // this.attackCoolDownValue = this.dataValues.attackCoolDown

        // this.dataValues.shootRangeFactor && (this.shootRangeFactor = this.dataValues.shootRangeFactor)

        // this.shootRangeMinimun = this.shootRangeFactor * .3
        // this.shootCoolDownValue = this.dataValues.shootCoolDown!

        // this.speedFactor = this.dataValues.speedFactor
        // this.maxSpeed = this.Radius * this.speedFactor / 200

        // this.VisionRange = 0
    }

    shootTo(targetPosition: Vector) { }


    _update(dt: any): void {
        super._update(dt);
        //this._z = -10 * Math.abs(Math.cos(time/300))

    }

    draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);


        debug.showMoveWires && this.movePosition && drawEngine.drawLine(this.Position, this.movePosition, { stroke: 'green'});

        // units shadow
        this.showShadow && drawEngine.drawCircle(this.Position, this.damageRange, {stroke: colorShadow, fill: colorShadow, lineWidth: 2}); // this.Size.length()
    }


}


