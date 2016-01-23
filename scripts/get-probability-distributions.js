/**
 * Run with
 * babel-node scripts/get-probability-distributions.js
 */

const DAMAGE = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];

console.log('export default [');
for (let i = 1; i < 10; i++) {
  dumpStatsWithAndWithoutNature(i);
  dumpStatsWithAndWithoutCrits(i);
}
console.log('];');

function dumpStatsWithAndWithoutNature(hits) {
  let results = {};

  // round one. FIGHT
  DAMAGE.map(dmg => {
    results[dmg] = 1 / 16;
  });

  // raw damage
  for (let i = 1; i < hits; i++) {
    results = addAnotherRoundOfDamage(results);
  }


  let stats = toNormalDist(results);
  stats.hits = hits;
  console.log(stats);
  console.log(',');

  const natural = natureVariance(results);
  stats = toNormalDist(natural);
  stats.hits = hits;
  stats.nature = true;
  console.log(stats);
  console.log(',');
}

function dumpStatsWithAndWithoutCrits(hits) {
  let results = {};

  // round one. FIGHT
  DAMAGE.map(dmg => {
    results[dmg] = 1 / 16;
  });

  results = critVariance(results);

  // raw damage
  for (let i = 1; i < hits; i++) {
    results = addAnotherRoundOfCritDamage(results);
  }

  let stats = toNormalDist(results);
  stats.hits = hits;
  stats.crits = true;
  console.log(stats);
  console.log(',');

  const natural = natureVariance(results);
  stats = toNormalDist(natural);
  stats.hits = hits;
  stats.nature = true;
  stats.crits = true;
  console.log(stats);
  console.log(',');
}


function addAnotherRoundOfDamage(data) {
  const intermediate = [];
  Object.keys(data).forEach(dmgKey => { // eslint-disable-line
    DAMAGE.forEach(dmg => {
      intermediate.push([
        parseFloat(dmgKey) + dmg,
        data[dmgKey] * 1 / 16
      ]);
    });
  });

  const out = dmgChanceArrayToObject(intermediate);
  // confirm the sum
  confirmSum(out);
  return out;
}


function addAnotherRoundOfCritDamage(data, critChance = 0.0625, critDamage = 1.5) {
  const intermediate = [];
  Object.keys(data).forEach(dmgKey => { // eslint-disable-line
    DAMAGE.forEach(dmg => {
      intermediate.push([
        parseFloat(dmgKey) + dmg,
        data[dmgKey] * 1 / 16 * (1 - critChance)
      ]);
      intermediate.push([
        parseFloat(dmgKey) + dmg * critDamage,
        data[dmgKey] * 1 / 16 * critChance
      ]);
    });
  });

  const out = dmgChanceArrayToObject(intermediate);
  // confirm the sum
  confirmSum(out);
  return out;
}


function toNormalDist(data) {
  // probability * value
  let mean = 0;
  // probability * value * value
  let sumSquares = 0;
  Object.keys(data).forEach(key => {
    mean += parseFloat(key) * data[key];
    sumSquares += parseFloat(key) * parseFloat(key) * data[key];
  });
  // mean is now accurate
  const variance = sumSquares - (mean * mean);
  const sd = Math.sqrt(variance);
  return {mean, variance, sd};
}


function natureVariance(data) {
  // add in nature variance
  const PROBABILITY_AND_CHANGE = [
    [(4 / 25) * (4 / 25), (10 / 11) * (10 / 11)],
    [2 * (4 / 25) * (17 / 25), (10 / 11)],
    [(17 / 25) * (17 / 25) + 2 * (4 / 25) * (4 / 25), 1],
    [2 * (4 / 25) * (17 / 25), (11 / 10)],
    [(4 / 25) * (4 / 25), (11 / 10) * (11 / 10)]
  ];

  // this should always be true, you can comment out
  const probs = PROBABILITY_AND_CHANGE.reduce( (prev, next) => {
    return prev + next[0];
  }, 0);
  if (!about(probs, 1)) {
    console.error(PROBABILITY_AND_CHANGE);
    console.error('Sum wasnt 1!', probs);
  }

  const intermediate = [];
  PROBABILITY_AND_CHANGE.forEach( ([prob, change]) => {
    Object.keys(data).forEach(dmgKey => { // eslint-disable-line
      intermediate.push([
        parseFloat(dmgKey) * change,
        data[dmgKey] * prob
      ]);
    });
  });

  const out = dmgChanceArrayToObject(intermediate);

  confirmSum(out);
  return out;
}

function critVariance(data, critChance = 0.0625, critDamage = 1.5) {
  const intermediate = [];
  Object.keys(data).forEach(dmgKey => {
    intermediate.push([
      parseFloat(dmgKey),
      data[dmgKey] * (1 - critChance)
    ]);
    intermediate.push([
      parseFloat(dmgKey) * critDamage,
      data[dmgKey] * critChance
    ]);
  });

  const out = dmgChanceArrayToObject(intermediate);

  confirmSum(out);
  return out;
}

function dmgChanceArrayToObject(arr) {
  const obj = {};
  arr.forEach( ([dmg, chance]) => { // eslint-disable-line
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
  return x > (y - 0.0001) && x < (y + 0.0001);
}

/**
 * sums up each value and checks to see if it's what we expect.
 *
 * @param  {Object} data   An object of key-value pairs.
 * @param  {Number} target The expected sum
 * @return {Boolean}       True if the sum is as expected; false otherwise.
 */
function confirmSum(data, target = 1) {
  const sum = Object.keys(data).reduce( (prev, key) => { // eslint-disable-line
    return prev + data[key];
  }, 0);
  const result = about(sum, target);
  if (!result) {
    console.error('sum didnt match!', sum, target);
    console.error(data);
  }
  return result;
}

