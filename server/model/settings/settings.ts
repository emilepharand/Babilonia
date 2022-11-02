import Ajv from 'ajv';

export type Settings = {
	randomPractice: boolean;
	strictCharacters: boolean;
};

export function getEmptySettingsNoAsync(): Settings {
	return {
		randomPractice: false,
		strictCharacters: false,
	};
}

const ajv = new Ajv();

const settingsSchema = {
	type: 'object',
	properties: {randomPractice: {type: 'boolean'}, strictCharacters: {type: 'boolean'}},
	required: ['randomPractice', 'strictCharacters'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(settingsSchema);
