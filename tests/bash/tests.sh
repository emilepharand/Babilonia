#!/bin/bash

dbFileName="nonExistentFile.db"

cd dist

# Sanity check
if [ -f "$dbFileName" ]; then
    echo "File $dbFileName already exists."
    exit 1
fi

# --db=db file does not exist
node index.cjs --db="$dbFileName" &

PID=$!
sleep 1

## Coverage
curl localhost:$VITE_BASE_PORT/__coverage__ | cut -c13- | rev | cut -c2- | rev > ../tests/coverage/merged/coverage-bash.json

kill $PID

# Database file should have been created
if [ ! -f "$dbFileName" ]; then
    echo "File $dbFileName was not created."
    exit 1
fi
