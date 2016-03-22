  NOTES ON NODE/NPM FOR LINUX/UBUNTU

  npm -v # check version
  sudo npm install -g npm # install latest version of npm

# if you have node installed already..
sudo npm install -g n # installs node version manager. https://github.com/tj/n
n latest # install latest with this
n stable # wuss

# if you don't have node..
curl -L http://git.io/n-install | bash # unsafely run this script to install node

# trying to fix permissions
chmod +x node_modules/babel/cli.js





## Node for Mac

brew install node   # using homebrew, or
port install nodejs # using macports

# download with bash (dangerous)
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"


# FAQ

Q: 'Permission denied' when trying to run babel-node.
A: `sudo npm install -g babel-cli` should work. Also try nuking your `node_modules` directory and doing a fresh `npm install` if you previously installed babel-cli locally.
