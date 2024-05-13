
import fs from 'fs';
import {Database} from 'sqlite';
import DatabaseGuidMigrator from '../../server/model/database/databaseGuidMigrator';
import {clearDatabaseAndCreateSchema} from '../../server/model/database/databaseInitializer';
import {openDatabase} from '../../server/model/database/databaseUtils';
import IdeaManager from '../../server/model/ideas/ideaManager';
import LanguageManager from '../../server/model/languages/languageManager';
import {TestDatabasePath} from '../../tests/utils/versions';

describe('migration', () => {
	test('test database migration', async () => {
		const userDbPath = new TestDatabasePath('migration-user.db').getActualPath();
		const previousDbPath = new TestDatabasePath('migration-previous.db').getActualPath();
		const currentDbPath = new TestDatabasePath('migration-current.db').getActualPath();

		let previousDb;
		try {
			previousDb = await openDatabase(previousDbPath);

			await clearDatabaseAndCreateSchema(previousDb);

			const languageManager = new LanguageManager(previousDb);
			const ideaManager = new IdeaManager(previousDb, languageManager);

			const languageNoChange = await languageManager.addLanguage('No Change');
			const languageAppEdited = await languageManager.addLanguage('App Edited');
			const languageUserEdited = await languageManager.addLanguage('User Edited');
			const languageAppAndUserEdited = await languageManager.addLanguage('App And User Edited');
			const languageAppDeleted = await languageManager.addLanguage('App Deleted');
			const languageUserDeleted = await languageManager.addLanguage('User Deleted');
			const languageAppAndUserDeleted = await languageManager.addLanguage('App And User Deleted');

			await ideaManager.addIdea({
				ee: [{text: 'App And User No Change', languageId: languageNoChange.id},
					{text: 'App Context Edited Expression', languageId: languageNoChange.id},
					{text: 'User Context Edited Expression', languageId: languageNoChange.id},
					{text: 'App And User Context Edited Expression', languageId: languageNoChange.id},
					{text: 'App Edited Expression', languageId: languageNoChange.id},
					{text: 'User Edited Expression', languageId: languageNoChange.id},
					{text: 'App And User Edited Expression', languageId: languageNoChange.id},
					{text: 'App Deleted Expression', languageId: languageNoChange.id},
					{text: 'User Deleted Expression', languageId: languageNoChange.id},
					{text: 'App And User Deleted Expression', languageId: languageNoChange.id},
					{text: 'App Deleted Language', languageId: languageAppDeleted.id},
					{text: 'User Deleted Language', languageId: languageUserDeleted.id},
					{text: 'App And User Deleted Language', languageId: languageAppAndUserDeleted.id}],
			});
			await ideaManager.addIdea({ee: [{text: 'App Deleted Language', languageId: 3}]});
			await ideaManager.addIdea({ee: [{text: 'User Deleted Language', languageId: 3}]});
			await ideaManager.addIdea({
				ee: [{text: 'Language App Edited', languageId: languageAppEdited.id},
					{text: 'Language User Edited', languageId: languageUserEdited.id},
					{text: 'Language App And User Edited', languageId: languageAppAndUserEdited.id}],
			});

			await addGuids(previousDb);
		} finally {
			if (previousDb) {
				await previousDb.close();
			}
		}

		fs.copyFileSync(previousDbPath, userDbPath);
		fs.copyFileSync(previousDbPath, currentDbPath);

		let currentDb;
		try {
			currentDb = await openDatabase(currentDbPath);

			const languageManager = new LanguageManager(currentDb);
			const ideaManager = new IdeaManager(currentDb, languageManager);
			const appAddedLanguage = await languageManager.addLanguage('App Added');
			await ideaManager.addIdea({ee: [{text: 'App Added Expression', languageId: appAddedLanguage.id}]});

			await addGuids(currentDb);
		} finally {
			if (currentDb) {
				await currentDb.close();
			}
		}

		await migrateDatabase(userDbPath, currentDbPath);

		let userDb;
		try {
			userDb = await openDatabase(userDbPath);
			const languageManager = new LanguageManager(userDb);
			const ideaManager = new IdeaManager(userDb, languageManager);

			const languages = await languageManager.getLanguages();
			expect(languages.length).toBe(8);

			const ideas = await ideaManager.getIdeas();
			expect(ideas.length).toBe(5);
		} finally {
			if (userDb) {
				await userDb.close();
			}
		}
	}, 30000);
});

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
}
