export function focusedChanged(props: any, isFocused: boolean, emit: any, focusInput: any, isFullMatch: any) {
	if (props.startInteractive && isFocused) {
		if (isFullMatch.value || !props.expression.language.isPractice) {
			emit('skipFocus');
		} else if (props.expression.language.isPractice) {
			focusInput();
		} else {
			emit('skipFocus');
		}
	}
}

export function doTheMount(props: any, focusInput: any, emit: any) {
	if (props.isFocused) {
		if (props.expression.language.isPractice) {
			focusInput();
		} else {
			emit('skipFocus');
		}
	}
}

export function doTheWatchExpression(props: any, typed: any, isFullMatch: any) {
	if (props.expression.language.isPractice) {
		typed.value = '';
		isFullMatch.value = false;
	}
}

export function doTheWatchTyped(props: any, emit: any, els: any) {
	if (props.startInteractive) {
		if (els.isFullMatch.value) {
			emit('skipFocus');
		} else {
			checkMatch(props, emit, els);
		}
	}
}

function normalizeChar(c: string, els: any) {
	if (els.settings.value.strictCharacters) {
		return c;
	}
	return c.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function checkMatch(props: any, emit: any, els: any) {
	const typedWord = els.typed.value;
	if (typedWord.length === 0) {
		els.nothingTyped.value = true;
		els.isNoMatch.value = false;
		els.isPartialMatch.value = false;
		els.isFullMatch.value = false;
		els.currentMaxLength.value = 1;
		return;
	}
	els.nothingTyped.value = false;
	const firstLettersMatch = checkFirstLettersMatch(props.expression.text, typedWord, els);
	if (firstLettersMatch) {
		// Show non-normalized spelling
		els.typed.value = props.expression.text.substring(0, els.typed.value.length);
		if (typedWord.length > 0 && typedWord.length === props.expression.text.length) {
			els.isNoMatch.value = false;
			els.isPartialMatch.value = false;
			els.isFullMatch.value = true;
			emit('fullMatched', props.rowOrder, true);
		} else {
			els.isNoMatch.value = false;
			els.isPartialMatch.value = true;
			els.isFullMatch.value = false;
			els.currentMaxLength.value = els.typed.value.length + 1;
		}
	} else {
		els.isNoMatch.value = true;
		els.isPartialMatch.value = false;
		els.isFullMatch.value = false;
		els.moreLettersAllowed.value = false;
	}
}

function checkFirstLettersMatch(textToMatch: string, typedWord: string, els: any) {
	let i = 0;
	while (i < typedWord.length) {
		if (normalizeChar(textToMatch.charAt(i), els) === normalizeChar(typedWord.charAt(i), els)) {
			i += 1;
		} else {
			return false;
		}
	}
	return true;
}

export function doTheWatchReset(props: any, resetRow: any) {
	if (props.startInteractive) {
		resetRow();
	}
}

export function doTheResetRow(els: any) {
	els.typed.value = '';
	els.isFullMatch.value = false;
	els.isPartialMatch.value = false;
	els.isNoMatch.value = false;
	els.nothingTyped.value = true;
}

export function doTheFocusInput(els: any, textInput: any) {
	if (textInput.value && textInput.value) {
		(textInput as any).value.focus();
		// Focus end of word
		const saved = els.typed.value;
		(textInput.value as any).value = '';
		(textInput.value as any).value = saved;
	}
}

export function buttonsDisabled(props: any, els: any) {
	return !props.expression.language.isPractice || els.isFullMatch.value;
}

export function doTheHint(props: any, els: any, textInput: any) {
	let j = 0;
	while (j < els.typed.value.length && props.expression.text.charAt(j) === els.typed.value.charAt(j)) {
		j += 1;
	}
	if (j > 0) {
		// Don't hint only space but next letter too
		if (props.expression.text[j] === ' ') {
			els.typed.value = props.expression.text.substring(0, j + 2);
		} else {
			els.typed.value = props.expression.text.substring(0, j + 1);
		}
	} else {
		els.typed.value = props.expression.text.substring(0, 1);
	}
	doTheFocusInput(els, textInput);
}

export function doTheShow(props: any, els: any) {
	els.typed.value = props.expression.text;
}
