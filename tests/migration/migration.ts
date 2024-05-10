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
		const previousDbPath = new TestDatabasePath('migration-previous.db').getActualPath();
		const userDbPath = new TestDatabasePath('migration-user.db').getActualPath();
		const currentDbPath = new TestDatabasePath('migration-current.db').getActualPath();

		await fillPreviousVersionDatabase(previousDbPath);

		fs.copyFileSync(previousDbPath, userDbPath);
		fs.copyFileSync(previousDbPath, currentDbPath);

		await fillUserDatabase(userDbPath);
		await fillCurrentVersionDatabase(currentDbPath);

		await migrateDatabase(userDbPath, currentDbPath);
	}, 60000);
});

async function fillPreviousVersionDatabase(previousDbPath: string) {
	let previousDb;
	try {
		previousDb = await openDatabase(previousDbPath);
		await clearDatabaseAndCreateSchema(previousDb);

		const languageManager = new LanguageManager(previousDb);
		const ideaManager = new IdeaManager(previousDb, languageManager);

		const languages = [];

		const modificationType = ['No Change', 'Edited', 'Context Edited', 'Deleted'];

		for (const appModificationType of modificationType) {
			for (const userModificationType of modificationType) {
				// eslint-disable-next-line no-await-in-loop
				languages.push(await languageManager.addLanguage(`Language - App ${appModificationType} - User ${userModificationType}`));
			}
		}

		for (const language of languages) {
			// eslint-disable-next-line no-await-in-loop
			await ideaManager.addIdea({ee: [{text: `Placeholder for language #${language.id}`, languageId: language.id}]});
		}

		const ideaModificationType = ['No Change', 'Deleted'];
		for (const appModificationType of ideaModificationType) {
			for (const userModificationType of ideaModificationType) {
				const ee = [];
				for (const language of languages) {
					ee.push({text: `Idea - App ${appModificationType} - User ${userModificationType}`, languageId: language.id});
				}
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.addIdea({ee});
			}
		}

		const ee = [];
		for (const appModificationType of modificationType) {
			for (const userModificationType of modificationType) {
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
					ifa.ee.push({text: 'E - App Added', languageId: language.id});
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
			SET name = name || ' - User Edited',
			guid = NULL
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
					ifa.ee.push({text: 'E - User Added', languageId: language.id});
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
	const updateGuid = async (tableName: string) => {
		await db.run(`UPDATE ${tableName} SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || '4' || randomblob(1) || 'a' || randomblob(5))))) WHERE guid IS NULL`);
	};
	['languages', 'ideas', 'expressions'].forEach(updateGuid);
}
