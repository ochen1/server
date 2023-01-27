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

import { LoginSchema, User } from "@fosscord/util";
import LoginRoute from "@fosscord/api/routes/auth/login";
import { setupApiTest } from "@fosscord/test";
import supertest from "supertest";
import test from "ava";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = setupApiTest(test);
app.use("/auth/login", LoginRoute);

test.before("Create test user", async () => {
	await User.register({
		username: "logintest",
		password: await bcrypt.hash("logintest", 12),
		email: "logintest@test.com",
	});
});

test.serial("Can login using email", async (t) => {
	const res = await supertest(app)
		.post("/auth/login")
		.send({
			login: "logintest@test.com",
			password: "logintest",
		} as LoginSchema);

	t.is(res.status, 200, res.text);
	jwt.decode(res.body.token);
});
