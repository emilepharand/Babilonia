import Language from './language';

export default class Expression {
  public id: number;

  public texts: string[];

  public ideaId: number;

  public language: Language;

  public languageId?: number;

  public constructor() {
    this.id = -1;
    this.texts = [];
    this.ideaId = -1;
    this.language = new Language();
  }
}
