import * as fs from 'fs';
import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import type {Database} from 'sqlite';

export async function initDatabase(path: string): Promise<Database> {
	const db = await open({
		filename: path,
		driver: sqlite3.Database,
	});
	console.log(`Database ${path} was opened.`);
	return db;
}

export function databaseNeedsToBeInitialized(databasePath: string): boolean {
	return databasePath === ':memory:' || !fs.existsSync(databasePath);
}
