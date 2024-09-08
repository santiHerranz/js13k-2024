import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { Button } from '@/core/button';
import { drawEngine } from '@/core/draw-engine';
import { Vector } from '@/core/vector';
import { buttonProps, intro2State } from './intro.state copy';
import { GameConfig, backButton } from './game-config';
import { gameState } from './game.state';

const prefix = 'Level ';

class Menu2State extends BaseState {

  private readonly levelOptions = [
    {text:prefix + '1', coord:[.3,.3]},
    {text:prefix + '2', coord:[.3,.45]},
    {text:prefix + '3', coord:[.3,.6]},
    {text:prefix + '4', coord:[.3,.75]},
    {text:prefix + '5', coord:[.7,.3]},
    {text:prefix + '6', coord:[.7,.45]},
    {text:prefix + '7', coord:[.7,.6]},
    {text:prefix + '8', coord:[.7,.75]},
  ];


  onEnter() {

    this.color = '#1F3BA6';


    this.menuButtons = [];

    this.levelOptions 
      .forEach((level, index) => {

        const btn = new Button(buttonProps, level.text, "", 100);
        btn.index = index;
        btn.clickAction = () => {

          GameConfig.levelCurrentIndex = index;

          // TODO
          // gameState.backState = this;
          gameStateMachine.setState(gameState);
        };
        this.menuButtons.push(btn);
      });


    const back = new Button(buttonProps, backButton.label, "", backButton.fontSize);
    back.name = 'back';
    back.clickAction = () => {
      gameStateMachine.setState(intro2State);
    };
    this.menuButtons.push(back);

    this.menuButtons = this.menuButtons.sort((a,b) => b.index - a.index);


    // Call super after buttons created
    super.onEnter();


    // First level button selected 
    if (this.selectedMenuIndex < 1)
      this.selectedMenuIndex = 1;


  }

  // onUpdate(dt: number) {
  //   super.onUpdate(dt);
  // }


  /// CUSTOM RENDER MENU IN GAME
  menuRender(refY?: number) {

    this.renderScoreBar();

    // drawEngine.drawText(`Level Index : ${1 + GameConfig.levelCurrentIndex}`, 100, drawEngine.canvasWidth/2, 150, 'white', 'center');

    this.menuButtons
      .forEach((menu, index) => {

        // Set button position based on render position
        menu.Position = this.getRenderPosition(menu, index);
        menu._draw(drawEngine.context);
      });


  }


  getRenderPosition(menu:Button, index: number) {

    const xCenter = drawEngine.canvasWidth * .4;

    const y = this.refY + this.offsetRefY + (index) * (this.menuOptionHeigth + this.menuOptionMarginHeigth);

    if (menu.name == 'back') {
      menu.width = 160;
      return new Vector(drawEngine.canvasWidth * .1, 150);
    }

    let info = this.levelOptions.filter(f => f.text == menu.text)[0];

    if (info) {
      if (!GameConfig.levelIndexUnlocked.includes(menu.index)) {
        menu.accesory ='🔒';
        menu.enabled = false;
      }
      return new Vector(drawEngine.canvasWidth*info.coord[0], drawEngine.canvasHeight*info.coord[1]);
    }

    return new Vector(xCenter, y);
  }


}

export const menu2State = new Menu2State();

