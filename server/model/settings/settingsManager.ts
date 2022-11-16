import type {Database} from 'sqlite';
import type {Settings} from './settings';

const practiceRandom = 'PRACTICE_RANDOM';
const mapCharacters = 'MAP_CHARACTERS';
const practiceOnlyNotKnown = 'PRACTICE_ONLY_NOT_KNOWN';
const passiveMode = 'PASSIVE_MODE';

export default class SettingsManager {
	constructor(private readonly db: Database) {}

	async getBooleanSetting(name: string): Promise<boolean> {
		const setting: {value: string} = (await this.db.get(
			'select value from settings where name=?',
			name,
		))!;
		if (setting === undefined) {
			return false;
		}
		return setting.value === '1';
	}

	async setSettings(settings: Settings) {
		await this.setBooleanSetting(practiceRandom, settings.randomPractice);
		await this.setBooleanSetting(mapCharacters, settings.strictCharacters);
		await this.setBooleanSetting(
			practiceOnlyNotKnown,
			settings.practiceOnlyNotKnown,
		);
		await this.setBooleanSetting(passiveMode, settings.passiveMode);
	}

	async setBooleanSetting(name: string, value: boolean): Promise<void> {
		await this.db.run(
			'insert or ignore into settings (name, value) values (?,?)',
			name,
			value ? '1' : '0',
		);
		await this.db.run(
			'update settings set value=? where name=?',
			value ? '1' : '0',
			name,
		);
	}

	async isRandomPractice() {
		return this.getBooleanSetting(practiceRandom);
	}

	async isPracticeOnlyNotKnown() {
		return this.getBooleanSetting(practiceOnlyNotKnown);
	}

	async isPassiveMode() {
		return this.getBooleanSetting(passiveMode);
	}

	async getSettings(): Promise<Settings> {
		return {
			randomPractice: await this.isRandomPractice(),
			strictCharacters: await this.isStrictCharacters(),
			practiceOnlyNotKnown: await this.isPracticeOnlyNotKnown(),
			passiveMode: await this.isPassiveMode(),
		};
	}

	private async isStrictCharacters() {
		return this.getBooleanSetting(mapCharacters);
	}
}
