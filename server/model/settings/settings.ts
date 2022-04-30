import Ajv from 'ajv';

export interface Settings {
  randomPractice: boolean;
  strictCharacters: boolean;
}

const ajv = new Ajv();

const settingsSchema = {
	type: 'object',
	properties: {randomPractice: {type: 'boolean'}, strictCharacters: {type: 'boolean'}},
	required: ['randomPractice', 'strictCharacters'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(settingsSchema);
