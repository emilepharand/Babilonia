import {Idea} from '../../server/model/ideas/idea';
import {getEmptyNExpressions} from '../../server/model/ideas/expression';
import Api from './api';

const NUMBER_ROWS_INCREMENT = 5;

export default class Utils {
	public static async addEmptyExpressions(idea: Idea): Promise<Idea> {
		const l = await Api.getLanguage(1);
		const ee = getEmptyNExpressions(NUMBER_ROWS_INCREMENT, idea.ee.length, l);
		ee.forEach(e => idea.ee.push(e));
		return idea;
	}
}
