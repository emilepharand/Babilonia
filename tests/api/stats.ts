import {addIdea, addLanguage, deleteEverything, getStats} from '../utils/utils';
import {ExpressionForAdding} from '../../server/model/ideas/expression';

beforeEach(async () => {
	await deleteEverything();
});

describe('getting stats', () => {
	test('getting stats', async () => {
		const fr = await addLanguage('français');
		const en = await addLanguage('english');
		const es = await addLanguage('español');
		const it = await addLanguage('italiano');
		const de = await addLanguage('deutsch');
		const pt = await addLanguage('português');
		await addLanguage('klingon');

		// Idea 1: fr, en, es, de, it, pt
		const fr1: ExpressionForAdding = {text: 'bonjour', languageId: fr.id};
		const en1: ExpressionForAdding = {text: 'hello', languageId: en.id};
		const es1: ExpressionForAdding = {text: 'buenos días', languageId: es.id};
		const de1: ExpressionForAdding = {text: 'guten Tag', languageId: de.id};
		const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: pt.id};
		const it1: ExpressionForAdding = {text: 'buongiorno', languageId: it.id};
		await addIdea({ee: [fr1, en1, es1, de1, pt1, it1]});

		// Idea 2: fr, en, es, de, pt
		const fr2: ExpressionForAdding = {text: 'bonne nuit', languageId: fr.id};
		const en2: ExpressionForAdding = {text: 'good night', languageId: en.id};
		const es2: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const pt2: ExpressionForAdding = {text: 'boa noite', languageId: pt.id};
		const de2: ExpressionForAdding = {text: 'gute Natch', languageId: de.id};
		await addIdea({ee: [fr2, en2, es2, pt2, de2]});

		// Idea 3: fr, en, es
		const fr3: ExpressionForAdding = {text: 'bonsoir', languageId: fr.id};
		const fr4: ExpressionForAdding = {text: 'bonsoir 2', languageId: fr.id};
		const en3: ExpressionForAdding = {text: 'good evening', languageId: en.id};
		const en4: ExpressionForAdding = {text: 'good evening 2', languageId: en.id};
		const es3: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const es4: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id};
		await addIdea({ee: [fr3, fr4, en3, en4, es3, es4]});

		const stats = await getStats();
		for (const a of stats) {
			switch (a.language.name) {
				case 'français': expect(a.count).toEqual(3);
					break;
				case 'english': expect(a.count).toEqual(3);
					break;
				case 'español': expect(a.count).toEqual(3);
					break;
				case 'italiano': expect(a.count).toEqual(1);
					break;
				case 'deutsch': expect(a.count).toEqual(2);
					break;
				case 'português': expect(a.count).toEqual(2);
					break;
				case 'klingon': expect(a.count).toEqual(0);
					break;
				default:
					throw new Error('invalid language');
			}
		}
	});
});
