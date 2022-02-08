import { Language, emptyLanguage } from './language';

export interface Expression {
  id: number;
  texts: string[];
  ideaId: number;
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
