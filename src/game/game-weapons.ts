import { Vector } from '@/core/vector';
import { Shooter as Shooter } from '@/game/unit.shooter';
import { Bullet } from '@/game/unit.bullet';

export interface BulletProperties {
  position: Vector;
  size: Vector;
  team: number;
  targetPosition: Vector;
  range: number;
}


export function createBullet( shooter: Shooter, bulletSize: Vector, velocity: Vector, startOffsetPosition:Vector, targetPosition:Vector): Bullet {

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

  let bullet = new Bullet(props);


  bullet.Acceleration = velocity;
  bullet._z = 10;
  bullet._zv = -1;

  return bullet;

}
