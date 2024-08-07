import {Settings} from '../../server/model/settings/settings';

export function settingsFromPartial(partialSettings: Partial<Settings>) {
	return {
		passiveMode: partialSettings.passiveMode ? partialSettings.passiveMode : false,
		practiceOnlyNotKnown: partialSettings.practiceOnlyNotKnown ? partialSettings.practiceOnlyNotKnown : false,
		randomPractice: partialSettings.randomPractice ? partialSettings.randomPractice : false,
		strictCharacters: partialSettings.strictCharacters ? partialSettings.strictCharacters : false,
	};
}

export function areInSameOrder(arr1: any[], arr2: any[]): boolean {
	return arr1.length === arr2.length && arr1.every((item, index) => item === arr2[index]);
}

export async function executeNTimes(n: number, fn: () => void) {
	await Promise.all(Array.from({length: n}, () => fn()));
}

export function getRandomString(): string {
	return Math.random().toString(36).substring(10);
}
