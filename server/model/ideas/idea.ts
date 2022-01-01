import Expression from '../expressions/expression';

export default class Idea {
  public expressions: Expression[];

  constructor(expressions: Expression[]) {
    this.expressions = expressions;
  }
}
