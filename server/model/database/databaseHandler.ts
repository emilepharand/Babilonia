import * as console from 'console';
import fs from 'fs';
import {open, type Database} from 'sqlite';
import sqlite3 from 'sqlite3';
import {memoryDatabasePath} from '../../const';

export default class DatabaseHandler {
	private _db!: Database;
	constructor(private readonly _path: string) {
	}

	async open() {
		console.log(`Opening database '${this._path}'...`);
		if (this._path !== memoryDatabasePath && !fs.existsSync(this._path)) {
			console.log('Database does not exist, it will be created.');
		}
		this._db = await this.openDatabase(this._path);
		console.log('Database successfully opened.');
		return this._db;
	}

	async close() {
		console.log(`Closing database '${this._path}'...`);
		if (!this._db) {
			console.log('Database is not open, nothing to close.');
			return;
		}
		await this._db.close();
		console.log('Database successfully closed.');
	}

	private async openDatabase(path: string) {
		const db = await open({
			filename: path,
			driver: sqlite3.Database,
		});
		await db.exec('PRAGMA foreign_keys = ON');
		return db;
	}

	get db(): Database {
		return this._db;
	}
}
