import { Vector } from "@/core/vector";
import { rand } from "@/utils";

export const globalParticles: Particle[] = [];

export const globalParticleTime = 80;

export class Particle {

  radius: any;
  x: any;
  y: any;
  dx: any;
  dy: any;
  color: any;
  alpha: number;
  time: any;
  initTime: any;

  constructor(x: any, y: any, r: any, dx: any, dy: any, color: string, t: any) {

    this.x = x;
    this.y = y;
    this.radius = r;
    this.dx = dx;
    this.dy = dy;
    this.color = color;
    this.alpha = 1;
    this.time = t;
    this.initTime = t;

    if (this.color == '')
      this.color = '#fff';
  }

  draw(ctx: CanvasRenderingContext2D) {
    // console.log('particle draw')
    let tmp = ctx.globalAlpha;

    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.globalAlpha = tmp;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.time--;
    this.alpha -= 1 / this.initTime;
    this.radius *= 0.98;
  }
}

export function globalAddParticle(pos: Vector, radius: number, color: string, dx: any, dy: any, t: any) {
  if (globalParticles.length > 5000) return;

  var angle = rand(0, 2 * Math.PI);
  var mag = rand(0.5 * radius, 1.5 * radius);
  var offset = [2 * mag * Math.cos(angle), 2 * mag * Math.sin(angle)];
  var parR = 4 * rand(5, 12);
  let particleColor;

  if (color == '') {
    var colors: number[] = [];
    if (Math.random() > 0.25) {
      colors = [Math.floor(rand(200, 255)), Math.floor(rand(40, 120)), 0];
    } else {
      var smoke = Math.floor(rand(0, 64));
      colors = [smoke, smoke, smoke];
    }
    particleColor = 'rgb(' + colors[0] + ', ' + colors[1] + ', ' + colors[2] + ')';
  } else {
    particleColor = color;
  }

  globalParticles.push(new Particle(pos.x + offset[0], pos.y + offset[1], parR, dx, dy, particleColor, t));
}


export function updateGlobalParticles() {
  for (var p = globalParticles.length - 1; p > -1; p--) {
    var tempPar: Particle = globalParticles[p];
    tempPar.update();
    if (tempPar.time < 0) {
      globalParticles.splice(p, 1);
    }
  }
}

