import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { menuState } from './menu.state';
import { inputMouse } from '@/core/input-mouse';

class SummaryState implements State {
  private isStartSelected = true;

  onEnter() {

    setTimeout(() => {
      gameStateMachine.setState(gameState);
    }, 1500);
    
  }

  onLeave() {

    // remove listeners
    inputMouse.removeAllEventListener();
    
  }

  onUpdate(dt: number) {
    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('NO13', 80, xCenter, 90);
    drawEngine.drawText('Restart Game', 60, xCenter, 600, this.isStartSelected ? 'white' : 'gray');
    this.updateControls();

    if (controls.isEscape) {
      gameStateMachine.setState(menuState);
    }
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

export const summaryState = new SummaryState();
