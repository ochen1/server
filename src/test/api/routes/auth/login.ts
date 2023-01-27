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
