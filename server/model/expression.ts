import { Language, emptyLanguage } from './language';

export interface ExpressionForAdding {
  texts: string[];
  languageId: number;
}

export interface Expression {
  id: number;
  ideaId: number;
  texts: string[];
  language: Language;
  languageId?: number;
}

export class Expression {
  constructor(e: Expression) {
    this.id = e.id;
    this.texts = e.texts;
    this.ideaId = e.ideaId;
    this.language = e.language;
  }
}

export function emptyExpression(): Expression {
  return {
    id: 0,
    texts: [],
    ideaId: 0,
    language: emptyLanguage(),
  };
}

export function emptyPartialExpression(): Partial<Expression> {
  return {};
}
