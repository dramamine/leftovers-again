import { Connection } from "./connection";
import { Decision } from "./decisions";
import { PokemonData } from "./model/pokemon";

export class Battle {
  constructor(bid: string, connection: Connection, botpath: string);

  abbreviateState(
    state: State
  ): {
    turn: any; // TODO
    self: {
      active: {
        hp: number;
        hppct: number;
        statuses: Array<string>;
      };
    };
    opponent: {
      active: {
        hp: number;
        hppct: number;
        statuses: Array<string>;
      };
    };
  };
  decide(state: State): void;
  forfeit(): void;
  formatMessage(bid: string, choice: Decision, state: State): string;
  getHelp(): void;
  handle(type: string, message: Array<object>): void; // TODO
  handleCant(target: string, reason: string, move: string): void;
  handleRequest(json: string): boolean;
  handleStart(): void;
  handleTeamPreview(): void;
  handleTurn(that: object): void; // TODO
  handleWin(nick: string): void;
  lookupMonIdx(mons: Array<object>, idx: any): void; // TODO
  lookupMoveIdx(moves: Array<object>, idx: any): void; // TODO
  myBot(): object; // TODO
}

export interface State {
  self: {
    active: PokemonData | Array<PokemonData>;
    reserve: Array<PokemonData>;
  };
  opponent: {
    active: PokemonData | Array<PokemonData>;
    reserve: Array<PokemonData>;
  };
  turn: any; // TODO
  forceSwitch: boolean;
}
