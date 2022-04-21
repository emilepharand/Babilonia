import Ajv from 'ajv';

export interface Settings {
  randomPractice: boolean;
}

const ajv = new Ajv();

const settingsSchema = {
	type: 'object',
	properties: {randomPractice: {type: 'boolean'}},
	required: ['randomPractice'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(settingsSchema);
