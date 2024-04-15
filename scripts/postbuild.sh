cp db/base.db dist/db.db

VERSION=$(node -p "require('./package.json').version")
SQLITE3_VERSION=$(node -p "require('./package.json').dependencies.sqlite3" | sed 's/\\^//g')

cat <<EOF >dist/package.json
{
    "name": "babilonia-release",
    "version": "$VERSION",
    "dependencies": {
        "sqlite3": "$SQLITE3_VERSION"
    },
    "scripts": {
        "start": "node index.cjs"
    }
}
EOF
