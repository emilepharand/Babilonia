/* eslint-disable no-unused-vars */
import fs from 'fs';
import {Database} from 'sqlite';
import DatabaseGuidMigrator from '../../server/model/database/databaseGuidMigrator';
import {clearDatabaseAndCreateSchema} from '../../server/model/database/databaseInitializer';
import {openDatabase} from '../../server/model/database/databaseUtils';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import IdeaManager from '../../server/model/ideas/ideaManager';
import LanguageManager from '../../server/model/languages/languageManager';
import {TestDatabasePath} from '../../tests/utils/versions';

describe('migration', () => {
	test('test database migration', async () => {
		const userDbPath = new TestDatabasePath('migration-user.db').getActualPath();
		const previousDbPath = new TestDatabasePath('migration-previous.db').getActualPath();
		const currentDbPath = new TestDatabasePath('migration-current.db').getActualPath();

		await fillPreviousVersionDatabase(previousDbPath);

		fs.copyFileSync(previousDbPath, userDbPath);
		fs.copyFileSync(previousDbPath, currentDbPath);

		await fillUserDatabase(userDbPath);
		await fillCurrentVersionDatabase(currentDbPath);

		await migrateDatabase(userDbPath, currentDbPath);
		const userDb = await openDatabase(userDbPath);
		expect(await userDb.all(`
			SELECT * from expressions
			WHERE text LIKE '%App Deleted%'
			AND text NOT LIKE '%User Edited%'
		`)).toHaveLength(0);
		expect(await userDb.all(`
			SELECT * from expressions
			WHERE text LIKE '%App Edited%'
			AND text NOT LIKE '%User Edited%'
			AND text NOT LIKE '%App Edited'
		`)).toHaveLength(0);
		expect(await userDb.all(`
			SELECT * from expressions
			WHERE text LIKE '%App Context Edited%'
			AND text NOT LIKE '%User Edited%'
			AND text NOT LIKE '%(App Context Edited)'
		`)).toHaveLength(0);
		expect(await userDb.all(`
			SELECT * from expressions
			WHERE text LIKE '%(App Context Edited)'
			AND guid IS NULL
		`)).toHaveLength(0);
		expect(await userDb.all(`
			SELECT * from expressions
			WHERE text LIKE '%App No Change%'
			AND text NOT LIKE '%User Edited%'
			AND guid IS NULL
		`)).toHaveLength(0);
		expect(await userDb.all(`
		SELECT substr(text, 9, 3) as expected, substr(guid, 0, 4) as actual
		FROM expressions
		WHERE text LIKE 'L-%'
		AND expected != actual
		`)).toHaveLength(0);
		expect(await userDb.all(`
		SELECT substr(text, 3, 3) as expected, substr(languages.guid, 0, 4) as actual
		FROM expressions
		LEFT JOIN languages ON expressions.languageId = languages.id
		WHERE text LIKE 'L-%'
		AND expected != actual
		`)).toHaveLength(0);

		// Number of ideas, number of expressions, number of languages
	}, 120000);
});

async function fillPreviousVersionDatabase(previousDbPath: string) {
	let previousDb;
	try {
		previousDb = await openDatabase(previousDbPath);
		await clearDatabaseAndCreateSchema(previousDb);

		const languageManager = new LanguageManager(previousDb);
		const ideaManager = new IdeaManager(previousDb, languageManager);

		const languages = [];

		const languageModificationTypes = ['No Change', 'Edited', 'Deleted'];
		for (const appModificationType of languageModificationTypes) {
			for (const userModificationType of languageModificationTypes) {
				// eslint-disable-next-line no-await-in-loop
				languages.push(await languageManager.addLanguage(`Language - App ${appModificationType} - User ${userModificationType}`));
			}
		}

		for (const language of languages) {
			let suffix = 'This language should be ';
			if (language.name.includes('App Deleted')) {
				suffix = ' deleted.';
			} else {
				suffix = ' updated or with no change.';
			}
			// eslint-disable-next-line no-await-in-loop
			await ideaManager.addIdea({ee: [{text: `Placeholder for language #${language.id}`, languageId: language.id}]});
		}

		const ideaModificationTypes = ['No Change', 'Deleted'];
		for (const appModificationType of ideaModificationTypes) {
			for (const userModificationType of ideaModificationTypes) {
				const ee = [];
				for (const language of languages) {
					ee.push({text: `Idea - App ${appModificationType} - User ${userModificationType}`, languageId: language.id});
				}
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.addIdea({ee});
			}
		}

		const ee = [];
		const expressionModificationTypes = ['No Change', 'Edited', 'Context Edited', 'Deleted'];
		for (const appModificationType of expressionModificationTypes) {
			for (const userModificationType of expressionModificationTypes) {
				for (const language of languages) {
					ee.push({text: `Expression - App ${appModificationType} - User ${userModificationType}`, languageId: language.id});
				}
			}
		}
		await ideaManager.addIdea({ee});

		await addGuids(previousDb);
	} finally {
		if (previousDb) {
			await previousDb.close();
		}
	}
}

async function fillCurrentVersionDatabase(currentDbPath: string) {
	let currentDb;
	try {
		currentDb = await openDatabase(currentDbPath);
		currentDb.exec(`
			DELETE FROM expressions
			WHERE languageId IN (
				SELECT id
				FROM languages
				WHERE name LIKE '%App Deleted%'
			)
			OR text LIKE '%App Deleted%';

			DELETE FROM languages
			WHERE name LIKE '%App Deleted%';

			DELETE FROM ideas
			WHERE ideas.id IN (
			SELECT ideas.id FROM ideas
			LEFT JOIN expressions ON ideas.id = expressions.ideaId
			WHERE expressions.ideaId IS NULL
			);

			UPDATE expressions
			SET text = text || ' (App Context Edited)'
			WHERE text LIKE '%App Context Edited%';

			UPDATE expressions
			SET text = text || ' - App Edited'
			WHERE text LIKE '%App Edited%';
			
			UPDATE languages
			SET name = name || ' - App Edited'
			WHERE name LIKE '%App Edited%';`);

		const languageManager = new LanguageManager(currentDb);
		const ideaManager = new IdeaManager(currentDb, languageManager);

		const appAddedLanguage = await languageManager.addLanguage('App Added');
		const languages = await languageManager.getLanguages();

		await ideaManager.addIdea({ee: [{text: 'Idea - App Added', languageId: appAddedLanguage.id}]});

		for (const language of languages) {
			// eslint-disable-next-line no-await-in-loop
			await ideaManager.addIdea({ee: [{text: 'Expression - App Added', languageId: language.id}]});
		}

		const ideas = await ideaManager.getIdeas();

		for (const idea of ideas) {
			if (!idea.ee.every(e => e.text.includes('App No Change'))) {
				const ifa = getIdeaForAddingFromIdea(idea);
				for (const language of languages) {
					ifa.ee.push({text: 'Expression - App Added', languageId: language.id});
				}
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.editIdea(ifa, idea.id);
			}
		}

		await addGuids(currentDb);
	} finally {
		if (currentDb) {
			await currentDb.close();
		}
	}
}

async function fillUserDatabase(userDbPath: string) {
	let userDb;
	try {
		userDb = await openDatabase(userDbPath);
		userDb.exec(`
			DELETE FROM expressions
			WHERE languageId IN (
				SELECT id
				FROM languages
				WHERE name LIKE '%User Deleted%'
			)
			OR text LIKE '%User Deleted%';

			DELETE FROM languages
			WHERE name LIKE '%User Deleted%';

			DELETE FROM ideas
			WHERE ideas.id IN (
			SELECT ideas.id FROM ideas
			LEFT JOIN expressions ON ideas.id = expressions.ideaId
			WHERE expressions.ideaId IS NULL
			);

			UPDATE expressions
			SET text = text || ' (User Context Edited)'
			WHERE text LIKE '%User Context Edited%';

			UPDATE expressions
			SET text = text || ' - User Edited',
			guid = NULL
			WHERE text LIKE '%User Edited%';
			
			UPDATE languages
			SET name = name || ' - User Edited'
			WHERE name LIKE '%User Edited%';`);

		const languageManager = new LanguageManager(userDb);
		const ideaManager = new IdeaManager(userDb, languageManager);

		const userAddedLanguage = await languageManager.addLanguage('User Added');
		const languages = await languageManager.getLanguages();

		await ideaManager.addIdea({ee: [{text: 'Idea - User Added', languageId: userAddedLanguage.id}]});

		for (const language of languages) {
			// eslint-disable-next-line no-await-in-loop
			await ideaManager.addIdea({ee: [{text: 'Expression - User Added', languageId: language.id}]});
		}

		const ideas = await ideaManager.getIdeas();
		for (const idea of ideas) {
			if (!idea.ee.every(e => e.text.includes('User No Change'))) {
				const ifa = getIdeaForAddingFromIdea(idea);
				for (const language of languages) {
					ifa.ee.push({text: 'Expression - User Added', languageId: language.id});
				}
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.editIdea(ifa, idea.id);
			}
		}
	} finally {
		if (userDb) {
			await userDb.close();
		}
	}
}

async function migrateDatabase(userDbPath: string, currentDbPath: string) {
	let userDb;
	let currentDb;
	try {
		userDb = await openDatabase(userDbPath);
		currentDb = await openDatabase(currentDbPath);
		const dbGuidMigrator = new DatabaseGuidMigrator(userDb, currentDb);
		await dbGuidMigrator.migrateGuids();
	} finally {
		if (userDb) {
			await userDb.close();
		}
		if (currentDb) {
			await currentDb.close();
		}
	}
}

async function addGuids(db: Database) {
	for (const tableName of ['languages', 'ideas', 'expressions']) {
		// eslint-disable-next-line no-await-in-loop
		await db.run(`UPDATE ${tableName} SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || '4' || randomblob(1) || 'a' || randomblob(5))))) WHERE guid IS NULL`);
	}
	await db.run(`
	UPDATE expressions 
	SET text = 'L-' || substr(languages.guid, 0, 4) || ' E-' || substr(expressions.guid, 0, 4) || ' - ' || expressions.text
	FROM expressions e
	LEFT JOIN languages ON e.languageId = languages.id where expressions.id = e.id and expressions.text NOT LIKE 'L-%'`);
}
