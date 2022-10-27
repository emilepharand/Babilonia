import Ajv from 'ajv';

export function getEmptyLanguageNoAsync(): Language {
	return {
		id: -1,
		name: '',
		ordering: 0,
		isPractice: false,
	};
}

export interface Language {
  id: number;
  name: string;
  ordering: number;
  // SQLite doesn't have booleans
  isPractice: boolean | '0' | '1';
}

export function copy(l: Language): Language {
	return {
		id: l.id,
		name: l.name,
		ordering: l.ordering,
		isPractice: l.isPractice,
	};
}

export function getEmptyLanguagesNoAsync(): Language[] {
	return [{
		id: -1,
		name: '',
		ordering: 0,
		isPractice: false,
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
