import Ajv from 'ajv';
import {Expression, getEmptyNExpressions} from './expression';
import {getEmptyLanguage, Language} from '../languages/language';

export interface Idea {
  id: number;
  ee: Expression[];
}

export class Idea {
	constructor(id: number, ee: Expression[]) {
		this.id = id;
		this.ee = ee;
	}
}

export function getEmptyIdeaArrayNoAsync(): Idea[] {
	return [{
		id: -1,
		ee: getEmptyNExpressions(1, 0, getEmptyLanguage()),
	}];
}

export function getEmptyIdeaNoAsync(): Idea {
	return {
		id: -1,
		ee: getEmptyNExpressions(1, 0, getEmptyLanguage()),
	};
}

export function getEmptyIdea(howManyExpressions: number, l: Language): Idea {
	return {
		id: -1,
		ee: getEmptyNExpressions(howManyExpressions, 0, l),
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
