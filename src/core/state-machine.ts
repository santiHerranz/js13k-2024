import { State } from './state';

export class StateMachine {
  private currentState: State;
  private status = 1;

  private readonly transitionTime = 400;

  constructor(initialState: State, ...enterArgs: any) {
    this.currentState = initialState;
    this.currentState.onEnter?.(...enterArgs);
  }

  setState(newState: State, ...enterArgs: any) {
    if (this.status == 0) return;
    
    setTimeout(() => {

      this.currentState.onLeave?.();
      this.currentState = newState;
      this.currentState.onEnter?.(...enterArgs);

      this.status = 1;
    }, this.transitionTime);

    this.status = 0;
  }

  getState() {
    return this.currentState;
  }
}
