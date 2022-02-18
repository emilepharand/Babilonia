import { Language, emptyLanguage } from './language';

export interface ExpressionForAdding {
  text: string;
  languageId: number;
}

export interface Expression {
  id: number;
  text: string;
  language: Language;
}

export class Expression {
  constructor(e: Expression) {
    this.id = e.id;
    this.text = e.text;
    this.language = e.language;
  }
}

export function getExpressionForAddingFromExpression(e: Expression): ExpressionForAdding {
  return {
    languageId: e.language.id,
    text: e.text,
  };
}

export function emptyExpression(): Expression {
  return {
    id: 0,
    text: '',
    language: emptyLanguage(),
  };
}

export function emptyPartialExpression(): Partial<Expression> {
  return {};
}
