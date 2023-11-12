// Import {ideaManager, languageManager} from 'server/model/dataServiceProvider';
// import {initDatabase} from '../model/databaseOpener';
import type {Database} from 'sqlite';

// Const baseDatabasePath = 'db/base.db';

export async function migrateDatabase(db: Database): Promise<void> {
	if (!(await columnExists(db, 'ideas', 'guid'))) {
		await db.run('ALTER TABLE ideas ADD COLUMN guid TEXT');
		await db.run('CREATE UNIQUE INDEX "ideas_guid" ON "ideas" ("guid")');
	}
	if (!(await columnExists(db, 'expressions', 'guid'))) {
		await db.run('ALTER TABLE expressions ADD COLUMN guid TEXT');
		await db.run('CREATE UNIQUE INDEX "expressions_guid" ON "expressions" ("guid")');
	}
	if (!(await columnExists(db, 'languages', 'guid'))) {
		await db.run('ALTER TABLE languages ADD COLUMN guid TEXT');
		await db.run('CREATE UNIQUE INDEX "languages_guid" ON "languages" ("guid")');
	}

	// Make sure to take into account that 2.0 did not have GUID columns
	// So for them we need to use the id column

	// That operation compares the current database with the built-in database and :
	// Unmatched GUIDs are deleted
	// Matched GUIDs are updated
	// New GUIDs are added
	// Items without GUID remain untouched

	// const sqlToRun = '';

	// const baseDb = await initDatabase(baseDatabasePath);
	// const languages = await languageManager.getLanguages();
	// for (const language of languages) {
	// 	if (!(await guidExists(db, 'languages', language.guid))) {
	// 		sqlToRun += `INSERT INTO languages (name, guid) VALUES ("${language.name}", "${language.guid}"`;
	// 	}
	// }
	// const ideas = ideaManager.getIdeas();
	// const expressions = ideaManager.getExpressions();
}

// UPDATE ideas
// SET guid = (
//   printf(
//     lower(hex(randomblob(4) || randomblob(2) || '4' || randomblob(1) || 'a' || randomblob(5)))
//   )
// );

export async function guidExists(db: Database, tableName: string, guid: string): Promise<boolean> {
	const query = `select count(*) as guidExists from ${tableName} where guid="${guid}"`;
	return ((await db.get(query))!).guidExists === 1;
}

export async function columnExists(db: Database, tableName: string, columnName: string): Promise<boolean> {
	const query = `select count(*) as columnExists from pragma_table_info("${tableName}") where name="${columnName}"`;
	return ((await db.get(query))!).columnExists === 1;
}
