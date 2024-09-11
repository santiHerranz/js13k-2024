import { BULLET_TYPE_BULLET, BULLET_TYPE_FIREBALL } from "@/game/game-weapons";
import { PI, Timer } from "@/utils";


// 🛡🧲💊💣💰💳🟡
export const backButton = {label: '⏪', fontSize: 80, posY: 240};
export const gameIcons = {wallet: '💰'}; //heart: '🧡', , diamond: '💎'

export const HINTS = [
  "💀 DESTROY ALL EMENIES!",
  // "  HINT: USE ARROW KEYS TO MOVE.",
  // "  HINT: PRESS BACKSPACE TO UNDO.",
  // "  HINT: PRESS R TO RESTART.",
  // "  HINT: PRESS ENTER TO PAUSE."
];

export const PLAYER_SHOOT_PATTERN_MODES: { origin: number[]; dest: number[]; spreadAngle:number; cooldown: number; }[] = [

  { origin: [0], dest: [0], spreadAngle: 0, cooldown: .1, }, // single straight bullet

  { origin: [-1, 1], dest: [0, 0], spreadAngle: Math.PI/180*15, cooldown: .05, }, // double straight bullet

  { origin: [-1, 0, 1], dest: [0, 0, 0], spreadAngle: 0, cooldown: .01, },  // triple straight bullet
  { origin: [0, -1, 1], dest: [0, -1, 1], spreadAngle: PI/180*10, cooldown: .001, },
  { origin: [-.5, 0, .5], dest: [-.5, 0, .5], spreadAngle: PI/180*15, cooldown: .001, },
  { origin: [-1, 0, 1], dest: [-1, 0, 1], spreadAngle: 0, cooldown: .001, },

  { origin: [-1,-.3,-.6,0,.6,.3,1], dest: [-1,-.3,-.6,0,.6,.3,1], spreadAngle: PI/180*90, cooldown: 0, },
];


export const GameConfig = {

  title: 'NFZ13',
  subtitle: 'No Flight Zone',
  
  playerHearts: 0,
  playerScore: 0,
  repairCost: 10000,
  // playerDiamond: 1,

  // General
  coinSize: 30,
  coin13Size: 50,

  bulletRange: 2000,
    

  playerUnits: 1,

  // Player body
  playerSize: 50,

  // Weapon
  playerAutoShoot: false,

  playerBulletType: BULLET_TYPE_BULLET,// BULLET_TYPE_FIREBALL, // 
  playerBulletSize: 5, // 50, //
  playerBulletSpeed: 20, // 5-100
  playerBulletDamagePoints: 50,
  playerBulletExplosionDamagePoints: 50,

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
  enemyBulletDamagePoints: 5,
  enemyBulletExplosionDamagePoints: 5,
  
  // Move
  ennemyPath: 0,
  enemyMaxVelocity: 5,
  enemyMaxAcceleration: 1000,
  enemyPathPattern: 0,
  
  levelEnemyCount: [8,10,15,20,27,36,50,66,90,120,160,220,300].map(_ => _*2), 

  levelCurrentData: [],
  levelCurrentIndex: 0,
  levelGoalCurrentIndex: 0,

  levelIndexUnlocked: [0], // ,1,2,3,4,5,6,7,8,9,10,11,12
  levelGoalIndexUnlocked: [[0]], // 1,2,3,4,5,6,7,8,9,10,11,12
  
  bombMaxVelocity: 3,
  bombMaxAcceleration: 100,

  scrollSpeed: .2,
  bombCountDownSecs: 5,
  bombShake: 100,
};

