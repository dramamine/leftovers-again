const util = require('./pokeutil');
const Log = require('./log');
const fs = require('fs');

/**
 * Teams: so documented.
 *
 * This class is used for creating a team and relaying it to the server.
 *
 * @see http://play.pokemonshowdown.com/teambuilder
 */
class Team {
  /**
   * Team constructor.
   *
   * @param {Array<Pokemon>|String} Either a Smogon string, or an array of
   * Pokemon data. Smogon strings are preferred; if you use an array here,
   * you're responsible for data validation and you'd better read more of this
   * file to figure out what you need.
   */
  constructor(tm) {
    if (Array.isArray(tm) && Team.seemsValid(tm)) {
      this.self = tm;
    } else if (typeof tm === 'string') {
      const team = Team.interpretSmogon(tm);
      if (Team.seemsValid(team)) {
        this.self = team;
      }
    }
  }

  /**
   * Get team value as an array.
   */
  asArray() {
    return this.self;
  }

  /**
   * Get the team as a utm message (for sending to the server).
   */
  asUtm() {
    return Team.packTeam(this.self);
  }

  /**
   * Pick a random team for the player. This is designed for situations where
   * you want to play against a 'randombattle' bot, but want to play a format
   * that requires teams. Can also be used for testing, ex. you want to play
   * random battles but with a set team.
   *
   * The file used here, randomteams.txt, is just something I compiled from
   * logging actual teams that you could get during a randombattle. Note that
   * this isn't a true representation of all the possibilities you can get from
   * a randombattle, as you can get teams that are considered invalid for
   * anythinggoes due to having weird moves / items. I removed those for better
   * compatibility.
   *
   * @param {Integer} seed  The line number to use.
   */
  static random(seed = undefined) {
    const data = fs.readFileSync(__dirname + '/data/randomteams.txt', 'utf8');
    const lines = data.split('\n');

    if (seed === undefined) {
      seed = Team._getNextSeed();
      if (!seed) {
        seed = Math.floor(Math.random() * lines.length); // eslint-disable-line
      }
    //
    }
    Log.debug('random team seed: ' + seed, lines.length);
    if (seed > lines.length) {
      throw new Error('File end reached without finding line');
    }
    return JSON.parse(lines[seed]);
  }

  /**
   * Iterate on random seeds. Doing this temporarily becuase lots of the teams
   * are not valid for anythinggoes so we want to error out and manually remove
   * them.
   */
  static _getNextSeed() {
    const data = fs.readFileSync('./tmp/lastseed', 'utf8');

    // increment
    const updated = parseInt(data, 10) + 1;
    Log.debug(`random team seed: read ${data} and am writing ${updated}`);
    if (isNaN(updated)) return null;
    fs.writeFile('./tmp/lastseed', updated);
    return data.trim();
  }

  /**
   * Some quick checks to see if this team is valid.
   * @param  {Array} tm The team array
   * @return {Boolean} True if the team seems valid; false otherwise
   */
  static seemsValid(tm) {
    let member;
    for (let i = 0; i < tm.length; i++) {
      member = tm[i];
      if (!member.name && !member.species) {
        Log.error('a pokemon didn\'t have a name or species!');
        return false;
      }
      if (!Array.isArray(member.moves)) {
        Log.error('property \'moves\' must be an array of move names.');
        return false;
      }
      if (member.moves.length > 4) {
        Log.error('more moves than I expected.');
        return false;
      }
    }
    return true;
  }

  /**
   * Interpret a Smogon team.
   *
   * @param {String}  The Smogon team string, like you see on forums and
   * Smogon pages and whatnot.
   * @return {Array<Pokemon>}  An array of Pokemon-lookin' objects.
   */
  static interpretSmogon(str) {
    const mons = str.split('\n\n');
    const team = [];
    mons.forEach((lines) => {
      const mon = Team.interpretOneSmogon(lines);
      if (mon.species) {
        team.push(mon);
      }
    });
    return team;
  }

  /**
   * Interpret one Smogon-mon.
   *
   * @param {String}  The Smogon string, like you see on forums and
   * Smogon pages and whatnot.
   * @return {Pokemon}  A Pokemon-lookin' object. Has properties such as
   * ability, evs, moves, ivs, shiny, happiness, nature, gender, species, name,
   * and item.
   */
  static interpretOneSmogon(str) {
    const mon = {
      moves: []
    };
    const lines = str.split('\n');
    let line;
    for (let i = 0; i < lines.length; i++) {
      line = lines[i].trim();
      if (!line) continue;
      if (line.indexOf('Ability:') === 0) {
        mon.ability = line.replace('Ability:', '').trim();
      } else if (line.indexOf('EVs:') === 0) {
        mon.evs = {};
        const evs = line.replace('EVs:', '').split('/');

        let numAndLabel;
        let evLabel;
        evs.forEach((ev) => { // eslint-disable-line
          numAndLabel = ev.trim().split(' ');
          evLabel = numAndLabel[1].trim().toLowerCase();
          if (['hp', 'atk', 'def',  'spa', 'spd', 'spe'].indexOf(evLabel) === -1) {
            console.error('something weird with ev label', evLabel, line);
          } else {
            mon.evs[evLabel] = parseInt(numAndLabel[0].trim(), 10);
          }
        });
      } else if (line.indexOf('IVs:') === 0) {
        mon.ivs = {};
        const ivs = line.replace('IVs:', '').split('/');

        let numAndLabel;
        let ivLabel;
        ivs.forEach((iv) => { // eslint-disable-line
          numAndLabel = iv.trim().split(' ');
          ivLabel = numAndLabel[1].trim().toLowerCase();
          if (!['hp', 'atk', 'def',  'spa', 'spd', 'spe'].indexOf(ivLabel) === -1) {
            Log.warn('something weird with iv label', ivLabel, line);
          } else {
            mon.ivs[ivLabel] = parseInt(numAndLabel[0].trim(), 10);
          }
        });
      } else if (line.indexOf('-') === 0) {
        mon.moves.push(line.replace('-', '').trim());
      } else if (line.indexOf('Shiny: Y') === 0) {
        mon.shiny = true;
      } else if (line.indexOf('Level:') === 0) {
        mon.level = parseInt(line.replace('Level:', '').trim(), 10);
      } else if (line.indexOf('Happiness:') === 0) {
        mon.happiness = parseInt(line.replace('Happiness:', '').trim(), 10);
      } else if (line.indexOf('Nature') > 0) {
        mon.nature = line.replace('Nature', '').trim();
      } else if (line.length > 0 && !mon.species) {
        let nameAndGender = line;
        if (line.indexOf('@') > 0) {
          const splitLine = line.split('@');
          nameAndGender = splitLine[0].trim();
          mon.item = splitLine[1].trim();
        }
        if (nameAndGender.indexOf('(M)') > 0) {
          mon.gender = 'M';
          nameAndGender = nameAndGender.replace('(M)', '');
        } else if (nameAndGender.indexOf('(F)') > 0) {
          mon.gender = 'F';
          nameAndGender = nameAndGender.replace('(F)', '');
        }
        const nicknames = nameAndGender.match(/\((.+)\)/);
        if (nicknames) {
          mon.name = nameAndGender.split(' (')[0];
          mon.species = nicknames[1];
        } else {
          mon.species = nameAndGender.trim();
        }
      }
    }
    return mon;
  }
  /**
   * Turn a Pokemon team into a string to send to the server.

   * Code transformed from Pokemon-Showdown tools.js
   *
   * @param  {Array<Pokemon>} team  The team array.
   * @return {String}  A string to send to the server.
   */
  static packTeam(team) {
    if (!team) return '';

    let buf = '';

    for (let i = 0; i < team.length; i++) {
      const set = team[i];
      if (buf) {
        buf += ']';
      }

      // name
      buf += set.name || '';

      const id = util.toId(set.species || set.name);

      buf += '|' + id;

      // item
      buf += '|' + util.toId(set.item);

      // ability
      const abilities = (set.abilities)
        ? set.abilities
        : util.researchPokemonById(id).abilities;

      // @TODO
      // suspicious of this. what if we just sent 'id' instead of these 0,1,H shortcuts?
      const ability = util.toId(set.ability);
      if (abilities) {
        if (ability === util.toId(abilities['0'])) {
          buf += '|';
        } else if (ability === util.toId(abilities['1'])) {
          buf += '|1';
        } else if (ability === util.toId(abilities['H'])) { // eslint-disable-line
          buf += '|H';
        } else {
          buf += '|' + ability;
        }
      } else {
        buf += '|' + ability;
      }

      // moves
      buf += '|' + set.moves.map(util.toId).join(',');

      // nature
      buf += '|' + (set.nature || 'Serious');

      // evs
      let evs = '|';
      if (set.evs) {
        evs = '|' + (set.evs.hp || '') +
          ',' + (set.evs.atk || '') +
          ',' + (set.evs.def || '') +
          ',' + (set.evs.spa || '') +
          ',' + (set.evs.spd || '') +
          ',' + (set.evs.spe || '');
      }
      if (evs === '|,,,,,') {
        buf += '|';
      } else {
        buf += evs;
      }

      // gender
      if (set.gender && set.gender !== util.researchPokemonById(id).gender) {
        buf += '|' + set.gender;
      } else {
        buf += '|';
      }

      // ivs
      let ivs = '|';
      if (set.ivs) {
        ivs = '|' + (set.ivs.hp === 31 || set.ivs.hp === undefined ? '' : set.ivs.hp) +
        ',' + (set.ivs.atk === 31 || set.ivs.atk === undefined ? '' : set.ivs.atk) +
        ',' + (set.ivs.def === 31 || set.ivs.def === undefined ? '' : set.ivs.def) +
        ',' + (set.ivs.spa === 31 || set.ivs.spa === undefined ? '' : set.ivs.spa) +
        ',' + (set.ivs.spd === 31 || set.ivs.spd === undefined ? '' : set.ivs.spd) +
        ',' + (set.ivs.spe === 31 || set.ivs.spe === undefined ? '' : set.ivs.spe);
      }
      if (ivs === '|,,,,,') {
        buf += '|';
      } else {
        buf += ivs;
      }

      // shiny
      if (set.shiny) {
        buf += '|S';
      } else {
        buf += '|';
      }

      // level
      if (set.level && set.level !== 100) {
        buf += '|' + set.level;
      } else {
        buf += '|';
      }

      // happiness
      if (set.happiness !== undefined && set.happiness !== 255) {
        buf += '|' + set.happiness;
      } else {
        buf += '|';
      }
    }
    return buf;
  }
}

module.exports = Team;
