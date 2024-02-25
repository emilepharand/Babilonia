import DatabaseOpener from './databaseOpener';
import DataServiceProvider from './dataServiceProvider';
import fs from 'fs';
import SettingsManager from './settings/settingsManager';
import {currentVersion, memoryDatabasePath} from '../const';
import {resolveAndNormalizePathUnderWorkingDirectory} from './inputValidator';
import console from 'console';

export default class DatabaseCoordinator {
	private _dataServiceProvider!: DataServiceProvider;
	private _databaseOpener!: DatabaseOpener;
	private _needsToBeInitialized!: boolean;
	private _isValid = false;
	private _isValidPath = false;
	private _isValidVersion = true;
	private _realAbsolutePath!: string | false;

	constructor(private readonly _inputPath: string) {	}

	async init() {
		if (!this.validateAndResolveDatabasePath()) {
			return;
		}

		this._needsToBeInitialized = this.computeNeedsInitialization();

		this._databaseOpener = new DatabaseOpener(this._realAbsolutePath as string);
		try {
			await this._databaseOpener.tryOpenElseThrow();
		} catch (e) {
			console.error(e);
			return;
		}

		if (await this.setValidFlags()) {
			this._dataServiceProvider = new DataServiceProvider(this._databaseOpener.db);
			if (this._needsToBeInitialized) {
				await this.dataServiceProvider.reset();
			}
		}

		this._needsToBeInitialized = false;
	}

	private computeNeedsInitialization() {
		return this._inputPath === memoryDatabasePath
			|| !fs.existsSync(this._realAbsolutePath as string);
	}

	private validateAndResolveDatabasePath() {
		if (this._inputPath.trim() === '') {
			return false;
		}
		if (this._inputPath === memoryDatabasePath) {
			this._realAbsolutePath = memoryDatabasePath;
			return true;
		}
		this._realAbsolutePath = resolveAndNormalizePathUnderWorkingDirectory(this._inputPath);
		return this._realAbsolutePath !== false;
	}

	private async setValidFlags() {
		this._isValidPath = true;
		this._isValidVersion = await this.computeIsValidVersion();
		this._isValid = this._isValidVersion;
		return this._isValid;
	}

	private async computeIsValidVersion() {
		if (this._needsToBeInitialized) {
			return true;
		}
		const sm = new SettingsManager(this._databaseOpener.db);
		return await sm.getVersion() === currentVersion;
	}

	get isValidVersion(): boolean {
		return this._isValidVersion;
	}

	get isValid(): boolean {
		return this._isValidVersion && this._isValid;
	}

	get dataServiceProvider(): DataServiceProvider {
		return this._dataServiceProvider;
	}

	get databaseOpener(): DatabaseOpener {
		return this._databaseOpener;
	}

	get inputPath(): string {
		return this._inputPath;
	}

	get isValidPath(): boolean {
		return this._isValidPath;
	}
}
