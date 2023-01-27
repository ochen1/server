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

import { RegisterSchema, User } from "@fosscord/util";
import RegisterRoute from "@fosscord/api/routes/auth/register";
import { setupApiTest } from "@fosscord/test";
import supertest from "supertest";
import jsonwebtoken from "jsonwebtoken";

import anyTest, { TestFn } from "ava";
const test = anyTest as TestFn<{ userId: string }>;

const app = setupApiTest(test);
app.use("/auth/register", RegisterRoute);

test.serial("Returns valid token", async (t) => {
	const res = await supertest(app)
		.post("/auth/register")
		.send({
			username: "test",
			password: "test",
			consent: true,
			email: "test@test.com",
			date_of_birth: new Date(1990, 1, 1),
		} as RegisterSchema);

	t.is(res.status, 200);
	const { id } = jsonwebtoken.decode(res.body.token) as { id: string }; // lol
	t.context.userId = id;
});

test.serial("Created user in database", async (t) => {
	await User.findOneOrFail({ where: { id: t.context.userId } });
	t.pass();
});
