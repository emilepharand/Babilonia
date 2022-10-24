export let databasePath = 'db.db';
export let isTestMode = false;
export let isDevMode = false;
import * as dotenv from 'dotenv';

dotenv.config();

export const apiPort = process.env.VITE_API_PORT;
export const appPort = process.env.VITE_BASE_PORT;
for (const arg of process.argv) {
	if (arg.startsWith('--db=')) {
		databasePath = arg.substring(5, arg.length);
	} else if (arg === '--test-mode') {
		isTestMode = true;
		databasePath = ':memory:';
	} else if (arg === '--dev-mode') {
		isDevMode = true;
	}
}
