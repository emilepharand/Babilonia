import {
	changeDatabaseToMemoryAndDeleteEverything,
	fetchSettings,
	setSettings,
	setSettingsAndGetResponse,
	setSettingsRawObjectAndGetResponse,
} from '../utils/fetch-utils';

beforeEach(async () => {
	await changeDatabaseToMemoryAndDeleteEverything();
});

// Valid settings are tested in tests for each feature that uses them
describe('settings API', () => {
	test('right settings returns 200', async () => {
		const settings = {randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: true, passiveMode: true, version: '2.0'};
		const r = await setSettingsAndGetResponse(settings);
		expect(r.status).toEqual(200);
		const fetchedSettings = await fetchSettings();
		expect(fetchedSettings.strictCharacters).toEqual(true);
		expect(fetchedSettings.randomPractice).toEqual(true);
	});

	test('settings are correctly set', async () => {
		const settings = {randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: true, passiveMode: true, version: '2.0'};
		await setSettings(settings);
		let fetchedSettings = await fetchSettings();
		expect(fetchedSettings.strictCharacters).toEqual(true);
		expect(fetchedSettings.randomPractice).toEqual(true);
		expect(fetchedSettings.practiceOnlyNotKnown).toEqual(true);
		expect(fetchedSettings.passiveMode).toEqual(true);
		expect(fetchedSettings.version).toEqual('2.0');
		settings.randomPractice = false;
		settings.strictCharacters = false;
		settings.practiceOnlyNotKnown = false;
		settings.passiveMode = false;
		settings.version = '2.1';
		await setSettings(settings);
		fetchedSettings = await fetchSettings();
		expect(fetchedSettings.strictCharacters).toEqual(false);
		expect(fetchedSettings.randomPractice).toEqual(false);
		expect(fetchedSettings.practiceOnlyNotKnown).toEqual(false);
		expect(fetchedSettings.passiveMode).toEqual(false);
		expect(fetchedSettings.version).toEqual('2.1');
	});

	test('settings that don\'t exist', async () => {
		const settings = {randomPractice: false, passiveMode: false, strictCharacters: false,
			practiceOnlyNotKnown: false, version: '2.0', invalidSetting: 'invalid'};
		const r = await setSettingsAndGetResponse(settings);
		expect(r.status).toEqual(400);
	});

	test('setting with wrong type', async () => {
		const settings = {randomPractice: 'no'};
		const r = await setSettingsRawObjectAndGetResponse(JSON.stringify(settings));
		expect(r.status).toEqual(400);
	});

	test('missing settings', async () => {
		const settings = {};
		const r = await setSettingsRawObjectAndGetResponse(JSON.stringify(settings));
		expect(r.status).toEqual(400);
	});
});
