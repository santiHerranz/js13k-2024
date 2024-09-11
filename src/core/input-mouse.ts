import { drawEngine } from "./draw-engine";
import { Pointer } from "./pointer";
import { Vector } from "./vector";


type MouseEvent = 'mousedown' | 'mousemove' | 'mouseup' | 'mousedrag' // | 'mousescroll'
type TouchEvent = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel'

const MOUSE_EVENT_TYPE_DOWN: MouseEvent = 'mousedown';
const MOUSE_EVENT_TYPE_MOVE: MouseEvent = 'mousemove';
const MOUSE_EVENT_TYPE_UP: MouseEvent = 'mouseup';
// const MOUSE_EVENT_TYPE_SCROLL: MouseEvent  = 'mousescroll';
const MOUSE_EVENT_TYPE_DRAG: MouseEvent = 'mousedrag';

const TOUCH_EVENT_TYPE_START: TouchEvent = 'touchstart';
const TOUCH_EVENT_TYPE_MOVE: TouchEvent = 'touchmove';
const TOUCH_EVENT_TYPE_END: TouchEvent = 'touchend';
const TOUCH_EVENT_TYPE_CANCEL: TouchEvent = 'touchcancel';


class InputMouse {

  public lastX: number = 0;
  public lastY: number = 0;


  public dragStart: Vector | undefined;
  public camDragged: boolean = false;

  private zoomValue: number = 2 * 800;


  public pointer: Pointer = new Pointer();

  #listeners: { type: string, callback: Function }[] = [];

  constructor() {

    this.#listeners = [];

    const canvas = document.getElementById('c2d');
    // const canvas = window; // iOS Safari touch events stop firing with 17.4.1
    const theBody = document.body;

    if (theBody) {
      theBody.addEventListener(MOUSE_EVENT_TYPE_DOWN, this.handleMouseDown, false);
      theBody.addEventListener(MOUSE_EVENT_TYPE_MOVE, this.handleMouseMove, false);
      theBody.addEventListener(MOUSE_EVENT_TYPE_UP, this.handleMouseUp, false);

      theBody.addEventListener(TOUCH_EVENT_TYPE_MOVE, this.handleTouchMove, false);

      console.log("Adding MouseEvent & TouchEvent listeners");
      [MOUSE_EVENT_TYPE_DOWN, MOUSE_EVENT_TYPE_MOVE, MOUSE_EVENT_TYPE_UP].forEach((e) => {
        theBody.addEventListener(e, this.MouseHandler);
      });
      [TOUCH_EVENT_TYPE_START, TOUCH_EVENT_TYPE_MOVE, TOUCH_EVENT_TYPE_END].forEach((e) => {
        theBody.addEventListener(e, this.TouchHandler);
      });

      // canvas!.addEventListener(TOUCH_EVENT_TYPE_START, this.handleStart);
      // canvas!.addEventListener(TOUCH_EVENT_TYPE_END, this.handleEnd);
      // canvas!.addEventListener(TOUCH_EVENT_TYPE_CANCEL, this.handleCancel);
      // canvas!.addEventListener(TOUCH_EVENT_TYPE_MOVE, this.handleMove);

      // canvas.addEventListener('DOMMouseScroll', this.handleScroll, false);
      // canvas.addEventListener('mousewheel', this.handleScroll, false); // chrome    

      // FEATURE Disable RightButton Mouse
      theBody.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
    }
  }
  

  addEventListener(type: MouseEvent | TouchEvent, callback: Function) {
    // console.log('addEventListener: '+ type);
    this.#listeners.push({ type: type, callback: callback });
  }
  removeEventListener(type: MouseEvent | TouchEvent) {
    // console.log('removeEventListener: '+ type);
    this.#listeners = this.#listeners.filter(f => f.type != type);
  }
  removeAllEventListener() {
    this.#listeners = [];
  }


  private getMousePosition = (evt: any) => {

    var rect = c2d.getBoundingClientRect();

    this.lastX = (evt.clientX - rect.left) / c2d.offsetWidth * 1080;
    this.lastY = (evt.clientY - rect.top) / (c2d.offsetWidth / (1080 / 1920)) * 1920;

    this.pointer.Position = new Vector(this.lastX, this.lastY);

    // console.log('pointer from mouse: ' + JSON.stringify(this.pointer.Position));

  };

  private getTouchPosition = (evt: any) => {

    var rect = c2d.getBoundingClientRect();

    this.lastX = (evt.pageX - rect.left) / c2d.offsetWidth * 1080;
    this.lastY = (evt.pageY - rect.top) / (c2d.offsetWidth / (1080 / 1920)) * 1920;

    if (this.lastX != null) {
      this.pointer.Position = new Vector(this.lastX, this.lastY);
      // console.log('pointer from touch: ' + JSON.stringify(this.pointer.Position));
    }
  };


  // TOUCH
  TouchHandler = (event: any) => {

    for (var i = 0; i < event.changedTouches.length; i++) {
      // console.log('TouchHandler: ' + event.changedTouches[i].pageX +','+ event.changedTouches[i].pageY);
      this.getTouchPosition(event.changedTouches[i]);
      break;
    }

    // TODO
    this.dragStart = new Vector(this.lastX, this.lastY);
    this.camDragged = false;

    this.#listeners.filter(f => f.type == TOUCH_EVENT_TYPE_MOVE).forEach(listener => listener.callback(this.pointer));

  };

  // handleTouchDown = (event: any) => {

  //   this.getTouchPosition(event);

  //   this.dragStart = new Vector(this.lastX, this.lastY);
  //   this.camDragged = false;


  //   this.#listeners.filter(f => f.type == TOUCH_EVENT_TYPE_END).forEach(listener => listener.callback(this.pointer));
  // };


  handleTouchMove = (event: any) => {

    for (var i = 0; i < event.changedTouches.length; i++) {
      // console.log('TouchHandler: ' + event.changedTouches[i].pageX +','+ event.changedTouches[i].pageY);
      this.getTouchPosition(event.changedTouches[i]);
    }

    this.#listeners.filter(f => f.type == TOUCH_EVENT_TYPE_MOVE).forEach(listener => listener.callback(this.pointer));

    return event.preventDefault() && false;
  };

  // MOUSE
  MouseHandler = () => { };

  handleMouseDown = (evt: any) => {
    // console.log('handleMouseDown event! listeners: '+ this.#listeners.length);

    var e: Event | any = window.event;

    if (e.which) this.pointer.leftButton = (e.which == 1);
    else if (e.button) this.pointer.leftButton = (e.button == 0);

    if (e.which) this.pointer.middleButton = (e.which == 2);
    else if (e.button) this.pointer.middleButton = (e.button == 1);

    if (e.which) this.pointer.rigthButton = (e.which == 3);
    else if (e.button) this.pointer.rigthButton = (e.button == 1);


    this.getMousePosition(evt);

    // this.pointer.Position = new Vector(this.lastX, this.lastY);

    if (this.pointer.leftButton) {
      this.dragStart = new Vector(this.lastX, this.lastY);
      this.camDragged = false;
    }

    this.#listeners.filter(f => f.type == MOUSE_EVENT_TYPE_DOWN).forEach(listener => listener.callback(this.pointer));
  };

  handleMouseMove = (evt: any) => {


    this.getMousePosition(evt);

    if (this.pointer.leftButton) {
      this.camDragged = true;
      if (this.dragStart) {
        // let start = new Vector(this.dragStart.x, this.dragStart.y);
        // let last = new Vector(this.lastX, this.lastY);
        // // this._scene._cam._move((start.x - last.x) * this._scene._cam._distance / (2 * 800), (start.y - last.y) * this._scene._cam._distance / (2 * 800))


        this.#listeners.filter(f => f.type == MOUSE_EVENT_TYPE_DRAG).forEach(listener => listener.callback(this.pointer));

        this.dragStart = new Vector(this.lastX, this.lastY);
      }

    }

    this.#listeners.filter(f => f.type == MOUSE_EVENT_TYPE_MOVE).forEach(listener => listener.callback(this.pointer));

    return evt.preventDefault() && false;
  };

  handleMouseUp = (evt: any) => {

    this.getMousePosition(evt);

    var e: Event | any = window.event;

    if (e.which) this.pointer.middleButton = (e.which == 2);
    else if (e.button) this.pointer.middleButton = (e.button == 1);


    if (this.pointer.middleButton) {
      this.dragStart = undefined;
      this.pointer.middleButton = false;
    }

    this.pointer.leftButton = false;
    this.pointer.middleButton = false;
    this.pointer.rigthButton = false;


    this.#listeners.filter(f => f.type == MOUSE_EVENT_TYPE_UP).forEach(listener => listener.callback(this.pointer));


    return evt.preventDefault() && false;
  };


  // handleStart(event: any) {
  // }

  // handleEnd(evt: any) {

  //   const touches = evt.changedTouches;

  //   for (let i = 0; i < touches.length; i++) {
  //     let idx = ongoingTouchIndexById(touches[i].identifier);

  //     if (idx >= 0) {
  //       ongoingTouches.splice(idx, 1); // remove it; we're done
  //     } else {
  //       console.log("can't figure out which touch to end");
  //     }
  //   }

  // }  

  // handleMove(evt: any) {
  //   evt.preventDefault();
  //   const touches = evt.changedTouches;

  //   for (let i = 0; i < touches.length; i++) {
  //     const idx = ongoingTouchIndexById(touches[i].identifier);

  //     if (idx >= 0) {
  //       console.log(`continuing touch ${idx}`);
  //       console.log(
  //         `ctx.moveTo( ${ongoingTouches[idx].pageX }, ${ongoingTouches[idx].pageY * window.devicePixelRatio} );`,
  //       );
  //       console.log(`ctx.lineTo( ${touches[i].pageX }, ${touches[i].pageY * window.devicePixelRatio} );`);
  //       ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
  //     } else {
  //       console.log("can't figure out which touch to continue");
  //     }
  //   }

  // }
  // handleCancel(evt: any) {
  //   evt.preventDefault();
  //   console.log("touchcancel.");
  //   const touches = evt.changedTouches;

  //   for (let i = 0; i < touches.length; i++) {
  //     let idx = ongoingTouchIndexById(touches[i].identifier);
  //     ongoingTouches.splice(idx, 1); // remove it; we're done
  //   }
  // }


  // handleScroll = (evt: any) => {

  //   var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;

  //   // console.log('handleScroll: delta ' + delta)
  //   if (delta) {

  //     // this._enable()

  //     // FEATURE: lateral move when zoom in
  //     if (Math.abs(delta) > 0) {
  //       let last = new Vector(this.lastX, this.lastY);
  //       let center = new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2);
  //       let desp = last.subtract(center).scale(.2); // * this._scene._cam._distance/800
  //       if (delta < 0) desp.scale(-1);
  //       // this._scene._cam._move(desp.x, desp.y)
  //     }

  //     var factor = Math.pow(1.05, delta);
  //     this.setZoomValue(factor);

  //     // this.eventMouseScroll();
  //     this.#listeners.filter(f => f.type == MOUSE_EVENT_TYPE_SCROLL).forEach(listener => listener.callback(this.pointer));


  //   }
  //   return evt.preventDefault() && false;
  // };


}

export const inputMouse = new InputMouse();

// const ongoingTouches: { identifier: any; pageX: any; pageY: any; }[] = [];


// function copyTouch(evt: { identifier: any; pageX: number; pageY: number; }) {
//   return { identifier: evt.identifier, pageX: evt.pageX, pageY: evt.pageY };
// }

// function colorForTouch(touch: { identifier: number; }) {
//   let r = touch.identifier % 16;
//   let g = Math.floor(touch.identifier / 3) % 16;
//   let b = Math.floor(touch.identifier / 7) % 16;
//   let rr = r.toString(16); // make it a hex digit
//   let gg = g.toString(16); // make it a hex digit
//   let bb = b.toString(16); // make it a hex digit
//   const color = `#${rr}${gg}${bb}`;
//   return color;
// }

// function ongoingTouchIndexById(idToFind: any) {
//   for (let i = 0; i < ongoingTouches.length; i++) {
//     const id = ongoingTouches[i].identifier;

//     if (id === idToFind) {
//       return i;
//     }
//   }
//   return -1; // not found
// }
