import { BattleStore } from "./model/battlestore";

export class Report {
  constructor();

  data(): Array<object>; // TODO
  win(victor: string, store: BattleStore, matchid: string): Report;
}
