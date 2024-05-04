import {addAnyIdeaAndTest, editAnyIdeaAndTest} from '../ideas/utils';
import {addAnyLanguageAndTest, editAnyLanguageAndtest} from '../languages/utils';

export async function basicTests() {
	await addAnyIdeaAndTest();
	await editAnyIdeaAndTest();
	await addAnyLanguageAndTest();
	await editAnyLanguageAndtest();
}
