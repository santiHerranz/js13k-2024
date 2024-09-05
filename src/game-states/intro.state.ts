import { State } from "@/core/state";
import { gameStateMachine } from "@/game-state-machine";
import { gameState } from "./game.state";
import { drawEngine } from "@/core/draw-engine";
import { inputMouse } from "@/core/input-mouse";
import { time } from "@/index";
import { Button } from "@/core/button";
import { sound } from "@/core/sound";
import { SND_BTN_HOVER, SND_BTN_CLICK } from "@/game/game-sound";
import { GameConfig } from "./game-config";
import { controls } from "@/core/controls";
import { summaryState } from "./summary.state";


const def = { w: 800, h: 180 };

class IntroState implements State {

    private canvas: HTMLElement | null = document.getElementById('c2d');

    private selectedMenu = 0;

    buttons: Button[] = [];
    count: number = 0;
    gameTitle: string = 'NO13';

    startCondition = false;
    timeout: NodeJS.Timeout | undefined;

    private get posY() {
        return drawEngine.canvasHeight * .4 + this.count++ * def.h * 1.2;;
    }

    onEnter() {

        this.canvas!.setAttribute(
            "style",
            // "background-color: #000;" + 
            "background-color: #265998;" +
            "image-rendering: optimizeSpeed;" +
            "image-rendering: pixelated;" +
            // "image-rendering: smooth;" +
            // "image-rendering: -moz-crisp-edges;" +
            ""
        );


            this.timeout = setTimeout(() => {
            // gameStateMachine.setState(gameState);
            this.startGame(GameConfig.levelCurrentIndex);
          }, 30 * 1000);

        this.count = 0;


        const refX = drawEngine.canvasWidth*.5;

        let btn;

 
        ['Tutorial', 'First mission','Assault', 'Nuke', 'Last'].map((level, index) => {
            btn = new Button(refX, this.posY, def.w, def.h, level, "", 120);
            btn.enabled = GameConfig.levelUnlocked.length > index;
            btn.selected = true;
            btn.clickCB = () => {
                this.startGame(index);
            };
            this.buttons.push(btn);
    
        });


        // Add button sounds
        this.buttons.forEach(button => {
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

    onLeave(dt: number) {

        this.buttons = [];

        clearTimeout(this.timeout);
        this.timeout =  undefined;

        // remove listeners
        inputMouse.removeAllEventListener();

    }

    onUpdate(dt: number) {

        drawEngine.context.save();
        this.sceneAnimation(time);
        drawEngine.context.restore();


        this.buttons.sort((a, b) => a.Position.y - b.Position.y < 0 ? -1 : 1).map(_ => _.selected = false);

        this.buttons.forEach((button: Button, index) => {
            if (this.selectedMenu == index) button.selected = true;
            button._update(dt);
            button._draw(drawEngine.context);
        });

        this.updateControls();
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
        if (this.selectedMenu >= GameConfig.levelUnlocked.length)
          this.selectedMenu = 0;
        if (this.selectedMenu < 0)
          this.selectedMenu =  GameConfig.levelUnlocked.length;
    
    
        if (controls.isConfirm && !controls.previousState.isConfirm) {
    
          this.buttons[this.selectedMenu].selected = true;
    
          this.startGame(this.selectedMenu);
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


    private startGame(levelIndex: number) {

        GameConfig.levelCurrentIndex = levelIndex;

        setTimeout(() => {
            gameStateMachine.setState(gameState);
        }, 1000);
    }

    sceneAnimation(t: number) {
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
        function R(r: number, g: number, b: number, a: number | undefined) {
            a = a === undefined ? 1 : a;
            return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
        }

        // this.canvas!.setAttribute('style', 'background-color: ' + R(255, 255, 255, 1) + ';');
        this.canvas!.setAttribute('style', 'background-color: #124875;'); // #188fa8  

        // canvas!.setAttribute('style', 'background-image: radial-gradient(gray 25%, yellow '+ (20*S(t/.50)).toFixed(0) +'%, white 40%);');
        //  canvas!.setAttribute('style', 'background: repeating-conic-gradient(gold, #fff 10deg);');

        // Carnival
        // canvas!.setAttribute('style', 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) 0deg 15deg,                  hsla(0,0%,100%,0) 0deg 30deg ) #0ac;');

        // Chess
        // this.canvas!.setAttribute('style', 'background: conic-gradient(black 25%, white 0deg 50%, black 0deg 75%, white 0deg); background-size: 60px 60px;');

        // canvas!.setAttribute('style', 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) 0deg 15deg, hsla(0,0%,100%,0) 0deg 30deg ) #333;');

        x.fillStyle = '#389fb8';

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
        x.fillRect(0, 0, i = w = drawEngine.canvasWidth, drawEngine.canvasHeight);

        x.fillStyle = '#48893e';
        x.fillRect(0, drawEngine.canvasHeight*.8, drawEngine.canvasWidth, drawEngine.canvasHeight);

        x.fillStyle = '#389fb8';

        // x.clearRect(0,0,i=w=drawEngine.canvasWidth,drawEngine.canvasHeight);
        // X=drawEngine.canvasWidth/2 + 300 * S(t/1)+C(t/2);Y=drawEngine.canvasHeight/2;
        X = drawEngine.canvasWidth / 2 + .2 * (drawEngine.canvasWidth / 2 - inputMouse.pointer.Position.x);
        Y = drawEngine.canvasHeight / 2 + .2 * (drawEngine.canvasHeight / 2 - inputMouse.pointer.Position.y);

        for (j = 5e3; r = j-- / (9 - ++t % 9); x.fillRect(j, 0, .2, 2e3))x.clearRect(C(j) * r + X!, S(j * j) * r + Y!, r >>= 8, r);


    }


}
export const introState = new IntroState();
