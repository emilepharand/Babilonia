import {type Database} from 'sqlite';
import PracticeManager from '../practice/practiceManager';
import {StatsCounter} from '../stats/statsCounter';
import IdeaManager from './ideas/ideaManager';
import InputValidator from './inputValidator';
import LanguageManager from './languages/languageManager';
import SearchHandler from './search/searchHandler';
import SettingsManager from './settings/settingsManager';
import {clearDatabaseAndCreateSchema} from './databaseInitializer';
import {currentVersion} from '../const';

export default class DataServiceProvider {
	private readonly _settingsManager: SettingsManager;
	private readonly _languageManager: LanguageManager;
	private readonly _ideaManager: IdeaManager;
	private readonly _practiceManager: PracticeManager;
	private readonly _inputValidator: InputValidator;
	private readonly _searchHandler: SearchHandler;
	private readonly _statsCounter: StatsCounter;
	constructor(private readonly _db: Database, private readonly _dbPath: string) {
		this._settingsManager = new SettingsManager(this._db);
		this._languageManager = new LanguageManager(this._db);
		this._ideaManager = new IdeaManager(this._db, this._languageManager);
		this._practiceManager = new PracticeManager(this._db, this.ideaManager, this._settingsManager);
		this._inputValidator = new InputValidator(this._languageManager);
		this._searchHandler = new SearchHandler(this._db, this._ideaManager);
		this._statsCounter = new StatsCounter(this._db, this._languageManager);
	}

	get settingsManager(): SettingsManager {
		return this._settingsManager;
	}

	get languageManager(): LanguageManager {
		return this._languageManager;
	}

	get ideaManager(): IdeaManager {
		return this._ideaManager;
	}

	get practiceManager(): PracticeManager {
		return this._practiceManager;
	}

	get inputValidator(): InputValidator {
		return this._inputValidator;
	}

	get searchHandler(): SearchHandler {
		return this._searchHandler;
	}

	get statsCounter(): StatsCounter {
		return this._statsCounter;
	}

	get db(): Database {
		return this._db;
	}

	get dbPath(): string {
		return this._dbPath;
	}

	async reset() {
		await clearDatabaseAndCreateSchema(this._db);
		this._practiceManager.clear();
		await this._settingsManager.setVersion(currentVersion);
	}
}
