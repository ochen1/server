import { closeDatabase, DataSourceOptions, initDatabase } from "@fosscord/util";

export const createTestDatabaseConnection = async () => {
	DataSourceOptions.setOptions({
		logging: false,
		type: "sqlite",
		database: ":memory:",
		synchronize: true,
	});
	// why doesn't set options do this?
	DataSourceOptions.driver.database = ":memory:";

	return await initDatabase();
};

export const closeTestDatabaseConnection = async () => {
	await closeDatabase();
};
