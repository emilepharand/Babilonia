import DatabaseHandler from '../../server/model/database/databaseHandler';

describe('test database handler', () => {
	test('closing', async () => {
		const databaseHandler = new DatabaseHandler('/');
		await databaseHandler.close();
	});
});
