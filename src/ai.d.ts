import { Decision } from "./decisions";
import { State } from "./battle";

export class AI {
  decide(state: State, rqid: number): Decision;
  team(opponent: string): string;
}
