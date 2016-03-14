DEST="file://$PWD/lib/Pokemon-Showdown-Client/testclient.html?~~localhost:8000"

echo "You want to open this URL in your browser of choice:"
echo $DEST
echo "\n"
echo "Trying to open the browser for you. Don't forget to add ?~~localhost:8000 to the end of this URL!"

if hash xdg-open 2>/dev/null; then
  xdg-open $DEST
else
  open $DEST
fi
