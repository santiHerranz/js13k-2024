import { soundWaitTime } from '@/game-states/game-config.js';
import zzfx from './zzfx.js';

export const sound = (s: (number | undefined)[]) => {
  // console.log('sound');
  // if (!soundWaitTime.elapsed()) return;
  zzfx(...s);
  soundWaitTime.set(.05);
};
