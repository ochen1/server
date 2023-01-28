/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// eslint-disable-next-line ava/use-test
import { TestFn } from "ava";
import { Config } from "@fosscord/util";
import { Authentication, BodyParser } from "@fosscord/api";
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
	app.use(Authentication);

	test.serial.before("Setup", async () => {
		suppressConsole();
		await createTestDatabaseConnection();
		await Config.init();
	});

	test.after.always("Teardown", async () => {
		await closeTestDatabaseConnection();
	});

	return app;
};
