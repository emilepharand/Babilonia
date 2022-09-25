export interface SearchContext {
  pattern?: string;
  strict?: boolean;
  language?: number;
  ideaHas?: number[];
  ideaDoesNotHave?: number;
}
