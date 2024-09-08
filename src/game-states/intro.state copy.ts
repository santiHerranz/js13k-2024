import { gameStateMachine } from "@/game-state-machine";
import { BaseState } from "./base.state";
import { drawEngine } from "@/core/draw-engine";
import { time } from "@/index";
import { Button } from "@/core/button";
import { inputMouse } from "@/core/input-mouse";
import { GameConfig } from "./game-config";
import { menu2State } from "./menu.state copy";

export const def = { w: 600, h: 120 };
export const buttonProps = { x: 0, y: 0, w: def.w, h: def.h };

const xCenter = drawEngine.context.canvas.width / 2;

class Intro2State extends BaseState {

  private canvas: HTMLElement | null = document.getElementById('c2d');


  onEnter() {

    this.menuButtons = [];

    let start = new Button(buttonProps, 'START', "", 100);
    start.clickAction = () => {
      menu2State.backState = this;
      gameStateMachine.setState(menu2State);
    };
    this.menuButtons.push(start);

    // Call super after button created
    super.onEnter();

  }

  onLeave() {

    this.menuButtons = [];

    // clearTimeout(this.timeout);
    // this.timeout = undefined;

    // remove listeners
    inputMouse.removeAllEventListener();

  }

  onUpdate(dt: number) {
    super.onUpdate(dt);

    drawEngine.context.save();
    this.sceneAnimation(time);
    drawEngine.context.restore();

    drawEngine.drawText(GameConfig.title, 250, xCenter, 450);
    drawEngine.drawText(GameConfig.subtitle, 80, xCenter, 620);


    super.menuRender();
  }


  sceneAnimation(t: number) {

    let x = drawEngine.context;
    var S = Math.sin;
    var C = Math.cos;

    // this.canvas!.setAttribute('style', 'background-color: ' + R(255, 255, 255, 1) + ';');
    this.canvas!.setAttribute('style', 'background-color: #fff;');  //#124875 // #188fa8  

    let i, w, X, Y, j, r;

    X = drawEngine.canvasWidth / 2 + .2 * (drawEngine.canvasWidth / 2); //  - inputMouse.pointer.Position.x
    Y = drawEngine.canvasHeight / 2 + .2 * (drawEngine.canvasHeight / 2); //  - inputMouse.pointer.Position.y

    const gradient = x.createLinearGradient(drawEngine.canvasWidth / 2, 0, drawEngine.canvasWidth / 2, drawEngine.canvasHeight);

    let horit = .85 + .0001 * (drawEngine.canvasHeight / 2 - Y);


    // Add three color stops
    gradient.addColorStop(0, "#1F3BA6");
    gradient.addColorStop(horit - 0.35, "#3EAFDF");
    gradient.addColorStop(horit - .007, "#98F6D8");
    gradient.addColorStop(horit, "#fff");
    gradient.addColorStop(horit + .001, "#218DD1");
    gradient.addColorStop(1, "#218DD1");
    x.fillStyle = gradient;

    // Option 2 - Based on https://www.dwitter.net/d/31707
    x.fillRect(0, 0, i = w = drawEngine.canvasWidth, drawEngine.canvasHeight);

    x.fillStyle = '#389fb8';

    for (j = 5e3; r = j-- / (9 - ++t % 9); x.fillRect(j, 0, .2, 2e3))x.clearRect(C(j) * r + X!, S(j * j) * r + Y!, r >>= 8, r);

  }

}

export const intro2State = new Intro2State();
