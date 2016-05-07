## Server Setup Guide

Hopefully no other humans need this. Here's how to install cyberdyne:

## Digitalocean - set up a Debian 8.3 x64 box.
- Alias 'cyberdyne' to log into the box

## dependencies
apt-get update
apt-get install git-core nodejs nodejs-legacy


# wtf
ln -s /usr/local/bin/node /usr/bin/node
ln -s /usr/local/bin/npm /usr/bin/npm

npm install -g npm
rm /usr/bin/npm
## make sure you're running an up-to-date version
which npm
npm -v

npm install -g n
n latest

node -v

# once you've got node sorted out...

git clone https://github.com/dramamine/leftovers-again
cd leftovers-again
make

cd deps/Pokemon-Showdown
npm install --production
npm uninstall babel
npm install babel-cli

npm start --production

# run a bot on a server
NODE_PATH=./:lib:lib/bots forever start lib/main.js
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- research/bravest
