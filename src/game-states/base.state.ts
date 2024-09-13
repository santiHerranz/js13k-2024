import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { sound } from '@/core/sound';
import { SND_BTN_CLICK, SND_BTN_HOVER } from '@/game/game-sound';
import { Button } from '@/core/button';
import { inputMouse } from '@/core/input-mouse';
import { Vector } from '@/core/vector';
import { GameConfig, gameIcons } from '../game/game-config';

export type MenuOption = { title: string; action: Function };

export class BaseState implements State {

  backState: State | undefined = undefined;

  color = '#000';

  menuButtons: Button[] = [];

  _selectedMenuIndex = 0;

  set selectedMenuIndex(value: number) {
    if (this.menuButtons[value].enabled) {
      this._selectedMenuIndex = value;
      sound(SND_BTN_HOVER);
    }
  };
  get selectedMenuIndex() {
    return this._selectedMenuIndex;
  };


  refY = drawEngine.canvasHeight / 2;
  menuOptionHeigth = 150;
  menuOptionMarginHeigth = 30;

  // Calculate total offset for buttons
  get offsetRefY() {
    return -(this.menuButtons.length * (this.menuOptionHeigth + this.menuOptionMarginHeigth)) / 2;
  }


  onEnter() {


    // Add button sounds
    this.menuButtons.forEach(button => {
      button.hoverEvent = () => {
        sound(SND_BTN_HOVER);
      };
      button.clickEvent = () => {
        sound(SND_BTN_CLICK);
      };
    });

    // set listeners
    inputMouse.addEventListener('mousedown', () => this.mouseDown());
  }

  /**
   * If overrides onLeave, super must be called
   * @param dt 
   */
  onLeave(dt: number) {

    this.menuButtons = [];

    // clearTimeout(this.timeout);
    // this.timeout = undefined;

    // remove listeners
    inputMouse.removeAllEventListener();

  }

  mouseDown() {
    if (inputMouse.pointer.leftButton) {

      this.menuButtons
        // .sort((a, b) => a.Position.y - b.Position.y < 0 ? -1 : 1)
        .forEach((button, index) => {
          button.selected = button.mouseDownEvent(inputMouse.pointer.Position);

          if (button.selected)
            this.selectedMenuIndex = index;
        });
    }
  };


  onUpdate(dt: number) {

    this.renderScoreBar();

    this.onBackground();

    this.menuRender();

    // drawEngine.drawText('Start Game', 60, xCenter, 600, this.isStartSelected ? 'white' : 'gray');
    // drawEngine.drawText('Toggle Fullscreen', 60, xCenter, 700, this.isStartSelected ? 'gray' : 'white');


    this.menuButtons
      // .sort((a, b) => a.index - b.index < 0 ? -1 : 1)
      .map(_ => _.selected = false);

    this.menuButtons.forEach((button: Button, index) => {

      button.selected = index == this.selectedMenuIndex;

      button._update(dt);
    });

    this.updateControls();


    if (this.backState && controls.isEscape && !controls.previousState.isEscape) {
      gameStateMachine.setState(this.backState);
    }
  }

  renderScoreBar() {

    const newLocal = drawEngine.canvasHeight * .07;
    // 
    drawEngine.drawText(`Zone : ${1 + GameConfig.levelCurrentIndex}`, 50, drawEngine.canvasWidth * .12, newLocal + 10, 'white', 'center');

    [
      // { icon: gameIcons.heart, value: GameConfig.playerHearts, pos: .72 },
      // { icon: gameIcons.diamond, value: GameConfig.playerDiamond, pos: .9 },
      { icon: gameIcons.wallet, value: GameConfig.playerScore, pos: .8 },
    ].forEach((item) => {
      const position = new Vector(drawEngine.canvasWidth * item.pos, newLocal);
      drawEngine.drawText('' + item.icon, 60, position.x, position.y, 'white', 'center');
      drawEngine.drawText(`${item.value}`, 55, position.x + 20, position.y + 10, 'white', 'left'); //
    });

  }

  onBackground() {
    if (this.color) {
      drawEngine.context.fillStyle = this.color;
      drawEngine.context.fillRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
    }
  }

  menuRender(refY?: number) {
    const xCenter = drawEngine.canvasWidth * .5;

    if (refY)
      this.refY = refY;


    this.menuButtons.forEach((menu, index) => {

      const y = this.refY + this.offsetRefY + (index) * (this.menuOptionHeigth + this.menuOptionMarginHeigth);

      // Set button position based on render position
      menu.Position = new Vector(xCenter, y);

      menu._draw(drawEngine.context);

    });


  }

  updateControls() {

    let currentButton = this.menuButtons[this.selectedMenuIndex];


    if ((controls.isUp && !controls.previousState.isUp && this.selectedMenuIndex < this.menuButtons.length - 1)) {
      if (!this.menuButtons[this.selectedMenuIndex + 1].keyboardDisabled)
        this.selectedMenuIndex += 1;
    }
    if ((controls.isDown && !controls.previousState.isDown && this.selectedMenuIndex > 0)) {
      if (!this.menuButtons[this.selectedMenuIndex - 1].keyboardDisabled)
        this.selectedMenuIndex -= 1;
    }

    currentButton = this.menuButtons[this.selectedMenuIndex];

    if (!currentButton.keyboardDisabled && controls.isConfirm && !controls.previousState.isConfirm) {

      currentButton.selected = true;

      currentButton.clickAction();

      sound(SND_BTN_CLICK);

    }
  }

  // updateControls() {
  //   if (controls.isConfirm && !controls.previousState.isConfirm) {
  //     if (this.isStartSelected) {
  //       gameStateMachine.setState(gameState);
  //     } else {
  //       this.toggleFullscreen();
  //     }
  //   }
  // }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

