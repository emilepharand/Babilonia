import {type SearchContext} from '../model/search/searchContext';

export function paramsFromSearchContext(sc: SearchContext): string {
	return [
		sc.pattern && `pattern=${sc.pattern}`,
		sc.strict && 'strict=true',
		sc.language && `language=${sc.language}`,
		sc.ideaHas && `ideaHas=${sc.ideaHas.join(',')}`,
		sc.ideaDoesNotHave && `ideaDoesNotHave=${sc.ideaDoesNotHave}`,
		sc.knownExpressions !== undefined && `knownExpressions=${sc.knownExpressions ? 'true' : 'false'}`,
	].filter(Boolean).join('&');
}
