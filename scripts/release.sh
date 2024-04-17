#!/bin/bash

VERSION=$(node -p "require('./package.json').version")
if [[ "$VERSION" == *-dev ]]; then
    echo -e "\n\e[1;33m\nWARNING: The version in package.json ends with -dev."
    echo -e "If this is a release version, remove -dev from the version number.\e[0m\n"
fi

rm -rf node_modules release
npm i
npm run build
mkdir -p release
cd dist || exit 1
zip -r "$VERSION.zip" -- *
mv "$VERSION.zip" ../release
