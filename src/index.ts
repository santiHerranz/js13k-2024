import { drawEngine } from './core/draw-engine';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { updateGlobalParticles } from "./game/game-particle";
import { finalState } from './game-states/final.state';
import { introState } from './game-states/intro.state';
import { menuState as menuState } from './game-states/menu.state';
import { gameState } from './game-states/game.state';
import { playState } from './game-states/play.state';
import { GameConfig } from './game/game-config';


export let planeSprite: HTMLImageElement;

//  const planeImgSource = './plane-16.png';
// export const planeImgSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADzUlEQVRYR+2VbUxbVRjH/+fce9tCR1mLqRnQZk5gkcQMA5mDirOMLCaOTTcX42IiGs0Sv42vfvYr+2ayxMxlH3TGgC+DRBcETdexGYjo4hTG5kZH1WopLdC3+3J8eisLy9Zpb+KICfdLe3P/5zy/5/885zkM6/ywdY6PDYANB/7fDkQ+Pa0KevwvvGqzeposOxAZPK0xiWWziZRhczmd/oO9khUIywDvvvSsWBvwrY++sLSXpUWrwXVPI3TGYYtPmyxWIO4CONnXVqgrZxAaZ0wvbCwEzGzpnfTMtjJfU7S7oatowuyo+eOsi5Ne5A3aoPBOanN/epcEmEzLjdf7J5S1zt0GONXXlqEwCpeF9ER7dclyVho7c9FZw/7T9AL0pidNnTRzCY9t96C2gefS/Ft7qcXfjSdhaJQUg9rbP1FhQq6KTx1r01o7XWZm733VgFzGAa87hu6WBNxOlRKDkBSZraRrceV7L2LRJWx61G8uX742B29tFZp3xOCsjEJXNUoYLLGiYGTKjVjCC3tFFm/smTX1k6GU3nt8Qi4JMHBxL7aSidO5OFp8U9j2cAoOhaHaZcN84iGcDW9FJpaCcBb52YpAhdeFnsAN1Ln/RDKVR1YVuP67C1ORFmy31+AGSQ/tOncfgL7WHBUt1xpwVZ0YboYNLkg8gs5HZuCvyRMAoEgcV+MefBiug05BNdNEQM5QGQjm5cA8GmsWoOoGAQBzcRtCvzRBN3zII4Wjz13BZDi1RE1l7+2fNEt1RxO+f6w139ZZfUeT3Kueb5/wgOdt8FQVy72wlINhy+Odowsle2f1w0Qoqb52fPL24LrrFFAzpqngEvVxoefpMBQhV4WF9v5gvDJilzbX1/ubzDrempvRcvrirSPtad9aXbE+lC/1D+1FS5lOzVe5ltLSHChssD8QjEq+nVu4xAWPXr728dhQ4z+mfw+BZYCejmA+vy0o0/E2lOsj6lB49O+OKA/DMsC+QDCzWN8t60xWPZEvjeHw6KbyQhfVlgF6AsHUvKedgXOt9o8LfOjCaOnpdR8yywD7OrqSv7ma6S6Q0vWpHxxnw2PuB+rAgY5n0lmnj+uCZ5yZm/Jn4a+rHhjA8091LSuMV+xwb2EandkfF38VmqFnPjk/VjZE2SU4+HR3VpFl5c1XjrDL4XGm09R7vKPdOHnmDFRVUwdDI45ynCgb4NDuvcb+wy+KZHZZ/HwxBJqzomnXbuZyONnw4AAb+OYc/08BDnTuyRYueojCrS8Kf2hWcjDBOA084/Pz5c2Dsh0oJ7t/o90AWHcH/gLoiXUw5m2BBgAAAABJRU5ErkJggg==';
export const planeImgSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAJMSURBVDhPtVJNaxNRFH33TTKTmWRS20hsYhOUWqoSpRClIOIHDUEREcGK3bhxK7oRFFy5E/R/uNNVpYQWRNBdoWiM1UpVbGKaT+0kmcxMZp7vTseKTV164MC955x7mffmkf+KhUc3KdJrd8Q/zecPbgmDkaSCxNqT++AaVzKTMJqIwcevJVd8ePWMEAqoJ6sVo1CvaPdss/0inQivzb/7wtC/ePoYHB1LQGG1SOD2tfOyCYLEnJY5MbxupuICq3wb3qv7Dq0AUD8OMOZYcu/9WDRRLuZLNiyV94hAQ6LIbAOWn541HEYE4DlKWYvnZUKALr48IhhU5TIhkqOx9Km3No84vNUdB0L8U4ACsfEO/AAg8NbHCOzitUX9EVsZUUETFJdYo4YeZjDrzvBZyoh7LL58k71WK6Q3aoGFNwasrDcJEmvU0PudQ+AsnZ2z71gth1htm5gtRnpOcNPl6GhdE+m1rocZzOIMzsL961M0CB1QRZ2qctcfVgSjY/jUXH7oxEA8PYuDP0uLF7KpxmtF6mkbHVvS9IClmbLTZgpzLwkxk50AiXXJSEQhTU0n3414QAwfbKBnbiwPxaRSd1CVyVq9QwwIkCe5JfcgWwu24/K5jCTK4zWsTf3D7mdz84ZrbMOOL/HxzCU6GQ3KPnAEJNaoefZf6Huid6enxFhsvz85mjoehd6NfQOiL3lgPGczVj6cCNNXhc/8PfxB31aLCoEfjEjVYi3HfxNDYo0ael5sC30LTGbp1Y0KW+3Vs/nmpwwSa9TQ82IeCPkF9EoXoJmu4MEAAAAASUVORK5CYII='

export var time = 0;

export const canvas: HTMLElement | null = document.getElementById('c2d');


let fps = 60;
let previousTime = 0;
const interval = 1000 / fps;

export const styleBody =
  'margin:0;overflow:hidden;' + // fill the window
  'touch-action:none;' +        // prevent mobile pinch to resize
  'user-select:none;' +         // prevent mobile hold to select
  '-webkit-user-select:none;' + // compatibility for ios
  '-webkit-touch-callout:none'; // compatibility for ios
document.body.style.cssText = styleBody;


const runApp = async (image?: HTMLImageElement) => {

  planeSprite = image!;

  createGameStateMachine(introState); // PRODUCTION: Set introState Before Flight
  // createGameStateMachine(menuState);
  // createGameStateMachine(playState);
  //  createGameStateMachine(gameState); 
  // createGameStateMachine(repairState);
  // createGameStateMachine(finalState);
  // createGameStateMachine(touchState);


  (function gameLoop(currentTime: number) {
    const delta = (currentTime - previousTime); // milisegundos

    if (delta >= interval) {
      // previousTime = currentTime - (delta % interval) / 2; // Slow time
      previousTime = currentTime - (delta % interval); // Normal time

      controls.queryController();
      drawEngine.context.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);

      // Although the game is currently set at 60fps, the state machine accepts a time passed to onUpdate
      // If you'd like to unlock the framerate, you can instead use an interval passed to onUpdate to 
      // adjust your physics so they are consistent across all frame rates.
      // If you do not limit your fps or account for the interval your game will be far too fast or far too 
      // slow for anyone with a different refresh rate than you.

      gameStateMachine.getState().onUpdate(delta);

      updateGlobalParticles();
    }
    requestAnimationFrame(gameLoop);
    time += delta / 1000;
  })(0);

};


// const loadAllImages = async (urls: string[]) => {
//   const images : HTMLImageElement[] = [];

//   urls.forEach( url => {
//     const image = new Image();
//     image.src = url;
//     images.push(image);
//   });

//   const imagePromises = images.map(loadImage);
//   return Promise.all(imagePromises)
//   .then(data => {
//     return data;
//   });

// };
// loadAllImages([planeImgSource]).then(runApp);

const loadImage = (image: HTMLImageElement) =>
  new Promise<HTMLImageElement>((resolve) => {
    image.onload = () => resolve(image);
  });

const loadOneImage = async (url: string) => {
  const image = new Image();
  image.src = url;
  return loadImage(image).then(data => {
    return data;
  });
};

loadOneImage(planeImgSource).then(runApp);
// runApp();
