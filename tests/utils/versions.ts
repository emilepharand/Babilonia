import {currentVersion} from '../../server/const';

export function getTestDatabaseVersionPath(version: string): string {
	return `tests/db/${version}.db`;
}

export function generateVersionRange(start: string, end: string): string[] {
	const [startMajor, startMinor] = start.split('.').map(Number);
	const [endMajor, endMinor] = end.split('.').map(Number);
	return generateVersions(startMajor, startMinor, endMajor, endMinor);
}

function generateVersions(startMajor: number, startMinor: number, endMajor: number, endMinor: number): string[] {
	let versions: string[] = [];
	for (let major = startMajor; major <= endMajor; major++) {
		const minorStart = getMinorStart(major, startMajor, startMinor);
		const minorEnd = getMinorEnd(major, endMajor, endMinor);
		const minorVersions = generateMinorVersions(major, minorStart, minorEnd);
		versions = [...versions, ...minorVersions];
	}
	return versions;
}

function generateMinorVersions(major: number, minorStart: number, minorEnd: number): string[] {
	let versions: string[] = [];
	for (let minor = minorStart; minor <= minorEnd; minor++) {
		versions = [...versions, `${major}.${minor}`];
	}
	return versions;
}

function getMinorStart(major: number, startMajor: number, startMinor: number): number {
	return major === startMajor ? startMinor : 0;
}

function getMinorEnd(major: number, endMajor: number, endMinor: number): number {
	return major === endMajor ? endMinor : 9;
}

export const allVersions = generateVersionRange('2.0', currentVersion);
export const penultimateVersion = allVersions[allVersions.length - 2];
export const previousVersions = allVersions.slice(0, -1);
