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
import { PI, rand, Timer } from '@/utils';
import { inputMouse } from '@/core/input-mouse';
import { Unit } from '@/game/unit';
import { GameObject } from '@/game-object';
import { EntityType } from '@/game/EntityType';
import { Shooter } from '@/game/unit.shooter';
import { BULLET_TYPE_BULLET as BULLET_TYPE_BALL, BULLET_TYPE_FIREBALL, createBullet } from '@/game/game-weapons';
import { Bullet } from '@/game/unit.bullet';
import { Explosion } from '@/game/unit.explosion';
import { summaryState } from './summary.state';
import { colorShadow, debug, GameConfig, transparent } from './game-config';
import { sound } from '@/core/sound';
import { SND_ARROW_SHOOT, SND_BIG_EXPLOSION, SND_COIN, SND_DEATH, SND_EXPLOSION, SND_HIGHSCORE, SND_TICTAC } from '@/game/game-sound';
import { GameMap, GameMapTheme } from '@/game/game-map';
import { defaultExplosionTime, Fireball } from '@/game/unit-fireball';
import { Coin, CoinGreen, COIN_TYPE, COIN_TYPE_YELLOW, createCoin, CoinRed, CoinBlue, CoinYellow, COIN_TYPE_GREEN } from '@/game/game-coin';
import { time } from '@/index';
import { globalParticles } from '@/game/game-particle';
import { completedState } from './completed.state';

let magicOffset = 100;

let nIntervId: NodeJS.Timer | null;

export const TEAM_A = 1;
export const TEAM_B = 2;

export const scrollSpeed = new Vector(0, .25);


const HINTS = [
  "  HINT: USE ARROW KEYS TO MOVE.",
  "  HINT: PRESS BACKSPACE TO UNDO.",
  "  HINT: PRESS R TO RESTART.",
  "  HINT: PRESS ENTER TO PAUSE."
];

const LEVEL_DATA = [
  [],
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

  collectorYellow: Coin | undefined;
  collectorRed: Coin | undefined;
  collectorBlue: Coin | undefined;
  collectorGreen: Coin | undefined;

  collector: CoinGreen[] = [];

  // Map
  gameMap: GameMap;
  seed: number = .601; // Math.random() //

  playerAlive: boolean;

  level: number = 1;
  score: number;

  shakeForce: number = 0;


  dragStart: Vector | undefined = undefined;
  lastX: number = 0;
  lastY: number = 0;
  player: Shooter | undefined;
  currentMessage: string = 'Hellow world';

  enemySpawnTimer: Timer = new Timer(undefined);

  gameLevelTimer: Timer = new Timer(undefined);
  stats!: { enemiesCreated: number, kills: number, killsGoal: number };
  shootSoundColdDownTimer: Timer = new Timer(1);
  winCondition: boolean = false;
  enemyList: any;


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


    this.units = [];
    this.bullets = [];
    this.coins = [];
    this.explosions = [];
    this.enemyList = [];

    this.createEnemyValues(10);

    this.stats = {
      enemiesCreated:0,
      kills: 0,
      killsGoal: this.enemyList.length * .8,
    };


    let coinSize = new Vector(GameConfig.coinSize, GameConfig.coinSize);
    // this.collectorGreen = new CoinGreen({position: new Vector(drawEngine.canvasWidth * 1/5, drawEngine.canvasHeight * .98), size: coinSize});
    // this.collectorBlue = new CoinBlue({position: new Vector(drawEngine.canvasWidth * 2/5, drawEngine.canvasHeight * .98), size: coinSize});
    // this.collectorRed = new CoinRed({position: new Vector(drawEngine.canvasWidth * 3/5, drawEngine.canvasHeight * .98), size: coinSize});
    this.collectorYellow = new CoinYellow({ position: new Vector(drawEngine.canvasWidth * .90, drawEngine.canvasHeight * .18), size: coinSize.clone().scale(2) });
    this.collectorYellow.showBall = false;
    this.collectorYellow.showShadow = false;
    // this.collectorYellow.showNumber = true;
    this.collector.push(this.collectorYellow); // , this.collectorRed, this.collectorBlue, this.collectorGreen

    let hw = drawEngine.canvasWidth / 2;
    let hh = drawEngine.canvasHeight / 2;

    const startPosition = new Vector(hw, hh + hh * .8);
    this.player = this.createPlayer(startPosition);

    this.enemySpawnTimer.set(3);
    this.gameLevelTimer.set(10);

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
    return this.stats.kills > this.stats.killsGoal;
  }


  onUpdate(dt: number) {

    if (!this.winCondition && this.winConditionCriteria()) {
      this.winCondition = true;
      setTimeout(() => {
        sound(SND_HIGHSCORE);

        completedState.Score = this.collectorYellow!.number;

       gameStateMachine.setState(completedState);
     }, 2000);

    }


    // LEVEL DIFICULTY CONTROL
    if (this.gameLevelTimer.elapsed()) {

      // if (this.level == 1 && this.score > 100)
      //   this.level++;

      if (this.stats.kills > 5)
        GameConfig.levelEnemyMaxCount *= 1.2;

      GameConfig.levelEnemyMaxCount = Math.min(13,GameConfig.levelEnemyMaxCount);
  
      this.gameLevelTimer.set(5); // every 5 seconds
    }


    // SHAKE
    if (this.shakeForce > 0)
      this.shakeForce -= 1;
    drawEngine.context.save();
    drawEngine.context.translate(0, -magicOffset);
    drawEngine.preShake(this.shakeForce);


    this.playerAlive = this.units.filter(f => f.team == TEAM_A).length > 0;

    // Units explode at the end
    this.units
      .filter(f => !f.Active || f.healthPoints < 1)
      .forEach(unit => {

        unit.explode(unit.Position);

        if (unit.team == TEAM_B)
          this.onEnemyKilled(unit);

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
    this.units = this.units.filter(f => f.Active && f.healthPoints > 0 && f.Position.y < drawEngine.canvasHeight);
    this.coins = this.coins.filter(f => f.Active && f.Position.y < drawEngine.canvasHeight);
    this.explosions = this.explosions.filter(f => f.Active && f.Position.y < drawEngine.canvasHeight);
    this.bullets = this.bullets.filter((f: GameObject) => { return f.Active; });


    // DRAW BACKGROUND MOVING
    this.gameMap.drawTileMap(drawEngine.context, dt);


    // CREATE ENEMY
    if ( this.enemySpawnTimer.elapsed() && this.getEnemies().length < GameConfig.levelEnemyMaxCount) { 

      let hw = drawEngine.canvasWidth / 2;
      let hh = drawEngine.canvasHeight / 2;

      const startPosition = new Vector(hw, hh);
      const sizeBase = new Vector(1, 1).scale(GameConfig.enemySize);

        [...Array(1).keys()].forEach(() => { //

          const leftOrRight: number = Math.random()<.5?0:1;

          startPosition.add(new Vector(hw * (leftOrRight == 1 ? -1 : 1) * 1.2, -hh * .6)); // 

          let value = this.getEnemyNextValue(); // coinValues[Math.floor(this.stats.enemiesCreated % coinValues.length-1)];

          let enemy = this.enemySpawn(startPosition, sizeBase, leftOrRight, value);

          this.units.push(enemy);
        });
      

      // if (this.getEnemies().length > 500)
        this.enemySpawnTimer.set(3);
    }


    // TEST Random Coins
    debug.testCoins && this.testCoins();


    this.bullets.forEach((item: GameObject) => {
      item._update(dt);
    });


    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }


    // Enemy target designation
    enemyTargetDesignation(this.units);


    // DAMAGE MANAGER
    // Unit vs Unit: Damage both units
    this.units
      .forEach((unitA: Unit) => {

        this.units
          .filter(f => f.team == TEAM_B && unitA.team == TEAM_A || f.team == TEAM_A && unitA.team == TEAM_B)
          .forEach((unitB: Unit) => {

            var isInRange = this.checkRange(unitA, unitB, unitA.damageRange);
            if (isInRange.a) {
              debug.damageMessages && console.log(`unit to unit damage: ${unitB.damagePoints} / ${unitA.damagePoints}`);
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
              debug.damageMessages && console.log(`explosion to unit damage: ${explosion.damagePoints}`);
              unit.applyDamage(explosion.damagePoints);
              // disable damage explosion after impact
              explosion.damagePoints = 0;
            }
          });
      });

    // Bullet vs Unit: Damage Unit and bullet destroy
    this.bullets
      .forEach((bullet: Bullet) => {

        this.units
          .filter(f => f.team == TEAM_B && bullet.team == TEAM_A || f.team == TEAM_A && bullet.team == TEAM_B)
          .forEach((unit: Unit) => {

            var isInRange = this.checkRange(bullet, unit, bullet.damageRange);
            if (isInRange.a) {
              debug.damageMessages && console.log(`bullet to unit damage: ${bullet.damagePoints}`);
              unit.applyDamage(bullet.damagePoints);
              bullet.destroy();
            }

          });
      });

    // Bullet vs Bullet: Destroy both
    // this.bullets
    // .forEach((bullet: Bullet) => {
    //   this.bullets
    //     .filter(f => f.team == TEAM_B && bullet.team == TEAM_A || f.team == TEAM_A && bullet.team == TEAM_B)
    //     .forEach((other: Unit) => {
    //       var collision = this.checkRange(bullet, other, bullet.Radius);
    //       if (collision.a) {
    //         other.destroy();
    //         bullet.destroy();
    //       }
    //     });
    // });

    // Collect coins
    this.coins
      .forEach((coin: Coin) => {

        this.units
          .filter(f => f.team == TEAM_A)
          .forEach((unit: Unit) => {

            var collision = this.checkRange(coin, unit, unit.Radius);
            if (collision.a) {
              this.onCoinTouched(coin);
            }

          });

        this.collector.forEach(collector => {
          if (coin.movePosition && collector) {
            var collision = this.checkRange(coin, collector, collector.Radius);
            if (collision.a) {
              this.onCoinCollected(collector, coin);
            }
          }
        });
      });

    // PHYSICS COLLISION MANAGER

    // Bullets vs Shooters
    let collisionList: (Unit | Shooter | Coin)[] = [...this.units.filter(f => f.team == TEAM_A), ...this.bullets.filter(f => f.team == TEAM_B)];
    this.collisionTree.clear();
    collisionList
      .forEach(item => {
        this.collisionTree.insert(item);
      });
    manageUnitCollision(collisionList, dt);

    // Bullets vs Shooters
    collisionList = [...this.getEnemies(), ...this.bullets.filter(f => f.team == TEAM_A)];
    this.collisionTree.clear();
    collisionList
      .forEach(item => {
        this.collisionTree.insert(item);
      });
    manageUnitCollision(collisionList, dt);

    // Shooters
    collisionList = [...this.units];
    this.collisionTree.clear();
    collisionList
      .forEach(item => {
        this.collisionTree.insert(item);
      });
    manageUnitCollision(collisionList, dt);

    // Coins
    collisionList = [...this.coins];
    this.collisionTree.clear();
    collisionList
      .forEach(item => {
        this.collisionTree.insert(item);
      });
    manageUnitCollision(collisionList, dt);


    // Shoot
    this.units
      .forEach((shooter: Shooter) => {
        let canShoot = this.shooterControlMode(shooter);
        if (shooter.targetPosition && canShoot) {
          shooter.shootTo(shooter.targetPosition);
        }
      });


    const deltaMove = 2.0;
    let move = { h: 0, v: 0 };
    move.h += controls.isLeft ? -deltaMove : 0;
    move.h += controls.isRight ? deltaMove : 0;
    move.v += controls.isUp ? -deltaMove * .8 : 0;
    move.v += controls.isDown ? deltaMove * .8 : 0;


    // MOVE COINS
    this.coins.forEach((coin: Coin) => {

      if (!coin.movePosition) {
        coin.Acceleration.add(scrollSpeed);
      } else {
        coin.Acceleration.add(coin.moveForce());
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

    [...this.units, ...this.bullets, ...this.coins, ...this.explosions].forEach((item: any) => {
      item._update(dt);
    });


    // if (true) {
    //   drawEngine.context.beginPath()
    //   drawEngine.drawQuadtree(this.collisionTree, drawEngine.context);
    // }

    // DRAW

    [...this.units, ...this.bullets, ...this.coins, ...this.explosions]
      .sort((a: GameObject, b: GameObject) => { return -((b.Position.y + b._z) * 10000 + b.Position.x) + ((a.Position.y + a._z) * 10000 + a.Position.x); })
      .forEach((item: GameObject) => {
        item.draw(drawEngine.context);
      });


    drawEngine.postShake();


    this.collector.forEach((coin: CoinGreen) => {
      coin.draw(drawEngine.context);
    });
    // drawEngine.drawText('' + this.score, 60, this.dummyCoin!.Position.x, this.dummyCoin!.Position.y + 25)

    drawEngine.context.restore();

    drawEngine.drawText('' + time.toFixed(2), 28, drawEngine.canvasWidth * .95, 40);
    // drawEngine.drawText('' + dt.toFixed(2), 28, drawEngine.canvasWidth * .95, 40);
    // drawEngine.drawText('Level ' + this.level, 50, drawEngine.canvasWidth * .1, 50);
    // drawEngine.drawText('bullets:' + this.bullets.length, 40, drawEngine.canvasWidth / 2, 100);
    // drawEngine.drawText('coins:' + this.coins.length, 40, drawEngine.canvasWidth / 2, 150)
    // drawEngine.drawText('explo:' + this.explosions.length, 40, drawEngine.canvasWidth / 2, 200)
    // drawEngine.drawText('shakeForce:' + this.shakeForce, 40, drawEngine.canvasWidth / 2, 250)

    // drawEngine.drawText('Mouse:' + JSON.stringify(inputMouse.pointer.Position), 40, drawEngine.canvasWidth / 2, 150)

    // if (this.currentMessage)
    //   drawEngine.drawText('' + this.currentMessage, 40, drawEngine.canvasWidth * .5, 120, 'white', 'center');
    
    let message = `kills: ${this.stats.kills} of ${this.stats.killsGoal}`;
    // message += ` (${this.getEnemies().length}/${GameConfig.levelEnemyMaxCount.toFixed(0)})`;

    drawEngine.drawText(message , 40, drawEngine.canvasWidth * .5, 120, 'white', 'center');

    let currentHealthRatio = this.player!.healthPoints / this.player!.maxHealthPoints;

    const healthBarProps = {x:20, y:180, w : 400, h:50};
    drawEngine.drawRectangle(new Vector(healthBarProps.x, healthBarProps.y), new Vector(healthBarProps.w, healthBarProps.h), { fill: '#fff' });
    drawEngine.drawRectangle(new Vector(healthBarProps.x, healthBarProps.y), new Vector(healthBarProps.w * currentHealthRatio, healthBarProps.h), { fill: currentHealthRatio>.5?'#0f0':'#f00' });
    // drawEngine.drawText('Health ' + this.player?.healthPoints.toFixed(0), 40, 18, 70, 'white', 'left');

    // drawEngine.drawText(`particles: ${globalParticles.length}` , 40, drawEngine.canvasWidth * .5, 200, 'white', 'center');

    drawEngine.drawText('' + this.collectorYellow!.number, this.collectorYellow!.Size.x*2, this.collectorYellow!.Position.x, this.collectorYellow!.Position.y - this.collectorYellow!.Radius);


    if (controls.DeleteKey) {
      this.player?.explode(this.player?.Position);
    }

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }

    // CURSOR 
    drawEngine.drawCircle(inputMouse.pointer.Position, 60, {stroke: transparent, fill: colorShadow});

    // PARTICLES
    !debug.showWires && globalParticles.forEach(_ => _.draw(drawEngine.context));


  }

  private coinValues = [10, 3, 5, 8, 9, 4];
  private coinIndex = 0;

  private createEnemyValues(count: number = 1) {

    while(this.enemyList.length < count) {
      this.coinValues = [...Array(12).keys()];
      let value = 1 + this.coinValues[Math.floor((Math.random() *  this.coinValues.length))];
      this.enemyList.push(value);
    }

  }


  private getEnemyNextValue() {

    let value = this.enemyList[this.coinIndex]; // coinValues[Math.floor(this.stats.enemiesCreated % coinValues.length-1)];
    if (++this.coinIndex >= this.enemyList.length) this.coinIndex = 0;

    return value;
  }

  private enemySpawn(startPosition: Vector, sizeBase: Vector, leftOrRight: number, value: number) {

    let color = this.getEnemyColor(value);

    let size = sizeBase.clone(); //.add(new Vector(value, value))

    let unitPosition = startPosition.clone().add(new Vector(rand(0, size.length()), rand(0, size.length())));

    let enemy = this.createEnemy(unitPosition, size, value, color);

    // Set Path to follow
    enemy.path = [new Vector(100, 300), new Vector(100, 1200), new Vector(1000, 1200), new Vector(1000, 300)];

    if (leftOrRight)
      enemy.path = enemy.path.reverse();

    // Start path follower
    enemy.movePosition = enemy.path[enemy.currentPoint];

    return enemy;
  }

  private testCoins() {
    if (Math.floor(time) % 50 == 0) {

      let colors: COIN_TYPE[] = [COIN_TYPE_GREEN];

      const color = colors[Math.floor((Math.random() * colors.length))];

      let coin = createCoin(color, new Vector(drawEngine.canvasWidth / 2 + rand(-50, 50), drawEngine.canvasHeight / 2), new Vector(25, 25));

      coin.maxVelocity = 2;

      const coinValues = [...Array(12).keys()];
      let value = 1 + coinValues[Math.floor((Math.random() * coinValues.length))];

      coin.number = value;
      coin.showNumber = true;

      this.coins.push(coin);
    }
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
    return true;
    // Manual
    return shooter.team == TEAM_A ? controls.isSpace : true;

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

    if (value == 13) color = '#000';

    return color;
  }

  onEnemyKilled(enemy: Shooter, coinCount = 1) {

    const startPosition = new Vector(enemy.Position.x, enemy.Position.y);

    let coinSize = new Vector(GameConfig.coinSize, GameConfig.coinSize);

    [...Array(coinCount).keys()].forEach(() => {

      let coinPosition = startPosition.clone().add(new Vector(rand(-coinSize.length(), coinSize.length()), rand(-coinSize.length(), coinSize.length())));

      // game Coin
      let coin = createCoin(COIN_TYPE_GREEN, coinPosition, coinSize);
      coin.maxVelocity = 2;
      coin.number = enemy.number;
      coin.showNumber = true;
      coin.Size = coinSize;
      this.coins.push(coin);

      // random Coin
      // coinPosition = startPosition.clone().add(new Vector(rand(-coinSize.length(), coinSize.length()), rand(-coinSize.length(), coinSize.length())));
      // let colors: COIN_TYPE[] = [COIN_TYPE_RED, COIN_TYPE_BLUE];
      // const color = colors[Math.floor((Math.random() * colors.length))];

      // let randomCoin = createCoin(color, coinPosition, coinSize);
      // randomCoin.maxVelocity = 2;
      // randomCoin.Size = coinSize;
      // this.coins.push(randomCoin);


    });

    this.stats.kills ++;

  }

  onCoinTouched(coin: Coin) {

    if (coin instanceof CoinGreen && this.collectorYellow) {
      this.sendToCoinCollector(coin);
    }
    if (coin instanceof CoinRed) {
      this.player!.weaponBulletType = BULLET_TYPE_FIREBALL;
      this.currentMessage = 'FIREBALL';
      coin.destroy();
    }
    if (coin instanceof CoinBlue) {
      this.player!.weaponBulletType = BULLET_TYPE_BALL;
      this.currentMessage = 'BALL';
      coin.destroy();
    }

    // Collected
    if (coin instanceof CoinYellow) {
      this.onPlayerCoinCollected(coin);
    }

  }

  onPlayerCoinCollected(coin: Coin) {
    
    // avoid loop
    if (coin.number == 13 && coin.follow) return;

    const p = this.player!;

    console.log('Collect: '+ p.number +' + '+ coin.number + ' = ' + (p.number + coin.number) );

    p.number += coin.number;
    //coin.Size = new Vector(coin.number,coin.number).scale(4).add(new Vector(20,20));
    // coin.destroy();

    // Boom Coin
    if (p.number == 13) {

      // oneTime condition
      p.number = 0;

      let boomCoin = createCoin(COIN_TYPE_GREEN, p.Position.add(new Vector(0,-1).scale(p.Radius)));
      boomCoin.number = 13;
      boomCoin.maxVelocity = 3;
      boomCoin.maxAcceleration = 10;      
      boomCoin.Size.scale(GameConfig.coin13Size);
      boomCoin.color = '#000';
      boomCoin.showNumber = true;
      boomCoin.follow = p;
      this.coins.push(boomCoin);

      // comprobar si ya se ha configurado un intervalo
      if (!nIntervId) {
        nIntervId = setInterval(() => {
          sound(SND_TICTAC);
        }, 500);
      }

      setTimeout(() => {
        let explosion = new Explosion(boomCoin.Position, boomCoin.Size, TEAM_B, boomCoin.Size.length() * 3, p);
        explosion.strokeColor = 'rgb(0,0,0,.5)';
        explosion.fillColor = 'rgb(0,0,0,.5)';
        explosion.Mass = 1000;
        this.explosions.push(explosion);

        this.shakeForce = 150;
        boomCoin.destroy();

        sound(SND_EXPLOSION);

        clearInterval(nIntervId!);
        // liberar nuestro inervalId de la variable
        nIntervId = null;

      }, 3000);

      coin.destroy();

    } 
    else if (p.number > 13) {
      let coinSize = new Vector(GameConfig.coinSize, GameConfig.coinSize);
      let scoreCoin = createCoin(COIN_TYPE_YELLOW, p.Position, coinSize);
      scoreCoin.number = p.number;
      scoreCoin.prefix = "+";
      scoreCoin.showNumber = true;
      scoreCoin.showBall = false;
      scoreCoin.maxVelocity = 15;
      this.sendToCoinCollector(scoreCoin);
      this.coins.push(scoreCoin);

      sound(SND_COIN);

      p.number = 0;
      coin.destroy();
    }
    else {
      let bucketCoin = createCoin(COIN_TYPE_YELLOW, coin.Position.add(Vector.rand().scale(10)));
      bucketCoin.number = p.number;
      bucketCoin.maxVelocity = 30;
      bucketCoin.maxAcceleration = 100;      
      bucketCoin.Size.scale(10);
      bucketCoin.showNumber = true;
      bucketCoin.follow = p;
      this.coins.push(bucketCoin);      

      sound(SND_COIN);
    }

  }

  private sendToCoinCollector(coin: Coin) {
    if (coin instanceof CoinGreen && this.collectorYellow) {
      coin.movePosition = this.collectorYellow.Position.clone();
      //coin.movePosition!.add(new Vector(0, magicOffset));
    }

  }

  onCoinCollected(collector: Coin, coin: Coin) {
    collector.number += coin.number;
    coin.destroy();
  }


  mouseDown() {
    // let explosion = new Explosion(inputMouse.pointer.Position, new Vector(50,50), TEAM_A, 100, this.player!);
    // explosion.Mass = 100;
    // this.explosions.push(explosion);
  }


  private createEnemy(unitPosition: Vector, size: Vector, value: number, color: string) {

    let enemy = new Shooter(unitPosition, size, TEAM_B, EntityType.Knight);

    enemy.number = value;
    enemy.color = color;

    enemy.damagePoints *= .8;
    enemy.damageRange *= .8;

    enemy.maxHealthPoints = 300;

    enemy.maxVelocity = 5;
    enemy.maxAcceleration = 30;

    enemy.bulletSpeed = GameConfig.enemyBulletSpeed;

    enemy.shootCoolDownValue = GameConfig.enemyShootCoolDownValue;
    enemy.shootCoolDownTimer.set(rand(enemy.shootCoolDownValue, enemy.shootCoolDownValue*2));

    enemy.shootHandler = (targetPosition, bulletSpeed: Vector) => {
      let bulletSize = new Vector(GameConfig.enemyBulletSize, GameConfig.enemyBulletSize);

      let enemyBullet = createBullet(GameConfig.enemyBulletType, enemy, bulletSize, bulletSpeed, targetPosition);

      // same height
      enemyBullet._z = enemy._z;

      // same color
      enemyBullet.color = enemy.color;

      // 10% of enemy damage points
      enemyBullet.damagePoints = enemy.damagePoints * .1;

      enemyBullet.explode = (position: Vector) => {

        // sound(SND_EXPLOSION);

        let explosion = new Explosion(position, size, enemy.team, size.length(), enemy);
        explosion.color = enemy.color;
        explosion.damagePoints = 5;

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
      let explosion = new Explosion(position, size, enemy.team, size.length()*2, enemy);
      explosion.damagePoints = 50;
      explosion.Mass = 100;
      explosion.color = enemy.color;
      this.explosions.push(explosion);

      this.shakeForce = 3;
      sound(SND_DEATH);
    };

    this.stats.enemiesCreated ++;

    return enemy;
  }


  private createPlayer(startPosition: Vector): Shooter {

    let player: Shooter;

    let size = new Vector(GameConfig.playerSize, GameConfig.playerSize);

    [...Array(GameConfig.playerUnits).keys()].forEach(() => {

      startPosition.add(new Vector(rand(-10, 10), rand(-10, 10)));

      [...Array(1).keys()].forEach(col => {

        let unitPosition = startPosition.clone().add(new Vector(50, 0).rotate(2 * PI / 12 * col));

        player = new Shooter(unitPosition, size, TEAM_A, EntityType.Archer);
        player.showShadow = false

        player.weaponBulletType = GameConfig.playerBulletType;

        player.color = '#C0C0C0';

        player.shootCoolDownValue = GameConfig.playerShootCoolDownValue;
        player.shootCoolDownTimer.set(0);
        player.bulletSpeed = GameConfig.playerBulletSpeed;


        player.shootHandler = (targetPosition, bulletVelocity: Vector) => {

          let bulletSize = new Vector(GameConfig.playerBulletSize, GameConfig.playerBulletSize);

          let playerBullet = createBullet(player.weaponBulletType, player, bulletSize, bulletVelocity, targetPosition);

          playerBullet.damagePoints = 100;

          playerBullet.explode = (position: Vector) => {

            // No explosion for bullets

            if (playerBullet instanceof Fireball) {

              let explosion = new Explosion(position, bulletSize, player.team, bulletSize.length(), player);
              explosion.Mass = 100;
              this.explosions.push(explosion);
              // sound(SND_EXPLOSION);
            }

            
          };

          this.bullets.push(playerBullet);

          // if (this.units.length < 10)
          if (this.shootSoundColdDownTimer.elapsed()) {
            sound(SND_ARROW_SHOOT);
            this.shootSoundColdDownTimer.set(2 );
          }
        };

        player.explode = (position: Vector) => {

          let explosion = new Explosion(position, size, player.team, size.length() * 4, player, defaultExplosionTime*4);
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


  checkRange(unit: GameObject, other: GameObject, range: number) {
    var rSum = unit.Radius + range + other.Radius;
    var dx = other.Position.x - unit.Position.x;
    var dy = other.Position.y - unit.Position.y;
    return {
      a: rSum * rSum > dx * dx + dy * dy,
      b: rSum - Math.sqrt(dx * dx + dy * dy)
    };
  }


}

export const gameState = new GameState();


function enemyTargetDesignation(Units: Shooter[]) {

  Units
    .filter(f => f.targetPosition == undefined) // && f.targetNode == undefined
    .sort(() => Math.random() - .5)
    .slice(0, 100)
    .forEach((unit: Shooter) => {

      let dist = drawEngine.canvasHeight * .8;
      dist *= unit.team == TEAM_A ? -1 : 1;

      const spreadX = rand(-20, 20);
      // Constraint vertical bullet distance
      unit.targetPosition = unit.Position.clone().add(new Vector(spreadX, dist));
      // forget target after a while
      setTimeout(() => {
        unit.targetPosition = undefined;
      }, rand(80, 500));

    });
}


