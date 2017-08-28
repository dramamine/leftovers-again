module.exports = {
  active: [
    {
      moves: [
        {
          move: 'Fake Out',
          id: 'fakeout',
          pp: 16,
          maxpp: 16,
          target: 'normal',
          disabled: false
        },
        {
          move: 'Knock Off',
          id: 'knockoff',
          pp: 32,
          maxpp: 32,
          target: 'normal',
          disabled: false
        },
        {
          move: 'U-turn',
          id: 'uturn',
          pp: 32,
          maxpp: 32,
          target: 'normal',
          disabled: false
        },
        {
          move: 'Return',
          id: 'return',
          pp: 32,
          maxpp: 32,
          target: 'normal',
          disabled: false
        }
      ]
    }
  ],
  side: {
    name: '5nowden',
    id: 'p1',
    pokemon: [
      {
        ident: 'p1: Persian',
        details: 'Persian, L83, F',
        condition: '244/244',
        active: true,
        stats: {
          atk: 164,
          def: 147,
          spa: 156,
          spd: 156,
          spe: 239
        },
        moves: [
          'fakeout',
          'knockoff',
          'uturn',
          'return'
        ],
        baseAbility: 'technician',
        item: 'lifeorb',
        pokeball: 'pokeball',
        canMegaEvo: false
      },
      {
        ident: 'p1: Wormadam',
        details: 'Wormadam, L83, F',
        condition: '235/235',
        active: false,
        stats: {
          atk: 146,
          def: 189,
          spa: 179,
          spd: 222,
          spe: 107
        },
        moves: [
          'synthesis',
          'toxic',
          'protect',
          'signalbeam'
        ],
        baseAbility: 'overcoat',
        item: 'leftovers',
        pokeball: 'pokeball',
        canMegaEvo: false
      },
      {
        ident: 'p1: Malamar',
        details: 'Malamar, L81, F',
        condition: '289/289',
        active: false,
        stats: {
          atk: 196,
          def: 189,
          spa: 157,
          spd: 168,
          spe: 123
        },
        moves: [
          'trickroom',
          'psychocut',
          'substitute',
          'superpower'
        ],
        baseAbility: 'contrary',
        item: 'leftovers',
        pokeball: 'pokeball',
        canMegaEvo: false
      },
      {
        ident: 'p1: Basculin-Blue-Stripe',
        details: 'Basculin-Blue-Striped, L83, M',
        condition: '252/252',
        active: false,
        stats: {
          atk: 200,
          def: 156,
          spa: 180,
          spd: 139,
          spe: 210
        },
        moves: [
          'aquajet',
          'waterfall',
          'crunch',
          'zenheadbutt'
        ],
        baseAbility: 'adaptability',
        item: 'choiceband',
        pokeball: 'pokeball',
        canMegaEvo: false
      },
      {
        ident: 'p1: Jynx',
        details: 'Jynx, L81, F',
        condition: '238/238',
        active: false,
        stats: {
          atk: 128,
          def: 103,
          spa: 233,
          spd: 201,
          spe: 201
        },
        moves: [
          'lovelykiss',
          'nastyplot',
          'psychic',
          'icebeam'
        ],
        baseAbility: 'dryskin',
        item: 'leftovers',
        pokeball: 'pokeball',
        canMegaEvo: false
      },
      {
        ident: 'p1: Liepard',
        details: 'Liepard, L81, F',
        condition: '236/236',
        active: false,
        stats: {
          atk: 189,
          def: 128,
          spa: 189,
          spd: 128,
          spe: 218
        },
        moves: [
          'substitute',
          'knockoff',
          'encore',
          'copycat'
        ],
        baseAbility: 'prankster',
        item: 'leftovers',
        pokeball: 'pokeball',
        canMegaEvo: false
      }
    ]
  },
  rqid: 1
};
