import {ref} from 'vue';
import Api from '@/ts/api';
import {getEmptyNumberIdeasInLanguage} from '../../server/stats/stats';

export const ideasPerLanguage = ref(getEmptyNumberIdeasInLanguage());
export const noIdeas = ref(false);

(async () => {
	ideasPerLanguage.value = await Api.getStats();
	noIdeas.value = ideasPerLanguage.value.length === 0;
})();
