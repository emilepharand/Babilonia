export interface SearchContext {
  pattern?: string;
  strict?: true;
  language?: number;
  ideaHas?: number[];
  ideaDoesNotHave?: number[];
  ideaHasOperator?: 'and' | 'or';
  ideaDoesNotHaveOperator?: 'and' | 'or';
}
