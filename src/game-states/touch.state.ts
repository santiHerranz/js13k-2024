// import { drawEngine } from "@/core/draw-engine";
// import { State } from "@/core/state";

// const ongoingTouches: { identifier: any; pageX: any; pageY: any; }[] = [];

// let screenOffsetX = 0;
// let screenOffsetY = 0;

// export class TouchState implements State {

//     ongoingTouches: any[];
//     Orientation= '';

//     constructor() {
//         this.ongoingTouches = [];

//     }

//     onEnter() {


//         const canvas = document.getElementById("c2d");
//         canvas!.addEventListener("touchstart", this.handleStart);
//         canvas!.addEventListener("touchend", this.handleEnd);
//         canvas!.addEventListener("touchcancel", this.handleCancel);
//         canvas!.addEventListener("touchmove", this.handleMove);
//         console.log("Initialized.");

//         canvas!.setAttribute('style', 'background-color: #fff;');  //#124875 // #188fa8  


//     }
//     handleEnd(evt: any) {
//         evt.preventDefault();
//         console.log("touchend");
//         const ctx = drawEngine.context
//         const touches = evt.changedTouches;

//         for (let i = 0; i < touches.length; i++) {
//             const color = colorForTouch(touches[i]);
//             let idx = ongoingTouchIndexById(touches[i].identifier);

//             if (idx >= 0) {
//                 ctx.lineWidth = 4;
//                 ctx.fillStyle = color;
//                 ctx.beginPath();
//                 ctx.moveTo(ongoingTouches[idx].pageX * window.devicePixelRatio + screenOffsetX, ongoingTouches[idx].pageY * window.devicePixelRatio + screenOffsetY);
//                 ctx.lineTo(touches[i].pageX * window.devicePixelRatio + screenOffsetX, touches[i].pageY * window.devicePixelRatio + screenOffsetY);
//                 ctx.fillRect(touches[i].pageX * window.devicePixelRatio + screenOffsetX - 4, touches[i].pageY * window.devicePixelRatio + screenOffsetY - 4, 8, 8); // and a square at the end
//                 ongoingTouches.splice(idx, 1); // remove it; we're done
//             } else {
//                 console.log("can't figure out which touch to end");
//             }
//         }
//     }
//     handleCancel(evt: any) {
//         evt.preventDefault();
//         console.log("touchcancel.");
//         const touches = evt.changedTouches;

//         for (let i = 0; i < touches.length; i++) {
//             let idx = ongoingTouchIndexById(touches[i].identifier);
//             ongoingTouches.splice(idx, 1); // remove it; we're done
//         }
//     }
//     handleMove(evt: any) {
//         evt.preventDefault();

//         const ctx = drawEngine.context
//         const touches = evt.changedTouches;

//         for (let i = 0; i < touches.length; i++) {
//             const color = colorForTouch(touches[i]);
//             const idx = ongoingTouchIndexById(touches[i].identifier);

//             if (idx >= 0) {
//                 console.log(`continuing touch ${idx}`);
//                 ctx.beginPath();
//                 console.log(
//                     `ctx.moveTo( ${ongoingTouches[idx].pageX * window.devicePixelRatio + screenOffsetX}, ${ongoingTouches[idx].pageY * window.devicePixelRatio + screenOffsetY} );`,
//                 );
//                 ctx.moveTo(ongoingTouches[idx].pageX * window.devicePixelRatio + screenOffsetX, ongoingTouches[idx].pageY * window.devicePixelRatio + screenOffsetY);
//                 console.log(`ctx.lineTo( ${touches[i].pageX * window.devicePixelRatio + screenOffsetX}, ${touches[i].pageY * window.devicePixelRatio + screenOffsetY} );`);
//                 ctx.lineTo(touches[i].pageX * window.devicePixelRatio + screenOffsetX, touches[i].pageY * window.devicePixelRatio + screenOffsetY);
//                 ctx.lineWidth = 4;
//                 ctx.strokeStyle = color;
//                 ctx.stroke();

//                 ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
//             } else {
//                 console.log("can't figure out which touch to continue");
//             }
//         }
//     }
//     handleStart(event: any) {
//         event.preventDefault();
//         console.log("touchstart.");
//         const ctx = drawEngine.context;
//         const touches = event.changedTouches;

//         for (let i = 0; i < touches.length; i++) {
//             console.log(`touchstart: ${i}.`);
//             ongoingTouches.push(copyTouch(touches[i]));
//             const color = colorForTouch(touches[i]);
//             console.log(`color of touch with id ${touches[i].identifier} = ${color}`);
//             ctx.beginPath();
//             ctx.arc(touches[i].pageX* window.devicePixelRatio + screenOffsetX, touches[i].pageY* window.devicePixelRatio + screenOffsetY, 20, 0, 2 * Math.PI, false); // a circle at the start
//             ctx.fillStyle = color;
//             ctx.fill();
//         }
//     }

//     onUpdate(dt: number) {

//         if (window.innerHeight < window.innerWidth) {
//             screenOffsetX = -500;
//             screenOffsetY = 300;
//             this.Orientation = "VVVV";
//         }
//          else {
//             screenOffsetX = -200;
//             screenOffsetY = 0;
//             this.Orientation = "HHHH";
//          }

//         drawEngine.drawText(this.Orientation, 100, drawEngine.canvasWidth * .5, drawEngine.canvasHeight * .5, '#eee', 'center');

//     }


// }

// export const touechState = new TouchState();

// function copyTouch(evt: { identifier: any; pageX: number; pageY: number; }) {
//     return { identifier: evt.identifier, pageX: evt.pageX, pageY: evt.pageY };
// }

// function colorForTouch(touch: { identifier: number; }) {
//     let r = touch.identifier % 16;
//     let g = Math.floor(touch.identifier / 3) % 16;
//     let b = Math.floor(touch.identifier / 7) % 16;
//     let rr = r.toString(16); // make it a hex digit
//     let gg = g.toString(16); // make it a hex digit
//     let bb = b.toString(16); // make it a hex digit
//     const color = `#${rr}${gg}${bb}`;
//     return color;
// }

// function ongoingTouchIndexById(idToFind: any) {
//     for (let i = 0; i < ongoingTouches.length; i++) {
//         const id = ongoingTouches[i].identifier;

//         if (id === idToFind) {
//             return i;
//         }
//     }
//     return -1; // not found
// }

