import type {Language} from '../languages/language';

export type ExpressionForAdding = {
	text: string;
	languageId: number;
	known?: boolean;
	guid: string;
};

export type Expression = {
	id: number;
	text: string;
	language: Language;
	known: boolean;
	guid: string;
	// This is used for search results
	matched?: boolean;
};

export function getEmptyNexpressions(n: number, startId: number, l: Language): Expression[] {
	const ee = [];
	for (let i = 0; i < n; i++) {
		const e: Expression = {
			id: startId + i,
			text: '',
			language: l,
			known: false,
			guid: '',
		};
		ee.push(e);
	}
	return ee;
}

export function getExpressionForAddingFromExpression(e: Expression): ExpressionForAdding {
	return {
		languageId: e.language.id,
		text: e.text,
		known: e.known,
		guid: e.guid,
	};
}
