export function focusEndOfInput(element: HTMLInputElement) {
	setTimeout(() => {
		const saved = element.value;
		element.value = '';
		element.value = saved;
	}, 0);
	setTimeout(() => {
		element.focus();
	}, 1);
}

export function findAllElementsByClassName(className: string) {
	return (document?.querySelectorAll<HTMLElement>(`.${className}`));
}
