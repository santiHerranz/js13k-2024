import { Unit } from "@/game/unit";
import { drawEngine } from "./draw-engine";
import { inputMouse } from "./input-mouse";
import { Vector } from "./vector";
import { debug } from "@/game/game-debug";

export interface ButtonStateProp {
  lineColor: string;
  text: string;
  color: string;
  lineWidth: number;
  fontSize: number;
}


interface ButtonColors {
  default: ButtonStateProp;
  hover: ButtonStateProp;
  active: ButtonStateProp;
  disabled: ButtonStateProp;
  selected: ButtonStateProp;
}
export interface ButtonProps {
  x: number, y: number, w: number, h: number
}

export class Button {


  Position: Vector;
  Size: Vector;

  index = 0;
  name: string;
  width: any;
  height: any;
  text: string;
  data: string;
  accesory: string | undefined = undefined;


  colors: ButtonColors;

  state: string;
  visible: boolean = true;
  enabled: boolean = true;
  selected: boolean = false;


  clickAction: Function;

  hoverEvent: () => void;
  hoverOutEvent: () => void;
  clickEvent: () => void;


  constructor(props: ButtonProps, text = "", title = "", fontSize: number = 80, colors: ButtonColors = {
    'default': {
      text: '#ddd',
      color: 'rgb(150,150,150,.3)',
      lineWidth: 2,
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

    this.name = '';

    this.width = props.w;
    this.height = props.h;
    this.text = text;
    this.data = '';
    this.clickAction = () => { };
    this.colors = colors;

    this.state = 'default'; // current button state


    this.hoverEvent = () => {
    };
    this.hoverOutEvent = () => {
    };
    this.clickEvent = () => {
    };
  }


  _update(dt: number) {

    if (!this.visible) return;

    if (!inputMouse.pointer) return;

    let mousePosition = inputMouse.pointer.Position;

    let localX = this.Position.x - this.width / 2; //
    let localY = this.Position.y - this.height / 2;

    // check for hover
    if (mousePosition.x >= localX && mousePosition.x <= localX + this.width &&
      mousePosition.y >= localY && mousePosition.y <= localY + this.height) { //  - rect.top

      if (this.enabled) {

        if (this.state != 'active' && this.state != 'hover') {
          this.hoverEvent();
          this.state = 'hover';
        }


        // check for click
        if (this.state != 'active' && inputMouse.pointer.leftButton) {
          this.state = 'active';
        }
      }


    }
    else {
      if (this.state != 'active' && this.state == 'hover') {
        this.hoverOutEvent();
      }

      this.state = 'default';
    }

  }


  _draw(ctx: CanvasRenderingContext2D) {

    if (!this.visible)
      return;

    var props = this.colors[this.state as keyof ButtonColors];

    ctx.save();
    ctx.translate(this.Position.x, this.Position.y);

    ctx.save();

    if (this.enabled && (this.state == 'hover' || this.state == 'active')) {
      ctx.scale(1.05, 1.05);
    }

    if (!this.enabled)
      ctx.globalAlpha = .3;


    ctx.strokeStyle = props.lineColor;
    ctx.lineWidth = props.lineWidth;
    ctx.fillStyle = props.color;
    ctx.beginPath();

    // Button area
    ctx.rect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);

    // ctx.stroke();
    ctx.fill();

    if (this.selected) {
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
    }


    // text inside
    drawEngine.drawText((!this.accesory? this.text : this.text + ' ' + this.accesory) , props.fontSize, 0, 0, props.text);


    // // text outside
    // if (this.enabled)
    //   drawEngine.drawText(this.data, props.fontSize * .5, 0, 0, props.text);

    ctx.globalAlpha = 1;


    ctx.restore();

    ctx.restore();


    if (debug.showButtonBounds) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.rect(this.Position.x - this.width / 2, this.Position.y - this.height / 2, this.width, this.height);
      ctx.stroke();
    }

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

      this.state = 'default';
      return true;
    }
    return false;
  }


}

