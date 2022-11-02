import type {Idea} from '../../server/model/ideas/idea';
import {getEmptyNexpressions} from '../../server/model/ideas/expression';
import * as Api from './api';

const numberRowsIncrement = 5;

export async function addEmptyExpressions(idea: Idea): Promise<Idea> {
	const l = await Api.getLanguage(1);
	const ee = getEmptyNexpressions(numberRowsIncrement, idea.ee.length, l);
	ee.forEach(e => idea.ee.push(e));
	return idea;
}
