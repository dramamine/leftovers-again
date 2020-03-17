// Type definitions for leftovers-again
// Project: https://github.com/dramamine/leftoers-again
// Definitions by: Joseph Badlato <https://github.com/jbadlato>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = LeftoversAgain;
export as namespace LeftoversAgain;

declare namespace LeftoversAgain {

	class AI {
		decide(state: State, rqid: number): Decision;
		team(opponent: string): string;
	}

	class Battle {
		constructor(bid: string, connection: Connection, botpath: string);

		abbreviateState(state: State): {
			turn: any;	// TODO
			self: {
				active: {
					hp: number;
					hppct: number;
					statuses: Array<string>;
				}
			},
			opponent: {
				active: {
					hp: number;
					hppct: number;
					statuses: Array<string>;
				}
			}
		};
		decide(state: State): void;
		forfeit(): void;
		formatMessage(bid: string, choice: Choice, state: BattleState): string;	// TODO: Choice & BattleState undefined
		getHelp(): void;
		handle(type: string, message: Array<object>): void;	// TODO
		handleCant(target: string, reason: string, move: string): void;
		handleRequest(json: string): boolean;
		handleStart(): void;
		handleTeamPreview(): void;
		handleTurn(that: object): void;	// TODO
		handleWin(nick: string): void;
		lookupMonIdx(mons: Array<object>, idx: any): void; 	// TODO
		lookupMoveIdx(moves: Array<object>, idx: any): void; 	// TODO
		myBot(): object;	// TODO
	}

	class BattleStore {
		myNick: string;
		yourNick: string;

		data(): object;	// TODO
		handle(type: string, message: Array<any>): void;	// TODO
		handleDetailsChange(ident: string, species: string, hpstatus: string, reason: string): void;
		handleMove(actor: string, move: string, target: any): any;	// TODO
		handlePlayer(id: string, name: string, something: any): void;	// TODO
		handleRequest(json: string): void;
		handleSideEnd(side: string, action: string): void;
		handleSideStart(side: string, action: string): void;
		handleTurn(x: number): void;
	}

	class Challenger {	// TODO: there are two Challenger classes - with some overlapping methods
		constructor(scrappy: boolean, format: string);

		acceptable(challenge: string, accepts: string): boolean;
		requiresTeam(format: any): any;	// TODO
		cancelOutstandingChallenges(): void;
		challenge(the: string): void;
		challengeNext(): void;
		destroy(): void;
		gunzBlazing(args: any): void;	// TODO
		onBattleReport(): any;	// TODO
		onUpdateChallenges(msg: string): void;
		onUpdateUser(nick: string, status: number): void;
		onUserJoin(user: string): void;
		onUserLeave(user: string): void;
		// below only in models
		challengeSomeone(users?: Set<any>): void;	// TODO
		sendTeam(opponent: string): boolean;
		tryChallenge(opponent: any): any;	// TODO
	}

	class Connection {
		constructor();

		close(message: string): void;
		connect(): void;
		exit(): void;
		handleMessage:(msg: string): void;
		send(message: string): void;
	}

	class Decision {
		id: number | string | object;
		target: number;

		constructor(id: number | string | object, target: number);
	}

	class Interactive {
		challenge(): void;
		onLobbyEnter(): void;
		onUpdateUser(nick: any, status: any): any;	// TODO
	}

	class Listener {
		constructor();

		relay(type: string, params: Array<object>): void; 	// TODO
		subscribe(type: string, callback: () => any): void;	// TODO
		unsubscribe(type: string, callback: () => any): void;	// TODO
	}

	class Lobby {
		constructor(scrappy: boolean, format: string);

		destroy(): void;
		onUpdateUser(nick: string, status: number): void;
		onUserJoin(user: string): void;
		onUserLeave(user: string): void;
	}

	class Log {
		setLogLevel(lvl: number): void;
	}

	class Monkey extends Connection {

	}

	class MOVE extends Decision {
		constructor(id: number | string | object, target?: number);
		setMegaEvo(should: boolean): void;
		useZMove(should: boolean): void;
	}

	class Pokemon {
		constructor(ident: string, details: string);

		updateMoveList(moves: Array<any>): Array<any>;	// TODO
		addStatus(status: string): void;
		assimilate(obj: object): void;	// TODO
		data(): Pokemon;
		recordMove(move: string): void;
		removeStatus(status: string): void;
		research(spec: string): void;
		useBoost(stat: string, stage: number): void;
		useCondition(condition: string): void;
		useDetails(details: any, force: boolean): void;
	}

	class Report {
		constructor();

		data(): Array<object>; 	// TODO
		win(victor: string, store: BattleStore, matchid: string): Report;
	}

	class Side {
		constructor();

		data(): any;	// TODO
		digest(action: string): void;
		remove(action: string): void;
	}

	class SWITCH extends Decision {
		constructor(id: number | string | object, target?: number);
	}

	class Team {
		constructor(tm: Array<Pokemon> | string);

		interpretOneSmogon(the: string): Pokemon;
		interpretSmogon(the: string): Array<Pokemon>;
		packTeam(team: Array<Pokemon>): string;
		random(seed: number): object;	// TODO
		seemsValid(tm: Array<Pokemon>): boolean;
		asArray(): Array<Pokemon>;
		asUtm(): string;
	}

	class Timer {
		constructor();

		after(cb: any, seconds: number): void;	// TODO
		ping(): void;
	}

	class Typechart {
		compare(move: string, target: Array<any> | string): number;	// TODO
	}

	interface MoveData {
		accuracy: number | boolean;
		basePower: number;
		category: string;
		disabled: boolean;
		flags: {
			authentic: boolean;
			bite: boolean;
			bullet: boolean;
			canZMove: boolean;	// Docs say this is outside flags, assuming is a typo
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
		self: {

		};
		status: string;
		target: string;
		type: string;
		volatileStatus: string;
		zMove: MoveData;
	}

	interface PokemonData {
		ability: string;
		abilities: object;	// TODO
		active: boolean;
		baseAbility: string;
		baseStats: {
			atk: number;
			def: number;
			spa: number;
			spd: number;
			spe: number;
		};
		boosts: object;	// TODO
		canMegaEvo: boolean;
		canZMove: Array<object>;	// TODO
		condition: string;
		dead: boolean;
		events: Array<object>;	// TODO
		id: any;	// TODO
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

	interface State {
		self: {
			active: PokemonData | Array<PokemonData>, 
			reserve: Array<PokemonData>
		};
		opponent: {
			active: PokemonData | Array<PokemonData>,
			reserve: Array<PokemonData>
		};
		turn: any;	// TODO
		forceSwitch: boolean;
	}

	function botFinder(path: string): object;	// TODO

	function start(metadata: object, Bot: AI): object;	// TODO

}
