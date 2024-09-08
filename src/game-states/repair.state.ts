import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { drawEngine } from '@/core/draw-engine';
import { gameState } from './game.state';
import { finalState } from './final.state';
import { Button } from '@/core/button';
import { buttonProps } from './intro.state copy';
import { GameConfig } from './game-config';

class RepairState extends BaseState {

  onEnter() {

    this.color = '#aaf';

    this.menuButtons = [];

    let repair = new Button(buttonProps, '100 💎', "", 100);
    
    repair.enabled =  (GameConfig.playerDiamond >= GameConfig.repairCost);

    repair.clickAction = () => {
      // TODO
      // nfzGameState.repairPlayer();
      // gameStateMachine.setState(nfzGameState);

      gameState.repairPlayer();
      gameStateMachine.setState(gameState);

    };
    this.menuButtons.push(repair);

    let skip = new Button(buttonProps, 'Skip', "", 100);
    skip.clickAction = () => {
      finalState.result.status = -1;
      gameStateMachine.setState(finalState);
    };
    this.menuButtons.push(skip);

    this.selectedMenuIndex = 0;

    super.onEnter();

  }

  onUpdate(dt:number) {

    super.onUpdate(dt);

    const refY = drawEngine.canvasHeight * .3;
    let row = 0, rowHeight = 80;

    drawEngine.drawText(`Repair?`, 100, drawEngine.canvasWidth / 2, refY + rowHeight * row++, 'white', 'center');
    row++;
    row++;
    row++;

    super.menuRender(refY + rowHeight * row);

    this.renderScoreBar();


  }

}

export const repairState = new RepairState();
