import type {IdeaForAdding} from './ideas/ideaForAdding';
import {validateSchema as validateIdeaForAddingSchema} from './ideas/ideaForAdding';
import type LanguageManager from './languages/languageManager';
import type {Language} from './languages/language';
import {validate as validateLanguage, validateForAdding} from './languages/language';
import {validateSchema as validateSettingsSchema} from './settings/settings';

// Validates input received by the controller
export default class InputValidator {
	public static isValidOrdering(orderings: number[]): boolean {
		const orderingsSet = new Set<number>();
		orderings.forEach(o => orderingsSet.add(o));
		for (let i = 0; i < orderings.length; i += 1) {
			if (!orderingsSet.has(i)) {
				return false;
			}
		}
		return true;
	}

	constructor(private readonly lm: LanguageManager) {}

	public async validateLanguagesForEditing(toValidate: unknown): Promise<boolean> {
		// Object is an array
		if (!(toValidate instanceof Array)) {
			return false;
		}
		const ll = toValidate as Language[];
		// All languages exist
		const promises: Array<Promise<boolean>> = [];
		const languageIds = new Set(Array.from(ll.values(), l => l.id));
		languageIds.forEach(id => promises.push(this.lm.languageIdExists(id)));
		if (!(await Promise.all(promises)).every(exist => exist)) {
			return false;
		}
		// Each language is valid
		if (ll.some(l => !validateLanguage(l))) {
			return false;
		}
		// No language name is blank
		if (ll.some(l => l.name.trim() === '')) {
			return false;
		}
		// There are no duplicate language ids
		if ((await this.lm.countLanguages()) !== ll.length) {
			return false;
		}
		// There are no duplicate language names
		const names = new Set(Array.from(ll.values(), l => l.name));
		if (names.size !== ll.length) {
			return false;
		}
		// Ordering is valid
		return InputValidator.isValidOrdering(ll.map(l => l.ordering));
	}

	public async validateLanguageForAdding(toValidate: unknown): Promise<boolean> {
		if (!validateForAdding(toValidate)) {
			return false;
		}
		const l = toValidate as {name: string};
		if (l.name.trim() === '') {
			return false;
		}
		return !(await this.lm.languageNameExists(l.name));
	}

	public async validateIdeaForAdding(ideaForAdding: IdeaForAdding): Promise<boolean> {
		// Shape is valid (properties and their types)
		if (!validateIdeaForAddingSchema(ideaForAdding)) {
			return false;
		}
		const asIdeaForAdding = ideaForAdding;
		// Contains at least one expression
		if (asIdeaForAdding.ee.length === 0) {
			return false;
		}
		// No expressions are blank
		if (asIdeaForAdding.ee.some(e => e.text.trim() === '')) {
			return false;
		}
		// All languages exist
		const languagesExist: Array<Promise<boolean>> = [];
		asIdeaForAdding.ee.forEach(e => languagesExist.push(this.lm.languageIdExists(e.languageId)));
		if ((await Promise.all(languagesExist)).includes(false)) {
			return false;
		}
		// No expressions are identical (same language and text)
		const distinctExpressions = new Set<string>();
		asIdeaForAdding.ee.forEach(e => distinctExpressions.add(JSON.stringify(e)));
		const noIdenticalExpressions = distinctExpressions.size === asIdeaForAdding.ee.length;
		// Parentheses
		for (const e of ideaForAdding.ee) {
			const contexts = e.text.match(/\([^)]*\)/g) ?? [];
			if (contexts.some(x => x.trim() === '()')) {
				return false;
			}
			const numberOfContexts = contexts.length;
			const numberOfOpenPar = (e.text.match(/\(/g) ?? []).length;
			const numberOfClosingPar = (e.text.match(/\)/g) ?? []).length;
			if ((numberOfOpenPar !== numberOfClosingPar) || numberOfContexts !== numberOfOpenPar) {
				return false;
			}
			const expressionWithoutContexts = e.text.replaceAll(/\([^)]*\)/g, '');
			if (expressionWithoutContexts.trim().length === 0) {
				return false;
			}
		}
		return noIdenticalExpressions;
	}

	public validateSettings(settings: unknown): boolean {
		return validateSettingsSchema(settings);
	}
}
