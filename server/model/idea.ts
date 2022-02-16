import Ajv from 'ajv';
import { Expression, ExpressionForAdding } from './expression';
import { Language } from './language';

export interface IdeaForAdding {
  ee: ExpressionForAdding[];
}

export interface Idea {
  id: number;
  ee: Expression[];
}

export class Idea {
  constructor(idea: Idea) {
    this.id = idea.id;
    this.ee = idea.ee;
  }
}

export function emptyIdea(): Idea {
  return {
    id: 0,
    ee: [],
  };
}

export function emptyPartialIdea(): Partial<Idea> {
  return {};
}

const ajv = new Ajv();

ajv.addKeyword({
  keyword: 'notEmpty',
  validate: (schema: any, data: any) => data.trim() !== '',
});

const schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    ee: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          texts: {
            type: 'array',
            items: { type: 'string' },
          },
          language: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              ordering: { type: 'integer' },
              isPractice: { type: 'boolean' },
            },
            required: ['id', 'name', 'ordering', 'isPractice'],
          },
          additionalProperties: false,
        },
        required: ['id', 'texts', 'language'],
      },
    },
    additionalProperties: false,
  },
  required: ['id', 'ee'],
};
export const validate = ajv.compile(schema);
