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
		languageSelects = Array.from(findAllElementsByClassName(expressionLanguageClassName));
		textInputs = Array.from(findAllElementsByClassName(expressionTextClassName));
		knownToggles = Array.from(findAllElementsByClassName(expressionKnownClassName));
		if (textInputs.length !== expectedNumberRows && nbrTries < 10) {
			initElementsWithNbrTries(nbrTries + 1, expectedNumberRows);
		} else {
			const element = findFirstEmptyExpression();
			focusEndOfInput(element as HTMLInputElement);
		}
	}, 20);
}

function findFirstEmptyExpression() {
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
