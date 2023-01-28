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
import { ExecutionContext } from "ava";
import puppeteer, { Page } from "puppeteer-core";

// Thanks, https://github.com/avajs/ava/blob/main/docs/recipes/puppeteer.md#setup
export const withPage = async (
	t: ExecutionContext,
	run: (t: ExecutionContext, page: Page) => unknown,
) => {
	const browser = await puppeteer.launch({
		headless: true,
		executablePath: process.env.CHROMIUM_PATH,
	});
	const page = await browser.newPage();
	try {
		return await run(t, page);
	} finally {
		await page.close();
		await browser.close();
	}
};
