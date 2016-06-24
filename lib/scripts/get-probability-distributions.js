'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Run with
 * babel-node scripts/get-probability-distributions.js
 */

var DAMAGE = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];

console.log('export default [');
for (var i = 1; i < 10; i++) {
  dumpStatsWithAndWithoutNature(i);
  dumpStatsWithAndWithoutCrits(i);
}
console.log('];');

function dumpStatsWithAndWithoutNature(hits) {
  var results = {};

  // round one. FIGHT
  DAMAGE.map(function (dmg) {
    results[dmg] = 1 / 16;
  });

  // raw damage
  for (var _i = 1; _i < hits; _i++) {
    results = addAnotherRoundOfDamage(results);
  }

  var stats = toNormalDist(results);
  stats.hits = hits;
  console.log(stats);
  console.log(',');

  var natural = natureVariance(results);
  stats = toNormalDist(natural);
  stats.hits = hits;
  stats.nature = true;
  console.log(stats);
  console.log(',');
}

function dumpStatsWithAndWithoutCrits(hits) {
  var results = {};

  // round one. FIGHT
  DAMAGE.map(function (dmg) {
    results[dmg] = 1 / 16;
  });

  results = critVariance(results);

  // raw damage
  for (var _i2 = 1; _i2 < hits; _i2++) {
    results = addAnotherRoundOfCritDamage(results);
  }

  var stats = toNormalDist(results);
  stats.hits = hits;
  stats.crits = true;
  console.log(stats);
  console.log(',');

  var natural = natureVariance(results);
  stats = toNormalDist(natural);
  stats.hits = hits;
  stats.nature = true;
  stats.crits = true;
  console.log(stats);
  console.log(',');
}

function addAnotherRoundOfDamage(data) {
  var intermediate = [];
  Object.keys(data).forEach(function (dmgKey) {
    // eslint-disable-line
    DAMAGE.forEach(function (dmg) {
      intermediate.push([parseFloat(dmgKey) + dmg, data[dmgKey] * 1 / 16]);
    });
  });

  var out = dmgChanceArrayToObject(intermediate);
  // confirm the sum
  confirmSum(out);
  return out;
}

function addAnotherRoundOfCritDamage(data) {
  var critChance = arguments.length <= 1 || arguments[1] === undefined ? 0.0625 : arguments[1];
  var critDamage = arguments.length <= 2 || arguments[2] === undefined ? 1.5 : arguments[2];

  var intermediate = [];
  Object.keys(data).forEach(function (dmgKey) {
    // eslint-disable-line
    DAMAGE.forEach(function (dmg) {
      intermediate.push([parseFloat(dmgKey) + dmg, data[dmgKey] * 1 / 16 * (1 - critChance)]);
      intermediate.push([parseFloat(dmgKey) + dmg * critDamage, data[dmgKey] * 1 / 16 * critChance]);
    });
  });

  var out = dmgChanceArrayToObject(intermediate);
  // confirm the sum
  confirmSum(out);
  return out;
}

function toNormalDist(data) {
  // probability * value
  var mean = 0;
  // probability * value * value
  var sumSquares = 0;
  Object.keys(data).forEach(function (key) {
    mean += parseFloat(key) * data[key];
    sumSquares += parseFloat(key) * parseFloat(key) * data[key];
  });
  // mean is now accurate
  var variance = sumSquares - mean * mean;
  var sd = Math.sqrt(variance);
  return { mean: mean, variance: variance, sd: sd };
}

function natureVariance(data) {
  // add in nature variance
  var PROBABILITY_AND_CHANGE = [[4 / 25 * (4 / 25), 10 / 11 * (10 / 11)], [2 * (4 / 25) * (17 / 25), 10 / 11], [17 / 25 * (17 / 25) + 2 * (4 / 25) * (4 / 25), 1], [2 * (4 / 25) * (17 / 25), 11 / 10], [4 / 25 * (4 / 25), 11 / 10 * (11 / 10)]];

  // this should always be true, you can comment out
  var probs = PROBABILITY_AND_CHANGE.reduce(function (prev, next) {
    return prev + next[0];
  }, 0);
  if (!about(probs, 1)) {
    console.error(PROBABILITY_AND_CHANGE);
    console.error('Sum wasnt 1!', probs);
  }

  var intermediate = [];
  PROBABILITY_AND_CHANGE.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var prob = _ref2[0];
    var change = _ref2[1];

    Object.keys(data).forEach(function (dmgKey) {
      // eslint-disable-line
      intermediate.push([parseFloat(dmgKey) * change, data[dmgKey] * prob]);
    });
  });

  var out = dmgChanceArrayToObject(intermediate);

  confirmSum(out);
  return out;
}

function critVariance(data) {
  var critChance = arguments.length <= 1 || arguments[1] === undefined ? 0.0625 : arguments[1];
  var critDamage = arguments.length <= 2 || arguments[2] === undefined ? 1.5 : arguments[2];

  var intermediate = [];
  Object.keys(data).forEach(function (dmgKey) {
    intermediate.push([parseFloat(dmgKey), data[dmgKey] * (1 - critChance)]);
    intermediate.push([parseFloat(dmgKey) * critDamage, data[dmgKey] * critChance]);
  });

  var out = dmgChanceArrayToObject(intermediate);

  confirmSum(out);
  return out;
}

function dmgChanceArrayToObject(arr) {
  var obj = {};
  arr.forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var dmg = _ref4[0];
    var chance = _ref4[1];
    // eslint-disable-line
    if (!obj[dmg]) obj[dmg] = 0;
    obj[dmg] += chance;
  });

  return obj;
}

/**
 * Checks accuracy to 4 decimal points.
 * @param  {Number} x [description]
 * @param  {Number} y [description]
 * @return {Boolean}   [description]
 */
function about(x, y) {
  return x > y - 0.0001 && x < y + 0.0001;
}

/**
 * sums up each value and checks to see if it's what we expect.
 *
 * @param  {Object} data   An object of key-value pairs.
 * @param  {Number} target The expected sum
 * @return {Boolean}       True if the sum is as expected; false otherwise.
 */
function confirmSum(data) {
  var target = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  var sum = Object.keys(data).reduce(function (prev, key) {
    // eslint-disable-line
    return prev + data[key];
  }, 0);
  var result = about(sum, target);
  if (!result) {
    console.error('sum didnt match!', sum, target);
    console.error(data);
  }
  return result;
}