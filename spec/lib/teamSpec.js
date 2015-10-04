import Team from '../../src/lib/team';
import _ from 'lodash';


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

const utm = 'Alakazam-Mega||alakazite|magicguard|psychic,hiddenpowerfire,shadowball,taunt|Timid|,,,252,4,252||,0,,,,|||';


describe('team', () => {
  it('should validate this one-mon team', () => {
    expect(Team._seemsValid([oneMon])).toBe(true);
  });
  it('should read this Smogon one', () => {
    const interpreted = Team.interpretOneSmogon(smogon);
    expect(_.isEqual(interpreted, oneMon)).toBe(true);
  });
  it('should pack this team like the client does', () => {
    const packed = Team.packTeam([oneMon]);
    expect(packed).toEqual(utm);
  });
  it('should read this Smogon team', () => {
    const interpreted = Team.interpretSmogon(smogon);
    expect(_.isEqual(interpreted, [oneMon])).toBe(true);
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
});


