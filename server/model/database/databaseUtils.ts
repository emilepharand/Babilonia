import {open, type Database} from 'sqlite';
import sqlite3 from 'sqlite3';

export async function columnExists(db: Database, tableName: string, columnName: string): Promise<boolean> {
	const query = `
        SELECT 1
        FROM   pragma_table_info('${tableName}')
        WHERE  name = '${columnName}';`;
	return await db.get(query) !== undefined;
}

export async function openDatabase(path: string) {
	const db = await open({
		filename: path,
		driver: sqlite3.Database,
	});
	await db.exec('PRAGMA foreign_keys = ON');
	return db;
}
