export class Lobby {
  constructor(scrappy: boolean, format: string);

  destroy(): void;
  onUpdateUser(nick: string, status: number): void;
  onUserJoin(user: string): void;
  onUserLeave(user: string): void;
}
