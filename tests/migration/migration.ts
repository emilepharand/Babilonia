/* eslint-disable no-unused-vars */

import fs from 'fs';
import {Database} from 'sqlite';
import DatabaseGuidMigrator from '../../server/model/database/databaseGuidMigrator';
import {clearDatabaseAndCreateSchema} from '../../server/model/database/databaseInitializer';
import {openDatabase} from '../../server/model/database/databaseUtils';
import {Idea} from '../../server/model/ideas/idea';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import IdeaManager from '../../server/model/ideas/ideaManager';
import LanguageManager from '../../server/model/languages/languageManager';
import {TestDatabasePath} from '../../tests/utils/versions';

let languageNoChange;
let languageAppEdited;
let languageUserEdited;
let languageAppAndUserEdited;
let languageAppDeleted;
let languageUserDeleted;
let languageAppAndUserDeleted;
let languageAppAdded;
let languageUserAdded;

let ideaFirst;
let ideaAppDeleted;
let ideaUserDeleted;

describe('migration', () => {
	test('test database migration', async () => {
		const userDbPath = new TestDatabasePath('migration-user.db').getActualPath();
		const previousDbPath = new TestDatabasePath('migration-previous.db').getActualPath();
		const currentDbPath = new TestDatabasePath('migration-current.db').getActualPath();

		await setUpData(previousDbPath, userDbPath, currentDbPath);

		await migrate(userDbPath, currentDbPath);

		await performAssertions(userDbPath);
	}, 30000);
});

async function setUpData(previousDbPath: string, userDbPath: string, currentDbPath: string) {
	await openAndFillDatabase(previousDbPath, fillPreviousDb);
	fs.copyFileSync(previousDbPath, userDbPath);
	fs.copyFileSync(previousDbPath, currentDbPath);
	await openAndFillDatabase(currentDbPath, fillCurrentDb);
	await openAndFillDatabase(userDbPath, fillUserDb);
}

async function openAndFillDatabase(path: string, fillFunction: Function) {
	let db;
	try {
		db = await openDatabase(path);
		await fillFunction(db);
	} finally {
		if (db) {
			await db.close();
		}
	}
}

async function commonAddIdea(ideaManager: IdeaManager, prefix: string) {
	await ideaManager.addIdea({
		ee: [
			{text: `${prefix} Added Idea Language No Change`, languageId: languageNoChange!.id},
			{text: `${prefix} Added Idea Language App Edited`, languageId: languageAppEdited!.id},
			{text: `${prefix} Added Idea Language User Edited`, languageId: languageUserEdited!.id},
			{text: `${prefix} Added Idea Language App And User Edited`, languageId: languageAppAndUserEdited!.id},
			{text: `${prefix} Added Idea App Deleted Language`, languageId: languageAppDeleted!.id},
			{text: `${prefix} Added Idea User Deleted Language`, languageId: languageUserDeleted!.id},
			{text: `${prefix} Added Idea App And User Deleted Language`, languageId: languageAppAndUserDeleted!.id},
			{text: `${prefix} Added Idea ${prefix} Added Language`, languageId: prefix === 'App' ? languageAppAdded!.id : languageUserAdded!.id},
		],
	});
}

async function commonEditIdea(ideaManager: IdeaManager, prefix: string) {
	const editedIdea = getIdeaForAddingFromIdea(ideaFirst!);
	const removeExpressionByText = (text: string) => editedIdea.ee.splice(editedIdea.ee.findIndex(e => e.text === text), 1);
	const editExpressionByText = (text: string, newText: string) => {
		editedIdea.ee.find(e => e.text === text)!.text = newText;
	};
	editedIdea.ee[3].text = `App And User Context Edited Expression (${prefix} Context Edited)`;
	editedIdea.ee[6].text = `App And User Edited Expression - ${prefix} Edited`;
	removeExpressionByText('App And User Deleted Expression');
	removeExpressionByText(`${prefix} Deleted Expression`);
	editedIdea.ee.push({languageId: languageNoChange!.id, text: `${prefix} Added Expression Language No Change`});
	editedIdea.ee.push({languageId: languageAppAdded!.id, text: `${prefix} Added Expression ${prefix} Added Language`});
	editExpressionByText(`${prefix} Context Edited Expression`, `${prefix} Context Edited Expression (${prefix} Context Edited)`);
	editExpressionByText(`${prefix} Edited Expression`, `${prefix} Edited Expression - ${prefix} Edited`);
	await ideaManager.editIdea(editedIdea, ideaFirst!.id);
}

async function commonEditLanguages(languageManager: LanguageManager, prefix: string) {
	const languages = await languageManager.getLanguages();
	languages.forEach(language => {
		if (language.name === `${prefix} Edited`) {
			language.name = `${prefix} Edited - ${prefix} Edited`;
		} else if (language.name === `${prefix} And User Edited`) {
			language.name = `${prefix} And User Edited - ${prefix} Edited`;
		}
	});
	await languageManager.editLanguages(languages);
}

async function fillPreviousDb(previousDb: Database) {
	await clearDatabaseAndCreateSchema(previousDb);

	const languageManager = new LanguageManager(previousDb);
	const ideaManager = new IdeaManager(previousDb, languageManager);

	languageNoChange = await languageManager.addLanguage('No Change');
	languageAppEdited = await languageManager.addLanguage('App Edited');
	languageUserEdited = await languageManager.addLanguage('User Edited');
	languageAppAndUserEdited = await languageManager.addLanguage('App And User Edited');
	languageAppDeleted = await languageManager.addLanguage('App Deleted');
	languageUserDeleted = await languageManager.addLanguage('User Deleted');
	languageAppAndUserDeleted = await languageManager.addLanguage('App And User Deleted');

	ideaFirst = await ideaManager.addIdea({
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
			{text: 'Language App Edited', languageId: languageAppEdited.id},
			{text: 'Language User Edited', languageId: languageUserEdited.id},
			{text: 'Language App And User Edited', languageId: languageAppAndUserEdited.id},
			{text: 'App Deleted Language', languageId: languageAppDeleted.id},
			{text: 'User Deleted Language', languageId: languageUserDeleted.id},
			{text: 'App And User Deleted Language', languageId: languageAppAndUserDeleted.id}],
	});
	await ideaManager.addIdea({ee: [{text: 'App Deleted Language', languageId: languageAppDeleted.id}]});
	await ideaManager.addIdea({ee: [{text: 'User Deleted Language', languageId: languageUserDeleted.id}]});
	ideaAppDeleted = await ideaManager.addIdea({ee: [{text: 'App Deleted Idea', languageId: 1}]});
	ideaUserDeleted = await ideaManager.addIdea({ee: [{text: 'User Deleted Idea', languageId: 1}]});

	await addGuids(previousDb);
}

async function fillCurrentDb(currentDb: Database) {
	const languageManager = new LanguageManager(currentDb);
	const ideaManager = new IdeaManager(currentDb, languageManager);
	const prefix = 'App';
	languageAppAdded = await languageManager.addLanguage(`${prefix} Added`);
	await commonAddIdea(ideaManager, prefix);
	await commonEditIdea(ideaManager, prefix);
	await ideaManager.deleteIdea(ideaAppDeleted!.id);
	await languageManager.deleteLanguage(languageAppDeleted!.id);
	await languageManager.deleteLanguage(languageAppAndUserDeleted!.id);
	const languages = await commonEditLanguages(languageManager, prefix);
	await addGuids(currentDb);
}

async function fillUserDb(userDb: Database) {
	const languageManager = new LanguageManager(userDb);
	const ideaManager = new IdeaManager(userDb, languageManager);
	const prefix = 'User';
	languageUserAdded = await languageManager.addLanguage(`${prefix} Added`);
	await commonAddIdea(ideaManager, prefix);
	await commonEditIdea(ideaManager, prefix);
	await ideaManager.deleteIdea(ideaUserDeleted!.id);
	await commonEditLanguages(languageManager, prefix);
	await languageManager.deleteLanguage(languageUserDeleted!.id);
	await languageManager.deleteLanguage(languageAppAndUserDeleted!.id);
}

async function addGuids(db: Database) {
	for (const tableName of ['languages', 'ideas', 'expressions']) {
		// eslint-disable-next-line no-await-in-loop
		await db.run(`UPDATE ${tableName} SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || '4' || randomblob(1) || 'a' || randomblob(5))))) WHERE guid IS NULL`);
	}
}

async function migrate(userDbPath: string, currentDbPath: string) {
	let userDb;
	let currentDb;
	try {
		userDb = await openDatabase(userDbPath);
		currentDb = await openDatabase(currentDbPath);
		const dbGuidMigrator = new DatabaseGuidMigrator(userDb, currentDb, {language: 0, idea: 0, expression: 0});
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

async function performAssertions(userDbPath: string) {
	let userDb;
	try {
		userDb = await openDatabase(userDbPath);
		const languageManager = new LanguageManager(userDb);
		const ideaManager = new IdeaManager(userDb, languageManager);

		const languages = await languageManager.getLanguages();
		expect(languages).toHaveLength(7);

		const expectedLanguageNames = [
			'No Change',
			'App Edited - App Edited',
			'User Edited',
			'App And User Edited - App Edited',
			'User Deleted',
			'User Added',
			'App Added',
		];
		expect(languages.map(l => l.name)).toEqual(expectedLanguageNames);

		const ideas = await ideaManager.getIdeas();
		expect(ideas).toHaveLength(5);

		const languageNoChange = languages[0];
		const languageAppEdited = languages[1];
		const languageUserEdited = languages[2];
		const languageAppAndUserEdited = languages[3];
		const languageUserDeleted = languages[4];
		const languageUserAdded = languages[5];
		const languageAppAdded = languages[6];

		const getSimpleIdeaForTesting = (idea: Idea) => getIdeaForAddingFromIdea(idea).ee.map(e => ({text: e.text, languageId: e.languageId}));

		expect(getSimpleIdeaForTesting(ideas[0])).toEqual([
			{text: 'App And User No Change', languageId: languageNoChange.id},
			{text: 'App Context Edited Expression (App Context Edited)', languageId: languageNoChange.id},
			{text: 'User Context Edited Expression', languageId: languageNoChange.id},
			{text: 'App And User Context Edited Expression (App Context Edited)', languageId: languageNoChange.id},
			{text: 'App Edited Expression - App Edited', languageId: languageNoChange.id},
			{text: 'User Edited Expression - User Edited', languageId: languageNoChange.id},
			{text: 'User Edited Expression', languageId: languageNoChange.id},
			{text: 'App And User Edited Expression - User Edited', languageId: languageNoChange.id},
			{text: 'App And User Edited Expression - App Edited', languageId: languageNoChange.id},
			{text: 'User Deleted Expression', languageId: languageNoChange.id},
			{text: 'User Added Expression Language No Change', languageId: languageNoChange.id},
			{text: 'App Added Expression Language No Change', languageId: languageNoChange.id},
			{text: 'Language App Edited', languageId: languageAppEdited.id},
			{text: 'Language User Edited', languageId: languageUserEdited.id},
			{text: 'Language App And User Edited', languageId: languageAppAndUserEdited.id},
			{text: 'User Deleted Language', languageId: languageUserDeleted.id},
			{text: 'User Added Expression User Added Language', languageId: languageUserAdded.id},
			{text: 'App Added Expression App Added Language', languageId: languageAppAdded.id},
		]);

		expect(getSimpleIdeaForTesting(ideas[1])).toEqual([
			{text: 'User Deleted Language', languageId: languageUserDeleted!.id},
		]);

		let prefix = 'User';
		expect(getSimpleIdeaForTesting(ideas[2])).toEqual([
			{text: `${prefix} Added Idea Language No Change`, languageId: languageNoChange!.id},
			{text: `${prefix} Added Idea Language App Edited`, languageId: languageAppEdited!.id},
			{text: `${prefix} Added Idea Language User Edited`, languageId: languageUserEdited!.id},
			{text: `${prefix} Added Idea Language App And User Edited`, languageId: languageAppAndUserEdited!.id},
			{text: `${prefix} Added Idea ${prefix} Added Language`, languageId: languageUserAdded!.id},
		]);

		expect(getSimpleIdeaForTesting(ideas[3])).toEqual([
			{text: 'User Deleted Idea', languageId: languageNoChange!.id},
		]);

		prefix = 'App';
		expect(getSimpleIdeaForTesting(ideas[4])).toEqual([
			{text: `${prefix} Added Idea Language No Change`, languageId: languageNoChange!.id},
			{text: `${prefix} Added Idea Language App Edited`, languageId: languageAppEdited!.id},
			{text: `${prefix} Added Idea Language User Edited`, languageId: languageUserEdited!.id},
			{text: `${prefix} Added Idea Language App And User Edited`, languageId: languageAppAndUserEdited!.id},
			{text: `${prefix} Added Idea User Deleted Language`, languageId: languageUserDeleted!.id},
			{text: `${prefix} Added Idea ${prefix} Added Language`, languageId: languageAppAdded!.id},
		]);
	} finally {
		if (userDb) {
			await userDb.close();
		}
	}
}
