import * as fs from 'fs';
import type {Database} from 'sqlite';
import {open} from 'sqlite';
import sqlite3 from 'sqlite3';

export async function openDatabase(path: string): Promise<Database> {
	if (path !== ':memory:' && !fs.existsSync(path)) {
		console.log(`Database ${path} does not exist, it will be created.`);
	}
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
