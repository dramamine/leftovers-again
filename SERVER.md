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

npm install -g forever

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


# stuff to run as admin. jk, this ends up saving stuff to the config files.
/makechatroom randombattle
/makechatroom ou
/makechatroom ubers
/makechatroom anythinggoes

/roomintro Welcome to Cyberdyne!<br>

Most creatures in this room are bots. Challenge them and they will accept. Generally they're designed for one specific type of battle, but will try to play against you anyway - check what chatrooms a bot is in to see what battle types they prefer. Don't worry about the ladder and have fun & try new things!

<br><u>Important Links</u>
<br>Project homepage: <a href="https://github.com/dramamine/leftovers-again">Github - Leftovers Again</a><br>

<br><u>Featured Bots</u>
<br>Meet the Fakers [ou]: FakeOut based bot.
<br>LA-Fitness [randombattle]: This bot beat God once. <a href="https://github.com/dramamine/la-fitness">Github - LA-Fitness</a>


/roomintro Welcome to cyberdyne!<br><br><u>Important Links</u><br>Project homepage: <a href="https://github.com/dramamine/leftovers-again">Github - Leftovers Again</a><br><br><u>Featured Bots</u><br>Meet the Fakers [ou]: FakeOut based bot.<br>LA-Fitness [randombattle]: This bot beat God once. <a href="https://github.com/dramamine/la-fitness">Github - LA-Fitness</a>


### Something To Run When Updating Lots Of Code
git pull origin master
git submodule update --recursive

n latest
npm install
npm run build

NODE_PATH=./:lib:lib/bots forever start lib/main.js -- stonedbirdie
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- splashbot
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- research/bravest
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- research/rooster
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- research/trapper
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- research/sunnyday
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- randumb
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- whynotbaut
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- stabby
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- meetthefakers
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- la-fitness
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/oras-drake
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/oras-glacia
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/oras-phoebe
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/oras-sidney
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/oras-steven
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/xy-diantha
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/xy-drasna
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/xy-malva
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/xy-siebold
NODE_PATH=./:lib:lib/bots forever start lib/main.js -- elitefour/xy-wikstrom
