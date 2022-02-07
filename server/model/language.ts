import Ajv from 'ajv';

export default class Language {
  public id: number;

  public name: string;

  public ordering: number;

  public isPractice: boolean;

  public constructor() {
    this.id = -1;
    this.name = 'temp';
    this.ordering = 0;
    this.isPractice = true;
  }
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
