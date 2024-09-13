import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { GameObject } from "@/game-object";
import { time } from "@/index";
import { colorShadow } from "./game-colors";
import { debug } from "./game-debug";

export class Unit extends GameObject {

    showShadow: boolean = true;
   
    hits: number = 0;

    team: number;
    number: number;

    // Health
    private _maxHealthPoints: number = 100;
    private _healthPoints: number = this._maxHealthPoints;

    // Shield
    private _maxShieldPoints: number = 0;
    private _shieldPoints: number = this._maxShieldPoints;


    damagePoints: number;
    damageRange: number;

    color: string = '';

    movePosition: Vector | undefined;
    path: Vector[] = [];
    currentPoint: number = 0;

    public get healthRatio(): number {
        return this._healthPoints/this._maxHealthPoints;
    }
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

    public get shieldRatio(): number {
        return this._shieldPoints/this._maxShieldPoints;
    }

    public get maxShieldPoints(): number {
        return this._maxShieldPoints;
    }
    public set maxShieldPoints(value: number) {
        this._maxShieldPoints = value;
        this._shieldPoints = value;
    }

    public get shieldPoints(): number {
        return this._shieldPoints;
    }    


    applyDamage(value: number) {
        this.hits = Math.round(value/10);
        if (this.shieldPoints == 0) {
            this._healthPoints -= value;
            this._healthPoints = Math.max(0,this._healthPoints);
            // console.log('applyDamage: '+ this._healthPoints +' ' + value);
        } else {
            this._shieldPoints -= value;
            this._shieldPoints = Math.max(0,this._shieldPoints);
            // console.log('applyDamage: '+ this._shieldPoints +' ' + value);
        }
      }

    constructor(props: UnitProperties, team: number) {
        super(props.position, props.size);

        this.team = team;
        this.number = 0;       

        this.maxVelocity = .02;
        this.maxAcceleration = 100;

        this.damagePoints = 100;
        this.damageRange = this.Radius;
    }

    setDynamicProperties() {};


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
        

    }

    draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);


        debug.showMoveWires && this.movePosition && drawEngine.drawLine(this.Position, this.movePosition, { stroke: 'green'});

        // units shadow
        this.showShadow && drawEngine.drawCircle(this.Position, this.damageRange, {stroke: colorShadow, fill: colorShadow, lineWidth: 2}); // this.Size.length()

    }


}

// interface Constructor<T> {
//   new (...args: any[]): T;
// }


export interface UnitProperties {
  position: Vector;
  size: Vector;
}


