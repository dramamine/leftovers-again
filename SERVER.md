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

## Run your version of the server
git clone https://github.com/dramamine/leftovers-again
cd leftovers-again
make

cd deps/Pokemon-Showdown
npm install --production
npm uninstall babel
npm install babel-cli

### Check the config file
You'll probably want to uncomment the line about exports.bindaddress

### GET STARTED
npm start --production
or:
cd /var/www/leftovers-again/deps/Pokemon-Showdown
forever start --uid="srvr" -a app.js --production

forever start --uid="bots" -a -l /var/www/leftovers-again/log/bots.log bot-runner.json

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
