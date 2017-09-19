# Yep, it's an integration test! Run this after publishing and make sure
# it works. By the end you've got a server spun up and should challenge
# randumb to a battle.

rm -rf lib src node_modules package.json .babelrc
npm install leftovers-again

# wish I could automate this
node node_modules/leftovers-again/src/scripts/generate.js

# post-generation...
yarn
git clone https://github.com/dramamine/Pokemon-Showdown.git
./node_modules/.bin/npm-run-all --parallel server 'develop -- --matches=3 --opponent=randumb --loglevel=4'
