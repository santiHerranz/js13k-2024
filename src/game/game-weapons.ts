import { Vector } from '@/core/vector';
import { Shooter as Shooter } from '@/game/unit.shooter';
import { Bullet } from '@/game/unit.bullet';
import { Fireball } from './unit-fireball';

export type BULLET_TYPE = 'bullet' | 'fireball';

export const BULLET_TYPE_BULLET: BULLET_TYPE  = 'bullet';
export const BULLET_TYPE_FIREBALL: BULLET_TYPE = 'fireball';

interface Constructor<T> {
  new (...args: any[]): T;
}

export interface BulletProperties {
  position: Vector;
  size: Vector;
  team: number;
  targetPosition: Vector;
  range: number;
}

class BulletBuilder {
  static buildBullet<T>(tipo: Constructor<T>, props: BulletProperties): T {
      return new tipo(props);
  }
}


export function createBullet(bulleType: BULLET_TYPE, shooter: Shooter, bulletSize: Vector, velocity: Vector, startOffsetPosition:Vector, targetPosition:Vector): Bullet | Fireball {

  // offset the bullet start position outside the boby shooter
  let startPosition = shooter.Position.clone().add(new Vector(1, 0).rotate(velocity.heading()).scale((shooter.Radius + bulletSize.length()) * 1.1 ));

  startPosition.add(startOffsetPosition);

  const props : BulletProperties = {
    position: startPosition, 
    size: bulletSize, 
    team: shooter.team, 
    range: shooter.damageRange, 
    targetPosition
  };

  // let bullet = new Fireball(shootPosition, bulletSize, shooter.team, shooter.attackRange, shooter, targetPosition);
  // let bullet = new Fireball(props);
  let bullet: Bullet;
  
  if (bulleType == BULLET_TYPE_BULLET)
    bullet= BulletBuilder.buildBullet(Bullet, props);

  else if (bulleType == BULLET_TYPE_FIREBALL)
    bullet = BulletBuilder.buildBullet(Fireball, props);
  else 
    throw new Error(`Unknown bullet type: ${bulleType}`);

  bullet.Acceleration = velocity;
  bullet._z = 10;
  bullet._zv = -1;

  return bullet;

}
