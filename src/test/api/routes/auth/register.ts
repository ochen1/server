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
