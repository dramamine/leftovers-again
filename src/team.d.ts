import { Pokemon } from "./model/pokemon";

export class Team {
  constructor(tm: Array<Pokemon> | string);

  interpretOneSmogon(the: string): Pokemon;
  interpretSmogon(the: string): Array<Pokemon>;
  packTeam(team: Array<Pokemon>): string;
  random(seed: number): object; // TODO
  seemsValid(tm: Array<Pokemon>): boolean;
  asArray(): Array<Pokemon>;
  asUtm(): string;
}
