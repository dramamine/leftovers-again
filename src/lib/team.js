import util from '../util';

export default class Team {
  constructor(tm) {
    if (Array.isArray(tm) && _seemsValid(tm)) {
      this.self = tm;
    }
  }

  asArray() {
    return self;
  }

  asUtm() {

  }

  // probably won't need this ever...
  asSmogon() {

  }

  /**
   *
   * @param  {Array} tm The team array
   * @return bool True if the team seems valid; false otherwise
   */
  static _seemsValid(tm) {
    console.log(tm);
    let member;
    for (let i = 0; i < tm.length; i++) {
      member = tm[i];
      console.log(member.name, member.species);
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

  interpretSmogon(smogon) {

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

      set.id = util.toId(set.name || set.species);
      console.log('using id', set.id, set.name, set.species);

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
        : util.researchPokemonById(set.id).abilities;

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

      console.log('gender: ', set.gender);
      // gender
      if (set.gender && set.gender !== util.researchPokemonById(set.id).gender) {
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
