import * as console from 'console';
import fs from 'fs';
import type {Database} from 'sqlite';
import {memoryDatabasePath} from '../../const';
import {openDatabase} from './databaseUtils';

export default class DatabaseOpener {
	private _db!: Database;
	constructor(private readonly _path: string) {
	}

	async tryOpenElseThrow() {
		console.log(`Opening database '${this._path}'...`);
		if (this._path !== memoryDatabasePath && !fs.existsSync(this._path)) {
			console.log('Database does not exist, it will be created.');
		}
		this._db = await openDatabase(this._path);
		// No error was thrown, so the database was successfully opened
		console.log('Database was successfully opened.');
	}

	get db(): Database {
		return this._db;
	}
}
