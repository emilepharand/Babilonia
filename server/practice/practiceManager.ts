import { Database } from 'sqlite';
import { Idea } from '../model/idea';
import IdeaManager from '../model/ideaManager';

export default class PracticeManager {
  private offset = 0;

  private db: Database;

  private ideaManager: IdeaManager;

  constructor(db: Database, ideaManager: IdeaManager) {
    this.ideaManager = ideaManager;
    this.db = db;
  }

  private async nextIdeaId(): Promise<number> {
    let idea = await this.db.get('select id from ideas limit 1 offset ?', this.offset);
    // no more ideas
    if (idea === undefined) {
      this.offset = 0;
      idea = await this.db.get('select id from ideas limit 1 offset ?', this.offset);
      if (idea === undefined) {
        // there are no ideas in database
        return Promise.reject();
      }
    }
    this.offset += 1;
    return idea.id;
  }

  async getNextIdea(): Promise<Idea> {
    return this.nextIdeaId()
      .then((id) => this.ideaManager.getIdeaById(id))
      .catch(() => Promise.reject());
  }
}
