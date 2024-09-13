import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { Button } from '@/core/button';
import { drawEngine } from '@/core/draw-engine';
import { Vector } from '@/core/vector';
import { introState } from './intro.state';
import { GameConfig, backButton } from '../game/game-config';
import { playState } from './play.state';
import {  time } from '@/index';
import { controls } from '@/core/controls';
import { transparent, colorShadow, colorTransludid } from '@/game/game-colors';


const buttonProps = { x: 0, y: 0, w: 400, h: 150, r: 80 };


class MenuState extends BaseState {


  // LEVEL TABLE COORDS
  // private readonly buttonCoords = Array.from({ length: 13 }, (_, i) => {
  //   const row = Math.floor(i / 2);
  //   const col = i % 2;
  //   return {
  //     index: i,
  //     coord: i < 12 ? [0.4 + 0.2 * col, 0.2 + 0.1 * row + col * .025] : [0.5, 0.82]
  //   };
  // });
  private readonly buttonCoords =[
    [108,1800,],
    [540,1574,],
    [648,1392,],
    [432,1344,],
    [648,1200,],
    [432,1152,],
    [648,1008,],
    [432,960,],
    [648,816,],
    [432,768,],
    [648,624,],
    [432,576,],
    [648,432,],
    [432,384,],
  ];

  onEnter() {

    // this.color = '#1F3BA6';

    this.menuButtons = [];

    const back = new Button(buttonProps, backButton.label, backButton.fontSize);
    back.name = 'back';
    back.index = 13;
    back.clickAction = () => {
      gameStateMachine.setState(introState);
    };
    this.menuButtons.push(back);

    let iIndex = 0;
    this.buttonCoords 
    // .sort((a,b) => a.index > b.index ? 1 : -1)
      .forEach((level, index) => {

        const btn = new Button(buttonProps, ''+ (index + 1));
        btn.index = iIndex++;
        if (!GameConfig.levelIndexUnlocked.includes(btn.index)) {
          // btn.accesory ='🔒';
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
      this.selectedMenuIndex = GameConfig.levelIndexUnlocked.length;

  }

  onUpdate(dt: number) {

    super.onUpdate(dt);

    drawEngine.context.save();
    introState.sceneAnimation(time);
    drawEngine.context.restore();

    drawEngine.drawRectangle( new Vector(drawEngine.canvasWidth * .25, drawEngine.canvasHeight * .15), new Vector(drawEngine.canvasWidth * .5, 1400), {stroke: transparent, fill: colorTransludid} );

    // drawEngine.drawText('Levels ' + this.selectedMenuIndex +' de ' + (this.menuButtons.length-1) , 60, drawEngine.canvasWidth*.5, 200, 'white');
    drawEngine.drawText('Zone' , 70, drawEngine.canvasWidth *.5, 220);

    this.menuRender();

    if (controls.isEscape) {
      gameStateMachine.setState(introState);
    }


  }


  /// CUSTOM RENDER MENU IN GAME
  menuRender(refY?: number) {


    // drawEngine.drawText(`Level Index : ${1 + GameConfig.levelCurrentIndex}`, 100, drawEngine.canvasWidth/2, 150, 'white', 'center');

    this.menuButtons
      .forEach((menu, index) => {

        // Set button position based on render position
        menu.Position = this.getRenderPosition(menu, index);
        menu._draw(drawEngine.context);
      });

    // let coords = this.menuButtons.map(m =>  [parseInt(''+ m.Position.x), parseInt(''+ m.Position.y)]);
    // console.log(coords);

  }


  getRenderPosition(menu:Button, index: number) {

    const xCenter = drawEngine.canvasWidth * .4;

    const y = this.refY + this.offsetRefY + (index) * (this.menuOptionHeigth + this.menuOptionMarginHeigth);

    if (menu.name == 'back') {
      menu.width = menu.height = 100;
      return new Vector(drawEngine.canvasWidth * .1, backButton.posY);
    }

    let info = this.buttonCoords[index];

    if (info) {
      return new Vector(info[0], info[1]);
    }

    return new Vector(xCenter, y);
  }


}

export const menuState = new MenuState();

