import Ajv from 'ajv';
import type {Expression} from './expression';
import {getEmptyNexpressions} from './expression';
import type {Language} from '../languages/language';
import {getEmptyLanguageNoAsync} from '../languages/language';

export type Idea = {
	id: number;
	ee: Expression[];
	guid: string;
};

export function getEmptyIdeaArrayNoAsync(): Idea[] {
	return [{
		id: -1,
		ee: getEmptyNexpressions(1, 0, getEmptyLanguageNoAsync()),
		guid: '',
	}];
}

export function getEmptyIdeaNoAsync(): Idea {
	return {
		id: -1,
		ee: getEmptyNexpressions(1, 0, getEmptyLanguageNoAsync()),
		guid: '',
	};
}

export function getEmptyIdea(howManyExpressions: number, l: Language): Idea {
	return {
		id: -1,
		ee: getEmptyNexpressions(howManyExpressions, 0, l),
		guid: '',
	};
}

const ajv = new Ajv();

const schema = {
	type: 'object',
	properties: {
		id: {type: 'integer'},
		ee: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: {type: 'integer'},
					text: {type: 'string'},
					known: {type: 'boolean'},
					language: {
						type: 'object',
						properties: {
							id: {type: 'integer'},
							name: {type: 'string'},
							ordering: {type: 'integer'},
							isPractice: {type: 'boolean'},
						},
						required: ['id', 'name', 'ordering', 'isPractice'],
						additionalProperties: false,
					},
				},
				required: ['id', 'text', 'language'],
				additionalProperties: false,
			},
		},
	},
	required: ['id', 'ee'],
	additionalProperties: false,
};
export const validate = ajv.compile(schema);
