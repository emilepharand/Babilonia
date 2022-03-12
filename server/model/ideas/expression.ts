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

export class Expression {
	constructor(e: Expression) {
		this.id = e.id;
		this.text = e.text;
		this.language = e.language;
	}
}

export function getExpressionForAddingFromExpression(e: Expression): ExpressionForAdding {
	return {
		languageId: e.language.id,
		text: e.text,
	};
}
