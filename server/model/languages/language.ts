import Ajv from 'ajv';

export function getEmptyLanguageNoAsync(): Language {
	return {
		id: -1,
		name: '',
		ordering: 0,
		isPractice: false,
		guid: '',
	};
}

export type Language = {
	id: number;
	name: string;
	ordering: number;
	isPractice: boolean;
	guid: string;
};

export function getEmptyLanguagesNoAsync(): Language[] {
	return [{
		id: -1,
		name: '',
		ordering: 0,
		isPractice: false,
		guid: '',
	}];
}

const ajv = new Ajv();

const schema = {
	type: 'object',
	properties: {
		id: {type: 'integer'},
		name: {
			type: 'string',
		},
		ordering: {type: 'integer'},
		isPractice: {type: 'boolean'},
	},
	required: ['id', 'name', 'ordering', 'isPractice'],
	additionalProperties: false,
};
export const validate = ajv.compile(schema);

const languageForAddingSchema = {
	type: 'object',
	properties: {
		name: {type: 'string'},
	},
	required: ['name'],
	additionalProperties: false,
};
export const validateForAdding = ajv.compile(languageForAddingSchema);
