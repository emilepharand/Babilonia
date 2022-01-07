import Expression from './expression';

export default class Idea {
  public id: number;

  public ee: Expression[];

  public constructor(id: number, ee: Expression[]) {
    this.id = id;
    this.ee = ee;
  }
}
