import {Settings} from '../../../server/model/settings/settings';

import {apiUrl, setSettings} from '../cy-utils';

describe('The settings page', () => {
	it('Works correctly', () => {
		setSettings({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false,
		});
		assertSettingsEquals({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false,
		});
		cy.get('#settings-link').click();
		cy.get('#randomPractice').should('be.checked');
		cy.get('#strictCharacters').should('not.be.checked');
		cy.get('#settingsSavedText').should('not.exist');
		cy.get('#strictCharacters').check();
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('be.visible');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false,
		});
	});
});

export function assertSettingsEquals(settings: Settings) {
	cy.request({
		url: `${apiUrl}/settings`,
	}).then(r => {
		// Little hack to make it work, compare stringified, without double quotes, without backlashes
		cy.wrap(JSON.stringify(r.body)
			.replaceAll('\\', '')
			.replaceAll('"', ''))
			.should('equal', JSON.stringify(settings)
				.replaceAll('\\', '')
				.replaceAll('"', ''));
	});
}
