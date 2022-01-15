import Idea from '../../server/model/idea';

// eslint-disable-next-line no-shadow
export enum TEXT_STATUS { FULL_MATCH, PARTIAL_MATCH, NO_MATCH }

export default class Utils {
  public static addEmptyExpressions(idea: Idea, howMany: number, currentSize: number): Idea {
    let start = currentSize;
    for (let i = 0; i < howMany; i += 1) {
      idea.ee.push({
        id: start,
        ideaId: idea.id,
        language: {
          id: 1,
          name: 'Français',
          ordering: 0,
          isPractice: true,
        },
        text: '',
      });
      start += 1;
    }
    return idea;
  }

  public static checkText(typed: string, text: string): TEXT_STATUS {
    if (Utils.checkFirstLettersMatch(text, typed)) {
      if (typed.length === text.length) {
        return TEXT_STATUS.FULL_MATCH;
      }
      return TEXT_STATUS.PARTIAL_MATCH;
    }
    return TEXT_STATUS.NO_MATCH;
  }

  public static checkFirstLettersMatch(word: string, typedWord: string): boolean {
    let i = 0;
    while (i < typedWord.length) {
      if (word.charAt(i) === typedWord.charAt(i)) {
        i += 1;
      } else {
        return false;
      }
    }
    return true;
  }
}
