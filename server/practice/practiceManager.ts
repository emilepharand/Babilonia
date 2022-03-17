import {Database} from 'sqlite';
import IdeaManager from '../model/ideas/ideaManager';
import {Idea} from '../model/ideas/idea';
import {ideaManager} from '../model/dataServiceProvider';

// Knows which ideas need to be provided to the user to practice
// Handles the logic for providing ideas to practice
// Provides ideas for the user to practice them
export default class PracticeManager {
	private offset = 0;

	private db: Database;

	private ideaManager: IdeaManager;

	constructor(db: Database, ideaManager: IdeaManager) {
		this.ideaManager = ideaManager;
		this.db = db;
	}

	public async getNextIdea(): Promise<Idea> {
		const idea = await this.db.get('select * from ideas order by random() limit 1');
		// There are no ideas
		if (idea === undefined) {
			return Promise.reject();
		}
		return ideaManager.getIdea(idea.id);
	}
}
