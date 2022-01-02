import Language from '../languages/language';

export default class Expression {
  public id: number;

  public text: string;

  public ideaId: number;

  public language: Language;

  public languageId?: number;
}
