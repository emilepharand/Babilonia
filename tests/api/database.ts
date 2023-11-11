import {changeDatabase, changeDatabaseToMemoryAndDeleteEverything, fetchLanguages} from '../utils/fetch-utils';

beforeEach(async () => {
	await changeDatabaseToMemoryAndDeleteEverything();
});

describe('2.0', () => {
	test('change database', async () => {
		let ll = await fetchLanguages();
		expect(ll).toHaveLength(0);
		await changeDatabase('../tests/db/2.0.db');
		ll = await fetchLanguages();
		expect(ll).toHaveLength(1);
		expect(ll[0]).toEqual({id: 1, name: '2.0-l1', ordering: 0, isPractice: true});
	});
});
