import type {Database} from 'sqlite';
import type DataServiceProvider from '../dataServiceProvider';
import {version} from '../settings/settingsManager';
import DatabaseGUIDMigrator from './databaseGuidMigrator';
import {getCreateExpressionsTableQuery, getCreateIdeasTableQuery, getCreateLanguagesTableQuery} from './databaseInitializer';
import {columnExists} from './databaseUtils';

export default class DatabaseMigrator {
	constructor(private readonly _databaseToMigrate: Database,
		private readonly _baseDataServiceProvider: DataServiceProvider) {
	}

	async migrate(noContentUpdate: boolean) {
		try {
			const currentVersion = await this._baseDataServiceProvider.settingsManager.getVersion();
			console.log(`Migrating database to version ${currentVersion}...`);
			await this._databaseToMigrate.exec('BEGIN TRANSACTION;');

			const sql = 'INSERT OR REPLACE INTO settings (name, value) VALUES (?, ?);';
			await this._databaseToMigrate.run(sql, [version, currentVersion]);

			await this.migrateVersion22();

			if (!noContentUpdate) {
				await this.migrateGuids();
			}

			await this.recreateAndCopyTables();

			await this._databaseToMigrate.exec('COMMIT;');

			console.log('Migration complete.');
		} catch (error) {
			console.error('Error migrating database:', error);
			await this._databaseToMigrate.exec('ROLLBACK;');
			throw error;
		}
	}

	private async migrateVersion22(): Promise<void> {
		await this.addOrderingToExpressionTable();
		await this.createGuidColumns();
	}

	private async addOrderingToExpressionTable(): Promise<void> {
		const hasOrderingColumn = await columnExists(this._databaseToMigrate, 'expressions', 'ordering');
		if (!hasOrderingColumn) {
			await this._databaseToMigrate.exec('ALTER TABLE expressions ADD COLUMN ordering INTEGER DEFAULT 0;');
		}
		const query = `
			UPDATE expressions
			SET    ordering = (SELECT Count(*) - 1
							FROM   expressions AS e
							WHERE  e.ideaid = expressions.ideaid
									AND e.id <= expressions.id);`;
		await this._databaseToMigrate.exec(query);
	}

	private async migrateGuids(): Promise<void> {
		const guidMigrator = new DatabaseGUIDMigrator(this._databaseToMigrate, this._baseDataServiceProvider.db);
		await guidMigrator.migrateGuids();
	}

	private async createGuidColumns() {
		const promises = [];
		for (const table of ['ideas', 'expressions', 'languages']) {
			// eslint-disable-next-line no-await-in-loop
			if (!(await columnExists(this._databaseToMigrate, table, 'guid'))) {
				promises.push(this._databaseToMigrate.run(`
					ALTER TABLE ${table} ADD COLUMN guid TEXT;
					CREATE UNIQUE INDEX "${table}_guid" ON "${table}" ("guid");
				`));
			}
		}
		await Promise.all(promises);
	}

	private async recreateAndCopyTables() {
		function getTempTableName(tableTable: string) {
			return `${tableTable}_temp`;
		}
		const languages = 'languages';
		const ideas = 'ideas';
		const expressions = 'expressions';
		const tempLanguages = getTempTableName(languages);
		const tempIdeas = getTempTableName(ideas);
		const tempExpressions = getTempTableName(expressions);

		await this.renameTable(languages, tempLanguages);
		await this.renameTable(ideas, tempIdeas);
		await this.renameTable(expressions, tempExpressions);

		await this._databaseToMigrate.run(getCreateLanguagesTableQuery());
		await this._databaseToMigrate.run(getCreateIdeasTableQuery());
		await this._databaseToMigrate.run(getCreateExpressionsTableQuery());

		await this.copyTable(tempLanguages, languages);
		await this.copyTable(tempIdeas, ideas);
		await this.copyTable(tempExpressions, expressions);

		await this.dropTable(tempLanguages);
		await this.dropTable(tempIdeas);
		await this.dropTable(tempExpressions);
	}

	private async renameTable(tableName: string, newTableName: string) {
		await this._databaseToMigrate.run(`ALTER TABLE ${tableName} RENAME TO ${newTableName}`);
	}

	private async copyTable(tableFrom: string, tableTo: string) {
		await this._databaseToMigrate.run(`INSERT INTO ${tableTo} SELECT * FROM ${tableFrom}`);
	}

	private async dropTable(tableName: string) {
		await this._databaseToMigrate.run(`DROP TABLE ${tableName}`);
	}
}
