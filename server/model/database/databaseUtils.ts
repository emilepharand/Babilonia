import {type Database} from 'sqlite';

export async function columnExists(db: Database, tableName: string, columnName: string): Promise<boolean> {
	const query = `
        SELECT 1
        FROM   pragma_table_info('${tableName}')
        WHERE  name = '${columnName}';`;
	return await db.get(query) !== undefined;
}
