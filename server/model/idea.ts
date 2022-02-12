import { Expression } from './expression';

export interface Idea {
  id: number;
  ee: Expression[];
}

export class Idea {
  constructor(idea: Idea) {
    this.id = idea.id;
    this.ee = idea.ee;
  }
}

export function emptyIdea(): Idea {
  return {
    id: 0,
    ee: [],
  };
}

export function emptyPartialIdea(): Partial<Idea> {
  return {};
}
