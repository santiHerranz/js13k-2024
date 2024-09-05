import { BULLET_TYPE_BULLET, BULLET_TYPE_FIREBALL } from "@/game/game-weapons";
import { Timer } from "@/utils";
import { scrollSpeed } from "./game.state";


export const colorShadow: string = 'rgb(10,10,10,0.2)';
export const transparent: string = 'transparent'; 


export const PLAYER_SHOOT_PATTERN_MODES: { origin: number[]; dest: number[]; cooldown: number; }[] = [
  { origin: [0], dest: [0], cooldown: 1, }, // single straight bullet
  { origin: [-1, 1], dest: [0, 0], cooldown: .05, }, // double straight bullet
  { origin: [-1, 0, 1], dest: [0, 0, 0], cooldown: .01, },
  { origin: [0, -1, 1], dest: [0, -1, 1], cooldown: .001, },
  { origin: [-.5, 0, .5], dest: [-.5, 0, .5], cooldown: .001, },
  { origin: [-1, 0, 1], dest: [-1, 0, 1], cooldown: .001, },
];


export const GameConfig = {
  
  playerUnits: 1,

  // Player body
  playerSize: 50,

  // Weapon
  playerBulletType: BULLET_TYPE_BULLET,// BULLET_TYPE_FIREBALL, // 
  playerBulletSize: 5, // 50, //
  playerBulletSpeed: 20, // 5-100
  playerBulletRange: 2000,
  playerBulletDamagePoints: 50,
  playerBulletExplosionDamagePoints: 50,

  playerAutoShoot: true,
  playerShootCoolDownValue: .1, //.03,
  playerShootPattern: 0,
  playerShootSpreadAngle: Math.PI/180*15,
  
  // Enemy body
  enemySize: 30,
  enemySpawnTime: .5, // safe value: 2.5,
  
  // Health
  enemyMaxHealthPoints: 100,
  enemyDamagePoints: 50,
  enemyExplosionDamagePoints: 1,
  
  // Weapon
  enemyBulletType: BULLET_TYPE_BULLET, // BULLET_TYPE_FIREBALL, // 
  enemyShootCoolDownValue: 2.5, // safe value: 2.5, carpet drop: .1
  enemyBulletSize: 8,
  enemyBulletSpeed: 10,
  enemyBulletRange: 800,
  enemyBulletDamagePoints: 5,
  enemyBulletExplosionDamagePoints: 5,
  
  //Move
  ennemyPath: 0,
  enemyMaxVelocity: 5,
  enemyMaxAcceleration: 1000,
  enemyPathPattern: 0,
  
  // levelEnemyCount: [3, 5, 8, 15, 20, 35, 50, 19, 150, 240, 380, 620, 1000], // exponencial
  levelEnemyCount: [5, 8, 15, 20, 35], // , 50, 19, 150, 240, 350],
  levelCurrentIndex: 1,

  levelUnlocked: [1], //,2,3,4,5

  
  coinSize: 30,
  coin13Size: 50,

  bombMaxVelocity: 3,
  bombMaxAcceleration: 100,

  scrollSpeed: .2,
  bombCountDownSecs: 5,
  bombShake: 100,
};

export const debug = {
  godMode:1,
  showWires: 0,
  showMoveWires: 0,
  showTargetWires: 0,
  showQuadtree: 0,
  showVelocity: 0,
  showButtonBounds: 0,
  damageMessages: 1,
  enemyPaused: 0,
};

