// import { BaseState } from './base.state';
// import { gameStateMachine } from '@/game-state-machine';
// import { gameState } from './game.state';
// import { Button } from '@/core/button';
// import { menu2State } from './menu.state copy';


// const def = { w: 350, h: 120 };
// const buttonProps = { x: 0, y: 0, w: def.w, h: def.h };

// class PauseState extends BaseState {

//   onEnter() {

//     this.menuButtons = [];

//     const resume = new Button(buttonProps, 'RESUME', "", 100);
//     resume.clickAction = () => {
//       // gameStateMachine.setState(nfzGameState);
//       gameStateMachine.setState(gameState);
//     };
//     this.menuButtons.push(resume);


//     const back = new Button(buttonProps, 'Exit', "", 100);
//     back.clickAction = () => {
//       gameStateMachine.setState(menu2State);
//     };
//     this.menuButtons.push(back);

//     // Call super after button created
//     super.onEnter();


//   }

//   onUpdate(dt:number) {
//     super.onUpdate(dt);
//   }

// }

// export const pauseState = new PauseState();
