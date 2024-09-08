import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { drawEngine } from '@/core/draw-engine';
import { Button } from '@/core/button';
import { Vector } from '@/core/vector';
import { inputMouse } from '@/core/input-mouse';
import { sound } from '@/core/sound';
import { menu2State } from './menu.state copy';
import { backButton } from '@/game/game-config';
import { SND_BTN_HOVER, SND_BTN_CLICK, SND_UNIT_PLACE } from '@/game/game-sound';
import { intro2State } from './intro.state copy';
import { time } from '@/index';

const buttonProps = { x: 0, y: 0, w: 600, h: 150 };

class PlayState extends BaseState {

  private readonly dificultyOptions = [
    { text: 'A', coord: [.5, .3] },
    { text: 'B', coord: [.5, .4] },
    { text: 'C', coord: [.5, .5] },
  ];

  dificultyButtons: Button[] = [];
  levelDificulty = 'Easy';

  _selectedDificulty = 0;

  set selectedDificulty(value: number) {
    this._selectedDificulty = value;
    sound(SND_UNIT_PLACE);
  };
  get selectedDificulty() {
    return this._selectedDificulty;
  };


  onEnter() {


    this.color = '#218DD1';

    this.dificultyButtons = [];
    this.dificultyOptions
      .forEach((level, index) => {

        const btn = new Button(buttonProps, level.text);
        btn.index = index;
        btn.clickAction = () => {
          this._selectedDificulty = index;
        };
        this.dificultyButtons.push(btn);
      });


    this.menuButtons = [];


    const play = new Button(buttonProps, 'PLAY');
    play.clickAction = () => {
      // TODO
      // nfzGameState.init(GameConfig.levelCurrentIndex);
      // nfzGameState.backState = pauseState;
      // gameStateMachine.setState(nfzGameState);
      gameStateMachine.setState(gameState);
    };
    this.menuButtons.push(play);

    const back = new Button(buttonProps, backButton.label, "", backButton.fontSize);
    back.name = 'back';
    back.clickAction = () => {
      gameStateMachine.setState(menu2State);
    };
    this.menuButtons.push(back);

    // Play button selected 
    this.selectedMenuIndex = 1;


    this.menuButtons = [...this.menuButtons, ...this.dificultyButtons];

    // Call super after buttons created
    super.onEnter();

    // Add button sounds
    this.dificultyButtons.forEach(button => {
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

  onUpdate(dt: number) {

    super.onUpdate(dt);

    drawEngine.context.save();
    intro2State.sceneAnimation(time);
    drawEngine.context.restore();

    this.menuRender();

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


    this.renderScoreBar();


    this.menuButtons
      .forEach((menu, index) => {

        // Set button position based on render position
        menu.Position = this.getRenderPosition(menu);
        menu._draw(drawEngine.context);

      });


  }

  getRenderPosition(menu: Button) {

    if (menu.name == 'back') {
      menu.width = 160;
      return new Vector(drawEngine.canvasWidth * .1, backButton.posY);
    }
    let info = this.dificultyOptions.filter(f => f.text == menu.text)[0];

    if (info) {
      return new Vector(drawEngine.canvasWidth * info.coord[0], drawEngine.canvasHeight * info.coord[1]);
    }

    return new Vector(drawEngine.canvasWidth * .5, drawEngine.canvasHeight * .8);
  }

}

export const playState = new PlayState();
