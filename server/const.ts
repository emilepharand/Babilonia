import fs from 'fs';
export const currentVersion = fs.readFileSync('../version.txt', 'utf8');
export const memoryDatabasePath = ':memory:';
export const databaseVersionErrorCode = 'DATABASE_VERSION';
export const baseDatabasePath = 'db/base.db';
export const minimumExpectedLanguages = 5;
export const minimumExpectedIdeas = 518;
export const minimumExpectedExpressions = 2751;
