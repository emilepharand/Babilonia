#!/bin/bash

cleanup() {
  pkill -f "server/index.ts"
  pkill -f "index.cjs"
  pkill -f "node_modules/.bin/vite"
  rm -f temp.txt
  dir=$(basename "$PWD" | grep -q "dist" && dirname "$PWD" || echo "$PWD")
  sed -i 's@<title>Babilonius</title>@<title>Babilonia</title>@' "$dir/index.html"
  sed -i 's@API server started!@API server started.@' "$dir/server/index.ts"
}

# Cleanup previous run
cleanup

write_coverage() {
  local output_file="$1"
  curl -sf "localhost:$VITE_API_PORT/__coverage__" | cut -c13- | sed 's/.$//' > "../tests/coverage/merged/${output_file}"
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

sleep 1

# Coverage
write_coverage "coverage-bash.json"

# Create data for the next test
curl -sfq "localhost:$VITE_API_PORT/languages" -H "Content-Type: application/json" -d '{"name":"newLanguage"}' > /dev/null

dbFileSize=$(stat -c%s "$dbFileName")

# Test that database file has been created and is not empty
if [ ! -f "$dbFileName" ]; then
    echo "--> Result: failure!"
    echo "File $dbFileName was not created."
    cleanup && exit 1
elif [ ! -s "$dbFileName" ]
then 
   echo "--> Result: failure!"
   echo "File $dbFileName was created but is empty."
   cleanup && exit 1
else
   echo -e "\n--> Result: success!\n"
fi

cleanup

####################################################
# Test 2
####################################################

echo "------------------------------------------------------"
echo " Test 2                                               "
echo "--------------------------------------------------------"
echo " --db=db, file exists, file is not overwritten, is used "
echo "--------------------------------------------------------"

# Run
node index.cjs --db="$dbFileName" &

sleep 1

# Coverage
write_coverage "coverage-bash-2.json"

res=$(curl -sf localhost:$VITE_API_PORT/languages/1 -H "Content-Type: application/json")

if [ "$res" != '{"id":1,"isPractice":false,"name":"newLanguage","ordering":0}' ]; then
    echo "Result: failure!"
    echo "Database was overwritten."
    cleanup && exit 1
else
    echo -e "\n--> Result: success!\n"
fi

cleanup

######################################
# Test 3
######################################

echo "------------------------------------------------------"
echo " Test 3                                               "
echo "------------------------------------------------------"
echo " --dev-mode does not start webserver                  "
echo "------------------------------------------------------"

node index.cjs --dev-mode &

sleep 1

# Coverage
write_coverage "coverage-bash-3.json"

if curl -sf --output /dev/null --silent --head --fail "localhost:$VITE_BASE_PORT"; then
  echo "--> Result: failure!"
  echo "URL exists: localhost:$VITE_BASE_PORT"
  cleanup && exit 1
else
  echo -e "\n--> Result: success!\n"
fi

cleanup

######################################
# Test 4
######################################

cd ..


echo "------------------------------------------------------"
echo " Test 4                                               "
echo "------------------------------------------------------"
echo " Hot reload work                                      "
echo "------------------------------------------------------"

npm run dev > temp.txt &

sleep 5

indexContent=$(curl -sf localhost:$VITE_BASE_PORT_DEV)

if [ -z "$indexContent" ]; then
    echo "--> Result: failure!"
    echo "Vue did not start."
    cleanup && exit 1
elif ! curl -sf -o /dev/null "localhost:$VITE_API_PORT_DEV/languages"; then
    echo "--> Result: failure!"
    echo "API server did not start."
    cleanup && exit 1
else
    echo -e "\n--> Result: success!\n"
fi

# Trigger hot reload
sed -i 's@<title>Babilonia</title>@<title>Babilonius</title>@' index.html
sed -i 's@API server started.@API server started!@' server/index.ts

sleep 5

indexContent2=$(curl -sf localhost:$VITE_BASE_PORT_DEV)

if [[ "$indexContent" == *"Babilonia"* && "$indexContent" != *"Babilonius"* && "$indexContent2" == *"Babilonius"* && "$indexContent2" != *"Babilonia"* ]]; then
    echo -e "\n--> Result: success!\n"
else
   echo "--> Result: failure!"
    echo "Vue did not restart."
    cleanup && exit 1
fi

if ! grep -Fq "[nodemon] restarting due to changes..." "temp.txt"; then
    echo "--> Result: failure!"
    echo "API server did not restart."
    cleanup && exit 1
else
    echo -e "\n--> Result: success!\n"
fi

cleanup