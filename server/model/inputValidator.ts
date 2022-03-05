import {
  IdeaForAdding,
  validateSchema as validateIdeaForAddingSchema,
} from './ideas/ideaForAdding';
import LanguageManager from './languages/languageManager';
import IdeaManager from './ideas/ideaManager';
import { Language, validate, validateForAdding } from './languages/language';

// Validates input received by the controller
export default class InputValidator {
  private lm: LanguageManager;

  private im: IdeaManager;

  constructor(im: IdeaManager, lm: LanguageManager) {
    this.im = im;
    this.lm = lm;
  }

  public async validateLanguagesForEditing(toValidate: unknown): Promise<boolean> {
    // object is an array
    if (!(toValidate instanceof Array)) {
      return false;
    }
    const ll = toValidate as Language[];
    // each language is valid
    if (ll.some((l) => !validate(l))) {
      return false;
    }
    // no language name is blank
    if (ll.some((l) => l.name.trim() === '')) {
      return false;
    }
    // there are no duplicate language ids
    const languageIds = new Set(Array.from(ll.values(), (l) => l.id));
    if ((await this.lm.countLanguages()) !== ll.length) {
      return false;
    }
    // there are no duplicate language names
    const names = new Set(Array.from(ll.values(), (l) => l.name));
    if (names.size !== ll.length) {
      return false;
    }
    // all languages exist
    const promises: Promise<boolean>[] = [];
    languageIds.forEach((id) => promises.push(this.lm.languageIdExists(id)));
    if (!(await Promise.all(promises)).every((exist) => exist)) {
      return false;
    }
    // ordering is valid
    const orderings = new Set<number>();
    ll.forEach((l) => orderings.add(l.ordering));
    for (let i = 0; i < ll.length; i += 1) {
      if (!orderings.has(i)) {
        return false;
      }
    }
    return true;
  }

  public async validateLanguageForAdding(toValidate: unknown): Promise<boolean> {
    if (!validateForAdding(toValidate)) {
      return false;
    }
    const l = toValidate as { name: string };
    if (l.name.trim() === '') {
      return false;
    }
    return !(await this.lm.languageNameExists(l.name));
  }

  public async validateIdeaForAdding(ideaForAdding: unknown): Promise<boolean> {
    // shape is valid (properties and their types)
    if (!validateIdeaForAddingSchema(ideaForAdding)) {
      return false;
    }
    const asIdeaForAdding = ideaForAdding as IdeaForAdding;
    // contains at least one expression
    if (asIdeaForAdding.ee.length === 0) {
      return false;
    }
    // no expressions are blank
    if (asIdeaForAdding.ee.some((e) => e.text.trim() === '')) {
      return false;
    }
    // all languages exist
    const languagesExist: Promise<boolean>[] = [];
    asIdeaForAdding.ee.forEach((e) => languagesExist.push(this.lm.languageIdExists(e.languageId)));
    if ((await Promise.all(languagesExist)).includes(false)) {
      return false;
    }
    // no expressions are identical (same language and text)
    const distinctExpressions = new Set<string>();
    asIdeaForAdding.ee.forEach((e) => distinctExpressions.add(JSON.stringify(e)));
    return distinctExpressions.size === asIdeaForAdding.ee.length;
  }
}
