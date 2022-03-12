export interface SearchContext {
  pattern?: string;
  strict?: true;
  language?: number;
  ideaHas?: number[];
  ideaDoesNotHave?: number;
}
