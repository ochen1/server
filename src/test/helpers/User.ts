import { generateToken, User } from "@fosscord/util";

export const createTestUser = async () => {
	const user = await User.register({
		username: `test${Math.floor(Math.random() * 100)}`,
		password: "test",
	});

	const token = await generateToken(user.id);

	return { user: user, token: token };
};
