#!/bin/bash

mkdir -p tests/coverage/merged dist/db dist/tests/db dist/tests/dir.db
cp db/base.db dist/db.db
cp tests/db/* dist/tests/db
cp dist/tests/db/old-version.db dist/tests/db/old-version-to-migrate.db

cp dist/tests/db/2.1-simple.db dist/tests/db/unwriteable.db
chmod 000 dist/tests/db/unwriteable.db
