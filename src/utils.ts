import { Vector } from "./core/vector";
import { time } from "./index";


export function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}


/**
 * 
 * @param pt Interactive to canvas
 * @returns 
 */
export var i2c = (pt: Vector, size: Vector) => {
    var cartPt = new Vector(0, 0);
    cartPt.x = pt.x * size.x;
    cartPt.y = pt.y * size.y ;
    return cartPt;
  };
  
  /**
   * Canvas to Interactive
   * @param pt 
   * @returns 
   */
  export var c2i = (pt: Vector, size: Vector) => {
    var map = new Vector(0,0);
    map.x = pt.x / size.x;
    map.y = pt.y / size.y;
    return map;
  };
  

  export  function randInt( min=0, max=0 ) {
    return Math.floor(Math.random() * (max - min) + min);
  };


  export  var rand = ( min=1, max=0 ) => {
    return Math.random() * ( max - min ) + min;
  };

 export const PI = Math.PI;

  
const ASSERT = (value:boolean) => {};

const clamp = (v: number, max = 1, min = 0) => (ASSERT(max > min), v < min ? min : v > max ? max : v);
const percent = (v: number, max = 1, min = 0) => max - min ? clamp((v - min) / (max - min)) : 0;

// Sin rebotes
// export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
//   func: F,
//   waitFor: number,
// ) => {
//   let timeout: NodeJS.Timeout;
//   console.log('debounce - waitFor: ' + waitFor);

//   const debounced = (...args: Parameters<F>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), waitFor);
//   };

//   return debounced;
// };

// export const debounce = ( fn: (...params: any[]) => any, delay: number, context: any) => {
//   let timer:  NodeJS.Timeout | undefined = undefined;
//   return function (...args: any[]) {
//     if (timer)
//       clearTimeout(timer);
//     timer = setTimeout(() => fn.apply(context, args), delay);
//     return timer;
//   };
// };

// export function debounce<T extends (...args: any[]) => void>(
//   wait: number,
//   callback: T,
//   immediate = false,
// )  {
//   // This is a number in the browser and an object in Node.js,
//   // so we'll use the ReturnType utility to cover both cases.
//   let timeout: ReturnType<typeof setTimeout> | null;

//   return function <U>(this: U, ...args: Parameters<typeof callback>) {
//     const context = this;
//     const later = () => {
//       timeout = null;

//       if (!immediate) {
//         callback.apply(context, args);
//       }
//     };
//     const callNow = immediate && !timeout;

//     if (typeof timeout === "number") {
//       clearTimeout(timeout);
//     }

//     timeout = setTimeout(later, wait);

//     if (callNow) {
//       callback.apply(context, args);
//     }
//   };
// }


export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const later = () => {
      timeout = undefined;
      if (!immediate) callback.apply(this, args);
    };

    const callNow = immediate && timeout === undefined;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) callback.apply(this, args);
  };
}


class Timer {

    time: number | undefined;
  setTime: number | undefined;

    constructor(timeLeft: number | undefined) {
        this.time = timeLeft == undefined ? undefined : time + timeLeft;
        this.setTime = timeLeft;
    }

    elapsedAction: Function | undefined;

    set(timeLeft = 0) {
        this.time = time + timeLeft;
        this.setTime = timeLeft;
    }
    unset() {
        this.time = undefined;
    }
    isSet() {
        return this.time != undefined;
    }
    active() {
      if (this.time == undefined) return false;
        return time <= this.time;
    } // is set and has no time left
    elapsed() {
      if (this.time == undefined) return false;
        return time > this.time;
    } // is set and has time left
    get() {
      if (this.time == undefined) return 0;
        return this.isSet() ? time - this.time : 0;
    }
    p100() {
      if (this.time == undefined) return 0;
        return this.isSet() ? percent(this.time - time, 0, this.setTime) : 0;
    }
}

export { Timer };