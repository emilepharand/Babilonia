#!/bin/bash

DB_NEW_FILENAME="newDbFile.db"

cleanup() {
  cleanup_no_db
  # Test 1
  rm -f "$(get_root_dir)/dist/$DB_NEW_FILENAME"
}

cleanup_no_db() {
  pkill -f "server/index.ts"
  pkill -f "index.cjs"
  pkill -f "node_modules/.bin/vite"
  root_dir=$(get_root_dir)
  dist_dir=$(get_dist_dir)
  rm -f "$root_dir/temp.txt"
  rm -f "$dist_dir/temp.txt"
  # Test 1
  if [ -d "$dist_dir/node_modules" ]; then
    rm -rf "$dist_dir/node_modules"
  fi
  if [ -d "$root_dir/node_modules.bak" ]; then
    mv "$root_dir/node_modules.bak" "$root_dir/node_modules"
  fi
  # Test 4
  sed -i 's@<title>Babilonius</title>@<title>Babilonia</title>@' "$root_dir/index.html"
  sed -i 's@API server started!@API server started.@' "$root_dir/server/index.ts"
}

get_root_dir() {
  # If the current directory is dist, go to the parent directory
  if basename "$PWD" | grep -q "dist"; then
    dirname "$PWD"
  else
    echo "$PWD"
  fi
}

get_dist_dir() {
  echo "$(get_root_dir)/dist"
}

go_to_root() {
  root_dir=$(get_root_dir)
  cd "$root_dir" || {
    echo "cd \"$root_dir\" failed"
    exit 1
  }
}

go_to_dist() {
  dist_dir=$(get_dist_dir)
  cd "$dist_dir" || {
    echo "cd \"$dist_dir\" failed"
    exit 1
  }
}

after_success() {
  echo -e "\n--> Result: success!\n"
  cleanup
}

after_failure() {
  echo -e "\n--> Result: failure!\n"
  echo "Content of temp.txt:"
  cat temp.txt
  cleanup && exit 1
}

coverage_file_nbr=0
write_coverage() {
  output_file="coverage-bash-${coverage_file_nbr}.json"
  ((coverage_file_nbr++))
  curl -sf "$VITE_API_URL/__coverage__" | cut -c13- | sed 's/.$//' >"../tests/coverage/merged/${output_file}"
}

echo "------------------------------------------------------"
echo " package.json version and version.txt match           "                      "
echo "------------------------------------------------------"

cleanup
go_to_root

PACKAGE_VERSION=$(node -p "require('./package.json').version")
CURRENT_VERSION=$(cat version.txt)
EXPECTED_VERSION="$CURRENT_VERSION".0

if [ "$PACKAGE_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "Version mismatch."
  echo "package.json: $PACKAGE_VERSION"
  echo "version.txt: $CURRENT_VERSION"
  after_failure
fi

after_success

echo "------------------------------------------------------"
echo " sqlite3 is not included in production build          "
echo " and package.json in dist includes sqlite3            "
echo "------------------------------------------------------"

cleanup
go_to_root

# Make sure project's node_modules is not used
mv node_modules node_modules.bak

go_to_dist

node index.cjs >temp.txt 2>&1 &

sleep 2

if ! grep -Fq "Error: Cannot find module 'sqlite3'" "temp.txt"; then
  echo "sqlite3 error not found."
  after_failure
fi

# Should install sqlite3
npm i

node index.cjs >temp.txt 2>&1 &

sleep 2

if ! grep -Fq "API server started." "temp.txt" || ! grep -Fq "App started." "temp.txt"; then
  echo "Could not start application after installing sqlite3."
  after_failure
fi

after_success

if [ "$1" == "sqlite3" ]; then
  exit 0
fi

echo "-------------------------------------------------------"
echo " --db=db, file does not exist, file is created         "
echo " when file exists, it is not overwritten, it is loaded "
echo "-------------------------------------------------------"

cleanup
go_to_dist

node index.cjs --db="$DB_NEW_FILENAME" &

sleep 1

write_coverage

# Create data for later in the test
curl -sfq "$VITE_API_URL/languages" -H "Content-Type: application/json" -d '{"name":"newLanguage"}' >/dev/null

# The database file was created and is not empty
if [ ! -f "$DB_NEW_FILENAME" ]; then
  echo "File $DB_NEW_FILENAME was not created."
  after_failure
elif [ ! -s "$DB_NEW_FILENAME" ]; then
  echo "File $DB_NEW_FILENAME was created but is empty."
  after_failure
fi

cleanup_no_db

node index.cjs --db="$DB_NEW_FILENAME" &

sleep 1

write_coverage

res=$(curl -sf "$VITE_API_URL/languages/1" -H "Content-Type: application/json")

if [ "$res" != '{"id":1,"isPractice":false,"name":"newLanguage","ordering":0}' ]; then
  echo "Database was overwritten."
  echo "Expected: {\"id\":1,\"isPractice\":false,\"name\":\"newLanguage\",\"ordering\":0}"
  echo "Actual: $res"
  after_failure
fi

after_success

echo "-------------------------------------------------------"
echo " --db=db, file is invalid                              "
echo "-------------------------------------------------------"

cleanup
go_to_dist

node index.cjs --db="/tmp/wrong.db" >temp.txt 2>&1 &

sleep 1

write_coverage

if ! grep -Fq "Invalid database path" "temp.txt"; then
  echo "Invalid database path error not found."
  after_failure
fi

res=$(curl -sf "$VITE_API_URL/database/path" -H "Content-Type: application/json")

if [ "$res" != '":memory:"' ]; then
  echo "Database was not set to memory."
  echo "Database path: $res"
  after_failure
fi

after_success

echo "-------------------------------------------------------"
echo " --db=db, old version                          "
echo "-------------------------------------------------------"

cleanup
go_to_dist

node index.cjs --db="tests/db/2.0.db" >temp.txt 2>&1 &

sleep 1

write_coverage

if ! grep -Fq "Old database version" "temp.txt"; then
  echo "Old database version error not found."
  after_failure
fi

res=$(curl -sf "$VITE_API_URL/database/path" -H "Content-Type: application/json")

if [ "$res" != '":memory:"' ]; then
  echo "Database was not set to memory."
  echo "Database path: $res"
  after_failure
fi

after_success

echo "------------------------------------------------------"
echo " --dev-mode does not start API server                 "
echo "------------------------------------------------------"

cleanup
go_to_dist

node index.cjs --dev-mode &

sleep 1

write_coverage

if curl -sf --output /dev/null --silent --head --fail "$VITE_BASE_URL"; then
  echo "URL exists: $VITE_BASE_URL"
  after_failure
fi

after_success

echo "------------------------------------------------------"
echo " Hot reload works                                     "
echo "------------------------------------------------------"

cleanup
go_to_root

npm run dev >temp.txt &

sleep 8

indexContent=$(curl -sf "$VITE_BASE_URL_DEV")

if [ -z "$indexContent" ]; then
  echo "Vue did not start."
  after_failure
elif ! curl -sf -o /dev/null "$VITE_API_URL_DEV/languages"; then
  echo "API server did not start."
  after_failure
fi

# Trigger hot reload
sed -i 's@<title>Babilonia</title>@<title>Babilonius</title>@' index.html
sed -i 's@API server started.@API server started!@' server/index.ts

sleep 8

indexContent2=$(curl -sf "$VITE_BASE_URL_DEV")

if [[ "$indexContent" == *"Babilonius"* ]]; then
  echo "Index already has the new content."
  after_failure
fi

if [[ "$indexContent2" != *"Babilonius"* || "$indexContent2" == *"Babilonia"* ]]; then
  echo "Vue server did not restart properly."
  after_failure
fi

if ! grep -Fq "[nodemon] restarting due to changes..." "temp.txt" || ! grep -Fq "API server started!" "temp.txt"; then
  echo "API server did not restart."
  after_failure
fi

after_success
