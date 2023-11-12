import Ajv from 'ajv';

export type Settings = {
	randomPractice: boolean;
	strictCharacters: boolean;
	practiceOnlyNotKnown: boolean;
	passiveMode: boolean;
	version: string;
};

export function getEmptySettingsNoAsync(): Settings {
	return {
		randomPractice: false,
		strictCharacters: false,
		practiceOnlyNotKnown: false,
		passiveMode: false,
		version: '2.0',
	};
}

const ajv = new Ajv();

export const settingsSchema = {
	type: 'object',
	properties: {randomPractice: {type: 'boolean'},
		strictCharacters: {type: 'boolean'},
		practiceOnlyNotKnown: {type: 'boolean'},
		passiveMode: {type: 'boolean'},
		version: {type: 'string'},
	},
	required: ['randomPractice', 'strictCharacters', 'practiceOnlyNotKnown', 'passiveMode', 'version'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(settingsSchema);
