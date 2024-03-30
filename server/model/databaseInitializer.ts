import {type Database} from 'sqlite';

export async function clearDatabaseAndCreateSchema(db: Database) {
	console.log('WARNING: The database is about to be cleared and reinitialized.');
	await db.run('DROP TABLE IF EXISTS expressions');
	await db.run('DROP TABLE IF EXISTS ideas');
	await db.run('DROP TABLE IF EXISTS languages');
	await db.run('DROP TABLE IF EXISTS settings');
	await db.run(`
        CREATE TABLE "languages" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "name" TEXT NOT NULL,
            "ordering" INTEGER NOT NULL,
            "isPractice" TEXT NOT NULL
        )
    `);
	await db.run(`
        CREATE TABLE "ideas" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE
        )
    `);
	await db.run(`
        CREATE TABLE "expressions" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
            "ideaId" INTEGER NOT NULL,
            "languageId" INTEGER NOT NULL,
            "text" TEXT NOT NULL,
            "known" TEXT DEFAULT 0,
            "ordering" INTEGER NOT NULL,
            FOREIGN KEY("languageId") REFERENCES "languages"("id"),
            FOREIGN KEY("ideaId") REFERENCES "ideas"("id")
        )
    `);
	await db.run(`
        CREATE TABLE "settings" (
            "name" TEXT NOT NULL UNIQUE,
            "value" TEXT
        )
    `);
}
