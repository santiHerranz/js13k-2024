/* eslint-disable class-methods-use-this */
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { Quadtree } from '@/quadtree/Quadtree';
import { Rectangle } from '@/quadtree/Rectangle';
import { Circle } from '@/quadtree/Circle';
import { Line } from '@/quadtree/Line';
import { Indexable } from '@/quadtree/types';
import { Vector } from '@/core/vector';
import { manageUnitsCollision as manageUnitCollision } from '@/collisionManager';
import { PI, rand, randInt, Timer } from '@/utils';
import { inputMouse } from '@/core/input-mouse';
import { Unit } from '@/game/unit';
import { GameObject } from '@/game-object';
import { Shooter } from '@/game/unit.shooter';
import { createBullet } from '@/game/game-weapons';
import { backButton, defaultExplosionTime, gameIcons, HINTS, PLAYER_SHOOT_PATTERN_MODES as SHOOT_PATTERN_MODES } from '../game/game-config';
import { Bullet } from '@/game/unit.bullet';
import { Explosion } from '@/game/unit.explosion';
import { GameConfig } from '../game/game-config';
import { transparent } from "@/game/game-colors";
import { colorShadow } from "@/game/game-colors";
import { sound } from '@/core/sound';
import { GameMap, GameMapTheme } from '@/game/game-map';
import { Coin, COIN_YELLOW, COIN_RED, COIN_BLUE, COIN_TOUCHED, COIN_COLLECTOR } from '@/game/game-coin';
import { globalParticles } from '@/game/game-particle';
import { Collector } from '@/game/game-collector';
import { Label } from '@/game/game-label';
import { CollectibleFactory } from '@/game/game-collectible';
import { Bomb } from '@/game/game.bomb';
import { finalState } from './final.state';
import { menuState } from './menu.state';
import { debug } from '@/game/game-debug';
import { SND_ARROW_SHOOT, SND_BIG_EXPLOSION, SND_COIN, SND_DEATH, SND_EXPLOSION, SND_HIGHSCORE, SND_WEAPON_COLLECTED, SND_TICTAC, SND_SHIELD_COLLECTED } from '@/game/game-sound';
import { BaseState } from './base.state';
import { Button } from '@/core/button';

let magicOffset = 100;

let nIntervId: NodeJS.Timer | null;

export type TEAM = 1 | 2;

export const TEAM_A: TEAM = 1;
export const TEAM_B: TEAM = 2;

const currentKillsGoalPercent = .7;
const buttonProps = { x: 0, y: 0, w: 300, h: 150, r: 100 };


const ENEMY_PATH = [
  { start: new Vector(drawEngine.canvasWidth * .5, -200), path: [new Vector(100, 350), new Vector(100, 1500), new Vector(1000, 1500), new Vector(1000, 350)] },
  // [new Vector(-100, -100), new Vector(drawEngine.canvasWidth*.5, 1000)],
  // {start: new Vector(drawEngine.canvasWidth*.5, -200), path: [ new Vector(drawEngine.canvasWidth*.5, 200), new Vector(drawEngine.canvasWidth*.5, 1000) ]},
];

class GameState extends BaseState {


  private canvas: HTMLElement | null = document.getElementById('c2d');


  ballPosition = new DOMPoint(100, 100);
  ballSize = 100;

  collisionTree: Quadtree<Rectangle<void> | Circle<void> | Line<void> | Indexable>;

  units: Shooter[] = [];
  bullets: Bullet[] = [];
  coins: Coin[] = [];
  explosions: Explosion[] = [];
  labels: Label[] = [];

  collectors: Collector[] = [];
  collectorCoin: Collector | undefined;
  collectorWeapon: Collector | undefined;
  collectorShield: Collector | undefined;

  // Map
  gameMap: GameMap | undefined;
  seed: number = .601; // Math.random() //
  theme = GameMapTheme.sea;

  playerAlive: boolean;

  levelScore: number = 0;

  shakeForce: number = 0;


  dragStart: Vector | undefined = undefined;
  lastX: number = 0;
  lastY: number = 0;
  player: Shooter | undefined;

  enemySpawnTimer: Timer = new Timer(undefined);

  hintTimer: Timer = new Timer(undefined);
  currentHint = 0;

  gameLevelTimer: Timer = new Timer(undefined);
  shootSoundColdDownTimer: Timer = new Timer(1);
  winCondition: boolean = false;
  enemyValueList: any;

  stats = { enemiesCreated: 0, kills: 0, killsGoal: 0 };
  autopilot: boolean = false;
  winTimeout: NodeJS.Timeout | undefined;
  abandon: boolean = false;
  enemySpawnLeftOrRight = 0;

  shieldButton: Button | undefined;
  weaponButton: Button | undefined;

  constructor() {
    super();


    this.playerAlive = false;

    this.setTheme();


    this.collisionTree = new Quadtree({
      width: drawEngine.canvasWidth,
      height: drawEngine.canvasHeight,
      maxObjects: 3
    });
  }

  setTheme(theme = GameMapTheme.sea, seed: number = Math.random()) {
    this.seed = seed;
    this.theme = theme;
    this.gameMap = new GameMap(theme, seed);
    this.gameMap.speed = 2.5; // 0.096    
  }

  // INPUT CONTROLS

  mouseDrag() {
    if (!this.autopilot && !this.autopilot && inputMouse.dragStart) {
      let start = new Vector(inputMouse.dragStart.x, inputMouse.dragStart.y);
      let last = new Vector(inputMouse.lastX, inputMouse.lastY);
      let deltaMove = new Vector((start.x - last.x), (start.y - last.y));

      this.units.filter(f => f.team == TEAM_A).map(player => {
        player.Position.add(deltaMove.clone().scale(-1));
        this.playerPositionAreaConstraint(player);

      });

    }
  }

  toucheMove() {
    if (!this.autopilot && inputMouse.dragStart) {
      let start = new Vector(inputMouse.dragStart.x, inputMouse.dragStart.y);
      let last = new Vector(inputMouse.lastX, inputMouse.lastY);
      let deltaMove = new Vector((start.x - last.x), (start.y - last.y));

      this.units.filter(f => f.team == TEAM_A).map(player => {
        player.Position.add(deltaMove.clone().scale(-1));
        this.playerPositionAreaConstraint(player);
      });
    }
  }


  private getEnemies() {
    return this.units.filter(f => f.team == TEAM_B);
  }

  private getTeamBullets(team: TEAM) {
    return this.bullets.filter(f => f.team == team);
  }

  onEnter() {

    /////////////
    // MENU BUTTONS
    this.menuButtons = [];

    // Eject 
    let ejectButton = new Button({ x: 0, y: 0, w: 60, h: 50 }, backButton.label, backButton.fontSize);
    ejectButton.index = -1;
    ejectButton.keyboardDisabled = true;
    ejectButton.clickAction = () => {
      this.abandon = true;
      setTimeout(() => {
        gameStateMachine.setState(menuState);
      }, 2000);
    };
    this.menuButtons.push(ejectButton);

    // SHIELD BUTTON
    let shieldButton = new Button({ x: 0, y: 0, r: 60 }, '🛡', 80);
    shieldButton.index = 1;
    shieldButton.data = GameConfig.playerShieldCount;
    shieldButton.clickAction = () => {
      if (shieldButton.enabled) {
        this.reloadShield(shieldButton);
        shieldButton.timer?.set(GameConfig.playerShieldReloadTime);
      }
    };

    shieldButton.timer = new Timer(undefined);
    shieldButton.timerLoad = new Timer(undefined);
    shieldButton.timer.elapsedAction = () => {
      shieldButton.timerLoad?.set(GameConfig.playerSuperWeaponReloadTime);
    };
    shieldButton.timerLoad.elapsedAction = () => {
      shieldButton.enabled = true;
    };
    this.shieldButton = shieldButton;

    this.menuButtons.push(shieldButton);

    // WEAPON BUTTON
    let weaponButton = new Button({ x: 0, y: 0, r: 60 }, '🔥', 80); //, { default: { lineWidth: 0 }}
    weaponButton.index = 0;
    weaponButton.data = GameConfig.playerBoostWeaponCount;
    weaponButton.clickAction = () => {
      if (weaponButton.enabled) {
        this.playerChangeWeapon(this.getWeapon(GameConfig.levelCurrentIndex, true));
        weaponButton.enabled = false;
        weaponButton.timer?.set(GameConfig.playerSuperWeaponTime);
        weaponButton.data = --GameConfig.playerBoostWeaponCount;
      }
    };

    weaponButton.timer = new Timer(undefined);
    weaponButton.timerLoad = new Timer(undefined);
    weaponButton.timer.elapsedAction = () => {
      this.playerChangeWeapon(this.getWeapon(GameConfig.levelCurrentIndex));
      weaponButton.timerLoad?.set(GameConfig.playerSuperWeaponReloadTime);
      // setTimeout(() => {
      // }, GameConfig.playerSuperWeaponReloadTime * 1000);
    };
    weaponButton.timerLoad.elapsedAction = () => {
      weaponButton.enabled = true;
    };
    this.weaponButton = weaponButton;

    this.menuButtons.push(weaponButton);


    this.selectedMenuIndex = 1;


    // Call super after button created
    super.onEnter();


    if (GameConfig.levelCurrentIndex == 0)
      this.hintTimer.set(4);

    this.canvas!.setAttribute(
      "style",
      "background-color: #0E223A;" +
      "image-rendering: optimizeSpeed;" +
      "image-rendering: pixelated;" +
      "image-rendering: smooth;" +
      "image-rendering: -moz-crisp-edges;" +
      ""
    );

    this.winCondition = false;

    this.shakeForce = 0;

    // empty arrays
    this.units = [];
    this.bullets = [];
    this.coins = [];
    this.explosions = [];
    this.enemyValueList = [];
    this.labels = [];

    // reset level score
    this.levelScore = 0;

    // reset stats
    this.stats = {
      enemiesCreated: 0,
      kills: 0,
      killsGoal: 0, // * .8,
    };


    this.enemyValueList = this.createEnemyValueList(GameConfig.levelEnemyCount[GameConfig.levelCurrentIndex]);

    // TODO Kill goal of enemies created
    this.stats.killsGoal = this.enemyValueList.length; // * currentKillsGoalPercent;

    // Calculate final button position befor collectors
    this.menuRender();

    let hw = drawEngine.canvasWidth / 2;
    let hh = drawEngine.canvasHeight / 2;

    let coinSize = new Vector(GameConfig.coinSize, GameConfig.coinSize);
    this.collectorCoin = CollectibleFactory.createCollectible(COIN_COLLECTOR, { position: new Vector(hw, 260), size: coinSize.clone().scale(1.6) });
    this.collectorCoin.showBall = this.collectorCoin.showNumber = this.collectorCoin.showShadow = true;

    this.collectorShield = CollectibleFactory.createCollectible(COIN_COLLECTOR, { position: this.shieldButton.Position.clone().add(new Vector(0, 100)), size: coinSize.clone().scale(1.6) });
    this.collectorShield.showBall = this.collectorShield.showShadow = this.collectorShield.showNumber = false;
    this.collectorWeapon = CollectibleFactory.createCollectible(COIN_COLLECTOR, { position: this.weaponButton.Position.clone().add(new Vector(0, 100)), size: coinSize.clone().scale(1.6) });
    this.collectorWeapon.showBall = this.collectorWeapon.showShadow = this.collectorWeapon.showNumber = false;

    this.collectors = [];
    this.collectors.push(this.collectorCoin);
    this.collectors.push(this.collectorWeapon);
    this.collectors.push(this.collectorShield);


    const startPosition = new Vector(hw, hh + hh * .6);
    this.player = this.createPlayer(startPosition);

    this.playerChangeWeapon(this.getWeapon(GameConfig.levelCurrentIndex));

    this.autopilot = false;
    this.abandon = false;

    this.enemySpawnTimer.set(GameConfig.enemySpawnTime);
    this.gameLevelTimer.set(0);

    if (GameConfig.levelCurrentIndex == 0) {
      const coinIntroList =
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      // [1,2,3,4,5,6,7,8,9,10,11,12];

      coinIntroList
        .forEach((n, index) => {
          let coin = CollectibleFactory.createCollectible(COIN_YELLOW, { position: startPosition.clone().add(Vector.createSize(300).rotate(index * 1 / coinIntroList.length * 360 * Math.PI / 180)), size: Vector.createSize(GameConfig.coinSize) });
          coin.number = n;
          this.coins.push(coin);
        });

    }


    // Player movement dragging mouse o finger touch
    inputMouse.addEventListener('mousedown', () => this.mouseDown());
    inputMouse.addEventListener('mousedrag', () => this.mouseDrag());
    inputMouse.addEventListener('touchmove', () => this.toucheMove());
  }

  private reloadShield(shieldButton: Button) {
    this.player!.maxHealthPoints = 100;
    this.player!.maxShieldPoints = 100;
    shieldButton.data = --GameConfig.playerShieldCount;
  }

  getWeapon(levelIndex: number, boosted: boolean = false): number {
    return GameConfig.levelPlayerWeapon[levelIndex][boosted ? 1 : 0];
  }


  private playerChangeWeapon(value: number) {
    GameConfig.playerShootPattern = value;
    const currentMode = SHOOT_PATTERN_MODES[GameConfig.playerShootPattern];
    GameConfig.playerShootCoolDownValue = currentMode.cooldown;
    GameConfig.playerShootSpreadAngle = currentMode.spreadAngle;

    // Apply changed properties for all
    this.units.forEach(unit => unit.setDynamicProperties());
  }

  private enemyChangeWeapon(enemy: Shooter, value: number, factor: number = 1) {
    GameConfig.enemyShootPattern = value;
    const currentMode = SHOOT_PATTERN_MODES[value];
    GameConfig.enemyShootCoolDownValue = currentMode.cooldown * factor;
    GameConfig.enemyShootSpreadAngle = currentMode.spreadAngle;

    // Apply changed properties for all
    enemy.setDynamicProperties();
  }


  onLeave() {

    // remove listeners
    inputMouse.removeAllEventListener();

  }


  private winConditionCriteria() {
    // return this.collectorYellow!.number > 100;
    return this.stats.kills >= this.stats.killsGoal && this.getEnemies().length == 0;
  }


  onUpdate(dt: number) {

    super.onUpdate(dt);

    if (this.winCondition && !this.winConditionCriteria()) {
      this.winCondition = false;
      this.autopilot = false;
      clearTimeout(this.winTimeout);
    }

    if (!this.winCondition && this.winConditionCriteria()) {
      this.winCondition = true;

      // Score the rest
      // this.levelScore += this.collectorCoin!.number;
      // this.collectorCoin!.number = 0;

      sound(SND_HIGHSCORE);

      setTimeout(() => {
        this.autopilot = true;
      }, 2000);

      this.winTimeout = setTimeout(() => {

        finalState.result.status = 1;
        finalState.result.kills = this.stats.kills;
        finalState.result.score = this.levelScore;
        gameStateMachine.setState(finalState);

      }, 5000);

    }

    /////////////
    // LEVEL DIFICULTY DINAMIC CONTROL

    // if (this.gameLevelTimer.elapsed()) {

    //   //   GameConfig.enemySpawnTime = .5;
    //   //   GameConfig.playerShootPattern = 1;
    //   //   GameConfig.playerShootCoolDownValue = .2;
    //   //   GameConfig.playerBulletSize = 8;
    //   //   GameConfig.playerBulletDamagePoints = 50;
    //   //   GameConfig.playerBulletType = BULLET_TYPE_BULLET;

    //   setGamePropertyValue([.4, .01]);

    //   // Apply changed properties for all
    //   this.units.forEach(unit => unit.setDynamicProperties());

    //   this.gameLevelTimer.set(1); // every second
    // }


    // SHAKE
    if (this.shakeForce > 0)
      this.shakeForce -= 1;
    drawEngine.context.save();
    drawEngine.context.translate(0, -magicOffset);
    drawEngine.preShake(this.shakeForce);


    this.playerAlive = this.units.filter(f => f.team == TEAM_A).length > 0;

    // Units explode at the end of life
    this.units
      .filter(f => !f.Active || f.healthPoints < 1)
      .forEach(unit => {

        unit.explode(unit.Position);

        if (unit.team == TEAM_B) {
          this.onEnemyDestroyed(unit);
        }

        if (unit.team == TEAM_A) {
          setTimeout(() => {
            // option 1
            // gameStateMachine.setState(repairState);
            // option 2
            finalState.result.status = -1;
            finalState.result.kills = this.stats.kills;
            finalState.result.score = this.levelScore;
            gameStateMachine.setState(finalState);

          }, 2000);
        }
      });

    // bullets explode at the end
    this.bullets
      .filter(f => !f.Active || f.healthPoints < 1)
      .forEach(bullet => {
        bullet.explode(bullet.Position);
        bullet.destroy();
      });

    // Remove death stuff
    this.labels = this.labels.filter(f => f.Active);
    this.units = this.units.filter(f => f.Active && f.healthPoints > 0 && f.Position.y < drawEngine.canvasHeight);
    this.coins = this.coins.filter(f => f.Active && f.Position.y < drawEngine.canvasHeight);
    this.explosions = this.explosions.filter(f => f.Active && f.Position.y < drawEngine.canvasHeight);
    this.bullets = this.bullets.filter(f => f.Active && f.Position.y > 0 && f.Position.y < drawEngine.canvasHeight);


    // DRAW BACKGROUND MOVING
    this.gameMap!.drawTileMap(drawEngine.context, dt);


    // ENEMY SPAWN
    if (!this.hintTimer.isSet() && this.enemySpawnTimer.elapsed() && this.enemyValueList.length > 0 && this.getEnemies().length < 5) {

      let hw = drawEngine.canvasWidth / 2;
      let hh = drawEngine.canvasHeight / 2;

      const startPosition = new Vector(hw, hh);
      const sizeBase = new Vector(1, 1).scale(GameConfig.enemySize);

      this.enemySpawnLeftOrRight = Math.random() < .5 ? 0 : 1;

      [...Array(1).keys()].forEach(() => { //

        let enemyHeightSpawnPosition = -hh * .4;

        startPosition.add(new Vector(hw * (this.enemySpawnLeftOrRight == 1 ? -1 : 1) * 1.2, enemyHeightSpawnPosition)); // 

        let value = this.getEnemyNextValue(); // coinValues[Math.floor(this.stats.enemiesCreated % coinValues.length-1)];

        let enemy = this.enemySpawn(startPosition, sizeBase, this.enemySpawnLeftOrRight, value);

        this.units.push(enemy);
      });


      // if (this.getEnemies().length > 500)
      this.enemySpawnTimer.set(this.getEnemies().length > 5 ? GameConfig.enemySpawnTime * 2 : GameConfig.enemySpawnTime);
    }


    this.bullets.forEach((item: GameObject) => {
      item._update(dt);
    });


    // Enemy target designation
    enemyTargetDesignation(this.units);


    ///////////////
    // DAMAGE MANAGER BEFORE PHYSICS COLLISION

    // Unit vs Unit: Damage both units
    this.units
      .forEach((unitA: Unit) => {

        this.units
          .filter(f => f.team == TEAM_B && unitA.team == TEAM_A || f.team == TEAM_A && unitA.team == TEAM_B)
          .forEach((unitB: Unit) => {

            var isInRange = this.checkRange(unitA, unitB, unitA.damageRange);
            if (isInRange.a) {
              // debug.damageMessages && console.log(`unit to unit damage: ${unitB.damagePoints} / ${unitA.damagePoints}`);
              // !debug.godMode && 
              unitA.applyDamage(unitB.damagePoints);
              unitB.applyDamage(unitA.damagePoints);
            }

          });
      });

    // Explosion vs units
    this.explosions
      .forEach((explosion: Unit) => {

        this.units
          .forEach((unit: Unit) => {

            var isInRange = this.checkRange(explosion, unit, explosion.damageRange);
            if (isInRange.a && explosion.damagePoints > 0) {

              // if (!(debug.godMode && unit.team == TEAM_A)) {
              // debug.damageMessages && console.log(`explosion to unit damage: ${explosion.damagePoints}`);
              unit.applyDamage(explosion.damagePoints);
              // }

              // disable explosion damage after impact
              explosion.damagePoints = 0;
            }
          });
      });

    // Bullet vs Unit: Damage Unit and bullet destroy
    this.bullets
      .forEach((bullet: Bullet) => {

        this.units
          .filter(unit => unit.team == TEAM_B && bullet.team == TEAM_A || unit.team == TEAM_A && bullet.team == TEAM_B)
          .forEach((unit: Unit) => {

            var isInRange = this.checkRange(bullet, unit, bullet.damageRange);
            if (isInRange.a) {

              // if (!(debug.godMode && unit.team == TEAM_A)) {
              // debug.damageMessages && console.log(`bullet to unit damage: ${bullet.damagePoints}`);
              unit.applyDamage(bullet.damagePoints);
              // }
              bullet.destroy();
            }

          });
      });


    ///////////////
    // PHYSICS COLLISION MANAGER

    const useCases = [
      // Enemy bullets vs Player
      [...this.getTeamBullets(TEAM_B), ...this.units.filter(f => f.team == TEAM_A)],
      // Player bullets vs Enemies
      // [...this.getTeamBullets(TEAM_A), ...this.getEnemies()],
      // All units except bombs
      [...this.units.filter(f => f.type != 'bomb')],
      // Bombs vs Player
      [...this.units.filter(f => f.type == 'bomb'), ...this.units.filter(f => f.team == TEAM_A)],
      // Coins vs coins
      [...this.coins.filter(f => f.type != COIN_TOUCHED)],
    ];

    useCases.forEach((useCase) => {
      this.collisionTree.clear();
      useCase
        .forEach(item => {
          this.collisionTree.insert(item);
        });
      manageUnitCollision(useCase, dt);

      // DRAW QUADTREE
      // debug.showQuadtree && drawEngine.drawQuadtree(this.collisionTree, drawEngine.context);

    });


    ///////////////
    // COLLISION EVENTS

    // Touched coins => Collected coins
    this.collectors
      .forEach(collector => {

        this.coins
          .filter(f => f.type == COIN_TOUCHED)
          .some((coin: Coin) => {

            var collision = this.checkRange(collector, coin, collector.Radius);
            if (collision.a) {
              this.onCoinCollected(collector, coin);
              return true;
            }
          });
      });

    // Coin yellow => Touched coins
    this.coins
      // .filter(f => f.type == COIN_YELLOW)
      .forEach((coin: Coin) => {

        this.units
          .filter(f => f.team == TEAM_A)
          .some((unit: Unit) => {

            var collision = this.checkRange(unit, coin, unit.Radius);
            if (collision.a) {
              this.onCoinTouched(coin);
              return true;
            }

          });
      });


    // Shoot
    this.units
      .forEach((shooter: Shooter) => {
        if (shooter.targetPosition) {
          shooter.shootTo(shooter.targetPosition);
        }
      });


    const deltaMove = 2.5;
    let move = { h: 0, v: 0 };
    if (!this.autopilot && !this.abandon) {
      move.h += controls.isLeft ? -deltaMove : 0;
      move.h += controls.isRight ? deltaMove : 0;
      move.v += controls.isUp ? -deltaMove * .8 : 0;
      move.v += controls.isDown ? deltaMove * .8 : 0;
    } else if (this.autopilot) {
      move.v += -deltaMove * 0.4;
    } else if (this.abandon) {
      move.v += deltaMove * 0.4;
    }


    // MOVE COINS
    this.coins.forEach((coin: Coin) => {

      if (coin.movePosition) {
        let force = coin.moveForce();
        coin.Acceleration.add(force);
      } else {
        coin.Acceleration.add(new Vector(0, GameConfig.scrollSpeed));
      }

      // Max 
      // coin.Acceleration.clampLength(coin.maxAcceleration)

      coin.Velocity.add(coin.Acceleration);

      coin.Velocity.clampLength(coin.maxVelocity);

      // apply velocity to position
      coin.Position.add(coin.Velocity);

      // Apply Drag
      coin.Acceleration.scale(.9);

      // Apply Drag
      coin.Velocity.scale(.99);

      // Max 
      coin.Velocity.clampLength(coin.maxVelocity);

    });

    // MOVE BULLETS
    this.bullets.forEach((bullet: Bullet) => {
      bullet.Velocity.add(bullet.Acceleration);
      bullet.Position.add(bullet.Velocity);
      // No Drag for projectile
      // bullet.Velocity.scale(0.99);
      // reset acceleration
      bullet.Acceleration.scale(0);
    });


    this.units.forEach((item: Unit) => {

      if (item.team == TEAM_B) {

        if (!item.movePosition) {
          item.Acceleration.add(item.moveForce());
        }
      }

      if (item.team == TEAM_A) {

        if (item.Position.x >= item.Radius && item.Position.x <= drawEngine.canvasWidth - item.Radius
          && item.Position.y >= item.Radius && item.Position.y <= drawEngine.canvasHeight - item.Radius) {
          item.Acceleration.add(new Vector(move.h, move.v));
        }
      }


      item.Acceleration.add(item.moveForce());
      // Max 
      item.Acceleration.clampLength(item.maxAcceleration);

      // apply accelerarion to velocity
      item.Velocity.add(item.Acceleration);

      // apply velocity to position
      item.Position.add(item.Velocity);

      // Apply Drag
      item.Acceleration.scale(.9);

      // Apply Drag
      item.Velocity.scale(.99);

      // Max 
      item.Velocity.clampLength(item.maxVelocity);


      // Player Constraint move area
      if (item.team == TEAM_A && !this.autopilot && !this.abandon) {
        this.playerPositionAreaConstraint(item);
      }

    });

    /////////////
    // UPDATE OBJECTS

    [...this.units, ...this.bullets, ...this.coins, ...this.explosions, ...this.collectors]
      .forEach((item: any) => {
        item.hits = Math.max(0, --item.hits);
        item._update(dt);


      });


    /////////////
    // DRAW OBJECTS

    [...this.units,
    ...this.bullets,
    ...this.coins,
    ...this.explosions,
    ...this.collectors,
    ]
      .sort((a: GameObject, b: GameObject) => { return -((b.Position.y + b._z) * 10000 + b.Position.x) + ((a.Position.y + a._z) * 10000 + a.Position.x); })
      .forEach((item: GameObject) => {
        item.draw(drawEngine.context);
      });


    drawEngine.postShake();


    this.labels.forEach((label: Label) => {
      // label.draw(drawEngine.context);
      // if (label.movePosition) {
      //   let force = label.moveForce();
      //   label.Acceleration.add(force);
      label.Acceleration.add(Vector.createSize(.2));
      label.Velocity.add(label.Acceleration);
      label.Position.add(label.Velocity);
      label.Acceleration.scale(0);
      // }
      label._update(dt);

      drawEngine.drawText('' + label.text, 60, label.Position.x, label.Position.y);
    });


    //
    drawEngine.context.restore();


    /////////////
    // DRAW HEADER

    // drawEngine.drawText('' + time.toFixed(2), 30, drawEngine.canvasWidth * .95, 40, 'white', 'right');

    // drawEngine.drawText('bullets:' + this.bullets.length, 30, drawEngine.canvasWidth * .95, 80, 'white', 'right');
    // drawEngine.drawText('' + dt.toFixed(2), 28, drawEngine.canvasWidth * .95, 40);
    // drawEngine.drawText(`Level : ${1 + GameConfig.levelCurrentIndex} of ${GameConfig.levelEnemyCount.length}`, 50, 10, 50, 'white', 'left');

    // drawEngine.drawText('coins:' + this.coins.length, 40, drawEngine.canvasWidth / 2, 150)
    // drawEngine.drawText('explo:' + this.explosions.length, 40, drawEngine.canvasWidth / 2, 200)
    // drawEngine.drawText('shakeForce:' + this.shakeForce, 40, drawEngine.canvasWidth / 2, 250)

    // drawEngine.drawText('Mouse:' + JSON.stringify(inputMouse.pointer.Position), 40, drawEngine.canvasWidth / 2, 150)

    // if (this.currentMessage)
    //   drawEngine.drawText('' + this.currentMessage, 40, drawEngine.canvasWidth * .5, 120, 'white', 'center');

    // let message = `${this.stats.kills} of ${this.stats.killsGoal}`;

    drawEngine.drawText(gameIcons.enemy + ` ${GameConfig.levelEnemyCount[GameConfig.levelCurrentIndex] - this.stats.kills}`, 50, drawEngine.canvasWidth * .1, 200, 'white', 'center');


    if (this.hintTimer.isSet()) {
      if (!this.hintTimer.elapsed()) {
        drawEngine.drawText(HINTS[this.currentHint].toUpperCase(), 60, drawEngine.canvasWidth * .5, drawEngine.canvasHeight * .25, 'white', 'center');
      } else if (this.currentHint < HINTS.length - 1) {
        this.currentHint++;
        this.hintTimer.set(4);
      } else {
        this.hintTimer.unset();
      }
    }


    // drawEngine.drawText(`Enemies: ${this.stats.killsGoal - this.stats.kills} of ${this.stats.killsGoal}`, 60, drawEngine.canvasWidth * .95, 350, 'white', 'right');
    // drawEngine.drawText(`Points: ${this.stats.maxScoreAvailable} max`, 40, drawEngine.canvasWidth * .95, 320, 'white', 'right');
    // drawEngine.drawText(`Collector: ${this.collectorCoin?.number}`, 40, drawEngine.canvasWidth * .95, 370, 'white', 'right');

    // drawEngine.drawText('' + this.getEnemies().map(_ => { return _.shootCoolDownValue }).join(','), 60, drawEngine.canvasWidth * .5, 350, 'yellow', 'center');


    let currentHealthRatio = this.player!.healthPoints / this.player!.maxHealthPoints;

    const healthBarProps = { x: drawEngine.canvasWidth * .9 - 200, y: 180, w: 200, h: 30 };
    drawEngine.drawRectangle(new Vector(healthBarProps.x, healthBarProps.y), new Vector(healthBarProps.w, healthBarProps.h), { fill: '#fff' });
    drawEngine.drawRectangle(new Vector(healthBarProps.x, healthBarProps.y), new Vector(healthBarProps.w * currentHealthRatio, healthBarProps.h), { fill: currentHealthRatio > .5 ? '#0f0' : '#f00' });

    let currentShieldRatio = this.player!.shieldPoints / this.player!.maxShieldPoints;

    const shieldBarProps = { x: drawEngine.canvasWidth * .9 - 200, y: 215, w: 200, h: 15 };
    drawEngine.drawRectangle(new Vector(shieldBarProps.x, shieldBarProps.y), new Vector(shieldBarProps.w, shieldBarProps.h), { fill: '#fff' });
    drawEngine.drawRectangle(new Vector(shieldBarProps.x, shieldBarProps.y), new Vector(shieldBarProps.w * currentShieldRatio, shieldBarProps.h), { fill: '#00f' });

    // drawEngine.drawText('Health ' + this.player?.healthPoints.toFixed(0), 40, 18, 70, 'white', 'left');

    // drawEngine.drawText(`particles: ${globalParticles.length}` , 40, drawEngine.canvasWidth * .5, 200, 'white', 'center');


    // drawEngine.drawText('score: ' + this.score, 60, drawEngine.canvasWidth * .95, 505, 'yellow', 'right');


    if (controls.DeleteKey) {
      this.player?.explode(this.player?.Position);

      // console.log('llamada con rebotes');

      // debounce(() => {
      //   this.metodoSinRebotes.bind(this, { target: this, Position: this.collectorCoin!.Position, text: "+1000" });
      // }, 300);
    }

    if (controls.isEscape) {
      // gameStateMachine.setState(pauseState);
      // gameStateMachine.setState(menuState);
      this.abandon = true;
      setTimeout(() => {
        gameStateMachine.setState(menuState);
      }, 2000);
    }

    /////////////
    /// Check Shield Status for automatic reload
    if (GameConfig.playerShieldCount > 0 && this.player!.shieldPoints <= 0 && this.player!.healthPoints < this.player!.maxHealthPoints) {
      this.reloadShield(this.shieldButton!);
    }

    this.weaponButton!.visible = GameConfig.playerBoostWeaponCount > 0;
    this.shieldButton!.visible = GameConfig.playerShieldCount > 0;

    this.menuRender(0);


    // CURSOR 
    drawEngine.drawCircle(inputMouse.pointer.Position, 60, { stroke: transparent, fill: colorShadow });
    // drawEngine.drawText(''+ inputMouse.pointer.identifier, 30, inputMouse.pointer.Position.x, inputMouse.pointer.Position.y - 200, 'white', 'center');

    // PARTICLES
    !debug.showWires && globalParticles.forEach(_ => _.draw(drawEngine.context));


  }


  private coinValues = [...Array(100).keys(), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  private createEnemyValueList(count: number = 1): number[] {
    let list: number[] = [];

    while (list.length < count) {
      let value = this.coinValues[randInt(0, this.coinValues.length)];
      list.push(value);
    }

    return list;
  }


  private getEnemyNextValue() {

    let value = this.enemyValueList.shift();

    // console.log('enemy remain: ' + JSON.stringify(this.enemyList));

    return value;
  }

  private enemySpawn(startPosition: Vector, sizeBase: Vector, leftOrRight: number, value: number) {

    let color = this.getEnemyColor(value);

    let size = sizeBase.clone(); //.add(new Vector(value, value))

    let enemyPath = ENEMY_PATH[0]; //randInt(0,ENEMY_PATH.length)
    // let unitPosition = startPosition.clone().add(new Vector(rand(0, size.length()), rand(0, size.length())));

    let enemyPathStart = enemyPath.start;
    if (leftOrRight)
      enemyPathStart.x *= -1;

    let enemy = this.createEnemy(enemyPathStart, size, value, color);

    let factor = 12 - 12 * GameConfig.levelCurrentIndex/12;
    this.enemyChangeWeapon(enemy, 4,  factor);

    // Set Path to follow
    enemy.path = enemyPath.path; // GameConfig.ennemyPath

    if (leftOrRight)
      enemy.path = enemy.path.reverse();

    // Start following path
    enemy.movePosition = enemy.path[enemy.currentPoint];

    return enemy;
  }


  private playerPositionAreaConstraint(item: Unit) {
    if (item.Position.x < item.Radius) {
      item.Position.x = item.Radius;
      item.Acceleration.zeroX();
      item.Velocity.zeroX();
    }
    if (item.Position.x > drawEngine.canvasWidth - item.Radius) {
      item.Position.x = drawEngine.canvasWidth - item.Radius;
      item.Acceleration.zeroX();
      item.Velocity.zeroX();
    }
    if (item.Position.y > drawEngine.canvasHeight - item.Radius) {
      item.Position.y = drawEngine.canvasHeight - item.Radius;
      item.Acceleration.zeroY();
      item.Velocity.zeroY();
    }
    if (item.Position.y < drawEngine.canvasHeight * .3 - item.Radius) {
      item.Position.y = drawEngine.canvasHeight * .3 - item.Radius;
      item.Acceleration.zeroY();
      item.Velocity.zeroY();
    }
  }

  /***
 Rainbow Color Code HEX

    Red #e81416  // Powerup
    Orange #ffa500
    Yellow #faeb36 // Coin
    Green #79c314
    Blue #487de7
    Indigo #4b369d
    Violet #70369d
   */
  private getEnemyColor(value: number) {
    let color = '';
    const colors = ['#ffa500', '#79c314', '#487de7', '#4b369d', '#70369d'];
    color = colors[value % colors.length];
    return color;
  }

  onEnemyDestroyed(enemy: Shooter) {

    const startPosition = new Vector(enemy.Position.x, enemy.Position.y);

    let size = new Vector(GameConfig.coinSize, GameConfig.coinSize);

    let position = startPosition.clone(); // .add(Vector.rand().scale(size.length() * 2));

    if (GameConfig.enemyScorePoints > 0) {
      // Show Score label
      this.createLabel(enemy.Position, '+' + GameConfig.enemyScorePoints, { moveTo: Vector.createSize(50).rotate(-Math.PI / 2) });

      // Score points
      GameConfig.playerScore += GameConfig.enemyScorePoints;
      this.levelScore += GameConfig.enemyScorePoints;
    }

    // game Coin
    if (enemy.number > 0 && enemy.number < 13) {

      // Not all enemies drop coin
      setTimeout(() => {
        let coin = CollectibleFactory.createCollectible(COIN_YELLOW, { position, size });
        coin.maxVelocity = 2;
        coin.number = enemy.number;
        coin.showNumber = true;
        coin.Size = size;
        this.coins.push(coin);
      }, 100);

    } else if (GameConfig.levelCurrentIndex > 0 && rand() > .7) {
      setTimeout(() => {
        let coin = CollectibleFactory.createCollectible(rand() > .6 ? COIN_RED : COIN_BLUE, { position, size });
        coin.maxVelocity = 3;
        coin.showNumber = false;
        coin.Size = size.scale(.7);
        this.coins.push(coin);
      }, 100);
    }

    if (!(enemy instanceof Bomb))
      this.stats.kills++;

  }

  onCoinTouched(coin: Coin) {
    if (!coin.Active || coin.type == COIN_TOUCHED) return;

    switch (coin.type) {
      case COIN_RED:
        coin.maxVelocity = 20;
        coin.maxAcceleration = 100;
        coin.follow = this.collectorWeapon;
        coin.type = COIN_TOUCHED;
        break;
      case COIN_BLUE:
        coin.maxVelocity = 20;
        coin.maxAcceleration = 100;
        coin.follow = this.collectorShield;
        coin.type = COIN_TOUCHED;
        break;

      default:
        break;
    }

    // Touched
    if (coin.type == COIN_YELLOW) {
      this.onPlayerCoinTouched(coin);
    }

    sound(SND_COIN);

  }


  onPlayerCoinTouched(coin: Coin) {
    if (!coin.Active) return;

    // const p = this.player!;
    // console.log('collect ' + coin.type + ' ' + coin.name + ' ' + p.number + ' + ' + coin.number + ' = ' + (p.number + coin.number));

    const spawnFrom = coin;
    let position = spawnFrom.Position.clone().add(Vector.rand());
    let size = Vector.createSize(GameConfig.coinSize);

    let rewardCoin = CollectibleFactory.createCollectible(COIN_TOUCHED, { position, size });
    rewardCoin.number = coin.number; // 1+p.slot;
    rewardCoin.maxVelocity = 15;
    rewardCoin.maxAcceleration = 100;
    rewardCoin.showNumber = true;

    // Send to coin collector
    rewardCoin.follow = this.collectorCoin;

    this.coins.push(rewardCoin);

    coin.destroy();

  }


  private createBomb(position: Vector) {

    let size = Vector.createSize(GameConfig.coin13Size);

    let bomb = new Bomb({ position, size }, '#000');
    bomb.number = 13;
    bomb.maxHealthPoints = 10000;

    bomb.maxVelocity = GameConfig.bombMaxVelocity;
    bomb.maxAcceleration = GameConfig.bombMaxAcceleration;
    // bombCoin.showNumber = true;

    bomb.explode = () => {
      let explosion = new Explosion({ position: bomb.Position, size: bomb.Size }, TEAM_B, bomb.Size.length() * 3);
      explosion.strokeColor = 'rgb(0,0,0,.5)';
      explosion.fillColor = 'rgb(0,0,0,.5)';
      explosion.Mass = 1000;
      this.explosions.push(explosion);

      this.shakeForce = GameConfig.bombShake;
      bomb.destroy();

      sound(SND_EXPLOSION);

      clearInterval(nIntervId!);
      // liberar nuestro inervalId de la variable
      nIntervId = null;
    };

    // comprobar si ya se ha configurado un intervalo
    if (!nIntervId) {
      nIntervId = setInterval(() => {
        sound(SND_TICTAC);
      }, 400);
    }

    // Bomb will detonate in 5 sec.
    setTimeout(() => {

      bomb.destroy();

      clearInterval(nIntervId!);
      // liberar nuestro inervalId de la variable
      nIntervId = null;
    }, GameConfig.bombCountDownSecs * 1000);

    return bomb;
  }

  onCoinCollected(collector: Coin, coin: Coin) {

    if (coin.Active && collector == this.collectorShield && coin.color == 'blue') {
      this.shieldButton!.data = ++GameConfig.playerShieldCount;
      sound(SND_SHIELD_COLLECTED);
      coin.destroy();
      return;
    }

    if (coin.Active && collector == this.collectorWeapon && coin.color == 'red') {
      this.weaponButton!.data = ++GameConfig.playerBoostWeaponCount;
      sound(SND_WEAPON_COLLECTED);
      coin.destroy();
      return;
    }


    if (coin.number == 0) return;

    if (collector.number + coin.number == 13) {

      this.createLabel(collector.Position, "BOMB!", { moveTo: Vector.createSize(50).rotate(PI / 2) });

      let bomb = this.createBomb(collector.Position);

      // Set Path to follow
      bomb.path = [this.player!.Position];
      // Start path follower
      bomb.movePosition = bomb.path[bomb.currentPoint];

      this.units.push(bomb);

      collector.number = 0;
      coin.number = 0;

    } else {

      // Collect points
      collector.number += coin.number;

      // console.log('Collected: +' + coin.number + ' = ' + collector.number);

      // reset coin
      coin.number = 0;

      if (collector.number > 12) {

        // Show Score label
        this.createLabel(collector.Position, '+1000', { moveTo: Vector.createSize(100).rotate(Math.PI / 2) }); //

        // Score points
        this.levelScore += 1000;
        GameConfig.playerScore += 1000;

        // console.log('Score: +' + collector.number + ' = ' + this.levelScore);

        // empty collector
        collector.number = 0;

      }
    }

    sound(SND_COIN);
    coin.destroy();
  }


  private createEnemy(unitPosition: Vector, size: Vector, value: number, color: string) {

    let enemy = new Shooter(unitPosition, size, TEAM_B);

    enemy.number = value;
    enemy.color = color;

    enemy.showShadow = false;

    enemy.damagePoints = GameConfig.enemyDamagePoints;
    enemy.damageRange = size.length();

    enemy.maxHealthPoints = GameConfig.enemyMaxHealthPoints;

    enemy.maxVelocity = GameConfig.enemyMaxVelocity;
    enemy.maxAcceleration = GameConfig.enemyMaxAcceleration;

    enemy.bulletSpeed = GameConfig.enemyBulletSpeed;

    enemy.shootCoolDownValue = GameConfig.enemyShootCoolDownValue;
    enemy.shootCoolDownTimer.set(rand(enemy.shootCoolDownValue, enemy.shootCoolDownValue * 2));

    enemy.setDynamicProperties = () => {

      enemy.shootCoolDownValue = GameConfig.enemyShootCoolDownValue;
      enemy.shootCoolDownTimer.set(enemy.shootCoolDownValue);
      enemy.bulletSpeed = GameConfig.enemyBulletSpeed;

    };
    enemy.setDynamicProperties();

    enemy.shootHandler = (targetPosition, bulletVelocity: Vector) => {
      let bulletSize = new Vector(GameConfig.enemyBulletSize, GameConfig.enemyBulletSize);


      const currentMode = SHOOT_PATTERN_MODES[GameConfig.enemyShootPattern];
      if (++enemy.shotPhase > currentMode.dest.length)
        enemy.shotPhase = 0;
      let initOffset = new Vector(currentMode.origin[enemy.shotPhase] * enemy.Size.x);
      bulletVelocity.rotate(currentMode.dest[enemy.shotPhase] * GameConfig.enemyShootSpreadAngle); //   currentMode.spreadAngle GameConfig.playerShootSpreadAngle);


      let enemyBullet = createBullet(enemy, bulletSize, bulletVelocity, initOffset, targetPosition);
      // same height
      enemyBullet._z = enemy._z;

      // same color
      enemyBullet.color = enemy.color;

      // 10% of enemy damage points
      enemyBullet.damagePoints = GameConfig.enemyBulletDamagePoints;

      enemyBullet.explode = (position: Vector) => {

        // sound(SND_EXPLOSION);

        let explosion = new Explosion({ position, size }, enemy.team, size.length());
        explosion.color = enemy.color;
        explosion.damagePoints = GameConfig.enemyBulletExplosionDamagePoints;

        this.explosions.push(explosion);

      };
      this.bullets.push(enemyBullet);


      // if (this.units.length < 10)
      //   sound(SND_ARROW_SHOOT)
    };

    enemy.explode = (position: Vector) => {
      let explosion = new Explosion({ position, size }, enemy.team, size.length() * 2, 3.5);
      explosion.damagePoints = GameConfig.enemyExplosionDamagePoints;
      explosion.Mass = 100;
      explosion.color = enemy.color;
      this.explosions.push(explosion);

      this.shakeForce = 3;
      sound(SND_DEATH);
    };

    this.stats.enemiesCreated++;

    return enemy;
  }


  private createPlayer(startPosition: Vector): Shooter {

    let player: Shooter;

    let size = new Vector(GameConfig.playerSize, GameConfig.playerSize);

    [...Array(GameConfig.playerUnits).keys()].forEach(() => {

      startPosition.add(new Vector(rand(-1, 1), rand(-1, 1)));

      [...Array(1).keys()].forEach(col => {

        let unitPosition = startPosition.clone().add(new Vector(0, 0).rotate(2 * PI / 12 * col));

        player = new Shooter(unitPosition, size, TEAM_A);
        player.showShadow = false;

        player.setDynamicProperties = () => {

          player.color = '#C0C0C0';

          player.shootCoolDownValue = GameConfig.playerShootCoolDownValue;
          player.shootCoolDownTimer.set(player.shootCoolDownValue);
          player.bulletSpeed = GameConfig.playerBulletSpeed;

        };
        player.setDynamicProperties();


        player.shootHandler = (targetPosition: Vector, bulletVelocity: Vector, zv: number) => {
          if (targetPosition == undefined) return;

          let bulletTargetPosition = targetPosition.clone();

          let bulletSize = new Vector(GameConfig.playerBulletSize, GameConfig.playerBulletSize);

          const currentMode = SHOOT_PATTERN_MODES[GameConfig.playerShootPattern];
          if (++player.shotPhase > currentMode.dest.length)
            player.shotPhase = 0;
          let initOffset = new Vector(currentMode.origin[player.shotPhase] * player.Size.x);
          bulletVelocity.rotate(currentMode.dest[player.shotPhase] * GameConfig.playerShootSpreadAngle); //   currentMode.spreadAngle GameConfig.playerShootSpreadAngle);

          let playerBullet = createBullet(player, bulletSize, bulletVelocity, initOffset, bulletTargetPosition);

          // sound(SND_SHOOT);

          // playerBullet._zv = zv;

          playerBullet.damagePoints = GameConfig.playerBulletDamagePoints;

          playerBullet.explode = (position: Vector) => {

            // No explosion for all bullets
            // if (rand(1) > .1) return;

            if (playerBullet instanceof Bullet) {
            };
          };


          this.bullets.push(playerBullet);

          // if (this.units.length < 10)
          if (this.shootSoundColdDownTimer.elapsed()) {
            sound(SND_ARROW_SHOOT);
            this.shootSoundColdDownTimer.set(2);
          }
        };

        player.explode = (position: Vector) => {

          let explosion = new Explosion({ position, size }, player.team, size.length() * 4, defaultExplosionTime * 4);
          explosion.Mass = 100;
          // Avoid self damage to test player explosions
          explosion.damagePoints = 0;
          this.explosions.push(explosion);

          this.shakeForce = 50;
          sound(SND_BIG_EXPLOSION);
        };


        // obj.targetPosition = unitPosition.clone().add(new Vector(rand(0, size.length()) * 5, rand(0, size.length() * 5)));
        if (this.units.filter(f => f.team == TEAM_A).length > 0)
          player.Visible = false;
        this.units.push(player);
      });
    });

    return player!;
  }


  checkRange(obj: GameObject, other: GameObject, range: number) {
    var rSum = obj.Radius + (range - obj.Radius) + other.Radius;
    var dx = other.Position.x - obj.Position.x;
    var dy = other.Position.y - obj.Position.y;
    return {
      a: rSum * rSum > dx * dx + dy * dy,
      b: rSum - Math.sqrt(dx * dx + dy * dy)
    };
  }

  createLabel(position: Vector, text: string, props: { moveTo: Vector }) { // = { moveTo: Vector.createSize(50).rotate(PI/2) }
    let label = new Label({ position, size: Vector.createSize() }, text);
    label.text = text;
    label.movePosition = label.Position.clone().add(props.moveTo);
    setTimeout(() => {
      label.destroy();
    }, 500);
    this.labels.push(label);
  }


  /// CUSTOM RENDER MENU IN GAME
  menuRender(refY?: number) {

    this.renderScoreBar();

    this.menuButtons
      .forEach((menu, index) => {
        // Set button position based on render position
        menu.Position = this.getRenderPosition(menu, index);
        menu._draw(drawEngine.context);
      });


  }


  getRenderPosition(menu: Button, index: number) {
    switch (menu.index) {
      case -1:
        return new Vector(drawEngine.canvasWidth * .1, backButton.posY);
      case 0: // shield
        return new Vector(drawEngine.canvasWidth * .1, drawEngine.canvasHeight * .75);
      case 1:
        return new Vector(drawEngine.canvasWidth * .1, drawEngine.canvasHeight * .85);
    }
    return new Vector(drawEngine.canvasWidth * .5, drawEngine.canvasHeight * .5);

  }

}

export const gameState = new GameState();


// function setGamePropertyValue(values: number[] = [1, 1]) {
//   GameConfig.enemySpawnTime = values[0];
//   GameConfig.enemyShootCoolDownValue = values[1];
// }

function enemyTargetDesignation(Units: Shooter[]) {

  Units
    .filter(f => f.targetPosition == undefined) // && f.targetNode == undefined
    .sort(() => Math.random() - .5)
    .slice(0, 100)
    .forEach((unit: Shooter) => {

      // let dist = drawEngine.canvasHeight * 1.2;
      let dist = 1;
      if (unit.team == TEAM_A) {
        dist *= -1 * GameConfig.bulletRange;
      } else {
        dist *= 1 * GameConfig.bulletRange;
      }

      const spreadX = rand(-20, 20);
      // Constraint vertical bullet distance
      unit.targetPosition = unit.Position.clone().add(new Vector(spreadX, dist));
      // forget target after a while
      setTimeout(() => {
        unit.targetPosition = undefined;
      }, rand(80, 100));

    });
}


