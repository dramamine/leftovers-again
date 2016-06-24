'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pokeutil = require('./pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Teams: so documented.
 *
 * This class is used for creating a team and relaying it to the server.
 *
 * @see http://play.pokemonshowdown.com/teambuilder
 */

var Team = function () {
  /**
   * Team constructor.
   *
   * @param {Array<Pokemon>|String} Either a Smogon string, or an array of
   * Pokemon data. Smogon strings are preferred; if you use an array here,
   * you're responsible for data validation and you'd better read more of this
   * file to figure out what you need.
   */

  function Team(tm) {
    _classCallCheck(this, Team);

    if (Array.isArray(tm) && Team._seemsValid(tm)) {
      this.self = tm;
    } else if (typeof tm === 'string') {
      var team = Team.interpretSmogon(tm);
      if (Team._seemsValid(team)) {
        this.self = team;
      }
    }
  }

  /**
   * Get team value as an array.
   */


  _createClass(Team, [{
    key: 'asArray',
    value: function asArray() {
      return this.self;
    }

    /**
     * Get the team as a utm message (for sending to the server).
     */

  }, {
    key: 'asUtm',
    value: function asUtm() {
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

  }], [{
    key: 'random',
    value: function random() {
      var seed = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

      var data = _fs2.default.readFileSync(__dirname + '/data/randomteams.txt', 'utf8');
      var lines = data.split('\n');

      if (seed === undefined) {
        seed = Team._getNextSeed();
        if (!seed) {
          seed = Math.floor(Math.random() * lines.length); // eslint-disable-line
        }
        //
      }
      _log2.default.debug('random team seed: ' + seed, lines.length);
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

  }, {
    key: '_getNextSeed',
    value: function _getNextSeed() {
      var data = _fs2.default.readFileSync('./tmp/lastseed', 'utf8');

      // increment
      var updated = parseInt(data, 10) + 1;
      _log2.default.debug('random team seed: read ' + data + ' and am writing ' + updated);
      if (isNaN(updated)) return null;
      _fs2.default.writeFile('./tmp/lastseed', updated);
      return data.trim();
    }

    /**
     * Some quick checks to see if this team is valid.
     * @param  {Array} tm The team array
     * @return {Boolean} True if the team seems valid; false otherwise
     */

  }, {
    key: '_seemsValid',
    value: function _seemsValid(tm) {
      var member = void 0;
      for (var i = 0; i < tm.length; i++) {
        member = tm[i];
        if (!member.name && !member.species) {
          _log2.default.error('a pokemon didn\'t have a name or species!');
          return false;
        }
        if (!Array.isArray(member.moves)) {
          _log2.default.error('property \'moves\' must be an array of move names.');
          return false;
        }
        if (member.moves.length > 4) {
          _log2.default.error('more moves than I expected.');
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

  }, {
    key: 'interpretSmogon',
    value: function interpretSmogon(str) {
      var mons = str.split('\n\n');
      var team = [];
      mons.forEach(function (lines) {
        var mon = Team.interpretOneSmogon(lines);
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

  }, {
    key: 'interpretOneSmogon',
    value: function interpretOneSmogon(str) {
      var mon = {
        moves: []
      };
      var lines = str.split('\n');
      var line = void 0;
      for (var i = 0; i < lines.length; i++) {
        line = lines[i].trim();
        if (!line) continue;
        if (line.indexOf('Ability:') === 0) {
          mon.ability = line.replace('Ability:', '').trim();
        } else if (line.indexOf('EVs:') === 0) {
          (function () {
            mon.evs = {};
            var evs = line.replace('EVs:', '').split('/');

            var numAndLabel = void 0;
            var evLabel = void 0;
            evs.forEach(function (ev) {
              // eslint-disable-line
              numAndLabel = ev.trim().split(' ');
              evLabel = numAndLabel[1].trim().toLowerCase();
              if (['hp', 'spa', 'spd', 'spe', 'atk', 'def'].indexOf(evLabel) === -1) {
                console.error('something weird with ev label', evLabel, line);
              } else {
                mon.evs[evLabel] = parseInt(numAndLabel[0].trim(), 10);
              }
            });
          })();
        } else if (line.indexOf('IVs:') === 0) {
          (function () {
            mon.ivs = {};
            var ivs = line.replace('IVs:', '').split('/');

            var numAndLabel = void 0;
            var ivLabel = void 0;
            ivs.forEach(function (iv) {
              // eslint-disable-line
              numAndLabel = iv.trim().split(' ');
              ivLabel = numAndLabel[1].trim().toLowerCase();
              if (!['hp', 'spa', 'spd', 'spe', 'atk', 'def'].indexOf(ivLabel)) {
                _log2.default.warn('something weird with iv label', ivLabel, line);
              } else {
                mon.ivs[ivLabel] = parseInt(numAndLabel[0].trim(), 10);
              }
            });
          })();
        } else if (line.indexOf('-') === 0) {
          mon.moves.push(line.replace('-', '').trim());
        } else if (line.indexOf('Shiny: Y') === 0) {
          mon.shiny = true;
        } else if (line.indexOf('Happiness:') === 0) {
          mon.happiness = parseInt(line.replace('Happiness:', '').trim(), 10);
        } else if (line.indexOf('Nature') > 0) {
          mon.nature = line.replace('Nature', '').trim();
        } else if (line.length > 0 && !mon.species) {
          var nameAndGender = line;
          if (line.indexOf('@') > 0) {
            var splitLine = line.split('@');
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
          var nicknames = nameAndGender.match(/\((.+)\)/);
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

  }, {
    key: 'packTeam',
    value: function packTeam(team) {
      if (!team) return '';

      var buf = '';

      for (var i = 0; i < team.length; i++) {
        var set = team[i];
        if (buf) buf += ']';

        // name
        buf += set.name || '';

        var id = _pokeutil2.default.toId(set.species);

        buf += '|' + id;

        // item
        buf += '|' + _pokeutil2.default.toId(set.item);

        // ability
        var abilities = set.abilities ? set.abilities : _pokeutil2.default.researchPokemonById(id).abilities;

        // @TODO
        // suspicious of this. what if we just sent 'id' instead of these 0,1,H shortcuts?
        var ability = _pokeutil2.default.toId(set.ability);
        if (abilities) {
          if (ability === _pokeutil2.default.toId(abilities['0'])) {
            buf += '|';
          } else if (ability === _pokeutil2.default.toId(abilities['1'])) {
            buf += '|1';
          } else if (ability === _pokeutil2.default.toId(abilities['H'])) {
            // eslint-disable-line
            buf += '|H';
          } else {
            buf += '|' + ability;
          }
        } else {
          buf += '|' + ability;
        }

        // moves
        buf += '|' + set.moves.map(_pokeutil2.default.toId).join(',');

        // nature
        buf += '|' + set.nature;

        // evs
        var evs = '|';
        if (set.evs) {
          evs = '|' + (set.evs.hp || '') + ',' + (set.evs.atk || '') + ',' + (set.evs.def || '') + ',' + (set.evs.spa || '') + ',' + (set.evs.spd || '') + ',' + (set.evs.spe || '');
        }
        if (evs === '|,,,,,') {
          buf += '|';
        } else {
          buf += evs;
        }

        // gender
        if (set.gender && set.gender !== _pokeutil2.default.researchPokemonById(id).gender) {
          buf += '|' + set.gender;
        } else {
          buf += '|';
        }

        // ivs
        var ivs = '|';
        if (set.ivs) {
          ivs = '|' + (set.ivs.hp === 31 || set.ivs.hp === undefined ? '' : set.ivs.hp) + ',' + (set.ivs.atk === 31 || set.ivs.atk === undefined ? '' : set.ivs.atk) + ',' + (set.ivs.def === 31 || set.ivs.def === undefined ? '' : set.ivs.def) + ',' + (set.ivs.spa === 31 || set.ivs.spa === undefined ? '' : set.ivs.spa) + ',' + (set.ivs.spd === 31 || set.ivs.spd === undefined ? '' : set.ivs.spd) + ',' + (set.ivs.spe === 31 || set.ivs.spe === undefined ? '' : set.ivs.spe);
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
  }]);

  return Team;
}();

exports.default = Team;