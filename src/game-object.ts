import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { Circle } from "@/quadtree/Circle";
import { Indexable, NodeGeometry } from "@/quadtree/types";
import { transparent } from "./game/game-colors";
import { colorShadow } from "./game/game-colors";
import { debug } from "./game/game-debug";

const excludeVerbose = ['bullet'];

export class GameObject implements Indexable {

    type: string;
    name: string;

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

        this.type = 'obj';
        this.name = Math.random().toString(36).substr(2, 5);

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
            x: this.HitBox.Position.x,
            y: this.HitBox.Position.y,
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

    get HitBox() {
        const Size = this.Size.clone().scale(2);
        const Position = this.Position.clone();
        Position.add(Vector.createSize(this._z));
        Position.add(new Vector(Size.x/2, Size.y/2).scale(-1));
        // Position.add(Size);
        return {Position, Size}; //
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

        // debug.showWires && drawEngine.drawCircle(this.Position.clone().add(new Vector(0,-this._z)), this.Radius, {stroke: '#fff', fill: 'transparent', lineWidth: 2}); // this.Size.length()
        // debug.showVelocity && drawEngine.drawLine(this.Position, this.Position.clone().add(this.Velocity.clone().normalize().multiplyByScalar(this.Size.length())));

        debug.showWires && drawEngine.drawCircle(this.HitBox.Position.add(new Vector(this.HitBox.Size.x/2, this.HitBox.Size.y/2)), this.HitBox.Size.x/2, {stroke: 'red', fill: transparent});
        debug.showWires && drawEngine.drawRectangle(this.HitBox.Position, this.HitBox.Size, {stroke: 'red', fill: transparent});
    }

    destroy() {
        this.Active = false;
    }


}