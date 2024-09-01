import { BULLET_TYPE_BULLET, BULLET_TYPE_FIREBALL } from "@/game/game-weapons";
import { Timer } from "@/utils";


export const colorShadow: string = 'rgb(10,10,10,0.2)';
export const transparent: string = 'transparent'; 


export const soundWaitTime: Timer = new Timer(0);

export const GameConfig = {
  playerUnits: 1,

  playerSize: 50,
  playerBulletSize: 10,
  playerBulletSpeed: 20, // 5-100
  playerShootCoolDownValue: .2,
  playerBulletType: BULLET_TYPE_BULLET,// BULLET_TYPE_FIREBALL, // 

  enemySize: 30,
  enemyBulletSize: 8,
  enemyBulletSpeed: 10,
  enemyShootCoolDownValue: 2,
  enemyBulletType: BULLET_TYPE_BULLET, // BULLET_TYPE_FIREBALL, // 
  levelEnemyMaxCount: 20,

  coinSize: 30,
  coin13Size: 60,
};

export const debug = {
  showWires: 0,
  showMoveWires: 0,
  showTargetWires: 0,
  showQuadtree: 0,
  showVelocity: 0,
  showButtonBounds: 0,
  testCoins: 0,
  damageMessages: 0,
};

