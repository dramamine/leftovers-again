

class Util {
  toId(owner, species) {
    return owner + ': ' + species;
  }

  withoutPos(id) {
    return id.replace('a:', ':').replace('b:', ':').replace('c:', ':');
  }
}

const util = new Util();
export default util;
