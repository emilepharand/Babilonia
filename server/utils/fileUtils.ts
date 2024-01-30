import fs from 'fs';
import path from 'path';

export function validatePathForWritingTo(unsafePath: string): boolean {
	if (unsafePath.trim() === '') {
		console.log('Empty path.');
		return false;
	}

	const resolvedPath = path.resolve(unsafePath);

	if (!fileExists(resolvedPath)) {
		return canCreateFile(resolvedPath);
	}

	return isPathValid(resolvedPath);
}

function canCreateFile(resolvedPath: string) {
	const parentDir = path.dirname(resolvedPath);

	if (!fs.existsSync(parentDir)) {
		console.error(`'${resolvedPath}' cannot be created.`);
		return false;
	}

	const realPathParent = fs.realpathSync(parentDir);

	if (!isPathUnderWorkingDirectory(realPathParent)) {
		console.error(`'${realPathParent}' is not under the current working directory.`);
		return false;
	}

	const fileName = path.basename(resolvedPath);
	const realPathFull = path.resolve(realPathParent, fileName);
	if (!isFileCreatable(realPathFull)) {
		console.error(`Cannot write to '${realPathFull}'.`);
		return false;
	}

	return true;
}

export function isPathValid(path: string) {
	const realAbsolutePath = fs.realpathSync(path);

	if (!isPathFile(realAbsolutePath)) {
		console.error(`'${realAbsolutePath}' is not a file.`);
		return false;
	}

	if (!isPathUnderWorkingDirectory(realAbsolutePath)) {
		console.error(`'${realAbsolutePath}' is not under the current working directory.`);
		return false;
	}

	if (!isFileWritable(realAbsolutePath)) {
		console.error(`Cannot write to '${realAbsolutePath}'.`);
		return false;
	}

	return true;
}

function isPathFile(path: string) {
	return fs.statSync(path).isFile();
}

function isPathUnderWorkingDirectory(realPath: string) {
	return realPath.startsWith(process.cwd());
}

function fileExists(path: string) {
	return fs.existsSync(path);
}

function isFileWritable(path: string) {
	try {
		fs.accessSync(path, fs.constants.W_OK);
	} catch (err) {
		return false;
	}
	return true;
}

function isFileCreatable(path: string): boolean {
	try {
		fs.writeFileSync(path, '');
		fs.accessSync(path, fs.constants.W_OK);
	} catch (err) {
		console.log(err);
		return false;
	}
	fs.unlinkSync(path);
	return true;
}
