import {type Database} from 'sqlite';

export async function clearDatabaseAndCreateSchema(db: Database) {
	await db.run('drop table if exists expressions');
	await db.run('drop table if exists ideas');
	await db.run('drop table if exists languages');
	await db.run('drop table if exists settings');
	await db.run(
		'CREATE TABLE "languages" (\n'
        + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,\n'
        + '\t"name"\tTEXT NOT NULL,\n'
        + '\t"ordering"\tINTEGER NOT NULL,\n'
        + '\t"isPractice"\tTEXT NOT NULL\n'
        + ')',
	);
	await db.run(
		'CREATE TABLE "ideas" (\n'
        + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE\n'
        + ')',
	);
	await db.run(
		'CREATE TABLE "expressions" (\n'
        + '\t"id"\tINTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,\n'
        + '\t"ideaId"\tINTEGER NOT NULL,\n'
        + '\t"languageId"\tINTEGER NOT NULL,\n'
        + '\t"text"\tTEXT NOT NULL,\n'
        + '\t"known"\tTEXT DEFAULT 0,\n'
        + '\tFOREIGN KEY("languageId") REFERENCES "languages"("id"),\n'
        + '\tFOREIGN KEY("ideaId") REFERENCES "ideas"("id")\n'
        + ')',
	);
	await db.run(
		'CREATE TABLE "settings" (\n'
        + '"name"\tTEXT NOT NULL UNIQUE,\n'
        + '"value"\tTEXT\n'
        + ')',
	);
}
