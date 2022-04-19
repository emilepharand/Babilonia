import {Database} from 'sqlite';

export default class SettingsManager {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async getBooleanSetting(name: string): Promise<boolean> {
		const setting = await this.db.get('select value from settings where name=?', name);
		if (setting === undefined) {
			return false;
		}
		return setting as boolean;
	}

	async setBooleanSetting(name: string, value: string): Promise<void> {
		await this.db.run('update setttings set ?=?', name, value);
	}
}
