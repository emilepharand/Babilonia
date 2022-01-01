import Language from '../languages/language';

export default class Expression {
  public text: string;

  public language: Language;

  constructor(text: string, language: Language) {
    this.text = text;
    this.language = language;
  }
}
