import {Database} from 'sqlite';
import IdeaManager from '../model/ideas/ideaManager';
import {Idea} from '../model/ideas/idea';
import {ideaManager} from '../model/dataServiceProvider';
import LanguageManager from '../model/languages/languageManager';

// Knows which ideas need to be provided to the user to practice
// Handles the logic for providing ideas to practice
// Provides ideas for the user to practice them
export default class PracticeManager {
	private ideasAlreadyGiven = new Set<number>();
	private db: Database;
	private ideaManager: IdeaManager;
	private languageManager: LanguageManager;

	constructor(db: Database, ideaManager: IdeaManager, languageManager: LanguageManager) {
		this.ideaManager = ideaManager;
		this.languageManager = languageManager;
		this.db = db;
	}

	private buildNextIdeaIdQuery(): string {
		return `select id from ideas where id in
    (select ideaId from expressions
    join languages on expressions.languageId = languages.id
    where isPractice = false)
    and id in
    (select ideaId from expressions
    join languages on expressions.languageId = languages.id
    where isPractice = true)
    and id not in
    (${Array.from(this.ideasAlreadyGiven).join(',')})
    order by random() limit 1`;
	}

	public async getNextIdea(): Promise<Idea> {
		let idea = await this.db.get(this.buildNextIdeaIdQuery());
		if (idea === undefined) {
			if (this.ideasAlreadyGiven.size === 0) {
				return Promise.reject();
			}
			this.ideasAlreadyGiven.clear();
			idea = await this.db.get(this.buildNextIdeaIdQuery());
		}
		this.ideasAlreadyGiven.add(idea.id);
		return ideaManager.getIdea(idea.id);
	}

	public clear(): void {
		this.ideasAlreadyGiven.clear();
	}
}
