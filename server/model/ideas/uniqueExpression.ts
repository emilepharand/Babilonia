import {removeContext} from '../../utils/expressionStringUtils';
import {type Expression, type ExpressionForAdding} from './expression';

export type UniqueIdeaExpression = {
	languageId: number;
	text: string;
};

export function fromExpression(e: Expression): UniqueIdeaExpression {
	return {languageId: e.language.id, text: removeContext(e.text)};
}

export function fromExpressionForAdding(e: ExpressionForAdding): UniqueIdeaExpression {
	return {languageId: e.languageId, text: removeContext(e.text)};
}
