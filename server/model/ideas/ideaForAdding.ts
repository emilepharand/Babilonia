import Ajv from 'ajv';
import type {ExpressionForAdding} from './expression';
import {getExpressionForAddingFromExpression} from './expression';
import type {Idea} from './idea';

export type IdeaForAdding = {
	ee: ExpressionForAdding[];
};

export function getIdeaForAddingFromIdea(idea: Idea): IdeaForAdding {
	return {
		ee: idea.ee.map(e => getExpressionForAddingFromExpression(e)),
	};
}

const ajv = new Ajv();

const ideaForAddingSchema = {
	type: 'object',
	properties: {
		ee: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					text: {type: 'string'},
					languageId: {type: 'number'},
				},
				required: ['text', 'languageId'],
				additionalProperties: false,
			},
		},
	},
	required: ['ee'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(ideaForAddingSchema);
