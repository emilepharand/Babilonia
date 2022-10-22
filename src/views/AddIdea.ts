import {ref} from 'vue';
import {
	getEmptyIdea,
	getEmptyIdeaNoAsync,
} from '../../server/model/ideas/idea';
import {getExpressionForAddingFromExpression} from '../../server/model/ideas/expression';
import Api from '@/ts/api';
import Utils from '@/ts/utils';

export const idea = ref(getEmptyIdeaNoAsync());
export const noLanguages = ref(false);
export const loaded = ref(false);

// Initialize data
(async () => {
	if ((await Api.getLanguages()).length === 0) {
		noLanguages.value = true;
	}
	idea.value = getEmptyIdea(5, (await Api.getLanguages())[0]);
	loaded.value = true;
})();

export async function save() {
	// Remove empty expressions
	const expressions = idea.value.ee.filter(e => e.text.trim() !== '');
	// Not possible to save empty idea
	if (expressions.length === 0) {
		return;
	}
	const expressionsForAdding = expressions.map(e => getExpressionForAddingFromExpression(e));
	const ideaForAdding = {ee: expressionsForAdding};
	await Api.addIdea(ideaForAdding);
	// Reset inputs
	idea.value.ee.forEach(e => {
		e.text = '';
	});
}

export async function addRows() {
	idea.value = await Utils.addEmptyExpressions(idea.value);
}
