// import { BaseState } from './base.state';
// import { gameStateMachine } from '@/game-state-machine';
// import { gameState } from './game.state';
// import { Button } from '@/core/button';
// import { menuState } from './menu.state copy';


// const buttonProps = { x: 0, y: 0, w: 400, h: 150 };

// class PauseState extends BaseState {

//   onEnter() {

//     this.menuButtons = [];

//     const resume = new Button(buttonProps, 'RESUME', "");
//     resume.clickAction = () => {
//       // gameStateMachine.setState(nfzGameState);
//       gameStateMachine.setState(gameState);
//     };
//     this.menuButtons.push(resume);


//     const back = new Button(buttonProps, 'Exit', "");
//     back.clickAction = () => {
//       gameStateMachine.setState(menuState);
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
