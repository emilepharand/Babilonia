export interface SearchContext {
  pattern: string;
  languages: number[];
  ideaHas: number[];
  ideaDoesNotHave: number[];
  ideaHasOperator: string;
  ideaDoesNotHaveOperator: string;
}
