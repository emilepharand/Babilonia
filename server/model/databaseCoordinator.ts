import DatabaseOpener from './databaseOpener';
import DataServiceProvider from './dataServiceProvider';
import * as console from 'console';
import fs from 'fs';
import SettingsManager from './settings/settingsManager';
import {currentVersion} from '../const';

export default class DatabaseCoordinator {
	private _dataServiceProvider!: DataServiceProvider;
	private readonly _databaseOpener: DatabaseOpener;
	private _needsToBeInitialized: boolean;
	private _isValid = false;
	private _isValidVersion = false;

	constructor(private readonly _inputPath: string, private readonly _realAbsolutePath: string) {
		console.log('Changing database to ' + _realAbsolutePath);
		this._needsToBeInitialized = this._realAbsolutePath === ':memory:' || !fs.existsSync(this._realAbsolutePath);
		this._databaseOpener = new DatabaseOpener(this._inputPath, _realAbsolutePath);
		console.log(`Debug: needsToBeInitialized: ${this._needsToBeInitialized}`);
	}

	async init() {
		try {
			await this._databaseOpener.tryOpenElseThrow();
		} catch (e) {
			// _isValid remains false
			return;
		}
		console.log(`Debug: isValid: ${this._isValid}`);
		this._isValidVersion = await this.computeValidVersion();
		console.log(`Debug: isValidVersion: ${this._isValidVersion}`);
		this._isValid = this._isValidVersion;
		this._dataServiceProvider = new DataServiceProvider(this._databaseOpener.db, this._inputPath);
		if (this._needsToBeInitialized) {
			await this.dataServiceProvider.reset();
		}
		this._needsToBeInitialized = false;
	}

	private async computeValidVersion() {
		if (this._needsToBeInitialized) {
			return true;
		}
		const sm = new SettingsManager(this._databaseOpener.db);
		console.log(`Debug: currentVersion: ${currentVersion}`);
		console.log(`Debug: getVersion: ${await sm.getVersion()}`);
		return await sm.getVersion() === currentVersion;
	}

	get isValidVersion(): boolean {
		return this._isValidVersion;
	}

	get isValid(): boolean {
		return this._isValid;
	}

	get dataServiceProvider(): DataServiceProvider {
		return this._dataServiceProvider;
	}
}
