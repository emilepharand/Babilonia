export interface SearchContext {
  pattern?: string;
  language?: number;
  ideaHas?: number[];
  ideaDoesNotHave?: number[];
  ideaHasOperator?: string;
  ideaDoesNotHaveOperator?: string;
}
