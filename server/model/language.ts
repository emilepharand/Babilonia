import Ajv from 'ajv';

export interface Language {
  id: number;
  name: string;
  ordering: number;
  isPractice: boolean | string;
}

export class Language {
  constructor(l: Language) {
    this.id = l.id;
    this.name = l.name;
    this.ordering = l.ordering;
    this.isPractice = l.isPractice;
  }
}

export function emptyLanguage(): Language {
  return {
    id: 0,
    name: '',
    ordering: 0,
    isPractice: false,
  };
}

export function emptyPartialLanguage(): Partial<Language> {
  return {};
}

const ajv = new Ajv();
const schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    ordering: { type: 'integer' },
    isPractice: { type: 'boolean' },
  },
  additionalProperties: false,
};
export const validate = ajv.compile(schema);
