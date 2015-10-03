import Team from '../../src/lib/team';


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
    spa: 252,
    spd: 4,
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

fdescribe('team', () => {
  it('should validate this one-mon team', () => {
    expect(Team._seemsValid([oneMon])).toBe(true);
  });
  it('should pack this team like the client does', () => {
    const packed = Team.packTeam([oneMon]);
    expect(packed).toEqual('Alakazam-Mega||alakazite|magicguard|psychic,hiddenpowerfire,shadowball,taunt|Timid|,,,252,4,252||,0,,,,|||');
  });
});


