import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { menuState } from './menu.state';
import { inputMouse } from '@/core/input-mouse';
import { globalParticles } from '@/game/game-particle';
import { lerp, Timer } from '@/utils';
import { colorShadow, debug, transparent } from './game-config';

const canvas: HTMLElement | null = document.getElementById('c2d');

class CompletedState implements State {
  private isStartSelected = true;
  spinTimer: Timer = new Timer(3);
  Score: number = 0;


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
        
    setTimeout(() => {
      gameStateMachine.setState(gameState);
    }, 2500);

    // Carnival

    while(globalParticles.length)
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

    canvas!.setAttribute('style', 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) '+ this.spin +'deg '+ (this.spin + 15) +'deg, hsla(0,0%,100%,0) '+ this.spin +'deg '+ (this.spin + 30) +'deg ) #0ac;');

    const xCenter = drawEngine.canvasWidth / 2;
    const yCenter = drawEngine.canvasHeight / 2;

    // drawEngine.drawText('acc: ' + this.currentAcc.toFixed(0), 80, xCenter, yCenter - 400);

    drawEngine.drawText('SCORE', 80, xCenter, yCenter - 200);
    drawEngine.drawText(''+ this.Score, 200, xCenter, yCenter, this.isStartSelected ? 'white' : 'gray');

    this.updateControls();

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }

    // CURSOR 
    drawEngine.drawCircle(inputMouse.pointer.Position, 60, {stroke: transparent, fill: colorShadow});

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
