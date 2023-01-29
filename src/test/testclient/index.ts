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

/* eslint-disable @typescript-eslint/no-explicit-any */

import test from "ava";
import fs from "fs/promises";
import path from "path";
import {
	createTestUser,
	setupBundleServer,
	waitForTestClientLoad,
	withPage,
	withTestClient,
} from "@fosscord/test";

setupBundleServer(test);

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace window {
	export function find(
		filter: (module: unknown) => boolean,
		opts: { cacheOnly: boolean },
	): any;
	export function findByUniqueProperties(
		filter: string[],
		opts: { cacheOnly: boolean },
	): any;
	export function findByDisplayName(
		displayName: string,
		opts: { cacheOnly: boolean },
	): any;
	export const req: any;
}

test.serial("Login and load client", withPage, async (t, page) => {
	const { user } = await createTestUser();

	await page.goto("http://localhost:8081/login", {
		waitUntil: "networkidle0",
	});

	await page.evaluate(
		(
			await fs.readFile(
				path.join(__dirname, "..", "helpers", "injected.js"),
			)
		).toString(),
	);

	const inputs = await page.$$("input");

	const email = inputs[0];
	await email.type(user.email as string);

	const password = inputs[1];
	await password.type("test");

	const submit = await page.$("button[type='submit']");
	await submit?.click();

	await page.evaluate(
		(): Promise<void> =>
			new Promise((resolve, reject) => {
				// TODO: This is bad. We can't just use the ID for the dispatcher,
				// as it'll change per client versions.
				const dispatcher: any = Object.values(
					window.req.c[791462].exports,
				).find((x: any) => x.prototype.dispatch);

				const originalDispatch = dispatcher.prototype.dispatch;

				function patch(this: any, ...args: any[]) {
					console.log(args);
					if (args[0].type === "APP_VIEW_SET_HOME_LINK") resolve();
					if (
						args[0].type === "TRACK" &&
						args[0].event == "app_crashed"
					)
						reject();
					return originalDispatch.bind(this)(...args);
				}

				dispatcher.prototype.dispatch = patch;
			}),
	);

	await waitForTestClientLoad(page);

	t.pass();
});

// eslint-disable-next-line ava/no-only-test
test.serial("Can create guild", withTestClient, async (t, page) => {
	const addAGuild = await page.$("div[aria-label='Add a Guild']");
	await page.waitForNetworkIdle();
	addAGuild?.click();

	const createMyOwnX = "//button[contains(., 'Create My Own')]";
	const createMyOwnButton = await page.waitForXPath(createMyOwnX);
	await page.waitForNetworkIdle();
	await createMyOwnButton?.click();

	const skipThisQuestionX = "//button[contains(., 'For me and my friends')]";
	const skipThisQuestionButton = await page.waitForXPath(skipThisQuestionX);
	await page.waitForNetworkIdle();
	await skipThisQuestionButton?.click();

	const createX = "//button[contains(., 'Create')]";
	const createButton = await page.waitForXPath(createX);
	await page.waitForNetworkIdle();
	await createButton?.click();

	await page.waitForSelector("div[role='textbox']");

	t.pass();
});
