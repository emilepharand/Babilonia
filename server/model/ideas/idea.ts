import Expression from '../expressions/expression';

export default class Idea {
  private expressions: Expression[];

  constructor(expressions: Expression[]) {
    this.expressions = expressions;
  }
}
