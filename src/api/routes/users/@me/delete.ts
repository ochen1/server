import { Router, Request, Response } from "express";
import { DiscordApiErrors, FieldErrors, Member, User, UserAuth } from "@fosscord/util";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";

const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	const auth = await UserAuth.findOneOrFail({
		where: { user: { id: req.user_id } }
	});

	if (auth.password) {
		if (!await bcrypt.compare(req.body.password, auth.password)) {
			throw FieldErrors({
				password: {
					message: req.t("auth:login.INVALID_PASSWORD"),
					code: "INVALID_PASSWORD",
				},
			});
		}
	}

	await Promise.all([
		User.delete({ id: req.user_id }),
		Member.delete({ id: req.user_id }),
	]);

	return res.status(204);
});

export default router;
