import {Idea} from '../../server/model/ideas/idea';
import {getEmptyNExpressions} from '../../server/model/ideas/expression';
import {Language} from '../../server/model/languages/language';

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
