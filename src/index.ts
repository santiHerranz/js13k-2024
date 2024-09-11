import { drawEngine } from './core/draw-engine';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { updateGlobalParticles } from "./game/game-particle";
import { finalState } from './game-states/final.state';
import { intro2State } from './game-states/intro.state copy';
import { menu2State } from './game-states/menu.state copy';
import { gameState } from './game-states/game.state';
import { repairState } from './game-states/repair.state';
import { playState } from './game-states/play.state';


export let planeSprite: HTMLImageElement;

// const planeImgSource = './plane.png';
export const planeImgSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADzUlEQVRYR+2VbUxbVRjH/+fce9tCR1mLqRnQZk5gkcQMA5mDirOMLCaOTTcX42IiGs0Sv42vfvYr+2ayxMxlH3TGgC+DRBcETdexGYjo4hTG5kZH1WopLdC3+3J8eisLy9Zpb+KICfdLe3P/5zy/5/885zkM6/ywdY6PDYANB/7fDkQ+Pa0KevwvvGqzeposOxAZPK0xiWWziZRhczmd/oO9khUIywDvvvSsWBvwrY++sLSXpUWrwXVPI3TGYYtPmyxWIO4CONnXVqgrZxAaZ0wvbCwEzGzpnfTMtjJfU7S7oatowuyo+eOsi5Ne5A3aoPBOanN/epcEmEzLjdf7J5S1zt0GONXXlqEwCpeF9ER7dclyVho7c9FZw/7T9AL0pidNnTRzCY9t96C2gefS/Ft7qcXfjSdhaJQUg9rbP1FhQq6KTx1r01o7XWZm733VgFzGAa87hu6WBNxOlRKDkBSZraRrceV7L2LRJWx61G8uX742B29tFZp3xOCsjEJXNUoYLLGiYGTKjVjCC3tFFm/smTX1k6GU3nt8Qi4JMHBxL7aSidO5OFp8U9j2cAoOhaHaZcN84iGcDW9FJpaCcBb52YpAhdeFnsAN1Ln/RDKVR1YVuP67C1ORFmy31+AGSQ/tOncfgL7WHBUt1xpwVZ0YboYNLkg8gs5HZuCvyRMAoEgcV+MefBiug05BNdNEQM5QGQjm5cA8GmsWoOoGAQBzcRtCvzRBN3zII4Wjz13BZDi1RE1l7+2fNEt1RxO+f6w139ZZfUeT3Kueb5/wgOdt8FQVy72wlINhy+Odowsle2f1w0Qoqb52fPL24LrrFFAzpqngEvVxoefpMBQhV4WF9v5gvDJilzbX1/ubzDrempvRcvrirSPtad9aXbE+lC/1D+1FS5lOzVe5ltLSHChssD8QjEq+nVu4xAWPXr728dhQ4z+mfw+BZYCejmA+vy0o0/E2lOsj6lB49O+OKA/DMsC+QDCzWN8t60xWPZEvjeHw6KbyQhfVlgF6AsHUvKedgXOt9o8LfOjCaOnpdR8yywD7OrqSv7ma6S6Q0vWpHxxnw2PuB+rAgY5n0lmnj+uCZ5yZm/Jn4a+rHhjA8091LSuMV+xwb2EandkfF38VmqFnPjk/VjZE2SU4+HR3VpFl5c1XjrDL4XGm09R7vKPdOHnmDFRVUwdDI45ynCgb4NDuvcb+wy+KZHZZ/HwxBJqzomnXbuZyONnw4AAb+OYc/08BDnTuyRYueojCrS8Kf2hWcjDBOA084/Pz5c2Dsh0oJ7t/o90AWHcH/gLoiXUw5m2BBgAAAABJRU5ErkJggg==';
// export const planeImgSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAC+lBMVEUAAAAfFiJqUDxqUSx0STNOQShXQSa8hy1MLQc9KS4zNFyVZSxtUkLSky5kTDBnUDRsVElCPDllTTF2XU5pVUpmUEVkRA+TZ0tpThDUlDTMkDRsVkhvJgDFjDJRPjJ3WUJgTzzAiTF3alpzUTvclhSSYlzBl4yVZTM+O02OVkpxOgBpOxpjSlZpT0VuZWFdSDShUjmSYlbBlXipdGBFPER3VTldRSl4V0JQOhOBRzFtKABvRx+7flmbSQqfaE/Bm4B4IADaoDKpp69xbn92c3x1cXPmw1Hdu0qGYDbhozLXmi/joS61hS7JkSu0eSq5eyiibCbd0teursPwyL23sLy9oKuKkaiHjKPRlZhodJQuV5FKYpCObo7Pko1pcotUY4q+goliaIRPU4JqbXiOaXekcnWBYXVdYnFmU3FDTHA2RWpzY2eadFuNdljnxVffuVWdQVFfNE+iYU2TT0jRq0PauUKWdELhwD7fuz30vjxRKTyeajvYmzp4UjjdnjbhrjPkwDDLny/PlS6xgCzOlCu9gSutdCimcCL/7uHqyc3GvMG6t77Fqry/sbrht7mdnbj5zbftvLfuurdsiLfPurORlrJIdLKIjK+ZiaerlqQ7ZaOilp/wypvPo5nsmJl4gZfWtJaNjZRsYJK1hZGXco+slY5gaI7Tio1ecIwwVIzBiot+bol7ZIiXgYffk4a1dYVIXoWxmYBXXn+TjX6Ien5kZ31hUn0tSn3wznxvXHqvkni3endWS3Osf3KeWXLpdnGfkG6SVG3hy2xmZmu2nmhwa2gtPGMgLmOPX2KuUmCxaV94QF5fPl1yY1tzX1vivldvPVdnVla6oFWKT1M4NlGNWE7yyk2hbU3RtUqDakrnwknqukdpNEcIH0bvyETFnUTanUKffEGCZ0HmvkCTcED8yD+FWz/AUT/UsT7arj6qYjyjRjyUUDmrizieNDj7xzbbpjOhcjOnSDOldDLPqTGnbDHfnTCWWyxYQCuUbyqLSyejeCVsKSWDYyTY7xJWAAAAQXRSTlMADBVKEAdX/iAU/Pvw5KCalot7cFM5NycK/v78/Pv6+Pj49/ft5uXl5ODg29bLysm/vruurq6bmIqCgG1oWTEZF4Mlk8gAAAHTSURBVDjLYhiewB6/NIuNEQs+eQe14OBYYzwKhNdN7Ny/VwK3AvPnS6aeLBJHt5cNxjL49eZEytXrRXZQPhMTiGSVdhVkZGQEsmxPFX+aEbTvVZqhOAtQhFPUVQ8oKsBTm/v3Nzs7L6/KnAlzC6b3x7xOfVAnKSWryP6zzENZl+FhifvNrY/c3fLP3zq0YPHB2VNiJnXsaMjLz3N763Luhvt9hpJ7R8JDww9UVLwobdi4KGXL0tUJPW7lpS8fX5o/M2xz+TXAGHzqc4PmhZxtbKyvfL8rKS39ovPpZbefVtY5loUt703+8oGh1t8nMTKu2dHR0cs7h2tn+uHEC5k13zwdPX2TI+Of+H5nEJZv+1r9ucW3CaTgeEZG8abCzBpvT6+mFp/qj80eAsBgEDFV5w5o9/Pzb31298ya9UlVV4DM9raAAG4PHhFoiLAycjIxMXEyWdyJj9umzczMLMRnxs/PJooR1BxV0Sv2WOOJLFa56MnHOPDFt/7KaVys+BSwbZ+lgTdFiWVFmeBVwJwVJYhPXkKrcIOMGG55Ds3YhIKI3Va4nGm5qi9w7buQwAhVNqzyfKldTk7ZfxY6dYdeZsamQCjbxeWowg8lV2dnHUa4KACppaAN3K/S/gAAAABJRU5ErkJggg==';


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


const runApp = async (images: HTMLImageElement[]) => {

  planeSprite = images[0];

  createGameStateMachine(intro2State);
  // createGameStateMachine(menu2State);
  // createGameStateMachine(playState);
 //createGameStateMachine(gameState); 
  // createGameStateMachine(repairState);
  // createGameStateMachine(finalState);
 //  createGameStateMachine(touchState);

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
  time += delta/1000;
})(0);

};


const loadAllImages = async (urls: string[]) => {
  const images : HTMLImageElement[] = [];
  
  urls.forEach( url => {
    const image = new Image();
    image.src = url;
    images.push(image);
  });

  const imagePromises = images.map(loadImage);
  return Promise.all(imagePromises)
  .then(data => {
    return data;
  });

};

const loadImage = (image: HTMLImageElement) =>
  new Promise<HTMLImageElement>((resolve) => {
    image.onload = () => resolve(image);
  });

loadAllImages([planeImgSource]).then(runApp);