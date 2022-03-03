import Ajv from 'ajv';

export interface Language {
  id: number;
  name: string;
  ordering: number;
  // SQLite doesn't have booleans
  isPractice: boolean | '0' | '1';
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

export function emptyPartialLanguage(): Partial<Language> {
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
    name: {
      type: 'string',
      notEmpty: true,
    },
    ordering: { type: 'integer' },
    isPractice: { type: 'boolean' },
  },
  required: ['id', 'name', 'ordering', 'isPractice'],
  additionalProperties: false,
};
export const validate = ajv.compile(schema);

const languageForAddingSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
};
export const validateForAdding = ajv.compile(languageForAddingSchema);
