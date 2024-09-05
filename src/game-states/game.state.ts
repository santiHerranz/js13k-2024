/* eslint-disable class-methods-use-this */
import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';
import { Quadtree } from '@/quadtree/Quadtree';
import { Rectangle } from '@/quadtree/Rectangle';
import { Circle } from '@/quadtree/Circle';
import { Line } from '@/quadtree/Line';
import { Indexable } from '@/quadtree/types';
import { Vector } from '@/core/vector';
import { manageUnitsCollision as manageUnitCollision } from '@/collisionManager';
import { debounce, PI, rand, randInt, Timer } from '@/utils';
import { inputMouse } from '@/core/input-mouse';
import { Unit } from '@/game/unit';
import { GameObject } from '@/game-object';
import { Shooter } from '@/game/unit.shooter';
import { BULLET_TYPE_BULLET, BULLET_TYPE_FIREBALL, createBullet } from '@/game/game-weapons';
import { PLAYER_SHOOT_PATTERN_MODES } from './game-config';
import { Bullet } from '@/game/unit.bullet';
import { Explosion } from '@/game/unit.explosion';
import { summaryState } from './summary.state';
import { colorShadow, debug, GameConfig, transparent } from './game-config';
import { sound } from '@/core/sound';
import { SND_ARROW_SHOOT, SND_BIG_EXPLOSION, SND_COIN, SND_DEATH, SND_EXPLOSION, SND_HIGHSCORE, SND_TICTAC } from '@/game/game-sound';
import { GameMap, GameMapTheme } from '@/game/game-map';
import { defaultExplosionTime, Fireball } from '@/game/unit-fireball';
import { Coin, COIN_YELLOW, COIN_RED, COIN_BLUE, COIN_TOUCHED } from '@/game/game-coin';
import { time } from '@/index';
import { globalParticles } from '@/game/game-particle';
import { completedState } from './completed.state';
import { Collector } from '@/game/game-collector';
import { Label } from '@/game/game-label';
import { CollectibleFactory } from '@/game/game-collectible';
import { Bomb } from '@/game/game.bomb';
import { introState } from './intro.state';

let magicOffset = 100;

let nIntervId: NodeJS.Timer | null;

export type TEAM = 1 | 2;

export const TEAM_A: TEAM = 1;
export const TEAM_B: TEAM = 2;

export const scrollSpeed = new Vector(0, .2);


const HINTS = [
  "  HINT: USE ARROW KEYS TO MOVE.",
  "  HINT: PRESS BACKSPACE TO UNDO.",
  "  HINT: PRESS R TO RESTART.",
  "  HINT: PRESS ENTER TO PAUSE."
];


const ENEMY_PATH = [
  [new Vector(100, 300), new Vector(100, 1200), new Vector(1000, 1200), new Vector(1000, 300)],
];

class GameState implements State {

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

  // Map
  gameMap: GameMap;
  seed: number = .601; // Math.random() //

  playerAlive: boolean;

  score: number;

  shakeForce: number = 0;


  dragStart: Vector | undefined = undefined;
  lastX: number = 0;
  lastY: number = 0;
  player: Shooter | undefined;
  currentMessage: string = 'Hellow world';

  enemySpawnTimer: Timer = new Timer(undefined);

  gameLevelTimer: Timer = new Timer(undefined);
  shootSoundColdDownTimer: Timer = new Timer(1);
  winCondition: boolean = false;
  enemyList: any;

  stats = { enemiesCreated: 0, kills: 0, killsGoal: 0, maxScoreAvailable: 0 };


  constructor() {


    this.playerAlive = false;

    this.score = 0;

    this.gameMap = new GameMap(this.seed, GameMapTheme.sea);
    this.gameMap.speed = 2.5; // 0.096


    this.collisionTree = new Quadtree({
      width: drawEngine.canvasWidth,
      height: drawEngine.canvasHeight,
      maxObjects: 3
    });
  }

  // INPUT CONTROLS

  mouseDrag() {
    if (inputMouse.dragStart) {
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
    if (inputMouse.dragStart) {
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

    this.canvas!.setAttribute(
      "style",
      // "background-color: #000;" + 
      "background-color: #0E223A;" +
      "image-rendering: optimizeSpeed;" +
      "image-rendering: pixelated;" +
      // "image-rendering: smooth;" +
      // "image-rendering: -moz-crisp-edges;" +
      ""
    );

    this.winCondition = false;

    this.shakeForce = 0;

    // empty arrays
    this.units = [];
    this.bullets = [];
    this.coins = [];
    this.explosions = [];
    this.enemyList = [];
    this.labels = [];

    // reset score
    this.score = 0;

    // reset stats
    this.stats = {
      enemiesCreated: 0,
      kills: 0,
      killsGoal: 0, // * .8,
      maxScoreAvailable: 0,
    };


    // let data = this.createEnemyValues(GameConfig.levelCurrentValue);
    let data = this.createEnemyCount(GameConfig.levelEnemyCount[GameConfig.levelCurrentIndex]);


    this.enemyList = data.list;

    // Kill 100% of enemies created
    this.stats.killsGoal = data.list.length;

    // Score max coin value created
    this.stats.maxScoreAvailable = data.maxScoreAvailable;

    let hw = drawEngine.canvasWidth / 2;
    let hh = drawEngine.canvasHeight / 2;

    let coinSize = new Vector(GameConfig.coinSize, GameConfig.coinSize);
    this.collectorCoin = CollectibleFactory.createCollectible(COIN_RED, { position: new Vector(hw, 330), size: coinSize.clone().scale(1.5) });
    this.collectors = [];
    this.collectors.push(this.collectorCoin);


    const startPosition = new Vector(hw, hh + hh * .6);
    this.player = this.createPlayer(startPosition);

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


  onLeave() {

    // remove listeners
    inputMouse.removeAllEventListener();

  }


  private winConditionCriteria() {
    // return this.collectorYellow!.number > 100;
    return this.stats.kills >= this.stats.killsGoal;
  }


  onUpdate(dt: number) {

    if (!this.winCondition && this.winConditionCriteria()) {
      this.winCondition = true;

      // Score the rest
      this.score += this.collectorCoin!.number;
      this.collectorCoin!.number = 0;

      setTimeout(() => {
        sound(SND_HIGHSCORE);

        completedState.score = this.score;
        completedState.maxScore = this.stats.maxScoreAvailable;

        gameStateMachine.setState(completedState);
      }, 5000);

    }

    ////////////////////////////////
    // LEVEL DIFICULTY DINAMIC CONTROL

    if (this.gameLevelTimer.elapsed()) {

      // Test
      switch (1 + GameConfig.levelCurrentIndex) {
        case 1:
          GameConfig.enemySpawnTime = 1;
          GameConfig.playerShootPattern = 0;
          GameConfig.playerShootCoolDownValue = .2;
          GameConfig.playerBulletSize = 10;
          GameConfig.playerBulletDamagePoints = 30;
          GameConfig.playerBulletType = BULLET_TYPE_BULLET;
          break;
        case 2:
          GameConfig.enemySpawnTime = .5;
          GameConfig.playerShootPattern = 1;
          GameConfig.playerShootCoolDownValue = .2;
          GameConfig.playerBulletSize = 8;
          GameConfig.playerBulletDamagePoints = 50;
          GameConfig.playerBulletType = BULLET_TYPE_BULLET;
          break;
        case 3:
          GameConfig.enemySpawnTime = .3;
          GameConfig.playerShootPattern = 2;
          GameConfig.playerShootCoolDownValue = .1;
          GameConfig.playerBulletSize = 10;
          GameConfig.playerBulletDamagePoints = 50;
          GameConfig.playerBulletType = BULLET_TYPE_BULLET;
          break;

        // case 3:
        //   GameConfig.enemySpawnTime = 1;
        //   GameConfig.playerShootPattern = 0;
        //   GameConfig.playerShootCoolDownValue = 2;
        //   GameConfig.playerBulletSize = 20;
        //   GameConfig.playerBulletDamagePoints = 200;
        //   GameConfig.playerBulletType = BULLET_TYPE_FIREBALL;
        //   break;

        default:
          GameConfig.playerBulletType = BULLET_TYPE_BULLET;
          GameConfig.playerSize = rand(30, 90);
          GameConfig.playerBulletSize = rand(4, 12);
          GameConfig.playerShootCoolDownValue = rand(.001, .1);
          GameConfig.playerShootPattern = randInt(0, PLAYER_SHOOT_PATTERN_MODES.length);
          GameConfig.playerShootSpreadAngle = Math.PI / 180 * randInt(10, 30);
          break;
      }

      // Apply changed properties for all
      this.units.forEach(unit => unit.setDynamicProperties());

      this.gameLevelTimer.set(3); // every 5 seconds
    }


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
            gameStateMachine.setState(summaryState);
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
    this.gameMap.drawTileMap(drawEngine.context, dt);


    // ENEMY SPAWN
    if (!debug.enemyPaused && this.enemySpawnTimer.elapsed() && this.enemyList.length > 0) {

      let hw = drawEngine.canvasWidth / 2;
      let hh = drawEngine.canvasHeight / 2;

      const startPosition = new Vector(hw, hh);
      const sizeBase = new Vector(1, 1).scale(GameConfig.enemySize);

      [...Array(1).keys()].forEach(() => { //

        const leftOrRight: number = Math.random() < .5 ? 0 : 1;

        let enemyHeightSpawnPosition = -hh * .4;

        startPosition.add(new Vector(hw * (leftOrRight == 1 ? -1 : 1) * 1.2, enemyHeightSpawnPosition)); // 

        let value = this.getEnemyNextValue(); // coinValues[Math.floor(this.stats.enemiesCreated % coinValues.length-1)];

        // TODO not all enemies drop coin
        value = 0;

        let enemy = this.enemySpawn(startPosition, sizeBase, leftOrRight, value);

        this.units.push(enemy);
      });


      // if (this.getEnemies().length > 500)
      this.enemySpawnTimer.set(GameConfig.enemySpawnTime);
    }


    this.bullets.forEach((item: GameObject) => {
      item._update(dt);
    });


    // if (controls.isEscape) {
    //   gameStateMachine.setState(introState);
    // }


    // Enemy target designation
    enemyTargetDesignation(this.units);


    //////////////////////////////////
    // DAMAGE MANAGER BEFORE PHYSICS COLLISION

    // Unit vs Unit: Damage both units
    this.units
      .forEach((unitA: Unit) => {

        this.units
          .filter(f => f.team == TEAM_B && unitA.team == TEAM_A || f.team == TEAM_A && unitA.team == TEAM_B)
          .forEach((unitB: Unit) => {

            var isInRange = this.checkRange(unitA, unitB, unitA.damageRange);
            if (isInRange.a) {
              debug.damageMessages && console.log(`unit to unit damage: ${unitB.damagePoints} / ${unitA.damagePoints}`);
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
              debug.damageMessages && console.log(`explosion to unit damage: ${explosion.damagePoints}`);
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
              debug.damageMessages && console.log(`bullet to unit damage: ${bullet.damagePoints}`);
              unit.applyDamage(bullet.damagePoints);
              // }
              bullet.destroy();
            }

          });
      });


    //////////////////////////////////
    // PHYSICS COLLISION MANAGER

    const useCases = [
      // Enemy bullets vs Player
      [...this.getTeamBullets(TEAM_B), ...this.units.filter(f => f.team == TEAM_A)],
      // Player bullets vs Enemies
      [...this.getTeamBullets(TEAM_A), ...this.getEnemies()],
      // All units except bombs
      [...this.units.filter(f => f.type != 'bomb')],
      // Bombs vs Player
      [...this.units.filter(f => f.type == 'bomb'), ...this.units.filter(f => f.team == TEAM_A)],
      // Coins vs coins
      [...this.coins],
    ];

    useCases.forEach((useCase) => {
      this.collisionTree.clear();
      useCase
        .forEach(item => {
          this.collisionTree.insert(item);
        });
      manageUnitCollision(useCase, dt);
    });


    //////////////////////////////////
    // COLLISION EVENTS

    // Touched coins => Collected coins
    this.collectors
      .forEach(collector => {

        this.coins
          .filter(f => f.type == COIN_TOUCHED)
          // .filter(f => f.number != 13)
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
      .filter(f => f.type == COIN_YELLOW)
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
        if (shooter.targetPosition && this.shooterControlMode(shooter)) {
          shooter.shootTo(shooter.targetPosition);
        }
      });


    const deltaMove = 2.5;
    let move = { h: 0, v: 0 };
    move.h += controls.isLeft ? -deltaMove : 0;
    move.h += controls.isRight ? deltaMove : 0;
    move.v += controls.isUp ? -deltaMove * .8 : 0;
    move.v += controls.isDown ? deltaMove * .8 : 0;


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
      if (item.team == TEAM_A) {
        this.playerPositionAreaConstraint(item);
      }

    });

    /////////////////////////////
    // UPDATE OBJECTS

    [...this.units, ...this.bullets, ...this.coins, ...this.explosions, ...this.collectors]
      .forEach((item: any) => {
        item._update(dt);
      });

    /////////////////////////////
    // DRAW QUADTREE

    // drawEngine.context.beginPath();
    // drawEngine.drawQuadtree(this.collisionTree, drawEngine.context);

    /////////////////////////////
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


    /////////////////////////////
    // DRAW HEADER

    drawEngine.drawText('' + time.toFixed(2), 30, drawEngine.canvasWidth * .95, 40, 'white', 'right');
    // drawEngine.drawText('bullets:' + this.bullets.length, 30, drawEngine.canvasWidth * .95, 80, 'white', 'right');
    // drawEngine.drawText('' + dt.toFixed(2), 28, drawEngine.canvasWidth * .95, 40);
    drawEngine.drawText(`Level : ${1 + GameConfig.levelCurrentIndex} of ${GameConfig.levelEnemyCount.length}`, 50, 10, 50, 'white', 'left');
    // drawEngine.drawText('coins:' + this.coins.length, 40, drawEngine.canvasWidth / 2, 150)
    // drawEngine.drawText('explo:' + this.explosions.length, 40, drawEngine.canvasWidth / 2, 200)
    // drawEngine.drawText('shakeForce:' + this.shakeForce, 40, drawEngine.canvasWidth / 2, 250)

    // drawEngine.drawText('Mouse:' + JSON.stringify(inputMouse.pointer.Position), 40, drawEngine.canvasWidth / 2, 150)

    // if (this.currentMessage)
    //   drawEngine.drawText('' + this.currentMessage, 40, drawEngine.canvasWidth * .5, 120, 'white', 'center');

    // let message = `${this.stats.kills} of ${this.stats.killsGoal}`;
    // message += ` (${this.getEnemies().length}/${GameConfig.levelEnemyMaxCount.toFixed(0)})`;

    drawEngine.drawText(`Enemies: ${this.stats.killsGoal - this.stats.kills} of ${this.stats.killsGoal}`, 40, drawEngine.canvasWidth * .95, 270, 'white', 'right');
    // drawEngine.drawText(`Points: ${this.stats.maxScoreAvailable} max`, 40, drawEngine.canvasWidth * .95, 320, 'white', 'right');
    // drawEngine.drawText(`Collector: ${this.collectorCoin?.number}`, 40, drawEngine.canvasWidth * .95, 370, 'white', 'right');


    let currentHealthRatio = this.player!.healthPoints / this.player!.maxHealthPoints;

    const healthBarProps = { x: drawEngine.canvasWidth * .2 - 200, y: 180, w: 400, h: 50 };
    drawEngine.drawRectangle(new Vector(healthBarProps.x, healthBarProps.y), new Vector(healthBarProps.w, healthBarProps.h), { fill: '#fff' });
    drawEngine.drawRectangle(new Vector(healthBarProps.x, healthBarProps.y), new Vector(healthBarProps.w * currentHealthRatio, healthBarProps.h), { fill: currentHealthRatio > .5 ? '#0f0' : '#f00' });
    // drawEngine.drawText('Health ' + this.player?.healthPoints.toFixed(0), 40, 18, 70, 'white', 'left');

    // drawEngine.drawText(`particles: ${globalParticles.length}` , 40, drawEngine.canvasWidth * .5, 200, 'white', 'center');


    drawEngine.drawText('score: ' + this.score, 60, drawEngine.canvasWidth * .95, 195, 'yellow', 'right');


    if (controls.DeleteKey) {
      this.player?.explode(this.player?.Position);

      // console.log('llamada con rebotes');

      // debounce(() => {
      //   this.metodoSinRebotes.bind(this, { target: this, Position: this.collectorCoin!.Position, text: "+1000" });
      // }, 300);
    }

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
      gameStateMachine.setState(introState);
    }

    // CURSOR 
    drawEngine.drawCircle(inputMouse.pointer.Position, 60, { stroke: transparent, fill: colorShadow });

    // PARTICLES
    !debug.showWires && globalParticles.forEach(_ => _.draw(drawEngine.context));


  }

  metodoSinRebotes(props: { target: any; Position: Vector; text: string; }): void {
    console.log('llamada sin rebotes');
    this.createLabel(props.Position, props.text);
  }


  private coinValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // private coinValues = [10, 1, 3, 5, 8, 9, 4];
  // private coinValues = [1,2,3]; // EASY
  // private coinValues = [8,5,6,7,9,4]; // DIFICULTY MODE
  // private coinValues = [13]; // HARD MODE
  private coinIndex = 0;

  private createEnemyCount(count: number = 1) {
    let list: number[] = [];
    let maxScoreAvailable = 0;
    let intent = 0;

    while (list.length < count) {
      let value = this.coinValues[(randInt(0, this.coinValues.length))];
      list.push(value);
    }

    return { intent, list, maxScoreAvailable };
  }

  private createEnemyValues(maxScore: number = 1) {

    console.log('maxScore desired: ' + maxScore);

    let list: number[] = [];
    let maxScoreAvailable = 0;
    let intent = 0;
    const initialValue: number = 13;

    do {

      list = [];

      while (list.reduce((a: number, c: number) => {
        if (a + c == 13) { c = 0; return a; } // Avoid acumulated 13
        return a + c;
      }, initialValue) < maxScore) {
        let value = this.coinValues[(randInt(0, this.coinValues.length))];
        list.push(value);
      }

      maxScoreAvailable = list.reduce((a: number, c: number) => a + c, 0);

    } while (++intent < 1000 && maxScoreAvailable != maxScore);

    console.log('intent ' + intent + '. max score available: ' + maxScoreAvailable);
    console.log('list: ' + JSON.stringify(list));

    // the fun one
    list.push(13);

    // shuffle list
    list = list
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    // list = [5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8]

    return { intent, list, maxScoreAvailable };


  }


  private getEnemyNextValue() {

    let value = this.enemyList.shift();

    // console.log('enemy remain: ' + JSON.stringify(this.enemyList));

    return value;
  }

  private enemySpawn(startPosition: Vector, sizeBase: Vector, leftOrRight: number, value: number) {

    let color = this.getEnemyColor(value);

    let size = sizeBase.clone(); //.add(new Vector(value, value))

    let unitPosition = startPosition.clone().add(new Vector(rand(0, size.length()), rand(0, size.length())));

    let enemy = this.createEnemy(unitPosition, size, value, color);

    // Set Path to follow
    enemy.path = ENEMY_PATH[GameConfig.ennemyPath];

    if (leftOrRight)
      enemy.path = enemy.path.reverse();

    // Start path follower
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

  private shooterControlMode(shooter: Shooter) {
    // Auto
    // return true;
    // Manual
    return shooter.team == TEAM_A && !GameConfig.playerAutoShoot ? controls.isSpace : true;

  }

  /***
 Rainbow Color Code HEX

    Red #e81416
    Orange #ffa500
    Yellow #faeb36
    Green #79c314
    Blue #487de7
    Indigo #4b369d
    Violet #70369d
   */
  private getEnemyColor(value: number) {
    let color = '#fff';

    const colors = ['#ffa500', '#79c314', '#487de7', '#4b369d', '#70369d'];

    color = colors[value % colors.length];

    return color;
  }

  onEnemyDestroyed(enemy: Shooter) {

    const startPosition = new Vector(enemy.Position.x, enemy.Position.y);

    let size = new Vector(GameConfig.coinSize, GameConfig.coinSize);

    let position = startPosition.clone(); // .add(Vector.rand().scale(size.length() * 2));

    if (enemy.scorePoints > 0) {
      // Show Score label
      this.createLabel(enemy.Position, '+' + enemy.scorePoints, { moveTo: Vector.createSize(50).rotate(-Math.PI / 2) });

      // Score points
      this.score += enemy.scorePoints;
    }

    // game Coin
    if (enemy.number > 0) {

      setTimeout(() => {
        let coin = CollectibleFactory.createCollectible(COIN_YELLOW, { position, size });
        coin.maxVelocity = 2;
        coin.number = enemy.number;
        coin.showNumber = true;
        coin.Size = size;
        this.coins.push(coin);
      }, 100);

    }

    if (!(enemy instanceof Bomb))
      this.stats.kills++;

  }

  onCoinTouched(coin: Coin) {
    if (!coin.Active) return;


    switch (coin.type) {
      case COIN_RED:
        this.player!.weaponBulletType = BULLET_TYPE_FIREBALL;
        this.createLabel(this.collectorCoin!.Position, 'FIREBALL');
        break;
      case COIN_BLUE:
        this.player!.weaponBulletType = BULLET_TYPE_BULLET;
        this.createLabel(this.collectorCoin!.Position, 'BULLET');
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

    const p = this.player!;

    console.log('collect ' + coin.type + ' ' + coin.name + ' ' + p.number + ' + ' + coin.number + ' = ' + (p.number + coin.number));

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
    if (coin.number == 0) return;

    if (collector.number + coin.number == 13) {

      this.createLabel(collector.Position, "BOMB!");

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

      console.log('Collected: +' + coin.number + ' = ' + collector.number);

      // reset coin
      coin.number = 0;

      if (collector.number > 12) {

        // Show Score label
        this.createLabel(collector.Position, '+' + collector.number, { moveTo: Vector.createSize(50).rotate(-Math.PI / 2) });

        // Score points
        this.score += collector.number;

        console.log('Score: +' + collector.number + ' = ' + this.score);

        // empty collector
        collector.number = 0;

      }
    }

    sound(SND_COIN);
    coin.destroy();
  }


  mouseDown() {
    // let explosion = new Explosion(inputMouse.pointer.Position, new Vector(50,50), TEAM_A, 100, this.player!);
    // explosion.Mass = 100;
    // this.explosions.push(explosion);
  }


  private createEnemy(unitPosition: Vector, size: Vector, value: number, color: string) {

    let enemy = new Shooter(unitPosition, size, TEAM_B);

    enemy.number = value;
    enemy.color = color;

    enemy.damagePoints = GameConfig.enemyDamagePoints;
    enemy.damageRange = size.length();

    enemy.maxHealthPoints = GameConfig.enemyMaxHealthPoints;

    enemy.maxVelocity = GameConfig.enemyMaxVelocity;
    enemy.maxAcceleration = GameConfig.enemyMaxAcceleration;

    enemy.bulletSpeed = GameConfig.enemyBulletSpeed;

    enemy.shootCoolDownValue = GameConfig.enemyShootCoolDownValue;
    enemy.shootCoolDownTimer.set(rand(enemy.shootCoolDownValue, enemy.shootCoolDownValue * 2));

    enemy.shootHandler = (targetPosition, bulletSpeed: Vector) => {
      let bulletSize = new Vector(GameConfig.enemyBulletSize, GameConfig.enemyBulletSize);

      let enemyBullet = createBullet(GameConfig.enemyBulletType, enemy, bulletSize, bulletSpeed, new Vector(0, 0), targetPosition);
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

        if (enemyBullet instanceof Fireball) {
          // no color for fire explosion
          explosion.color = '';
          explosion.range = 100;
        }
        this.explosions.push(explosion);

      };
      this.bullets.push(enemyBullet);


      // if (this.units.length < 10)
      //   sound(SND_ARROW_SHOOT)
    };

    enemy.explode = (position: Vector) => {
      let explosion = new Explosion({ position, size }, enemy.team, size.length() * 2);
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
        player.showShadow = true;

        player.setDynamicProperties = () => {

          player.weaponBulletType = GameConfig.playerBulletType;

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

          const currentMode = PLAYER_SHOOT_PATTERN_MODES[GameConfig.playerShootPattern];

          if (++player.shotPhase > currentMode.dest.length)
            player.shotPhase = 0;

          let initOffset = new Vector(currentMode.origin[player.shotPhase] * player.Size.x);


          bulletVelocity.rotate(currentMode.dest[player.shotPhase] * GameConfig.playerShootSpreadAngle);

          let playerBullet = createBullet(player.weaponBulletType, player, bulletSize, bulletVelocity, initOffset, bulletTargetPosition);

          // playerBullet._zv = zv;

          playerBullet.damagePoints = GameConfig.playerBulletDamagePoints;

          playerBullet.explode = (position: Vector) => {

            // No explosion for all bullets
            if (rand(1) > .1) return;

            if (playerBullet instanceof Fireball) {
              let explosion = new Explosion({ position, size: bulletSize }, player.team, .01 * bulletSize.length());
              explosion.Mass = 100;
              explosion.color = player.color;
              explosion.damagePoints = GameConfig.playerBulletExplosionDamagePoints;
              this.explosions.push(explosion);
              // sound(SND_EXPLOSION);

            }

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

  createLabel(position: Vector, text: string, props = { moveTo: Vector.createSize(50) }) {
    let label = new Label({ position, size: Vector.createSize() }, text);
    label.text = text;
    label.movePosition = label.Position.clone().add(props.moveTo!);
    setTimeout(() => {
      label.destroy();
    }, 500);
    this.labels.push(label);
  }

}

export const gameState = new GameState();


function enemyTargetDesignation(Units: Shooter[]) {

  Units
    .filter(f => f.targetPosition == undefined) // && f.targetNode == undefined
    .sort(() => Math.random() - .5)
    .slice(0, 100)
    .forEach((unit: Shooter) => {

      // let dist = drawEngine.canvasHeight * 1.2;
      let dist = 1;
      if (unit.team == TEAM_A) {
        dist *= -1 * GameConfig.playerBulletRange;
      } else {
        dist *= 1 * GameConfig.enemyBulletRange;
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


