import { TEAM_A } from "@/game-states/game.state";
import { Unit, UnitProperties } from "./unit";
import { Vector } from "@/core/vector";

export class Label extends Unit  {
  text: String = '';

  constructor(props: UnitProperties, text: string) {
    super(props, TEAM_A);
    this.text = text;

  }


}

