'use strict';

var _moves = require('pokemon-showdown/data/moves');

var _movedata = require('../deps/honko-damagecalc/js/data/movedata');

var _movedata2 = _interopRequireDefault(_movedata);

var _pokedex = require('pokemon-showdown/data/pokedex');

var _formatsData = require('pokemon-showdown/data/formats-data');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const destination = 'src/gamedata/'; /**
                                      * The data files from 'Pokemon-Showdown' have a lot of unnecessary data.
                                      * They're SO BIG that babel complains about 100kb+ file sizes.
                                      * Hopefully, nobody will miss these fields when they're gone.
                                      *
                                      * Run with:
                                      * babel-node scripts/gamedata-copier.js
                                      */

function copyMoves() {
  const updated = {};
  const keysToCopy = ['accuracy', 'basePower', 'boosts', 'category', 'drain', 'flags', 'heal', 'hits', 'id', 'name', 'priority', 'secondary', 'self', 'sideCondition', 'status', 'target', 'type', 'volatileStatus'];
  for (const key in _moves.BattleMovedex) {
    // eslint-disable-line
    const properMoveName = toId(key);
    updated[properMoveName] = {};
    keysToCopy.forEach(keyToCopy => {
      // eslint-disable-line
      updated[properMoveName][keyToCopy] = _moves.BattleMovedex[key][keyToCopy];
    });
  }

  _fs2.default.writeFile(destination + 'moves.json', JSON.stringify(updated));
}

const copyOtherMoves = () => {
  const updated = {};
  const keysToCopy = ['alwaysCrit', 'dealsPhysicalDamage', 'hasRecoil', 'hasSecondaryEffect', 'ignoresDefenseBoosts', 'isBite', 'isBullet', 'isMultihit', 'isPulse', 'isPunch', 'isSpread', 'isTwoHit', 'makesContact'];
  for (const hongosMoveName in _movedata2.default) {
    // eslint-disable-line
    const properMoveName = toId(hongosMoveName);

    keysToCopy.forEach(keyToCopy => {
      // eslint-disable-line
      if (_movedata2.default[hongosMoveName].hasOwnProperty(keyToCopy)) {
        if (!updated.hasOwnProperty(properMoveName)) {
          updated[properMoveName] = {};
        }
        updated[properMoveName][keyToCopy] = _movedata2.default[hongosMoveName][keyToCopy];
      }
    });
  }

  _fs2.default.writeFile(destination + 'moves-ext.json', JSON.stringify(updated));
};

const copyPokes = () => {
  const updated = {};
  const keysToCopy = ['abilities', 'baseStats', 'heightm', 'species', 'types', 'weightkg'];
  for (const key in _pokedex.BattlePokedex) {
    // eslint-disable-line
    updated[key] = {};
    keysToCopy.forEach(keyToCopy => {
      // eslint-disable-line
      let targetKey = keyToCopy;
      if (keyToCopy === 'heightm') targetKey = 'height';
      if (keyToCopy === 'weightkg') targetKey = 'weight';
      updated[key][targetKey] = _pokedex.BattlePokedex[key][keyToCopy];
    });
  }
  // this is misnamed in replays & causes me errors.
  if (updated.basculinbluestriped) {
    updated.basculinbluestripe = updated.basculinbluestriped;
  }
  if (updated.floetteeternalflower) {
    updated.floetteeternalflow = updated.floetteeternalflower;
  }
  _fs2.default.writeFile(destination + 'pokedex.json', JSON.stringify(updated));
};

const copyFormats = () => {
  const updated = {};
  const keysToCopy = ['randomBattleMoves', 'requiredItem'];
  for (const key in _formatsData.BattleFormatsData) {
    // eslint-disable-line
    updated[key] = {};
    keysToCopy.forEach(keyToCopy => {
      // eslint-disable-line
      updated[key][keyToCopy] = _formatsData.BattleFormatsData[key][keyToCopy];
    });
  }

  _fs2.default.writeFile(destination + 'formats.json', JSON.stringify(updated));
};

// copied from src/pokeutil, don't give an f
const toId = text => {
  let name = '';
  if (text) {
    // most lines copied from server code..
    name = ('' + text).replace(/[\|\s\[\]\,\']+/g, '').toLowerCase().trim();

    // these two are not! but I needed them.
    name = name.replace('-', '');
    name = name.replace('.', '');
    name = name.replace(' ', '');

    if (name.length > 18) name = name.substr(0, 18).trim();
  }
  return name;
};

copyMoves();
copyOtherMoves();
copyPokes();
copyFormats();