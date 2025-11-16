import { i2c } from "@/utils";
import { Vector } from "../core/vector";

export class GameTile {

    _isoPosition: Vector;
    _position: any;
    _tileSize: Vector;
    _tileType: number;
    height: number;

    constructor(isox: number, isoy: number, tileType: number, tileSize: Vector, height = 0) {

        this._tileSize = tileSize;

        this._isoPosition = new Vector(isox, isoy);
        this._position = i2c(this._isoPosition, this._tileSize);
        this._tileType = tileType;
        this.height = height;

    }
}


