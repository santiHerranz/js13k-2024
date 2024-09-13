import { Vector } from "@/core/vector";
import { drawEngine } from "@/core/draw-engine";
import TileMap from "./tilemap";
import { GameTile } from "./game-tile";

export const GameMapTheme = { sea: 0 , coast: 1, forest: 2,  dessert: 3, snow: 4}; //: 1, other: 2

export class GameMap {

    tileMap: TileMap | undefined;
    imageCache: any;
    theme: number = 0;

    dim: Vector;
    size: Vector;
    seed: number;

    offsetY = 0;

    multiple = 3;
    speed = 2.5;

    maxOffsetY = 1920*this.multiple;

    constructor(theme = GameMapTheme.sea, seed = 81962) {
    
        this.dim = new Vector(49, 96*this.multiple);
        this.size = new Vector(44, 44);
        this.seed = seed;
        this.theme = theme;

        this.Init();
    }

    Init() {
        this.tileMap = new TileMap(this.dim, this.size, this.seed);
        this.imageCache = undefined;
    }

    drawTileMap(ctx: CanvasRenderingContext2D, dt:number, blurValue = 15) {

        this.offsetY += this.speed; // * dt
        if  (this.offsetY > this.maxOffsetY) this.offsetY = 0;

        var w = drawEngine.canvasWidth, h = drawEngine.canvasHeight;
        if (!this.imageCache) {

            var palette = [
                ["#265998", "#265998", "#265998", "#48893e", "#564d40"], // sea
                ["#1ba5e1", "#1ba5e1", "#e5d9c2", "#48893e", "#564d40"], // coast
                ["#fff", "#28691e", "#38792e", "#48893e", "#564d40"],    // forest
                ["#F0E2AE", "#F2CA9D", "#E7A885", "#CE8A7A", "#C37F7C"], // dessert
                ["#fff", "#ddd", "#bbb", "#999", "#777"],                // snow
                // ["#FE6927", "#FFD85F", "#FEE8AA", "#FCEC9C", "#FFE293"], // other
            ];

            var colors = palette[this.theme];

            // let ctx = c2d.cloneNode().getContext('2d');

            var canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920*this.multiple;
            
            // Get the drawing context
            let newCtx: CanvasRenderingContext2D | null  = canvas.getContext('2d');  
            if (newCtx) {
                this.tileMap!._map.forEach((row) => {
                    row.forEach((tile: GameTile) => {
                        newCtx!.fillStyle = colors[tile._tileType];
                        newCtx!.beginPath();
                        newCtx!.rect(tile._position.x, tile._position.y, tile._tileSize.x, tile._tileSize.y);
                        newCtx!.fill();

                        // ctx.strokeStyle = 'black'
                        // ctx.beginPath();
                        // ctx.arc(tile._position.x + tile._tileSize.x/2, tile._position.y + tile._tileSize.y/2, tile._tileSize.x/2, 0, 2 * Math.PI);
                        // ctx.closePath();
                        // ctx.fill()
                        // ctx.stroke();  

                        // if (colIndex == 0 && index % 10 == 0) {
                        //     ctx.font = `80px Impact, sans-serif-black`;
                        //     ctx.fillText('🌾', tile._position.x + tile._tileSize.x * 8, tile._position.y + tile._tileSize.y/2);
                        // }
                    });


                });

                // this.tileMap._map.forEach((row , index) => {
                //     row.forEach((tile: GameTile, colIndex) => {
                //         let value = 96*this.multiple - index
                //         if (colIndex == 0 && index % 10 == 0) {
                //             ctx.font = `40px Impact, sans-serif-black`;
                //             ctx.strokeStyle = 'black';
                //             ctx.lineWidth = 4;
                //             ctx.strokeText(''+ value, tile._position.x + tile._tileSize.x/2, tile._position.y + tile._tileSize.y/2);
                //             ctx.fillStyle = 'white';
                //             ctx.fillText(''+ value, tile._position.x + tile._tileSize.x/2, tile._position.y + tile._tileSize.y/2);
                //         }
                //     })
                // })                

            }


            this.imageCache = newCtx;
        } else {
            var x = w / 2, y = h / 2;

            // Aplicar efecto de desenfoque
            // 
            // ctx.filter = 'blur(' + blurValue + 'px)';
            
            // TODO Error al interpretar el valor para 'filter'.  Declaración rechazada.
            // ctx.filter = 'contrast(100%) brightness(100%) saturated(100%)'; 
            ctx.filter = 'brightness(60%)'; 

            ctx.globalAlpha = .9;

            ctx.drawImage(this.imageCache.canvas, x - w / 2, -1920-this.maxOffsetY + this.offsetY + y - h / 2);
            ctx.drawImage(this.imageCache.canvas, x - w / 2, -1920+this.offsetY + y - h / 2);

            // Limpiar el efecto de desenfoque
            ctx.filter = 'none';
            ctx.globalAlpha = 1;

        }

    }


}