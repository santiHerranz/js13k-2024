import { Vector } from '@/core/vector';
import { Shooter as Shooter } from '@/game/unit.shooter';
import { Bullet } from '@/game/unit.bullet';
import { Fireball } from './unit-fireball';
import { EntityType } from './EntityType';
import { Unit } from './unit';


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
  type: number;
  owner: Unit | undefined;
  targetPosition: Vector;
  range: number;
}

class BulletBuilder {
  static buildBullet<T>(tipo: Constructor<T>, props: BulletProperties): T {
      return new tipo(props);
  }
}


export function createBullet(bulleType: BULLET_TYPE, shooter: Shooter, bulletSize: Vector, velocity: Vector, targetPosition:Vector): Bullet {

  let shootPosition = shooter.Position.clone().add(new Vector(1, 0).rotate(velocity.heading()).scale((shooter.Radius + bulletSize.length()) * 1.1 ));

  const props : BulletProperties = {
    position: shootPosition, 
    size: bulletSize, 
    team: shooter.team, 
    type: EntityType.Arrow,
    range: shooter.damageRange, 
    owner: shooter,
    targetPosition
  };

  // let bullet = new Fireball(shootPosition, bulletSize, shooter.team, shooter.attackRange, shooter, targetPosition);
  // let bullet = new Fireball(props);
  let bullet: Bullet;
  
    bullet= BulletBuilder.buildBullet(Bullet, props);

  if (bulleType == BULLET_TYPE_FIREBALL)
    bullet = BulletBuilder.buildBullet(Fireball, props);

  return createProjectile(bullet, shooter, bulletSize, velocity, targetPosition);
}

function createProjectile(bullet: Bullet, shooter: Shooter, bulletSize: Vector, velocity: Vector, targetPosition:Vector) {

  bullet.Acceleration = velocity;
  bullet._z = 0;
  bullet._zv = -4*4;

  return bullet;
}

