// eslint-disable-next-line ava/use-test
import { TestFn } from "ava";
import { Config } from "@fosscord/util";
import { BodyParser } from "@fosscord/api";
import express from "express";
import { suppressConsole } from "./Console";
import {
	closeTestDatabaseConnection,
	createTestDatabaseConnection,
} from "./Database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupApiTest = (test: TestFn<any>) => {
	const app = express();
	app.use(BodyParser({ inflate: true, limit: "10mb" }));

	test.serial.before("Setup", async () => {
		suppressConsole();
		await createTestDatabaseConnection();
		await Config.init();
	});

	test.after("Teardown", async () => {
		await closeTestDatabaseConnection();
	});

	return app;
};
