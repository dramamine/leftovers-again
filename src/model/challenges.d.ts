export class Challenger {
  // TODO: there are two Challenger classes - with some overlapping methods
  constructor(scrappy: boolean, format: string);

  acceptable(challenge: string, accepts: string): boolean;
  requiresTeam(format: any): any; // TODO
  cancelOutstandingChallenges(): void;
  challenge(the: string): void;
  challengeNext(): void;
  destroy(): void;
  gunzBlazing(args: any): void; // TODO
  onBattleReport(): any; // TODO
  onUpdateChallenges(msg: string): void;
  onUpdateUser(nick: string, status: number): void;
  onUserJoin(user: string): void;
  onUserLeave(user: string): void;
  // below only in models
  challengeSomeone(users?: Set<any>): void; // TODO
  sendTeam(opponent: string): boolean;
  tryChallenge(opponent: any): any; // TODO
}
