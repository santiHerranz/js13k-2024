import { time } from "@/index";
import { Vector } from "./vector";

class DrawEngine {

  context: CanvasRenderingContext2D;

  constructor() {
    this.context = c2d.getContext('2d');
  }

  get canvasWidth() {
    return this.context.canvas.width;
  }

  get canvasHeight() {
    return this.context.canvas.height;
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    const context = this.context;

    context.font = `bold ${fontSize}px Impact, sans-serif-black`;
    context.textAlign = textAlign;
    context.strokeStyle = 'black';
    context.lineWidth = 8;
    context.miterLimit = 4;
    context.textBaseline = 'middle';
    context.fillStyle = color;
    context.strokeText(text, x, y);
    context.fillText(text, x, y);
  }

  
  drawCircle(position: Vector, size: number = 10, options? : { stroke?: string, fill?: string; lineWidth? : number; }) {
    if (options == undefined)
      options = { stroke: '#fff', lineWidth : 3 };
    if (options.fill == undefined) 
        options.fill = 'transparent';

    const ctx = this.context;

    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, 2* Math.PI);
    ctx.closePath();

    ctx.lineWidth = options.lineWidth!;
    ctx.fillStyle = options.fill!;
    ctx.strokeStyle = options.stroke!;
    ctx.stroke();
    ctx.fill();

  }


  drawLine(position: Vector, destination: Vector, options?: { stroke?: string; lineWidth?: number; } ) {
    
    if (options == undefined)
      options = { stroke: '#fff', lineWidth : 3 };

    const ctx = this.context;

    ctx.strokeStyle = options.stroke!; //`rgba(127,255,212,0.85)`;
    ctx.lineWidth = options.lineWidth!;

    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(destination.x, destination.y);
    ctx.closePath();

    ctx.stroke();
  }

  drawRectangle(position: Vector, size: Vector, options?: { stroke?: string; fill?: string; }) {

    if (options == undefined)
      options = { stroke: '#fff', fill : '#fff' };

    const ctx = this.context;

    ctx.lineWidth = 8;
    ctx.fillStyle = options.fill!;
    ctx.strokeStyle = options.stroke!;

    ctx.beginPath();
    ctx.rect(position.x, position.y, size.x, size.y);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();
  }

  drawQuadtree(node: any, ctx: CanvasRenderingContext2D) {
    //no subnodes? draw the current node
    if (node.nodes.length === 0) {
      ctx.strokeStyle = `rgba(127,255,212,0.25)`;
      ctx.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
      //has subnodes? drawQuadtree them!
    } else {
      for (let i = 0; i < node.nodes.length; i = i + 1) {
        this.drawQuadtree(node.nodes[i], ctx);
      }
    }
  }

  drawBar(position: Vector, size: Vector, offsetY: number = 0, valueToShow: number = 100, valueMax: number = 100, color: string = '#0f0', condition: boolean = true, lineWidth: number = 6) {
    const ctx = this.context;

    if (true || condition) {
        let value = valueToShow / valueMax; // Math.abs(Math.sin(time/1000)); //

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(position.x - size.x, position.y + offsetY);
        ctx.lineTo(position.x + size.x, position.y + offsetY);
        ctx.closePath();

        ctx.stroke();


        ctx.strokeStyle = value < .5 ? '#f00' : color;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(position.x - size.x, position.y + offsetY);
        ctx.lineTo(position.x - size.x + (size.x * 2 * value), position.y + offsetY); 
        ctx.closePath();

        ctx.stroke();

    }
}


 preShake(force: number = 10) {
  this.context.save();

  var dx = Math.random()*force;
  var dy = Math.random()*force;
  this.context.translate(dx, dy);  

  // let value = .5//Math.cos(time/1000)
  // // this.context.translate(-this.canvasWidth*(1-value), 0)
  // this.context.moveTo(this.canvasWidth/2, 0)
  // this.context.translate(this.canvasWidth/4, 0)
  // this.context.scale(value,value)

}

 postShake() {
  this.context.restore();
}

}

export const drawEngine = new DrawEngine();
