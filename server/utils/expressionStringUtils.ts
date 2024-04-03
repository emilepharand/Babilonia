import {type IdeaForAdding} from 'server/model/ideas/ideaForAdding';

export function normalizeIdea(ideaForAdding: IdeaForAdding) {
	trimExpressions(ideaForAdding);
	normalizeWhitespace(ideaForAdding);
	trimContext(ideaForAdding);
}

export function trimExpressions(ideaForAdding: IdeaForAdding) {
	ideaForAdding.ee.forEach(e => {
		e.text = e.text.trim();
	});
	return ideaForAdding;
}

export function trimContext(ideaForAdding: IdeaForAdding) {
	ideaForAdding.ee.forEach(e => {
		e.text = e.text.replaceAll(/\s(?=\))|(?<=\()\s/g, '');
	});
	return ideaForAdding;
}

export function normalizeWhitespace(ideaForAdding: IdeaForAdding) {
	ideaForAdding.ee.forEach(e => {
		e.text = e.text.replaceAll(/\s+/g, ' ');
	});
	return ideaForAdding;
}

export function removeContext(textWithContext: string): string {
	return textWithContext
		// Remove everything between parentheses
		.replace(/\([^()]*\)/g, '')
		// Remove all whitespace
		.replace(/\s/g, '');
}
