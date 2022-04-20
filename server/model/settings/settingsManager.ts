import {Database} from 'sqlite';
import {Settings} from './settings';

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
		return setting.value === '1';
	}

	async setSettings(settings: Settings) {
		await this.setBooleanSetting('PRACTICE_RANDOM', settings.randomPractice);
	}

	async setBooleanSetting(name: string, value: boolean): Promise<void> {
		await this.db.run(
			'insert or ignore into settings (name, value) values (?,?)',
			name,
			value ? '1' : '0',
		);
		await this.db.run('update settings set value=? where name=?', value ? '1' : '0', name);
	}

	async isRandomPractice() {
		return this.getBooleanSetting('PRACTICE_RANDOM');
	}
}
