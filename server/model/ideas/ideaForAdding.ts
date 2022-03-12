import Ajv from 'ajv';
import {ExpressionForAdding, getExpressionForAddingFromExpression} from './expression';
import {Idea} from './idea';

export interface IdeaForAdding {
  ee: ExpressionForAdding[];
}

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
