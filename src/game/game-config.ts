import { PI } from "@/utils";
import { GameMapTheme } from "./game-map";


// 🛡🧲💊💣💰💳🟡
export const backButton = { label: '⏪', fontSize: 80, posY: 1750 };
export const gameIcons = { wallet: '💰', enemy: '👾' }; //heart: '🧡', , diamond: '💎'

export const HINTS = [
  "Collect 🟡 coins",
  "Bonus if collect > 13",
  "Avoid number 13 💣",
];

const singleStraight = { origin: [0], dest: [0], spreadAngle: 0, };
const doubleStraight = { origin: [-1, 1], dest: [0, 0], spreadAngle: Math.PI / 180 * 15, };
const tripleStraight = { origin: [-1, 0, 1], dest: [0, 0, 0], spreadAngle: 0 };
const tripleAngled = { origin: [0, -1, 1], dest: [0, -1, 1], spreadAngle: PI / 180 * 10, };
const tripleAngledOpen = { origin: [-.5, 0, .5], dest: [-.5, 0, .5], spreadAngle: PI / 180 * 60};
const seven180 = { origin: [-1, -.3, -.6, 0, .6, .3, 1], dest: [-1, -.3, -.6, 0, .6, .3, 1], spreadAngle: PI / 180 * 90};

export const PLAYER_SHOOT_PATTERN_MODES: { origin: number[]; dest: number[]; spreadAngle: number; cooldown: number; }[] = [

  { ...singleStraight, cooldown: .15, }, // 0. single straight slow
  { ...singleStraight, cooldown: .05, }, // 1. single straight fast

  {...doubleStraight, cooldown: .1}, // 2. double straight slow
  {...doubleStraight, cooldown: .01}, // 3. double straight fast

  {...tripleStraight, cooldown: .1 },  // 4. triple straight slow
  {...tripleStraight, cooldown: .01 },  // 5. triple straight fast
  
  {...tripleAngled, cooldown: .1 },  // 6. triple angled slow
  {...tripleAngled, cooldown: .01 },  // 7. triple angled fast
  
  { ...tripleAngledOpen, cooldown: .1, }, // 8. triple angled open slow
  { ...tripleAngledOpen, cooldown: .01, }, // 9. triple angled open fast

  { ...doubleStraight, cooldown: .08, }, // 10.
  { ...seven180, cooldown: .008, }, // 11.

  { ...tripleStraight, cooldown: .1, }, // 12.
  { ...tripleAngled, cooldown: .01, }, // 13.
];

export var fireTime = 500;
export var defaultExplosionTime = 10;


export const GameConfig = {

  title: 'NFZ13',
  subtitle: 'No Flight Zone',

  // LEVEL

  levelCurrentIndex: 0, // PRODUCTION: Set 0 Before Flight

  //  levelIndexUnlocked: [0,1,2,3,4,5,6,7,8,9,10,11,12], // 
  levelIndexUnlocked: [0], //  PRODUCTION: Set [0] Before Flight

  levelEnemyCount: [5, 15, 25, 30, 10, 45, 55, 60, 10, 75, 80, 85, 10], // 
  levelPlayerWeapon: [[0,1], [2,3], [4,5], [6,7], [8,9], [10,11], [12,13], [12,13], [12,13], [12,13], [12,13], [12,13], [12,13]], // 

  levelTheme: [GameMapTheme.sea, GameMapTheme.sea, GameMapTheme.coast, GameMapTheme.coast, GameMapTheme.forest, GameMapTheme.forest, GameMapTheme.snow, GameMapTheme.snow, GameMapTheme.coast, GameMapTheme.coast, GameMapTheme.sea, GameMapTheme.sea, GameMapTheme.dessert], // 

  levelCurrentData: [],
  levelGoalCurrentIndex: 0,

  playerHearts: 0,
  playerScore: 0,

  // General
  coinSize: 30,
  coin13Size: 50,

  bulletRange: 2000,


  playerUnits: 1,

  // Player body
  playerSize: 50,
  playerShieldCount: 0,
  playerBoostWeaponCount: 0,

  // Weapon
  playerAutoShoot: false,

  playerBulletSize: 5, // 50, //
  playerBulletSpeed: 20, // 5-100
  playerBulletDamagePoints: 50,
  playerBulletExplosionDamagePoints: 40,

  playerShootCoolDownValue: .1, //.03,
  playerShootPattern: 0,
  playerShootSpreadAngle: Math.PI / 180 * 15,

  playerSuperWeaponTime: 8,
  playerSuperWeaponReloadTime: 30,

  playerShieldReloadTime: 1,

  // Enemy body
  enemySize: 30,
  enemySpawnTime: 2, // safe value: 2.5,

  // Health
  enemyMaxHealthPoints: 200,
  enemyDamagePoints: 50,
  enemyExplosionDamagePoints: 50,

  // Weapon
  enemyShootCoolDownValue: .5, // safe value: 2.5, carpet drop: .1
  enemyShootPattern: 1,
  enemyShootSpreadAngle: Math.PI / 180 * 15,

  enemyBulletSize: 6,
  enemyBulletSpeed: 10,
  enemyBulletDamagePoints: 20,
  enemyBulletExplosionDamagePoints: 15,

  // Move
  ennemyPath: 0,
  enemyMaxVelocity: 5,
  enemyMaxAcceleration: 1000,
  enemyPathPattern: 0,

  enemyScorePoints: 10,

  bombMaxVelocity: 2.5,
  bombMaxAcceleration: 100,

  scrollSpeed: .2,
  bombCountDownSecs: 6,
  bombShake: 100,
};

