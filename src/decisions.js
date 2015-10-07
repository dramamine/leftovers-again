
export class MOVE {
  constructor(id, target = null) {
    this.id = id;
    this.target = target;
  }
}

export class SWITCH {
  constructor(id, target = null) {
    this.id = id;
    this.target = target;
  }
}
