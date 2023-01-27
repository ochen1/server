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

import test from "ava";
import { createTestUser, setupBundleServer, withPage } from "@fosscord/test";

setupBundleServer(test);

test.serial("Login", withPage, async (t, page) => {
	const { user } = await createTestUser();

	await page.goto("http://localhost:8081/login", {
		waitUntil: "networkidle0",
	});

	const inputs = await page.$$("input");

	const email = inputs[0];
	await email.type(user.email as string);

	const password = inputs[1];
	await password.type("test");

	const submit = await page.$("button[type='submit']");
	await submit?.click();

	await page.waitForNavigation();

	t.pass();

	// TODO: I want to be able to check if we receive READY
});
