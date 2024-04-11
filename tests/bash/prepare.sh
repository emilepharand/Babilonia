#!/bin/bash

CURRENT_VERSION=$(cat version.txt)

rm -rf dist/tests/db
mkdir -p tests/coverage/merged dist/db dist/tests/db dist/tests/dir.db
cp db/base.db dist/db.db
cp db/base.db dist/tests/db/$CURRENT_VERSION.db
cp tests/db/* dist/tests/db

cp dist/tests/db/$CURRENT_VERSION.db dist/tests/db/unwriteable.db
chmod 000 dist/tests/db/unwriteable.db
