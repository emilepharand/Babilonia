#!/bin/bash

write_coverage() {
  local output_file="$1"
  curl -sf "localhost:$VITE_BASE_PORT/__coverage__" | cut -c13- | sed 's/.$//' > "../tests/coverage/merged/${output_file}"
}

dbFileName="newDbFile.db"

cd dist

####################################################
# Test 1
####################################################

echo "------------------------------------------------------"
echo " Test 1                                               "
echo "------------------------------------------------------"
echo " --db=db, file does not exist, file is created        "
echo "------------------------------------------------------"

# Previous test may have left a file
if [ -f "$dbFileName" ]; then
    echo "File $dbFileName already exists. Deleting."
    rm $dbFileName
fi

# Run
node index.cjs --db="$dbFileName" &
PID=$!
sleep 1

# Coverage
write_coverage "coverage-bash.json"

# Create data for the next test
curl -sfq "localhost:$VITE_API_PORT/languages" -H "Content-Type: application/json" -d '{"name":"newLanguage"}' > /dev/null

kill $PID

dbFileSize=$(stat -c%s "$dbFileName")

# Test that database file has been created and is not empty
if [ ! -f "$dbFileName" ]; then
    echo "--> Result: failure!"
    echo "File $dbFileName was not created."
    exit 1
elif [ ! -s "$dbFileName" ]
then 
   echo "--> Result: failure!"
   echo "File $dbFileName was created but is empty."
   exit 1
else
   echo -e "\n--> Result: success!\n"
fi

####################################################
# Test 2
####################################################

echo "------------------------------------------------------"
echo " Test 2                                               "
echo "------------------------------------------------------"
echo " --db=db, file exists, file is not overwritten        "
echo "------------------------------------------------------"

# Run
node index.cjs --db="$dbFileName" &
PID=$!
sleep 1

# Coverage
write_coverage "coverage-bash-2.json"

res=$(curl -sf localhost:$VITE_API_PORT/languages/1 -H "Content-Type: application/json")

if [ "$res" != '{"id":1,"isPractice":false,"name":"newLanguage","ordering":0}' ]; then
    echo "Result: failure!"
    echo "Database was overwritten."
    kill $PID
    exit 1
else
    echo -e "\n--> Result: success!\n"
fi

kill $PID

######################################
# Test 3
######################################

echo "------------------------------------------------------"
echo " Test 3                                               "
echo "------------------------------------------------------"
echo " --dev-mode does not start webserver                  "
echo "------------------------------------------------------"

node index.cjs --dev-mode &
PID=$!
sleep 1

# Coverage
write_coverage "coverage-bash-3.json"

if curl -sf --output /dev/null --silent --head --fail "localhost:$VITE_BASE_PORT"; then
  echo "--> Result: failure!"
  echo "URL exists: localhost:$VITE_BASE_PORT"
  kill $PID
  exit 1
else
  echo -e "\n--> Result: success!\n"
fi

kill $PID
