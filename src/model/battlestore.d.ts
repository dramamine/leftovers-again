export class BattleStore {
  myNick: string;
  yourNick: string;

  data(): object; // TODO
  handle(type: string, message: Array<any>): void; // TODO
  handleDetailsChange(
    ident: string,
    species: string,
    hpstatus: string,
    reason: string
  ): void;
  handleMove(actor: string, move: string, target: any): any; // TODO
  handlePlayer(id: string, name: string, something: any): void; // TODO
  handleRequest(json: string): void;
  handleSideEnd(side: string, action: string): void;
  handleSideStart(side: string, action: string): void;
  handleTurn(x: number): void;
}
