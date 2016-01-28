
class Bot {
  constructor(path) {
    this.path = path;
    this.metadata = {};

    // metadata location
    try {
      const pkg = path + '/package.json';
      this.metadata = require(pkg);
    } catch (e) {
      console.error('No metadata found! Expected to find the file in node_path '
       + path);
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
  getTeam(x) {
    return this.team;
  }
}

export default Bot;
