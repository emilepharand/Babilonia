import type {Idea} from '../../../server/model/ideas/idea';
import * as Api from '../api';
import {getEmptyNexpressions} from '../../../server/model/ideas/expression';
import {numberRowsIncrement} from './validation';

export async function addEmptyExpressions(idea: Idea): Promise<Idea> {
	const l = await Api.getLanguage(1);
	const ee = getEmptyNexpressions(numberRowsIncrement, idea.ee.length, l);
	ee.forEach(e => idea.ee.push(e));
	return idea;
}
