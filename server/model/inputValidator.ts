import Ajv from 'ajv';
import type {ExpressionForAdding} from './ideas/expression';
import type {IdeaForAdding} from './ideas/ideaForAdding';
import {validateSchema as validateIdeaForAddingSchema} from './ideas/ideaForAdding';
import type {Language} from './languages/language';
import {validate as validateLanguage, validateForAdding} from './languages/language';
import type LanguageManager from './languages/languageManager';
import {validateSchema as validateSettingsSchema} from './settings/settings';
import path from 'path';
import fs from 'fs';

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
		if (!Array.isArray(toValidate)) {
			return false;
		}
		const ll = toValidate as Language[];
		// All languages exist
		const promises: Array<Promise<boolean>> = [];
		const languageIds = new Set(Array.from(ll.values(), l => l.id));
		languageIds.forEach(id => promises.push(this.lm.idExists(id)));
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
		asIdeaForAdding.ee.forEach(e => languagesExist.push(this.lm.idExists(e.languageId)));
		if ((await Promise.all(languagesExist)).includes(false)) {
			return false;
		}
		// No expressions are identical (same language and text)
		const distinctExpressions = new Set<string>();
		asIdeaForAdding.ee.forEach(e => distinctExpressions.add(JSON.stringify(e)));
		if (distinctExpressions.size !== asIdeaForAdding.ee.length) {
			return false;
		}
		// Context parentheses are valid
		return validateContextParentheses(ideaForAdding.ee);
	}

	public validateSettings(settings: unknown): boolean {
		return validateSettingsSchema(settings);
	}

	public validateChangeDatabase(pathObject: unknown): string | false {
		if (!validateDatabaseSchema(pathObject)) {
			return false;
		}

		const unsafePath = (pathObject as {path: string}).path;

		if (validateDatabasePath(unsafePath)) {
			if (isMemoryDatabasePath(unsafePath)) {
				return ':memory:';
			}
			return resolveAndNormalizePathUnderWorkingDirectory(unsafePath);
		}

		return false;
	}
}

function resolveAndNormalizePathUnderWorkingDirectory(unsafePath: string) {
	try {
		const resolvedPath = path.resolve(process.cwd(), unsafePath);

		if (!resolvedPath.startsWith(process.cwd())) {
			return false;
		}

		if (!fs.existsSync(resolvedPath)) {
			const parentDir = path.dirname(resolvedPath);
			const realPathParent = fs.realpathSync(parentDir);
			const fileName = path.basename(resolvedPath);
			return path.resolve(process.cwd(), realPathParent, fileName);
		}

		return fs.realpathSync(resolvedPath);
	} catch (e) {
		// Path is invalid
		console.log(e);
		return false;
	}
}

export function validateDatabaseSchema(pathObject: unknown) {
	const ajv = new Ajv();
	const schema = {
		type: 'object',
		properties: {
			path: {type: 'string'},
		},
		required: ['path'],
		additionalProperties: false,
	};
	return ajv.compile(schema)(pathObject);
}

export function validateDatabasePath(path: string) {
	if (isMemoryDatabasePath(path)) {
		return true;
	}

	if (!path.endsWith('.db')) {
		console.log(`'${path}' does not have extension .db.`);
		return false;
	}

	return true;
}

export function isMemoryDatabasePath(path: string) {
	return path === ':memory:';
}

export function validateContextParentheses(ee: ExpressionForAdding[]) {
	for (const e of ee) {
		const contexts = e.text.match(/\([^)(]*\)/g) ?? [];
		// No context is empty
		if (contexts.some(x => x.substring(1, x.length - 1).trim().length === 0)) {
			return false;
		}
		// Expression is not only made of context
		const expressionWithoutContexts = e.text.replaceAll(/\([^)(]*\)/g, '');
		if (expressionWithoutContexts.trim().length === 0) {
			return false;
		}
		// There are as many closing and opening parentheses as there are contexts
		const nbrOpeningParentheses = (e.text.match(/[(]/g) ?? []).length;
		const nbrClosingParentheses = (e.text.match(/[)]/g) ?? []).length;
		if (contexts.length !== nbrOpeningParentheses || contexts.length !== nbrClosingParentheses) {
			return false;
		}
	}
	return true;
}
