import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { Button } from '@/core/button';
import { drawEngine } from '@/core/draw-engine';
import { Vector } from '@/core/vector';
import { intro2State } from './intro.state copy';
import { GameConfig, backButton } from '../game/game-config';
import { playState } from './play.state';
import {  time } from '@/index';

const prefix = 'Level ';

const buttonProps = { x: 0, y: 0, w: 400, h: 150 };


class Menu2State extends BaseState {


  // LEVEL TABLE COORDS
  private readonly buttonCoords = Array.from({ length: 13 }, (_, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    return {
      index: i,
      coord: i < 12 ? [0.28 + 0.44 * col, 0.22 + 0.1 * row] : [0.5, 0.81]
    };
  });


  onEnter() {

    // this.color = '#1F3BA6';


    this.menuButtons = [];
    let iIndex = -1;

    const back = new Button(buttonProps, backButton.label, "", backButton.fontSize);
    back.name = 'back';
    back.index = iIndex++;
    back.clickAction = () => {
      gameStateMachine.setState(intro2State);
    };
    this.menuButtons.push(back);

    this.buttonCoords 
    // .sort((a,b) => a.index > b.index ? 1 : -1)
      .forEach((level, index) => {

        const btn = new Button(buttonProps, prefix + (level.index + 1));
        btn.index = iIndex++;
        if (!GameConfig.levelIndexUnlocked.includes(btn.index)) {
          btn.accesory ='🔒';
          btn.enabled = false;
        }        
        btn.clickAction = () => {

          GameConfig.levelCurrentIndex = index;

          playState.backState = this;
          gameStateMachine.setState(playState);
        };
        this.menuButtons.push(btn);
      });


    // Call super after buttons created
    super.onEnter();


    // First level button selected 
    // if (this.selectedMenuIndex < 1)
      this.selectedMenuIndex = 1;


  }

  onUpdate(dt: number) {

    super.onUpdate(dt);

    drawEngine.context.save();
    intro2State.sceneAnimation(time);
    drawEngine.context.restore();

    // drawEngine.drawText('' + this.selectedMenuIndex +' de ' + this.menuButtons.length , 60, drawEngine.canvasWidth*.5, 200, 'white');

    this.menuRender();

  }


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
      return new Vector(drawEngine.canvasWidth * .1, backButton.posY);
    }

    let info = this.buttonCoords.filter(f => f.index == menu.index)[0];

    if (info) {
      return new Vector(drawEngine.canvasWidth*info.coord[0], drawEngine.canvasHeight*info.coord[1]);
    }

    return new Vector(xCenter, y);
  }


}

export const menu2State = new Menu2State();

