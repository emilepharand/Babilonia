import {Language} from '../languages/language';

export interface ExpressionForAdding {
  text: string;
  languageId: number;
}

export interface Expression {
  id: number;
  text: string;
  language: Language;
  // This is used for search results
  matched?: boolean;
}

export function getEmptyNExpressions(n: number, startId: number, l: Language): Expression[] {
	const ee = [];
	for (let i = 0; i < n; i++) {
		const e: Expression = {
			id: startId + i,
			text: '',
			language: l,
		};
		ee.push(e);
	}
	return ee;
}

export function getExpressionForAddingFromExpression(e: Expression): ExpressionForAdding {
	return {
		languageId: e.language.id,
		text: e.text,
	};
}
