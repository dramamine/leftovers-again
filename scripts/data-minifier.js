/**
 * The data files from 'Pokemon-Showdown' have a lot of unnecessary data.
 * They're SO BIG that babel complains about 100kb+ file sizes.
 * Hopefully, nobody will miss these fields when they're gone.
 */

import {BattleMovedex} from '../lib/Pokemon-Showdown/data/moves';
import {BattlePokedex} from '../lib/Pokemon-Showdown/data/pokedex';
import fs from 'fs';

function copyMoves() {
  const updated = {};
  const keysToCopy = [
    'accuracy',
    'basePower',
    'category',
    'id',
    'name',
    'priority',
    'flags',
    'drain',
    'secondary',
    'boosts',
    'target',
    'type',
    'volatileStatus',
  ];
  for (const key in BattleMovedex) { // eslint-disable-line
    updated[key] = {};
    keysToCopy.forEach( (keyToCopy) => { // eslint-disable-line
      updated[key][keyToCopy] = BattleMovedex[key][keyToCopy];
    });
  }

  fs.writeFile('../data/moves.json', JSON.stringify(updated));
}

function copyPokes() {
  const updated = {};
  const keysToCopy = [
    'species',
    'types',
    'baseStats',
    'heightm',
    'weightkg'
  ];
  for (const key in BattlePokedex) { // eslint-disable-line
    updated[key] = {};
    keysToCopy.forEach( (keyToCopy) => { // eslint-disable-line
      updated[key][keyToCopy] = BattlePokedex[key][keyToCopy];
    });
  }

  fs.writeFile('../data/pokedex.json', JSON.stringify(updated));
}

copyMoves();
copyPokes();