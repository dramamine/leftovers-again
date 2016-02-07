# Data Folder

The JSON files here are derived from official client sources. They are minified and some data is stripped out. See the file scripts/data-minifier.js for more info.

randomteams.txt: this file is derived from teams generated for the 'randombattle' format. Note that this is _not a truly random sample_ because 'randombattle' picks some Pokemon that are impossible to pick. These Pokemon are:
Genesect-Burn: can't use this below lvl 100 ('technoblast'?)
Rayquaza: can't use this below lvl 100 ('vcreate'?)
Ambipom: Flying Gem is unreleased
Zygarde: can't learn Extreme Speed
Gourgeist-Large: ability Insomnia is unreleased
Reshiram below lvl 100

blah blah

delete lines with this. add 1 to the seed # that fucked up
sed -i.bak -e '36d' randomteams.txt
