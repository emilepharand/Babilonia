import type {Idea} from '../../server/model/ideas/idea';
import {getEmptyNexpressions} from '../../server/model/ideas/expression';
import Api from './api';

const numberRowsIncrement = 5;

export default class Utils {
	public static async addEmptyExpressions(idea: Idea): Promise<Idea> {
		const l = await Api.getLanguage(1);
		const ee = getEmptyNexpressions(numberRowsIncrement, idea.ee.length, l);
		ee.forEach(e => idea.ee.push(e));
		return idea;
	}
}
