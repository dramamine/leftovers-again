import { Decision } from "./decisions";

export class AI {
    decide(state: State, rqid: number): Decision;
    team(opponent: string): string;
}
  