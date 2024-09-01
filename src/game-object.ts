import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { Circle } from "@/quadtree/Circle";
import { Indexable, NodeGeometry } from "@/quadtree/types";
import { colorShadow, debug } from './game-states/game-config';

export class GameObject implements Indexable {

    Active: boolean = true;
    Visible: boolean = true;

    Size: Vector;

    Position: Vector;
    Velocity: Vector;
    Acceleration: Vector;
    Mass: number;

    _z: number = 0;
    _zv: number = 0;   // z velocity
    _zgrav: number = 9.8; // gravity


    public _rotation: number = 0;

    public _age: number = 0;

    public _opacity: number = 1;


    attackDamagePoints: number = 0;

    maxVelocity: number;
    maxAcceleration: number;

  selected = false;
  inArea = false;
  hover = false;

  static offsetShadow = new Vector(3, 3);


    constructor(position: Vector, size: Vector) {

        this.Position = position.clone();
        this.Size = size.clone();
        this.Velocity = new Vector(0, 0);
        this.Acceleration = new Vector(0, 0);
        this.Mass = 1;
        this.maxVelocity = 1;
        this.maxAcceleration = 100;

    }

    qtIndex(node: NodeGeometry) {
        return Circle.prototype.qtIndex.call({
            x: this.Position.x,
            y: this.Position.y,
            r: this.Radius,
        }, node);
    }

    get Radius() {
        return this.Size.length();
    }
    set Radius(value) {
        // A partir de la hipotenusa, se calcula el valor de cada cateto igual
        let side = value * Math.sqrt(2) / 2;
        this.Size = new Vector(side, side);
    }


    _update(dt: number) {

        // gravity
        this._zv -= this._zgrav;// * dt;
        this._z = Math.max(0, this._z + this._zv); // 

        if (this._z < 1) {
            this._zv = 0;
        }

        // GameObject.offsetShadow.rotate(2*Math.PI/100)
    }

    draw(ctx: CanvasRenderingContext2D) {


        const thisPosition = this.Position.clone();

        // shadow
        // this.showShadow && drawEngine.drawCircle(thisPosition.clone().add(GameObject.offsetShadow), this.Radius , { stroke: colorShadow, fill: colorShadow, lineWidth: 3 });

        debug.showWires && drawEngine.drawCircle(this.Position.clone().add(new Vector(0,-this._z)), this.Radius, {stroke: '#fff', fill: 'transparent', lineWidth: 2}); // this.Size.length()
        debug.showVelocity && drawEngine.drawLine(this.Position, this.Position.clone().add(this.Velocity.clone().normalize().multiplyByScalar(this.Size.length())));

      
    }

    destroy() {
        this.Active = false;
    }


}