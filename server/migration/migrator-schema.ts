import {ideaManager, initDb, languageManager} from '../model/dataServiceProvider';
import type {Database} from 'sqlite';

const baseDatabasePath = 'db/base.db';

export async function migrateDatabase(currentDatabase: Database): Promise<void> {
	if (!(await columnExists(currentDatabase, 'ideas', 'guid'))) {
		await currentDatabase.run('ALTER TABLE ideas ADD COLUMN guid TEXT');
		await currentDatabase.run('CREATE UNIQUE INDEX "ideas_guid" ON "ideas" ("guid")');
	}
	if (!(await columnExists(currentDatabase, 'expressions', 'guid'))) {
		await currentDatabase.run('ALTER TABLE expressions ADD COLUMN guid TEXT');
		await currentDatabase.run('CREATE UNIQUE INDEX "expressions_guid" ON "expressions" ("guid")');
	}
	if (!(await columnExists(currentDatabase, 'languages', 'guid'))) {
		await currentDatabase.run('ALTER TABLE languages ADD COLUMN guid TEXT');
		await currentDatabase.run('CREATE UNIQUE INDEX "languages_guid" ON "languages" ("guid")');
	}

	// Make sure to take into account that 2.0 did not have GUID columns
	// So for them we need to use the id column

	// That operation compares the current database with the built-in database and :
	// Unmatched GUIDs are deleted
	// Matched GUIDs are updated
	// New GUIDs are added
	// Items without GUID remain untouched

	let sqlToRun = '';

	await initDb(baseDatabasePath);

	for (const baseLanguage of await languageManager.getLanguages()) {
		// eslint-disable-next-line no-await-in-loop
		if (await idExists(currentDatabase, 'languages', baseLanguage.id)) {
			sqlToRun += `UPDATE languages SET guid="${baseLanguage.guid}" WHERE id=${baseLanguage.id};\n`;
		} else {
			sqlToRun += `INSERT INTO languages (guid) VALUES ("${baseLanguage.guid}");\n`;
		}
	}

	for (const baseIdea of await ideaManager.getIdeas()) {
		// eslint-disable-next-line no-await-in-loop
		if (await idExists(currentDatabase, 'ideas', baseIdea.id)) {
			sqlToRun += `UPDATE ideas SET guid="${baseIdea.guid}" WHERE id=${baseIdea.id};\n`;
		} else {
			sqlToRun += `INSERT INTO ideas (guid) VALUES ("${baseIdea.guid}");\n`;
		}
		for (const baseExpression of baseIdea.ee) {
			// eslint-disable-next-line no-await-in-loop
			if (await idExists(currentDatabase, 'ideas', baseIdea.id)) {
				sqlToRun += `DELETE FROM expressions WHERE id=${baseExpression.id};\n`;
			}
			sqlToRun += `INSERT INTO expressions (ideaId, languageId, text, known, guid) VALUES (${baseIdea.id}, ${baseExpression.language.id}, "${baseExpression.text}", ${baseExpression.known ? '1' : '0'}, "${baseExpression.guid}");\n`;
		}
	}

	await currentDatabase.run(sqlToRun);
}

// UPDATE ideas
// SET guid = (
//   printf(
//     lower(hex(randomblob(4) || randomblob(2) || '4' || randomblob(1) || 'a' || randomblob(5)))
//   )
// );

export async function idExists(db: Database, tableName: string, id: number): Promise<boolean> {
	const query = `select count(*) as idExists from ${tableName} where id=${id}`;
	return ((await db.get(query))!).idExists === 1;
}

export async function guidExists(db: Database, tableName: string, guid: string): Promise<boolean> {
	const query = `select count(*) as guidExists from ${tableName} where guid="${guid}"`;
	return ((await db.get(query))!).guidExists === 1;
}

export async function columnExists(db: Database, tableName: string, columnName: string): Promise<boolean> {
	const query = `select count(*) as columnExists from pragma_table_info("${tableName}") where name="${columnName}"`;
	return ((await db.get(query))!).columnExists === 1;
}
