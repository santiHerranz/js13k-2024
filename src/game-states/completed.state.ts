import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { menuState } from './menu.state';
import { inputMouse } from '@/core/input-mouse';
import { globalParticles } from '@/game/game-particle';
import { lerp, Timer } from '@/utils';
import { colorShadow, debug, GameConfig, transparent } from './game-config';
import { finishState } from './finish.state';
import { introState } from './intro.state';

const canvas: HTMLElement | null = document.getElementById('c2d');

class CompletedState implements State {
  private isStartSelected = true;
  spinTimer: Timer = new Timer(3);
  score: number = 0;
  maxScore: number = 0;
  stars = 0;
  dummyStars = 0;

  onEnter() {

    canvas!.setAttribute(
      "style",
      // "background-color: #000;" + 
      "background-color: #0E223A;" +
      "image-rendering: optimizeSpeed;" +
      "image-rendering: pixelated;" +
      // "image-rendering: smooth;" +
      // "image-rendering: -moz-crisp-edges;" +
      ""
    );

    // calculate stars
    if (this.maxScore > 0) {
      this.stars = Math.floor(3 * this.score / this.maxScore);
      this.stars = Math.min(3, this.stars);
    } else {
      this.stars = 0;
    }


    setTimeout(() => {

      // level increase
      GameConfig.levelCurrentIndex++;
      
      if (!GameConfig.levelUnlocked.includes(1+GameConfig.levelCurrentIndex))
        GameConfig.levelUnlocked.push(1+GameConfig.levelCurrentIndex);

      
      if (GameConfig.levelCurrentIndex >= GameConfig.levelEnemyCount.length) {
        gameStateMachine.setState(finishState);
      }
      else
      gameStateMachine.setState(introState);
      // gameStateMachine.setState(gameState);
    }, 3000);

    // Carnival

    while (globalParticles.length)
      globalParticles.pop();

  }

  onLeave() {


    // remove listeners
    inputMouse.removeAllEventListener();

  }

  private spin = 15;
  private currentAcc = .0001;

  onUpdate(dt: number) {

    this.spinControl(dt);

    canvas!.setAttribute('style', 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) ' + this.spin + 'deg ' + (this.spin + 15) + 'deg, hsla(0,0%,100%,0) ' + this.spin + 'deg ' + (this.spin + 30) + 'deg ) #0ac;');

    const xCenter = drawEngine.canvasWidth / 2;
    const yCenter = drawEngine.canvasHeight / 2;

    // drawEngine.drawText('acc: ' + this.currentAcc.toFixed(0), 80, xCenter, yCenter - 400);

    drawEngine.drawText(`SCORE ${this.score}`, 200, xCenter, yCenter, this.isStartSelected ? 'white' : 'gray');

    if (this.stars == 0) {
      drawEngine.context.globalAlpha = .4;
      this.dummyStars = 3;
    }

    drawEngine.drawText(Array(this.dummyStars + this.stars).fill('⭐').join(''), 120, xCenter, yCenter + 180); //this.stars.toFixed(2) +' '+ 

    if (this.stars == 0)
      drawEngine.context.globalAlpha = 1;


    // drawEngine.drawText(`of max:${this.maxScore}`, 80, xCenter, yCenter + 320);

    this.updateControls();

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }

    // CURSOR 
    drawEngine.drawCircle(inputMouse.pointer.Position, 60, { stroke: transparent, fill: colorShadow });

    // PARTICLES
    !debug.showWires && globalParticles.forEach(_ => _.draw(drawEngine.context));

  }

  private spinControl(dt: number) {
    this.currentAcc = lerp(this.currentAcc, 100, -.005);
    this.currentAcc = Math.max(-100, this.currentAcc);
    this.spin -= dt / this.currentAcc;
    if (this.spin > 30) this.spin = 0;
  }

  updateControls() {
    if ((controls.isUp && !controls.previousState.isUp)
      || (controls.isDown && !controls.previousState.isDown)) {
      this.isStartSelected = !this.isStartSelected;
    }

    if (controls.isConfirm && !controls.previousState.isConfirm) {
      if (this.isStartSelected) {
        gameStateMachine.setState(gameState);
      } else {
        this.toggleFullscreen();
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

export const completedState = new CompletedState();
