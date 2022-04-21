import {
	deleteEverything,
	setSettingsAndGetResponse,
	setSettingsRawObjectAndGetResponse,
} from '../utils/utils';

beforeEach(async () => {
	await deleteEverything();
});

// Valid settings are tested in tests for each feature that uses them
describe('settings API', () => {
	test('right settings returns 200', async () => {
		const settings = {randomPractice: false};
		const r = await setSettingsAndGetResponse(settings);
		expect(r.status).toEqual(200);
	});

	test('settings that don\'t exist', async () => {
		const settings = {randomPractice: false, invalidSetting: 'invalid'};
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
