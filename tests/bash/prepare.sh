#!/bin/bash

CURRENT_VERSION=$(cat version.txt)

rm -rf dist/tests/db
mkdir -p tests/coverage/merged dist/db dist/tests/db dist/tests/db/dir.db
cp db/base.db dist/db/base.db
cp db/base.db "dist/tests/db/$CURRENT_VERSION.db"
cp tests/db/* dist/tests/db

cp "dist/tests/db/$CURRENT_VERSION.db" dist/tests/db/unwriteable.db
cp "dist/tests/db/2.0.db" dist/tests/db/spare-2.0.db
chmod 000 dist/tests/db/unwriteable.db
