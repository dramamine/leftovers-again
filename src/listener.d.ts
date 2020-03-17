export class Listener {
    constructor();

    relay(type: string, params: Array<object>): void; 	// TODO
    subscribe(type: string, callback: () => any): void;	// TODO
    unsubscribe(type: string, callback: () => any): void;	// TODO
}