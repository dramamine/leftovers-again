module.exports = {
  self: {
    active: {
      condition: '1/1',
      conditions: [],
      species: 'Shedinja',
      moves: [
        {
          move: 'X-Scissor',
          id: 'xscissor',
          pp: 24,
          maxpp: 24,
          target: 'normal',
          disabled: false,
          accuracy: 100,
          basePower: 80,
          category: 'Physical',
          name: 'X-Scissor',
          priority: 0,
          flags: {
            contact: 1,
            protect: 1,
            mirror: 1
          },
          secondary: false,
          type: 'Bug',
          isCrit: false,
          bp: 80,
          isPulse: false,
          isBite: false,
          isSpread: false,
          hits: 1,
          ignoresDefenseBoosts: false,
          makesContact: 1,
          hasSecondaryEffect: false
        },
        {
          move: 'Swords Dance',
          id: 'swordsdance',
          pp: 32,
          maxpp: 32,
          target: 'self',
          disabled: false,
          accuracy: true,
          basePower: 0,
          category: 'Status',
          name: 'Swords Dance',
          priority: 0,
          flags: {
            snatch: 1
          },
          secondary: false,
          boosts: {
            atk: 2
          },
          type: 'Normal',
          isCrit: false,
          bp: 0,
          isPulse: false,
          isBite: false,
          isSpread: false,
          hits: 1,
          ignoresDefenseBoosts: false,
          makesContact: false,
          hasSecondaryEffect: false
        },
        {
          move: 'Will-O-Wisp',
          id: 'willowisp',
          pp: 24,
          maxpp: 24,
          target: 'normal',
          disabled: false,
          accuracy: 85,
          basePower: 0,
          category: 'Status',
          name: 'Will-O-Wisp',
          priority: 0,
          flags: {
            protect: 1,
            reflectable: 1,
            mirror: 1
          },
          secondary: false,
          type: 'Fire',
          isCrit: false,
          bp: 0,
          isPulse: false,
          isBite: false,
          isSpread: false,
          hits: 1,
          ignoresDefenseBoosts: false,
          makesContact: false,
          hasSecondaryEffect: false
        },
        {
          move: 'Shadow Claw',
          id: 'shadowclaw',
          pp: 24,
          maxpp: 24,
          target: 'normal',
          disabled: false,
          accuracy: 100,
          basePower: 70,
          category: 'Physical',
          name: 'Shadow Claw',
          priority: 0,
          flags: {
            contact: 1,
            protect: 1,
            mirror: 1
          },
          secondary: false,
          type: 'Ghost',
          isCrit: false,
          bp: 70,
          isPulse: false,
          isBite: false,
          isSpread: false,
          hits: 1,
          ignoresDefenseBoosts: false,
          makesContact: 1,
          hasSecondaryEffect: false
        }
      ],
      hp: 4,
      maxhp: 4,
      hppct: 100,
      active: true,
      types: [
        'Bug',
        'Ghost'
      ],
      baseStats: {
        hp: 1,
        atk: 90,
        def: 45,
        spa: 30,
        spd: 30,
        spe: 40
      },
      abilities: {
        0: 'Wonder Guard'
      },
      weightkg: 1.2,
      position: 'p2a',
      owner: 'p2',
      weight: 1.2,
      type1: 'Bug',
      type2: 'Ghost',
      nature: 'jolly',
      rawStats: {
        hp: 1,
        atk: 90,
        def: 45,
        spa: 30,
        spd: 30,
        spe: 40
      },
      stats: {
        hp: 1,
        atk: 90,
        def: 45,
        spa: 30,
        spd: 30,
        spe: 40
      },
      boosts: {},
      status: '',
      level: 50,
      ability: 'Wonder Guard',
      item: '',
      gender: 'M'
    },
    reserve: [
      {
        condition: '1/1',
        conditions: [],
        species: 'Shedinja',
        moves: [
          {
            accuracy: 100,
            basePower: 80,
            category: 'Physical',
            id: 'xscissor',
            name: 'X-Scissor',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Bug'
          },
          {
            accuracy: true,
            category: 'Status',
            id: 'swordsdance',
            name: 'Swords Dance',
            flags: {
              snatch: 1
            },
            type: 'Normal'
          },
          {
            accuracy: 85,
            category: 'Status',
            id: 'willowisp',
            name: 'Will-O-Wisp',
            flags: {
              protect: 1,
              reflectable: 1,
              mirror: 1
            },
            type: 'Fire'
          },
          {
            accuracy: 100,
            basePower: 70,
            category: 'Physical',
            id: 'shadowclaw',
            name: 'Shadow Claw',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Ghost'
          }
        ],
        hp: 1,
        maxhp: 1,
        hppct: 100,
        active: true,
        types: [
          'Bug',
          'Ghost'
        ],
        baseStats: {
          hp: 1,
          atk: 90,
          def: 45,
          spa: 30,
          spd: 30,
          spe: 40
        },
        abilities: {
          0: 'Wonder Guard'
        },
        weightkg: 1.2,
        position: 'p2a',
        owner: 'p2'
      },
      {
        condition: '259/259',
        conditions: [],
        species: 'Armaldo',
        moves: [
          {
            accuracy: 100,
            basePower: 80,
            category: 'Physical',
            id: 'xscissor',
            name: 'X-Scissor',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Bug'
          },
          {
            accuracy: 100,
            basePower: 20,
            category: 'Physical',
            id: 'rapidspin',
            name: 'Rapid Spin',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Normal'
          },
          {
            accuracy: 100,
            basePower: 65,
            category: 'Physical',
            id: 'knockoff',
            name: 'Knock Off',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Dark'
          },
          {
            accuracy: true,
            category: 'Status',
            id: 'stealthrock',
            name: 'Stealth Rock',
            flags: {
              reflectable: 1
            },
            type: 'Rock'
          }
        ],
        hp: 259,
        maxhp: 259,
        hppct: 100,
        types: [
          'Rock',
          'Bug'
        ],
        baseStats: {
          hp: 75,
          atk: 125,
          def: 100,
          spa: 70,
          spd: 80,
          spe: 45
        },
        abilities: {
          0: 'Battle Armor',
          H: 'Swift Swim'
        },
        weightkg: 68.2,
        owner: 'p2'
      },
      {
        condition: '250/250',
        conditions: [],
        species: 'Landorus',
        moves: [
          {
            accuracy: 100,
            basePower: 90,
            category: 'Special',
            id: 'psychic',
            name: 'Psychic',
            flags: {
              protect: 1,
              mirror: 1
            },
            target: 'normal',
            type: 'Psychic'
          },
          {
            accuracy: true,
            category: 'Status',
            id: 'calmmind',
            name: 'Calm Mind',
            flags: {
              snatch: 1
            },
            target: 'self',
            type: 'Psychic'
          },
          {
            accuracy: 100,
            basePower: 90,
            category: 'Special',
            id: 'earthpower',
            name: 'Earth Power',
            flags: {
              protect: 1,
              mirror: 1,
              nonsky: 1
            },
            target: 'normal',
            type: 'Ground'
          },
          {
            accuracy: true,
            category: 'Status',
            id: 'rockpolish',
            name: 'Rock Polish',
            flags: {
              snatch: 1
            },
            target: 'self',
            type: 'Rock'
          }
        ],
        hp: 250,
        maxhp: 250,
        hppct: 100,
        types: [
          'Ground',
          'Flying'
        ],
        baseStats: {
          hp: 89,
          atk: 125,
          def: 90,
          spa: 115,
          spd: 80,
          spe: 101
        },
        abilities: {
          0: 'Sand Force',
          H: 'Sheer Force'
        },
        baseAbility: 'sheerforce',
        weightkg: 68,
        position: 'p2a',
        owner: 'p2'
      },
      {
        condition: '264/264',
        conditions: [],
        species: 'Eelektross',
        moves: [
          {
            accuracy: 100,
            basePower: 120,
            category: 'Physical',
            id: 'superpower',
            name: 'Superpower',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Fighting'
          },
          {
            accuracy: 100,
            basePower: 40,
            category: 'Special',
            id: 'acidspray',
            name: 'Acid Spray',
            flags: {
              bullet: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Poison'
          },
          {
            accuracy: 100,
            basePower: 70,
            category: 'Special',
            id: 'voltswitch',
            name: 'Volt Switch',
            flags: {
              protect: 1,
              mirror: 1
            },
            type: 'Electric'
          },
          {
            accuracy: 100,
            basePower: 75,
            category: 'Special',
            id: 'gigadrain',
            name: 'Giga Drain',
            flags: {
              protect: 1,
              mirror: 1,
              heal: 1
            },
            type: 'Grass'
          }
        ],
        hp: 264,
        maxhp: 264,
        hppct: 100,
        types: [
          'Electric'
        ],
        baseStats: {
          hp: 85,
          atk: 115,
          def: 80,
          spa: 105,
          spd: 80,
          spe: 50
        },
        abilities: {
          0: 'Levitate'
        },
        weightkg: 80.5,
        owner: 'p2'
      },
      {
        condition: '268/268',
        conditions: [],
        species: 'Seaking',
        moves: [
          {
            accuracy: 100,
            basePower: 90,
            category: 'Special',
            id: 'icebeam',
            name: 'Ice Beam',
            flags: {
              protect: 1,
              mirror: 1
            },
            type: 'Ice'
          },
          {
            accuracy: 95,
            basePower: 80,
            category: 'Physical',
            id: 'drillrun',
            name: 'Drill Run',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Ground'
          },
          {
            accuracy: 100,
            basePower: 80,
            category: 'Physical',
            id: 'waterfall',
            name: 'Waterfall',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Water'
          },
          {
            accuracy: 85,
            basePower: 120,
            category: 'Physical',
            id: 'megahorn',
            name: 'Megahorn',
            flags: {
              contact: 1,
              protect: 1,
              mirror: 1
            },
            type: 'Bug'
          }
        ],
        hp: 268,
        maxhp: 268,
        hppct: 100,
        types: [
          'Water'
        ],
        baseStats: {
          hp: 80,
          atk: 92,
          def: 65,
          spa: 65,
          spd: 80,
          spe: 68
        },
        abilities: {
          0: 'Swift Swim',
          1: 'Water Veil',
          H: 'Lightning Rod'
        },
        weightkg: 39,
        owner: 'p2'
      },
      {
        condition: '214/214',
        conditions: [],
        species: 'Starmie',
        moves: [
          {
            accuracy: 100,
            basePower: 90,
            category: 'Special',
            id: 'thunderbolt',
            name: 'Thunderbolt',
            flags: {
              protect: 1,
              mirror: 1
            },
            type: 'Electric'
          },
          {
            accuracy: 100,
            basePower: 80,
            category: 'Special',
            id: 'psyshock',
            name: 'Psyshock',
            flags: {
              protect: 1,
              mirror: 1
            },
            type: 'Psychic'
          },
          {
            accuracy: 100,
            basePower: 80,
            category: 'Special',
            id: 'scald',
            name: 'Scald',
            flags: {
              protect: 1,
              mirror: 1,
              defrost: 1
            },
            type: 'Water'
          },
          {
            accuracy: 100,
            basePower: 90,
            category: 'Special',
            id: 'icebeam',
            name: 'Ice Beam',
            flags: {
              protect: 1,
              mirror: 1
            },
            type: 'Ice'
          }
        ],
        hp: 214,
        maxhp: 214,
        hppct: 100,
        types: [
          'Water',
          'Psychic'
        ],
        baseStats: {
          hp: 60,
          atk: 75,
          def: 85,
          spa: 100,
          spd: 85,
          spe: 115
        },
        abilities: {
          0: 'Illuminate',
          1: 'Natural Cure',
          H: 'Analytic'
        },
        weightkg: 80,
        owner: 'p2'
      }
    ]
  },
  opponent: {
    active: {
      condition: '100/100',
      conditions: [],
      species: 'Plusle',
      hp: 240,
      maxhp: 240,
      hppct: 100,
      types: [
        'Electric'
      ],
      baseStats: {
        hp: 60,
        atk: 50,
        def: 40,
        spa: 85,
        spd: 75,
        spe: 95
      },
      abilities: {
        0: 'Plus',
        H: 'Lightning Rod'
      },
      weightkg: 4.2,
      position: 'p1a',
      owner: 'p1',
      weight: 4.2,
      type1: 'Electric',
      type2: '',
      nature: 'jolly',
      rawStats: {
        hp: 60,
        atk: 50,
        def: 40,
        spa: 85,
        spd: 75,
        spe: 95
      },
      stats: {
        hp: 60,
        atk: 50,
        def: 40,
        spa: 85,
        spd: 75,
        spe: 95
      },
      boosts: {},
      status: '',
      level: 50,
      ability: 'Plus',
      item: '',
      gender: 'M'
    },
    reserve: [
      {
        condition: '100/100',
        conditions: [],
        species: 'Plusle',
        hp: 100,
        maxhp: 100,
        hppct: 100,
        types: [
          'Electric'
        ],
        baseStats: {
          hp: 60,
          atk: 50,
          def: 40,
          spa: 85,
          spd: 75,
          spe: 95
        },
        abilities: {
          0: 'Plus',
          H: 'Lightning Rod'
        },
        weightkg: 4.2,
        position: 'p1a',
        owner: 'p1'
      }
    ]
  },
  rqid: 1
};
