import Ajv from 'ajv';
import { ExpressionForAdding, getExpressionForAddingFromExpression } from './expression';
import { Idea } from './idea';
import DataManager from '../dataManager';

export interface IdeaForAdding {
  ee: ExpressionForAdding[];
}

export function getIdeaForAddingFromIdea(idea: Idea): IdeaForAdding {
  return {
    ee: idea.ee.map((e) => getExpressionForAddingFromExpression(e)),
  };
}

const ajv = new Ajv();

ajv.addKeyword({
  keyword: 'notEmpty',
  validate: (schema: any, data: any) => data.trim() !== '',
});

const ideaForAddingSchema = {
  type: 'object',
  properties: {
    ee: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          languageId: { type: 'number' },
        },
        required: ['text', 'languageId'],
        additionalProperties: false,
      },
    },
  },
  required: ['ee'],
  additionalProperties: false,
};

export async function validateIdeaForAdding(ideaForAdding: unknown): Promise<boolean> {
  if (!ajv.validate(ideaForAddingSchema, ideaForAdding)) {
    return false;
  }
  const asIdeaForAdding = ideaForAdding as IdeaForAdding;
  const lm = DataManager.getLanguageManager();
  if (asIdeaForAdding.ee.length === 0) {
    return false;
  }
  if (asIdeaForAdding.ee.filter((e) => e.text.trim() === '').length > 0) {
    return false;
  }
  // eslint-disable-next-line no-return-await,no-restricted-syntax
  for (const e of asIdeaForAdding.ee) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await lm.languageExists(e.languageId))) {
      return false;
    }
  }
  // below lines is to make sure no two expressions are identical (same language and same text)
  const mapLanguageExpressions = new Map<number, string[]>();
  asIdeaForAdding.ee.forEach((e) => mapLanguageExpressions.set(e.languageId, []));
  // eslint-disable-next-line no-restricted-syntax
  for (const e of asIdeaForAdding.ee) {
    if (mapLanguageExpressions.get(e.languageId)?.includes(e.text)) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mapLanguageExpressions.get(e.languageId).push(e.text);
  }
  return true;
}
