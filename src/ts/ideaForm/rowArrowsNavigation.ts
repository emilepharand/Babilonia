import * as bootstrap from 'bootstrap';
import {findAllElementsByClassName, focusEndOfInput} from '../domHelper';

export const defaultNbrRows = 5;

export let languageSelects: HTMLElement[] = [];
export let textInputs: HTMLElement[] = [];
export let knownToggles: HTMLElement[] = [];

const expressionLanguageClassName = 'expression-language';
const expressionTextClassName = 'expression-text';
const expressionKnownClassName = 'expression-known-toggle';

export function initElements(expectedNumberRows: number) {
	initElementsWithNbrTries(0, expectedNumberRows);
}

function initElementsWithNbrTries(nbrTries: number, expectedNumberRows: number) {
	setTimeout(() => {
		textInputs = Array.from(findAllElementsByClassName(expressionTextClassName));
		if (textInputs.length !== expectedNumberRows && nbrTries < 25) {
			initElementsWithNbrTries(nbrTries + 1, expectedNumberRows);
		} else {
			knownToggles = Array.from(findAllElementsByClassName(expressionKnownClassName));
			languageSelects = Array.from(findAllElementsByClassName(expressionLanguageClassName));
			initToolTips();
			const element = findFirstEmptyExpressionElseFirstExpression();
			focusEndOfInput(element as HTMLInputElement);
		}
	}, 10);
}

function initToolTips() {
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function findFirstEmptyExpressionElseFirstExpression() {
	let found = false;
	let i = 0;
	while (i < textInputs.length && !found) {
		found = (textInputs[i] as HTMLInputElement).value.trim() === '';
		if (!found) {
			i++;
		}
	}
	return found ? textInputs[i] : textInputs[0];
}
