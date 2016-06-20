# Data Folder

The JSON files here are derived from official client sources. They are minified and some data is stripped out. See the file scripts/data-minifier.js for more info.

**formats.json**: Some data copied from the official Pokemon Showdown data file on battle formats. Mainly grabbing this for randombattle data.

**moves.json**: Properties copied from the official Pokemon Showdown data.

**moves-ext.json**: Properties copied from the honko-damagecalc library. This is used by damage.js - I don't really want to incorporate these into moves.json so I kept these props separate.

**pokedex.json**: Properties about Pokemon copied from the official Pokemon Showdown data.

**randomteams.txt**: this file is derived from teams generated for the 'randombattle' format. Note that this is _not a truly random sample_ because 'randombattle' picks some Pokemon that are impossible to pick. These Pokemon are:
Genesect-Burn: can't use this below lvl 100 ('technoblast'?)
Rayquaza: can't use this below lvl 100 ('vcreate'?)
Ambipom: Flying Gem is unreleased
Zygarde: can't learn Extreme Speed
Gourgeist-Large: ability Insomnia is unreleased
Reshiram below lvl 100

blah blah... (there are tons of Pokemon that get excluded for reasons like this)

### delete lines with this script. add 1 to the seed # that fucked up
sed -i.bak -e '[ {{seed plus one}} ]d' randomteams.txt
