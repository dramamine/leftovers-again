# annoying that I needed a script file to solve this problem
# wish I could manipulate the relative direcotry of 'changed'
# maybe onchange will add that '-o' option someday

# ex. src/bots/stabby/stabby.js
filename=$1
destination=$(echo "$filename" | sed 's/src/lib/g')
babel $filename -o $destination
