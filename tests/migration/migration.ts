import fs from 'fs';
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

		let previousDb;
		try {
			previousDb = await openDatabase(previousDbPath);
			await clearDatabaseAndCreateSchema(previousDb);

			const languageManager = new LanguageManager(previousDb);
			const ideaManager = new IdeaManager(previousDb, languageManager);

			const languages = [];

			const eventType = ['No Change', 'Edited', 'Context Edited', 'Deleted'];
			for (const t of eventType) {
				for (const t2 of eventType) {
					// eslint-disable-next-line no-await-in-loop
					languages.push(await languageManager.addLanguage(`L - App ${t} - User ${t2}`));
				}
			}

			// One idea per language
			for (const language of languages) {
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.addIdea({ee: [{text: 'Placeholder', languageId: language.id}]});
			}

			// Idea is changed
			for (const t of ['No Change', 'Deleted']) {
				for (const t2 of ['No Change', 'Deleted']) {
					const ee = [];
					for (const language of languages) {
						ee.push({text: `I - App ${t} - User ${t2}`, languageId: language.id});
					}
					// eslint-disable-next-line no-await-in-loop
					await ideaManager.addIdea({ee});
				}
			}

			// Expression is changed
			const ee = [];
			for (const t of eventType) {
				for (const t2 of eventType) {
					for (const language of languages) {
						ee.push({text: `E - App ${t} - User ${t2}`, languageId: language.id});
					}
				}
			}

			await ideaManager.addIdea({ee});

			previousDb.run('UPDATE languages SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || \'4\' || randomblob(1) || \'a\' || randomblob(5))))) WHERE guid IS NULL');
			previousDb.run('UPDATE ideas SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || \'4\' || randomblob(1) || \'a\' || randomblob(5))))) WHERE guid IS NULL');
			previousDb.run('UPDATE expressions SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || \'4\' || randomblob(1) || \'a\' || randomblob(5))))) WHERE guid IS NULL');
		} finally {
			// Check if the database is still open
			if (previousDb) {
				await previousDb.close();
			}
		}

		fs.copyFileSync(previousDbPath, userDbPath);
		fs.copyFileSync(previousDbPath, currentDbPath);

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
			SET text = text || ' (User Edited)'
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

			await ideaManager.addIdea({ee: [{text: 'I - User Added', languageId: userAddedLanguage.id}]});

			const ideas = await ideaManager.getIdeas();
			const languages = await languageManager.getLanguages();

			for (const idea of ideas) {
				const ifa = getIdeaForAddingFromIdea(idea);
				for (const language of languages) {
					ifa.ee.push({text: 'E - User Added', languageId: language.id});
				}
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.editIdea(ifa, idea.id);
			}
		} finally {
			if (userDb) {
				await userDb.close();
			}
		}

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
			SET text = text || ' (App Edited)'
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

			await ideaManager.addIdea({ee: [{text: 'I - App Added', languageId: appAddedLanguage.id}]});

			const ideas = await ideaManager.getIdeas();
			const languages = await languageManager.getLanguages();

			for (const idea of ideas) {
				const ifa = getIdeaForAddingFromIdea(idea);
				for (const language of languages) {
					ifa.ee.push({text: 'E - App Added', languageId: language.id});
				}
				// eslint-disable-next-line no-await-in-loop
				await ideaManager.editIdea(ifa, idea.id);
			}

			currentDb.exec('UPDATE languages SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || \'4\' || randomblob(1) || \'a\' || randomblob(5))))) WHERE guid IS NULL');
			currentDb.exec('UPDATE ideas SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || \'4\' || randomblob(1) || \'a\' || randomblob(5))))) WHERE guid IS NULL');
			currentDb.exec('UPDATE expressions SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || \'4\' || randomblob(1) || \'a\' || randomblob(5))))) WHERE guid IS NULL');
		} finally {
			if (currentDb) {
				await currentDb.close();
			}
		}

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
	}, 60000);
});
