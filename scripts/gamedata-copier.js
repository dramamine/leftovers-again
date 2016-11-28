/**
 * The data files from 'Pokemon-Showdown' have a lot of unnecessary data.
 * They're SO BIG that babel complains about 100kb+ file sizes.
 * Hopefully, nobody will miss these fields when they're gone.
 *
 * Run with:
 * babel-node scripts/gamedata-copier.js
 */

import fs from 'fs';
import { BattleMovedex } from '../deps/Pokemon-Showdown/data/moves';
import DamageCalcMovedex from '../deps/honko-damagecalc/js/data/movedata';
import { BattlePokedex } from '../deps/Pokemon-Showdown/data/pokedex';
import { BattleFormatsData } from '../deps/Pokemon-Showdown/data/formats-data';

const destination = 'src/data/';

function copyMoves() {
  const updated = {};
  const keysToCopy = [
    'accuracy',
    'basePower',
    'boosts',
    'category',
    'drain',
    'flags',
    'heal',
    'hits',
    'id',
    'name',
    'priority',
    'secondary',
    'self',
    'sideCondition',
    'status',
    'target',
    'type',
    'volatileStatus',
  ];
  for (const key in BattleMovedex) { // eslint-disable-line
    const properMoveName = toId(key);
    updated[properMoveName] = {};
    keysToCopy.forEach( (keyToCopy) => { // eslint-disable-line
      updated[properMoveName][keyToCopy] = BattleMovedex[key][keyToCopy];
    });
  }

  fs.writeFile(destination + 'moves.json', JSON.stringify(updated));
}

const copyOtherMoves = () => {
  const updated = {};
  const keysToCopy = [
    'alwaysCrit',
    'dealsPhysicalDamage',
    'givesHealth',
    'hasRecoil',
    'hasSecondaryEffect',
    'ignoresDefenseBoosts',
    'isBite',
    'isBullet',
    'isMultihit',
    'isPulse',
    'isPunch',
    'isSpread',
    'isTwoHit',
    'makesContact'
  ];
  for (const hongosMoveName in DamageCalcMovedex) { // eslint-disable-line
    const properMoveName = toId(hongosMoveName);

    keysToCopy.forEach( (keyToCopy) => { // eslint-disable-line
      if (DamageCalcMovedex[hongosMoveName].hasOwnProperty(keyToCopy)) {
        if (!updated.hasOwnProperty(properMoveName)) {
          updated[properMoveName] = {};
        }
        updated[properMoveName][keyToCopy] = DamageCalcMovedex[hongosMoveName][keyToCopy];
      }
    });
  }

  fs.writeFile(destination + 'moves-ext.json', JSON.stringify(updated));
};


const copyPokes = () => {
  const updated = {};
  const keysToCopy = [
    'abilities',
    'baseStats',
    'heightm',
    'species',
    'types',
    'weightkg'
  ];
  for (const key in BattlePokedex) { // eslint-disable-line
    updated[key] = {};
    keysToCopy.forEach( (keyToCopy) => { // eslint-disable-line
      let targetKey = keyToCopy;
      if (keyToCopy === 'heightm') targetKey = 'height';
      if (keyToCopy === 'weightkg') targetKey = 'weight';
      updated[key][targetKey] = BattlePokedex[key][keyToCopy];
    });
  }
  // this is misnamed in replays & causes me errors.
  if (updated.basculinbluestriped) {
    updated.basculinbluestripe = updated.basculinbluestriped;
  }
  if (updated.floetteeternalflower) {
    updated.floetteeternalflow = updated.floetteeternalflower;
  }
  fs.writeFile(destination + 'pokedex.json', JSON.stringify(updated));
};

const copyFormats = () => {
  const updated = {};
  const keysToCopy = [
    'randomBattleMoves',
    'requiredItem'
  ];
  for (const key in BattleFormatsData) { // eslint-disable-line
    updated[key] = {};
    keysToCopy.forEach( (keyToCopy) => { // eslint-disable-line
      updated[key][keyToCopy] = BattleFormatsData[key][keyToCopy];
    });
  }

  fs.writeFile(destination + 'formats.json', JSON.stringify(updated));
};

// copied from src/pokeutil, don't give an f
const toId = (text) => {
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
