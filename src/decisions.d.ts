export class Decision {
    id: number | string | object;
    target: number;

    constructor(id: number | string | object, target: number);
}

export 	class MOVE extends Decision {
    constructor(id: number | string | object, target?: number);
    setMegaEvo(should: boolean): void;
    useZMove(should: boolean): void;
}

export class SWITCH extends Decision {
    constructor(id: number | string | object, target?: number);
}