node-module-fuckery.md


## some shit I'm pulling to get all the files I need
npm run clean
npm run build
cd lib
rm -rf src
cd ..
cd src
find ./ -type f \( -name '*.json' \) | tar -cf - -T - | tar -xf - -C ../lib -v

