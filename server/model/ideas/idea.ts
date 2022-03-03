import Ajv from 'ajv';
import { Expression } from './expression';

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

const ajv = new Ajv();

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
          text: { type: 'string' },
          language: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              ordering: { type: 'integer' },
              isPractice: { type: 'boolean' },
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
