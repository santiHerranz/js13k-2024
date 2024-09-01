import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { Button } from '@/core/button';
import { inputMouse } from '@/core/input-mouse';
import { summaryState } from './summary.state';
import { sound } from '@/core/sound';
import { SND_BTN_CLICK, SND_BTN_HOVER } from '@/game/game-sound';
import { lerp } from '@/utils';
import { time } from '@/index';


let factor = 0;
let currentFactor = 0;

const def = {w:800, h: 200};

class MenuState implements State {
  private selectedMenu = 0;

  
  buttons: Button[] = [];
  count: number = 0;
  gameTitle: string = 'NO13';


  get posY() {
    return drawEngine.canvasHeight*.5 + this.count++ * def.h * 1.2;;
  }


  onEnter() {


    this.count = 0;

    setTimeout(() => {
      gameStateMachine.setState(gameState);
    }, 1000);

    this.buttons = [];

    const refX = drawEngine.canvasWidth / 2;

    let btn;
    // btn = new Button(refX, this.posY, 500, 80, "One");
    // btn.selected = true;
    // btn.clickCB = () => {

    // };
    // this.buttons.push(btn);

    btn = new Button(refX, this.posY, def.w, def.h, "Start", "", 120);
    btn.selected = true;
    btn.clickCB = () => {
      this.startGame();
    };
    this.buttons.push(btn);

    // btn = new Button(refX, this.posY, 500, 80, "Options");
    // btn.selected = true;
    // btn.clickCB = () => {

    //   gameStateMachine.setState(summaryState);
    // };
    // this.buttons.push(btn);

    btn = new Button(refX, this.posY, def.w, def.h, "Fullscreen", "", 120);
    btn.selected = true;
    btn.clickCB = () => {
      this.toggleFullscreen();
    };
    this.buttons.push(btn);    


    // Add button sounds
    this.buttons.forEach(button => {
      button.hoverEvent = () => {
        sound(SND_BTN_HOVER);
      };
      button.clickEvent = () => {
        sound(SND_BTN_CLICK);
      };
    });
    
    
    // inputMouse.eventMouseDown = () => this.mouseDown();
    inputMouse.addEventListener('mousedown', () => this.mouseDown());
    // inputMouse.addEventListener('mousemove', () => this.mouseMove());

  }

  
  private startGame() {
    factor = 10; //Math.PI*2/100;
    setTimeout(() => {
      gameStateMachine.setState(gameState);
    }, 1000);
  }

  onLeave() {
    this.buttons = [];


  }

  onUpdate(dt: number) {

    currentFactor = lerp(currentFactor, factor, .01);


    drawEngine.context.save();
    this.u(time);
    drawEngine.context.restore();

    this.buttons.sort((a, b) => a.Position.y - b.Position.y < 0 ? -1 : 1).map(_ => _.selected = false);

    this.buttons.forEach((button: Button, index) => {
      if (this.selectedMenu == index) button.selected = true;
      button._update(dt);
      button._draw(drawEngine.context);
    });


    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText(this.gameTitle, 240, xCenter, 400);
    drawEngine.drawText('Level 1', 100, xCenter, 600);

    // drawEngine.drawText('Simple rule:', 80, xCenter, 700);

    // drawEngine.drawText('Avoid 13 and survive', 80, xCenter, 800);

    this.updateControls();

    // drawEngine.drawText('' + time.toFixed(1), 40, drawEngine.canvasWidth / 2, 150);
    // drawEngine.drawText('' + currentFactor, 40, drawEngine.canvasWidth / 2, 400);


  }

  
  updateControls() {

    if ((controls.isUp && !controls.previousState.isUp)) {
      this.selectedMenu -= 1;
      sound(SND_BTN_HOVER);
    }
    if ((controls.isDown && !controls.previousState.isDown)) {
      this.selectedMenu += 1;
      sound(SND_BTN_HOVER);
    }
    if (this.selectedMenu >= this.buttons.length)
      this.selectedMenu = 0;
    if (this.selectedMenu < 0)
      this.selectedMenu = this.buttons.length-1;


    if (controls.isConfirm && !controls.previousState.isConfirm) {

      this.buttons[this.selectedMenu].selected = true;

      if (this.selectedMenu == 0) {
        this.startGame();
      } 
      if (this.selectedMenu == 1) {
        gameStateMachine.setState(summaryState);
      } 
    }
  }

  toggleFullscreen() {

    if (!document.fullscreenElement) {

      this.gameTitle = 'Fullscreen';

      document.documentElement.requestFullscreen();


    } else {
      document.exitFullscreen();
    }
  }


  mouseDown() {
    if (inputMouse.pointer.leftButton) {

      this.buttons
      .sort((a, b) => a.Position.y - b.Position.y < 0 ? -1 : 1)
      .forEach((button, index) => { 
        button.selected = button.mouseDownEvent(inputMouse.pointer.Position);
        
        if (button.selected)
          this.selectedMenu = index;
      });
    }
  };

  mouseMove() {
  }

  
u(t: number) {
  /* Will be called 60 times per second.
   * t: Elapsed time in seconds.
   * S: Shorthand for Math.sin.
   * C: Shorthand for Math.cos.
   * T: Shorthand for Math.tan.
   * R: Function that generates rgba-strings, usage ex.: R(255, 255, 255, 0.5)
   * c: A 1920x1080 canvas.
   * x: A 2D context for that canvas. */

  let x = drawEngine.context;
  var S = Math.sin;
  var C = Math.cos;
  var T = Math.tan;
  function R(r: number,g: number,b: number,a: number | undefined) {
    a = a === undefined ? 1 : a;
    return "rgba("+(r|0)+","+(g|0)+","+(b|0)+","+a+")";
  }

    // canvas!.setAttribute('style', 'background-color: '+ R(255,255,255,1)+';');
    // canvas!.setAttribute('style', 'background-image: radial-gradient(gray 25%, yellow '+ (20*S(t/.50)).toFixed(0) +'%, white 40%);');
    //  canvas!.setAttribute('style', 'background: repeating-conic-gradient(gold, #fff 10deg);');
 
    // Carnival
    // canvas!.setAttribute('style', 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) 0deg 15deg,                  hsla(0,0%,100%,0) 0deg 30deg ) #0ac;');

    // Chess
    // canvas!.setAttribute('style', 'background: conic-gradient(black 25%, white 0deg 50%, black 0deg 75%, white 0deg); background-size: 60px 60px;');
 
    // canvas!.setAttribute('style', 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) 0deg 15deg, hsla(0,0%,100%,0) 0deg 30deg ) #333;');

  x.fillStyle = '#000';

  // Option 1
  // let i, w, z;
  // x.fillRect(0,0,i=w=drawEngine.canvasWidth,drawEngine.canvasHeight);
  // // x.clearRect(0,0,i=w=drawEngine.canvasWidth,drawEngine.canvasHeight);
  // x.translate(drawEngine.canvasWidth/2,drawEngine.canvasHeight/2);
  // // x.rotate(currentFactor);
  // for(x.rotate(t/10);i--;x.clearRect(T(i*i-t/400)*z,C(i*w)*z+S(i),w/i,w/i))
  //   z=w*90/i;

  // Option 2 - Based on https://www.dwitter.net/d/31707
  let i, w, X, Y, j, r;
  x.fillRect(0,0,i=w=drawEngine.canvasWidth,drawEngine.canvasHeight);
  // x.clearRect(0,0,i=w=drawEngine.canvasWidth,drawEngine.canvasHeight);
  // X=drawEngine.canvasWidth/2 + 300 * S(t/1)+C(t/2);Y=drawEngine.canvasHeight/2;
  X=drawEngine.canvasWidth/2 + .2*(drawEngine.canvasWidth/2-inputMouse.pointer.Position.x),Y=drawEngine.canvasHeight/2 + .2*(drawEngine.canvasHeight/2-inputMouse.pointer.Position.y);

  for(j=5e3;r=j--/(9-++t%9);x.fillRect(j,0,.2,2e3))x.clearRect(C(j)*r+X!,S(j*j)*r+Y!,r>>=8,r);
  
}

}


export const menuState = new MenuState();
