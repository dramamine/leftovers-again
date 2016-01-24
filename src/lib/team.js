import util from 'pokeutil';

export default class Team {
  constructor(tm) {
    if (Array.isArray(tm) && Team._seemsValid(tm)) {
      this.self = tm;
    } else if (typeof tm === 'string') {
      const team = Team.interpretSmogon(tm);
      if (Team._seemsValid(team)) {
        this.self = team;
      }
    }
  }

  asArray() {
    return this.self;
  }

  asUtm() {
    return Team.packTeam(this.self);
  }

  /**
   *
   * @param  {Array} tm The team array
   * @return bool True if the team seems valid; false otherwise
   */
  static _seemsValid(tm) {
    let member;
    for (let i = 0; i < tm.length; i++) {
      member = tm[i];
      if (!member.name && !member.species) {
        console.error('a pokemon didn\'t have a name or species!');
        return false;
      }
      if (!Array.isArray(member.moves)) {
        console.error('property \'moves\' must be an array of move names.');
        return false;
      }
      if (member.moves.length > 4) {
        console.error('more moves than I expected.');
        return false;
      }
    }
    return true;
  }

  static interpretSmogon(str) {
    const mons = str.split('\n\n');
    const team = [];
    mons.forEach( (mon) => {
      team.push( Team.interpretOneSmogon(mon) );
    });
    return team;
  }
  static interpretOneSmogon(str) {
    const mon = {
      moves: []
    };
    const lines = str.split('\n');
    let line;
    for (let i = 0; i < lines.length; i++) {
      line = lines[i].trim();
      if (line.indexOf('Ability:') === 0) {
        mon.ability = line.replace('Ability:', '').trim();
      } else if (line.indexOf('EVs:') === 0) {
        mon.evs = {};
        const evs = line.replace('EVs:', '').split('/');

        let numAndLabel;
        let evLabel;
        evs.forEach( (ev) => { // eslint-disable-line
          numAndLabel = ev.trim().split(' ');
          evLabel = numAndLabel[1].trim().toLowerCase();
          if (['hp', 'spa', 'spd', 'spe', 'atk', 'def'].indexOf(evLabel) === -1) {
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
        ivs.forEach( (iv) => { // eslint-disable-line
          numAndLabel = iv.trim().split(' ');
          ivLabel = numAndLabel[1].trim().toLowerCase();
          if (!['hp', 'spa', 'spd', 'spe', 'atk', 'def'].indexOf(ivLabel)) {
            console.error('something weird with iv label', ivLabel, line);
          } else {
            mon.ivs[ivLabel] = parseInt(numAndLabel[0].trim(), 10);
          }
        });
      } else if (line.indexOf('-') === 0) {
        mon.moves.push(line.replace('-', '').trim());
      } else if (line.indexOf('Shiny: Y') === 0) {
        mon.shiny = true;
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
          console.log(nicknames);
          mon.name = nameAndGender.split(' (')[0];
          mon.species = nicknames[1];
          console.log(mon);
        } else {
          mon.species = nameAndGender.trim();
        }

      }
    }
    return mon;
  }
  /**
   * Code transformed from Pokemon-Showdown tools.js
   *
   * @param  {[type]} team [description]
   * @return {[type]}      [description]
   */
  static packTeam(team) {
    if (!team) return '';

    let buf = '';

    for (let i = 0; i < team.length; i++) {
      const set = team[i];
      if (buf) buf += ']';

      // name
      buf += (set.name || set.species);

      const id = util.toId(set.name || set.species);
      // console.log('using id', set.id, set.name, set.species);

      // species
      let name = '';
      if (set.name && set.species && util.toId(set.species) !== util.toId(set.name)) {
        name = set.name;
      }
      buf += '|' + name;

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
      buf += '|' + set.nature;

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

  // Tools.prototype.fastUnpackTeam = function (buf) {
  //   if (!buf) return null;

  //   var team = [];
  //   var i = 0, j = 0;

  //   // limit to 24
  //   for (var count = 0; count < 24; count++) {
  //     var set = {};
  //     team.push(set);

  //     // name
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     set.name = buf.substring(i, j);
  //     i = j + 1;

  //     // species
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     set.species = buf.substring(i, j) || set.name;
  //     i = j + 1;

  //     // item
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     set.item = buf.substring(i, j);
  //     i = j + 1;

  //     // ability
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     var ability = buf.substring(i, j);
  //     var template = moddedTools.base.getTemplate(set.species);
  //     set.ability = (template.abilities && ability in {'':1, 0:1, 1:1, H:1} ? template.abilities[ability || '0'] : ability);
  //     i = j + 1;

  //     // moves
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     set.moves = buf.substring(i, j).split(',');
  //     i = j + 1;

  //     // nature
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     set.nature = buf.substring(i, j);
  //     i = j + 1;

  //     // evs
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     if (j !== i) {
  //       var evs = buf.substring(i, j).split(',');
  //       set.evs = {
  //         hp: Number(evs[0]) || 0,
  //         atk: Number(evs[1]) || 0,
  //         def: Number(evs[2]) || 0,
  //         spa: Number(evs[3]) || 0,
  //         spd: Number(evs[4]) || 0,
  //         spe: Number(evs[5]) || 0
  //       };
  //     }
  //     i = j + 1;

  //     // gender
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     if (i !== j) set.gender = buf.substring(i, j);
  //     i = j + 1;

  //     // ivs
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     if (j !== i) {
  //       var ivs = buf.substring(i, j).split(',');
  //       set.ivs = {
  //         hp: ivs[0] === '' ? 31 : Number(ivs[0]) || 0,
  //         atk: ivs[1] === '' ? 31 : Number(ivs[1]) || 0,
  //         def: ivs[2] === '' ? 31 : Number(ivs[2]) || 0,
  //         spa: ivs[3] === '' ? 31 : Number(ivs[3]) || 0,
  //         spd: ivs[4] === '' ? 31 : Number(ivs[4]) || 0,
  //         spe: ivs[5] === '' ? 31 : Number(ivs[5]) || 0
  //       };
  //     }
  //     i = j + 1;

  //     // shiny
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     if (i !== j) set.shiny = true;
  //     i = j + 1;

  //     // level
  //     j = buf.indexOf('|', i);
  //     if (j < 0) return;
  //     if (i !== j) set.level = parseInt(buf.substring(i, j), 10);
  //     i = j + 1;

  //     // happiness
  //     j = buf.indexOf(']', i);
  //     if (j < 0) {
  //       if (buf.substring(i)) {
  //         set.happiness = Number(buf.substring(i));
  //       }
  //       break;
  //     }
  //     if (i !== j) set.happiness = Number(buf.substring(i, j));
  //     i = j + 1;
  //   }

  //   return team;
  // };
