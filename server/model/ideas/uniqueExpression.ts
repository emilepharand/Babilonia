import {removeContext} from '../../utils/expressionStringUtils';
import {type Expression, type ExpressionForAdding} from './expression';

export type UniqueExpression = {
	languageId: number;
	text: string;
};

export function getUniqueExpressionFromExpression(e: Expression): UniqueExpression {
	return {languageId: e.language.id, text: removeContext(e.text)};
}

export function getUniqueExpressionFromExpressionForAdding(e: ExpressionForAdding): UniqueExpression {
	return {languageId: e.languageId, text: removeContext(e.text)};
}
