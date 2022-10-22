import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import Utils from '@/ts/utils';
import Api from '@/ts/api';

export const idea = ref(getEmptyIdeaNoAsync());
export const loaded = ref(false);
export const ideaNotFound = ref(false);

export const route = useRoute();
export const ideaId = Number.parseInt(Array.from(route.params.id).join(''), 10);

// Initialize idea
(async () => {
	try {
		idea.value = await Api.getIdea(ideaId);
		loaded.value = true;
	} catch {
		ideaNotFound.value = true;
	}
}
)();

export async function addRows() {
	idea.value = await Utils.addEmptyExpressions(idea.value);
}

export async function edit() {
	// Remove empty expressions
	idea.value.ee = idea.value.ee.filter(e => e.text.trim() !== '');
	await Api.editIdea(getIdeaForAddingFromIdea(idea.value), idea.value.id);
	// Reorder expressions
	idea.value = await Api.getIdea(idea.value.id);
}

// Router needs to be declared outside function
const router = useRouter();
export async function deleteIdea() {
	await Api.deleteIdea(ideaId);
	await router.push('/');
}
