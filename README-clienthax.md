# run a server
cd lib/Pokemon-Showdown
node app.js

# load in yr browser
```
google-chrome lib/Pokemon-Showdown-Client/testclient.html
add ?~~localhost:8000 to your url
```

# run your bot locally
npm run develop -- --bot=randombattle/infodump.js --monkey

# run an opponent
npm run develop -- --bot=randombattle/stabby.js
