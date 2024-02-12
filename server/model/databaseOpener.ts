import fs from 'fs';
import type {Database} from 'sqlite';
import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import * as console from 'console';

export default class DatabaseOpener {
	private _db!: Database;
	constructor(private readonly _path: string) {
	}

	async tryOpenElseThrow() {
		if (this._path !== ':memory:') {
			console.log(`Opening database '${this._path}'...`);
			if (!fs.existsSync(this._path)) {
				console.log('Database does not exist, it will be created.');
			}
		}
		this._db = await open({
			filename: this._path,
			driver: sqlite3.Database,
		});
		// No error was thrown, so the database was successfully opened
		console.log('Database was successfully opened.');
	}

	get db(): Database {
		return this._db;
	}
}
