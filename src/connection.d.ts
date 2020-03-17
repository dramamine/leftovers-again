export class Connection {
    constructor();

    close(message: string): void;
    connect(): void;
    exit(): void;
    handleMessage(msg: string): void;
    send(message: string): void;
}