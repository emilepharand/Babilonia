import { Language, emptyLanguage } from './language';

export interface ExpressionForAdding {
  texts: string[];
  languageId: number;
}

export interface Expression {
  id: number;
  texts: string[];
  language: Language;
}

export class Expression {
  constructor(e: Expression) {
    this.id = e.id;
    this.texts = e.texts;
    this.language = e.language;
  }
}

export function emptyExpression(): Expression {
  return {
    id: 0,
    texts: [],
    language: emptyLanguage(),
  };
}

export function emptyPartialExpression(): Partial<Expression> {
  return {};
}
