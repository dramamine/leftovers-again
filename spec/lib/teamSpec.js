const Team = require('@la/team');
// @TODO do we need lodash?
const _ = require('lodash');

const oneMon = {
  // required fields
  species: 'Alakazam-Mega', // include this and/or species
  item: 'Alakazite',
  ability: 'Magic Guard',
  nature: 'Timid',
  moves: [
    'Psychic',
    'Hidden Power [Fire]',
    'Shadow Ball',
    'Taunt'
  ],

  // optional but you really want it
  evs: {
    spd: 4,
    spa: 252,
    spe: 252,
  },

  // optional fields

  ivs: {   // these all default to 31; use this if you
    atk: 0 // have some low-stat shenanigans in mind
  }
  // gender: 'F', // defaults to pokedex value
  // level: 100, // defaults to 100
  // shiny: true, // defaults to non-shiny
  // happiness: 255, // defaults to 255
  // name: 'Fakemon' // special names for your pokemon. if you
  //                 // do this, use 'species' for its pokedex name
};

const smogon = `
Alakazam-Mega @ Alakazite
Ability: Magic Guard
EVs: 4 Spd / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Psychic
- Hidden Power [Fire]
- Shadow Ball
- Taunt
`;

const utm = '|alakazammega|alakazite|magicguard|psychic,hiddenpowerfire,shadowball,taunt|Timid|,,,252,4,252||,0,,,,|||';

const whine = `
Whinenaut (Wynaut) @ Berry Juice
Level: 5
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
IVs: 1 HP / 2 Atk / 3 Def / 4 SpA / 5 SpD / 6 Spe
Bold Nature
- Encore
- Counter
- Mirror Coat
- Safeguard
`;

const whineutm = 'Whinenaut|wynaut|berryjuice||encore,counter,mirrorcoat,safeguard|Bold|236,,132,,132,||1,2,3,4,5,6||5|';


describe('team', () => {
  describe('interpretOneSmogon', () => {
    it('should read this Smogon one', () => {
      const interpreted = Team.interpretOneSmogon(smogon);
      expect(_.isEqual(interpreted, oneMon)).toBe(true);
    });
    it('should read this Smogon team', () => {
      const interpreted = Team.interpretSmogon(smogon);
      expect(_.isEqual(interpreted, [oneMon])).toBe(true);
    });
  });
  it('should validate this one-mon team', () => {
    expect(Team.seemsValid([oneMon])).toBe(true);
  });
  it('should pack this team like the client does', () => {
    const packed = Team.packTeam([oneMon]);
    expect(packed).toEqual(utm);
  });
  it('should construct a team with a smogon string', () => {
    const team = new Team(smogon);
    expect(team.asUtm()).toEqual(utm);
  });
  it('should construct a team with JSON', () => {
    const team = new Team([oneMon]);
    expect(team.asUtm()).toEqual(utm);
  });
  it('should handle nicknames', () => {
    const mon = Team.interpretOneSmogon('Nickname (Pikachu) (M)');
    expect(mon.name).toEqual('Nickname');
    expect(mon.species).toEqual('Pikachu');
    expect(mon.gender).toEqual('M');
  });
  it('should handle a team with 6 mons', () => {
    const asString = Array.from(new Array(6), () => smogon).join('\n\n');
    const team = Team.interpretSmogon(asString);
    expect(team.length).toEqual(6);
  });
  it('should handle a team with too many line breaks', () => {
    const asString = Array.from(new Array(6), () => smogon).join('\n\n\n\n\n');
    const team = Team.interpretSmogon('\n\n' + asString + '\n\n');
    expect(team.length).toEqual(6);
  });

  it('should interpret IVs properly', () => {
    const mon = Team.interpretOneSmogon(whine);
    expect(mon.ivs.hp).toEqual(1);
    expect(mon.ivs.atk).toEqual(2);
    expect(mon.ivs.spe).toEqual(6);
  });
  it('should interpret level properly', () => {
    const mon = Team.interpretOneSmogon(whine);
    expect(mon.level).toEqual(5);
  });
  it('should output this mon properly', () => {
    const packed = Team.packTeam([Team.interpretOneSmogon(whine)]);
    expect(packed).toEqual(whineutm);
  });
});
