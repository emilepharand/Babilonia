import {Idea} from '../../server/model/ideas/idea';
import {getEmptyNExpressions} from '../../server/model/ideas/expression';
import {Language} from '../../server/model/languages/language';

export enum MatchStatus {
  // TODO: eslint config apparently doesn't understand TypeScript enums
  // so we need to disable warnings for now
  // eslint-disable-next-line no-unused-vars
  NO_MATCH,
  // eslint-disable-next-line no-unused-vars
  PARTIAL_MATCH,
  // eslint-disable-next-line no-unused-vars
  FULL_MATCH,
}

export default class Utils {
	public static addEmptyExpressions(
		idea: Idea,
		howMany: number,
		currentSize: number,
		language: Language,
	): Idea {
		const ee = getEmptyNExpressions(howMany, currentSize, language);
		ee.forEach(e => idea.ee.push(e));
		return idea;
	}
}
