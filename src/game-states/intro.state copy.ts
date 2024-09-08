import { gameStateMachine } from "@/game-state-machine";
import { BaseState } from "./base.state";
import { drawEngine } from "@/core/draw-engine";
import { canvas, time } from "@/index";
import { Button } from "@/core/button";
import { inputMouse } from "@/core/input-mouse";
import { GameConfig } from "../game/game-config";
import { menu2State } from "./menu.state copy";


const xCenter = drawEngine.context.canvas.width / 2;

class Intro2State extends BaseState {


  onEnter() {

    this.menuButtons = [];

    let start = new Button({ x: 0, y: 0, w: 450, h: 150 }, 'START');
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

    drawEngine.drawText('@santiHerranz for JS13K 2024', 40, drawEngine.canvasWidth * .5, drawEngine.canvasHeight * .9, '#eee', 'center');

    super.menuRender();
  }


  sceneAnimation(t: number) {

    let x = drawEngine.context;
    var S = Math.sin;
    var C = Math.cos;

    // this.canvas!.setAttribute('style', 'background-color: ' + R(255, 255, 255, 1) + ';');
    canvas!.setAttribute('style', 'background-color: #fff;');  //#124875 // #188fa8  

    let i, w, X, Y, j, r;

    X = drawEngine.canvasWidth / 2 + .2 * (drawEngine.canvasWidth / 2 - inputMouse.pointer.Position.x); //
    Y = drawEngine.canvasHeight / 2 + .2 * (drawEngine.canvasHeight / 2 - inputMouse.pointer.Position.y); //  

    const planeTilt = Math.sin(time)*50;
    const playerTilt = 50 * (drawEngine.canvasWidth / 2 - X)/(drawEngine.canvasWidth / 2);
    

    const gradient = x.createLinearGradient(drawEngine.canvasWidth / 2 - planeTilt  - playerTilt, 0, drawEngine.canvasWidth / 2 + planeTilt + playerTilt, drawEngine.canvasHeight);

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
