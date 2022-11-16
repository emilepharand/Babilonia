import Ajv from 'ajv';

export type Settings = {
	randomPractice: boolean;
	strictCharacters: boolean;
	practiceOnlyNotKnown: boolean;
	passiveMode: boolean;
};

export function getEmptySettingsNoAsync(): Settings {
	return {
		randomPractice: false,
		strictCharacters: false,
		practiceOnlyNotKnown: false,
		passiveMode: false,
	};
}

const ajv = new Ajv();

const settingsSchema = {
	type: 'object',
	properties: {randomPractice: {type: 'boolean'},
		strictCharacters: {type: 'boolean'},
		practiceOnlyNotKnown: {type: 'boolean'},
		passiveMode: {type: 'boolean'},
	},
	required: ['randomPractice', 'strictCharacters', 'practiceOnlyNotKnown', 'passiveMode'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(settingsSchema);
