import { BaseState } from './base.state';
import { gameStateMachine } from '@/game-state-machine';
import { drawEngine } from '@/core/draw-engine';
import { Button } from '@/core/button';
import { lerp } from '@/utils';
import { GameConfig } from '../game/game-config';
import { menuState } from './menu.state';


class FinalState extends BaseState {

  private canvas: HTMLElement | null = document.getElementById('c2d');


  result = { title: '', status: 0, icon: '', color: '#ccc',kills: 0, score: 0 };

  onEnter() {

    this.color = this.result.color;

    this.menuButtons = [];

    const back = new Button({ x: 0, y: 0, w: 600, h: 150 }, 'Continue');
    back.clickAction = () => {
      gameStateMachine.setState(menuState);
    };
    this.menuButtons.push(back);

    // Call super after button created
    super.onEnter();

    if (this.result.status == 1)
      this.win();
    else
      this.lose();
  }

  win() {
    this.result.title = `Victory!`;
    this.result.icon = '✅';
    this.result.color = 'yellow';
  }

  lose() {
    this.result.title = `Defeated!`;
    this.result.icon = '❌';
    this.result.color = '#D1001F';
  }


  private spin = 15;
  private currentAcc = .0001;

  onBackground() {
    if (this.result.status == 1)
      this.canvas!.setAttribute('style', getEffect(this.spin, '#0ac'));
    else 
      this.canvas!.setAttribute('style', getEffect(this.spin, '#212427'));


    function getEffect(spin: number, color: string): string {
      return 'background: repeating-conic-gradient(hsla(0,0%,100%,.2) ' + spin.toFixed(2)  + 'deg ' + (spin + 15).toFixed(2) + 'deg, hsla(0,0%,100%,0) ' + spin.toFixed(2)  + 'deg ' + (spin + 30).toFixed(2)  + 'deg ) ' + color + '';
    }
  }

  onLeave(dt: number): void {
    if (this.result.status == 1 && GameConfig.levelCurrentIndex + 1 < GameConfig.levelEnemyCount.length ) {
      GameConfig.levelIndexUnlocked.push(++GameConfig.levelCurrentIndex);
      // TODO
      // GameConfig.levelGoalIndexUnlocked[GameConfig.levelCurrentIndex].push(++GameConfig.levelGoalCurrentIndex);
    }
  }

  onUpdate(dt: number) {

    this.spinControl(dt);

    super.onUpdate(dt);

    const refY = drawEngine.canvasHeight * .3;
    let row = 0, rowHeight = 80;

    drawEngine.drawText(this.result.title, 200, drawEngine.canvasWidth / 2, refY + rowHeight * row++, this.result.color, 'center');
    row+=2;
    // drawEngine.drawText(`Level ` + (GameConfig.levelCurrentIndex + 1), 60, drawEngine.canvasWidth / 2, refY + rowHeight * row++, 'white', 'center');
    drawEngine.drawText("Destroy "+ GameConfig.levelEnemyCount[GameConfig.levelCurrentIndex] +" enemies " + this.result.icon, 60, drawEngine.canvasWidth / 2, refY + rowHeight * row++, 'white', 'center');
    drawEngine.drawText('Killed ' + this.result.kills, 60, drawEngine.canvasWidth / 2, refY + rowHeight * row++, 'white', 'center');
    drawEngine.drawText('Scored +' + this.result.score, 60, drawEngine.canvasWidth / 2, refY + rowHeight * row++, 'white', 'center');
    // drawEngine.drawText(`Coins +135`, 60, drawEngine.canvasWidth / 2, refY + rowHeight * row++, 'white', 'center');
    row+=3;

    super.menuRender(refY + rowHeight * row);

  }

  private spinControl(dt: number) {
    this.currentAcc = lerp(this.currentAcc, 100, -.005);
    this.currentAcc = Math.max(-100, this.currentAcc);
    this.spin -= dt / this.currentAcc;
    if (this.spin > 30) 
      this.spin = 0;

  }


}

export const finalState = new FinalState();
