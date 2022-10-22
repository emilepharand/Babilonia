import {nextTick, ref} from 'vue';
import Api from '@/ts/api';
import {getEmptySettingsNoAsync} from '../../server/model/settings/settings';

export const settings = ref(getEmptySettingsNoAsync());
export const showSettingsSavedMessage = ref(false);

(async () => {
	settings.value = await Api.getSettings();
})();

export async function save() {
	await Api.setSettings(settings.value);
	showSettingsSavedMessage.value = true;
}

// Tooltip popovers
const bootstrap = require('bootstrap');
nextTick(() => {
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
