import { BaseState } from './base.state';
import { buttonProps } from './intro.state copy';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { Button } from '@/core/button';
import { menu2State } from './menu.state copy';

class PauseState extends BaseState {

  onEnter() {

    this.menuButtons = [];

    const resume = new Button(buttonProps, 'RESUME', "", 100);
    resume.clickAction = () => {
      // gameStateMachine.setState(nfzGameState);
      gameStateMachine.setState(gameState);
    };
    this.menuButtons.push(resume);


    const back = new Button(buttonProps, 'Exit', "", 100);
    back.clickAction = () => {
      gameStateMachine.setState(menu2State);
    };
    this.menuButtons.push(back);

    // Call super after button created
    super.onEnter();


  }

  onUpdate(dt:number) {
    super.onUpdate(dt);
  }

}

export const pauseState = new PauseState();
