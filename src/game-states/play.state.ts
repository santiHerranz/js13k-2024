import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { drawEngine } from '@/core/draw-engine';
import { Button } from '@/core/button';
import { Vector } from '@/core/vector';
import { inputMouse } from '@/core/input-mouse';
import { menu2State } from './menu.state copy';
import { backButton, GameConfig, gameIcons, HINTS } from '@/game/game-config';
import { intro2State } from './intro.state copy';
import { time } from '@/index';
import { colorShadow, transparent } from '@/game/game-colors';
import { controls } from '@/core/controls';

const buttonProps = { x: 0, y: 0, w: 600, h: 150 };

class PlayState extends BaseState {

  // private readonly goalOptions = [
  //   { index: 2, coord: [.5, .5] },
  //   { index: 3, coord: [.5, .6] },
  //   { index: 4, coord: [.5, .7] },
  // ];

  // goalButtons: Button[] = [];

  // _selectedGoal = 0;

  // set selectedGoal(value: number) {
  //   if (this.goalButtons[value].enabled) {
  //     this._selectedGoal = value;
  //     sound(SND_UNIT_PLACE);
  //   }
  // };
  // get selectedGoal() {
  //   return this._selectedGoal;
  // };


  onEnter() {


    // this.color = '#218DD1';

    // this.goalButtons = [];
    // this.goalOptions
    //   .forEach((level, index) => {

    //     const btn = new Button(buttonProps, (7+index) * 10 +'%');
    //     btn.index = 2 + index;
    //     if (index > 0) {
    //       btn.accesory ='🔒';
    //       btn.enabled = false;
    //     }
    //     btn.clickAction = () => {
    //       this._selectedGoal = index;
    //     };
    //     this.goalButtons.push(btn);
    //   });


    this.menuButtons = [];


    const back = new Button(buttonProps, backButton.label, backButton.fontSize);
    back.index = 0;
    back.name = 'back';
    back.clickAction = () => {
      gameStateMachine.setState(menu2State);
    };
    this.menuButtons.push(back);


    const play = new Button(buttonProps, 'PLAY');
    play.index = 1;
    play.clickAction = () => {
      gameStateMachine.setState(gameState);
    };
    this.menuButtons.push(play);


    this.menuButtons = [...this.menuButtons]; //, ...this.goalButtons

    // Call super after buttons created
    super.onEnter();

    // set listeners
    // inputMouse.addEventListener('mousedown', () => this.mouseDown());


    // Play button selected 
    this.selectedMenuIndex = 1;


  }

  onUpdate(dt: number) {

    super.onUpdate(dt);

    drawEngine.context.save();
    intro2State.sceneAnimation(time);
    drawEngine.context.restore();

    const refY = drawEngine.canvasHeight * .3;
    let row = 0, rowHeight = 120;

    if (GameConfig.levelCurrentIndex == 0) {
      drawEngine.drawRectangle( new Vector(drawEngine.canvasWidth * .1, drawEngine.canvasHeight * .25), new Vector(drawEngine.canvasWidth * .8, 700), {stroke: transparent, fill: colorShadow} );
      drawEngine.drawText(`Flight briefing:`, 70, drawEngine.canvasWidth * .2, refY + rowHeight * row++, 'white', 'left');
      [
        ...HINTS,
      ].forEach((text , index) => {
        drawEngine.drawText((1+index) +'. '+ text, 70, drawEngine.canvasWidth * .2, refY + rowHeight * row++, 'white', 'left');
      });
  
    } else {
      drawEngine.drawText(gameIcons.enemy + " destroy "+ GameConfig.levelEnemyCount[GameConfig.levelCurrentIndex] +" emenies", 70, drawEngine.canvasWidth * .2, refY + rowHeight * row++, 'white', 'left');

    }

    row++;

    this.menuRender(refY + rowHeight * row);

    if (controls.isEscape) {
      gameStateMachine.setState(menu2State);
    }

  }

  mouseDown() {
    if (inputMouse.pointer.leftButton) {

      this.menuButtons
        .sort((a, b) => a.Position.y - b.Position.y < 0 ? -1 : 1)
        .forEach((button, index) => {
          button.selected = button.mouseDownEvent(inputMouse.pointer.Position);

          if (button.selected)
            this.selectedMenuIndex = index;
        });
    }
  };


  /// CUSTOM RENDER MENU IN GAME
  menuRender(refY?: number) {

    if (refY)
    this.refY = refY;

    this.renderScoreBar();


    this.menuButtons
      .forEach((menu, index) => {

        // Set button position based on render position
        menu.Position = this.getRenderPosition(menu, index);
        menu._draw(drawEngine.context);

      });


  }

  // getRenderPosition(menu: Button) {

  //   if (menu.name == 'back') {
  //     menu.width = 160;
  //     return new Vector(drawEngine.canvasWidth * .1, backButton.posY);
  //   }

  //   let info = this.goalOptions.filter(f => f.index == menu.index)[0];

  //   if (info) {
  //     return new Vector(drawEngine.canvasWidth * info.coord[0], drawEngine.canvasHeight * info.coord[1]);
  //   }

  //   return new Vector(drawEngine.canvasWidth * .5, drawEngine.canvasHeight * .8);
  // }

  getRenderPosition(menu: Button, index: number) {

    if (menu.name == 'back') {
      menu.width = menu.height = 100;
      return new Vector(drawEngine.canvasWidth * .1, backButton.posY);
    }

    const xCenter = drawEngine.canvasWidth * .5;
    const y = this.refY + this.offsetRefY + (index) * (this.menuOptionHeigth + this.menuOptionMarginHeigth);

    // let info = this.goalOptions.filter(f => f.index == menu.index)[0];

    // if (info) {
    //   return new Vector(drawEngine.canvasWidth*info.coord[0], drawEngine.canvasHeight*info.coord[1]);
    // }

    return new Vector(xCenter, y);
  }

}

export const playState = new PlayState();
