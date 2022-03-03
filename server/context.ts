const isTestMode = process.argv.length > 2 && process.argv[2] === '--test-mode';
export default isTestMode;
