import { Timer } from '@/utils.js';
import zzfx from './zzfx.js';

// export const soundWaitTime: Timer = new Timer(1);

export const sound = (s: (number | undefined)[]) => {
  // console.log('sound');
  // if (!soundWaitTime.elapsed()) return;
  zzfx(...s);
  // soundWaitTime.set(.05);
};
