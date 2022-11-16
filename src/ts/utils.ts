import type {Idea} from '../../server/model/ideas/idea';
import {
	getEmptyNexpressions,
	getExpressionForAddingFromExpression,
} from '../../server/model/ideas/expression';
import * as Api from './api';
import type {Ref} from 'vue';
import {validateContextParentheses} from '../../server/model/inputValidator';

const numberRowsIncrement = 5;

export async function addEmptyExpressions(idea: Idea): Promise<Idea> {
	const l = await Api.getLanguage(1);
	const ee = getEmptyNexpressions(numberRowsIncrement, idea.ee.length, l);
	ee.forEach(e => idea.ee.push(e));
	return idea;
}

export function validateIdeaForm(idea: Ref<Idea>, errorText: Ref<string>) {
	// Remove empty expressions
	const expressions = idea.value.ee.filter(e => e.text.trim() !== '');
	// Not possible to save empty idea
	if (expressions.length === 0) {
		errorText.value = 'Empty idea.';
		return null;
	}
	const expressionsForAdding = expressions.map(e => getExpressionForAddingFromExpression(e));
	const ideaForAdding = {ee: expressionsForAdding};
	// Identical expressions
	const distinctExpressions = new Set<string>();
	ideaForAdding.ee.forEach(e => distinctExpressions.add(JSON.stringify(e)));
	if (distinctExpressions.size !== ideaForAdding.ee.length) {
		errorText.value = 'Some expressions are identical.';
		return null;
	}
	if (!validateContextParentheses((ideaForAdding.ee))) {
		errorText.value = 'Invalid context parentheses.';
		return null;
	}
	errorText.value = '';
	return ideaForAdding;
}
