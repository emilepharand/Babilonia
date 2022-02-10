import Ajv from 'ajv';

export interface Language {
  id: number;
  name: string;
  ordering: number;
  isPractice: boolean | string;
}

export function equal(l1: Language, l2: Language): boolean {
  return l1.id === l2.id
    && l1.name === l2.name
    && l1.ordering === l2.ordering
    && l1.isPractice === l2.isPractice;
}

export function copy(l: Language): Language {
  return {
    id: l.id,
    name: l.name,
    ordering: l.ordering,
    isPractice: l.isPractice,
  };
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
