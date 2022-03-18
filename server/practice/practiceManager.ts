import {Database} from 'sqlite';
import IdeaManager from '../model/ideas/ideaManager';
import {Idea} from '../model/ideas/idea';
import {ideaManager} from '../model/dataServiceProvider';

// Knows which ideas need to be provided to the user to practice
// Handles the logic for providing ideas to practice
// Provides ideas for the user to practice them
export default class PracticeManager {
	private ideasAlreadyGiven = new Set<number>();

	private db: Database;

	private ideaManager: IdeaManager;

	constructor(db: Database, ideaManager: IdeaManager) {
		this.ideaManager = ideaManager;
		this.db = db;
	}

	public async getNextIdea(): Promise<Idea> {
		let idea = await this.db.get(`select * from ideas where id not in (${Array.from(this.ideasAlreadyGiven).join(',')}) order by random() limit 1`);
		if (idea === undefined) {
			this.ideasAlreadyGiven.clear();
			idea = await this.db.get(`select * from ideas where id not in (${Array.from(this.ideasAlreadyGiven).join(',')}) order by random() limit 1`);
		}
		this.ideasAlreadyGiven.add(idea.id);
		return ideaManager.getIdea(idea.id);
	}

	public clear(): void {
		this.ideasAlreadyGiven.clear();
	}
}
