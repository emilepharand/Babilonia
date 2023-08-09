export type Manager = {
	idExists(id: number): Promise<boolean>;
};
