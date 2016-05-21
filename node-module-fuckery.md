node-module-fuckery.md


## some shit I'm pulling to get all the files I need
npm run clean
npm run build
cd lib
rm -rf src
cd ..
cd src
find ./ -type f \( -name '*.json' \) | tar -cf - -T - | tar -xf - -C ../lib -v

## generator

* Are you developing your bot inside this directory?
** Yes, that sounds easier; I'm going to write code in ES6 and don't plan to publish my own module for now.
** No, I want to require leftovers-again as a module and do my own thing.

## 5/18
next steps:
- try committing the whole lib directory
- make sure it packs up with 'npm pack'
- try installing that tar file in la-fitness
- see if bin scripts work
- if not, just write the long path to them
