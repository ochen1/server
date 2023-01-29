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
import { ExecutionContext, TestFn } from "ava";
import { FosscordServer as ApiServer } from "@fosscord/api";
import { Server as GatewayServer } from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn";
import { Config, User } from "@fosscord/util";
import express from "express";
import http from "http";
import { suppressConsole } from "./Console";
import {
	closeTestDatabaseConnection,
	createTestDatabaseConnection,
} from "./Database";
import { withPage } from "./puppeteer";
import { Page } from "puppeteer-core";
import { createTestUser } from "./User";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupBundleServer = (test: TestFn<any>) => {
	const app = express();
	const server = http.createServer(app);

	const api = new ApiServer({ app, server });
	const cdn = new CDNServer({ app, server });
	const gateway = new GatewayServer({ server, port: 8081 });
	test.serial.before("Setup bundle server", async () => {
		suppressConsole();
		await createTestDatabaseConnection();
		await Config.init();
		await Config.set({ client: { useTestClient: true } });
		server.listen(8081);
		await Promise.all([api.start(), cdn.start(), gateway.start()]);
	});

	test.after.always("Teardown", async () => {
		server.close();
		await Promise.all([api.stop(), cdn.stop(), gateway.stop()]);
		await new Promise((resolve) => {
			// wait for gateway close handlers to finish
			setTimeout(() => closeTestDatabaseConnection().then(resolve), 200);
		});
	});
};

export const withTestClient = async (
	t: ExecutionContext,
	run: (t: ExecutionContext, page: Page, user: User) => unknown,
) => {
	return await withPage(t, async (t, page) => {
		// Set token in local storage to log in
		const { user, token } = await createTestUser();
		await page.setRequestInterception(true);
		page.on("request", (request) =>
			request.respond({
				status: 200,
				contentType: "text/plain",
				body: "blah",
			}),
		);
		await page.goto("http://localhost:8081/app", {
			waitUntil: "networkidle0",
		});
		await page.evaluate(`localStorage.setItem('token', '"${token}"');`);
		await page.setRequestInterception(false);
		page.removeAllListeners();
		await page.reload();

		await waitForTestClientLoad(page);

		return await run(t, page, user);
	});
};

export const waitForTestClientLoad = async (page: Page) => {
	await page.waitForNetworkIdle();
	await page.waitForSelector("video[data-testid='app-spinner']", {
		hidden: true,
	});
};
