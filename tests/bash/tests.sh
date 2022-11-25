#!/bin/bash

dbFileName="newDbFile.db"

cd dist

####################################################
# --db=db (file does not exist) file is created
####################################################

echo "----------------------------------"
echo "Test 1"
echo "----------------------------------"

# Sanity check
if [ -f "$dbFileName" ]; then
    echo "File $dbFileName already exists."
    rm $dbFileName
    # exit 1
fi

# Run
node index.cjs --db="$dbFileName" &
PID=$!
sleep 1

# Coverage
curl localhost:$VITE_BASE_PORT/__coverage__ | cut -c13- | rev | cut -c2- | rev > ../tests/coverage/merged/coverage-bash.json

# Create data for next test
curl "localhost:$VITE_API_PORT/languages" -H "Content-Type: application/json" -d '{"name":"newLanguage"}'

kill $PID

dbFileSize=$(stat -c%s "$dbFileName")

# Test that database file has been created and is not empty
if [ ! -f "$dbFileName" ]; then
    echo "File $dbFileName was not created."
    exit 1
elif [ ! -s "$dbFileName" ]
then 
   echo "File $dbFileName was created but is empty."
   exit 1
fi

####################################################
# --db=db (file exists) file is not overwritten
####################################################

echo "----------------------------------"
echo "Test 2"
echo "----------------------------------"

# Run
node index.cjs --db="$dbFileName" &
PID=$!
sleep 1

# Coverage
curl localhost:$VITE_BASE_PORT/__coverage__ | cut -c13- | rev | cut -c2- | rev > ../tests/coverage/merged/coverage-bash-2.json

res=$(curl localhost:$VITE_API_PORT/languages/1 -H "Content-Type: application/json")

if [ "$res" != '{"id":1,"isPractice":false,"name":"newLanguage","ordering":0}' ]; then
    echo "Database was overwritten."
    kill $PID
    exit 1
fi

kill $PID

######################################
# --dev-mode does not start webserver
######################################

echo "----------------------------------"
echo "Test 3"
echo "----------------------------------"

node index.cjs --dev-mode &
PID=$!
sleep 1

# Coverage
curl localhost:$VITE_API_PORT/__coverage__ | cut -c13- | rev | cut -c2- | rev > ../tests/coverage/merged/coverage-bash-3.json

if curl --output /dev/null --silent --head --fail "localhost:$VITE_BASE_PORT"; then
  echo "URL exists: localhost:$VITE_BASE_PORT"
  kill $PID
  exit 1
fi

kill $PID
