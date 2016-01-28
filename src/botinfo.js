
class BotInfo {
  constructor(path) {
    this.path = path;
    this.metadata = {};

    // metadata location
    try {
      const pkg = path + '/package.json';
      this.metadata = require(pkg);
    } catch (e) {
      // nested try-catch, u mad brah?
      try {
        // just load the bot and hope it has all these metadata functions
        console.log('trying to load this:', path);
        const it = require(path);
        this.metadata = new it().meta;
        console.log('saving metadata:', this.metadata);
      } catch(x) {
        console.error('No metadata found! Expected to find the file in node_path '
         + path);
      }
    }
  }

  get version() {
    return this.metadata.version;
  }

  get format() {
    return this.metadata.format;
  }
  get accepts() {
    return this.metadata.accepts;
  }
  get team() {
    return this.metadata.team || null;
  }
  getTeam(x) { // @TODO
    return this.metadata.team;
  }
}

export default BotInfo;
