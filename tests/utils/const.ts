import {currentVersion} from '../../server/const';

export const getTestDatabaseVersionPath = (version: string) => `tests/db/${version}-simple.db`;

export const generatePreviousVersions = (startVersion: string, endVersion: string): string[] => {
	const versions: string[] = [];
	const [startMajor, startMinor] = startVersion.split('.').map(Number);
	const [endMajor, endMinor] = endVersion.split('.').map(Number);
	for (let major = startMajor; major <= endMajor; major++) {
		const minorStart = major === startMajor ? startMinor : 0;
		const minorEnd = major === endMajor ? endMinor : 9;
		for (let minor = minorStart; minor <= minorEnd; minor++) {
			const version = `${major}.${minor}`;
			versions.push(version);
		}
	}
	return versions;
};

export const allVersions = generatePreviousVersions('2.0', currentVersion);
export const penultimateVersion = allVersions[allVersions.length - 2];
export const previousVersions = allVersions.slice(0, -1);
