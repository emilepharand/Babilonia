import Ajv from 'ajv';
import {currentVersion} from '../../const';

export type Settings = {
	randomPractice: boolean;
	strictCharacters: boolean;
	practiceOnlyNotKnown: boolean;
	passiveMode: boolean;
	version: string;
	enableEditing: boolean;
};

export function getEmptySettingsNoAsync(): Settings {
	return {
		randomPractice: false,
		strictCharacters: false,
		practiceOnlyNotKnown: false,
		passiveMode: false,
		version: currentVersion,
		enableEditing: false,
	};
}

const ajv = new Ajv();

export const settingsSchema = {
	type: 'object',
	properties: {
		randomPractice: {type: 'boolean'},
		strictCharacters: {type: 'boolean'},
		practiceOnlyNotKnown: {type: 'boolean'},
		passiveMode: {type: 'boolean'},
		version: {type: 'string'},
		enableEditing: {type: 'boolean'},
	},
	required: ['randomPractice', 'strictCharacters', 'practiceOnlyNotKnown', 'passiveMode', 'version', 'enableEditing'],
	additionalProperties: false,
};

export const validateSchema = ajv.compile(settingsSchema);
