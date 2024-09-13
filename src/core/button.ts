import { colorTransludid } from "@/game/game-colors";
import { drawEngine } from "./draw-engine";
import { inputMouse } from "./input-mouse";
import { Vector } from "./vector";
import { PI, Timer } from "@/utils";

export interface ButtonStateProp {
  lineColor?: string;
  text?: string;
  color?: string;
  lineWidth?: number;
  fontSize?: number;
}


interface ButtonColors {
  default: ButtonStateProp;
  hover?: ButtonStateProp;
  active?: ButtonStateProp;
  disabled?: ButtonStateProp;
  selected?: ButtonStateProp;
}
export interface ButtonProps {
  x: number, y: number, w?: number, h?: number, r?: number
}

type BUTTON_STATUS = 'default' | 'hover' | 'active' | 'disabled' | 'selected';
export const BUTTON_STATUS_DEFAULT: BUTTON_STATUS = 'default';
export const BUTTON_STATUS_HOVER: BUTTON_STATUS = 'hover';
export const BUTTON_STATUS_ACTIVE: BUTTON_STATUS = 'active';
export const BUTTON_STATUS_DISABLED: BUTTON_STATUS = 'disabled';
export const BUTTON_STATUS_SELECTED: BUTTON_STATUS = 'selected';


export class Button {


  Position: Vector;
  Size: Vector;
  width: any;
  height: any;
  Radius: number | undefined;

  index = 0;
  name: string;
  data: any;
  text: string;
  timer: Timer | undefined;
  timerLoad: Timer | undefined;

  colors: ButtonColors;

  state: string;
  visible: boolean = true;
  enabled: boolean = true;
  selected: boolean = false;


  clickAction: Function;

  hoverEvent: () => void;
  // hoverOutEvent: () => void;
  clickEvent: () => void;
  keyboardDisabled = false;


  constructor(props: ButtonProps, text = "", fontSize: number = 70, colors: ButtonColors = {
    'default': {
      text: '#ddd',
      color: colorTransludid,
      lineWidth: 4,
      lineColor: '#ccc',
      fontSize: fontSize * 1.1,
    },
    'hover': {
      text: '#fff',
      color: 'rgb(150,150,150,.5)',
      lineWidth: 4,
      lineColor: '#ccc',
      fontSize: fontSize * 1.1,
    },
    'active': {
      text: '#fff',
      color: 'rgb(200,200,200,.3)',
      // color: 'green',
      lineWidth: 0,
      lineColor: '#ccc',
      fontSize: fontSize,
    },
    'disabled': {
      text: '#fff',
      color: '#ababab',
      lineWidth: 0,
      lineColor: '#ccc',
      fontSize: fontSize,
    },
    'selected': {
      text: '#fff',
      color: 'red',
      // color: '#ababab',
      lineWidth: 4,
      lineColor: '#ccc',
      fontSize: fontSize,
    },
  }) {

    this.Position = new Vector(props.x, props.y);
    this.Size = new Vector(props.w, props.h);
    this.Radius = props.r;
    if (props.r)
      this.Size = new Vector(props.r * 2, props.r * 2);

    this.width = this.Size.x;
    this.height = this.Size.y;

    this.name = '';
    this.text = text;
    this.clickAction = () => { };
    this.colors = colors;

    this.state = BUTTON_STATUS_DEFAULT; // current button state


    this.hoverEvent = () => {
    };
    // this.hoverOutEvent = () => {
    // };
    this.clickEvent = () => {
    };
  }


  _update(dt: number) {

    if (this.timer && this.timer.elapsedAction && this.timer.elapsed()) {
      this.timer.elapsedAction();
      this.timer.unset();
    }
    if (this.timerLoad && this.timerLoad.elapsedAction && this.timerLoad.elapsed()) {
      this.timerLoad.elapsedAction();
      this.timerLoad.unset();
    }    

    if (!this.visible) return;

    if (!inputMouse.pointer) return;

    let mousePosition = inputMouse.pointer.Position;

    let localX = this.Position.x - this.width / 2; //
    let localY = this.Position.y - this.height / 2;

    // check for hover
    if (mousePosition.x >= localX && mousePosition.x <= localX + this.width &&
      mousePosition.y >= localY && mousePosition.y <= localY + this.height) { //  - rect.top

      if (this.enabled) {

        if (this.state != BUTTON_STATUS_ACTIVE && this.state != BUTTON_STATUS_HOVER) {
          this.hoverEvent();
          this.state = BUTTON_STATUS_HOVER;
        }


        // check for click
        if (this.state != BUTTON_STATUS_ACTIVE && inputMouse.pointer.leftButton) {
          this.state = BUTTON_STATUS_ACTIVE;
        }
      }


    }
    else {
      // if (this.state != BUTTON_STATUS_ACTIVE && this.state == BUTTON_STATUS_HOVER) {
      //   this.hoverOutEvent();
      // }

      this.state = BUTTON_STATUS_DEFAULT;
    }

  }


  _draw(ctx: CanvasRenderingContext2D) {

    if (!this.visible)
      return;

    var props = this.colors[this.state as keyof ButtonColors];

    ctx.save();
    ctx.translate(this.Position.x, this.Position.y);

    ctx.save();

    // if (this.timer?.isSet()) {
    //   ctx.save();
    //   ctx.strokeStyle = 'red';
    //   ctx.lineWidth = 15;
    //   this.drawArc(ctx, this.Size.x, PI * 2 - PI * 2 * this.timer!.p100(), true);
    //   ctx.restore();
    // }
    this.timer && this.drawTimerActive(ctx, this.timer, 'red', 15);

    this.timerLoad && this.drawTimerActive(ctx, this.timerLoad, 'gray', 15);


    if (this.enabled && (this.state == BUTTON_STATUS_HOVER || this.state == BUTTON_STATUS_ACTIVE)) {
      ctx.scale(1.05, 1.05);
    }

    if (!this.enabled)
      ctx.globalAlpha = .3;


    ctx.strokeStyle = props?.lineColor!;
    ctx.lineWidth = props?.lineWidth!;
    ctx.fillStyle = props?.color!;
    ctx.beginPath();

    // Button area
    if (this.Radius)
      ctx.arc(0, 0, this.Radius, 0, Math.PI * 2);
    else
      ctx.rect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);

    // ctx.stroke();
    ctx.fill();

    if (this.selected) {
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
    }


    // text inside
    drawEngine.drawText(this.text, props?.fontSize!, 0, 0, props?.text); //  this.index +'. '+


    // text outside
    if (this.data != undefined)
      drawEngine.drawText(this.data, props?.fontSize! * .5, 0, 0, props?.text);

    ctx.globalAlpha = 1;


    ctx.restore();

    ctx.restore();


    // if (debug.showButtonBounds) {
    //   ctx.beginPath();
    //   ctx.lineWidth = 1;
    //   ctx.strokeStyle = 'red';
    //   ctx.rect(this.Position.x - this.width / 2, this.Position.y - this.height / 2, this.width, this.height);
    //   ctx.stroke();
    // }

  }

  private drawTimerActive(ctx: CanvasRenderingContext2D, timer: Timer , color: string, lineWidth: number) {
    if (timer.isSet()) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      this.drawArc(ctx, this.Size.x, PI * 2 * timer.p100());
      ctx.restore();
    }
  }

  drawArc(ctx: CanvasRenderingContext2D, size: number, angle: number, reverse = false) {
    
    ctx.beginPath();
    ctx.rotate(-PI / 2);
    ctx.moveTo(size / 2, 0);
    
    // Arco principal
    if (!reverse) {
        ctx.arc(0, 0, size / 2, 0, angle);
        ctx.arc(0, 0, size / 2, angle, 0, true);
    } else {
        ctx.arc(0, 0, size / 2, 0, angle);
        ctx.arc(0, 0, size / 2, angle, 0, true);
    }

    ctx.closePath();
    ctx.stroke();
}


  mouseDownEvent(mousePosition: Vector): boolean {

    if (!this.visible) // || (this.parent && !this.parent.visible)
      return false;

    if (!this.enabled)
      return false;

    let localX = this.Position.x - this.width / 2;
    let localY = this.Position.y - this.height / 2;

    // check for click
    if (mousePosition.x >= localX && mousePosition.x <= localX + this.width &&
      mousePosition.y >= localY && mousePosition.y <= localY + this.height) { //  - rect.top

      this.clickEvent();

      if (typeof this.clickAction === 'function') {
        this.clickAction(this);
      }

      this.state = BUTTON_STATUS_DEFAULT;
      return true;
    }
    return false;
  }


}

