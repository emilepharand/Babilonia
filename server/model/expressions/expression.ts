import Language from '../languages/language';

export default class Expression {
  private expression: string;

  private language: Language;

  constructor(expression: string, language: Language) {
    this.expression = expression;
    this.language = language;
  }
}
