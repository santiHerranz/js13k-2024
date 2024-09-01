import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector";
import { Unit } from "./unit";
import { TEAM_A } from "@/game-states/game.state";
import { EntityType } from "./EntityType";
import { time } from "@/index";


export type COIN_TYPE = 'yellow' | 'red' | 'blue' | 'green';

export const COIN_TYPE_YELLOW: COIN_TYPE  = 'yellow';
export const COIN_TYPE_RED: COIN_TYPE = 'red';
export const COIN_TYPE_BLUE: COIN_TYPE = 'blue';
export const COIN_TYPE_GREEN: COIN_TYPE = 'green';

interface Constructor<T> {
  new (...args: any[]): T;
}

export interface CoinProperties {
  position: Vector;
  size: Vector;
}

class CoinBuilder {
  static buildCoin<T>(tipo: Constructor<T>, props: CoinProperties): T {
      return new tipo(props);
  }
}


export class Coin extends Unit {

  name: string;
  number: number;
  prefix: string = '';

  color: string = '#fff';

  follow: Unit | undefined;
  showNumber: boolean = false;
  showBall: boolean = true;

  constructor(props: CoinProperties) {

      super(props.position, props.size, TEAM_A, EntityType.Archer );

      this.name = 'coin-' + Math.random().toString(36).substr(2, 5);

      this.number = 0;    
      this.maxVelocity = .002;
      this.maxAcceleration = 100;
  }

  moveForce() { 
      if (this.movePosition) {
          let dist = this.movePosition.clone().subtract(this.Position);
          if (dist.length() > 1)
              return dist.clone().normalize().multiplyByScalar(100).add(dist.multiplyByScalar(.0000015*dist.length()));
          return new Vector(0,0);
      }
      return new Vector(0,0);
  }

  _update(dt: any): void {
      super._update(dt);
      // this._z = -10 * Math.abs(Math.cos(time/100))
      this._z = -20;

      // Grow, Grow, Grow
      if (this.number == 13)
        this.Radius *= 1.001;


      if (this.follow)
        this.movePosition = this.follow.Position.clone().add(new Vector(0, 100));
  }

  draw(ctx: CanvasRenderingContext2D) {

      super.draw(ctx);

      // if (this.targetPosition)
      //     drawEngine.drawLine(this.Position, this.targetPosition,{ stroke: `green`, fill: '' })

      const renderPosition = this.Position;//.clone().add(new Vector(0, this._z));

      this.showBall && drawEngine.drawCircle(renderPosition, this.Radius, {stroke: this.color, fill: this.color, lineWidth: 8}); // this.Size.length()


      let size = this.Radius*1.5 + this.Radius*.5 * Math.abs(Math.cos(time*1.5));

      this.showNumber && drawEngine.drawText(this.prefix + ' ' + this.number, size, renderPosition.x, renderPosition.y);


  }
}


export class CoinRed extends Coin {
  color: string = 'red';
}

export class CoinGreen extends Coin {
    color: string = 'green';
}

export class CoinBlue extends Coin {
    color: string = 'Blue';
}

export class CoinYellow extends Coin {
    color: string = 'yellow';
}

export function createCoin(type: COIN_TYPE, position: Vector, size: Vector = new Vector) : Coin {

    const props : CoinProperties = {
        position, 
        size,
      };

    let coin: Coin;
  
    coin= CoinBuilder.buildCoin(CoinGreen, props);

    if (type == COIN_TYPE_RED)
      coin = CoinBuilder.buildCoin(CoinRed, props);

    if (type == COIN_TYPE_BLUE)
      coin = CoinBuilder.buildCoin(CoinBlue, props);

    if (type == COIN_TYPE_GREEN)
      coin = CoinBuilder.buildCoin(CoinYellow, props);
    
  return coin;
}


