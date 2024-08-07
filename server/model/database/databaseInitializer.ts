import {type Database} from 'sqlite';

export async function clearDatabaseAndCreateSchema(db: Database) {
	console.log('WARNING: The database is about to be cleared and reinitialized.');
	await db.run('DROP TABLE IF EXISTS expressions');
	await db.run('DROP TABLE IF EXISTS ideas');
	await db.run('DROP TABLE IF EXISTS languages');
	await db.run('DROP TABLE IF EXISTS settings');

	await Promise.all(getSchemaQueries().map(async query => db.run(query)));
}

export function getSchemaQueries() {
	const queries = [];
	queries.push(getCreateLanguagesTableQuery());
	queries.push(getCreateIdeasTableQuery());
	queries.push(getCreateExpressionsTableQuery());
	queries.push(getCreateSettingsTableQuery());
	return queries;
}

export function getCreateLanguagesTableQuery() {
	return `CREATE TABLE "languages" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        "name" TEXT NOT NULL,
        "ordering" INTEGER NOT NULL,
        "isPractice" TEXT NOT NULL,
        "guid" TEXT
    )`;
}

export function getCreateIdeasTableQuery() {
	return `CREATE TABLE "ideas" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        "guid" TEXT UNIQUE)`;
}

export function getCreateExpressionsTableQuery() {
	return `CREATE TABLE "expressions" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        "ideaId" INTEGER NOT NULL,
        "languageId" INTEGER NOT NULL,
        "text" TEXT NOT NULL,
        "known" TEXT DEFAULT 0,
        "ordering" INTEGER DEFAULT 0,
        "guid" TEXT,
        FOREIGN KEY("languageId") REFERENCES "languages"("id"),
        FOREIGN KEY("ideaId") REFERENCES "ideas"("id")
    )`;
}

function getCreateSettingsTableQuery() {
	return `CREATE TABLE "settings" (
        "name" TEXT NOT NULL UNIQUE,
        "value" TEXT
    )`;
}
