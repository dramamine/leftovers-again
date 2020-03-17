class Pokemon {
  constructor(ident: string, details: string);

  updateMoveList(moves: Array<any>): Array<any>; // TODO
  addStatus(status: string): void;
  assimilate(obj: object): void; // TODO
  data(): Pokemon;
  recordMove(move: string): void;
  removeStatus(status: string): void;
  research(spec: string): void;
  useBoost(stat: string, stage: number): void;
  useCondition(condition: string): void;
  useDetails(details: any, force: boolean): void;
}

export interface MoveData {
  accuracy: number | boolean;
  basePower: number;
  category: string;
  disabled: boolean;
  flags: {
    authentic: boolean;
    bite: boolean;
    bullet: boolean;
    canZMove: boolean; // Docs say this is outside flags, assuming is a typo
    charge: boolean;
    contact: boolean;
    defrost: boolean;
    distance: boolean;
    gravity: boolean;
    heal: boolean;
    mirror: boolean;
    nonsky: boolean;
    powder: boolean;
    protect: boolean;
    pulse: boolean;
    punch: boolean;
    recharge: boolean;
    reflectable: boolean;
    snatch: boolean;
    sound: boolean;
  };
  id: string;
  name: string;
  priority: number;
  self: {};
  status: string;
  target: string;
  type: string;
  volatileStatus: string;
  zMove: MoveData;
}

export interface PokemonData {
  ability: string;
  abilities: object; // TODO
  active: boolean;
  baseAbility: string;
  baseStats: {
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  boosts: object; // TODO
  canMegaEvo: boolean;
  canZMove: Array<object>; // TODO
  condition: string;
  dead: boolean;
  events: Array<object>; // TODO
  id: any; // TODO
  gender: string;
  hp: number;
  hppct: number;
  level: number;
  maxhp: number;
  moves: Array<MoveData>;
  nature: string;
  owner: string;
  position: string;
  prevMoves: Array<string>;
  types: Array<string>;
  seenMoves: Array<string>;
  species: string;
  stats: {
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  statuses: Array<string>;
  weightkg: number;
}
