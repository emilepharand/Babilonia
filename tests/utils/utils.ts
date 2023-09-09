import {Settings} from '../../server/model/settings/settings';

export function settingsFromPartial(partialSettings: Partial<Settings>) {
	return {
		passiveMode: partialSettings.passiveMode ? partialSettings.passiveMode : false,
		practiceOnlyNotKnown: partialSettings.practiceOnlyNotKnown ? partialSettings.practiceOnlyNotKnown : false,
		randomPractice: partialSettings.randomPractice ? partialSettings.randomPractice : false,
		strictCharacters: partialSettings.strictCharacters ? partialSettings.strictCharacters : false,
	};
}

export function areInSameOrder(arr1: any[], arr2: any[]) {
	let i = 0;
	let idsInSameOrder = true;
	while (i < 10 && idsInSameOrder) {
		if (!(arr1[i] === arr2[i])) {
			idsInSameOrder = false;
		}
		i++;
	}
	return idsInSameOrder;
}

export async function executeNTimes(n: number, fn: () => void) {
	await Promise.all(Array.from({length: n}, () => fn()));
}
