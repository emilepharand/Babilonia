import fs from 'fs';
import type {Database} from 'sqlite';
import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import * as console from 'console';

export default class DatabaseOpener {
	private _db!: Database;
	private readonly _needsToBeInitialized;
	constructor(private readonly _inputPath: string, private readonly _realAbsolutePath: string) {
		this._needsToBeInitialized = this._realAbsolutePath === ':memory:' || !fs.existsSync(this._realAbsolutePath);
	}

	async tryOpenElseThrow() {
		console.log(`Trying to open database '${this._inputPath}' ('${this._realAbsolutePath}')...`);
		if (this._realAbsolutePath !== ':memory:') {
			if (!fs.existsSync(this._realAbsolutePath)) {
				console.log(`Database '${this._inputPath}' does not exist, it will be created.`);
			}
		}
		this._db = await open({
			filename: this._realAbsolutePath,
			driver: sqlite3.Database,
		});
		// No error was thrown, so the database was successfully opened
		console.log(`Database '${this._inputPath}' was successfully opened.`);
	}

	get db(): Database {
		return this._db;
	}

	get inputPath(): string {
		return this._inputPath;
	}

	get needsToBeInitialized() {
		return this._needsToBeInitialized;
	}
}
