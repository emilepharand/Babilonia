import fs from 'fs';
import {Database} from 'sqlite';
import DatabaseGuidMigrator from '../../server/model/database/databaseGuidMigrator';
import DatabaseHandler from '../../server/model/database/databaseHandler';
import {clearDatabaseAndCreateSchema} from '../../server/model/database/databaseInitializer';
import {Idea} from '../../server/model/ideas/idea';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import IdeaManager from '../../server/model/ideas/ideaManager';
import LanguageManager from '../../server/model/languages/languageManager';
import {TestDatabasePath} from '../utils/versions';

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
	await openAndFillDatabase(previousDbPath, fillDatabasePreviousVersion);
	fs.copyFileSync(previousDbPath, userDbPath);
	fs.copyFileSync(previousDbPath, currentDbPath);
	await openAndFillDatabase(currentDbPath, fillCurrentVersionDatabase);
	await openAndFillDatabase(userDbPath, fillUserDatabase);
}

async function openAndFillDatabase(path: string, fillFunction: (_: Database) => Promise<void>) {
	const dbHandler = new DatabaseHandler(path);
	try {
		const db = await dbHandler.open();
		await fillFunction(db);
	} finally {
		await dbHandler.close();
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
	editExpressionByText('App And User Context Edited Expression', `App And User Context Edited Expression (${prefix} Context Edited)`);
	editExpressionByText('App And User Edited Expression', `App And User Edited Expression - ${prefix} Edited`);
	editExpressionByText(`${prefix} Context Edited Expression`, `${prefix} Context Edited Expression (${prefix} Context Edited)`);
	editExpressionByText(`${prefix} Edited Expression`, `${prefix} Edited Expression - ${prefix} Edited`);
	removeExpressionByText('App And User Deleted Expression');
	removeExpressionByText(`${prefix} Deleted Expression`);
	editedIdea.ee.push({text: `${prefix} Added Expression Language No Change`, languageId: languageNoChange!.id});
	editedIdea.ee.push({text: `${prefix} Added Expression ${prefix} Added Language`, languageId: prefix === 'App' ? languageAppAdded!.id : languageUserAdded!.id});
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

async function fillDatabasePreviousVersion(previousDb: Database) {
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
	ideaAppDeleted = await ideaManager.addIdea({ee: [{text: 'App Deleted Idea', languageId: languageNoChange.id}]});
	ideaUserDeleted = await ideaManager.addIdea({ee: [{text: 'User Deleted Idea', languageId: languageNoChange.id}]});

	await addGuids(previousDb);
}

async function fillCurrentVersionDatabase(currentDb: Database) {
	await commonUpdateCurrentAndUserDatabase(currentDb, 'App');
	await addGuids(currentDb);
}

async function fillUserDatabase(userDb: Database) {
	await commonUpdateCurrentAndUserDatabase(userDb, 'User');
}

async function commonUpdateCurrentAndUserDatabase(db: Database, prefix: string) {
	const isApp = prefix === 'App';
	const languageManager = new LanguageManager(db);
	const ideaManager = new IdeaManager(db, languageManager);
	if (isApp) {
		languageAppAdded = await languageManager.addLanguage(`${prefix} Added`);
	} else {
		languageUserAdded = await languageManager.addLanguage(`${prefix} Added`);
	}
	await commonAddIdea(ideaManager, prefix);
	await commonEditIdea(ideaManager, prefix);
	await commonEditLanguages(languageManager, prefix);
	await ideaManager.deleteIdea(isApp ? ideaAppDeleted!.id : ideaUserDeleted!.id);
	await languageManager.deleteLanguage(isApp ? languageAppDeleted!.id : languageUserDeleted!.id);
	await languageManager.deleteLanguage(languageAppAndUserDeleted!.id);
}

async function addGuids(db: Database) {
	const tableNames = ['languages', 'ideas', 'expressions'];
	const promises = tableNames.map(tableName =>
		db.run(`UPDATE ${tableName} SET guid = (printf(lower(hex(randomblob(4) || randomblob(2) || '4' || randomblob(1) || 'a' || randomblob(5))))) WHERE guid IS NULL`),
	);
	await Promise.all(promises);
}

async function migrate(userDbPath: string, currentDbPath: string) {
	const currentDbHandler = new DatabaseHandler(currentDbPath);
	const userDbHandler = new DatabaseHandler(userDbPath);
	try {
		const userDb = await userDbHandler.open();
		const currentDb = await currentDbHandler.open();
		const dbGuidMigrator = new DatabaseGuidMigrator(userDb, currentDb, {language: 0, idea: 0, expression: 0});
		await dbGuidMigrator.migrateGuids();
	} finally {
		currentDbHandler.close();
		userDbHandler.close();
	}
}

async function performAssertions(userDbPath: string) {
	const userDbHandler = new DatabaseHandler(userDbPath);
	try {
		const userDb = await userDbHandler.open();
		const languageManager = new LanguageManager(userDb);
		const ideaManager = new IdeaManager(userDb, languageManager);

		const languages = await assertLanguages(languageManager);

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

		let prefix = 'User';
		expect(getSimpleIdeaForTesting(ideas[1])).toEqual([
			{text: `${prefix} Added Idea Language No Change`, languageId: languageNoChange!.id},
			{text: `${prefix} Added Idea Language App Edited`, languageId: languageAppEdited!.id},
			{text: `${prefix} Added Idea Language User Edited`, languageId: languageUserEdited!.id},
			{text: `${prefix} Added Idea Language App And User Edited`, languageId: languageAppAndUserEdited!.id},
			{text: `${prefix} Added Idea ${prefix} Added Language`, languageId: languageUserAdded!.id},
		]);

		expect(getSimpleIdeaForTesting(ideas[2])).toEqual([
			{text: 'User Deleted Language', languageId: languageUserDeleted!.id},
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
		await userDbHandler.close();
	}
}
async function assertLanguages(languageManager: LanguageManager) {
	const languages = await languageManager.getLanguages();
	expect(languages).toHaveLength(7);
	const expectedLanguageNames = ['No Change',
		'App Edited - App Edited',
		'User Edited',
		'App And User Edited - App Edited',
		'User Deleted',
		'User Added',
		'App Added'];
	expect(languages.map(l => l.name)).toEqual(expectedLanguageNames);
	return languages;
}
