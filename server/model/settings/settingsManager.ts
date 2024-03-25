import type {Database} from 'sqlite';
import type {Settings} from './settings';

const practiceRandom = 'PRACTICE_RANDOM';
const strictCharacters = 'STRICT_CHARACTERS';
const practiceOnlyNotKnown = 'PRACTICE_ONLY_NOT_KNOWN';
const passiveMode = 'PASSIVE_MODE';
const enableEditing = 'ENABLE_EDITING';
export const version = 'VERSION';

export default class SettingsManager {
	constructor(private readonly db: Database) {
	}

	async getSetting(name: string) {
		const setting: {value: string} = (await this.db.get(
			'select value from settings where name=?',
			name,
		))!;
		return setting?.value;
	}

	async getBooleanSetting(name: string) {
		const setting = await this.getSetting(name);
		return setting === '1';
	}

	async setSettings(settings: Settings) {
		await this.setBooleanSetting(practiceRandom, settings.randomPractice);
		await this.setBooleanSetting(strictCharacters, settings.strictCharacters);
		await this.setBooleanSetting(enableEditing, settings.enableEditing);
		await this.setBooleanSetting(
			practiceOnlyNotKnown,
			settings.practiceOnlyNotKnown,
		);
		await this.setBooleanSetting(passiveMode, settings.passiveMode);
		await this.setSetting(version, settings.version);
	}

	async setSetting(name: string, value: string) {
		await this.db.run(
			'insert or ignore into settings (name, value) values (?,?)',
			name,
			value,
		);
		await this.db.run('update settings set value=? where name=?', value, name);
	}

	async setBooleanSetting(name: string, value: boolean) {
		await this.setSetting(name, value ? '1' : '0');
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

	async setVersion(versionValue: string) {
		await this.setSetting(version, versionValue);
	}

	async getVersion() {
		return this.getSetting(version);
	}

	async isStrictCharacters() {
		return this.getBooleanSetting(strictCharacters);
	}

	async isEnableEditing() {
		return this.getBooleanSetting(enableEditing);
	}

	async getSettings() {
		return {
			randomPractice: await this.isRandomPractice(),
			strictCharacters: await this.isStrictCharacters(),
			practiceOnlyNotKnown: await this.isPracticeOnlyNotKnown(),
			passiveMode: await this.isPassiveMode(),
			version: await this.getVersion(),
			enableEditing: await this.isEnableEditing(),
		};
	}
}
